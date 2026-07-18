"use client";

import { useMemo } from "react";
import { CalendarDays, Archive, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MONTH_NAMES } from "@/lib/constants";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { generateMonthlyReview, updateMonthlyReview, archiveMonthlyReview } from "@/actions/modules";
import { useRefreshAction } from "@/hooks/use-refresh-action";
import type { MonthlyReview } from "@/lib/types";

export function MonthlyResetPageClient({ reviews }: { reviews: MonthlyReview[] }) {
  const { run, isPending } = useRefreshAction();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const currentReview = useMemo(
    () => reviews.find((r) => r.year === currentYear && r.month === currentMonth && !r.archived),
    [reviews, currentYear, currentMonth]
  );

  const archivedReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.archived)
        .sort((a, b) => b.year - a.year || b.month - a.month),
    [reviews]
  );

  async function handleGenerate() {
    const result = await run(() => generateMonthlyReview(currentYear, currentMonth));
    if (result?.error) { toast.error("Could not generate review"); return; }
    toast.success("Monthly review generated");
  }

  async function handleSaveReflection(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentReview) return;
    const formData = new FormData(e.currentTarget);
    const result = await run(() => updateMonthlyReview(currentReview.id, formData));
    if (result?.error) { toast.error("Could not save"); return; }
    toast.success("Reflection saved");
  }

  async function handleArchive() {
    if (!currentReview) return;
    if (!confirm("Archive this month's review? You can still view it below.")) return;
    const result = await run(() => archiveMonthlyReview(currentReview.id));
    if (result?.error) { toast.error("Could not archive"); return; }
    toast.success("Review archived");
  }

  return (
    <>
      <PageHeader
        title="Monthly Reset"
        description="Review the month, reflect on wins and challenges, and set focus for next month."
        action={
          !currentReview ? (
            <Button onClick={handleGenerate} disabled={isPending} className="rounded-xl gap-2">
              <Sparkles className="h-4 w-4" />
              {isPending ? "Generating…" : "Generate Review"}
            </Button>
          ) : (
            <Button variant="outline" onClick={handleArchive} disabled={isPending} className="rounded-xl gap-2">
              <Archive className="h-4 w-4" /> Archive
            </Button>
          )
        }
      />

      {!currentReview ? (
        <EmptyState
          icon={CalendarDays}
          title={`No review for ${MONTH_NAMES[currentMonth - 1]} ${currentYear}`}
          description="Generate a monthly review to pull in your finances, tasks, projects, and goals — then add your reflections."
          action={
            <Button onClick={handleGenerate} disabled={isPending} className="rounded-xl gap-2">
              <Sparkles className="h-4 w-4" />
              {isPending ? "Generating…" : "Generate Review"}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-success/5">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-xl">
                  {MONTH_NAMES[currentReview.month - 1]} {currentReview.year}
                </CardTitle>
                <Badge variant="outline" className="border-0 bg-primary/10 text-primary">
                  Current month
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatBlock label="Income" value={formatCurrency(currentReview.income_total)} icon={TrendingUp} positive />
                <StatBlock label="Expenses" value={formatCurrency(currentReview.expense_total)} icon={TrendingDown} />
                <StatBlock label="Net" value={formatCurrency(currentReview.net_balance)} highlight />
                <StatBlock
                  label="Tasks done"
                  value={`${currentReview.tasks_completed}`}
                  sub={`${currentReview.overdue_tasks} overdue`}
                />
              </div>

              {currentReview.largest_expense && (
                <p className="text-sm text-muted-foreground mb-4">
                  Largest expense: <span className="font-medium text-foreground">{currentReview.largest_expense}</span>
                  {" "}({formatCurrency(currentReview.largest_expense_amount)})
                </p>
              )}

              {currentReview.goals_progress && (
                <p className="text-sm text-muted-foreground mb-6">
                  Goals: {currentReview.goals_progress}
                </p>
              )}

              <form onSubmit={handleSaveReflection} className="space-y-4 pt-4 border-t border-border/50">
                <input type="hidden" name="year" value={currentReview.year} />
                <input type="hidden" name="month" value={currentReview.month} />
                <div>
                  <Label>Biggest win</Label>
                  <Textarea
                    name="biggest_win"
                    defaultValue={currentReview.biggest_win ?? ""}
                    placeholder="What went well this month?"
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Biggest challenge</Label>
                  <Textarea
                    name="biggest_challenge"
                    defaultValue={currentReview.biggest_challenge ?? ""}
                    placeholder="What was difficult?"
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Next month focus</Label>
                  <Textarea
                    name="next_month_focus"
                    defaultValue={currentReview.next_month_focus ?? ""}
                    placeholder="What will you prioritise?"
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    name="notes"
                    defaultValue={currentReview.notes ?? ""}
                    placeholder="Anything else to capture…"
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <Button type="submit" className="rounded-xl" disabled={isPending}>
                  {isPending ? "Saving…" : "Save Reflection"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {archivedReviews.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Archive ({archivedReviews.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {archivedReviews.map((review) => (
              <Card key={review.id} className="transition-all active:scale-[0.98] touch-manipulation">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-medium">
                      {MONTH_NAMES[review.month - 1]} {review.year}
                    </h3>
                    {review.archived && (
                      <Badge variant="outline" className="border-0 bg-muted text-xs">Archived</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="rounded-lg bg-muted/50 px-2 py-2">
                      <p className="text-sm font-semibold text-emerald-400">{formatCurrency(review.income_total)}</p>
                      <p className="text-[10px] text-muted-foreground">in</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-2 py-2">
                      <p className="text-sm font-semibold text-red-400">{formatCurrency(review.expense_total)}</p>
                      <p className="text-[10px] text-muted-foreground">out</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-2 py-2">
                      <p className="text-sm font-semibold">{formatCurrency(review.net_balance)}</p>
                      <p className="text-[10px] text-muted-foreground">net</p>
                    </div>
                  </div>
                  {review.biggest_win && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium text-foreground">Win:</span> {review.biggest_win}
                    </p>
                  )}
                  {review.next_month_focus && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      <span className="font-medium text-foreground">Focus:</span> {review.next_month_focus}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-3">
                    Updated {formatDate(review.updated_at)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function StatBlock({
  label,
  value,
  sub,
  icon: Icon,
  positive,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
  positive?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border border-border/50 bg-muted/30 px-4 py-3",
      highlight && "border-primary/20 bg-primary/5"
    )}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className={cn("h-3.5 w-3.5", positive ? "text-emerald-400" : "text-red-400")} />}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-xl font-bold", positive && "text-emerald-400", highlight && "text-primary")}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
