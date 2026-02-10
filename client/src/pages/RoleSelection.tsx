import { useRole, type UserRole } from "@/contexts/RoleContext";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Target, HeadphonesIcon, Sparkles } from "lucide-react";
import { useMemo } from "react";

const motivationalQuotes = [
  "النجاح ليس وجهة نصل إليها، بل رحلة نعيشها كل يوم بشغف وإصرار.",
  "كل صفقة تغلقها هي خطوة نحو بناء مستقبل أفضل لعملائك ولنفسك.",
  "المبيعات ليست مجرد أرقام، بل هي فن بناء الثقة وحل المشكلات.",
  "ابدأ يومك بطاقة إيجابية، فكل تواصل مع عميل هو فرصة جديدة للتميّز.",
  "العميل الراضي هو أعظم إنجاز، والعلاقة الطويلة هي أعظم استثمار.",
  "لا تبع منتجاً، بل قدّم حلاً يغيّر حياة عملائك نحو الأفضل.",
  "التعلّم المستمر هو سر التفوّق في عالم المبيعات المتغيّر.",
  "كن الشخص الذي يتمنى العميل أن يتحدث معه دائماً.",
  "الإصرار يحوّل المستحيل إلى ممكن، والممكن إلى واقع مذهل.",
  "نجاحك يبدأ من اللحظة التي تقرر فيها أن تكون الأفضل.",
  "العظمة ليست في عدم السقوط، بل في النهوض بعد كل سقطة أقوى من قبل.",
  "كل يوم جديد هو فرصة لكتابة قصة نجاح جديدة.",
  "الفريق الناجح لا يعرف كلمة مستحيل، بل يعرف كلمة نحاول.",
  "عندما تؤمن بما تبيعه، ينتقل إيمانك تلقائياً لعملائك.",
  "اصنع الفارق في حياة عملائك، وسيصنعون الفارق في نتائجك.",
  "الاحترافية ليست في ما تعرفه فقط، بل في كيف تطبّقه كل يوم.",
  "كل رفض هو درس، وكل درس يقرّبك من الصفقة التالية.",
  "العمل الجماعي يحوّل الأحلام إلى إنجازات حقيقية.",
  "لا تنتظر الفرصة المثالية، بل اصنعها بيديك.",
  "التميّز عادة يومية، مارسها حتى تصبح جزءاً من هويتك.",
  "أنت لست مجرد مستشار مبيعات، أنت شريك نجاح لكل عميل.",
  "القوة الحقيقية تكمن في الاستمرار عندما يتوقف الآخرون.",
  "عملاؤك يستحقون الأفضل، وأنت قادر على تقديمه.",
  "السر ليس في العمل بجهد أكبر، بل في العمل بذكاء أكثر.",
  "ابنِ جسوراً مع عملائك اليوم، لتعبر عليها نحو نجاحات الغد.",
  "الشغف هو الوقود الذي يحرّك كل إنجاز عظيم.",
  "كل تحدٍّ تواجهه اليوم يجعلك أقوى وأكثر خبرة للغد.",
  "النجاح المستدام يأتي من خدمة العملاء بإخلاص وتفانٍ.",
  "لا تقلّل من قيمة ابتسامتك، فهي أول خطوة لكسب ثقة العميل.",
  "اجعل كل يوم عمل هو أفضل يوم عمل في حياتك.",
  "الطموح بلا عمل حلم، والعمل بلا طموح روتين. اجمع بينهما وانطلق.",
];

function getDailyQuote(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
}

const roles: { id: UserRole; title: string; subtitle: string; description: string; icon: any; gradient: string; iconBg: string; features: string[] }[] = [
  {
    id: "manager",
    title: "مدير المبيعات",
    subtitle: "Sales Manager",
    description: "الوصول الكامل لجميع البيانات والتقارير وإدارة الفرق",
    icon: Crown,
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    features: ["لوحة تحكم شاملة", "تقارير الأداء", "متابعة كل الفرق", "جميع الصفقات والبيانات"],
  },
  {
    id: "sales",
    title: "فريق المبيعات",
    subtitle: "Sales Team",
    description: "أدوات البيع والتنقيب وإدارة الصفقات",
    icon: Target,
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
    features: ["محرك العمليات SOP", "المساعد الذكي", "تتبع الصفقات", "إطار CHAMP"],
  },
  {
    id: "cs",
    title: "فريق نجاح العملاء",
    subtitle: "Customer Success",
    description: "أدوات خدمة العملاء والمتابعة والاحتفاظ",
    icon: HeadphonesIcon,
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    features: ["عمليات نجاح العملاء", "مساعد نجاح العملاء", "أدوات المحتوى والتصميم"],
  },
];

export default function RoleSelection() {
  const { setRole } = useRole();
  const dailyQuote = useMemo(() => getDailyQuote(), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      </div>

      <div className="max-w-5xl w-full relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-5 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <img src="/images/kareem-logo.png" alt="Kareem Essam" className="h-14 object-contain" />
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <img src="/images/acadimiat-logo.png" alt="Acadimiat" className="h-14 object-contain" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight" data-testid="text-role-title">
            AI Kareem Pro
          </h1>
          <p className="text-lg text-blue-200/70 mb-8">منصة العمليات الذكية للمبيعات ونجاح العملاء</p>

          <div className="max-w-2xl mx-auto mb-10 relative">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8">
              <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-3" />
              <p className="text-white/90 text-lg md:text-xl leading-relaxed font-medium mb-4" data-testid="text-daily-quote">
                "{dailyQuote}"
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-px bg-amber-400/50" />
                <span className="text-amber-400 font-bold text-sm" data-testid="text-quote-signature">كريم عصام</span>
                <div className="w-8 h-px bg-amber-400/50" />
              </div>
            </div>
          </div>

          <p className="text-blue-200/50 text-sm mb-6">اختر دورك للدخول إلى النظام</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div
              key={r.id}
              className="group cursor-pointer"
              onClick={() => setRole(r.id)}
              data-testid={`card-role-${r.id}`}
            >
              <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className={`w-20 h-20 ${r.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <r.icon className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-xl font-bold text-white mb-1 text-center">{r.title}</h2>
                <p className="text-xs text-blue-300/50 mb-3 text-center">{r.subtitle}</p>
                <p className="text-sm text-blue-200/60 mb-5 text-center">{r.description}</p>
                
                <div className="space-y-2 mb-5">
                  {r.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-blue-200/50">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${r.gradient}`} />
                      {f}
                    </div>
                  ))}
                </div>
                
                <div className={`py-2.5 px-4 rounded-xl text-sm font-bold text-white text-center bg-gradient-to-r ${r.gradient} opacity-80 group-hover:opacity-100 transition-opacity shadow-lg`}>
                  الدخول كـ {r.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-blue-300/30 text-xs">
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
