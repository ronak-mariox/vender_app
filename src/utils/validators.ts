export type FormErrors<T extends string> = Partial<Record<T | 'form', string>>;

export function isRequired(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidMobile(value: string): boolean {
  return /^\d{10}$/.test(value.trim());
}

export function isValidPAN(value: string): boolean {
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(value.trim().toUpperCase());
}

export function isValidGSTIN(value: string): boolean {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z]\dZ[A-Z\d]$/.test(value.trim().toUpperCase());
}

export function isValidIFSC(value: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.trim().toUpperCase());
}

export function isValidPincode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

export function isValidHSN(value: string): boolean {
  return /^\d{4,8}$/.test(value.trim());
}

export function isValidBarcode(value: string): boolean {
  return /^\d{13}$/.test(value.trim());
}

export function isPositiveNumber(value: string): boolean {
  const num = parseFloat(value);
  return !Number.isNaN(num) && num > 0;
}

export function isNonNegativeInteger(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

export function minLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

export function isAdult(dob: string): boolean {
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsed.getDate())) {
    age -= 1;
  }
  return age >= 18;
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function isTimeRangeValid(openTime: string, closeTime: string): boolean {
  return openTime < closeTime;
}
