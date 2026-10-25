/**
 * Feature scoring system to identify resume attributes
 */

/**
 * Get text with the highest feature score based on feature sets
 * 
 * @param {Array} textItems - List of text items to evaluate
 * @param {Array} featureSets - List of feature sets, each containing a feature function, score, and optional matchGroup
 * @param {boolean} requireMatch - Whether to require at least one positive feature match
 * @param {boolean} includeTies - Whether to include items with tie scores
 * @returns {Array} - The text with the highest score and the scores for debugging
 */
export const getTextWithHighestFeatureScore = (
  textItems,
  featureSets,
  requireMatch = true,
  includeTies = false
) => {
  // Calculate scores for each text item
  const itemsWithScores = textItems.map((item) => {
    let score = 0;
    const matches = {};

    // Apply each feature set to calculate the score
    for (const featureSet of featureSets) {
      const [featureFunc, featureScore, shouldExtract = false] = featureSet;
      const match = featureFunc(item);

      if (match) {
        score += featureScore;
        
        // If this feature should extract text based on regex match
        if (shouldExtract && match instanceof Array && match.length > 0) {
          matches[featureFunc.name] = match[0];
        }
      }
    }

    return { item, score, matches };
  });

  // Sort by score in descending order
  const sortedItems = [...itemsWithScores].sort((a, b) => b.score - a.score);

  // Filter items that have at least one positive feature match
  const filteredItems = requireMatch
    ? sortedItems.filter((item) => {
        return featureSets.some(([featureFunc, featureScore]) => {
          return featureScore > 0 && featureFunc(item.item);
        });
      })
    : sortedItems;

  // If no items match, return default values
  if (filteredItems.length === 0) {
    return ["", []];
  }

  // Get items with highest score
  const highestScore = filteredItems[0].score;
  const highestScoringItems = filteredItems.filter(
    (item) => item.score === highestScore
  );

  // If including ties or there's only one highest-scoring item
  if (includeTies || highestScoringItems.length === 1) {
    // Get all texts with highest score
    const texts = highestScoringItems.map((item) => {
      const matchKeys = Object.keys(item.matches);
      if (matchKeys.length > 0) {
        // Use matched text from regex if available
        return item.matches[matchKeys[0]].trim();
      }
      return item.item.text.trim();
    });

    return [texts.join(" "), sortedItems.map((item) => [item.item.text, item.score])];
  }

  // Use matched text from regex if available, otherwise use full text
  const topItem = highestScoringItems[0];
  const matchKeys = Object.keys(topItem.matches);
  const resultText = matchKeys.length > 0
    ? topItem.matches[matchKeys[0]].trim()
    : topItem.item.text.trim();

  return [resultText, sortedItems.map((item) => [item.item.text, item.score])];
};
