import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCheck, Target, ChartNoAxesCombined, Sparkles, Menu, Download, Upload, Plus, Check, Play, Pause, Square, Timer, Clock3, Sun, ChevronLeft, ChevronRight, Pencil, Trash2, Circle, Flag, RotateCcw, X, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STORE_KEY = 'focusday-react-v1';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const dateKey = (date = new Date()) => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dayIndex = (date = new Date()) => (new Date(date).getDay() + 6) % 7;
const isStudy = c => ['Study', 'DSA', 'Web Development', 'Python', 'Revision', 'Interview Prep'].includes(c);
const fmt = ms => { const n = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(n / 3600), m = Math.floor(n % 3600 / 60), s = n % 60; return [h, m, s].map(x => String(x).padStart(2, '0')).join(':'); };
const compact = ms => { const n = Math.floor(Math.max(0, ms) / 60000), h = Math.floor(n / 60), m = n % 60; return h ? `${h}h ${m}m` : `${m}m`; };
const pretty = (d, options = { weekday: 'long', day: 'numeric', month: 'long' }) => new Date(d).toLocaleDateString('en-IN', options);
function defaults(date) {
  return [];
}
function loadStore() { try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s?.tasksByDate) return { tasksByDate: s.tasksByDate, goals: s.goals || [], sessions: s.sessions || [], timer: s.timer || null, target: s.target || 180 }; } catch { } return { tasksByDate: {}, goals: [], sessions: [], timer: null, target: 180 }; }
const categories = ['Study', 'DSA', 'Web Development', 'Python', 'Class', 'Health', 'Personal', 'Revision', 'Interview Prep'];

function IconButton({ children, ...props }) { return <button className="icon-button" {...props}>{children}</button>; }
function Sidebar({ page, setPage, mobile, close }) {
  const links = [['today', 'Today', CalendarDays], ['completed', 'Completed', CheckCheck], ['goals', 'Goals & milestones', Target], ['analytics', 'Analytics', ChartNoAxesCombined]];
  return <><div className={`scrim ${mobile ? 'show' : ''}`} onClick={close} /><aside className={`sidebar ${mobile ? 'open' : ''}`}><div className="brand"><div className="brand-mark"><Sparkles size={20} /></div><div><b>FocusDay</b><small>Make today count</small></div><IconButton className="side-close" onClick={close}><X size={18} /></IconButton></div><div className="nav-label">WORKSPACE</div><nav>{links.map(([id, label, Icon]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); close(); }}><Icon size={18} /><span>{label}</span>{id === 'today' && <i />}</button>)}</nav><div className="sidebar-bottom"><div className="tip"><span><Sparkles size={16} /></span><b>Small steps add up.</b><p>Focus on what you can finish today. Progress follows consistency.</p></div><div className="profile"><div className="avatar">R</div><div><b>My workspace</b><small>Personal planner</small></div></div></div></aside></>;
}
function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:15");
  const [endTime, setEndTime] = useState("10:00");
  const [category, setCategory] = useState("Study");
  const [useTime, setUseTime] = useState(true);

  function formatTime(value) {
    if (!value) return "";

    const [hours, minutes] = value.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour = hours % 12 || 12;

    return `${hour}:${String(minutes).padStart(2, "0")} ${period}`;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) return;

    if (
      useTime &&
      startTime &&
      endTime &&
      endTime <= startTime
    ) {
      alert("End time must be later than start time.");
      return;
    }

    const time =
      useTime && startTime && endTime
        ? `${formatTime(startTime)}–${formatTime(endTime)}`
        : "";

    onAdd({
      title: title.trim(),
      time,
      category,
    });

    setTitle("");
    setStartTime("09:15");
    setEndTime("10:00");
    setCategory("Study");
    setUseTime(true);
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="field full">
        <label>TASK NAME</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Solve 5 DSA questions"
          maxLength={120}
          required
        />
      </div>

      <div className="field full">
        <label>
          <input
            type="checkbox"
            checked={useTime}
            onChange={(e) => setUseTime(e.target.checked)}
          />{" "}
          Set a time slot
        </label>
      </div>

      {useTime && (
        <>
          <div className="field">
            <label>START TIME</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>END TIME</label>
            <input
              type="time"
              value={endTime}
              min={startTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <div className="field full">
        <label>CATEGORY</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <button className="btn primary full" type="submit">
        <Plus size={16} /> Add task
      </button>
    </form>
  );
}
function TaskRow({ task, onToggle, onDelete, onEdit, onStart, active }) {
  return <div className={`task-row ${task.done ? 'done' : ''} ${active ? 'running-task' : ''}`}><button className={`check-box ${task.done ? 'checked' : ''}`} onClick={() => onToggle(task.id)} aria-label="Toggle completion">{task.done && <Check size={14} />}</button><div className="task-copy"><b>{task.title}</b><div className="task-meta">{task.time && <span><Clock3 size={12} /> {task.time}</span>}<em>{task.category}</em></div></div>{isStudy(task.category) && !task.done && <button className={`btn tiny ${active ? 'green-soft' : 'purple-soft'}`} onClick={() => onStart(task)}><Play size={12} fill="currentColor" />{active ? 'Running' : 'Study'}</button>}<div className="row-actions"><IconButton onClick={() => onEdit(task)} title="Edit task"><Pencil size={14} /></IconButton><IconButton onClick={() => onDelete(task.id)} title="Delete task"><Trash2 size={14} /></IconButton></div></div>;
}
function TimerCard({ timer, elapsed, todayMs, weekMs, onStart, onPause, onResume, onStop, target }) {
  const running = timer?.status === 'running', paused = timer?.status === 'paused';
  return <section className="panel timer-card"><div className="panel-head"><div className="head-icon"><Timer size={18} /></div><div className="head-copy"><h2>Focus timer</h2><p>Only active study time is counted.</p></div><span className={`status ${running ? 'running' : paused ? 'paused' : ''}`}><i />{running ? 'Session running' : paused ? 'Session paused' : 'Ready to focus'}</span></div><div className="timer-main"><div><div className="timer-digits">{fmt(elapsed)}</div><div className="timer-sub">{timer ? `Currently studying: ${timer.taskTitle}` : 'Choose a study task to start a session'}</div></div><div className="timer-buttons">{!timer ? <button className="btn primary" onClick={onStart}><Play size={15} fill="currentColor" /> Start studying</button> : <>{running ? <button className="btn primary" onClick={onPause}><Pause size={15} fill="currentColor" /> Pause</button> : <button className="btn primary" onClick={onResume}><Play size={15} fill="currentColor" /> Resume</button>}<button className="btn outline" onClick={onStop}><Square size={13} fill="currentColor" /> Finish session</button></>}</div></div><div className="timer-stats"><div><small>Studied today</small><b>{compact(todayMs)}</b></div><div><small>This week</small><b>{compact(weekMs)}</b></div><div><small>Daily target</small><b>{compact(target * 60000)}</b></div></div></section>;
}
function TodayPage({ date, setDate, tasks, addTask, toggleTask, deleteTask, editTask, timer, elapsed, todayMs, weekMs, startTimer, pauseTimer, resumeTimer, stopTimer, target, setTarget, setPage }) {
  const done = tasks.filter(t => t.done).length, percent = tasks.length ? Math.round(done / tasks.length * 100) : 0, isToday = dateKey(date) === dateKey(new Date()), weekend = dayIndex(date) >= 5;
  const schedule = weekend ? [['07:30–09:15', 'Exercise & morning routine', 'mint'], ['09:15–11:45', 'Deep study session', 'purple'], ['11:45–13:00', 'Lunch & break', 'gray'], ['13:00–15:30', 'Projects & practical work', 'blue'], ['15:30–17:00', 'Rest and personal time', 'gray'], ['17:00–19:30', 'Coding practice', 'orange'], ['19:30–21:30', 'Dinner & relax', 'gray'], ['21:30–23:30', 'Revision and practice', 'purple']] : [['07:30–09:15', 'Exercise & morning routine', 'mint'], ['09:15–11:45', 'Study session 1', 'purple'], ['11:45–13:00', 'Lunch & get ready', 'gray'], ['13:00–17:00', 'Travel and class (2–4 PM)', 'orange'], ['17:00–17:30', 'Rest and snack', 'gray'], ['17:30–19:30', 'Study session 2', 'blue'], ['19:30–21:30', 'Dinner & relax', 'gray'], ['21:30–23:30', 'Study session 3', 'purple']];
  return <div className="stack"><div className="page-title"><div><div className="eyebrow"><Sun size={13} /> YOUR DAILY WORKSPACE</div><h1>{isToday ? 'Make today count' : pretty(date)}<span>.</span></h1><p>Small, focused steps move your bigger goals forward.</p></div><button className="btn primary" onClick={() => document.getElementById('new-task')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Plus size={16} /> Add a task</button></div>
    <div className="date-strip"><div className="date-name"><CalendarDays size={17} /><b>{pretty(date, { month: 'long', year: 'numeric' })}</b></div><div className="date-controls"><IconButton onClick={() => setDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; })}><ChevronLeft size={17} /></IconButton><b>{DAYS[dayIndex(date)].slice(0, 3)} {date.getDate()}</b><IconButton onClick={() => setDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; })}><ChevronRight size={17} /></IconButton><button className="today-chip" onClick={() => setDate(new Date())}>Today</button></div></div>
    <div className="stats-grid"><Stat label="Tasks planned" value={tasks.length} hint="On your schedule" icon={<CalendarDays size={17} />} tone="purple" /><Stat label="Completed" value={`${done} / ${tasks.length}`} hint="Tasks checked off" icon={<CheckCheck size={17} />} tone="green" /><Stat label="Focused time" value={compact(todayMs)} hint="Timer-tracked time" icon={<Clock3 size={17} />} tone="orange" /><Stat label="Daily progress" value={`${percent}%`} hint="Tasks completed" icon={<Target size={17} />} tone="blue" progress={percent} /></div>
    <TimerCard timer={timer} elapsed={elapsed} todayMs={todayMs} weekMs={weekMs} onStart={() => { const task = tasks.find(t => !t.done && isStudy(t.category)); if (task) startTimer(task); else window.alert('Add an unfinished task in a study category first.'); }} onPause={pauseTimer} onResume={resumeTimer} onStop={stopTimer} target={target} />
    <div className="content-grid"><section className="panel"><div className="panel-head"><div className="head-icon"><CheckCheck size={18} /></div><div className="head-copy"><h2>Daily checklist</h2><p>{done} of {tasks.length} tasks completed</p></div><strong className="percent-label">{percent}%</strong></div><div className="progress"><span style={{ width: `${percent}%` }} /></div><div className="task-list">{tasks.length ? tasks.map(t => <TaskRow key={t.id} task={t} onToggle={toggleTask} onDelete={deleteTask} onEdit={editTask} onStart={startTimer} active={timer?.taskId === t.id} />) : <div className="empty"><CheckCheck size={24} /><b>A fresh start</b><p>No tasks planned for this date. Add one below.</p></div>}</div><div id="new-task" className="add-area"><h3><Plus size={15} /> Add a task</h3><TaskForm onAdd={addTask} /></div></section>
      <aside className="right-col"><section className="panel"><div className="panel-head simple"><div><h2>Today's rhythm</h2><p>Your planned routine</p></div><span className="small-pill">{weekend ? 'Weekend' : 'Class day'}</span></div><div className="schedule">{schedule.map(([time, title, color]) => <div className="schedule-row" key={time}><span>{time}</span><i className={`dot ${color}`} /><p>{title}</p></div>)}</div></section><section className="panel target-panel"><div className="panel-head"><div className="head-icon green-icon"><Target size={18} /></div><div className="head-copy"><h2>Daily study target</h2><p>Choose a realistic target</p></div></div><div className="target-select"><b>{compact(target * 60000)}</b><select value={target} onChange={e => setTarget(Number(e.target.value))}><option value="60">1 hour</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="240">4 hours</option><option value="300">5 hours</option><option value="360">6 hours</option><option value="420">7 hours</option><option value="480">8 hours</option><option value="540">9 hours</option><option value="600">10 hours</option></select></div><div className="target-bar"><span style={{ width: `${Math.min(100, todayMs / (target * 60000) * 100)}%` }} /></div><small>{todayMs >= target * 60000 ? 'Daily target reached. Great work!' : `${compact(Math.max(0, target * 60000 - todayMs))} left to reach your target`}</small></section><div className="motivation"><Sparkles size={18} /><b>Consistency beats intensity.</b><p>You don't need a perfect day. Just keep showing up and doing the next useful thing.</p><button onClick={() => setPage('goals')}>Review my goals →</button></div></aside></div></div>;
}
function Stat({ label, value, hint, icon, tone, progress }) { return <div className="stat-card"><div className="stat-label">{label}<span className={`stat-icon ${tone}`}>{icon}</span></div><strong>{value}</strong><small>{hint}</small>{progress !== undefined && <div className="mini-progress"><span style={{ width: `${progress}%` }} /></div>}</div>; }
function CompletedPage({ store, onUndo, exportCompleted }) {
  const groups = Object.entries(store.tasksByDate).map(([date, tasks]) => ({ date, tasks: tasks.filter(t => t.done) })).filter(g => g.tasks.length).sort((a, b) => b.date.localeCompare(a.date)); const total = groups.reduce((n, g) => n + g.tasks.length, 0), milestones = store.goals.flatMap(g => (g.tasks || []).filter(t => t.done).map(t => ({ ...t, goal: g.name }))), minutes = store.sessions.reduce((n, s) => n + s.durationMs, 0);
  return <div className="stack"><div className="page-title"><div><div className="eyebrow"><CheckCheck size={13} /> YOUR PROGRESS HISTORY</div><h1>Look how far you've come<span>.</span></h1><p>A record of the work you've put in, one task at a time.</p></div><button className="btn outline" onClick={exportCompleted}><Download size={15} /> Export history</button></div><div className="stats-grid three"><Stat label="Tasks completed" value={total} hint="Across all recorded days" icon={<CheckCheck size={17} />} tone="green" /><Stat label="Goal milestones" value={milestones.length} hint="Milestones completed" icon={<Target size={17} />} tone="purple" /><Stat label="Tracked study time" value={compact(minutes)} hint="Saved focus sessions" icon={<Clock3 size={17} />} tone="orange" /></div><section className="panel"><div className="panel-head"><div className="head-icon green-icon"><CalendarDays size={18} /></div><div className="head-copy"><h2>Completed daily tasks</h2><p>Grouped by the day they belong to.</p></div></div>{!groups.length ? <div className="empty"><CheckCheck size={24} /><b>Your wins will show up here</b><p>Tick a task on the Today page to record it here.</p></div> : groups.map(g => <div className="history-group" key={g.date}><div className="history-date">{pretty(new Date(g.date + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<span>{g.tasks.length} completed</span></div>{g.tasks.map(t => <div className="history-row" key={t.id}><span className="history-check"><Check size={15} /></span><div><b>{t.title}</b><small>{t.time || 'No time slot'} · {t.category}</small></div><IconButton onClick={() => onUndo(g.date, t.id)} title="Undo completion"><RotateCcw size={14} /></IconButton></div>)}</div>)}</section><section className="panel"><div className="panel-head simple"><div><h2>Completed goal milestones</h2><p>Progress from your two-month goals.</p></div></div>{milestones.length ? milestones.map(t => <div className="history-row" key={t.id}><span className="history-check"><Check size={15} /></span><div><b>{t.title}</b><small>Goal: {t.goal}</small></div></div>) : <div className="empty compact"><b>No milestones completed yet</b><p>Tick a milestone in Goals & milestones to see it here.</p></div>}</section><section className="panel"><div className="panel-head simple"><div><h2>Study session history</h2><p>Time captured by your focus timer.</p></div></div>{store.sessions.length ? [...store.sessions].sort((a, b) => b.startedAt - a.startedAt).map(s => <div className="history-row" key={s.id}><span className="history-check"><Clock3 size={15} /></span><div><b>{s.taskTitle}</b><small>{pretty(new Date(s.startedAt), { day: 'numeric', month: 'short', year: 'numeric' })} · {s.category}</small></div><strong className="session-time">{compact(s.durationMs)}</strong></div>) : <div className="empty compact"><b>No sessions recorded yet</b><p>Start and finish a timer to log a study session.</p></div>}</section></div>;
}
function GoalsPage({ goals, addGoal, toggleGoalTask, deleteGoal, addGoalTask }) {
  const [name, setName] = useState(''), [start, setStart] = useState(dateKey()), [end, setEnd] = useState(dateKey(new Date(Date.now() + 59 * 86400000))), [category, setCategory] = useState('DSA'), [target, setTarget] = useState(10), [lines, setLines] = useState(''), [extra, setExtra] = useState({});
  function submit(e) { e.preventDefault(); if (!name.trim() || !start || !end || end < start) return; addGoal({ name: name.trim(), start, end, category, target: Number(target) || 1, tasks: lines.split('\n').map(x => x.trim()).filter(Boolean).map(title => ({ id: uid(), title, done: false })) }); setName(''); setLines(''); setTarget(10); }
  return <div className="stack"><div className="page-title"><div><div className="eyebrow"><Target size={13} /> YOUR BIGGER PICTURE</div><h1>Goals & milestones<span>.</span></h1><p>Turn your two-month target into smaller, finishable steps.</p></div></div><div className="goal-layout"><section className="panel sticky-panel"><div className="panel-head"><div className="head-icon"><Plus size={18} /></div><div className="head-copy"><h2>Create a goal</h2><p>Choose a period and list what you plan to finish.</p></div></div><form className="goal-form" onSubmit={submit}><div className="field full"><label>GOAL NAME</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Complete DSA hashing" required maxLength={90} /></div><div className="form-two"><div className="field"><label>START DATE</label><input type="date" value={start} onChange={e => setStart(e.target.value)} required /></div><div className="field"><label>DEADLINE</label><input type="date" min={start} value={end} onChange={e => setEnd(e.target.value)} required /></div></div><div className="form-two"><div className="field"><label>FOCUS AREA</label><select value={category} onChange={e => setCategory(e.target.value)}>{['DSA', 'Web Development', 'Python', 'Interview Prep', 'Other'].map(c => <option key={c}>{c}</option>)}</select></div><div className="field"><label>TARGET TASKS</label><input type="number" min="1" max="999" value={target} onChange={e => setTarget(e.target.value)} required /></div></div><div className="field full"><label>TASKS / MILESTONES (ONE PER LINE)</label><textarea rows="5" value={lines} onChange={e => setLines(e.target.value)} placeholder={'Learn hashing fundamentals\nSolve 15 hashing problems\nRevise collision handling\nBuild a mini project'} /></div><button className="btn primary"><Plus size={16} /> Create goal</button></form></section><section className="goal-column"><div className="section-heading"><div><h2>Your goals</h2><p>{goals.length} active goal{goals.length === 1 ? '' : 's'}</p></div></div>{!goals.length ? <div className="panel empty"><Flag size={24} /><b>No goals added yet</b><p>Create a goal with a deadline and tasks you want to complete.</p></div> : goals.map(g => { const tasks = g.tasks || [], done = tasks.filter(t => t.done).length, pct = tasks.length ? Math.round(done / tasks.length * 100) : 0, days = Math.ceil((new Date(g.end + 'T23:59:59') - new Date()) / 86400000); return <article className="panel goal-card" key={g.id}><div className="goal-top"><span className="goal-tag">{g.category}</span><IconButton onClick={() => deleteGoal(g.id)} title="Delete goal"><Trash2 size={14} /></IconButton></div><h3>{g.name}</h3><div className="goal-dates"><CalendarDays size={13} />{g.start} → {g.end}<span className={days < 0 ? 'overdue' : ''}>{days < 0 ? 'Overdue' : days === 0 ? 'Due today' : `${days} days left`}</span></div><div className="goal-progress-label"><span>{done} of {tasks.length} milestones complete</span><b>{pct}%</b></div><div className="goal-progress"><span style={{ width: `${pct}%` }} /></div><div className="milestones">{tasks.length ? tasks.map(t => <button className={`milestone ${t.done ? 'milestone-done' : ''}`} key={t.id} onClick={() => toggleGoalTask(g.id, t.id)}>{t.done ? <span className="milestone-check"><Check size={12} /></span> : <Circle size={15} />}<span>{t.title}</span></button>) : <p className="muted-text">No milestones yet. Add one below.</p>}</div><form className="inline-add" onSubmit={e => { e.preventDefault(); if (extra[g.id]?.trim()) { addGoalTask(g.id, extra[g.id].trim()); setExtra(v => ({ ...v, [g.id]: '' })); } }}><input value={extra[g.id] || ''} onChange={e => setExtra(v => ({ ...v, [g.id]: e.target.value }))} placeholder="Add a milestone…" /><button aria-label="Add milestone"><Plus size={15} /></button></form></article> })}</section></div></div>;
}
function AnalyticsPage({ store, target }) {
  const now = new Date(), monday = new Date(now); monday.setDate(now.getDate() - dayIndex(now)); const data = Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); const key = dateKey(d), ms = store.sessions.filter(s => s.date === key).reduce((n, s) => n + s.durationMs, 0), tasks = store.tasksByDate[key] || []; return { day: d.toLocaleDateString('en-IN', { weekday: 'short' }), hours: Math.round(ms / 360000) / 10, tasks: tasks.filter(t => t.done).length, date: key }; }); const todayKey = dateKey(), weekMs = store.sessions.filter(s => s.date >= dateKey(monday) && s.date <= todayKey).reduce((n, s) => n + s.durationMs, 0), weekTasks = Object.entries(store.tasksByDate).filter(([d]) => d >= dateKey(monday) && d <= todayKey).flatMap(([, t]) => t), done = weekTasks.filter(t => t.done).length, milestones = store.goals.reduce((n, g) => n + (g.tasks || []).filter(t => t.done).length, 0);
  return <div className="stack"><div className="page-title"><div><div className="eyebrow"><ChartNoAxesCombined size={13} /> YOUR CONSISTENCY REPORT</div><h1>Study analytics<span>.</span></h1><p>Use your data to improve the plan, not to judge yourself.</p></div></div><div className="stats-grid"><Stat label="Study time this week" value={compact(weekMs)} hint="Timer-recorded sessions" icon={<Clock3 size={17} />} tone="purple" /><Stat label="Tasks completed" value={done} hint="This week" icon={<CheckCheck size={17} />} tone="green" /><Stat label="Goal milestones" value={milestones} hint="Across all goals" icon={<TrendingUp size={17} />} tone="orange" /><Stat label="Daily study target" value={compact(target * 60000)} hint="Your chosen target" icon={<CalendarDays size={17} />} tone="blue" /></div><section className="panel chart-panel"><div className="panel-head"><div className="head-icon"><ChartNoAxesCombined size={18} /></div><div className="head-copy"><h2>Focused hours this week</h2><p>Only finished timer sessions are included.</p></div><span className="small-pill">Mon – Sun</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef4" /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8790a3', fontSize: 12 }} dy={9} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8790a3', fontSize: 11 }} allowDecimals={false} /><Tooltip formatter={v => [`${v} hours`, 'Focused time']} /><Bar dataKey="hours" fill="#675cf6" radius={[7, 7, 2, 2]} maxBarSize={42} /></BarChart></ResponsiveContainer></div></section><section className="panel chart-panel"><div className="panel-head simple"><div><h2>Daily breakdown</h2><p>Study time and tasks completed each day.</p></div></div><div className="breakdown">{data.map(d => <div className="breakdown-row" key={d.date}><div><b>{d.day}</b><small>{new Date(d.date + 'T12:00:00').getDate()}</small></div><div className="breakdown-track"><span style={{ width: `${Math.min(100, d.hours / Math.max(1, target / 60) * 100)}%` }} /></div><b>{d.hours}h</b><small>{d.tasks} tasks</small></div>)}</div></section><div className="analytics-note"><TrendingUp size={17} /><div><b>Build your baseline first.</b><p>Use the timer consistently for a week before drawing conclusions. Empty days simply mean no tracked sessions have been saved yet.</p></div></div></div>;
}

export default function App() {
  const [store, setStore] = useState(loadStore), [page, setPage] = useState('today'), [selectedDate, setSelectedDate] = useState(new Date()), [mobile, setMobile] = useState(false), [toast, setToast] = useState(''), [now, setNow] = useState(Date.now());
  const date = dateKey(selectedDate), tasks = store.tasksByDate[date] || [], timer = store.timer;
  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }, [store]); useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
 useEffect(() => {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}, [store]);
  const elapsed = useMemo(() => !timer ? 0 : (timer.elapsedMs || 0) + (timer.status === 'running' ? Math.max(0, now - timer.runningSince) : 0), [timer, now]);
  const sessions = store.sessions || []; const recorded = day => sessions.filter(s => s.date === day).reduce((n, s) => n + s.durationMs, 0); const todayKey = dateKey(); const todayMs = recorded(todayKey) + (timer?.date === todayKey ? elapsed : 0); const monday = new Date(); monday.setDate(monday.getDate() - dayIndex(monday)); const weekMs = sessions.filter(s => s.date >= dateKey(monday) && s.date <= todayKey).reduce((n, s) => n + s.durationMs, 0) + (timer && timer.date >= dateKey(monday) && timer.date <= todayKey ? elapsed : 0);
  function notify(msg) { setToast(msg); clearTimeout(window.focusdayToast); window.focusdayToast = setTimeout(() => setToast(''), 2400); }
  function updateTasks(day, fn) { setStore(s => { const old = s.tasksByDate[day] || []; return { ...s, tasksByDate: { ...s.tasksByDate, [day]: typeof fn === 'function' ? fn(old) : fn } }; }); }
  function addTask(data) { updateTasks(date, old => [...old, { id: uid(), ...data, done: false, createdAt: Date.now() }]); notify('Task added.'); }
  function toggleTask(id) { updateTasks(date, old => old.map(t => t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null } : t)); }
  function deleteTask(id) { if (!confirm('Delete this task?')) return; if (timer?.taskId === id) finishTimer(false); updateTasks(date, old => old.filter(t => t.id !== id)); }
  function editTask(t) { const title = prompt('Task name:', t.title); if (title === null || !title.trim()) return; const time = prompt('Time slot (optional):', t.time || ''); if (time === null) return; updateTasks(date, old => old.map(x => x.id === t.id ? { ...x, title: title.trim(), time: time.trim() } : x)); if (timer?.taskId === t.id) setStore(s => ({ ...s, timer: { ...s.timer, taskTitle: title.trim() } })); }
  function startTimer(task) { if (!isStudy(task.category)) return; if (store.timer) { if (store.timer.taskId === task.id && store.timer.status === 'running') return; if (!confirm('Finish the current session and start this task?')) return; finishTimer(false); } setStore(s => ({ ...s, timer: { taskId: task.id, taskTitle: task.title, category: task.category, date, status: 'running', runningSince: Date.now(), elapsedMs: 0, startedAt: Date.now() } })); notify('Study session started.'); }
  function pauseTimer() { if (!store.timer || store.timer.status !== 'running') return; const elapsedMs = (store.timer.elapsedMs || 0) + Math.max(0, Date.now() - store.timer.runningSince); setStore(s => ({ ...s, timer: { ...s.timer, status: 'paused', elapsedMs, runningSince: null } })); notify('Timer paused.'); }
  function resumeTimer() { if (!store.timer || store.timer.status !== 'paused') return; setStore(s => ({ ...s, timer: { ...s.timer, status: 'running', runningSince: Date.now() } })); }
  function finishTimer(show = true) { const t = store.timer; if (!t) return; const durationMs = (t.elapsedMs || 0) + (t.status === 'running' ? Math.max(0, Date.now() - t.runningSince) : 0); setStore(s => ({ ...s, timer: null, sessions: durationMs > 0 ? [...(s.sessions || []), { id: uid(), taskId: t.taskId, taskTitle: t.taskTitle, category: t.category, date: t.date, durationMs, startedAt: t.startedAt || Date.now(), endedAt: Date.now() }] : s.sessions })); if (show) notify(durationMs > 0 ? 'Study session saved.' : 'Empty session discarded.'); }
  function addGoal(g) { setStore(s => ({ ...s, goals: [...s.goals, { id: uid(), ...g, createdAt: Date.now() }] })); notify('Goal created.'); }
  function toggleGoalTask(gid, tid) { setStore(s => ({ ...s, goals: s.goals.map(g => g.id !== gid ? g : { ...g, tasks: g.tasks.map(t => t.id !== tid ? t : { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null }) }) })); }
  function deleteGoal(id) { if (confirm('Delete this goal and its milestones?')) setStore(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) })); }
  function addGoalTask(gid, title) { setStore(s => ({ ...s, goals: s.goals.map(g => g.id !== gid ? g : { ...g, tasks: [...(g.tasks || []), { id: uid(), title, done: false }] }) })); }
  function exportData() { const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `focusday-backup-${todayKey}.json`; a.click(); URL.revokeObjectURL(url); notify('Backup exported.'); }
  function exportCompleted() { const done = Object.entries(store.tasksByDate).flatMap(([date, ts]) => ts.filter(t => t.done).map(t => ({ date, ...t }))); const milestones = store.goals.flatMap(g => (g.tasks || []).filter(t => t.done).map(t => ({ goal: g.name, ...t }))); const blob = new Blob([JSON.stringify({ completedTasks: done, completedMilestones: milestones, sessions: store.sessions }, null, 2)], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'focusday-completed.json'; a.click(); URL.revokeObjectURL(url); }
  function importData(e) { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); if (!d.tasksByDate || !Array.isArray(d.goals)) throw Error(); if (confirm('Restore this backup? Current planner data will be replaced.')) { setStore({ tasksByDate: d.tasksByDate, goals: d.goals || [], sessions: d.sessions || [], timer: d.timer || null, target: d.target || 180 }); notify('Backup restored.'); } } catch { notify('Invalid FocusDay backup file.'); } e.target.value = ''; }; r.readAsText(file); }
  const title = { today: 'Today', completed: 'Completed', goals: 'Goals & milestones', analytics: 'Analytics' };
  return <div className="app-shell"><Sidebar page={page} setPage={setPage} mobile={mobile} close={() => setMobile(false)} /><main className="main-area"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobile(true)}><Menu size={20} /></button><span>Workspace <i>/</i> <b>{title[page]}</b></span></div><div className="top-actions"><small>{pretty(new Date(), { weekday: 'short', day: 'numeric', month: 'short' })}</small><IconButton onClick={exportData} title="Export backup"><Download size={16} /></IconButton><label className="icon-button upload-label" title="Restore backup"><Upload size={16} /><input type="file" accept="application/json,.json" hidden onChange={importData} /></label><div className="avatar">R</div></div></header><div className="page-container">{page === 'today' && <TodayPage date={selectedDate} setDate={setSelectedDate} tasks={tasks} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} editTask={editTask} timer={timer} elapsed={elapsed} todayMs={todayMs} weekMs={weekMs} startTimer={startTimer} pauseTimer={pauseTimer} resumeTimer={resumeTimer} stopTimer={() => finishTimer()} target={store.target || 180} setTarget={target => setStore(s => ({ ...s, target }))} setPage={setPage} />}{page === 'completed' && <CompletedPage store={store} onUndo={(d, id) => updateTasks(d, old => old.map(t => t.id === id ? { ...t, done: false, completedAt: null } : t))} exportCompleted={exportCompleted} />}{page === 'goals' && <GoalsPage goals={store.goals} addGoal={addGoal} toggleGoalTask={toggleGoalTask} deleteGoal={deleteGoal} addGoalTask={addGoalTask} />}{page === 'analytics' && <AnalyticsPage store={store} target={store.target || 180} />}<footer className="footer"><span>FocusDay <i>·</i> Consistency over perfection</span><span>Saved locally in this browser</span></footer></div></main>{toast && <div className="toast"><span>✓</span>{toast}<button onClick={() => setToast('')}><X size={14} /></button></div>}</div>;

}

