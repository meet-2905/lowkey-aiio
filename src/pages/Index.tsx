
import { useState } from "react";
import { Plus } from "lucide-react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskDetails } from "@/components/TaskDetails";
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const { toast } = useToast();

  const handleCreateTask = (newTask: Partial<Task>) => {
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      comments: [],
      ...newTask,
    } as Task;

    setTasks((prev) => [...prev, task]);
    toast({
      title: "Task created",
      description: "Your task has been created successfully.",
    });
  };

  const handleEditTask = (updatedTask: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask?.id
          ? { ...task, ...updatedTask }
          : task
      )
    );
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
      variant: "destructive",
    });
  };

  const handleAddComment = (taskId: string, comment: Partial<Comment>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              comments: [
                ...task.comments,
                { id: Math.random().toString(36).substr(2, 9), ...comment } as Comment,
              ],
            }
          : task
      )
    );
    toast({
      title: "Comment added",
      description: "Your comment has been added successfully.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={(task) => {
              setSelectedTask(task);
              setIsEditDialogOpen(true);
            }}
            onDelete={handleDeleteTask}
            onClick={(task) => {
              setSelectedTask(task);
              setIsDetailsDialogOpen(true);
            }}
          />
        ))}
      </div>

      <TaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTask}
      />

      <TaskDialog
        task={selectedTask}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleEditTask}
      />

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
