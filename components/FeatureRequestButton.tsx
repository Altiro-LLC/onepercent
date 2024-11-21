"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThumbsUp } from "lucide-react";
import { useUser } from "@clerk/nextjs";

type FeatureRequest = {
  _id: string;
  id: number;
  title: string;
  description: string;
  votes: number;
};

export default function FeatureRequestButton() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([
    {
      _id: "1",
      id: 1,
      title: "Dark mode",
      description: "Add a dark mode option for better night-time viewing.",
      votes: 5,
    },
    {
      _id: "2",
      id: 2,
      title: "Shortlist the day's tasks on top",
      description:
        "Show the day's tasks on top of the list for quick access and focus.",
      votes: 3,
    },
    {
      _id: "3",
      id: 2,
      title: "Overall Streaks",
      description:
        "Show overall streak for when all projects have one task completed to motivate users to keep going.",
      votes: 2,
    },
  ]);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const fetchFeatureRequests = async () => {
    try {
      const response = await fetch("/api/feature-requests");
      if (!response.ok) {
        throw new Error("Failed to fetch feature requests");
      }
      const data = await response.json();
      // add the data to the existing state
      setFeatureRequests([...featureRequests, ...data]);
    } catch (error) {
      console.error("Error fetching feature requests:", error);
    }
  };

  // Fetch feature requests from the backend
  useEffect(() => {
    fetchFeatureRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("You must be signed in to submit a feature request.");
      return;
    }

    if (title.trim() && description.trim()) {
      try {
        const response = await fetch("/api/feature-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id, // Include userId
            title: title.trim(),
            description: description.trim(),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to submit feature request");
        }

        const { data } = await response.json();

        // Update local state with the new feature request
        setFeatureRequests([data, ...featureRequests]);
        setTitle("");
        setDescription("");
        setConfirmationMessage("Your feature request has been submitted!");
        setTimeout(() => setConfirmationMessage(""), 3000);
        fetchFeatureRequests();
      } catch (error) {
        console.error("Error submitting feature request:", error);
        alert("Failed to submit the feature request. Please try again.");
      }
    }
  };

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault();
  //     if (title.trim() && description.trim()) {
  //       const newFeatureRequest: FeatureRequest = {
  //         id: Date.now(),
  //         title: title.trim(),
  //         description: description.trim(),
  //         votes: 0,
  //       };
  //       setFeatureRequests([newFeatureRequest, ...featureRequests]);
  //       setTitle("");
  //       setDescription("");
  //     }
  //   };

  const handleVote = async (_id: string) => {
    // Increment votes for a feature request locally
    setFeatureRequests(
      featureRequests.map((request) =>
        request._id === _id ? { ...request, votes: request.votes + 1 } : request
      )
    );

    try {
      await fetch(`/api/feature-requests/${_id}/vote`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error updating votes:", error);
      alert("Failed to update votes. Please try again.");
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Feature Requests (We ❤️ feedback!)
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Feature Requests</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="sticky top-0 bg-background z-10 p-4 border-b">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Allow users to sign up with Slack"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. We have a channel in Slack where we share updates and it would be great if we could sign up with Slack to get notifications there."
                    required
                  />
                </div>
                <Button type="submit">Submit Feature Request</Button>
                {confirmationMessage && (
                  <p className="text-green-500 text-sm mt-2">
                    {confirmationMessage}
                  </p>
                )}
              </form>
            </div>
            <ScrollArea className="flex-1 p-4">
              {featureRequests.map((request) => (
                <div key={request?.id} className="bg-muted p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {request?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request?.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVote(request?._id)}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      {request?.votes}
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
