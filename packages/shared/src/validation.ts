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

/**
 * Strong Password Policy (8-15 chars, uppercase, lowercase, digit, allowed symbols)
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 15;
export const PASSWORD_ALLOWED_SYMBOLS = '!@#$%^&*_-+=?.,:;';

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    symbol: boolean;
    allowedCharsOnly: boolean;
  };
}

export function validateStrongPassword(password: string): PasswordValidationResult {
  const hasWhitespace = /\s/.test(password);
  const lengthOk =
    password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*_\-+=?.,:;]/.test(password);
  const allowedCharsOnly = !hasWhitespace && /^[A-Za-z0-9!@#$%^&*_\-+=?.,:;]*$/.test(password);

  const checks = {
    length: lengthOk,
    lowercase: hasLower,
    uppercase: hasUpper,
    number: hasNumber,
    symbol: hasSymbol,
    allowedCharsOnly,
  };

  if (!password) {
    return { isValid: false, error: 'Password is required.', checks };
  }
  if (!allowedCharsOnly) {
    return {
      isValid: false,
      error: `Spaces are not allowed. Use letters, numbers, and allowed symbols (${PASSWORD_ALLOWED_SYMBOLS}).`,
      checks,
    };
  }
  if (!lengthOk) {
    return {
      isValid: false,
      error: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.`,
      checks,
    };
  }
  if (!hasLower || !hasUpper || !hasNumber || !hasSymbol) {
    return {
      isValid: false,
      error: `Password must include uppercase, lowercase, a number, and an allowed symbol (${PASSWORD_ALLOWED_SYMBOLS}).`,
      checks,
    };
  }

  return { isValid: true, checks };
}

/**
 * Indian GSTIN Validation (15 chars: State Code + Valid PAN + Entity + Z + Mod-36 Check Digit)
 */
const VALID_GST_STATE_CODES = new Set<string>([
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
  '31', '32', '33', '34', '35', '36', '37', '38', '97', '99',
]);

const VALID_PAN_ENTITY_TYPES = new Set<string>(['A', 'B', 'C', 'F', 'G', 'H', 'J', 'L', 'P', 'T']);
const GSTIN_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface GstinValidationResult {
  isValid: boolean;
  normalizedGstin: string | null;
  error?: string;
}

export function computeGstinCheckDigit(prefix14: string): string {
  const clean = prefix14.toUpperCase();
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const codePoint = GSTIN_CHARSET.indexOf(clean[i]);
    if (codePoint < 0) return '';
    const factor = i % 2 === 0 ? 1 : 2;
    const product = codePoint * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const checkIndex = (36 - (sum % 36)) % 36;
  return GSTIN_CHARSET[checkIndex] || '';
}

export function validateGstin(raw: string | undefined | null): GstinValidationResult {
  const clean = (raw || '').trim().toUpperCase();
  if (!clean) {
    return { isValid: true, normalizedGstin: null };
  }

  if (clean.length !== 15) {
    return {
      isValid: false,
      normalizedGstin: null,
      error: 'GSTIN must be exactly 15 characters (e.g. 27AAACT2727Q1ZW).',
    };
  }

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(clean)) {
    return {
      isValid: false,
      normalizedGstin: null,
      error: 'Invalid GSTIN structure. Expected 2-digit state code, 10-char PAN, entity code, Z, and check digit.',
    };
  }

  const stateCode = clean.slice(0, 2);
  if (!VALID_GST_STATE_CODES.has(stateCode)) {
    return {
      isValid: false,
      normalizedGstin: null,
      error: `Invalid GST state code "${stateCode}". Please check the first two digits.`,
    };
  }

  const panEntityChar = clean[5];
  if (!VALID_PAN_ENTITY_TYPES.has(panEntityChar)) {
    return {
      isValid: false,
      normalizedGstin: null,
      error: 'Embedded PAN within GSTIN has an unrecognized taxpayer entity type (6th character).',
    };
  }

  if (/^(.)\1+$/.test(clean.slice(2, 12))) {
    return {
      isValid: false,
      normalizedGstin: null,
      error: 'Please enter a genuine registered GSTIN.',
    };
  }

  const expectedCheckDigit = computeGstinCheckDigit(clean.slice(0, 14));
  if (!expectedCheckDigit || clean[14] !== expectedCheckDigit) {
    return {
      isValid: false,
      normalizedGstin: null,
      error: 'GSTIN check digit (15th character) is invalid. Please verify against your GST registration certificate.',
    };
  }

  return { isValid: true, normalizedGstin: clean };
}


