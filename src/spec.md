# Specification

## Summary
**Goal:** Let side-menu quick-add create tasks without requiring a project, default the due date to today, and allow assigning a project later.

**Planned changes:**
- Update backend task creation to allow tasks with no project assigned, while keeping existing permission/ownership checks intact.
- Add/extend a backend API path to assign or move an existing task to a project after it’s created (reusing existing update-task-project behavior where applicable).
- Add a conditional Motoko migration to preserve existing task-to-project assignments during upgrade only if the stored state/schema requires changes.
- Update the side-menu quick-add in `frontend/src/components/TaskDrawer.tsx` to work with zero projects, not auto-pick a default project, and default the due date to today.
- Wire the existing task edit project selector UI to persist project changes via the backend update-task-project API and refresh task data after save.

**User-visible outcome:** Users can quick-add a task from the side menu even with no projects; the task is created unassigned with today’s due date, and they can later assign the task to a project from the task edit UI.
