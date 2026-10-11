const MIN_JWT_KEY_LENGTH = 32;

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];
  const accessKey = String(config.JWT_ACCESS_KEY ?? '');
  const refreshKey = String(config.JWT_REFRESH_KEY ?? '');

  if (!config.MONGODB_URL) errors.push('MONGODB_URL is required');

  for (const [name, value] of [
    ['JWT_ACCESS_KEY', accessKey],
    ['JWT_REFRESH_KEY', refreshKey],
  ]) {
    if (value.length < MIN_JWT_KEY_LENGTH) {
      errors.push(
        `${name} must be at least ${MIN_JWT_KEY_LENGTH} characters (generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")`,
      );
    }
  }

  if (accessKey && accessKey === refreshKey) {
    errors.push('JWT_ACCESS_KEY and JWT_REFRESH_KEY must be different');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment:\n  - ${errors.join('\n  - ')}`);
  }

  return config;
}
