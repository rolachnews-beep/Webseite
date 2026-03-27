---
type: task
id: "TASK-006"
title: "Fix login redirect loop"
status: "done"
priority: "urgent"
project: "Backend API v2"
assignee: "Marcus Rivera"
labels: ["bug", "backend"]
estimate: "XS"
due_date: "2026-03-20"
start_date: "2026-03-19"
cycle: "Sprint 26-06"
parent: ""
blocked_by: []
blocking: []
created: "2026-03-19"
updated: "2026-03-20"
---

Fix the infinite redirect loop occurring when users with expired sessions try to access protected routes.
