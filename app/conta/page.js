"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Conta() {
  const [carregando, setCarregando] = useState(true);
  const [cancelando, setCancelando] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [plano, setPlano] = useState("free");
  const [limite, setLimite] = useState(5);
  const [uso, setUso] = useState(0);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarConta() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setNome(
        user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Usuário"
      );

      setEmail(user.email || "");

      const { data: perfil, error } = await supabase
        .from("profiles")
        .select("plan, monthly_limit, usage_count")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(
          "Erro ao carregar perfil:",
          error
        );

        setMensagem(
          "Não foi possível carregar os dados da sua conta."
        );

        setCarregando(false);
        return;
      }

      if (perfil) {
        setPlano(perfil.plan || "free");
        setLimite(perfil.monthly_limit ?? 5);
        setUso(perfil.usage_count ?? 0);
      }

      setCarregando(false);
    }

    carregarConta();
  }, []);

  async function cancelarAssinatura() {
    const confirmar = window.confirm(
      "Tem certeza que deseja cancelar sua assinatura do Plano Pro?"
    );

    if (!confirmar) {
      return;
    }

    setCancelando(true);
    setMensagem("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Sua sessão expirou. Entre novamente.");
        window.location.href = "/login";
        return;
      }

      const resposta = await fetch(
        "/api/cancelar-assinatura",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(
          dados.error ||
            "Não foi possível cancelar sua assinatura."
        );

        setCancelando(false);
        return;
      }

      setPlano("free");
      setLimite(5);

      setMensagem(
        "Sua assinatura foi cancelada com sucesso."
      );
    } catch (erro) {
      console.error(
        "Erro ao cancelar assinatura:",
        erro
      );

      setMensagem(
        "Erro ao cancelar assinatura. Tente novamente."
      );
    }

    setCancelando(false);
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (carregando) {
    return (
      <main style={styles.main}>
        <div style={styles.card}>
          <p style={styles.carregando}>
            Carregando sua conta...
          </p>
        </div>
      </main>
    );
  }

  const nomePlano =
    plano === "pro" ? "Plano Pro" : "Plano Free";

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <a
          href="/"
          style={styles.voltar}
        >
          ← Voltar para o AnúncioAI
        </a>

        <div style={styles.card}>
          <div style={styles.cabecalho}>
            <div>
              <p style={styles.pequeno}>
                Minha conta
              </p>

              <h1 style={styles.titulo}>
                Olá, {nome} 👋
              </h1>
            </div>

            <button
              type="button"
              onClick={sair}
              style={styles.botaoSair}
            >
              Sair
            </button>
          </div>

          <div style={styles.bloco}>
            <span style={styles.rotulo}>
              E-mail
            </span>

            <strong style={styles.valor}>
              {email}
            </strong>
          </div>

          <div style={styles.bloco}>
            <span style={styles.rotulo}>
              Plano atual
            </span>

            <div style={styles.planoLinha}>
              <span
                style={
                  plano === "pro"
                    ? styles.badgePro
                    : styles.badgeFree
                }
              >
                {nomePlano}
              </span>

              <span style={styles.contador}>
                {uso}/{limite} anúncios usados
              </span>
            </div>
          </div>

          {plano === "free" && (
            <div style={styles.upgrade}>
              <h2 style={styles.subtitulo}>
                Plano Pro
              </h2>

              <p style={styles.texto}>
                Tenha até 100 anúncios por mês por
                R$ 19,90/mês.
              </p>

              <a
                href="/"
                style={styles.botaoPrimario}
              >
                Ver opção de assinatura
              </a>
            </div>
          )}

          {plano === "pro" && (
            <div style={styles.cancelamento}>
              <h2 style={styles.subtitulo}>
                Assinatura Pro
              </h2>

              <p style={styles.texto}>
                Sua conta possui acesso ao Plano Pro
                com limite de até 100 anúncios por mês.
              </p>

              <button
                type="button"
                onClick={cancelarAssinatura}
                disabled={cancelando}
                style={{
                  ...styles.botaoCancelar,
                  opacity: cancelando ? 0.6 : 1,
                }}
              >
                {cancelando
                  ? "Cancelando..."
                  : "Cancelar assinatura"}
              </button>

              <p style={styles.aviso}>
                O cancelamento interrompe futuras
                renovações da assinatura.
              </p>
            </div>
          )}

          {mensagem && (
            <div style={styles.mensagem}>
              {mensagem}
            </div>
          )}

          <div style={styles.rodape}>
            <a
              href="/termos"
              style={styles.link}
            >
              Termos de Uso
            </a>

            <span style={styles.separador}>
              •
            </span>

            <a
              href="/privacidade"
              style={styles.link}
            >
              Política de Privacidade
            </a>

            <span style={styles.separador}>
              •
            </span>

            <a
              href="https://wa.me/5511962093812?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20An%C3%BAncioAI."
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              Suporte
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles = {
  main: {
    minHeight: "100vh",
    background: "#09090b",
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
    padding: "35px 20px",
  },

  container: {
    width: "100%",
    maxWidth: "650px",
    margin: "0 auto",
  },

  voltar: {
    display: "inline-block",
    color: "#8b5cf6",
    textDecoration: "none",
    marginBottom: "25px",
    fontSize: "15px",
  },

  card: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "20px",
    padding: "26px",
  },

  carregando: {
    textAlign: "center",
    color: "#a1a1aa",
  },

  cabecalho: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "30px",
  },

  pequeno: {
    color: "#8b5cf6",
    fontWeight: "700",
    margin: "0 0 8px",
  },

  titulo: {
    margin: 0,
    fontSize: "30px",
    lineHeight: "1.15",
  },

  botaoSair: {
    background: "transparent",
    border: "1px solid #52525b",
    color: "#a1a1aa",
    borderRadius: "10px",
    padding: "9px 13px",
    cursor: "pointer",
  },

  bloco: {
    background: "#09090b",
    border: "1px solid #27272a",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "16px",
  },

  rotulo: {
    display: "block",
    color: "#71717a",
    fontSize: "13px",
    marginBottom: "8px",
  },

  valor: {
    fontSize: "16px",
    wordBreak: "break-word",
  },

  planoLinha: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  badgePro: {
    background: "#7c3aed",
    color: "#ffffff",
    borderRadius: "999px",
    padding: "7px 12px",
    fontSize: "13px",
    fontWeight: "700",
  },

  badgeFree: {
    background: "#27272a",
    color: "#d4d4d8",
    border: "1px solid #52525b",
    borderRadius: "999px",
    padding: "7px 12px",
    fontSize: "13px",
    fontWeight: "700",
  },

  contador: {
    color: "#a1a1aa",
    fontSize: "14px",
  },

  upgrade: {
    marginTop: "25px",
    paddingTop: "25px",
    borderTop: "1px solid #27272a",
  },

  cancelamento: {
    marginTop: "25px",
    paddingTop: "25px",
    borderTop: "1px solid #27272a",
  },

  subtitulo: {
    marginTop: 0,
    marginBottom: "10px",
    fontSize: "22px",
  },

  texto: {
    color: "#a1a1aa",
    lineHeight: "1.6",
  },

  botaoPrimario: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    background: "#7c3aed",
    color: "#ffffff",
    textAlign: "center",
    textDecoration: "none",
    borderRadius: "10px",
    padding: "15px",
    marginTop: "18px",
    fontWeight: "700",
  },

  botaoCancelar: {
    width: "100%",
    background: "#2b1114",
    border: "1px solid #7f1d1d",
    color: "#fca5a5",
    borderRadius: "10px",
    padding: "15px",
    marginTop: "18px",
    fontWeight: "700",
    cursor: "pointer",
  },

  aviso: {
    color: "#71717a",
    fontSize: "12px",
    lineHeight: "1.5",
    marginTop: "12px",
  },

  mensagem: {
    marginTop: "20px",
    background: "#09090b",
    border: "1px solid #3f3f46",
    borderRadius: "10px",
    padding: "14px",
    color: "#d4d4d8",
    lineHeight: "1.5",
  },

  rodape: {
    marginTop: "35px",
    paddingTop: "20px",
    borderTop: "1px solid #27272a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  link: {
    color: "#8b5cf6",
    textDecoration: "none",
    fontSize: "12px",
  },

  separador: {
    color: "#52525b",
  },
};
