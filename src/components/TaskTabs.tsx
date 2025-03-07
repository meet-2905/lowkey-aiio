
import { Task } from "@/types/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/TaskList";
import { useAuth } from "@/contexts/AuthContext";

interface TaskTabsProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClick: (task: Task) => void;
}

export function TaskTabs({ tasks, onEdit, onDelete, onClick }: TaskTabsProps) {
  const { user } = useAuth();
  
  // Filter tasks assigned to the current user
  const myTasks = tasks.filter(task => task.assigned_user === user?.id);

  return (
    <Tabs defaultValue="all-tasks" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
        <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all-tasks">
        <TaskList 
          title="All Tasks" 
          tasks={tasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          emptyMessage="No tasks available. Create your first task to get started."
        />
      </TabsContent>
      
      <TabsContent value="my-tasks">
        <TaskList 
          title="My Tasks" 
          tasks={myTasks}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          emptyMessage="No tasks assigned to you. Tasks assigned to you will appear here."
        />
      </TabsContent>
    </Tabs>
  );
}
