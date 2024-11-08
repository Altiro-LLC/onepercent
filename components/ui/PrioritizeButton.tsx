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
import { Project } from "../multi-project-board";

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
  projects: Project[];
}

const PrioritizeButton: React.FC<PrioritizeButtonProps> = ({ projects }) => {
  const [projectList, setProjectList] = useState(projects);

  const handleDragEnd = (event: import("@dnd-kit/core").DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projectList.findIndex((item) => item.id === active.id);
      const newIndex = projectList.findIndex((item) => item.id === over.id);
      const updatedList = arrayMove(projectList, oldIndex, newIndex);
      setProjectList(updatedList);
    }
  };

  useEffect(() => {
    // Sort projects by their priority
    const sortedProjectsByPriority = projects.sort(
      (a, b) => a.priority - b.priority
    );
    setProjectList(sortedProjectsByPriority);
  }, [projects]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <List className="w-4 h-4 mr-2" />
          Prioritize Projects
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
              items={projectList}
              strategy={verticalListSortingStrategy}
            >
              {projectList.map((project) => (
                <SortableItem key={project.id} id={project.id}>
                  <div className="font-medium">{project.name}</div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrioritizeButton;
