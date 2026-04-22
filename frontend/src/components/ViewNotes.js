import { useEffect, useState } from "react";
import axios from "axios";

function ViewNotes() {
  const [notes, setNotes] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get("http://localhost:5001/notes", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setNotes(res.data || []);
      } catch (err) {
        alert("Error fetching notes");
      }
    };

    fetchNotes();
  }, [token]);

  return (
    <div>
      <h2>Your Notes</h2>

      {notes.length > 0 ? (
        notes.map((note) => (
          <div key={note._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
          </div>
        ))
      ) : (
        <p>No notes found</p>
      )}
    </div>
  );
}

export default ViewNotes;