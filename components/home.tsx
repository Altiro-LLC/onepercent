// comoponents/home.tsx
"use client";

import { useState, useEffect } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// import Confetti from "react-confetti";

import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import FeatureRequestButton from "./FeatureRequestButton";

import { withAuthRedirect } from "@/hooks/withAuthRedirect";
import { BetaTag } from "./BetaTag";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "@/app/slices/projectSlice";
import ProjectCard from "./ProjectCard";
// import { Project } from "@/lib/types";
import { AppDispatch, RootState } from "@/app/store/store";
import { Project } from "@/lib/types";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  lastUpdated?: Date; // Updated whenever the task is edited
  recurringTaskId?: string;
  notes?: string;
  priority: number;
}

export interface RecurringTask {
  title: string;
  intervalDays: number;
  recurringTaskId: string;
  lastRunDate: Date | null;
  completedAt: Date | null;
}
type GoalStatus = "in-progress" | "completed" | "not-started";
export type Goal = {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  unit: string;
  status: GoalStatus;
  recurringTasks: RecurringTask[];
  createdAt: Date;
  lastUpdated: Date;
  completedAt: Date | null;
};

const Component = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { projects } = useSelector((state: RootState) => state.projects);
  const { user } = useUser();
  //   const [projects, setProjects] = useState<Project[]>([]);

  const [newProjectName, setNewProjectName] = useState("");
  //   const [isConfetti, setIsConfetti] = useState(false);

  useEffect(() => {
    const userId = user?.id;
    if (userId) dispatch(fetchProjects(userId));
  }, [dispatch]);
  console.log("proje", projects);
  return (
    <div className="container mx-auto p-4">
      {/* {isConfetti && <Confetti tweenDuration={3000} />} */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <span>OnePercent</span>
          <BetaTag />
        </h1>

        <div className="flex items-center">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
        <Input
          type="text"
          placeholder="New project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => console.log("new project")}>Add Project</Button>
        {/* <PrioritizeButton projects={projects} fetchProjects={fetchProjects} /> */}
        <FeatureRequestButton />
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: Project) => {
            return (
              <ProjectCard
                key={project._id}
                name={project.name}
                health={project.health}
                streak={project.streak}
                analytics={project.analytics}
                goal={
                  project.goals.length > 0 ? project.goals[0].name : "No goals"
                }
                dailyTasks={
                  project.goals.length > 0 ? project.goals[0].tasks : []
                }
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
const AuthenticatedComponent = withAuthRedirect(Component);

export default AuthenticatedComponent;
