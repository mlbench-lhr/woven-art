export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

export function getOTPExpiryTime(): Date {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
}
