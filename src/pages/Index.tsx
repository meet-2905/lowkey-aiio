
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
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTasks(data as Task[]);
    } catch (error: any) {
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async (newTask: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            ...newTask,
            created_by: user?.id,
            status: newTask.status || 'pending',
            priority: newTask.priority || 'medium',
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        setTasks((prev) => [data[0] as Task, ...prev]);
        toast({
          title: "Task created",
          description: "Your task has been created successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditTask = async (updatedTask: Partial<Task>) => {
    if (!selectedTask) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', selectedTask.id)
        .select();

      if (error) throw error;

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
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (taskId: string, comment: Partial<Comment>) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            task_id: taskId,
            user_id: user?.id,
            content: comment.content,
          }
        ])
        .select();

      if (error) throw error;

      // Refresh the selected task to get the updated comments
      if (selectedTask && selectedTask.id === taskId) {
        const { data: updatedTask, error: taskError } = await supabase
          .from('tasks')
          .select(`
            *,
            comments(*)
          `)
          .eq('id', taskId)
          .single();

        if (taskError) throw taskError;
        
        setSelectedTask(updatedTask as unknown as Task);

        // Also update the task in the tasks list
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, comments: [...(task.comments || []), data[0] as Comment] }
              : task
          )
        );
      }
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
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
