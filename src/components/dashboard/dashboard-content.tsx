"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { DailyBriefingSection } from "@/components/dashboard/daily-briefing";
import { DashboardWidgets, DashboardStats } from "@/components/dashboard/dashboard-widgets";
import { useCommandPalette } from "@/components/command-palette/command-palette-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { DailyBriefing } from "@/lib/briefing-utils";
import type { Goal, Project, Reminder, Subscription, Task, WaitingItem } from "@/lib/types";

interface DashboardContentProps {
  briefing: DailyBriefing;
  tasks: Task[];
  reminders: Reminder[];
  projects: Project[];
  goals: Goal[];
  waitingItems: WaitingItem[];
  subscriptions: Subscription[];
  weekTaskCount: number;
}

export function DashboardContent({
  briefing, tasks, reminders, projects, goals, waitingItems, subscriptions, weekTaskCount,
}: DashboardContentProps) {
  const { openCapture } = useCommandPalette();
  const [showAmounts, setShowAmounts] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Today"
        description="Your daily briefing — priorities, money, and momentum."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl gap-2"
            onClick={() => setShowAmounts((v) => !v)}
            aria-pressed={showAmounts}
            aria-label={showAmounts ? "Hide financial figures" : "Show financial figures"}
          >
            {showAmounts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAmounts ? "Hide £" : "Show £"}
          </Button>
        }
      />
      <DailyBriefingSection
        briefing={briefing}
        showAmounts={showAmounts}
        onQuickCapture={() => openCapture()}
      />
      <DashboardStats briefing={briefing} weekTaskCount={weekTaskCount} showAmounts={showAmounts} />
      <DashboardWidgets
        briefing={briefing} tasks={tasks} reminders={reminders}
        projects={projects} goals={goals} waitingItems={waitingItems} subscriptions={subscriptions}
        showAmounts={showAmounts}
      />
    </div>
  );
}
