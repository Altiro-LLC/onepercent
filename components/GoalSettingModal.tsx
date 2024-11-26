"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface GoalFormData {
  title: string;
  description: string;
  throughput: number;
}

export function GoalSettingModal({
  projectId,
  fetchProjects,
}: {
  projectId: string;
  fetchProjects: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<GoalFormData>({
    title: "",
    description: "",
    throughput: 1,
  });
  const [buttonState, setButtonState] = useState<"default" | "success">(
    "default"
  );
  console.log("projectId", projectId);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThroughputChange = (value: number[]) => {
    setFormData((prev) => ({ ...prev, throughput: value[0] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      projectId,
      title: formData.title,
      description: formData.description,
      throughput: formData.throughput,
    };

    try {
      const response = await fetch(`/api/projects/${projectId}/addGoal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Goal added successfully:", data.goal);

        // Change button state to success
        setButtonState("success");

        // Close modal after 3 seconds
        setTimeout(() => {
          setButtonState("default"); // Reset button state
          setIsOpen(false); // Close the modal
        }, 3000);
        await fetchProjects(); // Fetch projects to update the UI
      } else {
        const errorData = await response.json();
        console.error("Error adding goal:", errorData.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Goal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set a New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="throughput">Daily Throughput</Label>
            <Slider
              id="throughput"
              min={1}
              max={3}
              step={1}
              value={[formData.throughput]}
              onValueChange={handleThroughputChange}
            />
            <p className="text-sm text-muted-foreground">
              Number of tasks you want to attribute to this goal every day:{" "}
              {formData.throughput}
            </p>
          </div>
          <Button
            type="submit"
            className={`w-full ${
              buttonState === "success" ? "bg-green-500 text-white" : ""
            }`}
            disabled={buttonState === "success"} // Disable the button when in success state
          >
            {buttonState === "success" ? "Goal Added!" : "Set Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
