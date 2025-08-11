export function getPlatformFeeRate(user: { is_premium?: boolean }) {
  if (user.is_premium) return 0.05;
  return 0.098;
}

export function computeFees({ amountCents, user }: { amountCents: number; user: { is_premium?: boolean } }) {
  const feeRate = getPlatformFeeRate(user);
  const fee = Math.round(amountCents * feeRate);
  const netToHelper = amountCents - fee;
  return { fee, netToHelper, feeRate };
}

