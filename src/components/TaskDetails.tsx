
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";
import { Task, Comment } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface TaskDetailsProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComment: (taskId: string, comment: Partial<Comment>) => void;
}

export function TaskDetails({
  task,
  open,
  onOpenChange,
  onAddComment,
}: TaskDetailsProps) {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(task.id, {
        text: newComment,
        author: "Current User", // In a real app, this would be the logged-in user
        createdAt: new Date(),
      });
      setNewComment("");
    }
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const statusColors = {
    todo: "bg-gray-100 text-gray-800",
    "in-progress": "bg-purple-100 text-purple-800",
    done: "bg-green-100 text-green-800",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] slide-up">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{task.title}</DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className={priorityColors[task.priority]}>
              {task.priority}
            </Badge>
            <Badge variant="secondary" className={statusColors[task.status]}>
              {task.status}
            </Badge>
          </div>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due: {format(new Date(task.dueDate), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Assigned to: {task.assignedUser}</span>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium">Comments</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {task.comments.map((comment, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.createdAt), "PPp")}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{comment.text}</p>
                    {index < task.comments.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={handleAddComment}>Add Comment</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
