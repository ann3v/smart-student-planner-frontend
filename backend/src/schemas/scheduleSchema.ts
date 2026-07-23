import { z } from 'zod';

export const createScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, 'Day of week must be 0-6'),
  startTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'Start time must be HH:MM format'),
  endTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/, 'End time must be HH:MM format'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  activityType: z.enum(['class', 'study', 'break', 'other']).optional(),
  subjectId: z.number().int().positive().optional().nullable(),
  taskId: z.number().int().positive().optional().nullable(),
  isRecurring: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderMinutesBefore: z.number().int().positive().optional(),
});

export const updateScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  startTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
  endTime: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
  title: z.string().min(1).max(200).optional(),
  activityType: z.enum(['class', 'study', 'break', 'other']).optional(),
  subjectId: z.number().int().positive().optional().nullable(),
  taskId: z.number().int().positive().optional().nullable(),
  isRecurring: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderMinutesBefore: z.number().int().positive().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
