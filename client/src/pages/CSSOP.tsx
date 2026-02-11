import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus, GraduationCap, FileEdit, Rocket, BarChart3,
  TrendingUp, Heart, CheckCircle2, AlertTriangle, Lightbulb,
  Phone, Mail, Video, Clock, Star, MessageSquare, Target,
  ArrowLeft, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CSStageDetail {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  icon: any;
  objective: string;
  responsible: string;
  duration: string;
  subSteps: { title: string; description: string; icon: any; tips?: string }[];
  scripts: string[];
  successCriteria: string[];
  commonMistakes: string[];
  kpis: { label: string; target: string }[];
  tools: string[];
}

const csStagesData: CSStageDetail[] = [
  {
    id: "onboarding",
    title: "الترحيب والتهيئة",
    subtitle: "Onboarding",
    color: "#6366f1",
    bgColor: "#eef2ff",
    icon: UserPlus,
    objective: "استقبال العميل الجديد وتهيئة حسابه وضمان بداية ناجحة",
    responsible: "CS Specialist",
    duration: "أول 48 ساعة",
    subSteps: [
      { title: "رسالة الترحيب", description: "إرسال رسالة ترحيب شخصية مع تفاصيل الحساب ومعلومات التواصل", icon: Mail, tips: "أرسل الرسالة خلال أول ساعة من الاشتراك - السرعة تبني الثقة" },
      { title: "إعداد الحساب", description: "تفعيل الحساب - رفع الشعار والهوية البصرية - ضبط الإعدادات الأساسية", icon: CheckCircle2, tips: "جهّز الحساب قبل جلسة التدريب حتى يرى العميل نتيجة فورية" },
      { title: "جلسة التعارف", description: "مكالمة 15-20 دقيقة لفهم أهداف العميل وتوقعاته وأولوياته", icon: Phone, tips: "اسأل: ما أهم 3 أشياء تريد تحقيقها في أول شهر؟" },
      { title: "خطة النجاح", description: "إنشاء خطة واضحة بأهداف قابلة للقياس ومواعيد محددة للأسبوعين الأولين", icon: Target, tips: "اجعل الخطة بسيطة: 3 أهداف فقط للأسبوع الأول" },
    ],
    scripts: [
      "مرحباً [الاسم]! أهلاً وسهلاً بك في عائلة أكاديميات 🎉 أنا [اسمك] من فريق نجاح العملاء، وسأكون نقطة تواصلك الأساسية. حابب أحدد معك موعد لجلسة تعارف سريعة نفهم فيها أهدافك ونبدأ نشتغل سوا!",
      "تم تفعيل حسابك بنجاح! إليك خطة الأسبوع الأول: 1) رفع أول 3 دروس 2) تخصيص صفحتك الرئيسية 3) دعوة 5 طلاب للتجربة. أنا هنا لمساعدتك في كل خطوة!",
    ],
    successCriteria: ["إرسال رسالة ترحيب خلال ساعة", "جلسة تعارف خلال 48 ساعة", "خطة نجاح مكتوبة ومشاركة مع العميل"],
    commonMistakes: ["التأخر في التواصل الأولي", "عدم فهم أهداف العميل", "خطة غير واضحة أو طموحة جداً"],
    kpis: [{ label: "وقت أول تواصل", target: "< ساعة" }, { label: "إتمام Onboarding", target: "48 ساعة" }],
    tools: ["واتساب بزنس", "إيميل", "زوم", "نموذج خطة النجاح"],
  },
  {
    id: "training",
    title: "التدريب والتمكين",
    subtitle: "Training & Enablement",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    icon: GraduationCap,
    objective: "تدريب العميل على استخدام المنصة بفعالية وتمكينه من العمل باستقلالية",
    responsible: "CS Specialist",
    duration: "الأسبوع 1-2",
    subSteps: [
      { title: "جلسة تدريب أساسية", description: "شرح الوظائف الأساسية: رفع المحتوى، إنشاء الدورات، إدارة الطلاب", icon: Video, tips: "سجّل الجلسة وأرسلها للعميل كمرجع - 80% من العملاء يرجعون للتسجيل" },
      { title: "تدريب على التصميم", description: "تعليم العميل استخدام Canva لتصميم الصور والبانرات", icon: Star, tips: "جهّز قوالب جاهزة يقدر العميل يعدل عليها مباشرة" },
      { title: "تدريب على المحتوى", description: "مساعدة العميل في كتابة وتنظيم محتواه التعليمي باستخدام ChatGPT", icon: FileEdit, tips: "أعطِ العميل أمثلة على prompts فعّالة لكتابة المحتوى" },
      { title: "تدريب متقدم", description: "ميزات متقدمة: الامتحانات، الشهادات، التقارير، التحليلات", icon: BarChart3, tips: "قدّم التدريب المتقدم فقط بعد إتقان الأساسيات" },
    ],
    scripts: [
      "جلسة اليوم رح نتعلم فيها 3 أشياء أساسية: كيف ترفع محتواك، كيف تنظم دوراتك، وكيف تضيف طلاب. الجلسة تقريباً 30 دقيقة وسأسجلها لك.",
      "أرسل لك فيديو قصير يشرح كيف تستخدم [الميزة]. لو عندك أي سؤال، أرسل لي والله ما أقصّر معك!",
    ],
    successCriteria: ["إتمام التدريب الأساسي", "العميل يرفع أول محتوى بنفسه", "استخدام 3+ ميزات أساسية"],
    commonMistakes: ["تدريب كل شيء دفعة واحدة", "عدم تسجيل الجلسات", "عدم المتابعة بعد التدريب"],
    kpis: [{ label: "إتمام التدريب الأساسي", target: "100% خلال أسبوع" }, { label: "رفع أول محتوى", target: "خلال 3 أيام" }],
    tools: ["زوم", "Loom لتسجيل الفيديو", "ChatGPT", "Canva"],
  },
  {
    id: "content_setup",
    title: "بناء المحتوى",
    subtitle: "Content Setup",
    color: "#0ea5e9",
    bgColor: "#f0f9ff",
    icon: FileEdit,
    objective: "مساعدة العميل في بناء وتنظيم محتواه التعليمي على المنصة",
    responsible: "CS Specialist",
    duration: "الأسبوع 2-4",
    subSteps: [
      { title: "تخطيط هيكل المحتوى", description: "مساعدة العميل في تنظيم دوراته: أقسام، دروس، مسارات تعليمية", icon: Target, tips: "ابدأ بدورة واحدة كاملة قبل الانتقال لأكثر من دورة" },
      { title: "كتابة المحتوى بـ ChatGPT", description: "استخدام ChatGPT لكتابة وصف الدورات، عناوين الدروس، محتوى تسويقي", icon: MessageSquare, tips: "جهّز prompts جاهزة للعميل: 'اكتب وصف دورة عن [الموضوع] في 150 كلمة'" },
      { title: "تصميم المواد بـ Canva", description: "تصميم أغلفة الدورات، صور الدروس، شهادات الإتمام", icon: Star, tips: "استخدم قوالب Canva المتوافقة مع هوية العميل البصرية" },
      { title: "رفع وتنظيم المحتوى", description: "رفع الفيديوهات، الملفات، الاختبارات وترتيبها بشكل منطقي", icon: CheckCircle2, tips: "راجع المحتوى مع العميل قبل النشر للتأكد من الجودة" },
    ],
    scripts: [
      "خلّنا نبدأ ببناء أول دورة لك. ما هو الموضوع الأساسي؟ وكم درس تتوقع تكون فيها؟ بعد ما نخطط الهيكل، أساعدك في كتابة المحتوى باستخدام ChatGPT.",
      "جهّزت لك قالب Canva لغلاف الدورة بناءً على هويتك البصرية. فقط غيّر العنوان والصورة وبيكون جاهز! 🎨",
    ],
    successCriteria: ["إكمال أول دورة كاملة", "3+ دروس مرفوعة", "صفحة الدورة جاهزة للنشر"],
    commonMistakes: ["محتوى غير منظم", "جودة ضعيفة في التصميم", "عدم مراجعة المحتوى قبل النشر"],
    kpis: [{ label: "عدد الدورات الجاهزة", target: "1+ خلال شهر" }, { label: "عدد الدروس المرفوعة", target: "10+ خلال شهر" }],
    tools: ["ChatGPT", "Canva", "المنصة", "Gamma"],
  },
  {
    id: "launch",
    title: "الإطلاق",
    subtitle: "Launch",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: Rocket,
    objective: "إطلاق منصة العميل رسمياً وضمان وصولها للجمهور المستهدف",
    responsible: "CS Specialist",
    duration: "اليوم المحدد + أسبوع",
    subSteps: [
      { title: "مراجعة ما قبل الإطلاق", description: "فحص شامل: المحتوى، التصميم، الإعدادات، طرق الدفع، الروابط", icon: CheckCircle2, tips: "استخدم قائمة فحص (checklist) لضمان عدم نسيان أي شيء" },
      { title: "تصميم صفحة الهبوط", description: "إنشاء صفحة هبوط احترافية باستخدام Gamma أو أداة مناسبة", icon: Star, tips: "صفحة الهبوط يجب أن تجيب على: ماذا سأتعلم؟ من المدرب؟ كم السعر؟" },
      { title: "خطة التسويق للإطلاق", description: "مساعدة العميل في إعداد خطة تسويق: بوستات، إيميلات، رسائل واتساب", icon: MessageSquare, tips: "جهّز 5 بوستات جاهزة للعميل ينشرها على مراحل" },
      { title: "الإطلاق والمتابعة", description: "دعم العميل يوم الإطلاق ومتابعة أول 10 تسجيلات", icon: Rocket, tips: "كن متاحاً يوم الإطلاق للرد على أي مشكلة فورياً" },
    ],
    scripts: [
      "مبروك! 🎉 منصتك جاهزة للإطلاق. قبل ما ننشر، خلّني أراجع معك قائمة الفحص النهائية عشان نتأكد إن كل شيء تمام.",
      "جهّزت لك خطة إطلاق مع 5 بوستات جاهزة للنشر. اليوم الأول: [البوست]، اليوم الثاني: [البوست]... هل تبغى نعدل أي شيء؟",
    ],
    successCriteria: ["إطلاق ناجح بدون مشاكل تقنية", "أول 10 تسجيلات خلال أسبوع", "العميل راضٍ عن الإطلاق"],
    commonMistakes: ["إطلاق بدون مراجعة شاملة", "عدم وجود خطة تسويق", "عدم التواجد يوم الإطلاق"],
    kpis: [{ label: "نجاح الإطلاق", target: "بدون مشاكل" }, { label: "أول تسجيلات", target: "10 خلال أسبوع" }],
    tools: ["Gamma", "Canva", "ChatGPT", "واتساب"],
  },
  {
    id: "monitoring",
    title: "المتابعة والمراقبة",
    subtitle: "Monitoring & Support",
    color: "#10b981",
    bgColor: "#f0fdf4",
    icon: BarChart3,
    objective: "متابعة أداء العميل وتقديم الدعم المستمر لضمان النجاح",
    responsible: "CS Specialist",
    duration: "مستمر (أسبوعي/شهري)",
    subSteps: [
      { title: "متابعة أسبوعية", description: "مراجعة إحصائيات الاستخدام: عدد الطلاب، الدروس المكتملة، الإيرادات", icon: BarChart3, tips: "أرسل تقرير أسبوعي مختصر للعميل مع أهم الأرقام" },
      { title: "جلسة شهرية", description: "مكالمة مراجعة شهرية لمناقشة الأداء والأهداف والتحديات", icon: Video, tips: "حضّر جدول أعمال واضح: إنجازات، تحديات، أهداف الشهر القادم" },
      { title: "الدعم الفني", description: "حل المشاكل التقنية والإجابة على الاستفسارات بسرعة", icon: Shield, tips: "اهدف للرد خلال ساعة في أوقات العمل - السرعة تبني الولاء" },
      { title: "رصد علامات الخطر", description: "متابعة إشارات عدم الرضا: قلة الاستخدام، شكاوى، عدم الرد", icon: AlertTriangle, tips: "إذا لم يدخل العميل المنصة لمدة أسبوع → تواصل فوراً" },
    ],
    scripts: [
      "مرحباً [الاسم]! تقريرك الأسبوعي: 📊 عدد الطلاب الجدد: [رقم]، الدروس المكتملة: [رقم]، الإيرادات: [رقم]. أداء ممتاز! هل تحتاج مساعدة في أي شيء؟",
      "لاحظت إنك ما دخلت المنصة من فترة. كل شيء تمام إن شاء الله؟ أنا هنا لو تحتاج أي مساعدة أو عندك أي سؤال 💙",
    ],
    successCriteria: ["تقارير أسبوعية منتظمة", "جلسة شهرية مع كل عميل", "وقت رد < ساعة"],
    commonMistakes: ["إهمال المتابعة الدورية", "التأخر في حل المشاكل", "تجاهل علامات الخطر"],
    kpis: [{ label: "معدل الاستخدام الشهري", target: "80%+" }, { label: "رضا العملاء (NPS)", target: "8+" }],
    tools: ["CRM", "تحليلات المنصة", "واتساب", "إيميل"],
  },
  {
    id: "growth",
    title: "النمو والتطوير",
    subtitle: "Growth & Expansion",
    color: "#f97316",
    bgColor: "#fff7ed",
    icon: TrendingUp,
    objective: "مساعدة العميل في النمو وزيادة استخدامه للمنصة وإيراداته",
    responsible: "CS Specialist + Sales",
    duration: "مستمر (شهر 3+)",
    subSteps: [
      { title: "تحليل فرص النمو", description: "مراجعة أداء العميل وتحديد مجالات التحسين والنمو", icon: BarChart3, tips: "قارن أداء العميل مع أفضل الممارسات في مجاله" },
      { title: "تحسين المحتوى", description: "اقتراح تحسينات على المحتوى والعروض بناءً على بيانات الطلاب", icon: Star, tips: "استخدم ChatGPT لإعادة كتابة العروض الضعيفة الأداء" },
      { title: "ترقية الباقة", description: "اقتراح ميزات إضافية أو باقة أعلى حسب احتياجات العميل", icon: TrendingUp, tips: "اربط الترقية بنتيجة محددة: 'الميزة دي هتزود إيراداتك 30%'" },
      { title: "تحسين واجهة المنصة", description: "مساعدة العميل في تحسين واجهة منصته باستخدام Embed Codes", icon: FileEdit, tips: "استخدم ChatGPT لكتابة embed codes مخصصة لتحسين التصميم" },
    ],
    scripts: [
      "بناءً على تحليل أدائك: عندك فرصة كبيرة لزيادة إيراداتك 40% لو [الاقتراح]. حابب أساعدك في تطبيقها؟",
      "لاحظت إن [الدورة] عندها 200 زائر لكن 20 مسجّل فقط. خلّنا نحسّن صفحة الهبوط ووصف الدورة باستخدام ChatGPT عشان نرفع التحويل!",
    ],
    successCriteria: ["نمو في عدد الطلاب 20%+ شهرياً", "ترقية الباقة لـ 30%+ من العملاء", "تحسين معدل التحويل"],
    commonMistakes: ["عدم تحليل البيانات", "اقتراح ترقية بدون قيمة واضحة", "إهمال تحسين المحتوى"],
    kpis: [{ label: "نمو الإيرادات", target: "20%+ شهرياً" }, { label: "معدل الترقية", target: "30%+" }],
    tools: ["ChatGPT", "Canva", "تحليلات المنصة", "Gamma"],
  },
  {
    id: "retention",
    title: "الاحتفاظ والتجديد",
    subtitle: "Retention & Renewal",
    color: "#dc2626",
    bgColor: "#fef2f2",
    icon: Heart,
    objective: "ضمان رضا العملاء والاحتفاظ بهم وتجديد اشتراكاتهم",
    responsible: "CS Specialist",
    duration: "قبل التجديد بـ 30 يوم",
    subSteps: [
      { title: "مراجعة ما قبل التجديد", description: "تحليل شامل لاستخدام العميل وإنجازاته خلال فترة الاشتراك", icon: BarChart3, tips: "جهّز تقرير ROI يوضح القيمة التي حصل عليها العميل" },
      { title: "جلسة مراجعة مع العميل", description: "مكالمة لمناقشة الإنجازات والتحديات والأهداف للفترة القادمة", icon: Video, tips: "ابدأ بالإنجازات الإيجابية ثم ناقش التحسينات" },
      { title: "معالجة مخاوف التجديد", description: "فهم أي تردد ومعالجته: السعر، القيمة، البدائل", icon: MessageSquare, tips: "لا تنتظر حتى يطلب العميل الإلغاء - كن استباقياً" },
      { title: "عرض التجديد", description: "تقديم عرض تجديد مع حوافز: خصم، ميزات إضافية، دعم مخصص", icon: Target, tips: "العميل القديم يكلف أقل 5x من اكتساب عميل جديد" },
      { title: "استعادة العملاء", description: "للعملاء المترددين: عرض فترة مجانية أو حل مخصص للمشكلة", icon: Heart, tips: "اسأل: ما الشيء الوحيد الذي لو تغيّر، ستبقى معنا؟" },
    ],
    scripts: [
      "مرحباً [الاسم]! اشتراكك سيتجدد خلال 30 يوم. قبل ما نجدد، حبيت أراجع معك إنجازاتك: [الإنجازات]. أداء رائع! 🌟 هل نحدد موعد نتكلم عن أهدافك للفترة القادمة؟",
      "أفهم قلقك بخصوص [المشكلة]. خلّني أقدم لك حل: [الحل]. وبالإضافة لذلك، كعميل مميز عندنا لك [الحافز]. ما رأيك؟",
    ],
    successCriteria: ["معدل تجديد 85%+", "معالجة كل مخاوف العملاء", "الاحتفاظ بالعملاء الرئيسيين"],
    commonMistakes: ["التواصل متأخر قبل التجديد", "عدم تقديم حوافز", "تجاهل الشكاوى السابقة"],
    kpis: [{ label: "معدل التجديد", target: "85%+" }, { label: "معدل الإلغاء", target: "< 5%" }],
    tools: ["CRM", "تقارير الاستخدام", "واتساب", "إيميل"],
  },
];

export default function CSSOP() {
  const [selectedStageId, setSelectedStageId] = useState("onboarding");
  const [activeTab, setActiveTab] = useState("steps");

  const selectedStage = csStagesData.find((s) => s.id === selectedStageId) || csStagesData[0];

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-cs-sop-title">
          خريطة عمليات نجاح العملاء
        </h1>
        <p className="text-muted-foreground">
          من الترحيب وحتى التجديد - اضغط على أي مرحلة لعرض الخطوات التفصيلية
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {csStagesData.map((stage) => (
          <Badge
            key={stage.id}
            variant={selectedStageId === stage.id ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs"
            style={selectedStageId === stage.id ? { background: stage.color } : undefined}
            onClick={() => { setSelectedStageId(stage.id); setActiveTab("steps"); }}
            data-testid={`badge-cs-stage-${stage.id}`}
          >
            <stage.icon className="h-3 w-3 ml-1" />
            {stage.title}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 flex-1 min-h-0">
        <Card className="lg:col-span-2 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="space-y-1 p-3">
              {csStagesData.map((stage, idx) => {
                const isSelected = stage.id === selectedStageId;
                const isCompleted = csStagesData.indexOf(csStagesData.find(s => s.id === selectedStageId)!) > idx;
                return (
                  <div key={stage.id}>
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-right transition-all",
                        isSelected ? "shadow-md" : "hover:bg-gray-50"
                      )}
                      style={isSelected ? { background: stage.bgColor, border: `2px solid ${stage.color}` } : {}}
                      onClick={() => { setSelectedStageId(stage.id); setActiveTab("steps"); }}
                      data-testid={`button-cs-stage-${stage.id}`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: isSelected ? stage.color : `${stage.color}20` }}
                      >
                        <stage.icon className="w-5 h-5" style={{ color: isSelected ? "white" : stage.color }} />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="font-bold text-sm" style={{ color: isSelected ? stage.color : undefined }}>{stage.title}</div>
                        <div className="text-[11px] text-muted-foreground">{stage.subtitle} • {stage.duration}</div>
                      </div>
                      <div className="text-xs font-bold" style={{ color: stage.color }}>{idx + 1}</div>
                    </button>
                    {idx < csStagesData.length - 1 && (
                      <div className="flex justify-center">
                        <div className="w-0.5 h-3 bg-gray-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          <div className="p-4 border-b" style={{ background: selectedStage.bgColor }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: selectedStage.color }}>
                <selectedStage.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{ color: selectedStage.color }}>{selectedStage.title}</h2>
                <p className="text-sm text-muted-foreground">{selectedStage.objective}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {selectedStage.duration}</span>
              <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {selectedStage.responsible}</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full justify-start px-4 pt-2 h-auto flex-wrap">
              <TabsTrigger value="steps" className="text-xs">الخطوات</TabsTrigger>
              <TabsTrigger value="scripts" className="text-xs">نصوص جاهزة</TabsTrigger>
              <TabsTrigger value="criteria" className="text-xs">معايير النجاح</TabsTrigger>
              <TabsTrigger value="kpis" className="text-xs">مؤشرات الأداء</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4">
              <TabsContent value="steps" className="mt-0 space-y-3">
                {selectedStage.subSteps.map((step, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-sm transition-shadow" data-testid={`cs-step-${idx}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${selectedStage.color}15` }}>
                        <step.icon className="w-4 h-4" style={{ color: selectedStage.color }} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.tips && (
                          <div className="mt-2 p-2 rounded-md bg-amber-50 border border-amber-200">
                            <p className="text-xs text-amber-800 flex items-start gap-1">
                              <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                              {step.tips}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="scripts" className="mt-0 space-y-3">
                {selectedStage.scripts.map((script, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gradient-to-l from-primary/5 to-transparent" data-testid={`cs-script-${idx}`}>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{script}</p>
                        <button
                          className="mt-2 text-xs text-primary hover:underline"
                          onClick={() => navigator.clipboard.writeText(script)}
                        >
                          نسخ النص
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 space-y-3">
                  <h4 className="font-bold text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    أخطاء شائعة يجب تجنبها
                  </h4>
                  {selectedStage.commonMistakes.map((mistake, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-destructive shrink-0">✗</span>
                      {mistake}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="criteria" className="mt-0 space-y-3">
                <h4 className="font-bold text-sm text-green-700 flex items-center gap-1 mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  معايير النجاح
                </h4>
                {selectedStage.successCriteria.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    {c}
                  </div>
                ))}
                <h4 className="font-bold text-sm mt-6 flex items-center gap-1 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  الأدوات المطلوبة
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStage.tools.map((tool, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="kpis" className="mt-0 space-y-3">
                {selectedStage.kpis.map((kpi, idx) => (
                  <div key={idx} className="border rounded-lg p-4" data-testid={`cs-kpi-${idx}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{kpi.label}</span>
                      <Badge style={{ background: selectedStage.color }} className="text-white">{kpi.target}</Badge>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
