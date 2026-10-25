import { BULLET_POINTS } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

/**
 * Step 2. Group text items into lines
 *
 * To determine which line a text item belongs to, the algorithm compares the y-position
 * of the text item with the y-position of the previous text item. If the difference is
 * less than the line height, they are considered to be on the same line.
 */
export const groupTextItemsIntoLines = (textItems) => {
  if (textItems.length === 0) {
    return [];
  }

  // Extract line height
  const lineHeights = [];
  for (let i = 1; i < textItems.length; i++) {
    const diff = Math.abs(textItems[i - 1].y - textItems[i].y);
    if (diff > 0) {
      lineHeights.push(diff);
    }
  }
  const lineHeight = Math.min(...lineHeights) * 1.5;

  // Group text items into lines
  const lines = [];
  let line = [textItems[0]];
  let prevY = textItems[0].y;

  for (let i = 1; i < textItems.length; i++) {
    const currY = textItems[i].y;
    const diff = Math.abs(prevY - currY);

    if (diff < lineHeight) {
      // Same line
      line.push(textItems[i]);
    } else {
      // New line
      lines.push([...line].sort((a, b) => a.x - b.x));
      line = [textItems[i]];
      prevY = currY;
    }
  }

  // Add the last line
  if (line.length > 0) {
    lines.push([...line].sort((a, b) => a.x - b.x));
  }

  return lines;
};

// Sometimes a space is lost while merging adjacent text items. This accounts for some of those cases
const shouldAddSpaceBetweenText = (leftText, rightText) => {
  const leftTextEnd = leftText[leftText.length - 1];
  const rightTextStart = rightText[0];
  const conditions = [
    [":", ",", "|", ".", ...BULLET_POINTS].includes(leftTextEnd) &&
      rightTextStart !== " ",
    leftTextEnd !== " " && ["|", ...BULLET_POINTS].includes(rightTextStart),
  ];

  return conditions.some((condition) => condition);
};

/**
 * Return the width of a typical character. (Helper util for groupTextItemsIntoLines)
 *
 * A pdf file uses different characters, each with different width due to different
 * font family and font size. This util first extracts the most typically used font
 * family and font height, and compute the average character width using text items
 * that match the typical font family and height.
 */
const getTypicalCharWidth = (textItems) => {
  // Exclude empty space " " in calculations since its width isn't precise
  textItems = textItems.filter((item) => item.text.trim() !== "");

  const heightToCount = {};
  let commonHeight = 0;
  let heightMaxCount = 0;

  const fontNameToCount = {};
  let commonFontName = "";
  let fontNameMaxCount = 0;

  for (let item of textItems) {
    const { text, height, fontName } = item;
    // Process height
    if (!heightToCount[height]) {
      heightToCount[height] = 0;
    }
    heightToCount[height]++;
    if (heightToCount[height] > heightMaxCount) {
      commonHeight = height;
      heightMaxCount = heightToCount[height];
    }

    // Process font name
    if (!fontNameToCount[fontName]) {
      fontNameToCount[fontName] = 0;
    }
    fontNameToCount[fontName] += text.length;
    if (fontNameToCount[fontName] > fontNameMaxCount) {
      commonFontName = fontName;
      fontNameMaxCount = fontNameToCount[fontName];
    }
  }

  // Find the text items that match common font family and height
  const commonTextItems = textItems.filter(
    (item) => item.fontName === commonFontName && item.height === commonHeight
  );
  // Aggregate total width and number of characters of all common text items
  const [totalWidth, numChars] = commonTextItems.reduce(
    (acc, cur) => {
      const [preWidth, prevChars] = acc;
      return [preWidth + cur.width, prevChars + cur.text.length];
    },
    [0, 0]
  );
  const typicalCharWidth = totalWidth / numChars;

  return typicalCharWidth;
};
