import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";
import {
  LayoutDashboard,
  GitGraph,
  MessageSquare,
  Files,
  Settings,
  LogOut,
  Target,
  ClipboardCheck,
  ListTodo,
  BookOpen,
  UserCheck,
  Users,
  SearchCheck,
  HeadphonesIcon,
  Bot,
  Workflow,
  Wrench,
  Crown,
  BarChart3,
  ArrowRightLeft,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const managerItems = [
  { icon: Crown, label: "لوحة تحكم المدير", href: "/" },
  { icon: GitGraph, label: "محرك العمليات (SOP)", href: "/sop" },
  { icon: MessageSquare, label: "المساعد الذكي", href: "/assistant" },
  { icon: Target, label: "تتبع الصفقات", href: "/deals" },
  { icon: ClipboardCheck, label: "إطار CHAMP", href: "/champ" },
  { icon: UserCheck, label: "تأهيل العملاء", href: "/qualification" },
  { icon: Users, label: "نظام الترشيحات", href: "/referrals" },
  { icon: SearchCheck, label: "تحليل احتياجات العميل", href: "/client-analysis" },
  { icon: ListTodo, label: "إدارة المهام", href: "/tasks" },
  { icon: BookOpen, label: "مراجعة اليوم", href: "/reflection" },
  { icon: Files, label: "قاعدة المعرفة", href: "/knowledge" },
];

const managerCSItems = [
  { icon: Workflow, label: "عمليات نجاح العملاء", href: "/cs/sop" },
  { icon: Bot, label: "مساعد نجاح العملاء", href: "/cs/assistant" },
  { icon: Wrench, label: "أدوات الفريق", href: "/cs/tools" },
  { icon: Palette, label: "بالتة الألوان", href: "/cs/colors" },
];

const salesItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/" },
  { icon: GitGraph, label: "محرك العمليات (SOP)", href: "/sop" },
  { icon: MessageSquare, label: "المساعد الذكي", href: "/assistant" },
  { icon: Target, label: "تتبع الصفقات", href: "/deals" },
  { icon: ClipboardCheck, label: "إطار CHAMP", href: "/champ" },
  { icon: UserCheck, label: "تأهيل العملاء", href: "/qualification" },
  { icon: Users, label: "نظام الترشيحات", href: "/referrals" },
  { icon: SearchCheck, label: "تحليل احتياجات العميل", href: "/client-analysis" },
  { icon: ListTodo, label: "إدارة المهام", href: "/tasks" },
  { icon: BookOpen, label: "مراجعة اليوم", href: "/reflection" },
  { icon: Files, label: "قاعدة المعرفة", href: "/knowledge" },
];

const csItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/" },
  { icon: Workflow, label: "عمليات نجاح العملاء", href: "/cs/sop" },
  { icon: Bot, label: "مساعد نجاح العملاء", href: "/cs/assistant" },
  { icon: Wrench, label: "أدوات الفريق", href: "/cs/tools" },
  { icon: Palette, label: "بالتة الألوان", href: "/cs/colors" },
  { icon: ListTodo, label: "إدارة المهام", href: "/tasks" },
  { icon: BookOpen, label: "مراجعة اليوم", href: "/reflection" },
  { icon: Files, label: "قاعدة المعرفة", href: "/knowledge" },
];

const roleConfig = {
  manager: { label: "مدير المبيعات", color: "#f59e0b", icon: Crown },
  sales: { label: "فريق المبيعات", color: "#3b82f6", icon: Target },
  cs: { label: "فريق نجاح العملاء", color: "#10b981", icon: HeadphonesIcon },
};

export function Sidebar() {
  const [location] = useLocation();
  const { role, clearRole } = useRole();

  const config = role ? roleConfig[role] : roleConfig.manager;

  const renderNavItem = (item: typeof salesItems[0], index: number) => {
    const isActive = location === item.href;
    return (
      <Link key={index} href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col border-l bg-sidebar text-sidebar-foreground">
      <div className="flex flex-col items-center gap-3 border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <img src="/images/kareem-logo.png" alt="Kareem Essam" className="h-10 object-contain" />
          <div className="w-px h-8 bg-border" />
          <img src="/images/acadimiat-logo.png" alt="Acadimiat" className="h-10 object-contain" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ borderColor: `${config.color}40`, background: `${config.color}08` }}>
          <config.icon className="h-3 w-3" style={{ color: config.color }} />
          <span className="text-xs font-bold" style={{ color: config.color }}>{config.label}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-3">
        {role === "manager" && (
          <>
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold text-amber-600/80 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="h-3 w-3" />
                إدارة المبيعات
              </span>
            </div>
            <nav className="grid gap-0.5 px-2">
              {managerItems.map((item, index) => renderNavItem(item, index))}
            </nav>

            <div className="mx-3 my-3 border-t" />

            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-wider flex items-center gap-1.5">
                <HeadphonesIcon className="h-3 w-3" />
                نجاح العملاء
              </span>
            </div>
            <nav className="grid gap-0.5 px-2">
              {managerCSItems.map((item, index) => renderNavItem(item, index + managerItems.length))}
            </nav>
          </>
        )}

        {role === "sales" && (
          <>
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold text-blue-600/80 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3 w-3" />
                فريق المبيعات
              </span>
            </div>
            <nav className="grid gap-0.5 px-2">
              {salesItems.map((item, index) => renderNavItem(item, index))}
            </nav>
          </>
        )}

        {role === "cs" && (
          <>
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold text-emerald-600/80 uppercase tracking-wider flex items-center gap-1.5">
                <HeadphonesIcon className="h-3 w-3" />
                فريق نجاح العملاء
              </span>
            </div>
            <nav className="grid gap-0.5 px-2">
              {csItems.map((item, index) => renderNavItem(item, index))}
            </nav>
          </>
        )}
      </div>

      <div className="mt-auto border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={clearRole}
          data-testid="button-switch-role"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>تبديل الدور</span>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" data-testid="button-settings">
          <Settings className="h-4 w-4" />
          <span>الإعدادات</span>
        </Button>
      </div>
    </div>
  );
}
