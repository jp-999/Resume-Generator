import { createSlice } from "@reduxjs/toolkit";
import { loadStateFromLocalStorage, saveStateToLocalStorage } from "lib/redux/local-storage";

export const DEFAULT_THEME_COLOR = "#38bdf8"; // sky-400
export const DEFAULT_FONT_FAMILY = "Roboto";
export const DEFAULT_FONT_SIZE = "11"; // text-base https://tailwindcss.com/docs/font-size
export const DEFAULT_FONT_COLOR = "#171717"; // text-neutral-800

export const initialSettings = {
  themeColor: DEFAULT_THEME_COLOR,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontSize: DEFAULT_FONT_SIZE,
  documentSize: "Letter",
  formToShow: {
    workExperiences: true,
    educations: true,
    projects: true,
    skills: true,
    custom: false,
  },
  formToHeading: {
    workExperiences: "WORK EXPERIENCE",
    educations: "EDUCATION",
    projects: "PROJECT",
    skills: "SKILLS",
    custom: "CUSTOM SECTION",
  },
  formsOrder: ["workExperiences", "educations", "projects", "skills", "custom"],
  showBulletPoints: {
    educations: true,
    projects: true,
    skills: true,
    custom: true,
  },
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState: initialSettings,
  reducers: {
    changeSettings: (draft, action) => {
      const { field, value } = action.payload;
      draft[field] = value;
    },
    changeShowForm: (draft, action) => {
      const { field, value } = action.payload;
      draft.formToShow[field] = value;
    },
    changeFormHeading: (draft, action) => {
      const { field, value } = action.payload;
      draft.formToHeading[field] = value;
    },
    changeFormOrder: (draft, action) => {
      const { form, type } = action.payload;
      const lastIdx = draft.formsOrder.length - 1;
      const pos = draft.formsOrder.indexOf(form);
      const newPos = type === "up" ? pos - 1 : pos + 1;
      const swapFormOrder = (idx1, idx2) => {
        const temp = draft.formsOrder[idx1];
        draft.formsOrder[idx1] = draft.formsOrder[idx2];
        draft.formsOrder[idx2] = temp;
      };
      if (newPos >= 0 && newPos <= lastIdx) {
        swapFormOrder(pos, newPos);
      }
    },
    changeShowBulletPoints: (draft, action) => {
      const { field, value } = action.payload;
      draft.showBulletPoints[field] = value;
    },
    setSettings: (draft, action) => {
      return action.payload;
    },
  },
});

export const {
  changeSettings,
  changeShowForm,
  changeFormHeading,
  changeFormOrder,
  changeShowBulletPoints,
  setSettings,
} = settingsSlice.actions;

export const selectSettings = (state) => state.settings;
export const selectThemeColor = (state) => state.settings.themeColor;

export const selectFormToShow = (state) => state.settings.formToShow;
export const selectShowByForm = (form) => (state) =>
  state.settings.formToShow[form];

export const selectFormToHeading = (state) =>
  state.settings.formToHeading;
export const selectHeadingByForm = (form) => (state) =>
  state.settings.formToHeading[form];

export const selectFormsOrder = (state) => state.settings.formsOrder;
export const selectIsFirstForm = (form) => (state) =>
  state.settings.formsOrder[0] === form;
export const selectIsLastForm = (form) => (state) =>
  state.settings.formsOrder[state.settings.formsOrder.length - 1] === form;

export const selectShowBulletPoints =
  (form) => (state) =>
    state.settings.showBulletPoints[form];

export default settingsSlice.reducer;
