import { useEffect, useState, useCallback } from "react";
import axios from "axios";

function UpdateNote() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    tags: ""
  });

  const token = localStorage.getItem("token");

  const fetchNotes = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5001/notes", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch {
      alert("Error fetching notes");
    }
  }, [token]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const selectNote = (note) => {
    setSelectedNote(note);
    setEditData({
      title: note.title,
      content: note.content,
      tags: note.tags?.join(", ") || ""
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5001/notes/${selectedNote._id}`,
        {
          ...editData,
          tags: editData.tags.split(",")
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Updated!");
      setSelectedNote(null);
      fetchNotes();
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="update-container">
      <h2 className="update-title">Update Notes</h2>

      {!selectedNote ? (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <h3 className="note-title">{note.title}</h3>
              <p className="note-content">{note.content}</p>
              <p className="note-tags">
                Tags: {note.tags?.join(", ")}
              </p>

              <button
                className="edit-btn"
                onClick={() => selectNote(note)}
              >
              Update
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="edit-card glass-box">
          <input
            placeholder="Title"
            value={editData.title}
            onChange={(e) =>
              setEditData({ ...editData, title: e.target.value })
            }
          />

          <textarea
            placeholder="Content"
            value={editData.content}
            onChange={(e) =>
              setEditData({ ...editData, content: e.target.value })
            }
          />

          <input
            placeholder="Tags (comma separated)"
            value={editData.tags}
            onChange={(e) =>
              setEditData({ ...editData, tags: e.target.value })
            }
          />

          <div className="update-actions">
            <button className="update-btn" onClick={handleUpdate}>
              Update
            </button>

            <button
              className="cancel-btn"
              onClick={() => setSelectedNote(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateNote;