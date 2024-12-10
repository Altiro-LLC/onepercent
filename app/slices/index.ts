import { combineReducers } from "@reduxjs/toolkit";
import projectSlice from "./projectSlice";

const rootReducer = combineReducers({
  projectSlice: projectSlice,
});

export default rootReducer;
