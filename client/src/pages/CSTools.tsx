import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Bot, Palette, Presentation, Copy, ExternalLink,
  FileEdit, Code, MessageSquare, Lightbulb, Sparkles,
  BookOpen, Wrench, Star, CheckCircle2, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHATGPT_PROMPTS = [
  {
    category: "كتابة المحتوى التعليمي",
    icon: FileEdit,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    prompts: [
      {
        title: "كتابة وصف دورة تدريبية",
        prompt: `اكتب وصف احترافي لدورة تدريبية بعنوان "[عنوان الدورة]" في مجال [المجال].

الوصف يجب أن يتضمن:
1. مقدمة جذابة تشرح المشكلة التي تحلها الدورة
2. ماذا سيتعلم المتدرب (5-7 نقاط)
3. لمن هذه الدورة (الفئة المستهدفة)
4. المتطلبات المسبقة (إن وجدت)
5. ما الذي يميز هذه الدورة

اكتب بأسلوب تسويقي محفّز باللغة العربية في 200-300 كلمة.`,
      },
      {
        title: "كتابة عناوين الدروس",
        prompt: `أنا أقوم بإنشاء دورة تدريبية بعنوان "[عنوان الدورة]" في مجال [المجال].

اقترح لي هيكل الدورة مع عناوين الدروس:
- عدد الأقسام: 4-6 أقسام
- عدد الدروس في كل قسم: 3-5 دروس
- لكل درس: عنوان جذاب + وصف مختصر (سطر واحد)
- رتّب الدروس من الأساسي للمتقدم
- أضف قسم "مشروع تطبيقي" في النهاية

اكتب بالعربية واجعل العناوين واضحة ومحفّزة.`,
      },
      {
        title: "كتابة محتوى بوستات تسويقية",
        prompt: `اكتب 5 بوستات تسويقية لدورة "[عنوان الدورة]" لنشرها على وسائل التواصل الاجتماعي.

كل بوست يجب أن يكون:
- 100-150 كلمة
- يتضمن hook قوي في أول سطر
- يحتوي على CTA (دعوة لاتخاذ إجراء)
- مناسب لإنستغرام/فيسبوك/تويتر
- يتضمن إيموجي مناسبة

نوّع بين: بوست تعريفي، بوست شهادة عميل، بوست محتوى تعليمي مجاني، بوست عرض خاص، بوست FOMO.`,
      },
      {
        title: "كتابة إيميلات تسويقية",
        prompt: `اكتب سلسلة 3 إيميلات تسويقية لدورة "[عنوان الدورة]":

الإيميل 1 - تعريفي:
- عنوان جذاب
- تقديم المشكلة والحل
- CTA لمعرفة المزيد

الإيميل 2 - قيمة مجانية:
- تقديم نصيحة أو معلومة قيمة مجاناً
- ربطها بالدورة
- CTA للتسجيل

الإيميل 3 - إلحاح:
- آخر فرصة / عرض محدود
- تلخيص القيمة
- CTA قوي للتسجيل الآن

اكتب بالعربية بأسلوب شخصي وودود.`,
      },
    ],
  },
  {
    category: "فهم احتياجات العميل",
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    prompts: [
      {
        title: "تحليل احتياجات العميل",
        prompt: `أنا مسؤول نجاح عملاء في شركة تقدم منصات تعليمية رقمية. لدي عميل جديد:

- النوع: [مدرب/كوتش/أكاديمية/صانع محتوى]
- المجال: [المجال]
- الخبرة: [سنوات الخبرة]
- الجمهور المستهدف: [الجمهور]
- التحدي الأساسي: [التحدي]

ساعدني في:
1. فهم احتياجاته العميقة
2. تحديد نقاط الألم المحتملة
3. اقتراح خطة نجاح مخصصة له
4. تحديد المقاييس التي يجب تتبعها
5. اقتراح طرق لزيادة رضاه واستخدامه للمنصة`,
      },
      {
        title: "حل مشكلة عميل",
        prompt: `عميلي [النوع] يواجه مشكلة: [وصف المشكلة]

معلومات إضافية:
- مدة الاشتراك: [المدة]
- مستوى الاستخدام: [عالي/متوسط/منخفض]
- مزاج العميل: [راضي/محايد/غاضب]

ساعدني في:
1. فهم السبب الجذري للمشكلة
2. اقتراح 3 حلول ممكنة
3. كتابة رسالة للعميل تعالج المشكلة
4. خطوات لمنع تكرار المشكلة
5. كيف أحوّل هذا الموقف لفرصة تعزيز العلاقة`,
      },
    ],
  },
  {
    category: "كتابة Embed Codes",
    icon: Code,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    prompts: [
      {
        title: "بانر ترحيبي للمنصة",
        prompt: `اكتب لي HTML + CSS لبانر ترحيبي يظهر في أعلى منصة تعليمية.

المواصفات:
- النص: "مرحباً بك في أكاديمية [اسم العميل]"
- اللون الأساسي: [اللون]
- تصميم RTL (عربي)
- متجاوب مع الموبايل
- تأثير gradient خفيف
- أيقونة ترحيب
- زر CTA "ابدأ التعلم"

اكتب الكود كامل وجاهز للنسخ كـ embed code.`,
      },
      {
        title: "قسم شهادات العملاء",
        prompt: `اكتب HTML + CSS لقسم عرض شهادات العملاء (Testimonials) لمنصة تعليمية.

المواصفات:
- 3 شهادات في صف واحد (carousel في الموبايل)
- لكل شهادة: صورة دائرية، اسم، وظيفة، نص الشهادة، تقييم نجوم
- تصميم RTL (عربي)
- ألوان مهنية ونظيفة
- تأثير hover خفيف
- متجاوب مع جميع الشاشات

اكتب الكود كامل وجاهز للنسخ كـ embed code.`,
      },
      {
        title: "عداد تنازلي للعروض",
        prompt: `اكتب HTML + CSS + JavaScript لعداد تنازلي لعرض محدود على منصة تعليمية.

المواصفات:
- عداد يعد تنازلياً (أيام، ساعات، دقائق، ثواني)
- تاريخ الانتهاء: [التاريخ]
- نص: "العرض ينتهي خلال"
- تصميم RTL (عربي)
- ألوان: خلفية داكنة مع أرقام مضيئة
- زر CTA "اشترك الآن قبل انتهاء العرض"
- متجاوب مع الموبايل
- عند انتهاء الوقت يظهر "انتهى العرض"

اكتب الكود كامل وجاهز للنسخ كـ embed code.`,
      },
      {
        title: "قسم FAQ تفاعلي",
        prompt: `اكتب HTML + CSS + JavaScript لقسم أسئلة شائعة (FAQ) تفاعلي لمنصة تعليمية.

المواصفات:
- تصميم Accordion (اضغط لتوسيع/طي)
- 5-7 أسئلة شائعة
- تصميم RTL (عربي)
- أيقونة + / - للتوسيع والطي
- تأثيرات حركة سلسة
- متجاوب مع الموبايل
- ألوان مهنية

الأسئلة المقترحة:
1. كيف أبدأ؟
2. ما مدة الوصول للمحتوى؟
3. هل يوجد شهادة؟
4. ما طرق الدفع المتاحة؟
5. هل يمكن استرداد المبلغ؟

اكتب الكود كامل وجاهز للنسخ كـ embed code.`,
      },
    ],
  },
];

const CANVA_GUIDES = [
  {
    title: "تصميم غلاف الدورة",
    description: "أبعاد 1280x720 بكسل - استخدم صورة خلفية + عنوان واضح + اسم المدرب",
    tips: ["استخدم خطوط عربية واضحة (Cairo, Tajawal)", "لا تزيد النص عن 7 كلمات", "استخدم ألوان هوية العميل", "أضف شعار العميل في الزاوية"],
    link: "https://www.canva.com/templates/?query=course+cover",
  },
  {
    title: "تصميم بوستات سوشيال ميديا",
    description: "أبعاد 1080x1080 للمربع - 1080x1920 للستوري",
    tips: ["حافظ على هوية بصرية موحدة", "استخدم قوالب Canva العربية", "أضف CTA واضح في كل بوست", "استخدم ألوان متناسقة"],
    link: "https://www.canva.com/templates/?query=social+media+arabic",
  },
  {
    title: "تصميم شهادات الإتمام",
    description: "أبعاد A4 أفقي (297x210 مم) - تصميم احترافي مع حدود مزخرفة",
    tips: ["أضف اسم المتدرب والدورة والتاريخ", "استخدم إطار رسمي", "أضف شعار الأكاديمية والتوقيع", "اجعلها قابلة للطباعة"],
    link: "https://www.canva.com/templates/?query=certificate+arabic",
  },
  {
    title: "تصميم بانرات الموقع",
    description: "أبعاد 1920x600 للبانر العريض - 300x250 للبانر الجانبي",
    tips: ["رسالة واحدة واضحة فقط", "زر CTA بارز", "صورة عالية الجودة", "متوافق مع الموبايل"],
    link: "https://www.canva.com/templates/?query=website+banner",
  },
];

const GAMMA_GUIDES = [
  {
    title: "صفحة هبوط للدورة",
    description: "صفحة هبوط احترافية لتسويق الدورة التدريبية",
    sections: ["Hero Section مع عنوان جذاب", "ماذا ستتعلم (نقاط)", "عن المدرب", "محتوى الدورة", "شهادات العملاء", "الأسعار والباقات", "FAQ", "CTA نهائي"],
    prompt: `أنشئ صفحة هبوط لدورة تدريبية بعنوان "[العنوان]" للمدرب [الاسم] في مجال [المجال]. الصفحة يجب أن تكون باللغة العربية وتتضمن: عنوان رئيسي جذاب، وصف المشكلة والحل، محتوى الدورة، عن المدرب، شهادات، الأسعار، وCTA واضح.`,
    link: "https://gamma.app",
  },
  {
    title: "عرض تقديمي للعميل",
    description: "عرض عمل احترافي لتقديمه للعميل المحتمل",
    sections: ["الغلاف", "المشكلة", "الحل", "ميزات المنصة", "قصص نجاح", "الباقات والأسعار", "الخطوات التالية"],
    prompt: `أنشئ عرض تقديمي احترافي لتقديم منصة تعليمية رقمية لعميل [النوع] في مجال [المجال]. العرض باللغة العربية ويتضمن: تقديم المشكلة، الحل المقترح، ميزات المنصة، قصص نجاح، الأسعار، والخطوات التالية.`,
    link: "https://gamma.app",
  },
  {
    title: "تقرير أداء للعميل",
    description: "تقرير شهري يوضح أداء العميل وإنجازاته",
    sections: ["ملخص تنفيذي", "مؤشرات الأداء", "الإنجازات", "التحديات", "التوصيات", "خطة الشهر القادم"],
    prompt: `أنشئ تقرير أداء شهري لعميل أكاديمية رقمية. التقرير باللغة العربية ويتضمن: ملخص الأداء، عدد الطلاب الجدد، الإيرادات، معدل الإكمال، التحديات، والتوصيات للتحسين. استخدم رسوم بيانية وأرقام واضحة.`,
    link: "https://gamma.app",
  },
];

export default function CSTools() {
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState("chatgpt");

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم نسخ النص بنجاح" });
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-cs-tools-title">
          أدوات فريق نجاح العملاء
        </h1>
        <p className="text-muted-foreground mt-1">
          أدوات ونماذج جاهزة لمساعدتك في خدمة العملاء بأفضل طريقة
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card
          className={cn("cursor-pointer transition-all hover:shadow-md border-2", activeTool === "chatgpt" ? "border-emerald-500 shadow-md" : "border-transparent")}
          onClick={() => setActiveTool("chatgpt")}
          data-testid="card-tool-chatgpt"
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Bot className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm">ChatGPT</h3>
              <p className="text-xs text-muted-foreground">كتابة المحتوى والأكواد</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn("cursor-pointer transition-all hover:shadow-md border-2", activeTool === "canva" ? "border-purple-500 shadow-md" : "border-transparent")}
          onClick={() => setActiveTool("canva")}
          data-testid="card-tool-canva"
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Canva</h3>
              <p className="text-xs text-muted-foreground">التصميم والهوية البصرية</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn("cursor-pointer transition-all hover:shadow-md border-2", activeTool === "gamma" ? "border-amber-500 shadow-md" : "border-transparent")}
          onClick={() => setActiveTool("gamma")}
          data-testid="card-tool-gamma"
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-xl">
              <Presentation className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Gamma</h3>
              <p className="text-xs text-muted-foreground">صفحات الهبوط والعروض</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeTool === "chatgpt" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-emerald-600">
            <Bot className="h-5 w-5" />
            <h2 className="text-lg font-bold">نماذج ChatGPT الجاهزة</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-4">
            انسخ الـ Prompt وألصقه في ChatGPT مع تعديل البيانات بين الأقواس []
          </p>

          {CHATGPT_PROMPTS.map((category, catIdx) => (
            <Card key={catIdx}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={cn("p-2 rounded-lg", category.bgColor)}>
                    <category.icon className={cn("h-4 w-4", category.color)} />
                  </div>
                  {category.category}
                  <Badge variant="outline" className="mr-auto text-xs">{category.prompts.length} نموذج</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.prompts.map((p, pIdx) => (
                  <div key={pIdx} className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors" data-testid={`prompt-${catIdx}-${pIdx}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {p.title}
                      </h4>
                      <Button variant="outline" size="sm" onClick={() => copyText(p.prompt)} data-testid={`button-copy-prompt-${catIdx}-${pIdx}`}>
                        <Copy className="h-3 w-3 ml-1" />
                        نسخ
                      </Button>
                    </div>
                    <pre className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg whitespace-pre-wrap leading-relaxed font-sans max-h-40 overflow-y-auto">
                      {p.prompt}
                    </pre>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTool === "canva" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-purple-600">
            <Palette className="h-5 w-5" />
            <h2 className="text-lg font-bold">دليل استخدام Canva</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-4">
            قوالب وإرشادات لتصميم مواد احترافية للعملاء
          </p>

          <div className="grid gap-4">
            {CANVA_GUIDES.map((guide, idx) => (
              <Card key={idx} data-testid={`canva-guide-${idx}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <Star className="h-4 w-4 text-purple-500" />
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(guide.link, "_blank")} data-testid={`button-canva-${idx}`}>
                      <ExternalLink className="h-3 w-3 ml-1" />
                      فتح القوالب
                    </Button>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-purple-600 mb-2 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      نصائح مهمة
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {guide.tips.map((tip, tIdx) => (
                        <div key={tIdx} className="flex items-start gap-1.5 text-xs text-gray-700">
                          <CheckCircle2 className="h-3 w-3 text-purple-500 mt-0.5 shrink-0" />
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTool === "gamma" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-amber-600">
            <Presentation className="h-5 w-5" />
            <h2 className="text-lg font-bold">دليل استخدام Gamma</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-4">
            نماذج لإنشاء صفحات هبوط وعروض تقديمية احترافية
          </p>

          <div className="grid gap-4">
            {GAMMA_GUIDES.map((guide, idx) => (
              <Card key={idx} data-testid={`gamma-guide-${idx}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <Presentation className="h-4 w-4 text-amber-500" />
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.open(guide.link, "_blank")} data-testid={`button-gamma-${idx}`}>
                      <ExternalLink className="h-3 w-3 ml-1" />
                      فتح Gamma
                    </Button>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-amber-600 mb-2">أقسام مقترحة:</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {guide.sections.map((section, sIdx) => (
                        <Badge key={sIdx} variant="outline" className="text-xs">{sIdx + 1}. {section}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Prompt جاهز لـ Gamma
                      </h4>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => copyText(guide.prompt)} data-testid={`button-copy-gamma-${idx}`}>
                        <Copy className="h-3 w-3 ml-1" />
                        نسخ
                      </Button>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">{guide.prompt}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
