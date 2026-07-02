const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
router.get('/', async (req, res) => {
  try {
    const admins = await prisma.Admin.findMany();
    const safeAdmins = admins.map(({ password, ...rest }) => rest);
    res.json(safeAdmins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const admin = await prisma.Admin.findUnique({
      where: { adminid: parseInt(req.params.id) }
    });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    const { password: _pw, ...adminData } = admin;
    res.json(adminData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/', async (req, res) => {
  const { username, password, fullname, phone } = req.body;
  try {
    const admin = await prisma.Admin.create({
      data: { username, password, fullname, phone },
    });
    const { password: _pw, ...adminData } = admin;
    res.status(201).json(adminData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'សូមបញ្ចូល Username និង Password' });
  }
  try {
    const admin = await prisma.Admin.findUnique({ where: { username } });
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Username ឬ Password មិនត្រឹមត្រូវ' });
    }
    const token = jwt.sign({ id: admin.adminid }, 'SECRET_KEY', { expiresIn: '1h' });
    const { password: _pw, ...adminData } = admin;
    res.json({ message: 'Login ជោគជ័យ', token, admin: adminData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/forgot-password', async (req, res) => {
  const { username } = req.body;

  try {
    const admin = await prisma.Admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(404).json({ error: 'មិនមានគណនីអ៊ីមែលនេះនៅក្នុងប្រព័ន្ធទេ!' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expireTime = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.Admin.update({
      where: { username },
      data: {
        resetToken: token,
        resetTokenExp: expireTime
      }
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'email_របស់បង@gmail.com',
        pass: 'កូដ១៦ខ្ទង់ដែលទើបបង្កើតថ្មី'
      }
    });

    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    const mailOptions = {
      from: 'email_របស់បង@gmail.com',
      to: admin.username,
      subject: 'ការស្នើសុំផ្លាស់ប្តូរពាក្យសម្ងាត់ថ្មី (Reset Password)',
      html: `
        <h3>សួស្តីបាទ ${admin.fullname}!</h3>
        <p>អ្នកបានស្នើសុំប្តូរពាក្យសម្ងាត់ថ្មី។ សូមចុចលើតំណភ្ជាប់ខាងក្រោមដើម្បីកំណត់ពាក្យសម្ងាត់ថ្មី៖</p>
        <a href="${resetLink}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">ប្តូរពាក្យសម្ងាត់ទីនេះ</a>
        <p style="color: red; margin-top: 15px;">*ចំណាំ៖ តំណភ្ជាប់នេះមានសុពលភាពតែ ១៥ នាទីប៉ុណ្ណោះ។*</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'តំណភ្ជាប់សម្រាប់ប្តូរពាក្យសម្ងាត់ ត្រូវបានផ្ញើទៅកាន់អ៊ីមែលរបស់អ្នកហើយ។' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const admin = await prisma.Admin.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gte: new Date() }
      }
    });

    if (!admin) {
      return res.status(400).json({ error: 'Token មិនត្រឹមត្រូវ ឬបានហួសកំណត់រយៈពេល ១៥នាទីហើយ!' });
    }

    await prisma.Admin.update({
      where: { adminid: admin.adminid },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExp: null
      }
    });

    res.json({ message: 'ពាក្យសម្ងាត់របស់អ្នកត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ ឥឡូវនេះអ្នកអាច Login បានហើយ។' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', authMiddleware, async (req, res) => {
  const { fullname, phone } = req.body;
  try {
    const updatedAdmin = await prisma.Admin.update({
      where: { adminid: parseInt(req.params.id) },
      data: { fullname, phone },
    });
    const { password: _pw, ...adminData } = updatedAdmin;
    res.json({ message: 'Profile updated successfully', admin: adminData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/:id/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const avatarPath = `/uploads/${req.file.filename}`;
    const updatedAdmin = await prisma.Admin.update({
      where: { adminid: parseInt(req.params.id) },
      data: { avatarurl: avatarPath },
    });
    res.json({ message: 'Avatar uploaded successfully', avatar: avatarPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const admin = await prisma.Admin.findUnique({ where: { adminid: parseInt(req.params.id) } });
    if (!admin || admin.password !== oldPassword) {
      return res.status(401).json({ error: 'Old password incorrect' });
    }
    await prisma.Admin.update({
      where: { adminid: parseInt(req.params.id) },
      data: { password: newPassword },
    });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;