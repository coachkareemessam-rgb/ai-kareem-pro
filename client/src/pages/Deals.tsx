import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MoreHorizontal, Plus, Trash2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Deal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const stageLabels: Record<string, string> = {
  lead: "Lead",
  qualification: "تأهيل أولي",
  discovery: "Discovery",
  trial: "Trial",
  negotiation: "تفاوض",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const statusVariant = (status: string) => {
  switch (status) {
    case "active": return "default" as const;
    case "closed_won": return "secondary" as const;
    case "warning": return "destructive" as const;
    case "new": return "outline" as const;
    default: return "outline" as const;
  }
};

export default function Deals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ clientName: "", clientType: "trainer", stage: "lead", value: "", owner: "", status: "new" });

  const { data: deals = [], isLoading } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/deals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setDialogOpen(false);
      setForm({ clientName: "", clientType: "trainer", stage: "lead", value: "", owner: "", status: "new" });
      toast({ title: "تمت الإضافة", description: "تم إضافة الصفقة بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/deals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({ title: "تم الحذف", description: "تم حذف الصفقة بنجاح" });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-deals-title">تتبع الصفقات (Deal Tracking)</h1>
          <p className="text-muted-foreground">متابعة دقيقة لكل فرصة بيعية.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-deal" className="gap-2"><Plus className="h-4 w-4" /> إضافة صفقة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة صفقة جديدة</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>اسم العميل</Label>
                <Input data-testid="input-client-name" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="اسم العميل أو المؤسسة" />
              </div>
              <div className="grid gap-2">
                <Label>نوع العميل</Label>
                <Select value={form.clientType} onValueChange={v => setForm(f => ({ ...f, clientType: v }))}>
                  <SelectTrigger data-testid="select-client-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trainer">مدرب</SelectItem>
                    <SelectItem value="academy">أكاديمية</SelectItem>
                    <SelectItem value="training_center">مركز تدريب</SelectItem>
                    <SelectItem value="university">جامعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>القيمة المتوقعة</Label>
                <Input data-testid="input-value" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder="$0" />
              </div>
              <div className="grid gap-2">
                <Label>المسؤول</Label>
                <Input data-testid="input-owner" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} placeholder="اسم المسؤول" />
              </div>
              <Button data-testid="button-submit-deal" onClick={() => createMutation.mutate(form)} disabled={!form.clientName || !form.owner || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>كل الصفقات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد صفقات حالياً. أضف صفقة جديدة للبدء.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المرحلة</TableHead>
                  <TableHead className="text-right">القيمة المتوقعة</TableHead>
                  <TableHead className="text-right">المسؤول</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id} data-testid={`row-deal-${deal.id}`}>
                    <TableCell className="font-medium">{deal.clientName}</TableCell>
                    <TableCell>{stageLabels[deal.stage] || deal.stage}</TableCell>
                    <TableCell>{deal.value || "-"}</TableCell>
                    <TableCell>{deal.owner}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(deal.status)}>
                        {deal.status === "active" ? "نشط" : deal.status === "closed_won" ? "تم الإغلاق" : deal.status === "warning" ? "تحذير" : deal.status === "new" ? "جديد" : deal.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button data-testid={`button-delete-deal-${deal.id}`} variant="ghost" size="icon" onClick={() => deleteMutation.mutate(deal.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
