# Specification

## Summary
**Goal:** Remove the task completion checkbox flicker by making completion toggles reliably optimistic across the entire app.

**Planned changes:**
- Update the task completion toggle mutation to apply an immediate optimistic UI update (checkbox state and completion-dependent styling) wherever tasks can be checked/unchecked.
- Adjust React Query optimistic update behavior to synchronously update all relevant caches before any refetch can briefly reintroduce the old state:
  - All cached task list queries whose keys start with `['tasks', ...]`
  - The single-task cache `['task', taskId]` when present
- Ensure consistent rollback behavior on mutation failure so the UI returns to the prior state and stays consistent after refetch.

**User-visible outcome:** Checking/unchecking a task updates instantly everywhere (no visual reversion/flicker), and if an update fails it cleanly reverts to the correct state.
