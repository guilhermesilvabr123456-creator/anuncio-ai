export const metadata = {
  title: "Anúncio AI",
  description: "Crie anúncios profissionais com inteligência artificial",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#09090b",
        }}
      >
        {children}
      </body>
    </html>
  );
}
