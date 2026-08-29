import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Administration",
  description: "Accès réservé au personnel.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f3eb]">{children}</div>
  );
}
