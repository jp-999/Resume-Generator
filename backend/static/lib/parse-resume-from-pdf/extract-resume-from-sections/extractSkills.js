import { deepClone } from "../../../deepClone.js";
import { getSectionLinesByKeywords } from "./lib/get-section-lines.js";
import { getDescriptionsLineIdx, getBulletPointsFromLines } from "./lib/bullet-points.js";

// Initial featured skills mock (originally from redux/resumeSlice)
const initialFeaturedSkills = [];

export const extractSkills = (sections) => {
  const lines = getSectionLinesByKeywords(sections, ["skill"]);

  let descriptions = [];
  const descriptionsLineIdx = getDescriptionsLineIdx(lines);
  if (descriptionsLineIdx !== undefined) {
    const descriptionsLines = lines.slice(descriptionsLineIdx);
    descriptions = getBulletPointsFromLines(descriptionsLines);
  }

  const featuredSkills = deepClone(initialFeaturedSkills);
  // Add skills from descriptions
  for (const description of descriptions) {
    // Prevent duplicated skills by checking if it already exists
    if (!featuredSkills.includes(description)) {
      featuredSkills.push(description);
    }
  }

  return {
    skills: {
      featuredSkills,
    },
    skillsScores: {},
  };
};
