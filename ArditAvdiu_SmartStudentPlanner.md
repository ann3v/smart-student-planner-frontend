Project Name:
Smart Student Planner

Target Users:
The target users are university students aged 18–26, primarily students at UMIB and similar universities, with an estimated 2,000–5,000 students per campus.

These students manage multiple courses, assignments, exams, and self-study schedules simultaneously. They need a centralized academic planning system that goes beyond simple task lists by combining planning, scheduling, and progress analysis in one mobile application.

The Problem:
University students face serious challenges in academic time management and workload organization. Assignments, deadlines, exams, and study sessions are typically tracked using fragmented solutions such as paper notes, generic to-do apps, phone reminders, or messaging apps.

Current solutions are inadequate because:

Generic to-do apps lack academic context

Deadlines are not connected to weekly study planning

There is no progress analysis or workload insight

Students cannot evaluate productivity or identify weak areas

As a result, students often miss deadlines, overload certain weeks, and feel overwhelmed without understanding why.

Primary Features 📌 Feature 1: Academic Task Management System
Tasks are organized by subject, priority, and deadlines, with backend validation and user ownership.

User Story: As a student, I want to manage assignments linked to subjects and deadlines so that I can stay organized academically.

📌 Feature 2: Weekly Study Planner

A time-blocking system that allows students to plan classes and self-study sessions within a weekly schedule.

User Story: As a student, I want to plan my study time across the week so that I can balance my workload efficiently.

📌 Feature 3: Academic Progress & Analytics Dashboard

Backend-driven analytics that show productivity trends, task completion rates, and subject workload distribution.

User Story: As a student, I want to see analytics about my academic progress so that I can improve my study habits.

Secondary Features (Nice-to-Have)
Push notifications for upcoming deadlines

Dark mode for accessibility

Offline support with data synchronization

Out of Scope (Not Included)
Real-time collaboration between students

AI-generated personalized study plans

Direct integration with official university systems (LMS)

Technical Architecture 🔐 User Authentication
Method: JWT-based authentication

Security: bcrypt password hashing

Roles:

Student (default user role)

🗄️ Database Schema (Relational – PostgreSQL)

users

id (PK)

email (unique)

passwordHash

createdAt

subjects

id (PK)

userId (FK → users)

name

tasks

id (PK)

userId (FK → users)

subjectId (FK → subjects)

title

description

priority

dueDate

completed

schedule

id (PK)

userId (FK → users)

dayOfWeek

startTime

endTime

activityType

🌐 External API (Azure)

Azure Notification Hubs

Purpose: Push notifications for assignment deadlines

Status: Available via faculty-provided Azure access

Optional future use:

Azure Cognitive Services (Text Analytics) for workload insights

🧰 Key Technologies

Frontend: React Native (Expo), React Navigation

Backend: Node.js, Express.js

Database: PostgreSQL (Azure Database for PostgreSQL)

Hosting: Azure App Service

APIs: Azure Notification Hubs

Libraries: Sequelize ORM, JWT, bcrypt, Axios

User Flow & Screens 🔄 Main User Journey (7 Steps)
User opens the mobile app

Registers or logs in

Lands on dashboard overview

Creates academic tasks

Plans weekly study schedule

Views progress analytics

Receives deadline notifications

📱 Screen Descriptions

Login / Register Screen Secure authentication using JWT-based backend.

Dashboard Screen Overview of today’s tasks, upcoming deadlines, and productivity summary.

Task Management Screen Create, edit, and complete academic assignments linked to subjects.

Weekly Planner Screen Visual time-blocking schedule for classes and study sessions.

Progress Analytics Screen Charts showing weekly productivity and subject workload distribution.

Subjects Screen Manage academic subjects and related tasks.

Settings Screen Profile management, notification preferences, and dark mode.

Challenges & Risks ⚠️ Technical Challenge 1: Backend Analytics Logic
Risk: Complex SQL queries for productivity metrics Mitigation: Use optimized queries and backend aggregation endpoints

⚠️ Technical Challenge 2: Push Notification Timing

Risk: Notifications failing or triggering late Mitigation: Backend scheduling with fallback local notifications

🔁 Backup Plan

If advanced analytics become too complex, the project will focus on:

Task management

Weekly planning

Manual deadline reminders

Ensuring a complete and stable system.

Competitive Analysis
Google Calendar

Strong scheduling

No academic task analytics or progress tracking

Todoist

Excellent task management

Lacks academic structure and study planning

Smart Student Planner differs by combining academic tasks, scheduling, and analytics into a single student-focused system.

Why This Project Matters 🎯 Personal Motivation
As a university student, I face the same organizational challenges and want to build a solution that directly addresses real academic needs.

🌍 Real-World Impact

The app helps students manage workload, reduce stress, and improve academic performance through structured planning and insight.

💼 Career Relevance

This project demonstrates:

Full-stack development skills

REST API design

Secure authentication

Relational database modeling

Cloud deployment on Azure

Making it a strong portfolio project for junior developer and internship opportunities.