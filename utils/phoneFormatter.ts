/**
 * Format phone number for display: (xxx) xxx-xxxx
 * Only formats for display, doesn't change the actual number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // Format based on length
  if (digits.length === 10) {
    // US format: (xxx) xxx-xxxx
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === "1") {
    // US with country code: remove the 1, format as (xxx) xxx-xxxx
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else if (digits.length > 11) {
    // International or long number: show first 3, last 4
    return `(${digits.slice(0, 3)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
  }
  
  // If it doesn't match standard formats, return as is
  return phone;
}

/**
 * Get display name for a phone number (friendly name or formatted number)
 */
export function getDisplayName(phone: string, friendlyNames: Record<string, string>): string {
  if (friendlyNames[phone]) {
    return friendlyNames[phone];
  }
  return formatPhoneNumber(phone);
}

