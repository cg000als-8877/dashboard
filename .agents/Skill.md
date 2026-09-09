---
name: clean-dashboard-guard
description: Forces clean, non-sloppy UI and strict data visualization color systems for dashboard features.
---

# Dashboard Layout & Color Protocols

When refactoring or generating dashboard layouts, graphs, tables, or charts, you MUST strictly adhere to the following layout constraints:

## 1. The 60-30-10 Color Budget
* **60% Dominant Base:** All page backgrounds must be a flat cool slate, off-white, or dark navy neutral layer. Card wrappers must use a flat solid white or dark elevated gray.
* **30% Secondary Structure:** Use ONE primary brand color (e.g., Deep Cobalt Blue) for active states, focal navigation bars, and primary data charts.
* **10% Intent Accent:** Bright colors (Red, Emerald Green, Amber) are strictly banned for decoration. They are reserved exclusively for active data signals (e.g., system alert, budget exceeded, growth state).

## 2. Anti-Sloppiness Layout Constraints
* **Grid Bounds:** Wrap all visual dashboard components inside a strict 8px boundary grid (e.g., padding/margins must be multiples of 8px).
* **Graph Refactoring:** Never generate multi-colored stacked charts using random color loops. If multiple data lines exist, use descending opacity shades of the single primary brand color instead of completely different colors.
* **Visual Anchors:** Ensure clean visual hierarchy by keeping typography sizes to a tight 3-step scale (Title, Subtitle, Body). Eliminate background gradients inside chart data wrappers.
