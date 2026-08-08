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

Crie um anúncio profissional em português do Brasil.

Produto ou serviço:
${produto}

Público-alvo:
${publico}

O anúncio deve conter:
- Um título chamativo
- Um texto persuasivo
- Benefícios do produto
- Uma chamada para ação
`;

    const resposta = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      console.error(dados);

      return Response.json(
        {
          error: dados?.error?.message || "Erro ao gerar anúncio com IA.",
        },
        { status: resposta.status }
      );
    }

    const anuncio =
      dados?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não foi possível gerar o anúncio.";

    return Response.json({ anuncio });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Erro interno ao gerar anúncio." },
      { status: 500 }
    );
  }
}
