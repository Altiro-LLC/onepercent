// app/api/projects/route.ts
import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";
import { calculateProjectHealth, populateRecurringTasks } from "@/lib/utils";
import { Project } from "@/components/multi-project-board";

export async function GET(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    // Parse query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Fetch projects belonging to the user
    const projects = await db
      .collection<Project>("projects")
      .find({ userId })
      .toArray();

    // Populate recurring tasks for each project and calculate health
    projects.forEach((project) => {
      populateRecurringTasks(project);
      project.projectHealth = calculateProjectHealth(project); // Add health metric
    });

    // Save any modified projects back to the database
    await Promise.all(
      projects.map(async (project) => {
        await db.collection("projects").updateOne(
          { _id: new ObjectId(project._id) },
          {
            $set: {
              tasks: project.tasks,
              recurringTasks: project.recurringTasks,
              projectHealth: project.projectHealth,
            },
          }
        );
      })
    );

    // Return updated projects
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { name, userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 }
      );
    }

    const newProject = {
      name,
      userId,
      tasks: [],
      streak: 0,
      lastCompletionDate: null,
      showCompleted: false,
      goals: [],
      backlog: [],
    };

    const result = await db.collection("projects").insertOne(newProject);
    const insertedProject = await db
      .collection("projects")
      .findOne({ _id: result.insertedId });
    return NextResponse.json(insertedProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { id } = await req.json();
    await db.collection("projects").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Project deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
