export async function POST(request) {
  try {
    const { email, userId } = await request.json();

    if (!email) {
      return Response.json(
        { error: "E-mail do usuário não encontrado." },
        { status: 400 }
      );
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return Response.json(
        { error: "Mercado Pago não configurado." },
        { status: 500 }
      );
    }

    const resposta = await fetch(
      "https://api.mercadopago.com/preapproval",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "AnuncioAI Pro - 100 anúncios por mês",
          external_reference: userId || email,
          payer_email: email,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 19.9,
            currency_id: "BRL",
          },
          back_url: "https://anuncio-ai.vercel.app/?assinatura=sucesso",
          status: "pending",
        }),
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok || !dados.init_point) {
      return Response.json(
        { error: dados.message || "Não foi possível criar a assinatura." },
        { status: resposta.status || 500 }
      );
    }

    return Response.json({ url: dados.init_point });
  } catch (error) {
    return Response.json(
      { error: "Erro ao iniciar a assinatura." },
      { status: 500 }
    );
  }
}
