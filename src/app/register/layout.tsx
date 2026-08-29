import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription — Administration",
  description: "Création de compte sur invitation.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f3eb]">
      {children}
    </div>
  );
}