export const TextItem = {
  text: '',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  fontName: '',
  hasEOL: false,
};

export const TextItems = [];

export const Line = [];
export const Lines = [];

export const ResumeSectionToLines = {};

// FeatureScore can be represented as a number in JavaScript
export const FeatureScore = {
  NEGATIVE_4: -4,
  NEGATIVE_3: -3,
  NEGATIVE_2: -2,
  NEGATIVE_1: -1,
  ZERO: 0,
  POSITIVE_1: 1,
  POSITIVE_2: 2,
  POSITIVE_3: 3,
  POSITIVE_4: 4,
};

export const ReturnMatchingTextOnly = false;

export const FeatureSet = [
  (item) => true, // Placeholder function
  FeatureScore.ZERO,
];

export const TextScore = {
  text: '',
  score: 0,
  match: false,
};

export const TextScores = [];
