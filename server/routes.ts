import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDealSchema, insertConversationSchema, insertMessageSchema, insertKnowledgeFileSchema, insertSopStepSchema, insertTaskSchema, insertDailyReflectionSchema, insertClientQualificationSchema, insertReferralSchema, insertClientAnalysisSchema, insertCSConversationSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `أنت "كريم" - مساعد ذكاء اصطناعي متخصص في عمليات المبيعات للمؤسسات التعليمية العربية. 

مهامك الأساسية:
1. مساعدة فريق المبيعات في الرد على اعتراضات العملاء بطريقة احترافية
2. كتابة رسائل متابعة وإيميلات مخصصة
3. تقديم استشارات حول خطوات SOP (إجراءات العمل القياسية)
4. تحليل المنافسين وتقديم نقاط القوة
5. المساعدة في تأهيل العملاء المحتملين (Lead Qualification)

قواعد مهمة:
- أجب دائماً باللغة العربية
- استخدم أسلوب مهني ودود
- قدم إجابات منظمة مع نقاط واضحة
- عند الرد على اعتراضات العملاء، اتبع منهجية: تعاطف → عزل الاعتراض → إعادة صياغة القيمة → اقتراح حل
- استخدم أمثلة عملية من سياق المؤسسات التعليمية والمدربين
- عند تقديم رسائل مقترحة، اجعلها جاهزة للإرسال مباشرة

مراحل البيع (Sales Pipeline):
Lead → تأهيل أولي → Discovery → Demo/Trial → تفاوض → إغلاق

أنواع العملاء: مدربين، أكاديميات، مراكز تدريب، جامعات`;

const CS_SYSTEM_PROMPT = `أنت "كريم CS" - مساعد ذكاء اصطناعي متخصص في نجاح العملاء (Customer Success) للمؤسسات التعليمية العربية.

مهامك الأساسية:
1. مساعدة فريق نجاح العملاء في التعامل مع العملاء الحاليين
2. كتابة محتوى تعليمي ورسائل مخصصة للعملاء
3. تقديم استشارات حول Onboarding وتدريب العملاء
4. المساعدة في كتابة Embed Codes لتحسين واجهة منصات العملاء
5. تقديم حلول لمشاكل العملاء ومنع الإلغاء (Churn Prevention)
6. كتابة تقارير أداء شهرية للعملاء
7. المساعدة في تحسين معدل استخدام العملاء للمنصة
8. تقديم نصائح حول استخدام ChatGPT و Canva و Gamma

قواعد مهمة:
- أجب دائماً باللغة العربية
- استخدم أسلوب ودود وداعم يركّز على نجاح العميل
- قدم إجابات عملية وقابلة للتطبيق فوراً
- عند كتابة رسائل، اجعلها جاهزة للإرسال مباشرة
- ركّز على بناء علاقات طويلة الأمد مع العملاء
- قدم حلول إبداعية لمشاكل العملاء

مراحل نجاح العملاء:
Onboarding → تدريب → بناء المحتوى → إطلاق → متابعة → نمو → تجديد

أدوات الفريق: ChatGPT (محتوى)، Canva (تصميم)، Gamma (صفحات هبوط وعروض)`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============ DEALS API ============
  app.get("/api/deals", async (_req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const deal = await storage.getDeal(req.params.id);
      if (!deal) return res.status(404).json({ error: "Deal not found" });
      res.json(deal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const parsed = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(parsed);
      res.status(201).json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid deal data" });
    }
  });

  app.patch("/api/deals/:id", async (req, res) => {
    try {
      const deal = await storage.updateDeal(req.params.id, req.body);
      if (!deal) return res.status(404).json({ error: "Deal not found" });
      res.json(deal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update deal" });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      await storage.deleteDeal(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete deal" });
    }
  });

  // ============ CONVERSATIONS API ============
  app.get("/api/conversations", async (_req, res) => {
    try {
      const convs = await storage.getConversations();
      res.json(convs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const parsed = insertConversationSchema.parse(req.body);
      const conv = await storage.createConversation(parsed);
      res.json(conv);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid data" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      await storage.deleteConversation(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // ============ MESSAGES / AI CHAT API ============
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const msgs = await storage.getMessages(req.params.id);
      res.json(msgs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const { content } = req.body;

      if (!content) return res.status(400).json({ error: "Content is required" });

      const userMsg = await storage.createMessage({
        conversationId,
        role: "user",
        content,
      });

      const history = await storage.getMessages(conversationId);
      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        stream: true,
        max_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }

      await storage.createMessage({
        conversationId,
        role: "assistant",
        content: fullResponse,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("AI Chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "حدث خطأ أثناء المعالجة" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to process message" });
      }
    }
  });

  // ============ KNOWLEDGE FILES API ============
  app.get("/api/knowledge-files", async (_req, res) => {
    try {
      const files = await storage.getKnowledgeFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.post("/api/knowledge-files", async (req, res) => {
    try {
      const parsed = insertKnowledgeFileSchema.parse(req.body);
      const file = await storage.createKnowledgeFile(parsed);
      res.status(201).json(file);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid file data" });
    }
  });

  app.delete("/api/knowledge-files/:id", async (req, res) => {
    try {
      await storage.deleteKnowledgeFile(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // ============ SOP STEPS API ============
  app.get("/api/sop-steps", async (_req, res) => {
    try {
      const steps = await storage.getSopSteps();
      res.json(steps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SOP steps" });
    }
  });

  app.post("/api/sop-steps", async (req, res) => {
    try {
      const parsed = insertSopStepSchema.parse(req.body);
      const step = await storage.createSopStep(parsed);
      res.status(201).json(step);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid step data" });
    }
  });

  app.patch("/api/sop-steps/:id", async (req, res) => {
    try {
      const step = await storage.updateSopStep(req.params.id, req.body);
      if (!step) return res.status(404).json({ error: "Step not found" });
      res.json(step);
    } catch (error) {
      res.status(500).json({ error: "Failed to update step" });
    }
  });

  // ============ TASKS API ============
  app.get("/api/tasks", async (_req, res) => {
    try {
      const allTasks = await storage.getTasks();
      res.json(allTasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const parsed = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(parsed);
      res.status(201).json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const updateData = insertTaskSchema.partial().parse(req.body);
      const finalData: any = { ...updateData };
      if (finalData.status === "completed" && !finalData.completedAt) {
        finalData.completedAt = new Date();
      }
      if (finalData.status !== "completed") {
        finalData.completedAt = null;
      }
      const task = await storage.updateTask(req.params.id, finalData);
      if (!task) return res.status(404).json({ error: "Task not found" });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // ============ DAILY REFLECTIONS API ============
  app.get("/api/reflections", async (_req, res) => {
    try {
      const reflections = await storage.getDailyReflections();
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflections" });
    }
  });

  app.get("/api/reflections/date/:date", async (req, res) => {
    try {
      const reflection = await storage.getDailyReflectionByDate(req.params.date);
      res.json(reflection || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflection" });
    }
  });

  app.post("/api/reflections", async (req, res) => {
    try {
      const parsed = insertDailyReflectionSchema.parse(req.body);
      const reflection = await storage.createDailyReflection(parsed);
      res.status(201).json(reflection);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid reflection data" });
    }
  });

  app.patch("/api/reflections/:id", async (req, res) => {
    try {
      const parsed = insertDailyReflectionSchema.partial().parse(req.body);
      const reflection = await storage.updateDailyReflection(req.params.id, parsed);
      if (!reflection) return res.status(404).json({ error: "Reflection not found" });
      res.json(reflection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reflection" });
    }
  });

  app.delete("/api/reflections/:id", async (req, res) => {
    try {
      await storage.deleteDailyReflection(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reflection" });
    }
  });

  // ============ CLIENT QUALIFICATIONS API ============
  app.get("/api/qualifications", async (_req, res) => {
    try {
      const qualifications = await storage.getClientQualifications();
      res.json(qualifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch qualifications" });
    }
  });

  app.post("/api/qualifications", async (req, res) => {
    try {
      const parsed = insertClientQualificationSchema.parse(req.body);
      const qualification = await storage.createClientQualification(parsed);
      res.status(201).json(qualification);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid qualification data" });
    }
  });

  app.patch("/api/qualifications/:id", async (req, res) => {
    try {
      const parsed = insertClientQualificationSchema.partial().parse(req.body);
      const qualification = await storage.updateClientQualification(req.params.id, parsed);
      if (!qualification) return res.status(404).json({ error: "Qualification not found" });
      res.json(qualification);
    } catch (error) {
      res.status(500).json({ error: "Failed to update qualification" });
    }
  });

  app.delete("/api/qualifications/:id", async (req, res) => {
    try {
      await storage.deleteClientQualification(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete qualification" });
    }
  });

  app.post("/api/qualifications/analyze", async (req, res) => {
    try {
      const { clientName, clientType, clientIndustry, clientDescription } = req.body;
      if (!clientDescription || !clientIndustry) {
        return res.status(400).json({ error: "Client industry and description are required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `أنت محلل مبيعات خبير متخصص في قطاع التعليم الرقمي والمنصات التعليمية. مهمتك تحليل العميل المحتمل وتقديم:

1. **تحليل شامل للعميل**: فهم وضعه الحالي واحتياجاته
2. **نقاط الألم الرئيسية**: أهم التحديات والمشاكل التي يعاني منها (على الأقل 5 نقاط)
3. **الفرص البيعية**: كيف يمكن لمستشار المبيعات استغلال هذه النقاط
4. **أسئلة استكشافية مقترحة**: أسئلة يمكن لمستشار المبيعات طرحها للتعمق أكثر
5. **نصائح للتعامل**: كيفية التعامل مع هذا النوع من العملاء

اكتب بالعربية بأسلوب احترافي ومباشر. استخدم العناوين والنقاط لتنظيم المحتوى. ركّز على نقاط الألم التي يمكن أن يستغلها مستشار المبيعات لإقناع العميل.`
          },
          {
            role: "user",
            content: `حلل هذا العميل المحتمل:

**اسم العميل**: ${clientName || 'غير محدد'}
**نوع العميل**: ${clientType || 'غير محدد'}
**مجال العميل**: ${clientIndustry}
**وصف العميل**: ${clientDescription}

قدّم تحليلاً مفصلاً مع التركيز على نقاط الألم الرئيسية التي يمكن لمستشار المبيعات استغلالها.`
          }
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Qualification analysis error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to analyze client" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Analysis failed" })}\n\n`);
        res.end();
      }
    }
  });

  // ============ COLOR PALETTE API ============
  app.post("/api/color-palette/generate", async (req, res) => {
    try {
      const { clientName, clientIndustry, clientDescription, logoColors } = req.body;
      if (!clientIndustry) {
        return res.status(400).json({ error: "Client industry is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const logoContext = logoColors && logoColors.length > 0
        ? `\n**ألوان اللوجو الحالي**: ${logoColors.join(', ')}\nيجب أن تتوافق البالتة المقترحة مع ألوان اللوجو وتكملها.`
        : '\nلا يوجد لوجو حالي - اقترح بالتة ألوان جديدة من الصفر مناسبة للمجال.';

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `أنت خبير تصميم وبراندينج متخصص في اختيار بالتات الألوان للعلامات التجارية التعليمية والرقمية. مهمتك اقتراح بالتة ألوان احترافية بناءً على معلومات العميل ومجاله.

يجب أن يتضمن ردك:

1. **البالتة الرئيسية** (4-6 ألوان): لكل لون اذكر:
   - الاسم بالعربية والإنجليزية
   - كود HEX
   - استخدامه المقترح (خلفية رئيسية، نصوص، أزرار، تمييز، إلخ)

2. **سيكولوجية الألوان**: لماذا هذه الألوان مناسبة لهذا المجال والعميل

3. **نصائح التطبيق**: كيفية استخدام الألوان في:
   - الموقع الإلكتروني / المنصة
   - وسائل التواصل الاجتماعي
   - المواد التسويقية
   - العروض التقديمية

4. **تحذيرات**: ألوان يجب تجنبها ولماذا

5. **أمثلة ملهمة**: علامات تجارية ناجحة في نفس المجال وألوانها

اكتب بالعربية بأسلوب احترافي. قدّم أكواد HEX الدقيقة لكل لون.`
          },
          {
            role: "user",
            content: `اقترح بالتة ألوان لهذا العميل:

**اسم العميل**: ${clientName || 'غير محدد'}
**مجال العميل**: ${clientIndustry}
**وصف النشاط**: ${clientDescription || 'غير محدد'}
${logoContext}

اقترح بالتة ألوان احترافية تناسب هذا المجال وتعكس هوية العميل.`
          }
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Color palette generation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate color palette" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Generation failed" })}\n\n`);
        res.end();
      }
    }
  });

  // ============ REFERRALS API ============
  app.get("/api/referrals", async (_req, res) => {
    try {
      const allReferrals = await storage.getReferrals();
      res.json(allReferrals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch referrals" });
    }
  });

  app.post("/api/referrals", async (req, res) => {
    try {
      const parsed = insertReferralSchema.parse(req.body);
      const referral = await storage.createReferral(parsed);
      res.status(201).json(referral);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid referral data" });
    }
  });

  app.patch("/api/referrals/:id", async (req, res) => {
    try {
      const parsed = insertReferralSchema.partial().parse(req.body);
      const referral = await storage.updateReferral(req.params.id, parsed);
      if (!referral) return res.status(404).json({ error: "Referral not found" });
      res.json(referral);
    } catch (error) {
      res.status(500).json({ error: "Failed to update referral" });
    }
  });

  app.delete("/api/referrals/:id", async (req, res) => {
    try {
      await storage.deleteReferral(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete referral" });
    }
  });

  // ============ CS CONVERSATIONS API ============
  app.get("/api/cs/conversations", async (_req, res) => {
    try {
      const convs = await storage.getCSConversations();
      res.json(convs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CS conversations" });
    }
  });

  app.post("/api/cs/conversations", async (req, res) => {
    try {
      const parsed = insertCSConversationSchema.parse(req.body);
      const conv = await storage.createCSConversation(parsed);
      res.json(conv);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid data" });
    }
  });

  app.delete("/api/cs/conversations/:id", async (req, res) => {
    try {
      await storage.deleteCSConversation(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete CS conversation" });
    }
  });

  app.get("/api/cs/conversations/:id/messages", async (req, res) => {
    try {
      const msgs = await storage.getCSMessages(req.params.id);
      res.json(msgs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CS messages" });
    }
  });

  app.post("/api/cs/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const { content } = req.body;

      if (!content) return res.status(400).json({ error: "Content is required" });

      const userMsg = await storage.createCSMessage({
        conversationId,
        role: "user",
        content,
      });

      const history = await storage.getCSMessages(conversationId);
      const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: CS_SYSTEM_PROMPT },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
        stream: true,
        max_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }

      await storage.createCSMessage({
        conversationId,
        role: "assistant",
        content: fullResponse,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("CS AI Chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "حدث خطأ أثناء المعالجة" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to process message" });
      }
    }
  });

  // ============ CLIENT ANALYSES API ============
  app.get("/api/analyses", async (_req, res) => {
    try {
      const analyses = await storage.getClientAnalyses();
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  app.post("/api/analyses", async (req, res) => {
    try {
      const parsed = insertClientAnalysisSchema.parse(req.body);
      const analysis = await storage.createClientAnalysis(parsed);
      res.status(201).json(analysis);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid analysis data" });
    }
  });

  app.patch("/api/analyses/:id", async (req, res) => {
    try {
      const parsed = insertClientAnalysisSchema.partial().parse(req.body);
      const analysis = await storage.updateClientAnalysis(req.params.id, parsed);
      if (!analysis) return res.status(404).json({ error: "Analysis not found" });
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to update analysis" });
    }
  });

  app.delete("/api/analyses/:id", async (req, res) => {
    try {
      await storage.deleteClientAnalysis(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete analysis" });
    }
  });

  app.post("/api/analyses/generate", async (req, res) => {
    try {
      const { clientName, clientType, field, currentMethod, targetAudience, experience, challenges, goals, additionalInfo } = req.body;

      if (!clientName || !field) {
        return res.status(400).json({ error: "اسم العميل والمجال مطلوبان" });
      }

      const clientTypeLabels: Record<string, string> = {
        trainer: "مدرب",
        coach: "كوتش",
        expert: "خبير",
        content_creator: "صانع محتوى تعليمي",
        academy: "أكاديمية",
        training_center: "مركز تدريب",
      };

      const prompt = `أنت محلل أعمال متخصص في قطاع التدريب والتعليم الرقمي. مستشار المبيعات يحتاج مساعدتك في فهم عميل محتمل وتحديد نقاط الألم والتحديات التي يمكن استغلالها في عملية البيع.

بيانات العميل:
- الاسم: ${clientName}
- النوع: ${clientTypeLabels[clientType] || clientType}
- المجال: ${field}
${currentMethod ? `- الطريقة الحالية: ${currentMethod}` : ""}
${targetAudience ? `- الجمهور المستهدف: ${targetAudience}` : ""}
${experience ? `- الخبرة: ${experience}` : ""}
${challenges ? `- التحديات المذكورة: ${challenges}` : ""}
${goals ? `- الأهداف: ${goals}` : ""}
${additionalInfo ? `- معلومات إضافية: ${additionalInfo}` : ""}

قدم تحليلاً شاملاً يتضمن:

## 1. تصور شامل عن العميل
وصف مفصل لوضع العميل الحالي في السوق وكيف يعمل

## 2. نقاط الألم الرئيسية (Pain Points)
حدد 5-7 نقاط ألم محتملة بناءً على نوع العميل ومجاله. لكل نقطة:
- وصف المشكلة
- تأثيرها على العميل
- كيف يمكن لمنتجاتنا/خدماتنا حلها

## 3. التحديات التي يواجهها
حدد التحديات الرئيسية التي يمكن أن يواجهها هذا النوع من العملاء في مجاله

## 4. الفرص البيعية
اقترح 3-5 نقاط يمكن لمستشار المبيعات استغلالها في المحادثة مع العميل

## 5. أسئلة مقترحة للاكتشاف
اقترح 5-7 أسئلة يمكن لمستشار المبيعات طرحها لفهم احتياجات العميل بشكل أعمق

## 6. استراتيجية البيع المقترحة
اقترح أفضل طريقة للتعامل مع هذا العميل وإقناعه

اكتب التحليل بالعربية بأسلوب احترافي وعملي يساعد مستشار المبيعات في استخدامه مباشرة.`;

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "أنت محلل أعمال متخصص في قطاع التدريب والتعليم الرقمي. تساعد فرق المبيعات في فهم عملائهم المحتملين." },
          { role: "user", content: prompt },
        ],
        stream: true,
        max_tokens: 3000,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true, fullContent: fullResponse })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Analysis generation error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "حدث خطأ أثناء التحليل" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate analysis" });
      }
    }
  });

  // ============ DASHBOARD STATS API ============
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const allDeals = await storage.getDeals();
      const activeDeals = allDeals.filter(d => d.status !== "closed_lost");
      const wonDeals = allDeals.filter(d => d.status === "closed_won");
      const totalDeals = allDeals.length;
      const conversionRate = totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;
      const newLeads = allDeals.filter(d => d.stage === "lead").length;

      res.json({
        activeDeals: activeDeals.length,
        conversionRate: `${conversionRate}%`,
        newLeads,
        totalDeals,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
