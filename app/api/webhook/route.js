import crypto from "crypto";
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

    // =========================
    // VALIDAR WEBHOOK
    // =========================

    const secret =
      process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    const xSignature =
      request.headers.get("x-signature");

    const xRequestId =
      request.headers.get("x-request-id");

    const dataId =
      url.searchParams.get("data.id");

    if (!secret) {
      console.error(
        "MERCADO_PAGO_WEBHOOK_SECRET não configurado."
      );

      return Response.json(
        { error: "Webhook não configurado." },
        { status: 500 }
      );
    }

    if (!xSignature || !xRequestId || !dataId) {
      return Response.json(
        { error: "Webhook sem assinatura válida." },
        { status: 401 }
      );
    }

    const partes = xSignature
      .split(",")
      .map((parte) => parte.trim());

    const ts = partes
      .find((parte) => parte.startsWith("ts="))
      ?.split("=")[1];

    const v1 = partes
      .find((parte) => parte.startsWith("v1="))
      ?.split("=")[1];

    if (!ts || !v1) {
      return Response.json(
        { error: "Assinatura inválida." },
        { status: 401 }
      );
    }

    const manifest =
      `id:${dataId.toLowerCase()};` +
      `request-id:${xRequestId};` +
      `ts:${ts};`;

    const assinaturaCalculada = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    const assinaturaValida =
      /^[a-f0-9]{64}$/i.test(v1) &&
      crypto.timingSafeEqual(
        Buffer.from(assinaturaCalculada, "hex"),
        Buffer.from(v1, "hex")
      );

    if (!assinaturaValida) {
      return Response.json(
        { error: "Webhook não autorizado." },
        { status: 401 }
      );
    }

    // =========================
    // IDENTIFICAR EVENTO
    // =========================

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
      dataId ||
      url.searchParams.get("id");

    if (!assinaturaId) {
      return Response.json({
        received: true,
      });
    }

    // Simulação do Mercado Pago
    if (String(assinaturaId) === "123456") {
      return Response.json({
        received: true,
        test: true,
      });
    }

    // =========================
    // CONSULTAR ASSINATURA
    // =========================

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
        {
          error:
            "Não foi possível consultar a assinatura.",
        },
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

    const userId =
      assinatura.external_reference;

    if (!userId) {
      return Response.json({
        received: true,
        ignored: "external_reference ausente",
      });
    }

    // =========================
    // LIBERAR PLANO PRO
    // =========================

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
        plan: "pro",
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
        {
          error:
            "Não foi possível atualizar o plano.",
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      console.error(
        "Perfil não encontrado:",
        userId
      );

      return Response.json(
        {
          error:
            "Usuário da assinatura não encontrado.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      received: true,
      status: assinatura.status,
      plan: "pro",
      monthly_limit: 100,
      updated: true,
    });
  } catch (error) {
    console.error(
      "ERRO WEBHOOK:",
      error
    );

    return Response.json(
      {
        error:
          "Erro ao processar a notificação.",
      },
      { status: 500 }
    );
  }
}
