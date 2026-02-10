import { Bell, Search, User, ChevronDown, Crown, Target, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/contexts/RoleContext";

const roleDisplay = {
  manager: { label: "مدير المبيعات", color: "#f59e0b", bgColor: "bg-amber-50", borderColor: "border-amber-100", textColor: "text-amber-700", icon: Crown },
  sales: { label: "فريق المبيعات", color: "#3b82f6", bgColor: "bg-blue-50", borderColor: "border-blue-100", textColor: "text-blue-700", icon: Target },
  cs: { label: "نجاح العملاء", color: "#10b981", bgColor: "bg-emerald-50", borderColor: "border-emerald-100", textColor: "text-emerald-700", icon: HeadphonesIcon },
};

export function Header() {
  const { role, setRole } = useRole();
  const display = role ? roleDisplay[role] : roleDisplay.manager;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm z-10">
      <div className="flex w-1/3 items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="بحث في الصفقات أو المستندات..."
            className="w-full bg-muted/50 pr-9 border-none focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 ${display.bgColor} rounded-full border ${display.borderColor} cursor-pointer hover:shadow-sm transition-shadow`}>
              <display.icon className={`h-3 w-3 ${display.textColor}`} />
              <span className={`text-xs font-medium ${display.textColor}`}>{display.label}</span>
              <ChevronDown className={`h-3 w-3 ${display.textColor} opacity-50`} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">تبديل الدور</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRole("manager")} className="gap-2">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              مدير المبيعات
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRole("sales")} className="gap-2">
              <Target className="h-3.5 w-3.5 text-blue-500" />
              فريق المبيعات
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRole("cs")} className="gap-2">
              <HeadphonesIcon className="h-3.5 w-3.5 text-emerald-500" />
              فريق نجاح العملاء
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600 border-2 border-background"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
              <Avatar className="h-9 w-9 border cursor-pointer">
                <AvatarImage src="/avatars/01.png" alt="@user" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">أ.م</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">أحمد محمد</p>
                <p className="text-xs leading-none text-muted-foreground">
                  ahmed@acadimiat.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem>إعدادات الفريق</DropdownMenuItem>
            <DropdownMenuItem>الاشتراك (Premium)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">تسجيل خروج</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
