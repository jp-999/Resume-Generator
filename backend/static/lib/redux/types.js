export const initialProfile = {
  name: "",
  email: "",
  phone: "",
  url: "",
  summary: "",
  location: "",
};

export const initialWorkExperience = {
  company: "",
  jobTitle: "",
  date: "",
  descriptions: [],
};

export const initialEducation = {
  school: "",
  degree: "",
  date: "",
  gpa: "",
  descriptions: [],
};

export const initialProject = {
  project: "",
  date: "",
  descriptions: [],
};

export const initialFeaturedSkill = { skill: "", rating: 4 };
export const initialFeaturedSkills = Array(6).fill({
  ...initialFeaturedSkill,
});
export const initialSkills = {
  featuredSkills: initialFeaturedSkills,
  descriptions: [],
};

export const initialCustom = {
  descriptions: [],
};

export const initialResumeState = {
  profile: initialProfile,
  workExperiences: [initialWorkExperience],
  educations: [initialEducation],
  projects: [initialProject],
  skills: initialSkills,
  custom: initialCustom,
};

// ResumeKey can be represented as a string in JavaScript
export const ResumeKey = Object.keys(initialResumeState);
