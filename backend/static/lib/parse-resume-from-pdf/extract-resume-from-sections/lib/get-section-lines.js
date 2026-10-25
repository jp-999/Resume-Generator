/**
 * Utility functions for extracting sections from a resume
 */

/**
 * Get section lines by keywords
 * 
 * @param {Object} sections - Object containing section names as keys and lines as values
 * @param {Array} keywords - List of keywords to match section names against
 * @returns {Array} - Lines from matched sections
 */
export const getSectionLinesByKeywords = (sections, keywords) => {
  const sectionNames = Object.keys(sections);
  
  // Find section names that match any of the keywords
  const matchedSectionNames = sectionNames.filter((sectionName) => {
    const sectionNameLower = sectionName.toLowerCase();
    return keywords.some((keyword) => sectionNameLower.includes(keyword.toLowerCase()));
  });
  
  // If no sections matched, return empty array
  if (matchedSectionNames.length === 0) {
    return [];
  }
  
  // Return lines from the first matched section
  const firstMatchedSection = matchedSectionNames[0];
  return sections[firstMatchedSection] || [];
};
