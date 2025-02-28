// Generate a random referral code
export function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const codeLength = 8
  let code = "ERV-"
  for (let i = 0; i < codeLength; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Store referral data in localStorage
export function storeReferralData(referralCode: string, referrerCode?: string) {
  localStorage.setItem("referralCode", referralCode)
  if (referrerCode) {
    localStorage.setItem("referrerCode", referrerCode)
  }
}

// Get stored referral code
export function getStoredReferralCode(): string | null {
  return localStorage.getItem("referralCode")
}

// Get referrer's code
export function getReferrerCode(): string | null {
  return localStorage.getItem("referrerCode")
}

