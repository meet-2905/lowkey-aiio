
import { useEffect, useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { Task, Comment } from "@/types/task";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskDetails } from "@/components/TaskDetails";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to fetch tasks",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error fetching tasks",
          description: `${error.message} (${error.code})`,
          variant: "destructive",
        });
        throw error;
      }

      setTasks(data as Task[]);
    } catch (error: any) {
      console.error("Error in Index.tsx:", error);
      toast({
        title: "Error fetching tasks",
        description: error.message || "Failed to fetch tasks",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async (newTask: Partial<Task>) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create tasks",
          variant: "destructive",
        });
        return;
      }

      // Ensure title is included to satisfy TypeScript requirement
      if (!newTask.title) {
        toast({
          title: "Error creating task",
          description: "Task title is required",
          variant: "destructive",
        });
        return;
      }

      const taskToInsert = {
        title: newTask.title,
        description: newTask.description || "",
        status: newTask.status || 'pending',
        priority: newTask.priority || 'medium',
        due_date: newTask.due_date,
        assigned_user: newTask.assigned_user || null,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskToInsert])
        .select();

      if (error) {
        console.error("Error creating task:", error);
        toast({
          title: "Error creating task",
          description: `${error.message} (${error.code})`,
          variant: "destructive",
        });
        throw error;
      }

      if (data) {
        setTasks((prev) => [data[0] as Task, ...prev]);
        toast({
          title: "Task created",
          description: "Your task has been created successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error in Index.tsx:", error);
      toast({
        title: "Error creating task",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = async (updatedTask: Partial<Task>) => {
    if (!selectedTask) return;

    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to edit tasks",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', selectedTask.id)
        .select();

      if (error) {
        console.error("Error updating task:", error);
        toast({
          title: "Error updating task",
          description: `${error.message} (${error.code})`,
          variant: "destructive",
        });
        throw error;
      }

      if (data) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === selectedTask.id
              ? { ...task, ...updatedTask }
              : task
          )
        );
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error in Index.tsx:", error);
      toast({
        title: "Error updating task",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete tasks",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error deleting task",
          description: `${error.message} (${error.code})`,
          variant: "destructive",
        });
        throw error;
      }

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error("Error in Index.tsx:", error);
      toast({
        title: "Error deleting task",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (taskId: string, comment: Partial<Comment>) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to add comments",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            task_id: taskId,
            user_id: user.id,
            content: comment.content,
          }
        ])
        .select();

      if (error) {
        console.error("Error adding comment:", error);
        toast({
          title: "Error adding comment",
          description: `${error.message} (${error.code})`,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    } catch (error: any) {
      console.error("Error in Index.tsx:", error);
      toast({
        title: "Error adding comment",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <div className="flex gap-4">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No tasks found</h2>
          <p className="text-muted-foreground mb-4">Create your first task to get started</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      )}

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
