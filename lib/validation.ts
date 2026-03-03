/**
 * Centralized input sanitization for server-side API routes.
 * Strips HTML tags, trims whitespace, and validates format.
 */

// Strip all HTML tags (XSS prevention)
export function sanitizeString(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")  // Remove HTML tags
    .replace(/[<>]/g, "")     // Remove any remaining angle brackets
    .trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate phone format (Indonesian: 08xxx or +628xxx, 10-15 digits)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phoneRegex.test(phone.replace(/[\s\-]/g, ""));
}

// Validate and sanitize all checkout fields
export function validateCheckoutInput(data: {
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
}): { valid: true; sanitized: typeof data } | { valid: false; error: string } {
  if (!data.email || !data.name || !data.phone || !data.address) {
    return { valid: false, error: "All fields are required." };
  }

  const email = sanitizeString(data.email).toLowerCase();
  const name = sanitizeString(data.name);
  const phone = sanitizeString(data.phone);
  const address = sanitizeString(data.address);

  if (!isValidEmail(email)) {
    return { valid: false, error: "Invalid email format." };
  }

  if (name.length < 2 || name.length > 100) {
    return { valid: false, error: "Name must be 2-100 characters." };
  }

  if (!isValidPhone(phone)) {
    return { valid: false, error: "Invalid phone number. Use Indonesian format (08xxx)." };
  }

  if (address.length < 10 || address.length > 500) {
    return { valid: false, error: "Address must be 10-500 characters." };
  }

  return { valid: true, sanitized: { email, name, phone, address } };
}

// Validate quantity
export function isValidQuantity(qty: unknown): qty is number {
  return typeof qty === "number" && Number.isInteger(qty) && qty > 0 && qty <= 10;
}
