
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && task) {
      fetchComments();
    }
  }, [open, task]);

  const fetchComments = async () => {
    if (!task) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        toast({
          title: "Error fetching comments",
          description: `${error.message} (${error.code})`,
          variant: "destructive",
        });
        throw error;
      }

      setComments(data as Comment[]);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error in TaskDetails.tsx",
        description: error.message || "Failed to fetch comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add comments",
        variant: "destructive",
      });
      return;
    }

    if (newComment.trim()) {
      onAddComment(task.id, {
        content: newComment,
      });
      setNewComment("");
      fetchComments(); // Refresh comments
    }
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const statusColors = {
    pending: "bg-gray-100 text-gray-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] slide-up">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">{task.title}</DialogTitle>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className={priorityColors[task.priority as keyof typeof priorityColors]}>
              {task.priority}
            </Badge>
            <Badge variant="secondary" className={statusColors[task.status.replace('-', '_') as keyof typeof statusColors]}>
              {task.status.replace('_', ' ')}
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
              <span>Due: {format(new Date(task.due_date), "PPP")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Assigned to: {task.assigned_user}</span>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="font-medium">Comments</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {loading ? (
                <div className="flex justify-center p-4">Loading comments...</div>
              ) : comments.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment, index) => (
                    <div key={comment.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{comment.user_id === user?.id ? 'You' : 'User'}</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(comment.created_at), "PPp")}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{comment.content}</p>
                      {index < comments.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
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
