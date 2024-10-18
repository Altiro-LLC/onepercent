// app/api/projects/route.ts
import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const projects = await db.collection("projects").find({}).toArray();
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
