import { useEffect, useState, useCallback } from "react";
import axios from "axios";

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [showPinned, setShowPinned] = useState(false);

  const token = localStorage.getItem("token");

  const fetchNotes = useCallback(async () => {
    try {
      let url = "http://localhost:5001/notes?";

      if (search) url += `search=${search}&`;
      if (tag) url += `tag=${tag}&`;
      if (showPinned) url += `pinned=true`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotes(res.data);
    } catch {
      alert("Error fetching notes");
    }
  }, [token, search, tag, showPinned]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="notes-container">

      <h2 className="notes-title">Your Notes</h2>

      
      <div className="filter-box glass-box">
        <input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          placeholder="Filter by tag..."
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />

        <label className="pin-filter">
          <input
            type="checkbox"
            checked={showPinned}
            onChange={(e) => setShowPinned(e.target.checked)}
          />
          Pinned Only
        </label>
      </div>

      
      {notes.length > 0 ? (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note._id} className="note-card glass-box">

              {note.pinned && <span>📌</span>}

              <h3 className="note-title">{note.title}</h3>

              <p className="note-content">{note.content}</p>

              <p className="note-tags">
                Tags: {note.tags?.join(", ")}
              </p>

            </div>
          ))}
        </div>
      ) : (
        <p className="no-notes">No notes found</p>
      )}
    </div>
  );
}

export default NotesList;