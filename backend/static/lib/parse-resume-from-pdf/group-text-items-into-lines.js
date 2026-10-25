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