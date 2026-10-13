# FocusDay — React Study Planner

Responsive planner built with React, Vite, Recharts, and Lucide icons.

## Features
- Daily task planner with class-day/weekend schedule defaults
- Add, edit, complete, and delete tasks
- Study timer with start, pause, resume, and finish
- Session history and focused study-hour totals
- Two-month goals with date ranges and tickable milestones
- Completed-task history
- Weekly study analytics
- Local browser storage, JSON backup export and restore
- Responsive sidebar/navigation

## Run it
1. Install Node.js 18 or newer.
2. Extract this folder and open a terminal inside `focusday-react`.
3. Run `npm install`.
4. Run `npm run dev` and open the URL Vite prints.

## Production build
Run `npm run build`; Vite creates `dist/`.

## Notes
Data is saved in this browser using localStorage. Export a backup before clearing browser data or changing browsers. Timer sessions count elapsed time only while marked running; pause it during breaks. This is a frontend-only version; account login and cloud sync can be added later with a backend.
