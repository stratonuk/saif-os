import { z } from "zod";
import {
  GOAL_TYPES,
  IDEA_CATEGORIES,
  IDEA_STATUSES,
  NOTE_ENTITY_TYPES,
  PAYMENT_METHODS,
  PROJECT_STATUSES,
  REMINDER_TYPES,
  SCHEDULE_KINDS,
  SCHEDULE_RECURRING_INTERVALS,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  WAITING_STATUSES,
} from "./constants";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  category: z.enum(TASK_CATEGORIES),
  project_id: z.string().optional().nullable(),
});

export const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(REMINDER_TYPES),
  due_date: z.string().min(1, "Due date is required"),
  recurring: z.boolean(),
  recurring_interval: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const transactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  payment_method: z.enum(PAYMENT_METHODS),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(PROJECT_STATUSES),
  revenue: z.coerce.number().min(0),
  expenses: z.coerce.number().min(0),
  progress: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
});

export const ideaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(IDEA_CATEGORIES),
  priority_score: z.coerce.number().min(1).max(10),
  status: z.enum(IDEA_STATUSES),
});

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(GOAL_TYPES),
  current_value: z.coerce.number().min(0),
  target_value: z.coerce.number().positive("Target must be positive"),
  target_date: z.string().optional(),
  unit: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  last_contacted: z.string().optional(),
  next_follow_up: z.string().optional(),
  project_id: z.string().optional().nullable(),
});

export const waitingItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  person: z.string().optional(),
  project_id: z.string().optional().nullable(),
  date_requested: z.string().optional(),
  follow_up_date: z.string().optional(),
  status: z.enum(WAITING_STATUSES),
  notes: z.string().optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  tags: z.string().optional(),
  linked_entity_type: z.enum(NOTE_ENTITY_TYPES).optional().nullable(),
  linked_entity_id: z.string().optional().nullable(),
});

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM format");

export const scheduleBlockSchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  day_of_week: z.coerce.number().int().min(1).max(7),
  start_time: timeString,
  end_time: timeString,
  kind: z.enum(SCHEDULE_KINDS),
  active: z.boolean().default(true),
});

export const scheduleEntrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  kind: z.enum(SCHEDULE_KINDS),
  done: z.boolean().default(false),
  recurring: z.boolean().default(false),
  recurring_interval: z.enum(SCHEDULE_RECURRING_INTERVALS).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.recurring && !data.recurring_interval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pick how often this repeats",
      path: ["recurring_interval"],
    });
  }
});

export const jobHoursSchema = z.object({
  title: z.string().min(1, "Title is required"),
  start_time: timeString,
  end_time: timeString,
  /** Comma-separated ISO weekdays 1–7, e.g. "1,2,3,4,5" */
  days: z.string().min(1, "Pick at least one day"),
  enabled: z.boolean().default(true),
});

export const scheduleHolidaySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.end_date < data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be on or after start date",
        path: ["end_date"],
      });
    }
  });

export const quickTaskSchema = taskSchema.pick({ title: true, priority: true, due_date: true, category: true }).extend({
  status: z.enum(TASK_STATUSES).default("todo"),
});

export const quickReminderSchema = reminderSchema.pick({ title: true, type: true, due_date: true });

export const quickTransactionSchema = transactionSchema.pick({ title: true, amount: true, type: true, category: true, date: true }).extend({
  payment_method: z.enum(PAYMENT_METHODS).default("hsbc"),
});

export const quickIdeaSchema = ideaSchema.pick({ title: true, category: true }).extend({
  priority_score: z.coerce.number().min(1).max(10).default(5),
  status: z.enum(IDEA_STATUSES).default("raw"),
});

export const quickContactSchema = contactSchema.pick({ name: true, company: true, email: true });

export const quickNoteSchema = noteSchema.pick({ title: true, content: true, tags: true });

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
export type ReminderFormValues = z.infer<typeof reminderSchema>;
export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type ProjectFormValues = z.infer<typeof projectSchema>;
export type IdeaFormValues = z.infer<typeof ideaSchema>;
export type GoalFormValues = z.infer<typeof goalSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
export type WaitingItemFormValues = z.infer<typeof waitingItemSchema>;
export type NoteFormValues = z.infer<typeof noteSchema>;
export type ScheduleBlockFormValues = z.infer<typeof scheduleBlockSchema>;
export type ScheduleEntryFormValues = z.infer<typeof scheduleEntrySchema>;
export type JobHoursFormValues = z.infer<typeof jobHoursSchema>;
export type ScheduleHolidayFormValues = z.infer<typeof scheduleHolidaySchema>;
