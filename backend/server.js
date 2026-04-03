const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const app = express();

// middleware
app.use(express.json());

// import model
const Note = require("./models/Note");

// connect MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/notesapp")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("Backend + DB running...");
});

// create note API
app.post("/notes", auth, async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      userId: req.user.id   // important
    });

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all notes
app.get("/notes", auth, async (req, res) => {
  try {
    let notes;

    if (req.user.role === "admin") {
      notes = await Note.find(); // admin sees all
    } else {
      notes = await Note.find({ userId: req.user.id }); // user sees own
    }

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete note
app.delete("/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (req.user.role !== "admin" && note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// update note
app.put("/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (req.user.role !== "admin" && note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedNote);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// register user
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// login user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "User not found" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ message: "Invalid password" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// start server
app.listen(5001, () => {
  console.log("Server running on port 5001");
});