import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Target,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import type { Deal } from "@shared/schema";

interface DashboardStats {
  activeDeals: number;
  conversionRate: string;
  newLeads: number;
  totalDeals: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({ queryKey: ["/api/dashboard/stats"] });
  const { data: deals = [] } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });

  const statCards = [
    { label: "صفقات نشطة", value: stats?.activeDeals ?? "-", icon: Target, color: "text-blue-500" },
    { label: "معدل التحويل", value: stats?.conversionRate ?? "-", icon: TrendingUp, color: "text-green-500" },
    { label: "Lead جدد", value: stats?.newLeads ?? "-", icon: Users, color: "text-purple-500" },
    { label: "إجمالي الصفقات", value: stats?.totalDeals ?? "-", icon: Clock, color: "text-orange-500" },
  ];

  const warningDeals = deals.filter(d => d.status === "warning");
  const activeDeals = deals.filter(d => d.status === "active").slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على أدائك اليوم ومهامك العاجلة.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow" data-testid={`card-stat-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold" data-testid={`text-stat-value-${i}`}>{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>أحدث الصفقات النشطة</CardTitle>
            <CardDescription>آخر الصفقات النشطة في خط البيع.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد صفقات نشطة حالياً</p>
              ) : (
                activeDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border" data-testid={`card-active-deal-${deal.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Target className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{deal.clientName}</p>
                        <p className="text-sm text-muted-foreground">{deal.stage} - {deal.owner}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary">{deal.value || "-"}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>تنبيهات</CardTitle>
            <CardDescription>صفقات تحتاج اهتمام عاجل.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {warningDeals.length === 0 ? (
                <div className="p-4 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm text-green-800 dark:text-green-400">كل شيء على ما يرام</h4>
                      <p className="text-sm mt-1 text-green-700 dark:text-green-300">لا توجد صفقات متعطلة حالياً</p>
                    </div>
                  </div>
                </div>
              ) : (
                warningDeals.map((deal) => (
                  <div key={deal.id} className="p-4 rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900" data-testid={`alert-deal-${deal.id}`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-400">صفقة تحتاج اهتمام</h4>
                        <p className="text-sm mt-1 text-amber-700 dark:text-amber-300">
                          {deal.clientName} - مرحلة {deal.stage}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
