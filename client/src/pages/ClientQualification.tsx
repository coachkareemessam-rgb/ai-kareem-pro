import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserCheck, UserX, AlertTriangle, CheckCircle2, Target,
  Plus, Trash2, TrendingUp, Shield, Clock, Zap, Star,
  BookOpen, MessageSquare, HelpCircle, ArrowLeft, Brain,
  Loader2, Building2, FileText, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ClientQualification, Deal } from "@shared/schema";

interface QualificationCriteria {
  key: 'needLevel' | 'authorityLevel' | 'timelineLevel' | 'fitLevel';
  title: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  levels: { score: number; label: string; description: string }[];
  questions: string[];
  tips: string[];
}

const criteria: QualificationCriteria[] = [
  {
    key: 'needLevel',
    title: 'مستوى الحاجة',
    icon: Target,
    color: '#ef4444',
    bgColor: '#fef2f2',
    description: 'هل العميل لديه حاجة حقيقية وواضحة للمنتج؟',
    levels: [
      { score: 0, label: "لا حاجة", description: "العميل لا يعاني من مشكلة واضحة" },
      { score: 1, label: "حاجة ضعيفة", description: "يستكشف فقط - لا يوجد ألم حقيقي" },
      { score: 2, label: "حاجة متوسطة", description: "مشكلة موجودة لكنها ليست ملحة" },
      { score: 3, label: "حاجة قوية", description: "مشكلة واضحة ومحددة يبحث عن حل لها" },
      { score: 4, label: "حاجة ملحة", description: "مشكلة تؤثر على العمل يومياً ويحتاج حل فوري" },
    ],
    questions: [
      "ما المشكلة الأساسية التي تواجهك في عملك التعليمي حالياً؟",
      "كم مرة تواجه هذه المشكلة أسبوعياً؟",
      "ما تكلفة هذه المشكلة عليك (وقت/مال/فرص ضائعة)؟",
      "هل جربت حلول أخرى سابقاً؟ ما النتيجة؟",
      "إذا لم تحل المشكلة خلال 6 أشهر، ما التأثير المتوقع؟",
    ],
    tips: [
      "استمع أكثر مما تتكلم - نسبة 80/20",
      "اسأل 'لماذا' عدة مرات للوصول للمشكلة الجذرية",
      "لا تقدم حلاً قبل فهم المشكلة بالكامل",
      "دوّن كلمات العميل بالضبط لاستخدامها لاحقاً في العرض",
    ],
  },
  {
    key: 'authorityLevel',
    title: 'صلاحية القرار',
    icon: Shield,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    description: 'هل تتحدث مع صاحب القرار أم مجرد باحث؟',
    levels: [
      { score: 0, label: "غير محدد", description: "لم يتم تحديد صاحب القرار بعد" },
      { score: 1, label: "باحث فقط", description: "يجمع معلومات فقط وليس صاحب القرار" },
      { score: 2, label: "مؤثر", description: "يستطيع التأثير لكن ليس القرار النهائي" },
      { score: 3, label: "مشارك في القرار", description: "ضمن فريق اتخاذ القرار" },
      { score: 4, label: "صاحب القرار", description: "هو من يتخذ القرار النهائي ويوافق على الميزانية" },
    ],
    questions: [
      "من سيشارك في اتخاذ قرار الاشتراك؟",
      "هل أنت المسؤول عن ميزانية الأدوات التقنية؟",
      "ما عملية اتخاذ القرار المعتادة في مؤسستك؟",
      "هل هناك شخص آخر يجب أن يطلع على العرض؟",
    ],
    tips: [
      "حدد صاحب القرار مبكراً لتوفير الوقت",
      "إذا لم يكن صاحب القرار، اطلب اجتماع مشترك",
      "جهّز مواد يمكن للعميل مشاركتها مع صاحب القرار",
      "في المؤسسات الكبيرة، حدد Champion الداخلي",
    ],
  },
  {
    key: 'timelineLevel',
    title: 'الجدول الزمني',
    icon: Clock,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    description: 'متى يخطط العميل للبدء؟ هل هناك إلحاح؟',
    levels: [
      { score: 0, label: "غير محدد", description: "لم يتم تحديد موعد" },
      { score: 1, label: "لاحقاً", description: "'ربما السنة القادمة' - لا إلحاح" },
      { score: 2, label: "خلال 3-6 أشهر", description: "مهتم لكن ليس أولوية عاجلة" },
      { score: 3, label: "خلال 1-3 أشهر", description: "يخطط للبدء قريباً - أولوية واضحة" },
      { score: 4, label: "فوري", description: "يريد البدء الآن - حدث دافع واضح" },
    ],
    questions: [
      "متى تخطط للبدء في استخدام المنصة؟",
      "هل هناك حدث أو موعد نهائي يدفع التوقيت؟",
      "ما أولوية هذا المشروع مقارنة بمشاريعك الأخرى؟",
      "ما الذي يمنعك من البدء اليوم لو أردت؟",
    ],
    tips: [
      "اخلق إلحاح حقيقي (عرض محدود، موسم تسجيل)",
      "اربط التأخير بتكلفة (كل شهر تأخير = خسارة محددة)",
      "حدد خطوة تالية بموعد محدد دائماً",
      "إذا لم يكن أولوية، ضعه في Nurturing",
    ],
  },
  {
    key: 'fitLevel',
    title: 'التوافق مع المنتج',
    icon: Zap,
    color: '#10b981',
    bgColor: '#f0fdf4',
    description: 'هل المنتج مناسب فعلاً لاحتياجات العميل؟',
    levels: [
      { score: 0, label: "غير محدد", description: "لم يتم تقييم التوافق بعد" },
      { score: 1, label: "غير مناسب", description: "المنتج لا يحل مشكلة العميل" },
      { score: 2, label: "مناسب جزئياً", description: "يحل جزء من المشكلة فقط" },
      { score: 3, label: "مناسب", description: "يحل المشكلة الرئيسية بشكل جيد" },
      { score: 4, label: "مثالي", description: "توافق تام - الحل المثالي لاحتياجاته" },
    ],
    questions: [
      "ما الميزات الأهم بالنسبة لك في منصة تعليمية؟",
      "كم عدد الطلاب/المدربين المتوقع استخدامهم للمنصة؟",
      "هل تحتاج ميزات محددة (بث مباشر، اختبارات، شهادات)؟",
      "ما المنصات التي تستخدمها حالياً؟",
    ],
    tips: [
      "لا تبع منتجاً لا يناسب العميل - سيؤثر على السمعة",
      "ركّز على الميزات التي تحل مشكلة العميل بالضبط",
      "قدّم Demo مخصص بناءً على احتياجاته",
      "اعرض قصص نجاح لعملاء مشابهين",
    ],
  },
];

const industries = [
  "تعليم عام",
  "تعليم جامعي",
  "تدريب مهني",
  "تطوير ذات",
  "تعليم لغات",
  "تعليم تقني وبرمجة",
  "تعليم طبي وصحي",
  "تعليم ديني",
  "تعليم أطفال",
  "ريادة أعمال",
  "تسويق ومبيعات",
  "محاسبة ومالية",
  "تصميم وفنون",
  "رياضة ولياقة",
  "طبخ وتغذية",
  "أخرى",
];

function getQualificationResult(total: number): { label: string; color: string; bgColor: string; icon: any; advice: string } {
  if (total >= 14) return {
    label: "مؤهل بامتياز",
    color: "#10b981",
    bgColor: "#f0fdf4",
    icon: CheckCircle2,
    advice: "هذا عميل ممتاز! ركّز على إغلاق الصفقة بأسرع وقت. قدّم عرض مخصص واطلب الالتزام."
  };
  if (total >= 10) return {
    label: "مؤهل جيد",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    icon: UserCheck,
    advice: "عميل واعد! حدد النقاط الضعيفة وعالجها. تابع بقوة مع خطة عمل واضحة."
  };
  if (total >= 6) return {
    label: "يحتاج متابعة",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: AlertTriangle,
    advice: "عميل محتمل لكن يحتاج عمل إضافي. ركّز على بناء العلاقة وإثبات القيمة قبل الضغط للإغلاق."
  };
  return {
    label: "غير مؤهل حالياً",
    color: "#ef4444",
    bgColor: "#fef2f2",
    icon: UserX,
    advice: "ضع هذا العميل في قائمة الرعاية (Nurturing). تواصل معه كل شهر بمحتوى قيّم حتى تتغير ظروفه."
  };
}

export default function ClientQualificationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('evaluate');
  const [selectedCriteria, setSelectedCriteria] = useState<string>('needLevel');
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientType: 'trainer',
    clientIndustry: '',
    clientDescription: '',
    dealId: '',
    budget: '',
    needLevel: 0,
    authorityLevel: 0,
    timelineLevel: 0,
    fitLevel: 0,
    notes: '',
    actionPlan: '',
  });

  const { data: qualifications = [] } = useQuery<ClientQualification[]>({ queryKey: ["/api/qualifications"] });
  const { data: deals = [] } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });

  const totalScore = formData.needLevel + formData.authorityLevel + formData.timelineLevel + formData.fitLevel;
  const maxScore = 16;
  const scorePercentage = Math.round((totalScore / maxScore) * 100);
  const result = getQualificationResult(totalScore);

  const analyzeClient = async () => {
    if (!formData.clientIndustry || !formData.clientDescription) {
      toast({ title: "بيانات ناقصة", description: "يرجى تعبئة مجال العميل والوصف أولاً", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis('');
    setActiveTab('evaluate');

    try {
      const response = await fetch('/api/qualifications/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientType: formData.clientType,
          clientIndustry: formData.clientIndustry,
          clientDescription: formData.clientDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.content) {
                  accumulated += parsed.content;
                  setAiAnalysis(accumulated);
                  if (analysisRef.current) {
                    analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
                  }
                }
              } catch (e: any) {
                if (e?.message && e.message !== 'Unexpected end of JSON input') {
                  throw e;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحليل العميل", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const qualificationResult = result.label;
      await apiRequest("POST", "/api/qualifications", {
        ...formData,
        totalScore,
        qualificationResult,
        dealId: formData.dealId || null,
        aiPainPoints: aiAnalysis || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qualifications"] });
      toast({ title: "تم الحفظ", description: "تم حفظ تقييم تأهيل العميل بنجاح" });
      resetForm();
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في حفظ التقييم", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/qualifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qualifications"] });
      toast({ title: "تم الحذف", description: "تم حذف التقييم" });
    },
  });

  const resetForm = () => {
    setFormData({
      clientName: '', clientType: 'trainer', clientIndustry: '', clientDescription: '',
      dealId: '', budget: '',
      needLevel: 0, authorityLevel: 0, timelineLevel: 0, fitLevel: 0,
      notes: '', actionPlan: '',
    });
    setAiAnalysis('');
  };

  const currentCriteria = criteria.find(c => c.key === selectedCriteria)!;

  const clientTypes = [
    { value: 'trainer', label: 'مدرب' },
    { value: 'academy', label: 'أكاديمية' },
    { value: 'training_center', label: 'مركز تدريب' },
    { value: 'university', label: 'جامعة' },
    { value: 'school', label: 'مدرسة' },
  ];

  return (
    <div className="flex flex-col gap-4" data-testid="page-qualification">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-qualification-title">تأهيل العملاء</h1>
          <p className="text-muted-foreground">تحليل وتقييم العملاء المحتملين لتحديد جاهزيتهم للشراء</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {criteria.map((c) => {
          const score = formData[c.key];
          return (
            <Card
              key={c.key}
              className={cn("cursor-pointer transition-all hover:shadow-md", selectedCriteria === c.key && "ring-2")}
              style={selectedCriteria === c.key ? { borderColor: c.color, boxShadow: `0 0 0 2px ${c.color}30` } : undefined}
              onClick={() => setSelectedCriteria(c.key)}
              data-testid={`card-criteria-${c.key}`}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: c.bgColor }}>
                  <c.icon className="w-6 h-6" style={{ color: c.color }} />
                </div>
                <h3 className="font-bold text-sm">{c.title}</h3>
                <div className="flex justify-center gap-1 mt-2">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border-2"
                      style={{
                        background: i <= score ? c.color : 'transparent',
                        borderColor: c.color,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{score}/4</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="evaluate" data-testid="tab-evaluate">تقييم عميل جديد</TabsTrigger>
          <TabsTrigger value="guide" data-testid="tab-guide">دليل الأسئلة</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">التقييمات السابقة ({qualifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluate" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات العميل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>اسم العميل *</Label>
                      <Input
                        value={formData.clientName}
                        onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))}
                        placeholder="أدخل اسم العميل"
                        data-testid="input-client-name"
                      />
                    </div>
                    <div>
                      <Label>نوع العميل</Label>
                      <Select value={formData.clientType} onValueChange={v => setFormData(p => ({ ...p, clientType: v }))}>
                        <SelectTrigger data-testid="select-client-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {clientTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-500" />
                        مجال العميل *
                      </Label>
                      <Select value={formData.clientIndustry || 'none'} onValueChange={v => setFormData(p => ({ ...p, clientIndustry: v === 'none' ? '' : v }))}>
                        <SelectTrigger data-testid="select-client-industry">
                          <SelectValue placeholder="اختر مجال العميل" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">اختر المجال</SelectItem>
                          {industries.map(ind => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>ربط بصفقة (اختياري)</Label>
                      <Select value={formData.dealId || 'none'} onValueChange={v => setFormData(p => ({ ...p, dealId: v === 'none' ? '' : v }))}>
                        <SelectTrigger data-testid="select-deal">
                          <SelectValue placeholder="اختر صفقة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">بدون ربط</SelectItem>
                          {deals.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.clientName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>الميزانية التقريبية</Label>
                    <Input
                      value={formData.budget}
                      onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))}
                      placeholder="مثال: 500 ريال/شهر"
                      data-testid="input-budget"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-900">
                <CardHeader className="bg-gradient-to-l from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 rounded-t-lg">
                  <CardTitle className="text-lg flex items-center gap-2 text-purple-800 dark:text-purple-300">
                    <FileText className="w-5 h-5" />
                    وصف العميل وتحليل نقاط الألم
                  </CardTitle>
                  <p className="text-sm text-purple-600 dark:text-purple-400">اكتب وصفاً حراً عن العميل وسيقوم النظام بتحليل نقاط الألم والفرص البيعية</p>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <Label className="flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-500" />
                      وصف حر عن العميل *
                    </Label>
                    <Textarea
                      value={formData.clientDescription}
                      onChange={e => setFormData(p => ({ ...p, clientDescription: e.target.value }))}
                      placeholder="اكتب كل ما تعرفه عن العميل: وضعه الحالي، ما يستخدمه، مشاكله، ما يبحث عنه، حجم عمله، أي معلومات حصلت عليها من المحادثة..."
                      rows={5}
                      className="border-purple-200 dark:border-purple-800 focus:ring-purple-500"
                      data-testid="textarea-client-description"
                    />
                    <p className="text-xs text-muted-foreground mt-1">كلما كتبت تفاصيل أكثر، كان التحليل أدق وأفيد</p>
                  </div>

                  <Button
                    onClick={analyzeClient}
                    disabled={isAnalyzing || !formData.clientIndustry || !formData.clientDescription}
                    className="w-full bg-gradient-to-l from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                    data-testid="btn-analyze-client"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري التحليل...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 ml-2" />
                        تحليل العميل بالذكاء الاصطناعي
                      </>
                    )}
                  </Button>

                  {(aiAnalysis || isAnalyzing) && (
                    <div
                      ref={analysisRef}
                      className="p-4 rounded-xl bg-gradient-to-bl from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200 dark:border-purple-800 max-h-[500px] overflow-y-auto"
                      data-testid="div-ai-analysis"
                    >
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-200 dark:border-purple-800">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <h4 className="font-bold text-sm text-purple-800 dark:text-purple-300">تحليل الذكاء الاصطناعي</h4>
                        {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-purple-500 mr-auto" />}
                      </div>
                      <div className="prose prose-sm max-w-none text-purple-900 dark:text-purple-200 whitespace-pre-wrap leading-relaxed text-sm">
                        {aiAnalysis || 'جاري التحليل...'}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <currentCriteria.icon className="w-5 h-5" style={{ color: currentCriteria.color }} />
                    {currentCriteria.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{currentCriteria.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {currentCriteria.levels.map(level => (
                      <button
                        key={level.score}
                        className={cn(
                          "w-full p-3 rounded-lg border-2 text-right transition-all hover:shadow-sm",
                          formData[currentCriteria.key] === level.score
                            ? "border-current shadow-sm"
                            : "border-transparent bg-muted/30 hover:bg-muted/50"
                        )}
                        style={formData[currentCriteria.key] === level.score ? { borderColor: currentCriteria.color, background: currentCriteria.bgColor } : undefined}
                        onClick={() => setFormData(p => ({ ...p, [currentCriteria.key]: level.score }))}
                        data-testid={`btn-score-${currentCriteria.key}-${level.score}`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" style={formData[currentCriteria.key] === level.score ? { background: currentCriteria.color, color: 'white', borderColor: currentCriteria.color } : undefined}>
                            {level.score}/4
                          </Badge>
                          <div className="text-right">
                            <span className="font-semibold text-sm">{level.label}</span>
                            <p className="text-xs text-muted-foreground">{level.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      أسئلة مساعدة
                    </h4>
                    <ul className="space-y-1">
                      {currentCriteria.questions.map((q, i) => (
                        <li key={i} className="text-xs text-blue-700 dark:text-blue-300 flex gap-2">
                          <span className="shrink-0">{i + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900">
                    <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      نصائح
                    </h4>
                    <ul className="space-y-1">
                      {currentCriteria.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-amber-700 dark:text-amber-300 flex gap-2">
                          <span className="shrink-0">-</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملاحظات وخطة العمل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>ملاحظات عامة</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                      placeholder="أضف ملاحظاتك عن العميل..."
                      rows={3}
                      data-testid="textarea-notes"
                    />
                  </div>
                  <div>
                    <Label>خطة العمل التالية</Label>
                    <Textarea
                      value={formData.actionPlan}
                      onChange={e => setFormData(p => ({ ...p, actionPlan: e.target.value }))}
                      placeholder="ما الخطوات التالية مع هذا العميل؟"
                      rows={3}
                      data-testid="textarea-action-plan"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">نتيجة التأهيل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle
                          cx="60" cy="60" r="54" fill="none"
                          stroke={result.color}
                          strokeWidth="8"
                          strokeDasharray={`${(scorePercentage / 100) * 339.3} 339.3`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold" style={{ color: result.color }}>{totalScore}</span>
                        <span className="text-xs text-muted-foreground">من {maxScore}</span>
                      </div>
                    </div>

                    <Badge
                      className="text-sm px-4 py-1"
                      style={{ background: result.color, color: 'white' }}
                      data-testid="badge-result"
                    >
                      <result.icon className="w-4 h-4 ml-1" />
                      {result.label}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {criteria.map(c => (
                      <div key={c.key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{c.title}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(formData[c.key] / 4) * 100} className="w-16 h-2" />
                          <span className="font-semibold w-8 text-center">{formData[c.key]}/4</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg text-sm" style={{ background: result.bgColor }}>
                    <p style={{ color: result.color }}>{result.advice}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => createMutation.mutate()}
                      disabled={!formData.clientName || createMutation.isPending}
                      data-testid="btn-save-qualification"
                    >
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      حفظ التقييم
                    </Button>
                    <Button variant="outline" onClick={resetForm} data-testid="btn-reset">
                      إعادة تعيين
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="guide" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  خطوات التأهيل الفعّال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { step: 1, title: "البحث المسبق", desc: "اجمع معلومات عن العميل قبل التواصل (موقعه، حساباته، حجم عمله)", icon: "🔍" },
                  { step: 2, title: "الاستماع الفعّال", desc: "اسأل أسئلة مفتوحة واستمع للإجابات بعناية. دوّن النقاط المهمة", icon: "👂" },
                  { step: 3, title: "التقييم الموضوعي", desc: "قيّم كل بُعد من الأبعاد الأربعة بناءً على المعلومات المجمعة", icon: "📊" },
                  { step: 4, title: "تحديد خطة العمل", desc: "بناءً على النتيجة، حدد الخطوة التالية المناسبة", icon: "📋" },
                  { step: 5, title: "المتابعة المنتظمة", desc: "أعد التقييم بعد كل تفاعل جديد مع العميل", icon: "🔄" },
                ].map(item => (
                  <div key={item.step} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="text-2xl shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-semibold text-sm">الخطوة {item.step}: {item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  علامات تحذيرية (Red Flags)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "العميل يتجنب الإجابة على أسئلة محددة",
                  "يطلب عرض أسعار بدون الاستماع للقيمة",
                  "يقارن بالسعر فقط بدون اهتمام بالميزات",
                  "لا يستطيع تحديد مشكلة واضحة",
                  "يؤجل المواعيد باستمرار",
                  "ليس صاحب القرار ولا يستطيع ترتيب لقاء معه",
                  "يقول 'أرسل لي عرض وأنا أرد عليك' بدون تفاعل",
                  "ميزانيته أقل بكثير من أقل باقة متاحة",
                ].map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 shrink-0 mt-0.5">●</span>
                    <span>{flag}</span>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-sm text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    علامات إيجابية (Green Flags)
                  </h4>
                  {[
                    "يسأل أسئلة تفصيلية عن الميزات",
                    "يشارك تحدياته بصراحة",
                    "يحضر المواعيد في وقتها",
                    "يطلب Demo أو Trial",
                    "يسأل عن خطوات البدء والتنفيذ",
                    "يُشرك زملاء أو مدراء في المحادثة",
                  ].map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm mb-1.5">
                      <span className="text-green-500 shrink-0 mt-0.5">●</span>
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  سكربتات التأهيل - جمل جاهزة للاستخدام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "بداية المحادثة", script: "أهلاً [اسم العميل]، شكراً لوقتك. قبل ما أعرض عليك أي شيء، أحب أفهم وضعك الحالي وأشوف إذا نقدر نساعدك فعلاً. ممكن تحكيلي عن تجربتك الحالية مع المنصات التعليمية؟" },
                    { title: "استكشاف المشكلة", script: "أفهم... وهذا الوضع كيف يأثر على شغلك يومياً؟ يعني كم وقت تقضي أسبوعياً في حل هذه المشكلة بدل التركيز على المحتوى؟" },
                    { title: "تحديد صاحب القرار", script: "ممتاز! لمساعدتك بأفضل شكل، هل أنت من يتخذ قرار الاشتراك في أدوات جديدة، أم هناك شخص آخر يجب أن يكون معنا في الخطوة القادمة؟" },
                    { title: "فهم التوقيت", script: "متى تبي تبدأ فعلياً؟ هل هناك موسم تسجيل قادم أو حدث معين يدفعك للبدء قبله؟" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900">
                      <h4 className="font-semibold text-sm text-purple-800 dark:text-purple-300 mb-2">{item.title}</h4>
                      <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">"{item.script}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {qualifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-1">لا توجد تقييمات سابقة</h3>
                <p className="text-muted-foreground text-sm">ابدأ بتقييم عميل جديد من تبويب "تقييم عميل جديد"</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {qualifications.map(q => {
                const qResult = getQualificationResult(q.totalScore || 0);
                return (
                  <Card key={q.id} data-testid={`card-qualification-${q.id}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{q.clientName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {clientTypes.find(t => t.value === q.clientType)?.label || q.clientType}
                            {q.clientIndustry && ` • ${q.clientIndustry}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => deleteMutation.mutate(q.id)}
                          data-testid={`btn-delete-qualification-${q.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge style={{ background: qResult.color, color: 'white' }}>
                          <qResult.icon className="w-3 h-3 ml-1" />
                          {qResult.label}
                        </Badge>
                        <span className="text-lg font-bold" style={{ color: qResult.color }}>
                          {q.totalScore}/{maxScore}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {criteria.map(c => (
                          <div key={c.key} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{c.title}</span>
                            <div className="flex gap-0.5">
                              {[0, 1, 2, 3, 4].map(i => (
                                <div
                                  key={i}
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{
                                    background: i <= (q[c.key] || 0) ? c.color : '#e5e7eb',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {q.clientDescription && (
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          <span className="font-semibold text-purple-600">الوصف: </span>
                          {q.clientDescription.length > 100 ? q.clientDescription.slice(0, 100) + '...' : q.clientDescription}
                        </div>
                      )}

                      {q.aiPainPoints && (
                        <div className="text-xs bg-purple-50 dark:bg-purple-950/20 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                          <span className="font-semibold text-purple-600 flex items-center gap-1 mb-1">
                            <Brain className="w-3 h-3" />
                            تحليل AI متاح
                          </span>
                        </div>
                      )}

                      {q.notes && (
                        <p className="text-xs text-muted-foreground border-t pt-2">{q.notes}</p>
                      )}
                      {q.budget && (
                        <p className="text-xs"><span className="text-muted-foreground">الميزانية:</span> {q.budget}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString('ar-SA') : ''}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
