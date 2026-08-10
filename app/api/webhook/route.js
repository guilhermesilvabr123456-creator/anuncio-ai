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
const tipoEvento =
  notificacao?.type ||
  url.searchParams.get("type");

if (
  tipoEvento &&
  tipoEvento !== "subscription_preapproval"
) {
  return Response.json({
    received: true,
    ignored: tipoEvento,
  });
}
    const assinaturaId =
      notificacao?.data?.id ||
      notificacao?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    if (!assinaturaId) {
      return Response.json({ received: true });
    }

    if (String(assinaturaId) === "123456") {
      return Response.json({
        received: true,
        test: true,
      });
    }

    const accessToken =
      process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return Response.json(
        { error: "Mercado Pago não configurado." },
        { status: 500 }
      );
    }

    const resposta = await fetch(
      `https://api.mercadopago.com/preapproval/${assinaturaId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!resposta.ok) {
      console.error(
        "Erro ao consultar assinatura:",
        resposta.status
      );

      return Response.json(
        { error: "Não foi possível consultar a assinatura." },
        { status: 500 }
      );
    }

    const assinatura = await resposta.json();

    console.log(
      "WEBHOOK ASSINATURA:",
      JSON.stringify({
        id: assinatura.id,
        status: assinatura.status,
        external_reference:
          assinatura.external_reference,
      })
    );

    const userId = assinatura.external_reference;

    if (!userId) {
      return Response.json({
        received: true,
        ignored: "external_reference ausente",
      });
    }

    // Só libera o plano Pro quando a assinatura
    // estiver realmente autorizada.
    if (assinatura.status !== "authorized") {
      return Response.json({
        received: true,
        status: assinatura.status,
        changed: false,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        monthly_limit: 100,
      })
      .eq("id", userId)
      .select("id");

    if (error) {
      console.error(
        "Erro Supabase:",
        JSON.stringify(error)
      );

      return Response.json(
        { error: "Não foi possível atualizar o plano." },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error(
        "Perfil não encontrado para external_reference:",
        userId
      );

      return Response.json(
        { error: "Usuário da assinatura não encontrado." },
        { status: 500 }
      );
    }

    return Response.json({
      received: true,
      status: assinatura.status,
      monthly_limit: 100,
      updated: true,
    });
  } catch (error) {
    console.error("ERRO WEBHOOK:", error);

    return Response.json(
      { error: "Erro ao processar a notificação." },
      { status: 500 }
    );
  }
}
