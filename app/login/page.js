"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Login() {
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setMensagem("");
    setCarregando(true);

    if (cadastro) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: { name: nome },
        },
      });

      if (error) {
        setMensagem(error.message);
      } else if (data.session) {
        window.location.href = "/";
      } else {
        setMensagem("Cadastro realizado! Confirme o link enviado ao seu e-mail.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setMensagem("E-mail ou senha incorretos.");
      } else {
        window.location.href = "/";
      }
    }

    setCarregando(false);
  }

  return (
    <main style={estilos.pagina}>
      <section style={estilos.caixa}>
        <div style={estilos.logo}>✨ AnúncioAI</div>

        <h1 style={estilos.titulo}>
          {cadastro ? "Crie sua conta" : "Entre na sua conta"}
        </h1>

        <p style={estilos.subtitulo}>
          {cadastro
            ? "Comece grátis com 5 anúncios por mês."
            : "Acesse sua conta para criar anúncios."}
        </p>

        <form onSubmit={enviar} style={estilos.formulario}>
          {cadastro && (
            <input
              style={estilos.campo}
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          )}

          <input
            style={estilos.campo}
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={estilos.campo}
            type="password"
            placeholder="Sua senha (mínimo 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={6}
            required
          />

          <button style={estilos.botao} disabled={carregando}>
            {carregando
              ? "Aguarde..."
              : cadastro
              ? "Criar conta grátis"
              : "Entrar"}
          </button>
        </form>

        {mensagem && <p style={estilos.mensagem}>{mensagem}</p>}

        <button
          type="button"
          style={estilos.alternar}
          onClick={() => {
            setCadastro(!cadastro);
            setMensagem("");
          }}
        >
          {cadastro
            ? "Já possui conta? Entrar"
            : "Ainda não tem conta? Criar conta"}
        </button>

        <a href="/" style={estilos.voltar}>
          Voltar para o início
        </a>
      </section>
    </main>
  );
}

const estilos = {
  pagina: {
    minHeight: "100vh",
    background: "#08080b",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  caixa: {
    width: "100%",
    maxWidth: "430px",
    background: "#18181d",
    border: "1px solid #33333d",
    borderRadius: "24px",
    padding: "32px 24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },
  logo: {
    color: "#9b6cff",
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "28px",
  },
  titulo: {
    fontSize: "32px",
    textAlign: "center",
    margin: "0 0 10px",
  },
  subtitulo: {
    color: "#a5a5ad",
    textAlign: "center",
    lineHeight: "1.5",
    marginBottom: "26px",
  },
  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  campo: {
    width: "100%",
    boxSizing: "border-box",
    background: "#09090c",
    color: "#ffffff",
    border: "1px solid #44444f",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "16px",
    outline: "none",
  },
  botao: {
    background: "linear-gradient(90deg, #6d28d9, #8b5cf6)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  mensagem: {
    background: "#24242b",
    borderRadius: "10px",
    padding: "12px",
    marginTop: "18px",
    textAlign: "center",
    lineHeight: "1.4",
  },
  alternar: {
    width: "100%",
    background: "transparent",
    color: "#a78bfa",
    border: "none",
    padding: "20px 0 10px",
    fontSize: "15px",
    cursor: "pointer",
  },
  voltar: {
    display: "block",
    color: "#8d8d96",
    textAlign: "center",
    textDecoration: "none",
    marginTop: "8px",
  },
};
