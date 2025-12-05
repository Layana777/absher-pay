/**
 * Card Utilities
 * Helper functions for card validation and type detection
 */

/**
 * Detects card type based on card number BIN ranges
 * @param {string} cardNumber - Card number (with or without spaces)
 * @returns {string} Card type (mada, visa, mastercard, or unknown)
 */
export const detectCardType = (cardNumber) => {
  if (!cardNumber) return 'mada'; // Default fallback

  const cleaned = cardNumber.replace(/\s/g, '');
  const firstDigits = cleaned.substring(0, 6);

  // Mada BIN ranges (Saudi Arabia domestic cards)
  // These are the official Mada BIN ranges as of 2024
  const madaBins = [
    '440647', '440795', '446404', '457865', '468540', '468541',
    '468542', '468543', '484783', '588848', '588850', '588851',
    '588982', '589005', '604906', '636120', '968201', '968202',
    '968203', '968204', '968205', '968206', '968207', '968208',
    '968209', '968210', '968211'
  ];

  // Check if card starts with any Mada BIN
  if (madaBins.some(bin => firstDigits.startsWith(bin))) {
    return 'mada';
  }

  // Visa: starts with 4
  if (cleaned.startsWith('4')) {
    return 'visa';
  }

  // Mastercard: starts with 51-55 or 2221-2720
  const firstTwo = cleaned.substring(0, 2);
  const firstFour = cleaned.substring(0, 4);

  if (parseInt(firstTwo) >= 51 && parseInt(firstTwo) <= 55) {
    return 'mastercard';
  }

  if (parseInt(firstFour) >= 2221 && parseInt(firstFour) <= 2720) {
    return 'mastercard';
  }

  // American Express: starts with 34 or 37
  if (firstTwo === '34' || firstTwo === '37') {
    return 'amex';
  }

  // Default to mada for Saudi cards (most common in Saudi Arabia)
  return 'mada';
};

/**
 * Validates card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber) return false;

  const cleaned = cardNumber.replace(/\s/g, '');

  // Check if only digits
  if (!/^\d+$/.test(cleaned)) return false;

  // Check length (13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Formats card number with spaces (4 digits groups)
 * @param {string} cardNumber - Card number to format
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';

  const cleaned = cardNumber.replace(/\s/g, '');
  const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
  return formatted;
};

/**
 * Gets the last 4 digits of a card number
 * @param {string} cardNumber - Card number (with or without spaces)
 * @returns {string} Last 4 digits
 */
export const getLastFourDigits = (cardNumber) => {
  if (!cardNumber) return '****';

  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.slice(-4) || '****';
};

/**
 * Masks card number, showing only last 4 digits
 * @param {string} cardNumber - Card number to mask
 * @returns {string} Masked card number (•••• •••• •••• 1234)
 */
export const maskCardNumber = (cardNumber) => {
  if (!cardNumber) return '•••• •••• •••• ••••';

  const lastFour = getLastFourDigits(cardNumber);
  return `•••• •••• •••• ${lastFour}`;
};
