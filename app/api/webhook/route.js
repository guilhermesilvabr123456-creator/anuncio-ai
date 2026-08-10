import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  return Response.json({
    status: "ok",
    message: "Webhook do Mercado Pago ativo.",
  });
}

export async function POST(request) {
  try {
    let notificacao = {};

    try {
      notificacao = await request.json();
    } catch {
      notificacao = {};
    }

    const url = new URL(request.url);

    const assinaturaId =
      notificacao?.data?.id ||
      notificacao?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    if (!assinaturaId) {
      return Response.json({ received: true });
    }
// O Mercado Pago usa este ID fictício no simulador de Webhooks
if (String(assinaturaId) === "123456") {
  return Response.json({
    received: true,
    test: true,
  });
}
    const resposta = await fetch(
      `https://api.mercadopago.com/preapproval/${assinaturaId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!resposta.ok) {
      return Response.json(
        { error: "Não foi possível consultar a assinatura." },
        { status: 500 }
      );
    }

    const assinatura = await resposta.json();
    const userId = assinatura.external_reference;

    if (!userId) {
      return Response.json({ received: true });
    }

    const limite =
      assinatura.status === "authorized" ? 100 : 5;

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        monthly_limit: limite,
      })
      .eq("id", userId);

    if (error) {
      return Response.json(
        { error: "Não foi possível atualizar o plano." },
        { status: 500 }
      );
    }

    return Response.json({
      received: true,
      status: assinatura.status,
      monthly_limit: limite,
    });
  } catch {
    return Response.json(
      { error: "Erro ao processar a notificação." },
      { status: 500 }
    );
  }
}
