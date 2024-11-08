import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";
import { Project } from "../multi-project-board";

const StaleTasksButton = ({ projects }: { projects: Project[] }) => {
  const staleTasks = projects.flatMap((project) =>
    project.tasks
      .filter((task) => {
        const now = new Date();
        const lastUpdate = task.lastUpdated
          ? new Date(task.lastUpdated)
          : new Date(task.createdAt);
        const differenceInTime = now.getTime() - lastUpdate.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        return differenceInDays > 5 && !task.completed;
      })
      .map((task) => ({
        ...task,
        projectName: project.name,
      }))
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
          Stale Tasks ({staleTasks.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Stale Tasks</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
          {staleTasks.length > 0 ? (
            <div className="space-y-4">
              {staleTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border bg-background hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Project: {task.projectName}
                  </div>
                  <div className="text-sm text-red-500 mt-1">
                    Last updated:{" "}
                    {new Date(
                      task.lastUpdated || task.createdAt
                    ).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              No stale tasks found
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StaleTasksButton;
