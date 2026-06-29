import "server-only";
import crypto from "crypto";

function getKey(): Buffer {
  const secret =
    process.env.NEXTAUTH_SECRET ?? "thinkgraph-dev-secret-change-in-production";
  return crypto.createHash("sha256").update(secret).digest();
}

/** AES-256-GCM encrypt — returns base64url string. */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

/** AES-256-GCM decrypt — throws on tampered data. */
export function decrypt(token: string): string {
  const buf = Buffer.from(token, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const encrypted = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}
