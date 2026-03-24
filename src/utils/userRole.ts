/** Normaliza deteção de criador (API / localStorage pode variar capitalização). */
export function isContentCreator(user: { role?: string } | null | undefined): boolean {
  const r = String(user?.role ?? "").toLowerCase().trim();
  return r === "creator" || r === "admin";
}
