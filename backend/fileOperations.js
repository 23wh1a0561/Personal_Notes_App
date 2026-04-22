const fs = require("fs");

const filePath = "notes.json";
const notes = [
  {
    title: "First Note",
    content: "This is my first note",
    tags: ["personal"],
    pinned: false
  },
  {
    title: "Study Notes",
    content: "Prepare for exams",
    tags: ["study"],
    pinned: true
  },
  {
    title: "Project Work",
    content: "Complete Notes App project",
    tags: ["project"],
    pinned: false
  }
];

// WRITE to file
fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
console.log("Notes data written to file successfully.");

// READ from file
const data = fs.readFileSync(filePath, "utf-8");
const parsedData = JSON.parse(data);

console.log("Notes data read from file:");
console.log(parsedData);

const pinnedNotes = parsedData.filter(note => note.pinned === true);

console.log("Pinned Notes:");
console.log(pinnedNotes);