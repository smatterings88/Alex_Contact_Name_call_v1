export function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    
    const digits = phoneNumber.toString().trim().replace(/\D/g, '');
    
    if (digits.startsWith('63')) {
        return `+${digits}`;
    }
    
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    
    if (digits.length >= 11) {
        if (digits.startsWith('1') || digits.startsWith('63')) {
            return `+${digits}`;
        }
    }
    
    return null;
}

export function formatPhoneNumberForTagging(phoneNumber) {
    if (!phoneNumber) return null;
    
    const cleanNumber = phoneNumber.toString().trim();
    
    return cleanNumber.startsWith('+') 
        ? cleanNumber.substring(1) 
        : cleanNumber.replace(/\D/g, '');
}