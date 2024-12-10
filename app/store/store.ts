// app/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "../slices/projectSlice";

const store = configureStore({
  reducer: {
    projects: projectReducer, // Consistent naming
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
