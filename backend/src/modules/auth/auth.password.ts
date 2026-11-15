import argon2 from 'argon2';

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

/**
 * Hash Argon2id precalculado para igualar tiempos de verificación cuando el correo no existe.
 */
const DUMMY_ARGON2ID_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$mbpE8UukVHDBeJzUdikyGA$Alx2nA/gHFPziZokX5fuc80TX4JgrFPPcFvMHv9GR3g';

const DEFAULT_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;

const EXPIRATION_MULTIPLIERS_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
};

export async function hashPassword(plainPassword: string): Promise<string> {
  return argon2.hash(plainPassword, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hash: string | null | undefined,
  plainPassword: string,
): Promise<boolean> {
  if (!hash || !plainPassword || !hash.startsWith('$argon2')) {
    return false;
  }

  try {
    return await argon2.verify(hash, plainPassword);
  } catch {
    return false;
  }
}

export async function verifyDummyPassword(plainPassword: string): Promise<void> {
  try {
    await argon2.verify(DUMMY_ARGON2ID_HASH, plainPassword);
  } catch {
    // Se ignora intencionalmente: solo busca igualar el costo computacional de Argon2id.
  }
}

export function parseExpirationToSeconds(expr: string): number {
  const trimmed = expr.trim().toLowerCase();
  if (/^\d+$/.test(trimmed)) {
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : DEFAULT_COOKIE_MAX_AGE_SECONDS;
  }

  const match = /^(\d+)\s*([smhdw])$/.exec(trimmed);
  if (!match) {
    return DEFAULT_COOKIE_MAX_AGE_SECONDS;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = unit ? EXPIRATION_MULTIPLIERS_SECONDS[unit] : undefined;

  if (!Number.isSafeInteger(amount) || amount <= 0 || multiplier === undefined) {
    return DEFAULT_COOKIE_MAX_AGE_SECONDS;
  }

  return amount * multiplier;
}
