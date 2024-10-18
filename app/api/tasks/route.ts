// app/api/tasks/route.ts
import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongo";

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projectId, title } = await req.json();
    console.log("projectId", projectId);
    const newTask = {
      id: new ObjectId().toString(),
      title,
      completed: false,
      completedAt: null,
    };

    const result = await db
      .collection("projects")
      .updateOne(
        { _id: new ObjectId(projectId) },
        { $push: { tasks: newTask } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
  }
}

// export async function PUT(req: Request) {
//   const client = await clientPromise;
//   const db = client.db("onepercent");

//   try {
//     const { projectId, taskId, completed } = await req.json();
//     const update = {
//       "tasks.$.completed": completed,
//       "tasks.$.completedAt": completed ? new Date() : null,
//     };

//     const result = await db
//       .collection("projects")
//       .updateOne(
//         { _id: new ObjectId(projectId), "tasks.id": taskId },
//         { $set: update }
//       );

//     if (result.modifiedCount === 0) {
//       return NextResponse.json(
//         { error: "Task or project not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json({ message: "Task updated successfully" });
//   } catch (error) {
//     console.error("Error completing task:", error);
//     return NextResponse.json(
//       { error: "Failed to update task" },
//       { status: 500 }
//     );
//   }
// }

export async function DELETE(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projectId, taskId } = await req.json();

    const result = await db
      .collection("projects")
      .updateOne(
        { _id: new ObjectId(projectId) },
        { $pull: { tasks: { id: taskId } } }
      );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Task or project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const client = await clientPromise;
  const db = client.db("onepercent");

  try {
    const { projectId, taskId, completed, title } = await req.json();

    // Build the update object based on what fields are provided.
    const update: any = {};
    if (typeof completed === "boolean") {
      update["tasks.$.completed"] = completed;
      update["tasks.$.completedAt"] = completed ? new Date() : null;
    }
    if (title) {
      update["tasks.$.title"] = title;
    }

    const result = await db.collection("projects").updateOne(
      {
        _id: new ObjectId(projectId),
        "tasks.id": taskId,
      },
      {
        $set: update,
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Task or project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
