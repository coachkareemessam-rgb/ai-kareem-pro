import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Target, TrendingUp, Clock, CheckCircle2, AlertCircle,
  Loader2, BarChart3, HeadphonesIcon, DollarSign, ArrowUpRight,
  ArrowDownRight, ListTodo, MessageSquare, FileText, Star
} from "lucide-react";
import type { Deal, Task, Conversation, CSConversation } from "@shared/schema";

interface DashboardStats {
  activeDeals: number;
  conversionRate: string;
  newLeads: number;
  totalDeals: number;
}

export default function ManagerDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({ queryKey: ["/api/dashboard/stats"] });
  const { data: deals = [] } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"] });
  const { data: salesConvs = [] } = useQuery<Conversation[]>({ queryKey: ["/api/conversations"] });
  const { data: csConvs = [] } = useQuery<CSConversation[]>({ queryKey: ["/api/cs/conversations"] });

  const activeDeals = deals.filter(d => d.status === "active");
  const warningDeals = deals.filter(d => d.status === "warning");
  const wonDeals = deals.filter(d => d.stage === "إغلاق" || d.stage === "closing");
  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const dealsByStage = deals.reduce((acc, d) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageColors: Record<string, string> = {
    "تنقيب": "#6366f1",
    "تأهيل": "#8b5cf6",
    "اكتشاف": "#0ea5e9",
    "عرض": "#f59e0b",
    "تجربة": "#10b981",
    "تفاوض": "#f97316",
    "إغلاق": "#059669",
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-manager-dashboard-title">لوحة تحكم المدير</h1>
        <p className="text-muted-foreground">نظرة شاملة على أداء فريق المبيعات وفريق نجاح العملاء</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-r-4 border-r-blue-500" data-testid="card-manager-stat-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الصفقات</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <div>
                <div className="text-2xl font-bold">{stats?.totalDeals ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{stats?.activeDeals ?? 0} نشطة • {warningDeals.length} تحتاج متابعة</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-r-4 border-r-green-500" data-testid="card-manager-stat-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <div>
                <div className="text-2xl font-bold">{stats?.conversionRate ?? "0%"}</div>
                <p className="text-xs text-muted-foreground mt-1">{wonDeals.length} صفقة مغلقة</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-r-4 border-r-purple-500" data-testid="card-manager-stat-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المهام</CardTitle>
            <ListTodo className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{completedTasks.length} مكتملة • {pendingTasks.length} قيد التنفيذ</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-r-4 border-r-emerald-500" data-testid="card-manager-stat-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">محادثات AI</CardTitle>
            <MessageSquare className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div>
              <div className="text-2xl font-bold">{salesConvs.length + csConvs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{salesConvs.length} مبيعات • {csConvs.length} نجاح عملاء</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5">
            <Target className="h-3.5 w-3.5" />
            فريق المبيعات
          </TabsTrigger>
          <TabsTrigger value="cs" className="gap-1.5">
            <HeadphonesIcon className="h-3.5 w-3.5" />
            فريق نجاح العملاء
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">
            <ListTodo className="h-3.5 w-3.5" />
            المهام
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  توزيع الصفقات حسب المرحلة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(dealsByStage).map(([stage, count]) => (
                    <div key={stage} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium truncate">{stage}</div>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.max((count / Math.max(deals.length, 1)) * 100, 8)}%`,
                            background: stageColors[stage] || "#6366f1",
                          }}
                        />
                      </div>
                      <Badge variant="outline" className="text-xs min-w-[2rem] justify-center">{count}</Badge>
                    </div>
                  ))}
                  {Object.keys(dealsByStage).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد صفقات حالياً</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  تنبيهات وإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {warningDeals.length > 0 ? warningDeals.map((deal) => (
                    <div key={deal.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200" data-testid={`manager-alert-${deal.id}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">{deal.clientName}</p>
                          <p className="text-xs text-amber-600">{deal.stage} • {deal.owner}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-green-700 font-medium">كل شيء على ما يرام</p>
                      <p className="text-xs text-green-600">لا توجد تنبيهات عاجلة</p>
                    </div>
                  )}
                  {pendingTasks.length > 0 && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-start gap-2">
                        <ListTodo className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">{pendingTasks.length} مهمة قيد التنفيذ</p>
                          <p className="text-xs text-blue-600">تحتاج متابعة</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Target className="h-5 w-5" />
                  أداء فريق المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{deals.length}</div>
                    <div className="text-xs text-blue-600">إجمالي الصفقات</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{activeDeals.length}</div>
                    <div className="text-xs text-blue-600">صفقات نشطة</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{salesConvs.length}</div>
                    <div className="text-xs text-blue-600">محادثات AI</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{stats?.conversionRate ?? "0%"}</div>
                    <div className="text-xs text-blue-600">معدل التحويل</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-emerald-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <HeadphonesIcon className="h-5 w-5" />
                  أداء فريق نجاح العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-700">{csConvs.length}</div>
                    <div className="text-xs text-emerald-600">محادثات CS</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-700">{wonDeals.length}</div>
                    <div className="text-xs text-emerald-600">عملاء حاليين</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-700">-</div>
                    <div className="text-xs text-emerald-600">معدل الرضا</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-700">-</div>
                    <div className="text-xs text-emerald-600">معدل التجديد</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>جميع صفقات فريق المبيعات</CardTitle>
              <CardDescription>عرض تفصيلي لجميع الصفقات ومراحلها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">لا توجد صفقات حالياً</p>
                ) : deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors" data-testid={`manager-deal-${deal.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{deal.clientName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{deal.owner}</span>
                          <span>•</span>
                          <span>{deal.clientType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={deal.status === "active" ? "default" : deal.status === "warning" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {deal.stage}
                      </Badge>
                      <span className="font-semibold text-primary min-w-[4rem] text-left">{deal.value || "-"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cs" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5 text-emerald-600" />
                محادثات فريق نجاح العملاء
              </CardTitle>
              <CardDescription>جميع المحادثات مع العملاء الحاليين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {csConvs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">لا توجد محادثات نجاح عملاء حالياً</p>
                ) : csConvs.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg border border-emerald-100" data-testid={`manager-cs-conv-${conv.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {conv.createdAt ? new Date(conv.createdAt).toLocaleDateString("ar-SA") : ""}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">نجاح عملاء</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>العملاء الحاليين</CardTitle>
              <CardDescription>الصفقات المغلقة التي تحولت لعملاء حاليين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wonDeals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">لا يوجد عملاء حاليين بعد</p>
                ) : wonDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium">{deal.clientName}</p>
                        <p className="text-xs text-muted-foreground">{deal.owner}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">عميل حالي</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>جميع المهام</CardTitle>
              <CardDescription>متابعة المهام لجميع الفرق</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">لا توجد مهام حالياً</p>
                ) : tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border" data-testid={`manager-task-${task.id}`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${task.status === "completed" ? "bg-green-500" : task.status === "in_progress" ? "bg-blue-500" : "bg-gray-300"}`} />
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.priority} • {task.category || "عام"}</p>
                      </div>
                    </div>
                    <Badge variant={task.status === "completed" ? "default" : task.status === "in_progress" ? "secondary" : "outline"} className="text-xs">
                      {task.status === "completed" ? "مكتملة" : task.status === "in_progress" ? "قيد التنفيذ" : "معلّقة"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
