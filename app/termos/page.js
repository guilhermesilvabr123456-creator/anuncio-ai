export const metadata = {
  title: "Termos de Uso | AnúncioAI",
  description: "Termos de Uso da plataforma AnúncioAI",
};

export default function Termos() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#08080b",
        color: "#ffffff",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          lineHeight: "1.7",
        }}
      >
        <a
          href="/"
          style={{
            color: "#8b5cf6",
            textDecoration: "none",
          }}
        >
          ← Voltar para o AnúncioAI
        </a>

        <h1 style={{ fontSize: "36px", marginTop: "35px" }}>
          Termos de Uso
        </h1>

        <p style={{ color: "#aaa" }}>
          Última atualização: 11 de agosto de 2026
        </p>

        <h2>1. Sobre o AnúncioAI</h2>
        <p>
          O AnúncioAI é uma plataforma que utiliza inteligência artificial
          para auxiliar usuários na criação de textos para anúncios.
        </p>

        <h2>2. Uso da plataforma</h2>
        <p>
          Ao utilizar o AnúncioAI, você concorda em fornecer informações
          verdadeiras e utilizar a plataforma de maneira legal e responsável.
        </p>

        <h2>3. Conteúdo gerado por inteligência artificial</h2>
        <p>
          Os textos são gerados automaticamente por inteligência artificial
          e podem conter erros ou informações inadequadas. O usuário é
          responsável por revisar o conteúdo antes de publicá-lo ou utilizá-lo
          comercialmente.
        </p>

        <h2>4. Planos e limites</h2>
        <p>
          O plano gratuito possui limite de até 5 anúncios por mês. O Plano
          Pro possui limite de até 100 anúncios por mês, conforme as condições
          apresentadas no momento da contratação.
        </p>

        <h2>5. Plano Pro</h2>
        <p>
          O Plano Pro é uma assinatura recorrente. O preço e as condições
          aplicáveis são apresentados ao usuário antes da contratação.
          Pagamentos podem ser processados por provedores de pagamento
          terceiros.
        </p>

        <h2>6. Cancelamento</h2>
        <p>
          O usuário poderá solicitar o cancelamento de sua assinatura. O
          cancelamento impede futuras renovações, observadas as condições
          aplicáveis à contratação e à legislação vigente.
        </p>

        <h2>7. Uso proibido</h2>
        <p>
          É proibido utilizar a plataforma para produzir conteúdo ilegal,
          fraudulento, enganoso ou que viole direitos de terceiros.
        </p>

        <h2>8. Disponibilidade</h2>
        <p>
          Podemos realizar atualizações, correções e manutenções que
          eventualmente afetem temporariamente a disponibilidade da
          plataforma.
        </p>

        <h2>9. Alterações destes termos</h2>
        <p>
          Estes Termos de Uso poderão ser atualizados para refletir mudanças
          na plataforma ou requisitos legais.
        </p>

        <p style={{ marginTop: "50px", color: "#888" }}>
          © 2026 AnúncioAI
        </p>
      </div>
    </main>
  );
}
