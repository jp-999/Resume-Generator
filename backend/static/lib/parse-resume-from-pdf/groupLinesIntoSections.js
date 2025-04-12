import {
  hasLetterAndIsAllUpperCase,
  hasOnlyLettersSpacesAmpersands,
  isBold,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";

const PROFILE_SECTION = "profile";

/**
 * Step 3. Group lines into sections
 *
 * Every section (except the profile section) starts with a section title that
 * takes up the entire line. This is a common pattern not just in resumes but
 * also in books and blogs. The resume parser uses this pattern to group lines
 * into the closest section title above these lines.
 */
export const groupLinesIntoSections = (lines) => {
  let sections = {};
  let sectionName = PROFILE_SECTION;
  let sectionLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const text = line[0]?.text.trim();
    if (isSectionTitle(line, i)) {
      sections[sectionName] = [...sectionLines];
      sectionName = text;
      sectionLines = [];
    } else {
      sectionLines.push(line);
    }
  }
  if (sectionLines.length > 0) {
    sections[sectionName] = [...sectionLines];
  }
  return sections;
};

const SECTION_TITLE_PRIMARY_KEYWORDS = [
  "experience",
  "education",
  "project",
  "skill",
];
const SECTION_TITLE_SECONDARY_KEYWORDS = [
  "job",
  "course",
  "extracurricular",
  "objective",
  "summary", // LinkedIn generated resume has a summary section
  "award",
  "honor",
  "project",
];
const SECTION_TITLE_KEYWORDS = [
  ...SECTION_TITLE_PRIMARY_KEYWORDS,
  ...SECTION_TITLE_SECONDARY_KEYWORDS,
];

// Check if a line is a section title based on text alone
const isSectionTitleText = (text) => {
  if (text) {
    // If line is less than 50 characters
    return (
      text.length < 50 &&
      // Title should not have bullet point
      !/^[•●]/.test(text) &&
      // Check title format for common title patterns
      (/^(SUMMARY|summary|Summary|EDUCATION|Education|education|EXPERIENCE|Experience|experience|EMPLOYMENT|Employment|employment|SKILL|Skill|skill|HISTORY|History|history|CERTIFICATION|Certification|certification|QUALIFICATION|Qualification|qualification|HONOR|Honor|honor|PROJECT|Project|project|ACHIEVEMENT|Achievement|achievement|INTEREST|Interest|interest|LANGUAGE|Language|language|REFERENCE|Reference|reference|AWARD|Award|award|STRENGTH|Strength|strength|VOLUNTEER|Volunteer|volunteer|OBJECTIVE|Objective|objective|PERSONAL|Personal|personal|CURRICULUM|Curriculum|curriculum|PUBLICATION|Publication|publication|CONFERENCE|Conference|conference|AFFILIATION|Affiliation|affiliation|ENDORSEMENT|Endorsement|endorsement|PATENT|Patent|patent|RECOMMENDATION|Recommendation|recommendation|TESTIMONIAL|Testimonial|testimonial|ASSESSMENT|Assessment|assessment|RECOGNITION|Recognition|recognition|INVOLVEMENT|Involvement|involvement|ACTIVITY|Activity|activity|TRAINING|Training|training|SEMINAR|Seminar|seminar|LEADERSHIP|Leadership|leadership|EXPERTISE|Expertise|expertise|COMPETENCY|Competency|competency|COURSE|Course|course)(\s|$)/ ||
        /^(community|COMMUNITY|ABOUT|About|about)((\s+)me|ME|Me)?$/.test(text) ||
        /^(MY|my|My)(\s+)(EXPERTISE|EDUCATION|BACKGROUND|CAREER|INTEREST|PROFILE|SPECIALITY|COMPETENCY)$/.test(text) ||
        /^(PROFESSIONAL|Professional|professional)(\s+)(BACKGROUND|SUMMARY|PROFILE)$/.test(text) ||
        /^(RELEVANT|Relevant|relevant)(\s+)(EXPERIENCE|QUALIFICATION|SKILL|PROJECT)$/.test(text))
    );
  }
  return false;
};

// Check if a line is a section title
const isSectionTitle = (line, lineIdx) => {
  if (line && line.length === 1) {
    const onlyItem = line[0];

    // Check if it's the first line, since first line is often always name
    if (lineIdx === 0) {
      // Skip name line as section header
      return false;
    }

    // Check text if it seems like a title
    return isSectionTitleText(onlyItem.text);
  }
  return false;
};
