// Create a new NotesModal component
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// import { Notebook } from "lucide-react";

interface TaskNotesModalProps {
  currentProjectId: string;
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  initialNotes: string;
  onSave: (notes: string, taskId: string, projectId: string) => void;
}

const TaskNotesModal: React.FC<TaskNotesModalProps> = ({
  currentProjectId,
  isOpen,
  onClose,
  initialNotes,
  onSave,
  taskId,
}) => {
  console.log("taskId", taskId);
  //   console.log("currentProjectId", currentProjectId);
  const [notes, setNotes] = React.useState(initialNotes);

  const handleSave = async () => {
    await onSave(notes, taskId, currentProjectId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Task Notes</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[300px]"
            placeholder="Enter your project notes here..."
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Notes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskNotesModal;
