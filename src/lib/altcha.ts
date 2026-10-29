import "server-only";
import { CappedMap, create, deriveHmacKeySecret, randomInt } from "altcha-lib/frameworks/nextjs";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";

/**
 * Self-hosted proof-of-work captcha (no Google/Cloudflare dependency, works in Iran).
 * Cost is kept low so a weak phone solves it in about a second, invisibly.
 */
const secret = process.env.APP_SECRET ?? "dev-secret";
const hmacSignatureSecret = `${secret}:altcha`;
// Remembers solved challenges so a payload can't be replayed.
const store = new CappedMap({ maxSize: 5000 });

let instance: Promise<ReturnType<typeof create> & { keySecret: string }> | undefined;
function getAltcha() {
  instance ??= deriveHmacKeySecret(`${secret}:altcha-key`).then((keySecret) => ({
    keySecret,
    ...create({
      deriveKey,
      hmacSignatureSecret,
      hmacKeySignatureSecret: keySecret,
      store,
      createChallengeParameters: () => ({
        algorithm: "PBKDF2/SHA-256",
        cost: 1_000,
        counter: randomInt(1_000, 4_000),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      }),
    }),
  }));
  return instance;
}

export async function challengeResponse(req: Request) {
  return (await getAltcha()).challengeHandler(req);
}

export async function verifyAltcha(payload: string | undefined | null) {
  if (!payload) return false;
  const a = await getAltcha();
  const result = await a.verify(payload, deriveKey, hmacSignatureSecret, a.keySecret, store);
  return !result.error && Boolean(result.verification && "verified" in result.verification && result.verification.verified);
}
