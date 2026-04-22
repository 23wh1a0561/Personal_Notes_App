const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Note = require("./models/Note");
const auth = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/notesapp")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    await user.save();

    res.json({
      message: "User registered successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Your account has been blocked by admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// ---------------- CREATE NOTE ----------------
app.post("/notes", auth, async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      pinned: req.body.pinned || false,
      userId: req.user.id
    });

    await note.save();
    res.json(note);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------- GET NOTES ----------------
app.get("/notes", auth, async (req, res) => {
  try {
    const { search, tag, pinned } = req.query;

    let query = {};

    if (req.user.role !== "admin") {
      query.userId = req.user.id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    if (tag) {
      query.tags = { $regex: tag, $options: "i" };
    }

    if (pinned === "true") {
      query.pinned = true;
    }

    const notes = await Note.find(query);
    res.json(notes);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const users = await User.find({}, "-password").sort({ createdAt: -1 }).lean();
    const noteCounts = await Note.aggregate([
      {
        $group: {
          _id: "$userId",
          notesCount: { $sum: 1 }
        }
      }
    ]);

    const noteCountMap = new Map(
      noteCounts.map((item) => [item._id.toString(), item.notesCount])
    );

    const usersWithStats = users.map((user) => ({
      ...user,
      notesCount: noteCountMap.get(user._id.toString()) || 0
    }));

    const summary = {
      totalUsers: usersWithStats.length,
      totalAdmins: usersWithStats.filter((user) => user.role === "admin").length,
      totalNotes: usersWithStats.reduce((sum, user) => sum + user.notesCount, 0),
      blockedUsers: usersWithStats.filter((user) => user.blocked).length
    };

    res.json({
      summary,
      currentAdminId: req.user.id,
      users: usersWithStats
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/admin/users/:id/block", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "You cannot block your own admin account" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.blocked = !user.blocked;
    await user.save();

    res.json({
      message: user.blocked ? "User blocked successfully" : "User unblocked successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Note.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------- UPDATE NOTE ----------------
app.put("/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (req.user.role !== "admin" && note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------- DELETE NOTE ----------------
app.delete("/notes/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (req.user.role !== "admin" && note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: "Note deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------- START SERVER ----------------
app.listen(5001, () => {
  console.log("Server running on port 5001");
});
