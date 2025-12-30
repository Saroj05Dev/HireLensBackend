# GEMINI.md — HireLens Backend Context

This file defines the **architectural rules, conventions, and technical decisions**
for the **HireLens** backend project.

Any AI assistant (Gemini, Copilot, etc.) must strictly follow these rules
when generating, modifying, or reasoning about code in this repository.

---

## 🧠 Project Overview

**HireLens** is a multi-tenant Applicant Tracking System (ATS) with:

- Role-based access control (ADMIN, RECRUITER, INTERVIEWER)
- Organization-level data isolation
- Event-driven audit logging (DecisionLogs)
- Real-time updates using Socket.IO
- Analytics derived from immutable event logs

The backend is built with **Node.js, Express, MongoDB, and Mongoose**.

---

## 🏗️ Backend Architecture (STRICT)

This project follows a **layered architecture**:

index.js
└── routes/
└── controllers/
└── services/
└── repositories/
└── models (schemas)


### ❗ Architectural Rules (DO NOT BREAK)

- ❌ Controllers must NEVER access the database directly
- ❌ Routes must NEVER contain business logic
- ❌ Repositories must NEVER contain business rules
- ❌ Models must NEVER contain application logic
- ✅ Services contain all business logic
- ✅ Repositories only talk to MongoDB via Mongoose
- ✅ Controllers orchestrate request/response only

---

## 📦 Layer Responsibilities

### `index.js`
- App bootstrap only
- Express app setup
- Global middleware
- Route registration
- Database connection
- Socket.IO initialization

---

### `routes/`
- Define HTTP routes only
- Attach middlewares (auth, role)
- Map routes → controllers
- No logic, no DB access

---

### `controllers/`
- Extract request data
- Call service methods
- Handle success/error responses
- No database calls
- No business logic

---

### `services/`
- Core business logic lives here
- Validations
- Authorization checks
- Orchestration of repositories
- Creation of DecisionLogs
- Emission of real-time events

This is the **most important layer**.

---

### `repositories/`
- Thin data-access layer
- Direct interaction with Mongoose models
- No business rules
- No socket logic
- No authorization logic

---

### `models/`
- Mongoose schemas only
- Field validation
- Enums and indexes
- No logic, no services

---

## 📚 Database Design Philosophy

- MongoDB + Mongoose
- Multi-tenant design via `organizationId`
- Every major entity is scoped to an organization
- No cross-organization access is allowed

### Core Models
- User
- Organization
- Candidate
- Job
- Interview
- InterviewFeedback
- DecisionLog

---

## 🧾 DecisionLog System (VERY IMPORTANT)

DecisionLogs are the **single source of truth** for:

- Candidate stage changes
- Interview assignments
- Feedback submissions
- Future hiring decisions

### DecisionLog Rules

- DecisionLogs are **append-only**
- NEVER updated or deleted
- Used for:
  - Decision timeline API
  - Analytics
  - Real-time activity feed
  - Auditing

### Action Types (enum)
- STAGE_CHANGE
- INTERVIEW_ASSIGNED
- FEEDBACK_SUBMITTED
- (future: OFFER_EXTENDED, HIRED, REJECTED)

---

## 📡 Real-Time Architecture (Socket.IO)

- Socket.IO is used for **side effects only**
- REST APIs are the source of truth
- Real-time events are emitted **after DB writes**

### Socket Rules

- Socket events are emitted ONLY from services
- Repositories never emit socket events
- Controllers never emit socket events

### Socket Rooms
- `org:{organizationId}` → org-wide updates
- `user:{userId}` → personal notifications

### Core Events
- `interview:assigned`
- `feedback:submitted`
- `decision:created` (generic activity feed)

---

## 🔐 Authentication & Authorization

### Authentication
- JWT-based
- Access Token (short-lived)
- Refresh Token (httpOnly cookie)
- Silent login supported

### Authorization
- Role-based middleware
- Organization-level isolation
- Roles:
  - ADMIN
  - RECRUITER
  - INTERVIEWER

---

## 📑 API Contract-First Development

This project strictly follows **API Contracts**.

### Rules
- Service input DTOs must match API contracts
- Schemas evolve when contracts evolve
- No ad-hoc fields (e.g., `comment` when contract says `strengths/weaknesses`)

### Example
Interview Feedback must accept:
```json
{
  "rating": 4,
  "strengths": "...",
  "weaknesses": "...",
  "recommendation": "PROCEED"
}

📊 Analytics Philosophy

Analytics are derived ONLY from DecisionLogs

No analytics from mutable Candidate state

Event-driven analytics (time-in-stage, funnels, pipeline summary)

🧩 Coding Conventions
Module System

ES Modules only

Always use:
import ... from "...";
export const ...
❌ No CommonJS (require, module.exports)

Error Handling

Use ApiError consistently

Services throw errors

Controllers handle responses

Naming Conventions

camelCase for variables/functions

PascalCase for models

Uppercase for enums and roles

🚫 What NOT to Do

❌ No fat controllers

❌ No logic in routes

❌ No DB access outside repositories

❌ No socket emits before DB writes

❌ No cross-org data access