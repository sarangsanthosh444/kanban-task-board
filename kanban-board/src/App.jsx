import { useState, useEffect, useRef } from "react";

const COLUMNS = [
  { id: "todo", label: "Todo", color: "#4A3267" },
  { id: "inprogress", label: "In Progress", color: "#DE638A" },
  { id: "done", label: "Done", color: "#F7B9C4" },
];

const PRIORITY_COLORS = {
  red: { bg: "#ef4444", label: "High" },
  yellow: { bg: "#facc15", label: "Medium" },
  green: { bg: "#22c55e", label: "Low" },
};

function TaskCard({ task, onEdit, onDelete, onPriority, onDragStart }) {
  const [showPriority, setShowPriority] = useState(false);

  const accentColor =
    task.priority && PRIORITY_COLORS[task.priority]
      ? PRIORITY_COLORS[task.priority].bg
      : "transparent";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => setShowPriority((p) => !p)}
      style={{
        background: "rgb(253,241,241)",
        borderRadius: 12,
        padding: "12px 14px",
        marginTop: 12,
        cursor: "grab",
        transition: "transform 0.18s, box-shadow 0.18s",
        borderLeft: `5px solid ${accentColor}`,
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
        {task.title}
      </div>
      {task.desc && (
        <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>
          {task.desc}
        </div>
      )}

      <div
        style={{ display: "flex", gap: 6, marginTop: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => onEdit(task)} style={btnStyle("#ddd", "#333")}>
          ✏️ Edit
        </button>
        <button onClick={() => onDelete(task.id)} style={btnStyle("#fdd", "#c00")}>
          🗑 Delete
        </button>
      </div>

      {showPriority && (
        <div
          style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(PRIORITY_COLORS).map(([key, val]) => (
            <div
              key={key}
              title={val.label}
              onClick={() => {
                onPriority(task.id, key);
                setShowPriority(false);
              }}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: val.bg,
                cursor: "pointer",
                border: task.priority === key ? "2px solid #333" : "2px solid transparent",
                transition: "transform 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.35)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          ))}
          <span style={{ fontSize: 11, color: "#999" }}>set priority</span>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    border: "none",
    background: bg,
    color,
    padding: "4px 8px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  };
}

function Column({ col, tasks, dark, onEdit, onDelete, onPriority, onDrop }) {
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { setOver(false); onDrop(e, col.id); }}
      style={{
        flex: "1 1 0",
        minWidth: 0,
        minHeight: "calc(100vh - 160px)",
        background: dark ? "#3a3a3a" : "#f8eaf1",
        borderRadius: 20,
        padding: 20,
        boxShadow: over ? "0 12px 32px rgba(0,0,0,0.22)" : "0 8px 20px rgba(0,0,0,0.1)",
        borderTop: `12px solid ${col.color}`,
        transform: over ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s ease",
        outline: over ? `2px dashed ${col.color}` : "none",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: 20, color: dark ? "#fff" : "#222", display: "flex", alignItems: "center", gap: 8 }}>
        {col.label}
        <span
          style={{
            background: col.color,
            color: "#fff",
            borderRadius: "50%",
            width: 22,
            height: 22,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {tasks.length}
        </span>
      </h2>

      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onPriority={onPriority}
          onDragStart={(e) => e.dataTransfer.setData("taskId", String(task.id))}
        />
      ))}
    </div>
  );
}

function Modal({ visible, onClose, onSave, editTask }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (visible) {
      setTitle(editTask?.title || "");
      setDesc(editTask?.desc || "");
    }
  }, [visible, editTask]);

  if (!visible) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          width: 340,
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          animation: "popIn 0.2s ease",
        }}
      >
        <h3 style={{ margin: "0 0 16px", color: "#4A3267", fontSize: 20 }}>
          {editTask ? "✏️ Edit Task" : "➕ New Task"}
        </h3>

        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          onKeyDown={(e) => e.key === "Enter" && title.trim() && onSave(title.trim(), desc.trim())}
          style={inputStyle}
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", marginTop: 10 }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            onClick={() => { if (title.trim()) onSave(title.trim(), desc.trim()); }}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "#4A3267",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {editTask ? "Save Changes" : "Add Task"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              background: "#eee",
              color: "#555",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{transform:scale(0.85);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid #ddd",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const filtered = (colId) =>
    tasks.filter(
      (t) =>
        t.status === colId &&
        t.title.toLowerCase().includes(search.toLowerCase())
    );

  const handleDrop = (e, colId) => {
    const id = Number(e.dataTransfer.getData("taskId"));
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: colId } : t))
    );
  };

  const handleSave = (title, desc) => {
    if (editTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editTask.id ? { ...t, title, desc } : t))
      );
    } else {
      setTasks((prev) => [
        ...prev,
        { id: Date.now(), title, desc, status: "todo", priority: null },
      ]);
    }
    setModalOpen(false);
    setEditTask(null);
  };

  const handleDelete = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const handlePriority = (id, priority) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, priority } : t))
    );

  const openEdit = (task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; height: 100%; }
      `}</style>
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: dark ? "#2e2e2e" : "#fff5fc",
          color: dark ? "#fff" : "#222",
          transition: "background 0.3s, color 0.3s",
          fontFamily: "Arial, Helvetica, sans-serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <header style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 28px",
          gap: 16,
          flexShrink: 0,
        }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search tasks…"
            style={{
              background: "#4A3267",
              color: "white",
              border: "none",
              borderRadius: 40,
              padding: "10px 22px",
              outline: "none",
              width: 280,
              fontSize: 15,
            }}
          />
          <button
            onClick={() => setDark((d) => !d)}
            style={{
              marginLeft: "auto",
              border: "none",
              background: dark ? "#fff" : "#555",
              color: dark ? "#000" : "#fff",
              width: 45,
              height: 45,
              borderRadius: "50%",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.2s",
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </header>

        {/* Board */}
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 24,
            padding: "16px 28px 100px",
            alignItems: "flex-start",
          }}
        >
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              col={col}
              tasks={filtered(col.id)}
              dark={dark}
              onEdit={openEdit}
              onDelete={handleDelete}
              onPriority={handlePriority}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* FAB */}
        <button
          onClick={() => { setEditTask(null); setModalOpen(true); }}
          style={{
            position: "fixed",
            bottom: 35,
            left: "50%",
            transform: "translateX(-50%)",
            width: 70,
            height: 70,
            borderRadius: "50%",
            border: "none",
            fontSize: 32,
            background: "#4A3267",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
            transition: "transform 0.15s",
            zIndex: 100,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1)")}
        >
          +
        </button>

        <Modal
          visible={modalOpen}
          onClose={() => { setModalOpen(false); setEditTask(null); }}
          onSave={handleSave}
          editTask={editTask}
        />
      </div>
    </>
  );
}
