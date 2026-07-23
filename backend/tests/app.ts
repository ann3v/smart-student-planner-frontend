import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

import { register, login, verifyCode, getProfile } from '../src/controllers/authController';
import { createTask, getTasks, getTask, updateTask, deleteTask, toggleTaskCompletion, getTodayTasks, getUpcomingTasks } from '../src/controllers/taskController';
import { createSubject, getSubjects, getSubjectWithTasks, updateSubject, deleteSubject } from '../src/controllers/subjectController';
import { createSchedule, getSchedule, getTodaySchedule, getWeeklySchedule, updateSchedule, deleteSchedule } from '../src/controllers/scheduleController';
import { getProductivityAnalytics, getOverdueTasks, getWorkloadDistribution } from '../src/controllers/analyticsController';
import auth from '../src/middleware/auth';
import { validate } from '../src/middleware/validate';
import { registerSchema, loginSchema, verifyCodeSchema } from '../src/schemas/authSchema';
import { createTaskSchema, updateTaskSchema } from '../src/schemas/taskSchema';
import { createSubjectSchema, updateSubjectSchema } from '../src/schemas/subjectSchema';
import { createScheduleSchema, updateScheduleSchema } from '../src/schemas/scheduleSchema';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Auth routes
app.post('/api/auth/register', validate(registerSchema), register);
app.post('/api/auth/login', validate(loginSchema), login);
app.post('/api/auth/verify-code', validate(verifyCodeSchema), verifyCode);
app.get('/api/auth/profile', auth, getProfile);

// Task routes
app.post('/api/tasks', auth, validate(createTaskSchema), createTask);
app.get('/api/tasks', auth, getTasks);
app.get('/api/tasks/today', auth, getTodayTasks);
app.get('/api/tasks/upcoming', auth, getUpcomingTasks);
app.get('/api/tasks/:id', auth, getTask);
app.put('/api/tasks/:id', auth, validate(updateTaskSchema), updateTask);
app.delete('/api/tasks/:id', auth, deleteTask);
app.patch('/api/tasks/:id/toggle', auth, toggleTaskCompletion);

// Subject routes
app.post('/api/subjects', auth, validate(createSubjectSchema), createSubject);
app.get('/api/subjects', auth, getSubjects);
app.get('/api/subjects/:id', auth, getSubjectWithTasks);
app.put('/api/subjects/:id', auth, validate(updateSubjectSchema), updateSubject);
app.delete('/api/subjects/:id', auth, deleteSubject);

// Schedule routes
app.post('/api/schedule', auth, validate(createScheduleSchema), createSchedule);
app.get('/api/schedule', auth, getSchedule);
app.get('/api/schedule/today', auth, getTodaySchedule);
app.get('/api/schedule/weekly', auth, getWeeklySchedule);
app.get('/api/schedule/:id', auth, getSchedule);
app.put('/api/schedule/:id', auth, validate(updateScheduleSchema), updateSchedule);
app.delete('/api/schedule/:id', auth, deleteSchedule);

// Analytics routes
app.get('/api/analytics/productivity', auth, getProductivityAnalytics);
app.get('/api/analytics/overdue', auth, getOverdueTasks);
app.get('/api/analytics/workload', auth, getWorkloadDistribution);

export { app };
