import {
  ArrowLeftRight,
  BrainCircuit,
  Landmark,
  LineChart,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

export function ProductArt() {
  return (
    <div className="relative hidden h-full min-h-130 overflow-hidden bg-black md:block">
      <LineChart
        aria-hidden
        className="absolute top-[14%] left-[10%] size-44 text-white/90"
        strokeWidth={1}
      />
      <Sparkles
        aria-hidden
        className="absolute top-[10%] left-[48%] size-10 text-white/35"
        strokeWidth={1}
      />
      <ShieldCheck
        aria-hidden
        className="absolute top-[12%] right-[16%] size-16 text-white/45"
        strokeWidth={1}
      />
      <Landmark
        aria-hidden
        className="absolute top-[36%] right-[18%] size-28 text-white/75"
        strokeWidth={1}
      />
      <ArrowLeftRight
        aria-hidden
        className="absolute top-[46%] left-[38%] size-14 text-white/40"
        strokeWidth={1}
      />
      <Wallet
        aria-hidden
        className="absolute bottom-[20%] left-[8%] size-20 text-white/40"
        strokeWidth={1}
      />
      <BrainCircuit
        aria-hidden
        className="absolute right-[22%] bottom-[14%] size-32 text-white/85"
        strokeWidth={1}
      />
    </div>
  );
}
