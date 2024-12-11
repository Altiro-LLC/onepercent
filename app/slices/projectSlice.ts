/* eslint-disable @typescript-eslint/no-explicit-any */
// app/slices/projectSlice.ts
import { Project } from "@/lib/types";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Initial state
const initialState: {
  projects: Project[];
  status: string;
  error: string | null;
} = {
  projects: [],
  status: "idle",
  error: null,
};

// Async thunk for fetching projects
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (userId: string, thunkAPI: any) => {
    try {
      const response = await fetch(`/api/projects1?userId=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Properly narrow the type of error
        return thunkAPI.rejectWithValue(error.message);
      }
      // Handle unexpected error types
      return thunkAPI.rejectWithValue("An unknown error occurred");
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder: any) => {
    builder
      .addCase(
        fetchProjects.pending,
        (state: { status: string; error: null }) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addCase(
        fetchProjects.fulfilled,
        (
          state: { status: string; projects: any },
          action: PayloadAction<Project[]>
        ) => {
          state.status = "succeeded";
          state.projects = action.payload;
        }
      )
      .addCase(
        fetchProjects.rejected,
        (
          state: { status: string; error: any },
          action: PayloadAction<string | undefined>
        ) => {
          state.status = "failed";
          state.error = action.payload || "An error occurred";
        }
      );
  },
});

export default projectSlice.reducer;
