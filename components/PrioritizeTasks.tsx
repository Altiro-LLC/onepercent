import React, { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List } from "lucide-react";
import { Task } from "./multi-project-board";

const SortableItem: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg border bg-background hover:bg-accent transition-colors ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      {children}
    </div>
  );
};

// interface Project {
//   id: string;
//   name: string;
//   priority: number;
// }

interface PrioritizeButtonProps {
  projectId: string;
  tasks: Task[];
  fetchProjects: () => void;
}

const PrioritizeTasks: React.FC<PrioritizeButtonProps> = ({
  projectId,
  tasks,
  fetchProjects,
}) => {
  const [taskList, setTaskList] = useState(tasks);
  const [isModified, setIsModified] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = taskList.findIndex((item) => item.id === active.id);
      const newIndex = taskList.findIndex((item) => item.id === over.id);
      const updatedList = arrayMove(taskList, oldIndex, newIndex);
      setTaskList(updatedList);
      setIsModified(true); // Mark the list as modified
    }
  };
  const handleSave = async () => {
    setSaveStatus("saving"); // Indicate saving process has started
    try {
      const updatedTasks = taskList.map((task, index) => ({
        id: task.id,
        priority: index + 10, // Assign new priorities based on the list order
      }));

      const response = await fetch("/api/backlog/update-priorities", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId: projectId, backlog: updatedTasks }),
      });

      if (response.ok) {
        setSaveStatus("success"); // Indicate success
        setIsModified(false); // Reset the modified state
        setTimeout(() => setSaveStatus("idle"), 3000); // Reset to idle after 3 seconds
      } else {
        setSaveStatus("error"); // Indicate error
      }
    } catch (error) {
      console.error("Failed to save priorities:", error);
      setSaveStatus("error"); // Indicate error
    }
  };

  useEffect(() => {
    // Sort projects by their priority
    const sortedTasksByPriority = tasks.sort((a, b) => a.priority - b.priority);
    setTaskList(sortedTasksByPriority);
  }, [tasks]);

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      fetchProjects(); // Fetch projects when the dialog is closed
    }
  };

  return (
    <Dialog onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <List className="w-4 h-4 mr-2" />
          Prioritize Tasks
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Prioritize Projects</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={taskList}
              strategy={verticalListSortingStrategy}
            >
              {taskList.map((project) => (
                <SortableItem key={project.id} id={project.id}>
                  <div className="font-medium">{project.title}</div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </ScrollArea>
        <Button
          onClick={handleSave}
          disabled={saveStatus === "saving" || !isModified}
          className={`mt-4 ${
            saveStatus === "success"
              ? "bg-green-500 text-white"
              : saveStatus === "error"
              ? "bg-red-500 text-white"
              : "bg-primary"
          }`}
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "success"
            ? "Saved!"
            : saveStatus === "error"
            ? "Error!"
            : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PrioritizeTasks;
