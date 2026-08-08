export async function GET() {
  return Response.json({
    status: "ok",
    mensagem: "API do Anúncio AI está funcionando",
  });
}

export async function POST(request) {
  try {
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
          error: dados?.error?.message || "Erro ao gerar anúncio.",
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

    return Response.json({ anuncio });
  } catch (error) {
    console.error("Erro interno:", error);

    return Response.json(
      { error: "Erro interno ao gerar anúncio." },
      { status: 500 }
    );
  }
}
