import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const VERSION = "v1";

const decodeKey = (encoded: string) => {
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("invalid_channel_encryption_key");
  return key;
};

export function encryptChannelSecret(plaintext: string, encodedKey: string) {
  const key = decodeKey(encodedKey);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(VERSION));
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptChannelSecret(payload: string, encodedKey: string) {
  const [version, ivPart, tagPart, ciphertextPart, extra] = payload.split(".");
  if (version !== VERSION || !ivPart || !tagPart || !ciphertextPart || extra) {
    throw new Error("invalid_channel_secret_envelope");
  }
  const decipher = createDecipheriv("aes-256-gcm", decodeKey(encodedKey), Buffer.from(ivPart, "base64url"));
  decipher.setAAD(Buffer.from(VERSION));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
