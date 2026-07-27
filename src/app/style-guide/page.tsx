import { Button } from "@/components/ui/button";

const colors = [
  { name: "Background 01", hex: "#0F0E11", variable: "--background", textLight: true },
  { name: "Background 02", hex: "#141414", variable: "--card", textLight: true },
  { name: "Dark Green", hex: "#161716", variable: "custom", textLight: true },
  { name: "Green (Accent)", hex: "#55B02E", variable: "--primary", textLight: false },
  { name: "Red (Alert)", hex: "#E93030", variable: "--destructive", textLight: false },
  { name: "Dark Gray", hex: "#1F1F21", variable: "--secondary", textLight: true },
  { name: "Gray", hex: "#71717A", variable: "--muted-foreground", textLight: false },
  { name: "Light Gray", hex: "#B8B8B8", variable: "--secondary-foreground", textLight: false },
  { name: "White", hex: "#FFFFFF", variable: "--foreground", textLight: false },
];

const typography = [
  { label: "Heading 36", size: "2.25rem", weight: 700, className: "text-[2.25rem] font-bold" },
  { label: "Heading 24", size: "1.5rem", weight: 700, className: "text-[1.5rem] font-bold" },
  { label: "Heading 20", size: "1.25rem", weight: 700, className: "text-[1.25rem] font-bold" },
  { label: "Subtitle 18", size: "1.125rem", weight: 700, className: "text-[1.125rem] font-bold" },
  { label: "Body 16", size: "1rem", weight: 400, className: "text-base font-normal" },
  { label: "Body 14 Bold", size: "0.875rem", weight: 700, className: "text-sm font-bold" },
  { label: "Body 14 Regular", size: "0.875rem", weight: 400, className: "text-sm font-normal" },
  { label: "Caption 12 Bold", size: "0.75rem", weight: 700, className: "text-xs font-bold" },
  { label: "Caption 12 Regular", size: "0.75rem", weight: 400, className: "text-xs font-normal" },
];

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-background p-8 md:p-16">
      <div className="mx-auto max-w-4xl space-y-16">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Style Guide</h1>
          <p className="text-muted-foreground text-base">
            Finance IA - Design Tokens de Cores e Tipografia
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-[1.5rem] font-bold">Cores</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map((color) => (
              <div key={color.hex} className="overflow-hidden rounded-lg border border-border">
                <div
                  className="flex h-20 items-end p-3"
                  style={{ backgroundColor: color.hex }}
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: color.textLight ? "#FFFFFF" : "#000000" }}
                  >
                    {color.hex}
                  </span>
                </div>
                <div className="bg-card p-3">
                  <p className="text-card-foreground text-sm font-bold">{color.name}</p>
                  <p className="text-muted-foreground text-xs font-mono">{color.variable}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-[1.5rem] font-bold">Tipografia</h2>
          <div className="space-y-6">
            {typography.map((item) => (
              <div key={item.label} className="border-b border-border pb-4">
                <p className={item.className}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-muted-foreground text-xs font-mono">
                    {item.label}
                  </span>
                  <span className="text-muted-foreground text-xs font-mono">
                    {item.size} / {item.weight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-[1.5rem] font-bold">Componentes shadcn/ui</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>
      </div>
    </div>
  );
}
