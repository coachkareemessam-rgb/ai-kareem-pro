import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Users, UserPlus, Gift, MessageSquare, TrendingUp,
  Plus, Trash2, CheckCircle2, Clock, Phone, Mail,
  Star, Lightbulb, Copy, ArrowLeft, AlertTriangle, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Referral, Deal } from "@shared/schema";

interface ReferralStrategy {
  title: string;
  timing: string;
  script: string;
  tips: string[];
  icon: string;
}

const referralStrategies: ReferralStrategy[] = [
  {
    title: "بعد نجاح العميل (أفضل توقيت)",
    timing: "بعد تحقيق العميل لنتيجة ملموسة أو إشادته بالخدمة",
    script: "أسعدني جداً نجاحك مع المنصة يا [اسم العميل]! شايف إنك حققت [إنجاز محدد] وهذا شيء ممتاز. عندي سؤال بسيط: هل تعرف مدرب أو أكاديمية ممكن يستفيدون بنفس الطريقة؟ أكون ممتن لو تعرّفني عليهم، وطبعاً بقدم لهم نفس الاهتمام اللي قدمته لك.",
    tips: [
      "اختر اللحظة التي يكون فيها العميل أكثر حماساً",
      "اذكر إنجازه المحدد لتعزيز شعوره بالنجاح",
      "لا تضغط - اجعلها محادثة طبيعية",
    ],
    icon: "🏆",
  },
  {
    title: "أثناء التجديد",
    timing: "عند تجديد الاشتراك أو ترقية الباقة",
    script: "سعيد إنك قررت تجدد معنا يا [اسم العميل]! هذا يعني إن المنصة بتفيدك. بالمناسبة، كثير من عملائنا الناجحين مثلك يرشحون زملاءهم للاستفادة. هل في حد تعرفه ممكن يستفيد؟ بنكون سعداء نساعدهم مثل ما ساعدناك.",
    tips: [
      "التجديد = دليل على الرضا → أفضل وقت للطلب",
      "اذكر أن عملاء آخرين يفعلون ذلك (Social Proof)",
      "ركّز على القيمة التي سيحصل عليها الشخص المُرشَّح",
    ],
    icon: "🔄",
  },
  {
    title: "بعد حل مشكلة",
    timing: "بعد حل مشكلة للعميل بسرعة وكفاءة",
    script: "الحمدلله إننا قدرنا نحل المشكلة بسرعة يا [اسم العميل]. رضاك يهمنا كثير. لو تعرف أحد يبحث عن منصة تعليمية تهتم بعملائها بنفس المستوى، أكون سعيد إنك تعرّفني عليه.",
    tips: [
      "حل المشكلة بسرعة يخلق شعور بالامتنان",
      "العميل يشعر بالحاجة لرد الجميل",
      "اربط الترشيح بجودة الدعم (نقطة قوة)",
    ],
    icon: "🔧",
  },
  {
    title: "في المناسبات والأحداث",
    timing: "خلال ورش العمل، المؤتمرات، أو الويبنارات",
    script: "شكراً لحضورك [الحدث] يا [اسم العميل]! لاحظت إنك متفاعل ومهتم. إذا عندك زملاء في المجال يحبون يحضرون الحدث القادم أو يجربون المنصة، أرسلي أسماءهم وأنا أتواصل معاهم وأعطيهم تجربة مجانية.",
    tips: [
      "الأحداث تجمع الناس وتسهل الترشيح",
      "قدّم قيمة للمُرشَّح (تجربة مجانية، حضور مجاني)",
      "تابع خلال 24 ساعة من الحدث",
    ],
    icon: "🎪",
  },
  {
    title: "الطلب المباشر (للعملاء المخلصين)",
    timing: "مع العملاء الذين لديهم علاقة قوية معك",
    script: "يا [اسم العميل]، أنت من أهم عملائنا وأقدّر ثقتك فينا. عندي طلب بسيط: هل ممكن ترشح لي 2-3 أشخاص من معارفك ممكن يستفيدون من المنصة؟ ترشيحك يعني إنك تساعد زميل يستفيد بنفس الطريقة، وبنحرص نعطيه نفس الاهتمام اللي حصلت عليه.",
    tips: [
      "كن محدداً (2-3 أشخاص وليس 'أي حد')",
      "ركّز على أن الترشيح يساعد زميلاً ويعكس ثقة العميل",
      "اشكره حتى لو لم يرشح أحداً",
    ],
    icon: "🤝",
  },
];

const referralIncentives = [
  { title: "التقدير والشكر العلني", desc: "شكر العميل المُرشِّح علنياً في مجتمع المنصة أو على وسائل التواصل كشريك نجاح", icon: "🏅" },
  { title: "شهادة تقدير مخصصة", desc: "إرسال شهادة تقدير باسم العميل تعترف بدوره في نشر الفائدة والمعرفة", icon: "📜" },
  { title: "عضوية نادي السفراء", desc: "ضم العميل لنادي السفراء الحصري مع مزايا معنوية مثل الاستشارات الخاصة واللقاءات المغلقة", icon: "👑" },
  { title: "تسليط الضوء على قصة نجاحه", desc: "نشر قصة نجاح العميل كنموذج ملهم على المنصة ووسائل التواصل", icon: "✨" },
  { title: "أولوية المشاركة في الفعاليات", desc: "دعوة خاصة للمشاركة كمتحدث أو ضيف شرف في ورش العمل والمؤتمرات", icon: "🎤" },
  { title: "تأثير إيجابي على المجتمع", desc: "تذكير العميل بأن ترشيحه يساعد زميلاً في تحسين عمله ونشر المعرفة", icon: "💡" },
];

const statusOptions = [
  { value: 'pending', label: 'قيد الانتظار', color: '#f59e0b' },
  { value: 'contacted', label: 'تم التواصل', color: '#3b82f6' },
  { value: 'interested', label: 'مهتم', color: '#8b5cf6' },
  { value: 'converted', label: 'تم التحويل', color: '#10b981' },
  { value: 'not_interested', label: 'غير مهتم', color: '#ef4444' },
];

const clientTypes = [
  { value: 'trainer', label: 'مدرب' },
  { value: 'academy', label: 'أكاديمية' },
  { value: 'training_center', label: 'مركز تدريب' },
  { value: 'university', label: 'جامعة' },
  { value: 'school', label: 'مدرسة' },
];

export default function ReferralsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('track');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    referrerName: '',
    referrerDealId: '',
    referredName: '',
    referredPhone: '',
    referredEmail: '',
    referredType: 'trainer',
    notes: '',
    followUpDate: '',
  });

  const { data: referrals = [] } = useQuery<Referral[]>({ queryKey: ["/api/referrals"] });
  const { data: deals = [] } = useQuery<Deal[]>({ queryKey: ["/api/deals"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/referrals", {
        ...formData,
        referrerDealId: formData.referrerDealId || null,
        followUpDate: formData.followUpDate || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      toast({ title: "تم الإضافة", description: "تم إضافة الترشيح بنجاح" });
      setFormData({
        referrerName: '', referrerDealId: '', referredName: '',
        referredPhone: '', referredEmail: '', referredType: 'trainer',
        notes: '', followUpDate: '',
      });
      setShowAddForm(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في إضافة الترشيح", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/referrals/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      toast({ title: "تم التحديث", description: "تم تحديث حالة الترشيح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/referrals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      toast({ title: "تم الحذف", description: "تم حذف الترشيح" });
    },
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    contacted: referrals.filter(r => r.status === 'contacted').length,
    interested: referrals.filter(r => r.status === 'interested').length,
    converted: referrals.filter(r => r.status === 'converted').length,
    conversionRate: referrals.length > 0
      ? Math.round((referrals.filter(r => r.status === 'converted').length / referrals.length) * 100)
      : 0,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "تم نسخ النص للحافظة" });
  };

  return (
    <div className="flex flex-col gap-4" data-testid="page-referrals">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-referrals-title">نظام الترشيحات</h1>
          <p className="text-muted-foreground">كيف تطلب من عملائك ترشيح عملاء جدد + تتبع الترشيحات</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold" data-testid="text-total-referrals">{stats.total}</p>
            <p className="text-xs text-muted-foreground">إجمالي الترشيحات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">قيد الانتظار</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.converted}</p>
            <p className="text-xs text-muted-foreground">تم التحويل</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.conversionRate}%</p>
            <p className="text-xs text-muted-foreground">نسبة التحويل</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="track" data-testid="tab-track">تتبع الترشيحات</TabsTrigger>
          <TabsTrigger value="strategies" data-testid="tab-strategies">استراتيجيات الطلب</TabsTrigger>
          <TabsTrigger value="incentives" data-testid="tab-incentives">الحوافز المعنوية</TabsTrigger>
        </TabsList>

        <TabsContent value="track" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">قائمة الترشيحات</h2>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button data-testid="btn-add-referral">
                    <Plus className="w-4 h-4 ml-1" />
                    ترشيح جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>إضافة ترشيح جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>اسم العميل المُرشِّح *</Label>
                        <Input
                          value={formData.referrerName}
                          onChange={e => setFormData(p => ({ ...p, referrerName: e.target.value }))}
                          placeholder="من رشّح هذا الشخص؟"
                          data-testid="input-referrer-name"
                        />
                      </div>
                      <div>
                        <Label>ربط بصفقة المُرشِّح</Label>
                        <Select value={formData.referrerDealId || 'none'} onValueChange={v => setFormData(p => ({ ...p, referrerDealId: v === 'none' ? '' : v }))}>
                          <SelectTrigger data-testid="select-referrer-deal">
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

                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        معلومات الشخص المُرشَّح
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>الاسم *</Label>
                          <Input
                            value={formData.referredName}
                            onChange={e => setFormData(p => ({ ...p, referredName: e.target.value }))}
                            placeholder="اسم الشخص المرشح"
                            data-testid="input-referred-name"
                          />
                        </div>
                        <div>
                          <Label>النوع</Label>
                          <Select value={formData.referredType} onValueChange={v => setFormData(p => ({ ...p, referredType: v }))}>
                            <SelectTrigger data-testid="select-referred-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {clientTypes.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>رقم الهاتف</Label>
                          <Input
                            value={formData.referredPhone}
                            onChange={e => setFormData(p => ({ ...p, referredPhone: e.target.value }))}
                            placeholder="05xxxxxxxx"
                            data-testid="input-referred-phone"
                          />
                        </div>
                        <div>
                          <Label>البريد الإلكتروني</Label>
                          <Input
                            value={formData.referredEmail}
                            onChange={e => setFormData(p => ({ ...p, referredEmail: e.target.value }))}
                            placeholder="email@example.com"
                            data-testid="input-referred-email"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>ملاحظات</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                        placeholder="أي معلومات إضافية عن المُرشَّح..."
                        rows={2}
                        data-testid="textarea-referral-notes"
                      />
                    </div>
                    <div>
                      <Label>تاريخ المتابعة</Label>
                      <Input
                        type="date"
                        value={formData.followUpDate}
                        onChange={e => setFormData(p => ({ ...p, followUpDate: e.target.value }))}
                        data-testid="input-follow-up-date"
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => createMutation.mutate()}
                      disabled={!formData.referrerName || !formData.referredName || createMutation.isPending}
                      data-testid="btn-save-referral"
                    >
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      حفظ الترشيح
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {referrals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-1">لا توجد ترشيحات بعد</h3>
                  <p className="text-muted-foreground text-sm mb-4">ابدأ بإضافة ترشيحات من عملائك الحاليين</p>
                  <Button onClick={() => setShowAddForm(true)} data-testid="btn-add-referral-empty">
                    <Plus className="w-4 h-4 ml-1" />
                    أضف أول ترشيح
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {referrals.map(ref => {
                  const statusInfo = statusOptions.find(s => s.value === ref.status) || statusOptions[0];
                  return (
                    <Card key={ref.id} data-testid={`card-referral-${ref.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <h3 className="font-semibold">{ref.referredName}</h3>
                                <p className="text-xs text-muted-foreground">
                                  مُرشَّح من: <span className="font-medium text-foreground">{ref.referrerName}</span>
                                  {' | '}
                                  {clientTypes.find(t => t.value === ref.referredType)?.label || ref.referredType}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2">
                              {ref.referredPhone && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {ref.referredPhone}
                                </Badge>
                              )}
                              {ref.referredEmail && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {ref.referredEmail}
                                </Badge>
                              )}
                              {ref.followUpDate && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  متابعة: {ref.followUpDate}
                                </Badge>
                              )}
                            </div>

                            {ref.notes && (
                              <p className="text-xs text-muted-foreground mt-2">{ref.notes}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Select
                              value={ref.status}
                              onValueChange={v => updateStatusMutation.mutate({ id: ref.id, status: v })}
                            >
                              <SelectTrigger className="w-36 h-8" data-testid={`select-referral-status-${ref.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map(s => (
                                  <SelectItem key={s.value} value={s.value}>
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                                      {s.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => deleteMutation.mutate(ref.id)}
                              data-testid={`btn-delete-referral-${ref.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  لماذا الترشيحات مهمة؟
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { stat: "83%", desc: "من العملاء الراضين مستعدون للترشيح لكن فقط 29% يفعلون ذلك لأن أحداً لم يطلب منهم", color: "#3b82f6" },
                    { stat: "4x", desc: "العملاء القادمون بترشيح أكثر احتمالاً للشراء من العملاء العاديين", color: "#10b981" },
                    { stat: "37%", desc: "من العملاء المُرشَّحين يبقون عملاء لفترة أطول ويحققون قيمة عمرية أعلى", color: "#8b5cf6" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/30 text-center">
                      <p className="text-3xl font-bold mb-1" style={{ color: item.color }}>{item.stat}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {referralStrategies.map((strategy, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl shrink-0">{strategy.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base mb-1">{strategy.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          التوقيت: {strategy.timing}
                        </p>

                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900 mb-3 relative">
                          <h4 className="font-semibold text-sm text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            السكربت المقترح
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">"{strategy.script}"</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 left-2 h-7 w-7"
                            onClick={() => copyToClipboard(strategy.script)}
                            data-testid={`btn-copy-script-${i}`}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs text-muted-foreground">نصائح:</h4>
                          {strategy.tips.map((tip, j) => (
                            <p key={j} className="text-xs flex gap-2">
                              <Star className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                              {tip}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  أخطاء شائعة يجب تجنبها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { bad: "طلب الترشيح قبل أن يحقق العميل نتيجة", good: "انتظر حتى يحقق العميل نجاحاً ملموساً ثم اطلب" },
                    { bad: "الضغط على العميل للترشيح", good: "اجعلها محادثة طبيعية وقدّم الخيار بلطف" },
                    { bad: "عدم المتابعة مع المُرشَّحين", good: "تواصل خلال 24-48 ساعة واذكر اسم المُرشِّح" },
                    { bad: "نسيان شكر العميل المُرشِّح", good: "اشكره دائماً وأخبره بنتيجة الترشيح" },
                    { bad: "طلب ترشيحات عامة ('أي حد تعرفه')", good: "كن محدداً ('هل تعرف مدرب يعاني من...')" },
                    { bad: "عدم تقديم حوافز", good: "قدّم قيمة للطرفين (المُرشِّح والمُرشَّح)" },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-lg border">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-red-500 text-xs mt-0.5">✕</span>
                        <p className="text-xs text-red-600 dark:text-red-400">{item.bad}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 text-xs mt-0.5">✓</span>
                        <p className="text-xs text-green-600 dark:text-green-400">{item.good}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incentives" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  الحوافز المعنوية للترشيحات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {referralIncentives.map((incentive, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/30 border hover:shadow-md transition-all">
                      <div className="text-3xl mb-2">{incentive.icon}</div>
                      <h4 className="font-semibold text-sm mb-1">{incentive.title}</h4>
                      <p className="text-xs text-muted-foreground">{incentive.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  رسائل متابعة المُرشَّحين
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "الرسالة الأولى - التواصل المبدئي",
                    template: "أهلاً [اسم المُرشَّح]، اسمي [اسمك] من [اسم الشركة]. [اسم المُرشِّح] أخبرني عنك وعن عملك الرائع في [المجال]. حسب كلامه، أعتقد إن منصتنا ممكن تساعدك في [المشكلة المحتملة]. هل عندك 10 دقائق نتكلم فيها؟",
                  },
                  {
                    title: "رسالة المتابعة - بعد عدم الرد",
                    template: "أهلاً [اسم المُرشَّح]، أتمنى تكون بخير. تواصلت معك قبل [مدة] بناءً على ترشيح [اسم المُرشِّح]. أحببت أتابع معك لأن عندنا [عرض/قيمة محددة] ممكن تفيدك. هل الوقت مناسب للحديث؟",
                  },
                  {
                    title: "رسالة الشكر للمُرشِّح",
                    template: "شكراً جزيلاً يا [اسم المُرشِّح] على ترشيح [اسم المُرشَّح]. تواصلنا معه وكانت المحادثة ممتازة. ترشيحك يعكس ثقتك فينا وحرصك على مساعدة زملائك، وهذا شيء نقدّره كثير. شكراً لدعمك المستمر!",
                  },
                ].map((msg, i) => (
                  <div key={i} className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 relative">
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2">{msg.title}</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">"{msg.template}"</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 left-2 h-7 w-7"
                      onClick={() => copyToClipboard(msg.template)}
                      data-testid={`btn-copy-template-${i}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}