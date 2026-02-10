import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Search, Upload, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import type { KnowledgeFile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function KnowledgeBase() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "PDF", size: "0 KB", tag: "general", content: "" });

  const { data: files = [], isLoading } = useQuery<KnowledgeFile[]>({ queryKey: ["/api/knowledge-files"] });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/knowledge-files", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-files"] });
      setDialogOpen(false);
      setForm({ name: "", type: "PDF", size: "0 KB", tag: "general", content: "" });
      toast({ title: "تمت الإضافة", description: "تم إضافة الملف بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/knowledge-files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-files"] });
      toast({ title: "تم الحذف", description: "تم حذف الملف بنجاح" });
    },
  });

  const filtered = files.filter(f => {
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = filterTag === "all" || f.tag === filterTag;
    return matchesSearch && matchesTag;
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-kb-title">قاعدة المعرفة (Knowledge Base)</h1>
          <p className="text-muted-foreground">جميع المستندات، الملفات، والقوالب التي يحتاجها الفريق.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-file" className="gap-2"><Upload className="h-4 w-4" /><span>رفع ملف جديد</span></Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة ملف جديد</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>اسم الملف</Label>
                <Input data-testid="input-file-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الملف" />
              </div>
              <div className="grid gap-2">
                <Label>النوع</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger data-testid="select-file-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="DOCX">DOCX</SelectItem>
                    <SelectItem value="XLSX">XLSX</SelectItem>
                    <SelectItem value="TXT">TXT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>التصنيف</Label>
                <Select value={form.tag} onValueChange={v => setForm(f => ({ ...f, tag: v }))}>
                  <SelectTrigger data-testid="select-file-tag"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOP">SOP</SelectItem>
                    <SelectItem value="Script">Script</SelectItem>
                    <SelectItem value="Pricing">Pricing</SelectItem>
                    <SelectItem value="Market">Market</SelectItem>
                    <SelectItem value="general">عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>الوصف</Label>
                <Input data-testid="input-file-content" value={form.content || ""} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="وصف مختصر للملف" />
              </div>
              <Button data-testid="button-submit-file" onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input data-testid="input-search-files" placeholder="بحث في الملفات..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "SOP", "Script", "Pricing", "Market"].map(tag => (
            <Badge
              key={tag}
              variant={filterTag === tag ? "secondary" : "outline"}
              className="cursor-pointer hover:bg-muted"
              onClick={() => setFilterTag(tag)}
              data-testid={`filter-tag-${tag}`}
            >
              {tag === "all" ? "الكل" : tag}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد ملفات مطابقة للبحث.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((file) => (
            <Card key={file.id} className="hover:border-primary/50 transition-colors group cursor-pointer" data-testid={`card-file-${file.id}`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium line-clamp-1" title={file.name}>{file.name}</CardTitle>
                    <CardDescription>{file.size} {file.createdAt ? `\u2022 ${formatDate(file.createdAt)}` : ""}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs font-normal">{file.tag}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => deleteMutation.mutate(file.id)}
                    data-testid={`button-delete-file-${file.id}`}
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
