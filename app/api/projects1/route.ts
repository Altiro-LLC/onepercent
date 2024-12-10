// app/api/projects1/route.ts
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongo";

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
      .find({ userId, isActive: true })
      .toArray();

    // Populate recurring tasks for each project and calculate health
    // projects.forEach((project) => {
    //   populateRecurringTasks(project);
    //   project.projectHealth = calculateProjectHealth(project); // Add health metric
    // });

    // // Save any modified projects back to the database
    // await Promise.all(
    //   projects.map(async (project) => {
    //     await db.collection("projects").updateOne(
    //       { _id: new ObjectId(project._id) },
    //       {
    //         $set: {
    //           tasks: project.tasks,
    //           recurringTasks: project.recurringTasks,
    //           projectHealth: project.projectHealth,
    //         },
    //       }
    //     );
    //   })
    // );

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
