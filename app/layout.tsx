import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouX",
  description:
    "Protótipo acadêmico de uma plataforma de organização, foco e bem-estar para universitários.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
