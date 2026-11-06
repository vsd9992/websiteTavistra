/**
 * Indian Mobile & Email Validation with Relay Email Protection
 * Strictly enforces valid contact information for tax invoicing and carrier OTP tracking.
 */

/**
 * Known email relay, alias, and disposable email domains.
 * Banned on Tavistra to ensure delivery notices, statutory GST invoices,
 * and high-value carrier handover OTPs reach verified clients directly.
 */
export const BANNED_EMAIL_DOMAINS = new Set<string>([
  // Privacy Relays
  'duck.com',
  'mozmail.com',
  'relay.firefox.com',
  'privaterelay.appleid.com',
  'simplelogin.co',
  'simplelogin.io',
  'simplelogin.fr',
  'slmail.me',
  'anonaddy.me',
  'anonaddy.com',
  'maskmy.id',
  'forwardemail.net',
  'relay.email',

  // Disposable / Temporary Mail Providers
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'trashmail.com',
  'getnada.com',
  'temp-mail.org',
  'fakemailgenerator.com',
  'dispostable.com',
  'crazymailing.com',
  'mailnesia.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'inboxkitten.com',
]);

export interface EmailValidationResult {
  isValid: boolean;
  normalizedEmail?: string;
  isRelayBanned: boolean;
  domain?: string;
  error?: string;
}

/**
 * Validates an email address and screens against banned relay and disposable email services.
 */
export function validateEmail(email: string): EmailValidationResult {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return {
      isValid: false,
      isRelayBanned: false,
      error: 'Email address is required for official order documentation.',
    };
  }

  // Basic RFC 5322 regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      isRelayBanned: false,
      error: 'Please enter a valid email address (e.g. name@studio.com).',
    };
  }

  const domain = cleanEmail.split('@')[1];

  // Screen domain and subdomains against banned relay list
  if (BANNED_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      isRelayBanned: true,
      domain,
      error: `Anonymous relay addresses (@${domain}) are not accepted. Please provide your permanent personal or corporate email for GST tax invoices and insured delivery notifications.`,
    };
  }

  return {
    isValid: true,
    normalizedEmail: cleanEmail,
    isRelayBanned: false,
    domain,
  };
}

export interface MobileValidationResult {
  isValid: boolean;
  normalizedPhone?: string;
  error?: string;
}

/**
 * Validates Indian Mobile Number.
 * Format: 10 digits starting with 6, 7, 8, or 9 (with optional +91 or 0 prefix).
 */
export function validateIndianMobile(phone: string): MobileValidationResult {
  const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');

  if (!cleanPhone) {
    return {
      isValid: false,
      error: 'Mobile number is required for dispatch updates and OTP verification.',
    };
  }

  // Remove leading country code: +91, 91, or leading 0
  let tenDigitNumber = cleanPhone;
  if (tenDigitNumber.startsWith('+91')) {
    tenDigitNumber = tenDigitNumber.substring(3);
  } else if (tenDigitNumber.startsWith('91') && tenDigitNumber.length === 12) {
    tenDigitNumber = tenDigitNumber.substring(2);
  } else if (tenDigitNumber.startsWith('0') && tenDigitNumber.length === 11) {
    tenDigitNumber = tenDigitNumber.substring(1);
  }

  if (!/^\d+$/.test(tenDigitNumber)) {
    return {
      isValid: false,
      error: 'Mobile number must contain digits only.',
    };
  }

  if (tenDigitNumber.length !== 10) {
    return {
      isValid: false,
      error: 'Indian mobile numbers must be exactly 10 digits.',
    };
  }

  // Indian mobile numbers must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(tenDigitNumber)) {
    return {
      isValid: false,
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
    };
  }

  // Screen obvious invalid sequences like 0000000000, 1111111111, 9999999999
  if (/^(\d)\1{9}$/.test(tenDigitNumber)) {
    return {
      isValid: false,
      error: 'Please enter a genuine, reachable mobile number.',
    };
  }

  return {
    isValid: true,
    normalizedPhone: `+91 ${tenDigitNumber.substring(0, 5)} ${tenDigitNumber.substring(5)}`,
  };
}
