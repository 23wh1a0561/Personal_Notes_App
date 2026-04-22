const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const decoded = jwt.verify(token, "secretkey");
    const user = await User.findById(decoded.id).select("blocked role");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    req.user = {
      id: decoded.id,
      role: user.role
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
