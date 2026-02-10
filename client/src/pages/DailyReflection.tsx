import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Lightbulb, AlertTriangle, Trophy, Target, Save,
  ChevronRight, ChevronLeft, Sparkles, BookOpen, Flame,
  Star, TrendingUp, Heart, Trash2, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DailyReflection as DailyReflectionType } from "@shared/schema";

const motivationalQuotes = [
  "النجاح ليس نهاية، والفشل ليس قاتل. الشجاعة للاستمرار هي ما يهم.",
  "كل يوم هو فرصة جديدة لتصبح أفضل مما كنت بالأمس.",
  "الخبير في أي شيء كان يوماً مبتدئاً.",
  "لا تخف من البطء، خف فقط من التوقف.",
  "الفشل ليس عكس النجاح - إنه جزء منه.",
  "أنت أقوى مما تظن، وأقرب للهدف مما تتخيل.",
  "كل 'لا' تسمعها تقرّبك من 'نعم' التالية.",
  "المبيعات ليست إقناع الناس بما لا يريدونه، بل مساعدتهم في إيجاد ما يحتاجونه.",
];

const moodOptions = [
  { value: 1, label: "صعب", emoji: "😔", color: "#ef4444" },
  { value: 2, label: "عادي", emoji: "😐", color: "#f59e0b" },
  { value: 3, label: "جيد", emoji: "🙂", color: "#3b82f6" },
  { value: 4, label: "ممتاز", emoji: "😊", color: "#10b981" },
  { value: 5, label: "رائع!", emoji: "🔥", color: "#8b5cf6" },
];

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getQuoteOfDay(): string {
  const day = new Date().getDate();
  return motivationalQuotes[day % motivationalQuotes.length];
}

export default function DailyReflection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = getToday();

  const [selectedDate, setSelectedDate] = useState(today);
  const [form, setForm] = useState({
    learned: '', shortcomings: '', wins: '', goals: '', mood: 3,
  });
  const [existingId, setExistingId] = useState<string | null>(null);

  const { data: todayReflection } = useQuery<DailyReflectionType | null>({
    queryKey: ["/api/reflections/date", selectedDate],
    queryFn: async () => {
      const res = await fetch(`/api/reflections/date/${selectedDate}`);
      return res.json();
    },
  });

  const { data: allReflections = [] } = useQuery<DailyReflectionType[]>({
    queryKey: ["/api/reflections"],
  });

  useEffect(() => {
    if (todayReflection) {
      setForm({
        learned: todayReflection.learned || '',
        shortcomings: todayReflection.shortcomings || '',
        wins: todayReflection.wins || '',
        goals: todayReflection.goals || '',
        mood: todayReflection.mood || 3,
      });
      setExistingId(todayReflection.id);
    } else {
      setForm({ learned: '', shortcomings: '', wins: '', goals: '', mood: 3 });
      setExistingId(null);
    }
  }, [todayReflection]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existingId) {
        return apiRequest("PATCH", `/api/reflections/${existingId}`, { ...form, date: selectedDate });
      } else {
        return apiRequest("POST", "/api/reflections", { ...form, date: selectedDate });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reflections/date", selectedDate] });
      toast({ title: "تم الحفظ", description: "تم حفظ مراجعتك اليومية بنجاح" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/reflections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reflections/date", selectedDate] });
      toast({ title: "تم الحذف" });
    },
  });

  const navigateDate = (dir: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + dir);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const streakCount = (() => {
    const dates = allReflections.map(r => r.date).sort().reverse();
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  })();

  const isToday = selectedDate === today;

  return (
    <div className="flex flex-col gap-4">
      <div className="p-5 rounded-xl bg-gradient-to-l from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-reflection-title">ماذا تعلمت اليوم؟</h1>
            <p className="text-white/80 text-sm mt-1">المراجعة اليومية - إطار التحسين المستمر</p>
          </div>
          <div className="flex items-center gap-4">
            {streakCount > 0 && (
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                <Flame className="w-5 h-5 text-yellow-300" />
                <div>
                  <p className="text-lg font-bold">{streakCount}</p>
                  <p className="text-[10px] text-white/70">أيام متتالية</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <div>
                <p className="text-lg font-bold">{allReflections.length}</p>
                <p className="text-[10px] text-white/70">مراجعة مكتملة</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white/10 rounded-lg flex items-start gap-2">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-yellow-300" />
          <p className="text-sm italic">{getQuoteOfDay()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => navigateDate(1)} data-testid="button-next-day">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <p className="font-bold text-sm">{formatDate(selectedDate)}</p>
          {isToday && <Badge variant="secondary" className="text-[10px] mt-1">اليوم</Badge>}
        </div>
        <Button variant="outline" size="icon" onClick={() => navigateDate(-1)} disabled={selectedDate <= (allReflections[allReflections.length - 1]?.date || today)} data-testid="button-prev-day">
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-r-4 border-r-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-green-600" />
                </div>
                ماذا تعلمت اليوم؟
              </CardTitle>
              <CardDescription>اكتب أهم الدروس والمعارف التي اكتسبتها اليوم - سواء من العمل أو من تجربة أو من شخص</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.learned}
                onChange={(e) => setForm(p => ({ ...p, learned: e.target.value }))}
                placeholder="مثال: تعلمت أن أسلوب طرح الأسئلة المفتوحة في Discovery Call يزيد من فهم احتياجات العميل بشكل كبير..."
                className="h-28 resize-none"
                data-testid="input-learned"
              />
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                في ماذا كنت مقصّر اليوم؟
              </CardTitle>
              <CardDescription>كن صادقاً مع نفسك - التقصير ليس فشلاً بل فرصة للتحسن غداً</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.shortcomings}
                onChange={(e) => setForm(p => ({ ...p, shortcomings: e.target.value }))}
                placeholder="مثال: لم أتابع 3 عملاء كان المفترض أتواصل معهم اليوم. السبب: انشغلت بمهام إدارية غير عاجلة..."
                className="h-28 resize-none"
                data-testid="input-shortcomings"
              />
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-purple-600" />
                </div>
                إنجازات اليوم
              </CardTitle>
              <CardDescription>احتفل بنجاحاتك مهما كانت صغيرة - كل خطوة للأمام تستحق التقدير</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.wins}
                onChange={(e) => setForm(p => ({ ...p, wins: e.target.value }))}
                placeholder="مثال: أغلقت صفقة مع أكاديمية جديدة! تحويل عميل من Trial إلى مشترك..."
                className="h-24 resize-none"
                data-testid="input-wins"
              />
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                أهداف الغد
              </CardTitle>
              <CardDescription>حدد 1-3 أهداف واضحة وقابلة للقياس لتبدأ غداً بتركيز</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.goals}
                onChange={(e) => setForm(p => ({ ...p, goals: e.target.value }))}
                placeholder="مثال: 1. متابعة 5 عملاء محتملين 2. إكمال Demo لعميل مركز التميز 3. تحضير عرض لأكاديمية جديدة"
                className="h-24 resize-none"
                data-testid="input-goals"
              />
            </CardContent>
          </Card>

          <div>
            <Label className="mb-2 block text-sm font-semibold">كيف كان يومك بشكل عام؟</Label>
            <div className="flex gap-2">
              {moodOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm(p => ({ ...p, mood: opt.value }))}
                  className={cn(
                    "flex-1 p-3 rounded-lg border-2 text-center transition-all hover:scale-105",
                    form.mood === opt.value ? "shadow-lg" : "opacity-50 hover:opacity-80"
                  )}
                  style={{ borderColor: form.mood === opt.value ? opt.color : 'transparent', background: form.mood === opt.value ? `${opt.color}10` : undefined }}
                  data-testid={`mood-${opt.value}`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: opt.color }}>{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full gap-2"
            size="lg"
            onClick={() => saveMutation.mutate()}
            disabled={!form.learned.trim() || saveMutation.isPending}
            data-testid="button-save-reflection"
          >
            <Save className="w-4 h-4" />
            {existingId ? 'تحديث المراجعة' : 'حفظ مراجعة اليوم'}
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                المراجعات السابقة
              </CardTitle>
            </CardHeader>
            <ScrollArea className="h-[500px]">
              <CardContent className="space-y-3">
                {allReflections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">لا توجد مراجعات بعد</p>
                    <p className="text-xs mt-1">ابدأ اليوم واكتب أول مراجعة لك!</p>
                  </div>
                ) : (
                  allReflections.map((r) => {
                    const mood = moodOptions.find(m => m.value === r.mood);
                    return (
                      <div
                        key={r.id}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                          selectedDate === r.date && "ring-2 ring-primary bg-primary/5"
                        )}
                        onClick={() => setSelectedDate(r.date)}
                        data-testid={`reflection-item-${r.id}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-medium">{formatDate(r.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {mood && <span className="text-sm">{mood.emoji}</span>}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(r.id); }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        {r.learned && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                            <Lightbulb className="w-3 h-3 inline ml-1 text-green-500" />
                            {r.learned}
                          </p>
                        )}
                        {r.wins && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            <Trophy className="w-3 h-3 inline ml-1 text-purple-500" />
                            {r.wins}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </ScrollArea>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-sm">نصيحة اليوم</h4>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>المراجعة اليومية عادة يمارسها أنجح رجال المبيعات في العالم. خذ 10 دقائق في نهاية كل يوم لتسأل نفسك:</p>
                <ul className="space-y-1 pr-4">
                  <li className="flex gap-1"><span className="text-green-500">1.</span> ما الذي نجح اليوم وأريد تكراره؟</li>
                  <li className="flex gap-1"><span className="text-amber-500">2.</span> ما الذي لم ينجح وكيف أتجنبه؟</li>
                  <li className="flex gap-1"><span className="text-blue-500">3.</span> ما هو الشيء الواحد الذي سأحسنه غداً؟</li>
                </ul>
                <p className="mt-2 font-medium text-primary">الثبات على المراجعة اليومية = تحسن 1% يومياً = 37x تحسن سنوياً!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
