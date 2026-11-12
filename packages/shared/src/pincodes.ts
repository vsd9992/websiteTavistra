import { CANDIDATE_PINCODE_MAP } from './pincodeData';
import { resolveShippingZone, ShippingZoneCode } from './shipping';

export interface PincodeLookupResult {
  pincode: string;
  isServiceable: boolean;
  city: string;
  state: string;
  locality?: string;
  zoneCode: ShippingZoneCode;
  unserviceableReason?: string;
}

/**
 * Standard Indian Postal Prefix Directory
 * Maps 2-digit and 3-digit postal sorting prefixes to representative Urban City and State.
 */
interface PrefixInfo {
  city: string;
  state: string;
  isServiceable: boolean;
  reason?: string;
}

const POSTAL_PREFIX_DIRECTORY: Record<string, PrefixInfo> = {
  // Delhi NCR (Zone A)
  '11': { city: 'New Delhi', state: 'Delhi', isServiceable: true },
  '121': { city: 'Faridabad', state: 'Haryana', isServiceable: true },
  '122': { city: 'Gurugram', state: 'Haryana', isServiceable: true },
  '201': { city: 'Noida', state: 'Uttar Pradesh', isServiceable: true },

  // Haryana & Punjab (Zone B)
  '12': { city: 'Rohtak', state: 'Haryana', isServiceable: true },
  '13': { city: 'Panipat', state: 'Haryana', isServiceable: true },
  '134': { city: 'Panchkula', state: 'Haryana', isServiceable: true },
  '14': { city: 'Ludhiana', state: 'Punjab', isServiceable: true },
  '140': { city: 'Mohali', state: 'Punjab', isServiceable: true },
  '144': { city: 'Jalandhar', state: 'Punjab', isServiceable: true },
  '143': { city: 'Amritsar', state: 'Punjab', isServiceable: true },
  '15': { city: 'Bathinda', state: 'Punjab', isServiceable: true },
  '16': { city: 'Chandigarh', state: 'Chandigarh', isServiceable: true },
  '17': { city: 'Shimla', state: 'Himachal Pradesh', isServiceable: true },

  // J&K
  '18': { city: 'Jammu', state: 'Jammu & Kashmir', isServiceable: true },
  '19': { city: 'Srinagar', state: 'Jammu & Kashmir', isServiceable: true },
  // Ladakh (Unserviceable due to extreme high altitude & lack of fragile pallet routes)
  '194': {
    city: 'Leh',
    state: 'Ladakh',
    isServiceable: false,
    reason: 'Remote high-altitude terrain; insured fragile crating carriage is currently unavailable.',
  },

  // Uttar Pradesh & Uttarakhand (Zone B)
  '20': { city: 'Aligarh', state: 'Uttar Pradesh', isServiceable: true },
  '208': { city: 'Kanpur', state: 'Uttar Pradesh', isServiceable: true },
  '21': { city: 'Prayagraj', state: 'Uttar Pradesh', isServiceable: true },
  '22': { city: 'Varanasi', state: 'Uttar Pradesh', isServiceable: true },
  '226': { city: 'Lucknow', state: 'Uttar Pradesh', isServiceable: true },
  '24': { city: 'Moradabad', state: 'Uttar Pradesh', isServiceable: true },
  '248': { city: 'Dehradun', state: 'Uttarakhand', isServiceable: true },
  '249': { city: 'Haridwar', state: 'Uttarakhand', isServiceable: true },
  '25': { city: 'Meerut', state: 'Uttar Pradesh', isServiceable: true },
  '26': { city: 'Bareilly', state: 'Uttar Pradesh', isServiceable: true },
  '27': { city: 'Gorakhpur', state: 'Uttar Pradesh', isServiceable: true },
  '28': { city: 'Agra', state: 'Uttar Pradesh', isServiceable: true },

  // Rajasthan (Zone B)
  '30': { city: 'Jaipur', state: 'Rajasthan', isServiceable: true },
  '31': { city: 'Udaipur', state: 'Rajasthan', isServiceable: true },
  '32': { city: 'Kota', state: 'Rajasthan', isServiceable: true },
  '34': { city: 'Jodhpur', state: 'Rajasthan', isServiceable: true },

  // Gujarat (Zone C / D)
  '36': { city: 'Rajkot', state: 'Gujarat', isServiceable: true },
  '38': { city: 'Ahmedabad', state: 'Gujarat', isServiceable: true },
  '390': { city: 'Vadodara', state: 'Gujarat', isServiceable: true },
  '395': { city: 'Surat', state: 'Gujarat', isServiceable: true },

  // Maharashtra (Zone C / D)
  '40': { city: 'Mumbai', state: 'Maharashtra', isServiceable: true },
  '41': { city: 'Pune', state: 'Maharashtra', isServiceable: true },
  '42': { city: 'Nashik', state: 'Maharashtra', isServiceable: true },
  '43': { city: 'Aurangabad', state: 'Maharashtra', isServiceable: true },
  '44': { city: 'Nagpur', state: 'Maharashtra', isServiceable: true },

  // Madhya Pradesh & Chhattisgarh
  '45': { city: 'Indore', state: 'Madhya Pradesh', isServiceable: true },
  '46': { city: 'Bhopal', state: 'Madhya Pradesh', isServiceable: true },
  '47': { city: 'Gwalior', state: 'Madhya Pradesh', isServiceable: true },
  '48': { city: 'Jabalpur', state: 'Madhya Pradesh', isServiceable: true },
  '49': { city: 'Raipur', state: 'Chhattisgarh', isServiceable: true },

  // Andhra Pradesh & Telangana
  '50': { city: 'Hyderabad', state: 'Telangana', isServiceable: true },
  '51': { city: 'Tirupati', state: 'Andhra Pradesh', isServiceable: true },
  '52': { city: 'Vijayawada', state: 'Andhra Pradesh', isServiceable: true },
  '53': { city: 'Visakhapatnam', state: 'Andhra Pradesh', isServiceable: true },

  // Karnataka
  '56': { city: 'Bengaluru', state: 'Karnataka', isServiceable: true },
  '57': { city: 'Mangaluru', state: 'Karnataka', isServiceable: true },
  '58': { city: 'Hubballi', state: 'Karnataka', isServiceable: true },
  '59': { city: 'Belagavi', state: 'Karnataka', isServiceable: true },

  // Tamil Nadu & Kerala
  '60': { city: 'Chennai', state: 'Tamil Nadu', isServiceable: true },
  '61': { city: 'Tiruchirappalli', state: 'Tamil Nadu', isServiceable: true },
  '62': { city: 'Madurai', state: 'Tamil Nadu', isServiceable: true },
  '63': { city: 'Salem', state: 'Tamil Nadu', isServiceable: true },
  '64': { city: 'Coimbatore', state: 'Tamil Nadu', isServiceable: true },
  '67': { city: 'Kozhikode', state: 'Kerala', isServiceable: true },
  '68': { city: 'Kochi', state: 'Kerala', isServiceable: true },
  '69': { city: 'Thiruvananthapuram', state: 'Kerala', isServiceable: true },

  // West Bengal, Odisha, Bihar, Assam
  '70': { city: 'Kolkata', state: 'West Bengal', isServiceable: true },
  '71': { city: 'Howrah', state: 'West Bengal', isServiceable: true },
  '73': { city: 'Siliguri', state: 'West Bengal', isServiceable: true },
  '75': { city: 'Bhubaneswar', state: 'Odisha', isServiceable: true },
  '78': { city: 'Guwahati', state: 'Assam', isServiceable: true },
  '80': { city: 'Patna', state: 'Bihar', isServiceable: true },
  '83': { city: 'Ranchi', state: 'Jharkhand', isServiceable: true },

  // Excluded Islands & Inaccessible Regions
  '744': {
    city: 'Port Blair',
    state: 'Andaman & Nicobar Islands',
    isServiceable: false,
    reason: 'Island maritime territory; fragile furniture and crated freight carriage is not available.',
  },
  '6825': {
    city: 'Kavaratti',
    state: 'Lakshadweep',
    isServiceable: false,
    reason: 'Island maritime territory; fragile furniture carriage is not available.',
  },
};

/**
 * Authoritative PIN code serviceability and City/State lookup function.
 * Matches 6-digit Indian PIN codes against the 884-candidate urban database,
 * followed by standard postal prefix resolution.
 */
export function lookupPincode(pincode: string): PincodeLookupResult {
  const cleanPin = pincode.replace(/\s+/g, '');
  const zoneCode = resolveShippingZone(cleanPin);

  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      isServiceable: false,
      city: '',
      state: '',
      zoneCode: 'ZONE_D',
      unserviceableReason: 'Please enter a valid 6-digit Indian postal PIN code.',
    };
  }

  // 1. Check exact match in the 884-candidate urban directory
  const exact = CANDIDATE_PINCODE_MAP[cleanPin];
  if (exact) {
    return {
      pincode: cleanPin,
      isServiceable: exact.isServiceable,
      city: exact.city,
      state: exact.state,
      locality: exact.locality,
      zoneCode,
    };
  }

  // 2. Check prefix directory for region/state metadata only (strict 6-digit whitelist policy: no blanket prefix enablement)
  const p4 = cleanPin.substring(0, 4);
  const p3 = cleanPin.substring(0, 3);
  const p2 = cleanPin.substring(0, 2);

  const prefixMatch =
    POSTAL_PREFIX_DIRECTORY[p4] ||
    POSTAL_PREFIX_DIRECTORY[p3] ||
    POSTAL_PREFIX_DIRECTORY[p2];

  if (prefixMatch) {
    return {
      pincode: cleanPin,
      isServiceable: false,
      city: prefixMatch.city,
      state: prefixMatch.state,
      zoneCode,
      unserviceableReason: !prefixMatch.isServiceable
        ? prefixMatch.reason ||
          `We cannot deliver to PIN code ${cleanPin}. This destination is currently not serviceable for insured fragile consignments.`
        : `PIN code ${cleanPin} (${prefixMatch.state}) is not currently in our verified 6-digit delivery directory.`,
    };
  }

  // 3. Fallback: Any unknown prefix (e.g. 0xxxxx, 9xxxxx army post offices, or non-existent prefixes)
  return {
    pincode: cleanPin,
    isServiceable: false,
    city: '',
    state: '',
    zoneCode: 'ZONE_D',
    unserviceableReason: `PIN code ${cleanPin} is not in our verified delivery directory.`,
  };
}

