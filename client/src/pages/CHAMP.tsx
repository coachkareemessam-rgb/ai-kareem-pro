import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle, UserCheck, DollarSign, Clock,
  CheckCircle2, Lightbulb, Target, Save, RotateCcw,
  Star, TrendingUp, FileText, ArrowLeft, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { Deal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CHAMPDimension {
  key: 'challenges' | 'authority' | 'money' | 'priority';
  title: string;
  titleEn: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  purpose: string;
  questions: { q: string; why: string }[];
  redFlags: string[];
  greenFlags: string[];
  scoringGuide: { score: number; label: string; description: string }[];
  tips: string[];
  examples: { scenario: string; good: string; bad: string }[];
}

const champDimensions: CHAMPDimension[] = [
  {
    key: 'challenges',
    title: 'التحديات',
    titleEn: 'Challenges',
    icon: AlertTriangle,
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    description: 'فهم المشاكل والتحديات الحقيقية التي يواجهها العميل - الألم الذي يدفعه للبحث عن حل',
    purpose: 'بدون فهم التحدي الحقيقي، لا يمكنك تقديم حل مناسب. العميل يشتري حلاً لمشكلة، وليس منتجاً.',
    questions: [
      { q: "ما أكبر تحدي يواجهك حالياً في تقديم محتواك التعليمي؟", why: "يفتح الباب لفهم المشكلة الرئيسية" },
      { q: "ما الذي جربته سابقاً لحل هذه المشكلة؟ وما النتيجة؟", why: "يكشف عن الحلول الفاشلة ويحدد توقعات العميل" },
      { q: "كيف يؤثر هذا التحدي على عملك يومياً؟", why: "يقيس حجم الألم وإلحاح الحاجة للحل" },
      { q: "إذا لم تحل هذه المشكلة خلال 6 أشهر، ما التأثير المتوقع؟", why: "يخلق إلحاح ويوضح تكلفة عدم التحرك" },
      { q: "ما الشكل المثالي للحل من وجهة نظرك؟", why: "يكشف عن توقعات العميل ومعايير الحكم على الحل" },
    ],
    redFlags: [
      "العميل لا يستطيع تحديد مشكلة واضحة",
      "يقول 'أنا فقط أستكشف' بدون حاجة حقيقية",
      "المشكلة ليست ضمن ما يحله منتجك",
      "لا يوجد ألم حقيقي - مجرد فضول",
    ],
    greenFlags: [
      "العميل يصف مشكلة واضحة ومحددة",
      "جرّب حلول سابقة ولم تنجح",
      "المشكلة تؤثر على إيراداته أو نموه",
      "يبحث بنشاط عن حل الآن",
    ],
    scoringGuide: [
      { score: 1, label: "ضعيف", description: "لا توجد مشكلة واضحة أو حاجة حقيقية" },
      { score: 2, label: "متوسط", description: "مشكلة موجودة لكنها ليست ملحة" },
      { score: 3, label: "جيد", description: "مشكلة واضحة ومحددة يبحث عن حل لها" },
      { score: 4, label: "ممتاز", description: "مشكلة ملحة تؤثر على العمل ويحتاج حل فوري" },
    ],
    tips: [
      "اسأل 'لماذا' 3 مرات للوصول للمشكلة الجذرية",
      "استمع أكثر مما تتحدث - نسبة 80/20",
      "دوّن كلمات العميل بالضبط لاستخدامها لاحقاً",
      "لا تقدم حلاً قبل فهم المشكلة بالكامل",
    ],
    examples: [
      {
        scenario: "مدرب لديه محتوى ويريد بيعه أونلاين",
        good: "أفهم أنك تقضي وقت كبير في إدارة الطلاب يدوياً وهذا يأخذ من وقت إنشاء المحتوى. خلّني أوريك كيف نحل هذه المشكلة بالضبط.",
        bad: "منصتنا عندها ميزات كثيرة! خلّني أعرضها لك كلها.",
      },
    ],
  },
  {
    key: 'authority',
    title: 'صاحب القرار',
    titleEn: 'Authority',
    icon: UserCheck,
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'تحديد من يملك صلاحية اتخاذ قرار الشراء والموافقة على الميزانية',
    purpose: 'التحدث مع الشخص الخطأ يعني إضاعة الوقت. يجب التأكد من أنك تتحدث مع من يملك القرار أو الوصول إليه.',
    questions: [
      { q: "من سيشارك في اتخاذ قرار الاشتراك في المنصة؟", why: "يكشف عن عدد صناع القرار ودورهم" },
      { q: "هل أنت المسؤول عن ميزانية التقنية/التعليم؟", why: "يحدد ما إذا كان هو صاحب القرار المالي" },
      { q: "ما عملية اتخاذ القرار المعتادة في مؤسستك؟", why: "يكشف عن الخطوات والوقت المتوقع" },
      { q: "هل هناك شخص آخر يجب أن يكون في الاجتماع القادم؟", why: "يساعد في تضمين كل صناع القرار" },
      { q: "هل سبق واتخذتم قراراً مشابهاً؟ كيف تمت العملية؟", why: "يعطي خريطة واضحة لعملية القرار" },
    ],
    redFlags: [
      "العميل لا يعرف من يتخذ القرار",
      "'سأعرض الموضوع على المدير' بدون موعد محدد",
      "عملية قرار معقدة بأكثر من 3 مستويات",
      "العميل مجرد باحث (researcher) وليس صاحب قرار",
    ],
    greenFlags: [
      "العميل هو صاحب القرار مباشرة",
      "صاحب القرار متحمس ومشارك في المحادثات",
      "عملية قرار واضحة وقصيرة",
      "ميزانية مخصصة ومعتمدة مسبقاً",
    ],
    scoringGuide: [
      { score: 1, label: "ضعيف", description: "ليس صاحب قرار ولا يستطيع الوصول إليه" },
      { score: 2, label: "متوسط", description: "يستطيع التأثير لكن ليس القرار النهائي" },
      { score: 3, label: "جيد", description: "صاحب قرار مشارك أو يمكن الوصول إليه" },
      { score: 4, label: "ممتاز", description: "صاحب القرار المباشر ومتحمس للحل" },
    ],
    tips: [
      "اسأل عن Authority مبكراً لتوفير الوقت",
      "إذا لم يكن صاحب القرار، اطلب اجتماع مشترك",
      "في المؤسسات الكبيرة، حدد Champion الداخلي",
      "جهّز مواد يمكن للعميل مشاركتها مع صاحب القرار",
    ],
    examples: [
      {
        scenario: "أكاديمية صغيرة - المدير هو صاحب القرار",
        good: "هل ستكون أنت من يتخذ القرار النهائي بشأن المنصة؟ ممتاز! هذا يسهل العملية كثيراً.",
        bad: "أرسل لي إيميل المدير وأنا أتواصل معه مباشرة (يهمّش العميل الحالي).",
      },
    ],
  },
  {
    key: 'money',
    title: 'الميزانية',
    titleEn: 'Money',
    icon: DollarSign,
    color: '#10b981',
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    description: 'فهم الميزانية المتاحة والاستعداد للاستثمار في الحل',
    purpose: 'معرفة الميزانية مبكراً يمنع إضاعة الوقت على عملاء لا يستطيعون الشراء ويساعد في تقديم العرض المناسب.',
    questions: [
      { q: "ما الميزانية التقريبية المخصصة لهذا المشروع؟", why: "يحدد نطاق العرض المناسب" },
      { q: "كم تنفق حالياً على الأدوات والمنصات التعليمية؟", why: "يعطي مرجعية لمقارنة السعر" },
      { q: "ما تكلفة عدم حل هذه المشكلة شهرياً/سنوياً؟", why: "يبرر الاستثمار ويخلق ROI واضح" },
      { q: "هل تفضل الدفع الشهري أم السنوي؟", why: "يكشف عن تفضيلات الدفع والالتزام" },
      { q: "ما العائد المتوقع الذي يبرر هذا الاستثمار بالنسبة لك؟", why: "يربط السعر بالقيمة المتوقعة" },
    ],
    redFlags: [
      "'ليس عندي ميزانية أبداً'",
      "يطلب أرخص سعر دائماً بدون اهتمام بالقيمة",
      "ميزانية أقل بكثير من أقل باقة",
      "لا يستطيع تبرير أي إنفاق لمؤسسته",
    ],
    greenFlags: [
      "ميزانية محددة ومعتمدة",
      "يركز على القيمة (ROI) وليس السعر فقط",
      "مستعد للدفع السنوي (التزام أعلى)",
      "ينفق حالياً على حلول بديلة (قدرة شرائية مثبتة)",
    ],
    scoringGuide: [
      { score: 1, label: "ضعيف", description: "لا ميزانية أو أقل بكثير من المطلوب" },
      { score: 2, label: "متوسط", description: "ميزانية محدودة - يحتاج تبرير" },
      { score: 3, label: "جيد", description: "ميزانية مناسبة ومرنة" },
      { score: 4, label: "ممتاز", description: "ميزانية معتمدة وجاهزة للإنفاق" },
    ],
    tips: [
      "لا تذكر السعر قبل بناء القيمة",
      "استخدم حاسبة ROI لتبرير الاستثمار",
      "قدّم خيارات متعددة (3 باقات)",
      "ركّز على تكلفة عدم التحرك (Cost of Inaction)",
    ],
    examples: [
      {
        scenario: "مدرب يقول 'السعر غالي'",
        good: "أتفهم ذلك. خلّنا نحسبها: إذا كان عندك 50 طالب يدفعون 100 ريال/شهر = 5000 ريال. اشتراكك معنا 200 ريال/شهر. العائد 25 ضعف.",
        bad: "خلاص أعطيك خصم 50% (يقلل قيمة المنتج).",
      },
    ],
  },
  {
    key: 'priority',
    title: 'الأولوية والتوقيت',
    titleEn: 'Priority / Timeline',
    icon: Clock,
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: 'تقييم مدى إلحاح الحاجة وأولوية المشروع مقارنة بالمشاريع الأخرى',
    purpose: 'حتى لو العميل مؤهل في كل شيء، إذا لم يكن المشروع أولوية = الصفقة ستتأخر أو تموت.',
    questions: [
      { q: "متى تخطط للبدء في استخدام المنصة؟", why: "يحدد الجدول الزمني المتوقع" },
      { q: "هل هناك حدث أو موعد نهائي يدفع التوقيت؟", why: "يكشف عن Deadline طبيعي يخلق إلحاح" },
      { q: "ما أولوية هذا المشروع مقارنة بمشاريعك الأخرى؟", why: "يحدد مكانة المشروع في أولويات العميل" },
      { q: "ما الذي يمنعك من البدء اليوم لو أردت؟", why: "يكشف عن العوائق الحقيقية" },
      { q: "إذا حللنا [العائق]، هل ستبدأ فوراً؟", why: "يعزل العائق ويختبر الجدية" },
    ],
    redFlags: [
      "'ربما السنة القادمة'",
      "لا يوجد Deadline أو حدث دافع",
      "المشروع ليس في أول 3 أولويات",
      "يتجنب تحديد مواعيد محددة",
    ],
    greenFlags: [
      "يريد البدء خلال 30 يوم",
      "هناك حدث دافع (إطلاق، موسم، منافس)",
      "المشروع أولوية رقم 1 أو 2",
      "سأل عن خطوات البدء الفوري",
    ],
    scoringGuide: [
      { score: 1, label: "ضعيف", description: "لا إلحاح ولا جدول زمني - 'ربما لاحقاً'" },
      { score: 2, label: "متوسط", description: "مهتم لكن ليس أولوية عاجلة - خلال 3-6 أشهر" },
      { score: 3, label: "جيد", description: "يخطط للبدء خلال 1-3 أشهر - أولوية واضحة" },
      { score: 4, label: "ممتاز", description: "يريد البدء فوراً - حدث دافع واضح" },
    ],
    tips: [
      "اخلق إلحاح حقيقي (عرض محدود، مقعد محجوز)",
      "اربط التأخير بتكلفة (كل شهر تأخير = X خسارة)",
      "حدد خطوة تالية بموعد محدد دائماً",
      "إذا لم يكن أولوية، ضعه في Nurturing بدل إضاعة الوقت",
    ],
    examples: [
      {
        scenario: "عميل يقول 'أحتاج وقت للتفكير'",
        good: "أتفهم ذلك. لمساعدتك في القرار: ما الشيء الوحيد الذي لو تأكدت منه ستبدأ معنا فوراً؟",
        bad: "خذ وقتك وتواصل معنا لما تكون جاهز (يفقد السيطرة على الصفقة).",
      },
    ],
  },
];

interface CHAMPScore {
  challenges: number;
  authority: number;
  money: number;
  priority: number;
  notes: { challenges: string; authority: string; money: string; priority: string };
}

const initialScore: CHAMPScore = {
  challenges: 0, authority: 0, money: 0, priority: 0,
  notes: { challenges: '', authority: '', money: '', priority: '' },
};

function ScoreIndicator({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
          style={{
            background: i <= score ? color : 'transparent',
            borderColor: color,
            color: i <= score ? 'white' : color,
          }}
        >
          {i}
        </div>
      ))}
    </div>
  );
}

export default function CHAMP() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeDimension, setActiveDimension] = useState<string>('challenges');
  const [analysisMode, setAnalysisMode] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string>('');
  const [champScore, setChampScore] = useState<CHAMPScore>(initialScore);

  const { data: deals = [] } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });
  const activeDeals = deals.filter(d => d.status !== 'closed_lost' && d.status !== 'closed_won');

  const totalScore = champScore.challenges + champScore.authority + champScore.money + champScore.priority;
  const maxScore = 16;
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  const getScoreLabel = () => {
    if (totalScore >= 14) return { label: "مؤهل بامتياز - اغلق فوراً!", color: "#10b981" };
    if (totalScore >= 10) return { label: "مؤهل جيد - تابع بقوة", color: "#3b82f6" };
    if (totalScore >= 6) return { label: "يحتاج عمل إضافي", color: "#f59e0b" };
    return { label: "غير مؤهل - Nurturing", color: "#ef4444" };
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDealId) return;
      const notes = `CHAMP Score: ${totalScore}/16\nC: ${champScore.challenges}/4 - ${champScore.notes.challenges}\nH: (not used)\nA: ${champScore.authority}/4 - ${champScore.notes.authority}\nM: ${champScore.money}/4 - ${champScore.notes.money}\nP: ${champScore.priority}/4 - ${champScore.notes.priority}`;
      await apiRequest("PATCH", `/api/deals/${selectedDealId}`, { notes, awarenessLevel: getScoreLabel().label });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({ title: "تم الحفظ", description: "تم حفظ تحليل CHAMP للصفقة" });
    },
  });

  const resetAnalysis = () => {
    setChampScore(initialScore);
    setSelectedDealId('');
  };

  const currentDimension = champDimensions.find(d => d.key === activeDimension)!;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-champ-title">إطار CHAMP لتأهيل العملاء</h1>
          <p className="text-muted-foreground">منهجية علمية لتقييم جودة العملاء المحتملين وتحديد أولويات المتابعة</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {champDimensions.map((dim) => (
          <Card
            key={dim.key}
            className={cn("cursor-pointer transition-all hover:shadow-md", activeDimension === dim.key && "ring-2")}
            style={activeDimension === dim.key ? { borderColor: dim.color, boxShadow: `0 0 0 2px ${dim.color}30` } : undefined}
            onClick={() => { setActiveDimension(dim.key); setActiveTab('learn'); }}
            data-testid={`card-champ-${dim.key}`}
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: dim.bgColor }}>
                <dim.icon className="w-6 h-6" style={{ color: dim.color }} />
              </div>
              <h3 className="font-bold text-sm">{dim.title}</h3>
              <p className="text-[10px] text-muted-foreground">{dim.titleEn}</p>
              {analysisMode && (
                <div className="mt-2">
                  <ScoreIndicator score={champScore[dim.key]} color={dim.color} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="learn" data-testid="tab-learn">تعلّم الإطار</TabsTrigger>
          <TabsTrigger value="analyze" data-testid="tab-analyze">تحليل صفقة</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ما هو إطار CHAMP؟</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  إطار CHAMP هو منهجية متقدمة لتأهيل العملاء المحتملين، تبدأ بفهم <strong>التحديات</strong> (Challenges) بدلاً من الميزانية، مما يجعلها أكثر فعالية من الأطر التقليدية مثل BANT.
                </p>
                <div className="space-y-3">
                  {champDimensions.map((dim, i) => (
                    <div key={dim.key} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: dim.bgColor }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: dim.color }}>
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm" style={{ color: dim.color }}>{dim.title} ({dim.titleEn})</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{dim.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">لماذا CHAMP وليس BANT؟</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    مميزات CHAMP
                  </h4>
                  <ul className="space-y-1.5 text-xs text-green-700 dark:text-green-300">
                    <li className="flex gap-2"><span>✓</span> يبدأ بالتحديات وليس الميزانية - يبني علاقة أقوى</li>
                    <li className="flex gap-2"><span>✓</span> يركز على فهم العميل قبل البيع</li>
                    <li className="flex gap-2"><span>✓</span> مناسب للبيع الاستشاري (Consultative Selling)</li>
                    <li className="flex gap-2"><span>✓</span> يكشف الاحتياجات الحقيقية وليس المعلنة فقط</li>
                    <li className="flex gap-2"><span>✓</span> يساعد في تخصيص العرض حسب كل عميل</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    مشاكل BANT التقليدي
                  </h4>
                  <ul className="space-y-1.5 text-xs text-red-700 dark:text-red-300">
                    <li className="flex gap-2"><span>✕</span> يبدأ بالميزانية - يصد العميل مبكراً</li>
                    <li className="flex gap-2"><span>✕</span> لا يفهم المشكلة الحقيقية</li>
                    <li className="flex gap-2"><span>✕</span> يعامل كل العملاء بنفس الطريقة</li>
                    <li className="flex gap-2"><span>✕</span> يفوّت فرص كثيرة بسبب تصفية مبكرة</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    نظام التقييم
                  </h4>
                  <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                    <p>كل بُعد يُقيّم من 1 إلى 4 نقاط | المجموع الأقصى: 16 نقطة</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="p-2 rounded bg-green-100 dark:bg-green-900/20 text-center"><strong>14-16</strong><br/>مؤهل بامتياز</div>
                      <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/20 text-center"><strong>10-13</strong><br/>مؤهل جيد</div>
                      <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900/20 text-center"><strong>6-9</strong><br/>يحتاج عمل</div>
                      <div className="p-2 rounded bg-red-100 dark:bg-red-900/20 text-center"><strong>1-5</strong><br/>Nurturing</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learn" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              {champDimensions.map((dim) => (
                <Card
                  key={dim.key}
                  className={cn("cursor-pointer transition-all hover:shadow-sm p-3", activeDimension === dim.key && "ring-2")}
                  style={activeDimension === dim.key ? { borderColor: dim.color } : undefined}
                  onClick={() => setActiveDimension(dim.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: dim.bgColor }}>
                      <dim.icon className="w-5 h-5" style={{ color: dim.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{dim.title}</h4>
                      <p className="text-[10px] text-muted-foreground">{dim.titleEn}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="lg:col-span-2">
              <CardHeader style={{ background: currentDimension.bgColor }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${currentDimension.color}20` }}>
                    <currentDimension.icon className="w-5 h-5" style={{ color: currentDimension.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{currentDimension.title} ({currentDimension.titleEn})</CardTitle>
                    <CardDescription>{currentDimension.purpose}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-420px)]">
                <CardContent className="space-y-5 pt-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" style={{ color: currentDimension.color }} />
                      أسئلة يجب طرحها:
                    </h4>
                    <div className="space-y-2">
                      {currentDimension.questions.map((q, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-card" data-testid={`question-${activeDimension}-${i}`}>
                          <p className="text-sm font-medium mb-1">"{q.q}"</p>
                          <p className="text-xs text-muted-foreground flex items-start gap-1">
                            <Lightbulb className="w-3 h-3 shrink-0 mt-0.5" style={{ color: currentDimension.color }} />
                            {q.why}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900">
                      <h4 className="font-semibold text-xs text-green-800 dark:text-green-300 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> إشارات إيجابية
                      </h4>
                      <ul className="space-y-1">
                        {currentDimension.greenFlags.map((f, i) => (
                          <li key={i} className="text-[11px] text-green-700 dark:text-green-300 flex gap-1"><span>✓</span>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900">
                      <h4 className="font-semibold text-xs text-red-800 dark:text-red-300 mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> إشارات تحذيرية
                      </h4>
                      <ul className="space-y-1">
                        {currentDimension.redFlags.map((f, i) => (
                          <li key={i} className="text-[11px] text-red-700 dark:text-red-300 flex gap-1"><span>✕</span>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">دليل التقييم:</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {currentDimension.scoringGuide.map((g) => (
                        <div key={g.score} className="p-2 rounded-lg border text-center">
                          <div className="w-7 h-7 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold" style={{ background: currentDimension.color }}>
                            {g.score}
                          </div>
                          <p className="font-semibold text-[11px]">{g.label}</p>
                          <p className="text-[9px] text-muted-foreground mt-0.5">{g.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border" style={{ background: `${currentDimension.color}08` }}>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" style={{ color: currentDimension.color }} />
                      نصائح عملية:
                    </h4>
                    <ul className="space-y-1">
                      {currentDimension.tips.map((t, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2"><Star className="w-3 h-3 shrink-0 mt-0.5" style={{ color: currentDimension.color }} />{t}</li>
                      ))}
                    </ul>
                  </div>

                  {currentDimension.examples.map((ex, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" style={{ color: currentDimension.color }} />
                        مثال تطبيقي: {ex.scenario}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900">
                          <p className="text-[10px] font-semibold text-green-700 dark:text-green-300 mb-1">الطريقة الصحيحة ✓</p>
                          <p className="text-xs text-green-700 dark:text-green-300">"{ex.good}"</p>
                        </div>
                        <div className="p-2 rounded bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900">
                          <p className="text-[10px] font-semibold text-red-700 dark:text-red-300 mb-1">الطريقة الخاطئة ✕</p>
                          <p className="text-xs text-red-700 dark:text-red-300">"{ex.bad}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyze" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  تحليل CHAMP للصفقة
                </CardTitle>
                <CardDescription>اختر صفقة وقيّم كل بُعد من 1 إلى 4 مع تدوين الملاحظات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>اختر الصفقة:</Label>
                  <Select value={selectedDealId} onValueChange={setSelectedDealId}>
                    <SelectTrigger data-testid="select-deal-champ"><SelectValue placeholder="اختر صفقة لتحليلها" /></SelectTrigger>
                    <SelectContent>
                      {activeDeals.map(deal => (
                        <SelectItem key={deal.id} value={deal.id}>{deal.clientName} - {deal.stage}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedDealId && (
                  <div className="space-y-5">
                    {champDimensions.map((dim) => (
                      <div key={dim.key} className="p-4 rounded-lg border" style={{ background: `${dim.bgColor}80` }} data-testid={`analysis-${dim.key}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <dim.icon className="w-5 h-5" style={{ color: dim.color }} />
                            <h4 className="font-semibold text-sm">{dim.title} ({dim.titleEn})</h4>
                          </div>
                          <ScoreIndicator score={champScore[dim.key]} color={dim.color} />
                        </div>

                        <div className="flex gap-2 mb-3">
                          {[1, 2, 3, 4].map(score => {
                            const guide = dim.scoringGuide.find(g => g.score === score)!;
                            return (
                              <Button
                                key={score}
                                size="sm"
                                variant={champScore[dim.key] === score ? "default" : "outline"}
                                className="flex-1 text-[10px] h-auto py-1.5"
                                style={champScore[dim.key] === score ? { background: dim.color } : undefined}
                                onClick={() => setChampScore(prev => ({ ...prev, [dim.key]: score }))}
                                data-testid={`score-${dim.key}-${score}`}
                              >
                                {guide.label}
                              </Button>
                            );
                          })}
                        </div>

                        <Textarea
                          placeholder={`ملاحظاتك عن ${dim.title}...`}
                          className="text-sm h-20 resize-none"
                          value={champScore.notes[dim.key]}
                          onChange={(e) => setChampScore(prev => ({
                            ...prev,
                            notes: { ...prev.notes, [dim.key]: e.target.value }
                          }))}
                          data-testid={`notes-${dim.key}`}
                        />
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => saveMutation.mutate()}
                        disabled={!selectedDealId || saveMutation.isPending}
                        data-testid="button-save-champ"
                      >
                        <Save className="w-4 h-4" />
                        حفظ التحليل في الصفقة
                      </Button>
                      <Button variant="outline" onClick={resetAnalysis} className="gap-2" data-testid="button-reset-champ">
                        <RotateCcw className="w-4 h-4" />
                        إعادة تعيين
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ملخص التقييم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedDealId ? (
                  <>
                    <div className="text-center">
                      <div className="text-4xl font-bold" style={{ color: getScoreLabel().color }}>{totalScore}</div>
                      <p className="text-sm text-muted-foreground">من {maxScore}</p>
                      <Progress value={scorePercentage} className="mt-2 h-3" />
                      <Badge className="mt-3" style={{ background: getScoreLabel().color }}>
                        {getScoreLabel().label}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {champDimensions.map((dim) => (
                        <div key={dim.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <dim.icon className="w-4 h-4" style={{ color: dim.color }} />
                            <span className="text-sm">{dim.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(champScore[dim.key] / 4) * 100}%`, background: dim.color }} />
                            </div>
                            <span className="text-sm font-bold" style={{ color: dim.color }}>{champScore[dim.key]}/4</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg border" style={{ background: `${getScoreLabel().color}10` }}>
                      <h4 className="font-semibold text-sm mb-2">التوصية:</h4>
                      <p className="text-xs text-muted-foreground">
                        {totalScore >= 14 ? "العميل مؤهل بشكل ممتاز! انتقل لمرحلة العرض والإغلاق فوراً. لا تؤجل." :
                         totalScore >= 10 ? "العميل مؤهل جيداً. ركّز على تقوية النقاط الضعيفة قبل الانتقال للمرحلة التالية." :
                         totalScore >= 6 ? "يحتاج عمل إضافي. حدد البُعد الأضعف واعمل على تقويته قبل المتابعة." :
                         "غير مؤهل حالياً. ضعه في برنامج Nurturing وأعد التقييم بعد 30 يوم."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">اختر صفقة من القائمة لبدء التحليل</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
