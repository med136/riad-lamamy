import { getCurrentUser } from "@/lib/supabase/server";

export class UnauthorizedAdminError extends Error {
  constructor() {
    super("Authentification administrateur requise.");
    this.name = "UnauthorizedAdminError";
  }
}

export const requireAdminSession = async () => {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedAdminError();
  return user;
};

