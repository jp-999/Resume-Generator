/**
 * List of bullet points
 * Reference: https://stackoverflow.com/questions/56540160/why-isnt-there-a-medium-small-black-circle-in-unicode
 * U+22C5   DOT OPERATOR (⋅)
 * U+2219   BULLET OPERATOR (∙)
 * U+1F784  BLACK SLIGHTLY SMALL CIRCLE (🞄)
 * U+2022   BULLET (•) -------- most common
 * U+2981   Z NOTATION SPOT (⦁)
 * U+26AB   MEDIUM BLACK CIRCLE (⚫︎)
 * U+25CF   BLACK CIRCLE (●)
 * U+2B24   BLACK LARGE CIRCLE (⬤)
 * U+26AC   MEDIUM SMALL WHITE CIRCLE ⚬
 * U+25CB   WHITE CIRCLE ○
 */
export const BULLET_POINTS = [
  "⋅",
  "∙",
  "🞄",
  "•",
  "⦁",
  "⚫︎",
  "●",
  "⬤",
  "⚬",
  "○",
];

/**
 * Convert bullet point lines into a string array aka descriptions.
 */
export const getBulletPointsFromLines = (lines) => {
  // If no lines, return empty array
  if (lines.length === 0) {
    return [];
  }

  // Initialize with first line
  let descriptions = [];
  let currentDescription = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineText = line
      .map((item) => item.text)
      .join("")
      .trim();

    // Skip empty lines
    if (lineText === "") {
      continue;
    }

    // Check for bullet point at start of line
    const hasBulletPoint = BULLET_POINTS.includes(lineText[0]);

    if (hasBulletPoint) {
      // If we already have a current description, save it before starting a new one
      if (currentDescription) {
        descriptions.push(currentDescription);
      }
      // Start a new description without the bullet point
      currentDescription = lineText.slice(1).trim();
    } else if (i === 0) {
      // First line with no bullet point
      currentDescription = lineText;
    } else {
      // Continuation of current description
      currentDescription += " " + lineText;
    }
  }

  // Add the last description if exists
  if (currentDescription) {
    descriptions.push(currentDescription);
  }

  return descriptions;
};

const getMostCommonBulletPoint = (str) => {
  const bulletToCount = BULLET_POINTS.reduce(
    (acc, cur) => {
      acc[cur] = 0;
      return acc;
    },
    {}
  );
  let bulletWithMostCount = BULLET_POINTS[0];
  let bulletMaxCount = 0;
  for (let char of str) {
    if (bulletToCount.hasOwnProperty(char)) {
      bulletToCount[char]++;
      if (bulletToCount[char] > bulletMaxCount) {
        bulletWithMostCount = char;
        bulletMaxCount = bulletToCount[char];
      }
    }
  }
  return bulletWithMostCount;
};

const getFirstBulletPointLineIdx = (lines) => {
  for (let i = 0; i < lines.length; i++) {
    for (let item of lines[i]) {
      if (BULLET_POINTS.some((bullet) => item.text.includes(bullet))) {
        return i;
      }
    }
  }
  return undefined;
};

// Only consider words that don't contain numbers
const isWord = (str) => /^[^0-9]+$/.test(str);
const hasAtLeast8Words = (item) =>
  item.text.split(/\s/).filter(isWord).length >= 8;

export const getDescriptionsLineIdx = (lines) => {
  // The main heuristic to determine descriptions is to check if has bullet point
  let idx = getFirstBulletPointLineIdx(lines);

  // Fallback heuristic if the main heuristic doesn't apply (e.g. LinkedIn resume) to
  // check if the line has at least 8 words
  if (idx === undefined) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length === 1 && hasAtLeast8Words(line[0])) {
        idx = i;
        break;
      }
    }
  }

  return idx;
};
