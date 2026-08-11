import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Faça login novamente." },
        { status: 401 }
      );
    }

    const token = authorization
      .replace("Bearer ", "")
      .trim();

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return Response.json(
        { error: "Sessão inválida." },
        { status: 401 }
      );
    }

    const accessToken =
      process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return Response.json(
        { error: "Mercado Pago não configurado." },
        { status: 500 }
      );
    }

    // Buscar assinatura do usuário pelo external_reference
    const busca = await fetch(
      `https://api.mercadopago.com/preapproval/search?external_reference=${encodeURIComponent(
        user.id
      )}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const buscaDados = await busca.json();

    if (!busca.ok) {
      console.error(
        "Erro ao buscar assinatura:",
        buscaDados
      );

      return Response.json(
        {
          error:
            "Não foi possível localizar sua assinatura.",
        },
        { status: 500 }
      );
    }

    const assinaturas =
      Array.isArray(buscaDados?.results)
        ? buscaDados.results
        : [];

    const assinatura = assinaturas.find(
  (item) =>
    item.external_reference === user.id &&
    item.status === "authorized"
);

    if (!assinatura) {
      return Response.json(
        {
          error:
            "Nenhuma assinatura ativa foi encontrada.",
        },
        { status: 404 }
      );
    }

    // Cancelar no Mercado Pago
    const cancelamento = await fetch(
      `https://api.mercadopago.com/preapproval/${assinatura.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "canceled",
        }),
      }
    );

    const cancelamentoDados =
      await cancelamento.json();

    if (!cancelamento.ok) {
      console.error(
        "Erro ao cancelar assinatura:",
        cancelamentoDados
      );

      return Response.json(
        {
          error:
            "Não foi possível cancelar a assinatura.",
        },
        { status: 500 }
      );
    }

    // Atualizar imediatamente o plano local
    const { error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          plan: "free",
          monthly_limit: 5,
        })
        .eq("id", user.id);

    if (profileError) {
      console.error(
        "Erro ao atualizar perfil:",
        profileError
      );

      return Response.json(
        {
          error:
            "Assinatura cancelada, mas houve erro ao atualizar o plano.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message:
        "Assinatura cancelada com sucesso.",
      plan: "free",
      monthly_limit: 5,
    });
  } catch (error) {
    console.error(
      "Erro interno no cancelamento:",
      error
    );

    return Response.json(
      {
        error:
          "Erro interno ao cancelar assinatura.",
      },
      { status: 500 }
    );
  }
}
