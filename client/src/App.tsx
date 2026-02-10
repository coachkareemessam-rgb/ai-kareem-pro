import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@shared/components/ui/toaster";
import { MainLayout } from "@/components/layout/MainLayout";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import RoleSelection from "@/pages/RoleSelection";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Dashboard from "@/pages/Dashboard";
import SOP from "@/pages/SOP";
import Assistant from "@/pages/Assistant";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Deals from "@/pages/Deals";
import CHAMP from "@/pages/CHAMP";
import Tasks from "@/pages/Tasks";
import DailyReflection from "@/pages/DailyReflection";
import ClientQualification from "@/pages/ClientQualification";
import Referrals from "@/pages/Referrals";
import ClientAnalysis from "@/pages/ClientAnalysis";
import CSSOP from "@/pages/CSSOP";
import CSAssistant from "@/pages/CSAssistant";
import CSTools from "@/pages/CSTools";
import CSColorPalette from "@/pages/CSColorPalette";
import NotFound from "@/pages/not-found";

function CSDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-cs-dashboard-title">لوحة تحكم نجاح العملاء</h1>
        <p className="text-muted-foreground">مرحباً بك في واجهة فريق نجاح العملاء</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/cs/sop" data-testid="link-cs-sop-card">
          <div className="p-6 rounded-xl bg-gradient-to-bl from-emerald-50 to-emerald-100 border border-emerald-200 hover:shadow-md transition-shadow text-center cursor-pointer">
            <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <h3 className="font-bold text-emerald-800">عمليات نجاح العملاء</h3>
            <p className="text-xs text-emerald-600 mt-1">7 مراحل من الترحيب للتجديد</p>
          </div>
        </Link>
        <Link href="/cs/assistant" data-testid="link-cs-assistant-card">
          <div className="p-6 rounded-xl bg-gradient-to-bl from-emerald-50 to-teal-100 border border-emerald-200 hover:shadow-md transition-shadow text-center cursor-pointer">
            <div className="w-14 h-14 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="font-bold text-teal-800">مساعد نجاح العملاء</h3>
            <p className="text-xs text-teal-600 mt-1">مساعد ذكي متخصص في CS</p>
          </div>
        </Link>
        <Link href="/cs/tools" data-testid="link-cs-tools-card">
          <div className="p-6 rounded-xl bg-gradient-to-bl from-emerald-50 to-green-100 border border-emerald-200 hover:shadow-md transition-shadow text-center cursor-pointer">
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="font-bold text-green-800">أدوات الفريق</h3>
            <p className="text-xs text-green-600 mt-1">ChatGPT • Canva • Gamma</p>
          </div>
        </Link>
        <Link href="/tasks" data-testid="link-cs-tasks-card">
          <div className="p-6 rounded-xl bg-gradient-to-bl from-emerald-50 to-cyan-100 border border-emerald-200 hover:shadow-md transition-shadow text-center cursor-pointer">
            <div className="w-14 h-14 bg-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 className="font-bold text-cyan-800">إدارة المهام</h3>
            <p className="text-xs text-cyan-600 mt-1">تنظيم ومتابعة المهام اليومية</p>
          </div>
        </Link>
        <Link href="/reflection" data-testid="link-cs-reflection-card">
          <div className="p-6 rounded-xl bg-gradient-to-bl from-emerald-50 to-amber-100 border border-emerald-200 hover:shadow-md transition-shadow text-center cursor-pointer">
            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h3 className="font-bold text-amber-800">مراجعة اليوم</h3>
            <p className="text-xs text-amber-600 mt-1">تأملات وتعلّم يومي</p>
          </div>
        </Link>
        <Link href="/knowledge" data-testid="link-cs-knowledge-card">
          <div className="p-6 rounded-xl bg-gradient-to-bl from-emerald-50 to-indigo-100 border border-emerald-200 hover:shadow-md transition-shadow text-center cursor-pointer">
            <div className="w-14 h-14 bg-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="font-bold text-indigo-800">قاعدة المعرفة</h3>
            <p className="text-xs text-indigo-600 mt-1">مكتبة الملفات والمراجع</p>
          </div>
        </Link>
        <Link href="/cs/colors" data-testid="link-cs-colors-card">
          <div className="p-6 rounded-xl bg-gradient-to-bl from-purple-50 to-violet-100 border border-purple-200 hover:shadow-md transition-shadow text-center cursor-pointer">
            <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            </div>
            <h3 className="font-bold text-purple-800">بالتة الألوان</h3>
            <p className="text-xs text-purple-600 mt-1">اختيار ألوان احترافية للعميل</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function ManagerRouter() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={ManagerDashboard} />
        <Route path="/sop" component={SOP} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/knowledge" component={KnowledgeBase} />
        <Route path="/deals" component={Deals} />
        <Route path="/champ" component={CHAMP} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/reflection" component={DailyReflection} />
        <Route path="/qualification" component={ClientQualification} />
        <Route path="/referrals" component={Referrals} />
        <Route path="/client-analysis" component={ClientAnalysis} />
        <Route path="/cs/sop" component={CSSOP} />
        <Route path="/cs/assistant" component={CSAssistant} />
        <Route path="/cs/tools" component={CSTools} />
        <Route path="/cs/colors" component={CSColorPalette} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function SalesRouter() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/sop" component={SOP} />
        <Route path="/assistant" component={Assistant} />
        <Route path="/knowledge" component={KnowledgeBase} />
        <Route path="/deals" component={Deals} />
        <Route path="/champ" component={CHAMP} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/reflection" component={DailyReflection} />
        <Route path="/qualification" component={ClientQualification} />
        <Route path="/referrals" component={Referrals} />
        <Route path="/client-analysis" component={ClientAnalysis} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function CSRouter() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={CSDashboard} />
        <Route path="/cs/sop" component={CSSOP} />
        <Route path="/cs/assistant" component={CSAssistant} />
        <Route path="/cs/tools" component={CSTools} />
        <Route path="/cs/colors" component={CSColorPalette} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/reflection" component={DailyReflection} />
        <Route path="/knowledge" component={KnowledgeBase} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function AppRouter() {
  const { role } = useRole();

  if (!role) return <RoleSelection />;

  switch (role) {
    case "manager": return <ManagerRouter />;
    case "sales": return <SalesRouter />;
    case "cs": return <CSRouter />;
    default: return <RoleSelection />;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <Toaster />
        <AppRouter />
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
