import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import type { Task } from '@/lib/db';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { CalendarClock, Clock, Tag } from 'lucide-react';

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLabel, setFilterLabel] = useState<string>('all');
  const { toast } = useToast();

  // Get unique labels from all tasks
  const allLabels = Array.from(new Set(tasks.flatMap(task => task.labels || [])));

  const fetchTasks = useCallback(async () => {
    try {
      const tasks = await db.getTasks();
      setTasks(tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button 
          onClick={() => setShowCreateTaskDialog(true)}
          variant="default"
        >
          New Task
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 my-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {allLabels.length > 0 && (
          <Select value={filterLabel} onValueChange={setFilterLabel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              {allLabels.map(label => (
                <SelectItem key={label} value={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground">No tasks yet. Create a task from your notes or using the New Task button.</p>
        ) : (
          tasks
            .filter(task => 
              (filterStatus === 'all' || task.status === filterStatus) &&
              (filterPriority === 'all' || task.priority === filterPriority) &&
              (filterLabel === 'all' || task.labels?.includes(filterLabel))
            )
            .map((task) => (
            <Card key={task.id} className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' :
                      task.priority === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {task.scheduledStart && (
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-4 w-4" />
                      <span>
                        {format(task.scheduledStart, 'MMM d, yyyy')}
                        {task.scheduledEnd && ` - ${format(task.scheduledEnd, 'MMM d, yyyy')}`}
                      </span>
                    </div>
                  )}
                  {task.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{task.estimatedHours}h estimated</span>
                    </div>
                  )}
                </div>

                {task.labels && task.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <span key={label} className="bg-secondary px-1.5 py-0.5 rounded-md text-xs">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <CreateTaskDialog
        open={showCreateTaskDialog}
        onOpenChange={setShowCreateTaskDialog}
        initialDescription=""
        onTaskCreated={() => {
          setShowCreateTaskDialog(false);
          fetchTasks();
          toast({
            title: "Success",
            description: "Task created successfully"
          });
        }}
      />
    </div>
  );
}