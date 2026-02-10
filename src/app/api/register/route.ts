import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/adminClient";

type RegisterPayload = {
  inviteCode?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const inviteSecret = process.env.ADMIN_INVITE_CODE;
    if (!inviteSecret) {
      return NextResponse.json(
        { error: "Inscription désactivée." },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => null)) as RegisterPayload | null;
    const inviteCode = (body?.inviteCode || "").trim();
    const email = (body?.email || "").trim();
    const password = body?.password || "";

    if (!inviteCode || !email || !password) {
      return NextResponse.json(
        { error: "Paramètres manquants." },
        { status: 400 }
      );
    }

    if (inviteCode !== inviteSecret) {
      return NextResponse.json(
        { error: "Code d'invitation invalide." },
        { status: 401 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Mot de passe trop court (8 caractères minimum)." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erreur serveur." },
      { status: 500 }
    );
  }
}

