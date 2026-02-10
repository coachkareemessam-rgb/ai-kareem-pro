import { db } from "./db";
import { deals, sopSteps, knowledgeFiles, conversations, messages } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const existingDeals = await db.select().from(deals);
  if (existingDeals.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database...");

  await db.insert(deals).values([
    { clientName: "أكاديمية المستقبل", clientType: "academy", stage: "discovery", value: "$1,188", owner: "أحمد محمد", status: "active" },
    { clientName: "د. خالد العمر", clientType: "trainer", stage: "trial", value: "$348", owner: "سارة علي", status: "active" },
    { clientName: "مركز التميز للتدريب", clientType: "training_center", stage: "negotiation", value: "$2,500", owner: "أحمد محمد", status: "warning" },
    { clientName: "المدربة ليلى", clientType: "trainer", stage: "closed_won", value: "$276", owner: "سارة علي", status: "closed_won" },
    { clientName: "معهد اللغات الحديثة", clientType: "academy", stage: "lead", value: "-", owner: "نظام", status: "new" },
  ]);

  await db.insert(sopSteps).values([
    {
      stepNumber: 1,
      title: "استلام Lead جديد",
      objective: "تسجيل بيانات العميل المحتمل والتحقق من صحتها",
      responsibleRole: "SDR",
      actions: "استلام الـ Lead من القنوات التسويقية (إعلانات، موقع، واتساب)\nتسجيل البيانات في CRM\nالتحقق من صحة البيانات (رقم، إيميل)",
      successCriteria: "بيانات كاملة ومسجلة في النظام",
      commonMistakes: "عدم تسجيل البيانات فوراً\nعدم التحقق من صحة الرقم",
      nextStepYes: "2",
      nextStepNo: null,
    },
    {
      stepNumber: 2,
      title: "تأهيل أولي (30 ثانية)",
      objective: "تحديد ما إذا كان الـ Lead مؤهلاً للمتابعة",
      responsibleRole: "SDR",
      actions: "مراجعة سريعة للبيانات\nتصنيف العميل (مدرب/أكاديمية/مركز)\nتحديد مستوى الوعي بالمنتج",
      successCriteria: "تصنيف واضح للعميل",
      commonMistakes: "قضاء وقت طويل في التأهيل الأولي",
      nextStepYes: "3",
      nextStepNo: "5",
    },
    {
      stepNumber: 3,
      title: "جلسة الاكتشاف (Discovery)",
      objective: "فهم تحديات العميل باستخدام منهجية CHAMP وتحديد مدى ملاءمة الحل",
      responsibleRole: "AE",
      actions: "السؤال عن التحديات الحالية (Challenges)\nمعرفة صاحب القرار (Authority)\nتحديد الميزانية المتوقعة (Money)\nمعرفة الجدول الزمني (Priority)",
      successCriteria: "إجابات واضحة على أسئلة CHAMP",
      commonMistakes: "عرض المنتج قبل فهم التحديات\nعدم سؤال عن صاحب القرار",
      nextStepYes: "4",
      nextStepNo: "5",
    },
    {
      stepNumber: 4,
      title: "Demo + Trial",
      objective: "عرض المنتج بشكل مخصص حسب احتياجات العميل وتقديم فترة تجربة",
      responsibleRole: "AE",
      actions: "تحضير عرض مخصص\nإجراء Demo مباشر\nتفعيل حساب Trial\nإرسال إيميل متابعة مع خطوات البدء",
      successCriteria: "عميل يستخدم المنصة بفعالية خلال فترة التجربة",
      commonMistakes: "عرض كل الميزات بدلاً من التركيز على حاجة العميل\nعدم المتابعة بعد تفعيل التجربة",
      nextStepYes: "6",
      nextStepNo: "5",
    },
    {
      stepNumber: 5,
      title: "إضافة لقائمة المتابعة (Nurturing)",
      objective: "الحفاظ على التواصل مع العملاء غير المؤهلين حالياً",
      responsibleRole: "SDR",
      actions: "إضافة العميل لقائمة البريد الإلكتروني\nإرسال محتوى قيّم بشكل دوري\nإعادة التقييم كل 30 يوم",
      successCriteria: "عميل متفاعل مع المحتوى",
      commonMistakes: "نسيان المتابعة\nإرسال محتوى بيعي مباشر بدلاً من محتوى قيّم",
      nextStepYes: "2",
      nextStepNo: null,
    },
    {
      stepNumber: 6,
      title: "إغلاق الصفقة (Closing)",
      objective: "تحويل العميل المؤهل إلى عميل فعلي",
      responsibleRole: "AE",
      actions: "تقديم العرض النهائي\nمعالجة الاعتراضات الأخيرة\nإرسال العقد أو رابط الدفع\nتأكيد الاشتراك",
      successCriteria: "عميل مشترك ويدفع",
      commonMistakes: "التسرع في طلب الإغلاق\nعدم معالجة الاعتراضات بشكل كافي",
      nextStepYes: null,
      nextStepNo: "5",
    },
  ]);

  await db.insert(knowledgeFiles).values([
    { name: "SOP_Acadimiat_Complete_v2.pdf", type: "PDF", size: "2.4 MB", tag: "SOP", content: "إجراءات العمل القياسية الكاملة لفريق المبيعات" },
    { name: "Objection_Handling_Script.docx", type: "DOCX", size: "1.1 MB", tag: "Script", content: "سكريبت التعامل مع اعتراضات العملاء" },
    { name: "Pricing_Tiers_2026.xlsx", type: "XLSX", size: "850 KB", tag: "Pricing", content: "جدول الأسعار والباقات لعام 2026" },
    { name: "Competitor_Analysis_Teachable.pdf", type: "PDF", size: "3.2 MB", tag: "Market", content: "تحليل المنافسين - Teachable, Thinkific, Kajabi" },
  ]);

  console.log("Database seeded successfully!");
}
