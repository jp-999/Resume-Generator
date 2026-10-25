/**
 * Common feature detection functions for resume parsing
 */

/**
 * Check if text is bold
 */
export const isBold = (item) => {
  return Boolean(
    item.fontName && 
    (item.fontName.toLowerCase().includes("bold") || 
     item.fontName.includes("Heavy") || 
     item.fontName.includes("Black"))
  );
};

/**
 * Check if text has a number
 */
export const hasNumber = (item) => {
  return /[0-9]/.test(item.text);
};

/**
 * Check if text has a comma
 */
export const hasComma = (item) => {
  return item.text.includes(",");
};

/**
 * Check if text has a letter
 */
export const hasLetter = (item) => {
  return /[a-zA-Z]/.test(item.text);
};

/**
 * Check if text has a letter and all characters are uppercase
 */
export const hasLetterAndIsAllUpperCase = (item) => {
  return (
    /[a-zA-Z]/.test(item.text) &&
    item.text === item.text.toUpperCase() &&
    item.text.length > 1
  );
};

/**
 * Check if text has only letters, spaces, and ampersands
 */
export const hasOnlyLettersSpacesAmpersands = (item) => {
  return /^[a-zA-Z\s&]+$/.test(item.text);
};

/**
 * Create a function to check if text contains specified content
 */
export const getHasText = (textToInclude) => (item) => {
  return (
    textToInclude &&
    item.text.toLowerCase().includes(textToInclude.toLowerCase())
  );
};

/**
 * Date feature sets to identify dates in resume
 * 
 * - Date patterns to match:
 *   - MM/YYYY or MM/YY
 *   - YYYY - YYYY or YYYY-Present
 *   - Month YYYY - Month YYYY or Month YYYY - Present
 */
export const DATE_FEATURE_SETS = [
  // Match MM/YYYY or MM/YY
  [(item) => Boolean(item.text.match(/\d{1,2}\/\d{2}(?:\d{2})?/)), 2, true],
  
  // Match YYYY - YYYY or YYYY-Present
  [(item) => Boolean(item.text.match(/\d{4}\s*[-–—]\s*(?:\d{4}|Present|present|Current|current|now|Now)/)), 3, true],
  
  // Match Month YYYY - Month YYYY or Month YYYY - Present
  [(item) => Boolean(item.text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–—]\s*(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|Present|present|Current|current|now|Now)/i)), 4, true],
  
  // Match Month YYYY (single date)
  [(item) => Boolean(item.text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/i)), 2, true],
  
  // Negative indicators - not likely to be a date
  [isBold, -1],
  [(item) => item.text.length > 30, -2],
];
