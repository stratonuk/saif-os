import { z } from "zod";
import {
  GOAL_TYPES,
  IDEA_CATEGORIES,
  IDEA_STATUSES,
  PAYMENT_METHODS,
  PROJECT_STATUSES,
  REMINDER_TYPES,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
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
