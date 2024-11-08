// app/api/projects/route.ts
import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";
import { populateRecurringTasks } from "@/lib/utils";
import { Project } from "@/components/multi-project-board";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    // Fetch all projects
    const projects = await db
      .collection<Project>("projects")
      .find({})
      .toArray();

    // Populate recurring tasks for each project
    projects.forEach((project) => populateRecurringTasks(project));

    // Save any modified projects back to the database
    await Promise.all(
      projects.map(async (project) => {
        await db.collection("projects").updateOne(
          { _id: new ObjectId(project._id) },
          {
            $set: {
              tasks: project.tasks,
              recurringTasks: project.recurringTasks,
            },
          }
        );
      })
    );

    // Return updated projects
    return NextResponse.json(projects);
  } catch {
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
    const { name } = await req.json();
    const newProject = {
      name,
      tasks: [],
      streak: 0,
      lastCompletionDate: null,
      showCompleted: false,
    };

    const result = await db.collection("projects").insertOne(newProject);
    const insertedProject = await db
      .collection("projects")
      .findOne({ _id: result.insertedId });
    return NextResponse.json(insertedProject, { status: 201 });
  } catch {
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
