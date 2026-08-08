import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { produto, publico } = await request.json();

    if (!produto || !publico) {
      return Response.json(
        { error: "Produto e público são obrigatórios." },
        { status: 400 }
      );
    }

    const resposta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em marketing e copywriting. Crie anúncios persuasivos, claros e profissionais em português do Brasil.",
        },
        {
          role: "user",
          content: `Crie um anúncio para o seguinte produto ou serviço: ${produto}. Público-alvo: ${publico}. Inclua título, texto do anúncio e uma chamada para ação.`,
        },
      ],
    });

    const anuncio = resposta.choices[0]?.message?.content;

    return Response.json({ anuncio });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Erro ao gerar o anúncio." },
      { status: 500 }
    );
  }
}
