import { format } from "date-fns";
import { Calendar, Edit, MessageSquare, Trash, User } from "lucide-react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onClick }: TaskCardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const statusColors = {
    pending: "bg-gray-100 text-gray-800",
    "in-progress": "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 fade-in">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className={priorityColors[task.priority]}>
            {task.priority}
          </Badge>
          <Badge variant="secondary" className={statusColors[task.status]}>
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent
        className="cursor-pointer"
        onClick={() => onClick(task)}
      >
        <p className="text-muted-foreground line-clamp-2">{task.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{task.comments.length}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{task.assignedUser}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
