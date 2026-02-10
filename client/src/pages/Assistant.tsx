import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles, Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { Conversation, Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Assistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: convList = [] } = useQuery<Conversation[]>({ queryKey: ["/api/conversations"] });
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/conversations", activeConvId, "messages"],
    queryFn: async () => {
      if (!activeConvId) return [];
      const res = await fetch(`/api/conversations/${activeConvId}/messages`);
      return res.json();
    },
    enabled: !!activeConvId,
  });

  const createConvMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/conversations", { title: "محادثة جديدة" });
      return res.json();
    },
    onSuccess: (conv: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConvId(conv.id);
    },
  });

  const deleteConvMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (convList.length > 1) {
        setActiveConvId(convList.find(c => c.id !== activeConvId)?.id || null);
      } else {
        setActiveConvId(null);
      }
    },
  });

  useEffect(() => {
    if (convList.length > 0 && !activeConvId) {
      setActiveConvId(convList[0].id);
    }
  }, [convList, activeConvId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    let convId = activeConvId;
    if (!convId) {
      const res = await apiRequest("POST", "/api/conversations", { title: input.slice(0, 50) });
      const conv = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      convId = conv.id;
      setActiveConvId(conv.id);
    }

    const userContent = input;
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    await refetchMessages();

    try {
      const response = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userContent }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.done) break;
                if (data.content) {
                  accumulated += data.content;
                  setStreamingContent(accumulated);
                }
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء إرسال الرسالة", variant: "destructive" });
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      refetchMessages();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "تم نسخ الرسالة" });
  };

  const allMessages = [
    ...messages,
    ...(isStreaming && streamingContent ? [{ id: 'streaming', role: 'assistant', content: streamingContent, conversationId: activeConvId, createdAt: new Date() } as Message] : []),
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-assistant-title">المساعد الذكي (AI Assistant)</h1>
        <Button variant="outline" className="gap-2" onClick={() => createConvMutation.mutate()} data-testid="button-new-conversation">
          <Plus className="h-4 w-4" />
          <span>محادثة جديدة</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
        <Card className="hidden lg:flex lg:col-span-1 flex-col">
          <CardHeader>
            <CardTitle className="text-lg">محادثات سابقة</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {convList.map(conv => (
                <div key={conv.id} className="flex items-center gap-1" data-testid={`conv-item-${conv.id}`}>
                  <Button
                    variant={activeConvId === conv.id ? "secondary" : "ghost"}
                    className="flex-1 justify-start text-right font-normal h-auto py-3"
                    onClick={() => setActiveConvId(conv.id)}
                    data-testid={`button-conv-${conv.id}`}
                  >
                    <span className="truncate">{conv.title}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteConvMutation.mutate(conv.id)}
                    data-testid={`button-delete-conv-${conv.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {convList.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">لا توجد محادثات سابقة</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3 flex flex-col shadow-md border-primary/20">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-6">
              {allMessages.length === 0 && !isStreaming && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">مرحباً بك في المساعد الذكي</h3>
                  <p className="text-muted-foreground max-w-sm">اسألني عن كيفية الرد على اعتراض معين، أو كتابة رسالة متابعة، أو استشارة في خطوة SOP.</p>
                </div>
              )}

              {allMessages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={cn(
                    "flex gap-4 w-full max-w-3xl group",
                    msg.role === 'user' ? "mr-auto flex-row-reverse" : ""
                  )}
                  data-testid={`message-${msg.role}-${idx}`}
                >
                  <Avatar className={cn("h-10 w-10 border shrink-0", msg.role === 'assistant' ? "bg-primary/10" : "bg-muted")}>
                    <AvatarFallback>{msg.role === 'assistant' ? <Bot className="h-6 w-6 text-primary" /> : <User className="h-6 w-6" />}</AvatarFallback>
                  </Avatar>

                  <div className={cn("flex flex-col gap-2", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={cn(
                      "rounded-2xl p-4 text-sm whitespace-pre-wrap leading-relaxed shadow-sm",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted/50 text-foreground border rounded-tl-none"
                    )}>
                      {msg.content}
                      {msg.id === 'streaming' && <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse mr-1 align-text-bottom" />}
                    </div>

                    {msg.role === 'assistant' && msg.id !== 'streaming' && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => copyToClipboard(msg.content)} data-testid={`button-copy-${idx}`}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isStreaming && !streamingContent && (
                <div className="flex gap-4 w-full max-w-3xl">
                  <Avatar className="h-10 w-10 border bg-primary/10 shrink-0">
                    <AvatarFallback><Bot className="h-6 w-6 text-primary" /></AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl p-4 bg-muted/50 border rounded-tl-none flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="mr-2 text-sm text-muted-foreground">جاري الكتابة...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
            <div className="relative flex items-center">
              <Input
                data-testid="input-chat-message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="اكتب رسالتك هنا... (مثال: ساعدني في الرد على عميل يقول السعر مرتفع)"
                className="pr-4 pl-12 py-6 text-base shadow-sm"
                disabled={isStreaming}
              />
              <Button
                data-testid="button-send-message"
                onClick={handleSend}
                size="icon"
                className="absolute left-2 h-9 w-9 rounded-full transition-transform active:scale-95"
                disabled={isStreaming || !input.trim()}
              >
                <Send className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted whitespace-nowrap" onClick={() => setInput("العميل يطلب خصم إضافي")} data-testid="badge-discount">طلب خصم</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted whitespace-nowrap" onClick={() => setInput("العميل توقف عن الرد")} data-testid="badge-ghosting">العميل اختفى</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted whitespace-nowrap" onClick={() => setInput("مقارنة مع المنافسين")} data-testid="badge-competitors">المنافسين</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted whitespace-nowrap" onClick={() => setInput("كيف أتعامل مع اعتراض السعر غالي؟")} data-testid="badge-price">السعر غالي</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
