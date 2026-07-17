import { StratonSubNav } from "@/components/layout/straton-sub-nav";

export default function StratonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <StratonSubNav />
      {children}
    </div>
  );
}
