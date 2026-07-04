import argon2 from "argon2";

/* -------------------------------------------------------------------------- */
/*                           Argon2 Configuration                             */
/* -------------------------------------------------------------------------- */

export const ARGON2_OPTIONS: argon2.Options & {
  type: number;
} = {
  type: argon2.argon2id,

  memoryCost: 64 * 1024,

  timeCost: 3,

  parallelism: 2,
};

/* -------------------------------------------------------------------------- */
/*                              Password Hashing                              */
/* -------------------------------------------------------------------------- */

export const hashPassword = async (
  password: string,
): Promise<string> => {
  return argon2.hash(
    password,
    ARGON2_OPTIONS,
  );
};

/* -------------------------------------------------------------------------- */
/*                             Password Verify                                */
/* -------------------------------------------------------------------------- */

export const verifyPassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  try {
    return await argon2.verify(
      passwordHash,
      password,
    );
  } catch {
    return false;
  }
};

/* -------------------------------------------------------------------------- */
/*                           Password Rehash Check                            */
/* -------------------------------------------------------------------------- */

export const needsPasswordRehash = (
  passwordHash: string,
): boolean => {
  try {
    return argon2.needsRehash(
      passwordHash,
      ARGON2_OPTIONS,
    );
  } catch {
    return true;
  }
};

/* -------------------------------------------------------------------------- */
/*                        Automatic Password Upgrade                          */
/* -------------------------------------------------------------------------- */

export const upgradePasswordHash = async (
  plainPassword: string,
  currentHash: string,
): Promise<string | null> => {
  const valid = await verifyPassword(
    plainPassword,
    currentHash,
  );

  if (!valid) {
    return null;
  }

  if (!needsPasswordRehash(currentHash)) {
    return null;
  }

  return hashPassword(
    plainPassword,
  );
};