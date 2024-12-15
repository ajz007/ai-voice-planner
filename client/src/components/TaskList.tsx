import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  estimate?: string;
  jiraId?: string;
}

interface TaskListProps {
  tasks: Task[];
  onSyncToJira: (taskId: number) => void;
}

export function TaskList({ tasks, onSyncToJira }: TaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
            {task.estimate && (
              <Badge variant="secondary">{task.estimate}</Badge>
            )}
          </div>

          {!task.jiraId ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSyncToJira(task.id)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Sync to JIRA
            </Button>
          ) : (
            <a
              href={`https://jira.company.com/browse/${task.jiraId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {task.jiraId}
            </a>
          )}
        </Card>
      ))}
    </div>
  );
}
