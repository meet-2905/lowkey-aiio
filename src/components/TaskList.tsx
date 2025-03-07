
import { useState } from "react";
import { Task } from "@/types/task";
import { TaskCard } from "@/components/TaskCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TaskListProps {
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClick: (task: Task) => void;
  emptyMessage?: string;
}

export function TaskList({
  title,
  tasks,
  onEdit,
  onDelete,
  onClick,
  emptyMessage = "No tasks found"
}: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tasks based on search term
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
