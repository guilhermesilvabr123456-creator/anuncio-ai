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
  const [plano, setPlano] = useState("");
  const [limiteMensal, setLimiteMensal] = useState(5);
  const [usoAtual, setUsoAtual] = useState(0);

  useEffect(() => {
    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setNomeUsuario(
        user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Usuário"
      );

      const { data: perfil, error } = await supabase
        .from("profiles")
        .select("plan, monthly_limit, usage_count")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error);
        return;
      }

      if (perfil) {
        setPlano(perfil.plan || "free");
        setLimiteMensal(perfil.monthly_limit ?? 5);
        setUsoAtual(perfil.usage_count ?? 0);
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

      const texto =
        (resposta.ok ? dados.anuncio : dados.error) ||
        "Não foi possível gerar o anúncio.";

      setResultado(
        texto
          .replace(/###/g, "")
          .replace(/\*\*/g, "")
      );

      if (resposta.ok) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: perfilAtualizado } = await supabase
            .from("profiles")
            .select("plan, monthly_limit, usage_count")
            .eq("id", user.id)
            .single();

          if (perfilAtualizado) {
            setPlano(perfilAtualizado.plan || "free");
            setLimiteMensal(
              perfilAtualizado.monthly_limit ?? 5
            );
            setUsoAtual(
              perfilAtualizado.usage_count ?? 0
            );
          }
        }
      }
    } catch (erro) {
      console.error(erro);
      setResultado(
        "Erro ao gerar anúncio. Tente novamente."
      );
    }

    setCarregando(false);
  }

  async function copiarAnuncio() {
    if (!resultado) return;

    try {
      await navigator.clipboard.writeText(resultado);
      alert("Anúncio copiado!");
    } catch {
      alert("Não foi possível copiar o anúncio.");
    }
  }

  async function assinarPro() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Entre novamente na sua conta.");
        window.location.href = "/login";
        return;
      }

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
      console.error(erro);
      alert("Não foi possível iniciar a assinatura.");
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>

        {nomeUsuario && (
          <div style={styles.usuarioArea}>

            <div style={styles.usuarioInfo}>
              <div style={styles.nome}>
                Olá, {nomeUsuario} 👋
              </div>

              <div style={styles.planoArea}>
                <span
                  style={
                    plano === "pro"
                      ? styles.planoPro
                      : styles.planoFree
                  }
                >
                  {plano === "pro"
                    ? "Plano Pro"
                    : "Plano Free"}
                </span>

                <span style={styles.contador}>
                  {usoAtual}/{limiteMensal} anúncios usados
                </span>
              </div>
            </div>

            <div style={styles.acoesUsuario}>
              <a
                href="/conta"
                style={styles.botaoConta}
              >
                Minha conta
              </a>

              <button
                type="button"
                onClick={sair}
                style={styles.botaoSair}
              >
                Sair
              </button>
            </div>

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
            onChange={(e) =>
              setProduto(e.target.value)
            }
          />

          <label style={styles.label}>
            Quem é seu público?
          </label>

          <input
            style={styles.input}
            placeholder="Ex: Homens de 18 a 35 anos"
            value={publico}
            onChange={(e) =>
              setPublico(e.target.value)
            }
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

              <h3 style={styles.tituloResultado}>
                Seu anúncio:
              </h3>

              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
              >
                {resultado}
              </p>

              {!resultado
                .toLowerCase()
                .includes("atingiu o limite") && (
                <button
                  type="button"
                  style={{
                    ...styles.botao,
                    marginTop: "20px",
                  }}
                  onClick={copiarAnuncio}
                >
                  📋 Copiar anúncio
                </button>
              )}

              {resultado
                .toLowerCase()
                .includes("atingiu o limite") &&
                plano !== "pro" && (
                  <div style={styles.proArea}>

                    <h3 style={styles.proTitulo}>
                      Plano Pro — R$ 19,90/mês
                    </h3>

                    <p style={styles.proTexto}>
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

            <span style={styles.separador}>
              •
            </span>

            <a
              href="https://wa.me/5511962093812?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20An%C3%BAncioAI."
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkRodape}
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
    padding: "40px 20px",
  },

  container: {
    maxWidth: "650px",
    margin: "0 auto",
    textAlign: "center",
  },

  usuarioArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "35px",
    textAlign: "left",
  },

  usuarioInfo: {
    flex: 1,
    minWidth: 0,
  },

  nome: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "20px",
    marginBottom: "12px",
  },

  planoArea: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },

  planoPro: {
    display: "inline-block",
    background: "#7c3aed",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "50px",
    fontWeight: "700",
    fontSize: "14px",
  },

  planoFree: {
    display: "inline-block",
    background: "#27272a",
    border: "1px solid #52525b",
    color: "#d4d4d8",
    padding: "8px 14px",
    borderRadius: "50px",
    fontWeight: "700",
    fontSize: "14px",
  },

  contador: {
    color: "#a1a1aa",
    fontSize: "14px",
  },

  acoesUsuario: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  botaoConta: {
    display: "inline-block",
    background: "#7c3aed",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "10px 14px",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  botaoSair: {
    background: "transparent",
    color: "#a1a1aa",
    border: "1px solid #52525b",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "14px",
  },

  badge: {
    display: "inline-block",
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "50px",
    padding: "10px 18px",
    fontSize: "16px",
    marginBottom: "45px",
  },

  titulo: {
    fontSize: "clamp(48px, 10vw, 72px)",
    lineHeight: "1.05",
    marginTop: 0,
    marginBottom: "28px",
    fontWeight: "800",
    letterSpacing: "-2px",
  },

  destaque: {
    color: "#8b5cf6",
  },

  subtitulo: {
    color: "#a1a1aa",
    fontSize: "20px",
    lineHeight: "1.6",
    margin: "0 auto 45px",
    maxWidth: "620px",
  },

  card: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "20px",
    padding: "28px",
    textAlign: "left",
  },

  label: {
    display: "block",
    marginBottom: "10px",
    fontWeight: "700",
    fontSize: "18px",
  },

  input: {
    width: "100%",
    padding: "17px",
    marginBottom: "24px",
    borderRadius: "10px",
    border: "1px solid #3f3f46",
    background: "#09090b",
    color: "#ffffff",
    fontSize: "17px",
    boxSizing: "border-box",
    outline: "none",
  },

  botao: {
    width: "100%",
    padding: "17px",
    border: "none",
    borderRadius: "10px",
    background: "#7c3aed",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "17px",
    cursor: "pointer",
  },

  resultado: {
    marginTop: "28px",
    background: "#09090b",
    border: "1px solid #3f3f46",
    borderRadius: "12px",
    padding: "22px",
    lineHeight: "1.7",
    fontSize: "17px",
  },

  tituloResultado: {
    marginTop: 0,
    marginBottom: "18px",
    fontSize: "22px",
  },

  proArea: {
    marginTop: "25px",
  },

  proTitulo: {
    fontSize: "21px",
    marginBottom: "10px",
  },

  proTexto: {
    color: "#d4d4d8",
    marginBottom: "10px",
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
