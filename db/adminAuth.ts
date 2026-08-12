const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function createSessionToken(password: string): string {
  return Buffer.from(`${password}:${Date.now()}`).toString("base64");
}

function isValidSession(token: string, expectedPassword: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const separatorIdx = decoded.lastIndexOf(":");
    if (separatorIdx === -1) return false;
    const pwd = decoded.slice(0, separatorIdx);
    const ts = decoded.slice(separatorIdx + 1);
    if (pwd !== expectedPassword) return false;
    const timestamp = Number(ts);
    if (!Number.isFinite(timestamp)) return false;
    return Date.now() - timestamp < SESSION_TTL_MS;
  } catch {
    return false;
  }
}

export function requireAdmin(req: { headers: Record<string, any> }): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = req.headers.authorization || req.headers.Authorization || "";
  if (!header.startsWith("Bearer ")) return false;
  const token = header.slice(7);
  return isValidSession(token, expected);
}
