# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Project Management System (Dev-ready)

------------------------------------------------------------------------

# 1. Overview

## 1.1 Purpose

Hệ thống quản lý dự án nội bộ giúp: - Quản lý workspace theo phòng ban -
Quản lý project, task - Theo dõi tiến độ - Phân quyền người dùng

## 1.2 Scope

### Bao gồm:

-   Workspace
-   Project
-   Milestone
-   Task
-   User & Role
-   Dashboard
-   Comment

### Không bao gồm:

-   Tài chính
-   Tích hợp bên ngoài

------------------------------------------------------------------------

# 2. Architecture

Client (Web) → API Server (NestJS) → Database (PostgreSQL/MySQL)

------------------------------------------------------------------------

# 3. Roles

  Role          Permissions
  ------------- ----------------
  Admin         Full system
  Manager       Manage project
  Lead          Assign task
  User          Update task
  Stakeholder   View only

------------------------------------------------------------------------

# 4. Flow

Admin → Workspace → Manager → Project → Lead → Task → User → Update →
Dashboard

------------------------------------------------------------------------

# 5. Functional Requirements

## YC1: Workspace

### Create Workspace

POST /api/workspaces

Request: { "name": "Marketing", "description": "Team Marketing" }

Response: { "id": 1, "name": "Marketing" }

DB: CREATE TABLE workspaces ( id INT PRIMARY KEY AUTO_INCREMENT, name
VARCHAR(255) UNIQUE, description TEXT );

------------------------------------------------------------------------

### Add User

POST /api/workspaces/{id}/users

Request: { "userId": 1 }

DB: CREATE TABLE workspace_users ( workspace_id INT, user_id INT );

------------------------------------------------------------------------

## YC2: Project

POST /api/projects

Request: { "name": "Website", "startDate": "2026-04-01", "deadline":
"2026-05-01", "workspaceId": 1 }

DB: CREATE TABLE projects ( id INT PRIMARY KEY AUTO_INCREMENT, name
VARCHAR(255), start_date DATE, deadline DATE, workspace_id INT );

------------------------------------------------------------------------

## YC3: Task

POST /api/tasks

Request: { "name": "Build UI", "deadline": "2026-04-25", "priority":
"high", "projectId": 1 }

DB: CREATE TABLE tasks ( id INT PRIMARY KEY AUTO_INCREMENT, name
VARCHAR(255), deadline DATE, priority VARCHAR(50), status VARCHAR(50),
project_id INT );

------------------------------------------------------------------------

PUT /api/tasks/{id}/assign

Request: { "userId": 2 }

------------------------------------------------------------------------

## YC4: Task Progress

PUT /api/tasks/{id}

Request: { "status": "in_progress" }

------------------------------------------------------------------------

## YC5: Dashboard

GET /api/dashboard

Response: { "progress": 70, "tasks": { "todo": 5, "in_progress": 3,
"done": 10 } }

------------------------------------------------------------------------

## YC6: Comment

POST /api/tasks/{id}/comments

Request: { "content": "Done" }

DB: CREATE TABLE comments ( id INT PRIMARY KEY AUTO_INCREMENT, task_id
INT, user_id INT, content TEXT );

------------------------------------------------------------------------

# 6. Non-functional

## Security

-   JWT
-   Role-based
-   Password hashing

## Performance

-   \<3s response
-   500 users

## Usability

-   Simple UI
-   Responsive
