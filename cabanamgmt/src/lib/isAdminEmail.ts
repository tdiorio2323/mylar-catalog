export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const envList = process.env.ADMIN_EMAILS || "tyler@tdstudiosny.com";

  return envList
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .includes(email.toLowerCase());
}
