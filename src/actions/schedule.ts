"use server";

import { deleteRow, getSql, insertRow, updateRow } from "@/lib/db";
import {
  jobHoursSchema,
  scheduleBlockSchema,
  scheduleEntrySchema,
  scheduleHolidaySchema,
} from "@/lib/validations";
import {
  isDemoMode,
  getAuthUserId,
  revalidateApp,
  withDemoStore,
  newId,
  nowIso,
} from "@/lib/action-utils";
import { emptyToNull } from "@/lib/form-helpers";
import type {
  ScheduleBlock,
  ScheduleDayOfWeek,
  ScheduleEntry,
  ScheduleHoliday,
} from "@/lib/types";

const REVALIDATE = ["/schedule", "/dashboard", "/calendar"] as const;

function parseBool(v: FormDataEntryValue | null, fallback = false) {
  if (v === null || v === undefined || v === "") return fallback;
  return v === "on" || v === "true" || v === "1";
}

function parseOptionalTime(v: FormDataEntryValue | null) {
  const s = emptyToNull(v);
  if (!s) return null;
  return s;
}

function parseBlockForm(formData: FormData) {
  return scheduleBlockSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    day_of_week: formData.get("day_of_week"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    kind: formData.get("kind") || "other",
    active: parseBool(formData.get("active"), true),
  });
}

function parseEntryForm(formData: FormData) {
  const recurring = parseBool(formData.get("recurring"), false);
  const intervalRaw = emptyToNull(formData.get("recurring_interval"));
  return scheduleEntrySchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") || undefined,
    date: formData.get("date"),
    start_time: parseOptionalTime(formData.get("start_time")),
    end_time: parseOptionalTime(formData.get("end_time")),
    kind: formData.get("kind") || "task",
    done: parseBool(formData.get("done"), false),
    recurring,
    recurring_interval: recurring ? intervalRaw : null,
  });
}

function entryPayload(data: {
  title: string;
  notes?: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  kind: ScheduleEntry["kind"];
  done: boolean;
  recurring: boolean;
  recurring_interval?: ScheduleEntry["recurring_interval"];
}) {
  return {
    title: data.title,
    notes: data.notes ?? null,
    date: data.date,
    start_time: data.start_time ?? null,
    end_time: data.end_time ?? null,
    kind: data.kind,
    done: data.recurring ? false : data.done,
    recurring: data.recurring,
    recurring_interval: data.recurring ? (data.recurring_interval ?? null) : null,
  };
}

function parseJobHoursForm(formData: FormData) {
  const daysRaw = formData.getAll("days").map(String).filter(Boolean);
  const days =
    daysRaw.length > 0
      ? daysRaw.join(",")
      : String(formData.get("days") || "");
  return jobHoursSchema.safeParse({
    title: formData.get("title"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    days,
    enabled: parseBool(formData.get("enabled"), false),
  });
}

export async function createScheduleEntry(formData: FormData) {
  const parsed = parseEntryForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const entry: ScheduleEntry = {
        id: newId(),
        user_id: userId,
        ...entryPayload(parsed.data),
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.schedule_entries.unshift(entry);
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    await insertRow("schedule_entries", {
      user_id: userId,
      ...entryPayload(parsed.data),
    });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}

export async function updateScheduleEntry(id: string, formData: FormData) {
  const parsed = parseEntryForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.schedule_entries.findIndex((e) => e.id === id);
      if (i === -1) return;
      store.schedule_entries[i] = {
        ...store.schedule_entries[i],
        ...entryPayload(parsed.data),
        updated_at: nowIso(),
      };
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    await updateRow("schedule_entries", id, userId, entryPayload(parsed.data));
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}

export async function toggleScheduleEntryDone(id: string, done: boolean) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const i = store.schedule_entries.findIndex((e) => e.id === id);
      if (i === -1) return;
      store.schedule_entries[i] = {
        ...store.schedule_entries[i],
        done,
        updated_at: nowIso(),
      };
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    await updateRow("schedule_entries", id, userId, { done });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to update"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}

export async function deleteScheduleEntry(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.schedule_entries = store.schedule_entries.filter((e) => e.id !== id);
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    await deleteRow("schedule_entries", id, userId);
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to delete"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}

export async function createScheduleBlock(formData: FormData) {
  const parsed = parseBlockForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  const payload = {
    title: parsed.data.title,
    notes: parsed.data.notes ?? null,
    day_of_week: parsed.data.day_of_week as ScheduleDayOfWeek,
    start_time: parsed.data.start_time,
    end_time: parsed.data.end_time,
    kind: parsed.data.kind,
    active: parsed.data.active,
  };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      const block: ScheduleBlock = {
        id: newId(),
        user_id: userId,
        ...payload,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.schedule_blocks.push(block);
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    await insertRow("schedule_blocks", { ...payload, user_id: userId });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}

export async function deleteScheduleBlock(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.schedule_blocks = store.schedule_blocks.filter((b) => b.id !== id);
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    await deleteRow("schedule_blocks", id, userId);
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to delete"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}

/** Replace all job-kind blocks with Mon–Fri (or selected days) set hours. */
export async function saveJobHours(formData: FormData) {
  const parsed = parseJobHoursForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  const days = parsed.data.days
    .split(",")
    .map((d) => Number(d.trim()))
    .filter((d) => d >= 1 && d <= 7) as ScheduleDayOfWeek[];

  if (days.length === 0) {
    return { error: { days: ["Pick at least one day"] } };
  }

  const { title, start_time, end_time, enabled } = parsed.data;

  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.schedule_blocks = store.schedule_blocks.filter((b) => b.kind !== "job");
      if (!enabled) return;
      const now = nowIso();
      for (const day of days) {
        store.schedule_blocks.push({
          id: newId(),
          user_id: userId,
          title,
          notes: "Day job — set hours",
          day_of_week: day,
          start_time,
          end_time,
          kind: "job",
          active: true,
          created_at: now,
          updated_at: now,
        });
      }
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    const db = getSql();
    await db`DELETE FROM schedule_blocks WHERE user_id = ${userId} AND kind = 'job'`;
    if (enabled) {
      for (const day of days) {
        await insertRow("schedule_blocks", {
          user_id: userId,
          title,
          notes: "Day job — set hours",
          day_of_week: day,
          start_time,
          end_time,
          kind: "job",
          active: true,
        });
      }
    }
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}

function parseHolidayForm(formData: FormData) {
  return scheduleHolidaySchema.safeParse({
    title: formData.get("title"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    notes: formData.get("notes") || undefined,
  });
}

export async function createScheduleHoliday(formData: FormData) {
  const parsed = parseHolidayForm(formData);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  const payload = {
    title: parsed.data.title,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    notes: parsed.data.notes ?? null,
  };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      if (!store.schedule_holidays) store.schedule_holidays = [];
      const holiday: ScheduleHoliday = {
        id: newId(),
        user_id: userId,
        ...payload,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      store.schedule_holidays.unshift(holiday);
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    await insertRow("schedule_holidays", { ...payload, user_id: userId });
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to save"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}

export async function deleteScheduleHoliday(id: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: { _form: ["Not authenticated"] } };

  if (isDemoMode()) {
    await withDemoStore((store) => {
      store.schedule_holidays = (store.schedule_holidays ?? []).filter((h) => h.id !== id);
    });
    await revalidateApp(...REVALIDATE);
    return { success: true };
  }

  try {
    await deleteRow("schedule_holidays", id, userId);
  } catch (e) {
    return { error: { _form: [e instanceof Error ? e.message : "Failed to delete"] } };
  }

  await revalidateApp(...REVALIDATE);
  return { success: true };
}
