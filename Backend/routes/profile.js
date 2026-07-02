const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });
router.get("/:adminid", async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { adminid: parseInt(req.params.adminid) },
      select: {
        adminid: true,
        username: true,
        fullname: true,
        phone: true,
        avatarurl: true, // ✅ បន្ថែមនេះ
      },
    });
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:adminid", async (req, res) => {
  const { username, fullname, phone } = req.body;
  try {
    const updated = await prisma.admin.update({
      where: { adminid: parseInt(req.params.adminid) },
      data: { username, fullname, phone },
    });
    res.json({ message: "Profile updated successfully", admin: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/:adminid/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const admin = await prisma.admin.findUnique({
      where: { adminid: parseInt(req.params.adminid) },
    });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const match = await bcrypt.compare(currentPassword, admin.password);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { adminid: parseInt(req.params.adminid) },
      data: { password: hashed },
    });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:adminid/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await prisma.admin.update({  // ✅ save ទៅ database
      where: { adminid: parseInt(req.params.adminid) },
      data: { avatarurl: avatarUrl },
    });
    res.json({ message: "Avatar uploaded successfully", avatarUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;