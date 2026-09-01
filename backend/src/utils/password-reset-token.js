import crypto from "node:crypto";

export const hashResetToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

export function createResetToken(now = Date.now()) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  return {
    rawToken,
    tokenHash: hashResetToken(rawToken),
    expiresAt: new Date(now + 60 * 60 * 1000),
  };
}

export const resetTokenIsUsable = (token, now = Date.now()) =>
  Boolean(token && !token.usado && new Date(token.fechaExpiracion).getTime() >= now);
