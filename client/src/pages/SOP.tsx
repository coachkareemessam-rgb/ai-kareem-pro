import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, Node, Edge, MarkerType, Position, Handle } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Search, Phone, Mail, Video, FileText,
  CheckCircle2, AlertTriangle, Target, Users, DollarSign,
  Clock, Star, Lightbulb, MessageSquare, Handshake, Trophy,
  UserCheck, Filter, Presentation, Send, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StageDetail {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
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

const stagesData: StageDetail[] = [
  {
    id: "prospecting",
    title: "التنقيب",
    subtitle: "Prospecting",
    color: "#6366f1",
    bgColor: "#eef2ff",
    borderColor: "#c7d2fe",
    icon: Search,
    objective: "تحديد واستهداف العملاء المحتملين المناسبين من المدربين والأكاديميات",
    responsible: "SDR",
    duration: "مستمر يومياً",
    subSteps: [
      { title: "تحديد الشريحة المستهدفة", description: "مدربين مستقلين، أكاديميات صغيرة/متوسطة، مراكز تدريب، جامعات", icon: Target, tips: "ركّز على من لديهم محتوى جاهز ويبحثون عن منصة" },
      { title: "البحث في القنوات", description: "لينكدإن، إنستغرام، مجموعات فيسبوك، المعارض التعليمية، الإحالات", icon: Search, tips: "أفضل العملاء يأتون من الإحالات - اطلب إحالات من كل عميل حالي" },
      { title: "بناء قائمة العملاء المحتملين", description: "جمع بيانات التواصل (اسم، هاتف، إيميل، نوع النشاط، حجم الجمهور)", icon: Users, tips: "استخدم CRM لتنظيم القوائم وتجنب التكرار" },
      { title: "التواصل الأولي", description: "إرسال رسالة تعريفية مخصصة حسب نوع العميل ونشاطه", icon: Send, tips: "الرسالة المخصصة تحقق 3x استجابة أكثر من الرسالة العامة" },
    ],
    scripts: [
      "مرحباً [الاسم]، لاحظت أن لديك محتوى رائع في [المجال]. هل فكرت في تحويله لمنصة تعليمية خاصة بك؟",
      "السلام عليكم [الاسم]، أنا من فريق أكاديميات. نساعد المدربين مثلك في إنشاء أكاديمية رقمية احترافية. هل عندك دقيقتين؟"
    ],
    successCriteria: ["قائمة 20+ عميل محتمل أسبوعياً", "معدل استجابة 15%+", "تحديد 5+ عملاء مؤهلين أسبوعياً"],
    commonMistakes: ["التواصل مع شريحة غير مناسبة", "رسائل عامة غير مخصصة", "عدم المتابعة بعد الرسالة الأولى"],
    kpis: [{ label: "عدد العملاء المحتملين", target: "20/أسبوع" }, { label: "معدل الاستجابة", target: "15%+" }],
    tools: ["CRM", "LinkedIn Sales Navigator", "واتساب بزنس"],
  },
  {
    id: "qualification",
    title: "التأهيل الأولي",
    subtitle: "Lead Qualification",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe",
    icon: Filter,
    objective: "تصفية العملاء المحتملين وتحديد من يستحق المتابعة بناءً على معايير واضحة",
    responsible: "SDR",
    duration: "30 ثانية - 5 دقائق",
    subSteps: [
      { title: "مراجعة البيانات الأساسية", description: "التحقق من صحة الاسم، الرقم، الإيميل، نوع النشاط", icon: FileText, tips: "بيانات غير صحيحة = وقت ضائع - تحقق فوراً" },
      { title: "تصنيف نوع العميل", description: "مدرب فردي / أكاديمية / مركز تدريب / جامعة", icon: Users, tips: "كل نوع له احتياجات مختلفة - جهّز عرضك وفقاً للنوع" },
      { title: "تقييم مستوى الوعي", description: "هل يعرف المنتج؟ هل يبحث عن حل؟ هل لديه مشكلة واضحة؟", icon: Lightbulb, tips: "العميل الذي يبحث عن حل أسهل في الإغلاق 5x من العميل البارد" },
      { title: "تحديد الأولوية", description: "Hot (جاهز الآن) / Warm (مهتم) / Cold (يحتاج وقت)", icon: Star, tips: "ركّز 80% من وقتك على Hot و Warm" },
    ],
    scripts: [
      "قبل ما نبدأ، خلّني أتأكد من بعض المعلومات: ما هو نشاطك الأساسي؟ وكم عدد الطلاب/المتدربين تقريباً؟",
      "هل تستخدم حالياً أي منصة لتقديم محتواك التعليمي؟ أم تقدمه حضورياً فقط؟"
    ],
    successCriteria: ["تصنيف 90%+ من العملاء خلال 24 ساعة", "دقة التصنيف 80%+"],
    commonMistakes: ["قضاء وقت طويل على عملاء غير مؤهلين", "عدم تسجيل البيانات في CRM فوراً", "تجاهل العملاء البارد بالكامل بدل nurturing"],
    kpis: [{ label: "سرعة التأهيل", target: "< 5 دقائق" }, { label: "نسبة MQL", target: "30%+" }],
    tools: ["CRM", "نموذج التأهيل"],
  },
  {
    id: "discovery",
    title: "جلسة الاكتشاف",
    subtitle: "Discovery Call",
    color: "#0ea5e9",
    bgColor: "#f0f9ff",
    borderColor: "#bae6fd",
    icon: Phone,
    objective: "فهم تحديات العميل العميقة باستخدام إطار CHAMP وتحديد مدى ملاءمة الحل",
    responsible: "AE / SDR",
    duration: "20-30 دقيقة",
    subSteps: [
      { title: "بناء العلاقة (Rapport)", description: "ابدأ بتعليق إيجابي على نشاط العميل أو محتواه - اجعله يشعر بالراحة", icon: Handshake, tips: "أول 90 ثانية تحدد نبرة المكالمة كاملة" },
      { title: "تحليل التحديات (C - Challenges)", description: "ما أكبر تحدي يواجهك في تقديم محتواك التعليمي؟ ما الذي جربته سابقاً؟", icon: AlertTriangle, tips: "اسأل 'لماذا' 3 مرات للوصول للمشكلة الحقيقية" },
      { title: "تحديد صاحب القرار (A - Authority)", description: "من سيشارك في اتخاذ قرار الاشتراك؟ هل أنت المسؤول عن الميزانية؟", icon: UserCheck, tips: "إذا لم يكن صاحب القرار - اطلب اجتماع مع صاحب القرار" },
      { title: "فهم الميزانية (M - Money)", description: "ما الميزانية المتوقعة؟ كم تنفق حالياً على الأدوات والمنصات؟", icon: DollarSign, tips: "لا تذكر السعر مباشرة - اعرف أولاً قيمة المشكلة عند العميل" },
      { title: "تقييم الأولوية (P - Priority)", description: "متى تخطط للبدء؟ هل هذا المشروع أولوية الآن؟ ما العائق أمام البدء فوراً؟", icon: Clock, tips: "عميل بلا أولوية = صفقة ستتأخر - حدد الإلحاح" },
      { title: "تلخيص وتحديد الخطوة التالية", description: "لخّص ما فهمته واقترح Demo أو Trial حسب جاهزية العميل", icon: CheckCircle2, tips: "احصل دائماً على موعد محدد للخطوة التالية قبل إنهاء المكالمة" },
    ],
    scripts: [
      "أبغى أفهم وضعك أكثر عشان أقدر أساعدك بشكل أفضل. خلّنا نبدأ: ما أكبر تحدي يواجهك حالياً في تقديم محتواك التعليمي أو التدريبي؟",
      "ممتاز، شكراً لمشاركتي هذه التفاصيل. بناءً على اللي قلته، أعتقد إن عندنا حل يناسب احتياجاتك تماماً. هل تحب نحدد موعد لعرض المنصة لك؟"
    ],
    successCriteria: ["الحصول على إجابات CHAMP كاملة", "تحديد موعد Demo", "تسجيل ملاحظات المكالمة في CRM خلال ساعة"],
    commonMistakes: ["عرض المنتج قبل فهم المشكلة", "عدم سؤال عن صاحب القرار", "نسيان تلخيص المكالمة وتحديد الخطوة التالية", "التحدث أكثر من الاستماع"],
    kpis: [{ label: "معدل تحويل لـ Demo", target: "60%+" }, { label: "متوسط مدة المكالمة", target: "20-30 دقيقة" }],
    tools: ["هاتف/زوم", "نموذج CHAMP", "CRM"],
  },
  {
    id: "demo",
    title: "العرض التقديمي",
    subtitle: "Demo / Presentation",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    borderColor: "#fde68a",
    icon: Presentation,
    objective: "عرض المنتج بشكل مخصص حسب احتياجات العميل المحددة في جلسة الاكتشاف",
    responsible: "AE",
    duration: "30-45 دقيقة",
    subSteps: [
      { title: "التحضير المسبق", description: "مراجعة ملاحظات Discovery - تحضير عرض مخصص يركز على تحديات العميل", icon: FileText, tips: "العرض العام يفشل - خصّص كل شريحة لمشكلة العميل" },
      { title: "تأكيد المشكلة", description: "ابدأ بتلخيص ما فهمته من Discovery واسأل 'هل هذا صحيح؟'", icon: CheckCircle2, tips: "التأكيد يبني الثقة ويجعل العميل يشعر أنك فاهمه" },
      { title: "عرض الحل المخصص", description: "اعرض فقط الميزات التي تحل مشاكل العميل - لا تعرض كل شيء", icon: Presentation, tips: "3 ميزات مركّزة > 15 ميزة عشوائية" },
      { title: "إثبات القيمة (Social Proof)", description: "شارك قصص نجاح عملاء مشابهين - أرقام وبيانات حقيقية", icon: Trophy, tips: "العميل يثق بتجربة عميل آخر أكثر من كلامك" },
      { title: "معالجة الأسئلة والاعتراضات", description: "استمع بعناية - تعاطف أولاً - ثم أجب بوضوح", icon: MessageSquare, tips: "الاعتراض فرصة وليس تهديد - العميل المعترض مهتم" },
      { title: "تفعيل Trial", description: "قدّم فترة تجربة مجانية مع خطة واضحة للخطوات الأولى", icon: Star, tips: "حدد مهام واضحة للعميل خلال فترة التجربة" },
    ],
    scripts: [
      "في المكالمة السابقة، ذكرت إن أكبر تحدي عندك هو [المشكلة]. اليوم بوريك بالضبط كيف المنصة تحل هذا التحدي.",
      "عندنا عميل مشابه لك - [اسم العميل/المجال] - بدأ معنا قبل 6 أشهر والحين عنده [النتيجة]. أتوقع تقدر تحقق نتائج مشابهة."
    ],
    successCriteria: ["عميل متحمس ومتفاعل أثناء العرض", "تفعيل Trial", "تحديد موعد متابعة خلال أسبوع"],
    commonMistakes: ["عرض كل الميزات بدون تركيز", "عدم التحضير المسبق", "عدم معالجة الاعتراضات", "نسيان تحديد الخطوة التالية"],
    kpis: [{ label: "معدل تفعيل Trial", target: "70%+" }, { label: "متوسط مدة العرض", target: "30-45 دقيقة" }],
    tools: ["زوم/جوجل ميت", "عرض تقديمي مخصص", "حساب Trial"],
  },
  {
    id: "trial",
    title: "فترة التجربة",
    subtitle: "Trial / Evaluation",
    color: "#10b981",
    bgColor: "#f0fdf4",
    borderColor: "#86efac",
    icon: ShieldCheck,
    objective: "مساعدة العميل في تجربة المنصة بنجاح وإثبات القيمة عملياً",
    responsible: "AE + CS",
    duration: "7-14 يوم",
    subSteps: [
      { title: "إعداد الحساب", description: "تفعيل الحساب - إضافة المحتوى الأولي - تخصيص الهوية البصرية", icon: CheckCircle2, tips: "ساعد العميل في أول 24 ساعة - الانطباع الأول حاسم" },
      { title: "جلسة تدريب (Onboarding)", description: "جلسة 30 دقيقة لشرح الخطوات الأساسية والميزات الرئيسية", icon: Video, tips: "ركّز على 3 أشياء فقط يحتاجها العميل الآن" },
      { title: "متابعة اليوم 3", description: "تواصل للسؤال عن التجربة - حل أي مشاكل - تقديم نصائح", icon: Phone, tips: "معظم العملاء يتوقفون بعد يوم 2 - اليوم 3 فرصة لإعادة التفاعل" },
      { title: "متابعة اليوم 7", description: "مراجعة الاستخدام - مشاركة أفضل الممارسات - معالجة المخاوف", icon: Mail, tips: "شارك فيديو قصير عن ميزة لم يكتشفها بعد" },
      { title: "تقييم نهائي (اليوم 10-14)", description: "مراجعة النتائج مع العميل - ربط القيمة بالنتائج الفعلية - تقديم العرض", icon: Target, tips: "اسأل: على مقياس 1-10، كم تقيّم تجربتك؟ ولماذا؟" },
    ],
    scripts: [
      "مرحباً [الاسم]، كيف ماشية التجربة معك؟ هل واجهت أي صعوبة؟ أنا هنا لمساعدتك.",
      "لاحظت إنك رفعت [عدد] دروس - ممتاز! هل تبغى أوريك طريقة تزيد تفاعل الطلاب باستخدام [ميزة]؟"
    ],
    successCriteria: ["العميل يستخدم المنصة بفعالية", "تحقيق 'aha moment'", "العميل مستعد لمناقشة الاشتراك"],
    commonMistakes: ["عدم المتابعة خلال فترة التجربة", "ترك العميل يتعلم بنفسه", "عدم قياس الاستخدام"],
    kpis: [{ label: "معدل تفاعل Trial", target: "60%+" }, { label: "معدل تحويل Trial→Paid", target: "40%+" }],
    tools: ["منصة Trial", "واتساب/إيميل", "أداة تتبع الاستخدام"],
  },
  {
    id: "negotiation",
    title: "التفاوض",
    subtitle: "Negotiation",
    color: "#f97316",
    bgColor: "#fff7ed",
    borderColor: "#fed7aa",
    icon: Handshake,
    objective: "معالجة الاعتراضات النهائية والتفاوض على الشروط للوصول لاتفاق",
    responsible: "AE / Manager",
    duration: "1-7 أيام",
    subSteps: [
      { title: "تقديم العرض المالي", description: "عرض الباقات والأسعار بشكل واضح - ربط كل باقة بقيمة محددة", icon: DollarSign, tips: "قدّم 3 باقات: أساسية، احترافية، مؤسسية - معظم العملاء يختارون الوسطى" },
      { title: "معالجة اعتراض السعر", description: "تعاطف → عزل الاعتراض → إعادة صياغة القيمة (ROI) → اقتراح حل", icon: MessageSquare, tips: "لا تخفّض السعر مباشرة - اعرض قيمة إضافية أولاً" },
      { title: "معالجة اعتراض 'أحتاج وقت'", description: "اسأل: ما الذي يمنعك من البدء الآن؟ - حدد العائق الحقيقي وعالجه", icon: Clock, tips: "اخلق إلحاح حقيقي: عرض محدود، خصم أول 50 مشترك" },
      { title: "معالجة اعتراض المقارنة", description: "لا تهاجم المنافس - ركّز على ما يميزك: دعم عربي، سهولة، خصائص فريدة", icon: Target, tips: "اسأل: ما أهم 3 أشياء تبحث عنها في المنصة؟ ثم أثبت تفوقك فيها" },
      { title: "التفاوض على الشروط", description: "كن مرناً في الشروط (مدة الدفع، فترة تجربة ممتدة) لكن حافظ على السعر", icon: Handshake, tips: "الخصم يقلل القيمة المدركة - قدّم قيمة إضافية بدلاً من خصم" },
    ],
    scripts: [
      "أتفهم تماماً أن السعر مهم. خلني أوضح لك: باشتراكك الشهري بـ[المبلغ]، أنت توفر تكاليف [التفاصيل] التي تتجاوز [مبلغ أكبر] سنوياً.",
      "أفهم أنك تحتاج وقت للتفكير. لمساعدتك في القرار: ما الشيء الوحيد الذي لو تأكدت منه ستبدأ معنا فوراً؟"
    ],
    successCriteria: ["معالجة كل الاعتراضات", "الاتفاق على الباقة والسعر", "تحديد موعد للإغلاق"],
    commonMistakes: ["خفض السعر من أول اعتراض", "عدم عزل الاعتراض الحقيقي", "التسرع في الإغلاق قبل حل المخاوف"],
    kpis: [{ label: "معدل تحويل للإغلاق", target: "50%+" }, { label: "متوسط مدة التفاوض", target: "< 7 أيام" }],
    tools: ["عرض الأسعار", "حاسبة ROI", "قائمة معالجة الاعتراضات"],
  },
  {
    id: "closing",
    title: "إغلاق الصفقة",
    subtitle: "Closing",
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#6ee7b7",
    icon: Trophy,
    objective: "تأكيد الاتفاق وتحويل العميل المحتمل إلى عميل فعلي يدفع",
    responsible: "AE",
    duration: "1-3 أيام",
    subSteps: [
      { title: "تأكيد الاتفاق", description: "تلخيص كل الشروط المتفق عليها - الباقة، السعر، مدة العقد، الدعم", icon: CheckCircle2, tips: "اكتب كل شيء بوضوح لتجنب سوء الفهم لاحقاً" },
      { title: "إرسال العقد/رابط الدفع", description: "إرسال رابط الدفع أو العقد الإلكتروني مع شرح واضح للخطوات", icon: Send, tips: "أرسل العقد فوراً - كل ساعة تأخير تقلل احتمال الإغلاق" },
      { title: "متابعة التوقيع/الدفع", description: "إذا لم يتم الدفع خلال 24 ساعة، تواصل للسؤال عن أي مساعدة مطلوبة", icon: Phone, tips: "لا تكن ملحّاً - اعرض المساعدة: 'هل واجهت أي مشكلة في عملية الدفع؟'" },
      { title: "تأكيد الاشتراك والترحيب", description: "إرسال رسالة ترحيب + جدول Onboarding + معلومات الدعم", icon: Star, tips: "أول 48 ساعة بعد الاشتراك تحدد رضا العميل على المدى الطويل" },
      { title: "طلب إحالة", description: "بعد أسبوع من الاشتراك، اطلب ترشيح زملاء قد يستفيدون", icon: Users, tips: "أفضل وقت لطلب الإحالة: بعد أول نجاح للعميل على المنصة" },
    ],
    scripts: [
      "ممتاز! بناءً على اتفاقنا: الباقة [الاسم] بسعر [المبلغ]/شهرياً مع [المميزات]. سأرسل لك رابط الاشتراك الآن.",
      "تهانينا [الاسم] على انضمامك! أنا هنا لدعمك في كل خطوة. خلال الـ48 ساعة القادمة سنساعدك في [الخطوة الأولى]."
    ],
    successCriteria: ["إتمام الدفع/التوقيع", "بدء Onboarding خلال 48 ساعة", "حصول على إحالة واحدة على الأقل"],
    commonMistakes: ["التأخر في إرسال رابط الدفع", "عدم المتابعة بعد الإغلاق", "نسيان طلب الإحالة"],
    kpis: [{ label: "معدل الإغلاق", target: "70%+" }, { label: "وقت الإغلاق", target: "< 3 أيام" }],
    tools: ["نظام الدفع", "قالب العقد", "نموذج Onboarding"],
  },
];

function CustomNode({ data }: { data: any }) {
  return (
    <div
      className="px-4 py-3 rounded-xl shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl hover:scale-105 text-center min-w-[180px]"
      style={{
        background: data.bgColor,
        borderColor: data.isSelected ? data.color : data.borderColor,
        boxShadow: data.isSelected ? `0 0 0 3px ${data.color}40` : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: data.color, width: 8, height: 8 }} />
      <div className="flex flex-col items-center gap-1">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${data.color}20` }}>
          {data.icon && <data.icon className="w-4 h-4" style={{ color: data.color }} />}
        </div>
        <div className="font-bold text-sm" style={{ color: data.color }}>{data.label}</div>
        <div className="text-[10px] text-gray-500">{data.subtitle}</div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: data.color, width: 8, height: 8 }} />
    </div>
  );
}

const nodeTypes = { customStage: CustomNode };

export default function SOP() {
  const [selectedStageId, setSelectedStageId] = useState<string>("prospecting");
  const [activeTab, setActiveTab] = useState("steps");

  const selectedStage = stagesData.find(s => s.id === selectedStageId) || stagesData[0];

  const nodes: Node[] = useMemo(() => stagesData.map((stage, i) => ({
    id: stage.id,
    type: 'customStage',
    data: {
      label: stage.title,
      subtitle: stage.subtitle,
      color: stage.color,
      bgColor: stage.bgColor,
      borderColor: stage.borderColor,
      icon: stage.icon,
      isSelected: stage.id === selectedStageId,
    },
    position: { x: i % 2 === 0 ? 200 : 350, y: i * 140 },
  })), [selectedStageId]);

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];
    for (let i = 0; i < stagesData.length - 1; i++) {
      result.push({
        id: `e-${stagesData[i].id}-${stagesData[i + 1].id}`,
        source: stagesData[i].id,
        target: stagesData[i + 1].id,
        type: 'smoothstep',
        animated: stagesData[i].id === selectedStageId,
        style: { stroke: stagesData[i].color, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: stagesData[i + 1].color },
      });
    }
    result.push({
      id: 'e-nurturing',
      source: 'qualification',
      target: 'prospecting',
      type: 'smoothstep',
      label: 'غير مؤهل → Nurturing',
      labelStyle: { fill: '#ef4444', fontWeight: 600, fontSize: 10 },
      style: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    });
    return result;
  }, [selectedStageId]);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedStageId(node.id);
    setActiveTab("steps");
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-sop-title">خريطة مسار البيع الكاملة</h1>
        <p className="text-muted-foreground">من التنقيب وحتى الإغلاق - اضغط على أي مرحلة لعرض الخطوات التفصيلية</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {stagesData.map((stage) => (
          <Badge
            key={stage.id}
            variant={selectedStageId === stage.id ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs"
            style={selectedStageId === stage.id ? { background: stage.color } : undefined}
            onClick={() => { setSelectedStageId(stage.id); setActiveTab("steps"); }}
            data-testid={`badge-stage-${stage.id}`}
          >
            {stage.title}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-220px)]">
        <Card className="lg:col-span-2 shadow-sm overflow-hidden border">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            onNodeClick={handleNodeClick}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#e5e7eb" gap={20} />
            <Controls />
          </ReactFlow>
        </Card>

        <Card className="lg:col-span-3 flex flex-col overflow-hidden">
          <div className="p-4 border-b" style={{ background: `${selectedStage.bgColor}` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${selectedStage.color}20` }}>
                <selectedStage.icon className="w-5 h-5" style={{ color: selectedStage.color }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" data-testid="text-selected-stage">{selectedStage.title}</h2>
                <p className="text-xs text-muted-foreground">{selectedStage.subtitle} | {selectedStage.responsible} | {selectedStage.duration}</p>
              </div>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">{selectedStage.objective}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-2 justify-start w-fit">
              <TabsTrigger value="steps" data-testid="tab-steps">الخطوات</TabsTrigger>
              <TabsTrigger value="scripts" data-testid="tab-scripts">السكربتات</TabsTrigger>
              <TabsTrigger value="kpis" data-testid="tab-kpis">المعايير</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-4 pb-4">
              <TabsContent value="steps" className="mt-2 space-y-3">
                {selectedStage.subSteps.map((sub, i) => (
                  <div key={i} className="relative pr-8" data-testid={`substep-${selectedStage.id}-${i}`}>
                    {i < selectedStage.subSteps.length - 1 && (
                      <div className="absolute right-[14px] top-10 bottom-0 w-0.5" style={{ background: `${selectedStage.color}30` }} />
                    )}
                    <div className="absolute right-0 top-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: selectedStage.color }}>
                      {i + 1}
                    </div>
                    <div className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-1">
                        <sub.icon className="w-4 h-4" style={{ color: selectedStage.color }} />
                        <h4 className="font-semibold text-sm">{sub.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{sub.description}</p>
                      {sub.tips && (
                        <div className="mt-2 p-2 rounded-md text-xs flex gap-2 items-start" style={{ background: `${selectedStage.color}10` }}>
                          <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: selectedStage.color }} />
                          <span style={{ color: selectedStage.color }}>{sub.tips}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
                  <h4 className="font-semibold text-sm text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    أخطاء شائعة يجب تجنبها
                  </h4>
                  <ul className="space-y-1">
                    {selectedStage.commonMistakes.map((m, i) => (
                      <li key={i} className="text-xs text-red-700 dark:text-red-300 flex gap-2">
                        <span className="text-red-400">✕</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="scripts" className="mt-2 space-y-3">
                <h4 className="font-semibold text-sm mb-2">نصوص جاهزة للاستخدام:</h4>
                {selectedStage.scripts.map((script, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-muted/30 text-sm leading-relaxed" data-testid={`script-${i}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4" style={{ color: selectedStage.color }} />
                      <Badge variant="secondary" className="text-[10px]">سكريبت {i + 1}</Badge>
                    </div>
                    <p className="whitespace-pre-wrap">{script}</p>
                  </div>
                ))}

                <div className="p-3 rounded-lg border bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900">
                  <h4 className="font-semibold text-sm text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    معايير النجاح
                  </h4>
                  <ul className="space-y-1">
                    {selectedStage.successCriteria.map((c, i) => (
                      <li key={i} className="text-xs text-green-700 dark:text-green-300 flex gap-2">
                        <span className="text-green-500">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="kpis" className="mt-2 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-3">مؤشرات الأداء (KPIs):</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedStage.kpis.map((kpi, i) => (
                      <div key={i} className="p-3 rounded-lg border text-center" data-testid={`kpi-${i}`}>
                        <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                        <p className="text-lg font-bold" style={{ color: selectedStage.color }}>{kpi.target}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">الأدوات المطلوبة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStage.tools.map((tool, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{tool}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
