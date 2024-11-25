// File: pages/api/projects/[id]/addGoal.js

import clientPromise from "@/lib/mongo";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // Generate unique IDs for recurring tasks
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projectId, title, description, target, unit } = await req.json();

    if (!projectId || !title || !description || !target || !unit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique goal ID
    const goalId = `goal_${uuidv4()}`;

    const newGoal = {
      id: goalId,
      title,
      description,
      target,
      progress: 0, // Initialize progress
      unit,
      status: "in-progress", // Default status
      recurringTasks: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      completedAt: null,
    };

    // Update the project document, creating the `goals` array if it doesn't exist
    const updateResult = await db.collection("projects").updateOne(
      { _id: new ObjectId(projectId) },
      {
        $setOnInsert: { goals: [] }, // Initialize `goals` if not present
        // @ts-expect-error - TypeScript doesn't recognize the $push operator
        $push: { goals: newGoal }, // Add the new goal
      },
      { upsert: true } // Create the project if it doesn't exist (optional)
    );

    if (updateResult.modifiedCount === 0 && updateResult.upsertedCount === 0) {
      return NextResponse.json(
        { error: "Failed to add goal" },
        { status: 500 }
      );
    }

    // Return the newly created goal
    return NextResponse.json(
      { message: "Goal added successfully", goal: newGoal },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding goal:", error);
    return NextResponse.json({ error: "Failed to add goal" }, { status: 500 });
  }
}
