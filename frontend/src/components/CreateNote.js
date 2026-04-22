import { useState } from "react";
import axios from "axios";

function CreateNote() {
  const [note, setNote] = useState({
    title: "",
    content: "",
    tags: "",
    pinned: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNote({
      ...note,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5001/notes",
        {
          ...note,
          tags: note.tags.split(",")
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Note created!");
      setNote({ title: "", content: "", tags: "", pinned: false });

    } catch {
      alert("Error creating note");
    }
  };

  return (
    <div className="form-box glass-box">
      <h2>Create Note</h2>

      <input
        name="title"
        placeholder="Title"
        value={note.title}
        onChange={handleChange}
      />

      <textarea
        name="content"
        placeholder="Content"
        value={note.content}
        onChange={handleChange}
      />

      <input
        name="tags"
        placeholder="Tags (comma separated)"
        value={note.tags}
        onChange={handleChange}
      />

      <div className="pin-row">
        <label className="pin-label">
          <input
            type="checkbox"
            name="pinned"
            checked={note.pinned}
            onChange={handleChange}
          />
          <span>Pin Note</span>
        </label>
      </div>

      <button onClick={handleSubmit}>Add Note</button>
    </div>
  );
}

export default CreateNote;