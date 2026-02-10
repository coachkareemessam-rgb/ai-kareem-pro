import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Palette, Upload, Loader2, Sparkles, X, ImageIcon, Building2, Copy, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const industries = [
  "تعليم عام",
  "تعليم جامعي",
  "تدريب مهني",
  "تطوير ذات",
  "تعليم لغات",
  "تعليم تقني وبرمجة",
  "تعليم طبي وصحي",
  "تعليم ديني",
  "تعليم أطفال",
  "ريادة أعمال",
  "تسويق ومبيعات",
  "محاسبة ومالية",
  "تصميم وفنون",
  "رياضة ولياقة",
  "طبخ وتغذية",
  "أخرى",
];

function extractColorsFromImage(file: File): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const size = 50;
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0, size, size);

      const imageData = ctx?.getImageData(0, 0, size, size);
      if (!imageData) { resolve([]); return; }

      const colorMap: Record<string, number> = {};
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = Math.round(imageData.data[i] / 32) * 32;
        const g = Math.round(imageData.data[i + 1] / 32) * 32;
        const b = Math.round(imageData.data[i + 2] / 32) * 32;
        const a = imageData.data[i + 3];
        if (a < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness < 20 || brightness > 240) continue;
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colorMap[hex] = (colorMap[hex] || 0) + 1;
      }

      const sorted = Object.entries(colorMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([hex]) => hex);

      resolve(sorted);
    };

    img.onerror = () => resolve([]);
    img.src = URL.createObjectURL(file);
  });
}

export default function CSColorPalette() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [clientDescription, setClientDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoColors, setLogoColors] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setIsExtracting(true);

    try {
      const colors = await extractColorsFromImage(file);
      setLogoColors(colors);
    } catch {
      toast({ title: "خطأ", description: "فشل في استخراج الألوان من اللوجو", variant: "destructive" });
    } finally {
      setIsExtracting(false);
    }
  }, [toast]);

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoColors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const generatePalette = async () => {
    if (!clientIndustry) {
      toast({ title: "بيانات ناقصة", description: "يرجى اختيار مجال العميل", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setAiResult('');

    try {
      const response = await fetch('/api/color-palette/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientIndustry,
          clientDescription,
          logoColors: logoColors.length > 0 ? logoColors : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) throw new Error(parsed.error);
                if (parsed.content) {
                  accumulated += parsed.content;
                  setAiResult(accumulated);
                  if (analysisRef.current) {
                    analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
                  }
                }
              } catch (e: any) {
                if (e?.message && e.message !== 'Unexpected end of JSON input') throw e;
              }
            }
          }
        }
      }
    } catch {
      toast({ title: "خطأ", description: "فشل في توليد بالتة الألوان", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const extractedHexFromResult = aiResult.match(/#[0-9A-Fa-f]{6}/g) || [];
  const uniqueResultColors = [...new Set(extractedHexFromResult)].slice(0, 8);

  return (
    <div className="flex flex-col gap-4" data-testid="page-color-palette">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" data-testid="text-color-palette-title">
          <Palette className="w-6 h-6 text-purple-500" />
          مساعد بالتة الألوان
        </h1>
        <p className="text-muted-foreground">اختيار بالتة ألوان احترافية للعميل بناءً على مجاله وهويته البصرية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>اسم العميل</Label>
                <Input
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="اسم العميل أو العلامة التجارية"
                  data-testid="input-palette-client-name"
                />
              </div>

              <div>
                <Label>مجال العميل *</Label>
                <Select value={clientIndustry || 'none'} onValueChange={v => setClientIndustry(v === 'none' ? '' : v)}>
                  <SelectTrigger data-testid="select-palette-industry">
                    <SelectValue placeholder="اختر المجال" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">اختر المجال</SelectItem>
                    {industries.map(ind => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>وصف النشاط</Label>
                <Textarea
                  value={clientDescription}
                  onChange={e => setClientDescription(e.target.value)}
                  placeholder="اكتب وصف عن نشاط العميل، جمهوره المستهدف، والأجواء التي يريد إيصالها..."
                  rows={4}
                  data-testid="textarea-palette-description"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                لوجو العميل
                <Badge variant="outline" className="text-xs mr-auto">اختياري</Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">ارفع لوجو العميل لاستخراج الألوان منه تلقائياً</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                data-testid="input-logo-upload"
              />

              {!logoPreview ? (
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 flex flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="btn-upload-logo"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">اضغط لرفع اللوجو</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, SVG</span>
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="relative bg-muted/30 rounded-xl p-4 flex items-center justify-center">
                    <img src={logoPreview} alt="Logo" className="max-h-24 max-w-full object-contain" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 left-1 h-7 w-7 bg-red-100 hover:bg-red-200 text-red-600"
                      onClick={removeLogo}
                      data-testid="btn-remove-logo"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {isExtracting ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري استخراج الألوان...
                    </div>
                  ) : logoColors.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">ألوان مستخرجة من اللوجو:</p>
                      <div className="flex flex-wrap gap-2">
                        {logoColors.map((color, i) => (
                          <button
                            key={i}
                            className="group relative w-10 h-10 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                            style={{ background: color }}
                            onClick={() => copyColor(color)}
                            title={color}
                            data-testid={`btn-logo-color-${i}`}
                          >
                            {copiedColor === color && (
                              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={generatePalette}
            disabled={isGenerating || !clientIndustry}
            className="w-full bg-gradient-to-l from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white h-12 text-base"
            data-testid="btn-generate-palette"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                جاري التوليد...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 ml-2" />
                توليد بالتة الألوان
              </>
            )}
          </Button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {uniqueResultColors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  الألوان المقترحة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-0 rounded-xl overflow-hidden shadow-lg mb-4" style={{ height: '80px' }}>
                  {uniqueResultColors.map((color, i) => (
                    <button
                      key={i}
                      className="flex-1 relative group hover:flex-[1.5] transition-all duration-300"
                      style={{ background: color }}
                      onClick={() => copyColor(color)}
                      data-testid={`btn-result-color-${i}`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        {copiedColor === color ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Copy className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueResultColors.map((color, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 hover:bg-muted text-xs font-mono transition-colors"
                      onClick={() => copyColor(color)}
                      data-testid={`btn-copy-hex-${i}`}
                    >
                      <div className="w-4 h-4 rounded border" style={{ background: color }} />
                      {color}
                      {copiedColor === color ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(aiResult || isGenerating) ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  تحليل وتوصيات الألوان
                  {isGenerating && <Loader2 className="w-4 h-4 animate-spin text-purple-500 mr-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={analysisRef}
                  className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-sm max-h-[600px] overflow-y-auto"
                  data-testid="div-palette-result"
                >
                  {aiResult || 'جاري التوليد...'}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-16 text-center">
                <Palette className="w-16 h-16 text-purple-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">ابدأ بتوليد بالتة الألوان</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  أدخل معلومات العميل ومجاله، ويمكنك رفع اللوجو لاستخراج الألوان الحالية. ثم اضغط "توليد بالتة الألوان" للحصول على اقتراحات احترافية.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
