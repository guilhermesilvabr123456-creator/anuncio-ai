"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";import { useState } from "react";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export default function Home() {
  const [produto, setProduto] = useState("");
  const [publico, setPublico] = useState("");
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);const [nomeUsuario, setNomeUsuario] = useState("");
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

  async function gerarAnuncio() {
    if (!produto || !publico) {
      alert("Preencha o produto e o público-alvo.");
      return;
    }

    setCarregando(true);
    setResultado("");

    try {
      const resposta = await fetch("/api/gerar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produto,
          publico,
        }),
      });

      const dados = await resposta.json();

setResultado(
  (dados.anuncio || "Não foi possível gerar o anúncio.")
    .replace(/###/g, "")
    .replace(/\*\*/g, "")
);
    } catch (erro) {
      setResultado("Erro ao gerar anúncio. Tente novamente.");
    }

    setCarregando(false);
  }
  async function copiarAnuncio() {
    if (!resultado) return;

    await navigator.clipboard.writeText(resultado);
    alert("Anúncio copiado!");
  }
  return (
    <main style={styles.main}>
      <div style={styles.container}>{nomeUsuario && (
  <div
    style={{
      color: "#ffffff",
      textAlign: "right",
      marginBottom: "16px",
      fontWeight: "700",
    }}
  >
    Olá, {nomeUsuario} 👋
  </div>
)}
        <div style={styles.badge}>✨ Inteligência Artificial</div>

        <h1 style={styles.titulo}>
          Crie anúncios que
          <br />
          <span style={styles.destaque}>vendem mais</span>
        </h1>

        <p style={styles.subtitulo}>
          Gere textos profissionais para seus anúncios usando inteligência
          artificial em poucos segundos.
        </p>

        <div style={styles.card}>
          <label style={styles.label}>O que você quer anunciar?</label>

          <input
            style={styles.input}
            placeholder="Ex: Tênis esportivo masculino"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
          />

          <label style={styles.label}>Quem é seu público?</label>

          <input
            style={styles.input}
            placeholder="Ex: Homens de 18 a 35 anos"
            value={publico}
            onChange={(e) => setPublico(e.target.value)}
          />

          <button
            style={styles.botao}
            onClick={gerarAnuncio}
            disabled={carregando}
          >
            {carregando ? "Gerando..." : "✨ Gerar anúncio com IA"}
          </button>

          {resultado && (
            <div style={styles.resultado}>
              <h3>Seu anúncio:</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{resultado}</p>
                    <button
            type="button"
            style={{ ...styles.botao, marginTop: "16px" }}
            onClick={copiarAnuncio}
          >
            📋 Copiar anúncio
          </button>  </div>
          )}
        </div>

        <p style={styles.rodape}>
          ⚡ Anúncios profissionais em segundos
        </p>
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

  rodape: {
    color: "#71717a",
    marginTop: "25px",
    fontSize: "14px",
  },
};
