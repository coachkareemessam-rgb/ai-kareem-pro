import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Plus, CheckCircle2, Clock, AlertTriangle, Trash2,
  ListTodo, Filter, Calendar, Flag, Circle, CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

const priorities: Record<string, { label: string; color: string; icon: any }> = {
  urgent: { label: "عاجل", color: "#ef4444", icon: AlertTriangle },
  high: { label: "عالي", color: "#f97316", icon: Flag },
  medium: { label: "متوسط", color: "#3b82f6", icon: Flag },
  low: { label: "منخفض", color: "#6b7280", icon: Flag },
};

const statuses: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "قيد الانتظار", color: "#6b7280", icon: Circle },
  in_progress: { label: "قيد التنفيذ", color: "#3b82f6", icon: Clock },
  completed: { label: "مكتمل", color: "#10b981", icon: CheckCircle2 },
};

const categories: Record<string, string> = {
  general: "عام",
  sales: "مبيعات",
  follow_up: "متابعة عملاء",
  content: "محتوى",
  meeting: "اجتماعات",
  admin: "إداري",
};

export default function Tasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium', category: 'general', dueDate: '',
  });

  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });

  const createMutation = useMutation({
    mutationFn: (data: typeof newTask) => apiRequest("POST", "/api/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTask({ title: '', description: '', priority: 'medium', category: 'general', dueDate: '' });
      setDialogOpen(false);
      toast({ title: "تمت الإضافة", description: "تم إضافة المهمة بنجاح" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) => apiRequest("PATCH", `/api/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "تم الحذف", description: "تم حذف المهمة" });
    },
  });

  const cycleStatus = (task: Task) => {
    const order = ['pending', 'in_progress', 'completed'];
    const nextIndex = (order.indexOf(task.status) + 1) % order.length;
    updateMutation.mutate({ id: task.id, status: order[nextIndex] });
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-tasks-title">إدارة المهام</h1>
          <p className="text-muted-foreground">تتبع مهامك اليومية وأولوياتك</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-task">
              <Plus className="w-4 h-4" />
              مهمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة مهمة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>عنوان المهمة *</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="مثال: متابعة عميل أكاديمية المستقبل"
                  data-testid="input-task-title"
                />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="تفاصيل إضافية عن المهمة..."
                  className="h-20 resize-none"
                  data-testid="input-task-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>الأولوية</Label>
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask(p => ({ ...p, priority: v }))}>
                    <SelectTrigger data-testid="select-task-priority"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorities).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>التصنيف</Label>
                  <Select value={newTask.category} onValueChange={(v) => setNewTask(p => ({ ...p, category: v }))}>
                    <SelectTrigger data-testid="select-task-category"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>تاريخ الاستحقاق</Label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                  data-testid="input-task-due-date"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate(newTask)}
                disabled={!newTask.title.trim() || createMutation.isPending}
                data-testid="button-submit-task"
              >
                إضافة المهمة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="border-r-4 border-r-gray-400">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">قيد الانتظار</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-blue-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">قيد التنفيذ</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-green-500">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">مكتمل</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-r-4 border-r-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">نسبة الإنجاز</span>
              <span className="text-sm font-bold text-purple-600">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2.5" />
            <p className="text-[10px] text-muted-foreground mt-1">{completedCount} من {totalCount} مهمة</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40" data-testid="filter-status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(statuses).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40" data-testid="filter-priority"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأولويات</SelectItem>
            {Object.entries(priorities).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">لا توجد مهام - أضف مهمة جديدة للبدء</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const priority = priorities[task.priority] || priorities.medium;
            const status = statuses[task.status] || statuses.pending;
            const StatusIcon = status.icon;
            return (
              <Card
                key={task.id}
                className={cn("transition-all hover:shadow-sm", task.status === 'completed' && "opacity-60")}
                data-testid={`task-card-${task.id}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <button
                    onClick={() => cycleStatus(task)}
                    className="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
                    style={{ borderColor: status.color, background: task.status === 'completed' ? status.color : 'transparent' }}
                    data-testid={`button-toggle-${task.id}`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                    {task.status === 'in_progress' && <Clock className="w-3.5 h-3.5" style={{ color: status.color }} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={cn("font-semibold text-sm", task.status === 'completed' && "line-through text-muted-foreground")}>
                        {task.title}
                      </h3>
                      <Badge variant="outline" className="text-[10px] px-1.5" style={{ color: priority.color, borderColor: priority.color }}>
                        {priority.label}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5">
                        {categories[task.category] || task.category}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Select
                      value={task.status}
                      onValueChange={(v) => updateMutation.mutate({ id: task.id, status: v })}
                    >
                      <SelectTrigger className="w-28 h-8 text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statuses).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(task.id)}
                      data-testid={`button-delete-${task.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
