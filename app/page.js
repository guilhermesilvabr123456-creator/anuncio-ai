"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [produto, setProduto] = useState("");
  const [publico, setPublico] = useState("");
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");

  useEffect(() => {
    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setNomeUsuario(
          user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Usuário"
        );
      }
    }

    carregarUsuario();
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function gerarAnuncio() {
    if (!produto || !publico) {
      alert("Preencha o produto e o público-alvo.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      alert("Sua sessão expirou. Entre novamente.");
      window.location.href = "/login";
      return;
    }

    setCarregando(true);
    setResultado("");

    try {
      const resposta = await fetch("/api/gerar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          produto,
          publico,
        }),
      });

      const dados = await resposta.json();

      setResultado(
        (
          (resposta.ok ? dados.anuncio : dados.error) ||
          "Não foi possível gerar o anúncio."
        )
          .replace(/###/g, "")
          .replace(/\*\*/g, "")
      );
    } catch (erro) {
      setResultado(
        "Erro ao gerar anúncio. Tente novamente."
      );
    }

    setCarregando(false);
  }

  async function copiarAnuncio() {
    if (!resultado) return;

    await navigator.clipboard.writeText(resultado);
    alert("Anúncio copiado!");
  }

  async function assinarPro() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Entre novamente na sua conta.");
      window.location.href = "/login";
      return;
    }

    try {
      const resposta = await fetch("/api/assinatura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
        }),
      });

      const dados = await resposta.json();

      if (dados.url) {
        window.location.href = dados.url;
      } else {
        alert(
          dados.error ||
            "Não foi possível iniciar a assinatura."
        );
      }
    } catch (erro) {
      alert("Erro ao iniciar a assinatura.");
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>

        {nomeUsuario && (
          <div style={styles.usuario}>
            <span>Olá, {nomeUsuario} 👋</span>

            <button
              type="button"
              onClick={sair}
              style={styles.botaoSair}
            >
              Sair
            </button>
          </div>
        )}

        <div style={styles.badge}>
          ✨ Inteligência Artificial
        </div>

        <h1 style={styles.titulo}>
          Crie anúncios que
          <br />
          <span style={styles.destaque}>
            vendem mais
          </span>
        </h1>

        <p style={styles.subtitulo}>
          Gere textos profissionais para seus anúncios
          usando inteligência artificial em poucos segundos.
        </p>

        <div style={styles.card}>

          <label style={styles.label}>
            O que você quer anunciar?
          </label>

          <input
            style={styles.input}
            placeholder="Ex: Tênis esportivo masculino"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
          />

          <label style={styles.label}>
            Quem é seu público?
          </label>

          <input
            style={styles.input}
            placeholder="Ex: Homens de 18 a 35 anos"
            value={publico}
            onChange={(e) => setPublico(e.target.value)}
          />

          <button
            type="button"
            style={{
              ...styles.botao,
              opacity: carregando ? 0.7 : 1,
            }}
            onClick={gerarAnuncio}
            disabled={carregando}
          >
            {carregando
              ? "Gerando..."
              : "✨ Gerar anúncio com IA"}
          </button>

          {resultado && (
            <div style={styles.resultado}>

              <h3>Seu anúncio:</h3>

              <p style={{ whiteSpace: "pre-wrap" }}>
                {resultado}
              </p>

              {!resultado.includes("atingiu o limite") && (
                <button
                  type="button"
                  style={{
                    ...styles.botao,
                    marginTop: "16px",
                  }}
                  onClick={copiarAnuncio}
                >
                  📋 Copiar anúncio
                </button>
              )}

              {resultado.includes("atingiu o limite") && (
                <div style={styles.planoPro}>

                  <h3>
                    Plano Pro — R$ 19,90/mês
                  </h3>

                  <p>
                    Tenha até 100 anúncios por mês.
                  </p>

                  <button
                    type="button"
                    style={{
                      ...styles.botao,
                      marginTop: "12px",
                    }}
                    onClick={assinarPro}
                  >
                    💳 Assinar com Mercado Pago
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        <div style={styles.rodapeArea}>

          <p style={styles.rodape}>
            ⚡ Anúncios profissionais em segundos
          </p>

          <div style={styles.linksRodape}>

            <a
              href="/termos"
              style={styles.linkRodape}
            >
              Termos de Uso
            </a>

            <span style={styles.separador}>
              •
            </span>

            <a
              href="/privacidade"
              style={styles.linkRodape}
            >
              Política de Privacidade
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
    padding: "40px 20px",
  },

  container: {
    maxWidth: "650px",
    margin: "0 auto",
    textAlign: "center",
  },

  usuario: {
    color: "#ffffff",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    fontWeight: "700",
  },

  botaoSair: {
    background: "transparent",
    color: "#a1a1aa",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
  },

  badge: {
    display: "inline-block",
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "50px",
    padding: "8px 16px",
    fontSize: "14px",
    marginBottom: "25px",
  },

  titulo: {
    fontSize: "48px",
    lineHeight: "1.05",
    marginBottom: "20px",
  },

  destaque: {
    color: "#8b5cf6",
  },

  subtitulo: {
    color: "#a1a1aa",
    fontSize: "18px",
    lineHeight: "1.6",
    marginBottom: "35px",
  },

  card: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "20px",
    padding: "25px",
    textAlign: "left",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "10px",
    border: "1px solid #3f3f46",
    background: "#09090b",
    color: "#ffffff",
    fontSize: "16px",
    boxSizing: "border-box",
  },

  botao: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },

  resultado: {
    marginTop: "25px",
    background: "#09090b",
    border: "1px solid #3f3f46",
    borderRadius: "12px",
    padding: "20px",
    lineHeight: "1.6",
  },

  planoPro: {
    marginTop: "20px",
  },

  rodapeArea: {
    marginTop: "25px",
  },

  rodape: {
    color: "#71717a",
    marginTop: "25px",
    fontSize: "14px",
  },

  linksRodape: {
    marginTop: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  linkRodape: {
    color: "#8b5cf6",
    textDecoration: "none",
    fontSize: "13px",
  },

  separador: {
    color: "#52525b",
  },
};
