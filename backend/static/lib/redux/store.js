import { configureStore } from "@reduxjs/toolkit";
import resumeReducer from "lib/redux/resumeSlice";
import settingsReducer from "lib/redux/settingsSlice";

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    settings: settingsReducer,
  },
});

// Removed TypeScript type annotations
export const selectState = () => store.getState();
export const dispatch = () => store.dispatch;
