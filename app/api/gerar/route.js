import { createClient } from "@supabase/supabase-js";

export async function GET() {
  return Response.json({
    status: "ok",
    mensagem: "API do Anúncio AI está funcionando",
  });
}

export async function POST(request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Faça login para gerar anúncios." },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "").trim();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json(
        { error: "Sua sessão expirou. Entre novamente." },
        { status: 401 }
      );
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("profiles")
      .select("plan, monthly_limit, usage_count, usage_reset_at")
      .eq("id", user.id)
      .single();

    if (perfilError || !perfil) {
      return Response.json(
        { error: "Perfil do usuário não encontrado." },
        { status: 404 }
      );
    }
    const agora = new Date();
    const ultimoReset = new Date(perfil.usage_reset_at);

    const mudouMes =
      agora.getUTCFullYear() !== ultimoReset.getUTCFullYear() ||
      agora.getUTCMonth() !== ultimoReset.getUTCMonth();

    if (mudouMes) {
      const { error: resetError } = await supabase
        .from("profiles")
        .update({
          usage_count: 0,
          usage_reset_at: agora.toISOString(),
        })
        .eq("id", user.id);

      if (resetError) {
        return Response.json(
          { error: "Não foi possível renovar seu limite mensal." },
          { status: 500 }
        );
      }

      perfil.usage_count = 0;
    }
    if (perfil.usage_count >= perfil.monthly_limit) {
      return Response.json(
        {
          error: `Você atingiu o limite de ${perfil.monthly_limit} anúncios do seu plano.`,
        },
        { status: 429 }
      );
    }

    const { produto, publico } = await request.json();

    if (!produto || !publico) {
      return Response.json(
        { error: "Produto e público são obrigatórios." },
        { status: 400 }
      );
    }

    const prompt = `
Você é um especialista em marketing e copywriting.

Crie um anúncio profissional e persuasivo em português do Brasil.

Produto ou serviço:
${produto}

Público-alvo:
${publico}

O anúncio deve conter:
- Título chamativo
- Texto persuasivo
- Principais benefícios
- Chamada para ação
`;

    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error("Erro Gemini:", dados);

      return Response.json(
        {
          error:
            dados?.error?.message || "Erro ao gerar anúncio.",
        },
        { status: resposta.status }
      );
    }

    const anuncio =
      dados?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!anuncio) {
      return Response.json(
        { error: "A IA não retornou um anúncio." },
        { status: 500 }
      );
    }

    const novoUso = perfil.usage_count + 1;

    const { error: atualizacaoError } = await supabase
      .from("profiles")
      .update({ usage_count: novoUso })
      .eq("id", user.id);

    if (atualizacaoError) {
      console.error(
        "Erro ao atualizar uso:",
        atualizacaoError
      );

      return Response.json(
        { error: "Não foi possível atualizar o seu limite." },
        { status: 500 }
      );
    }

    return Response.json({
      anuncio,
      usage_count: novoUso,
      monthly_limit: perfil.monthly_limit,
    });
  } catch (error) {
    console.error("Erro interno:", error);

    return Response.json(
      { error: "Erro interno ao gerar anúncio." },
      { status: 500 }
    );
  }
}
