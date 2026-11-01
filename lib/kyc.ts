/**
 * KYC data minimization helpers.
 *
 * Raw PAN / Aadhaar values are held only transiently in memory while the user
 * is editing a form. They are NEVER persisted: every storage path receives
 * masked representations plus a salted, one-way SHA-256 hash (so values can be
 * verified/matched later without storing the raw number).
 */

export function cleanDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

/** Mask a PAN: keep first two + last character, e.g. ABCDE1234F → AB••••••F. */
export function maskPan(pan: string): string {
  const p = (pan || "").toUpperCase().replace(/\s/g, "");
  if (p.length < 10) return p;
  return `${p.slice(0, 2)}••••••${p.slice(-1)}`;
}

/** Mask Aadhaar: keep only the last 4 digits, e.g. XXXX XXXX 9012. */
export function maskAadhaar(aadhaar: string): string {
  const d = cleanDigits(aadhaar);
  return d ? `XXXX XXXX ${d.slice(-4)}` : "";
}

async function sha256Hex(input: string): Promise<string> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "";
  }
}

export interface SecureKyc {
  panMasked: string;
  aadhaarMasked: string;
  panHash: string;
  aadhaarHash: string;
  kycSalt: string;
}

/**
 * Produce the persisted KYC representation for a PAN + Aadhaar pair.
 * The raw values are our used; only masked forms and salted hashes are returned.
 */
export async function buildSecureKyc(pan: string, aadhaar: string): Promise<SecureKyc> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(8));
  const salt = Array.from(saltBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const [panHash, aadhaarHash] = await Promise.all([
    sha256Hex(`${salt}::${pan.trim().toUpperCase()}`),
    sha256Hex(`${salt}::${cleanDigits(aadhaar)}`),
  ]);

  return {
    panMasked: maskPan(pan),
    aadhaarMasked: maskAadhaar(aadhaar),
    panHash,
    aadhaarHash,
    kycSalt: salt,
  };
}
