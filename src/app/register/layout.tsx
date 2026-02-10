import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription — Administration",
  description: "Création de compte (sur invitation).",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-shell flex min-h-screen items-center justify-center px-4 py-12">
      {children}
    </div>
  );
}

