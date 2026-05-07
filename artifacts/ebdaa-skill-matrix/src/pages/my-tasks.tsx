import { Link } from "wouter";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle2, Send, Circle, ArrowRight } from "lucide-react";

interface TaskItem {
  id: string;
  level: string;
  status: string;
  notes: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  workflow: {
    id: string;
    title: string;
    status: string;
    department?: { name: string } | null;
  };
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Clock className="h-4 w-4 text-blue-400" />,
  submitted: <Send className="h-4 w-4 text-amber-400" />,
  approved: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
};

const LEVEL_LABELS: Record<string, string> = {
  manager: "Manager Task",
  engineer: "Engineer Task",
  supervisor: "Supervisor Task",
  peer_eval: "Peer Evaluation",
};

const LEVEL_DESC: Record<string, string> = {
  manager: "Start the workflow and give final sign-off",
  engineer: "Forward to supervisors and approve their submissions",
  supervisor: "Enter scores for your team and submit",
  peer_eval: "Submit an optional peer evaluation for a colleague",
};

const LEVEL_BADGE: Record<string, string> = {
  manager: "bg-purple-600 text-white",
  engineer: "bg-blue-600 text-white",
  supervisor: "bg-amber-500 text-white",
  peer_eval: "bg-teal-600 text-white",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-600/20 text-blue-400",
  submitted: "bg-amber-500/20 text-amber-400",
  approved: "bg-emerald-600/20 text-emerald-400",
};

export default function MyTasksPage() {
  const headers = getAuthHeaders();

  const { data: tasks, isLoading } = useQuery<TaskItem[]>({
    queryKey: ["my-tasks"],
    queryFn: async () => {
      const res = await fetch("/api/workflows/my/tasks", { headers });
      if (!res.ok) return [];
      return res.json() as Promise<TaskItem[]>;
    },
  });

  const pending = tasks?.filter((t) => t.status === "in_progress" || t.status === "submitted") ?? [];
  const completed = tasks?.filter((t) => t.status === "approved") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Tasks</h2>
        <p className="text-muted-foreground">Your pending evaluation workflow actions.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border"><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Pending ({pending.length})</h3>
              {pending.map((task) => (
                <Card key={task.id} className="border-border hover:border-primary/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{STEP_ICONS[task.status] ?? <Circle className="h-4 w-4" />}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge className={`text-xs ${LEVEL_BADGE[task.level] ?? "bg-muted"}`}>
                                {LEVEL_LABELS[task.level] ?? task.level}
                              </Badge>
                              <Badge className={`text-xs ${STATUS_BADGE[task.status] ?? "bg-muted"}`}>
                                {task.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm">{task.workflow.title}</p>
                            <p className="text-xs text-muted-foreground">{task.workflow.department?.name ?? ""}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{LEVEL_DESC[task.level]}</p>
                          </div>
                          <Link href={`/workflows/${task.workflow.id}`}>
                            <Button size="sm" variant="outline" className="gap-1 shrink-0 h-7 text-xs">
                              Open <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Completed ({completed.length})</h3>
              {completed.map((task) => (
                <Card key={task.id} className="border-border opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${LEVEL_BADGE[task.level] ?? "bg-muted"}`}>
                            {LEVEL_LABELS[task.level] ?? task.level}
                          </Badge>
                          <p className="text-sm font-medium">{task.workflow.title}</p>
                        </div>
                        {task.approved_at && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Approved {new Date(task.approved_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Link href={`/workflows/${task.workflow.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!pending.length && !completed.length && (
            <Card className="border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No tasks assigned to you yet.</p>
                <p className="text-sm mt-1">When you are assigned to a workflow, your tasks will appear here.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
