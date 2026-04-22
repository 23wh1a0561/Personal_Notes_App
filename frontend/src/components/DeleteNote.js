import { useEffect, useState, useCallback } from "react";
import axios from "axios";

function DeleteNote() {
  const [notes, setNotes] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotes = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5001/notes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      alert("Error fetching notes");
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Deleted!");
      fetchNotes(); // refresh list

    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
  <div className="delete-container">
    <h2 className="delete-title">Delete Notes</h2>

    {notes.length > 0 ? (
      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note._id} className="note-card">
            <h3 className="note-title">{note.title}</h3>
            <p className="note-content">{note.content}</p>

            <button
              className="btn delete-btn"
              onClick={() => handleDelete(note._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="no-notes">No notes found</p>
    )}
  </div>
);
}

export default DeleteNote;