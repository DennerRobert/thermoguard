import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThermoGuard IoT - Sistema de Monitoramento Térmico",
  description: "Dashboard IoT para monitoramento térmico de Data Center",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
