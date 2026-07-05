/**
 * testData — random data generators for test fixtures and data-driven tests.
 * Mirrors the Hub project's DateStringExtensions, simplified and standalone.
 *
 * Usage:
 *   generateEmail()                 // 'auto_k3f9x@example.com'
 *   generateEmail(8, 'myapp.com')   // 'auto_k3f9xyzw@myapp.com'
 *   generateString(6)               // 'aBcDeF'
 *   generateNumeric(4)              // '7392'
 */

const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMERIC = '0123456789';

function randomChars(chars: string, length: number): string {
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Generates a random alphabetic string of the given length. */
export function generateString(length: number): string {
  return randomChars(ALPHA, length);
}

/** Generates a random numeric string of the given length. */
export function generateNumeric(length: number): string {
  return randomChars(NUMERIC, length);
}

/**
 * Generates a unique-enough email address.
 * @param length - Number of random characters in the local part (default: 8)
 * @param domain - Email domain (default: 'example.com')
 */
export function generateEmail(length = 8, domain = 'example.com'): string {
  return `auto_${randomChars(ALPHA.toLowerCase(), length)}@${domain}`;
}

/**
 * Generates a random full name.
 * @param firstNameLength - default 6
 * @param lastNameLength - default 8
 */
export function generateName(firstNameLength = 6, lastNameLength = 8): { firstName: string; lastName: string } {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  return {
    firstName: cap(randomChars(ALPHA.toLowerCase(), firstNameLength)),
    lastName: cap(randomChars(ALPHA.toLowerCase(), lastNameLength)),
  };
}
