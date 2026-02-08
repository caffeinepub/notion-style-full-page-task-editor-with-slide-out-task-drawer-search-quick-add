# Specification

## Summary
**Goal:** Fix the CSS/theme regression so the dark theme renders correctly across the app, and ensure the Task Drawer and full-page Task Page are fully visible, readable, and usable.

**Planned changes:**
- Apply/restore dark theme CSS variables globally so backgrounds, panels, borders, and text colors render correctly across all authenticated sections (including Calendar, Projects, Overview, History, Task Drawer, and Task Page) without editing any immutable hook files.
- Fix Task Drawer (left sheet) styling to ensure a solid non-transparent panel with correct background/foreground, readable inputs/buttons/list items, proper hover/focus states, and correct layering (z-index) so it is not hidden or unclickable.
- Fix full-page Task Page styling to ensure a solid readable layout (top bar + content area), with visible and usable title/metadata controls and a properly styled Quill editor (toolbar + editor canvas) with correct scrolling and no clipping.

**User-visible outcome:** When signed in, the app consistently displays the intended dark theme with readable contrast; the Task Drawer opens as a solid, interactive panel; and the full-page Task editor route shows a fully visible, usable editor (including the rich text area) without transparency or layering issues.
