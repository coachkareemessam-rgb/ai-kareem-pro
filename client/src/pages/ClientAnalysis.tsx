import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  Trash2,
  Eye,
  Sparkles,
  User,
  Briefcase,
  Target,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Save,
  Plus,
} from "lucide-react";
import type { ClientAnalysis } from "@shared/schema";

const CLIENT_TYPES = [
  { value: "trainer", label: "مدرب" },
  { value: "coach", label: "كوتش" },
  { value: "expert", label: "خبير" },
  { value: "content_creator", label: "صانع محتوى تعليمي" },
  { value: "academy", label: "أكاديمية" },
  { value: "training_center", label: "مركز تدريب" },
];

const GUIDE_QUESTIONS = [
  {
    icon: User,
    title: "أسئلة لفهم العميل",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    questions: [
      "ما هو تخصصك الدقيق في مجال التدريب/الكوتشينج؟",
      "منذ متى وأنت تعمل في هذا المجال؟",
      "هل لديك شهادات معتمدة في مجالك؟",
      "كم عدد المتدربين/العملاء الذين تعاملت معهم؟",
    ],
  },
  {
    icon: Briefcase,
    title: "أسئلة عن طريقة العمل",
    color: "text-green-600",
    bgColor: "bg-green-50",
    questions: [
      "كيف تقدم خدماتك حالياً؟ (حضوري/أونلاين/مختلط)",
      "هل لديك منصة إلكترونية أو موقع؟",
      "كيف تسوق لنفسك حالياً؟",
      "ما هي أدوات التكنولوجيا التي تستخدمها؟",
    ],
  },
  {
    icon: Target,
    title: "أسئلة عن الأهداف",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    questions: [
      "ما هي أهدافك للسنة القادمة؟",
      "هل تريد التوسع في أسواق جديدة؟",
      "هل تريد زيادة عدد المتدربين أم زيادة الأسعار؟",
      "ما هو الدخل الشهري المستهدف؟",
    ],
  },
  {
    icon: AlertTriangle,
    title: "أسئلة لكشف التحديات",
    color: "text-red-600",
    bgColor: "bg-red-50",
    questions: [
      "ما أكبر تحدي يواجهك حالياً؟",
      "هل واجهت مشكلة في الحصول على عملاء جدد؟",
      "هل تجد صعوبة في تسعير خدماتك؟",
      "هل فقدت عملاء لصالح منافسين؟ ولماذا؟",
    ],
  },
];

export default function ClientAnalysis() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [viewAnalysis, setViewAnalysis] = useState<ClientAnalysis | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const analysisRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    clientName: "",
    clientType: "trainer",
    field: "",
    currentMethod: "",
    targetAudience: "",
    experience: "",
    challenges: "",
    goals: "",
    additionalInfo: "",
  });

  const { data: analyses = [], isLoading } = useQuery<ClientAnalysis[]>({
    queryKey: ["/api/analyses"],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/analyses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({ title: "تم حفظ التحليل بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/analyses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/analyses"] });
      toast({ title: "تم حذف التحليل" });
    },
  });

  const handleGenerate = async () => {
    if (!form.clientName || !form.field) {
      toast({ title: "يرجى إدخال اسم العميل والمجال على الأقل", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setStreamedContent("");

    try {
      const response = await fetch("/api/analyses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullContent += data.content;
                  setStreamedContent(fullContent);
                }
                if (data.done) {
                  await saveMutation.mutateAsync({
                    ...form,
                    aiAnalysis: fullContent,
                  });
                  setShowForm(false);
                  resetForm();
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      toast({ title: "حدث خطأ أثناء التحليل", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setForm({
      clientName: "",
      clientType: "trainer",
      field: "",
      currentMethod: "",
      targetAudience: "",
      experience: "",
      challenges: "",
      goals: "",
      additionalInfo: "",
    });
    setStreamedContent("");
  };

  const getClientTypeLabel = (type: string) => {
    return CLIENT_TYPES.find((t) => t.value === type)?.label || type;
  };

  const renderMarkdownSafe = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={i} className="h-2" />);
        return;
      }

      const h2Match = trimmed.match(/^## (\d+)\. (.+)/);
      if (h2Match) {
        elements.push(
          <h3 key={i} className="text-lg font-bold text-primary mt-6 mb-3 flex items-center gap-2">
            <span className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">{h2Match[1]}</span>
            {h2Match[2]}
          </h3>
        );
        return;
      }

      const h3Match = trimmed.match(/^### (.+)/);
      if (h3Match) {
        elements.push(<h4 key={i} className="text-md font-semibold text-gray-800 mt-4 mb-2">{h3Match[1]}</h4>);
        return;
      }

      const bulletMatch = trimmed.match(/^[-•] (.+)/);
      if (bulletMatch) {
        const content = bulletMatch[1].replace(/\*\*(.+?)\*\*/g, "$1");
        const parts = content.split(/\*\*(.+?)\*\*/);
        elements.push(
          <div key={i} className="flex items-start gap-2 mr-4 mb-1.5 text-gray-700 text-sm">
            <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
            <span>{renderBoldText(content)}</span>
          </div>
        );
        return;
      }

      const numMatch = trimmed.match(/^(\d+)[.)]\s*(.+)/);
      if (numMatch) {
        elements.push(
          <div key={i} className="flex items-start gap-2 mr-4 mb-1.5 text-gray-700 text-sm">
            <span className="font-semibold text-primary shrink-0">{numMatch[1]}.</span>
            <span>{renderBoldText(numMatch[2])}</span>
          </div>
        );
        return;
      }

      elements.push(<p key={i} className="text-gray-700 text-sm mb-1 leading-relaxed">{renderBoldText(trimmed)}</p>);
    });

    return <>{elements}</>;
  };

  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*(.+?)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-gray-900">{part}</strong> : part
    );
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
            تحليل احتياجات وتحديات العميل
          </h1>
          <p className="text-muted-foreground mt-1">
            أدخل بيانات العميل واحصل على تحليل شامل لنقاط الألم والتحديات والفرص البيعية
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowGuide(!showGuide)}
            data-testid="button-toggle-guide"
          >
            <MessageSquare className="h-4 w-4 ml-2" />
            دليل الأسئلة
            {showGuide ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
          </Button>
          <Button onClick={() => { setShowForm(true); resetForm(); }} data-testid="button-new-analysis">
            <Plus className="h-4 w-4 ml-2" />
            تحليل جديد
          </Button>
        </div>
      </div>

      {showGuide && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDE_QUESTIONS.map((section, idx) => (
            <Card key={idx} className="border-t-4" style={{ borderTopColor: section.color.replace("text-", "").includes("blue") ? "#2563eb" : section.color.includes("green") ? "#16a34a" : section.color.includes("purple") ? "#9333ea" : "#dc2626" }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <section.icon className={`h-4 w-4 ${section.color}`} />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.questions.map((q, qIdx) => (
                    <li key={qIdx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-primary mt-0.5 font-bold">{qIdx + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              نموذج تحليل العميل
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم العميل *</Label>
                <Input
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="أدخل اسم العميل"
                  data-testid="input-client-name"
                />
              </div>

              <div className="space-y-2">
                <Label>نوع العميل *</Label>
                <Select value={form.clientType} onValueChange={(v) => setForm({ ...form, clientType: v })}>
                  <SelectTrigger data-testid="select-client-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>المجال / التخصص *</Label>
                <Input
                  value={form.field}
                  onChange={(e) => setForm({ ...form, field: e.target.value })}
                  placeholder="مثال: تطوير الذات، إدارة الأعمال، البرمجة..."
                  data-testid="input-field"
                />
              </div>

              <div className="space-y-2">
                <Label>الطريقة الحالية المعتمدة</Label>
                <Input
                  value={form.currentMethod}
                  onChange={(e) => setForm({ ...form, currentMethod: e.target.value })}
                  placeholder="مثال: حضوري، أونلاين عبر زوم، دورات مسجلة..."
                  data-testid="input-current-method"
                />
              </div>

              <div className="space-y-2">
                <Label>الجمهور المستهدف</Label>
                <Input
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  placeholder="مثال: رواد أعمال، موظفين، طلاب جامعات..."
                  data-testid="input-target-audience"
                />
              </div>

              <div className="space-y-2">
                <Label>سنوات الخبرة</Label>
                <Input
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="مثال: 5 سنوات، مبتدئ، خبير..."
                  data-testid="input-experience"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>التحديات التي ذكرها العميل</Label>
                <Textarea
                  value={form.challenges}
                  onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                  placeholder="اكتب أي تحديات ذكرها العميل في المحادثة..."
                  rows={2}
                  data-testid="input-challenges"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>أهداف العميل</Label>
                <Textarea
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  placeholder="ما الذي يريد العميل تحقيقه؟"
                  rows={2}
                  data-testid="input-goals"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>معلومات إضافية</Label>
                <Textarea
                  value={form.additionalInfo}
                  onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                  placeholder="أي معلومات أخرى عن العميل قد تساعد في التحليل..."
                  rows={2}
                  data-testid="input-additional-info"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !form.clientName || !form.field}
                className="flex-1"
                data-testid="button-generate-analysis"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التحليل بالذكاء الاصطناعي...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 ml-2" />
                    تحليل بالذكاء الاصطناعي
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                إلغاء
              </Button>
            </div>

            {streamedContent && (
              <div className="mt-6 border rounded-lg p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50" ref={analysisRef}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">نتيجة التحليل</h3>
                  {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-primary mr-auto" />}
                </div>
                <div className="prose prose-sm max-w-none leading-relaxed">
                  {renderMarkdownSafe(streamedContent)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          التحليلات السابقة ({analyses.length})
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : analyses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-2">لا توجد تحليلات بعد</p>
              <p className="text-sm text-muted-foreground mb-4">ابدأ بإدخال بيانات عميل جديد للحصول على تحليل شامل</p>
              <Button onClick={() => setShowForm(true)} data-testid="button-empty-new-analysis">
                <Plus className="h-4 w-4 ml-2" />
                تحليل عميل جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow" data-testid={`card-analysis-${analysis.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{analysis.clientName}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                            {getClientTypeLabel(analysis.clientType)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {analysis.field}
                          </span>
                          {analysis.createdAt && (
                            <span>{new Date(analysis.createdAt).toLocaleDateString("ar-EG")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewAnalysis(analysis)}
                        data-testid={`button-view-${analysis.id}`}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        عرض التحليل
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(analysis.id)}
                        data-testid={`button-delete-${analysis.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!viewAnalysis} onOpenChange={() => setViewAnalysis(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" dir="rtl">
          {viewAnalysis && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg">{viewAnalysis.clientName}</div>
                    <div className="text-sm font-normal text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {getClientTypeLabel(viewAnalysis.clientType)}
                      </span>
                      <span>{viewAnalysis.field}</span>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {viewAnalysis.currentMethod && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">الطريقة الحالية</div>
                      <div className="text-sm font-medium">{viewAnalysis.currentMethod}</div>
                    </div>
                  )}
                  {viewAnalysis.targetAudience && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">الجمهور المستهدف</div>
                      <div className="text-sm font-medium">{viewAnalysis.targetAudience}</div>
                    </div>
                  )}
                  {viewAnalysis.experience && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">الخبرة</div>
                      <div className="text-sm font-medium">{viewAnalysis.experience}</div>
                    </div>
                  )}
                </div>

                {viewAnalysis.challenges && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <div className="text-xs text-red-600 mb-1 font-medium">التحديات المذكورة</div>
                    <div className="text-sm">{viewAnalysis.challenges}</div>
                  </div>
                )}

                {viewAnalysis.goals && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-green-600 mb-1 font-medium">الأهداف</div>
                    <div className="text-sm">{viewAnalysis.goals}</div>
                  </div>
                )}

                {viewAnalysis.aiAnalysis && (
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg">التحليل بالذكاء الاصطناعي</h3>
                    </div>
                    <div className="prose prose-sm max-w-none leading-relaxed">
                      {renderMarkdownSafe(viewAnalysis.aiAnalysis)}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
