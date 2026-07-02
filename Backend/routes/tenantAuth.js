const express = require('express');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const TENANT_SECRET = 'TENANT_SECRET_KEY';

const tenantAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: 'No token provided' });

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  try {
    const decoded = jwt.verify(token, TENANT_SECRET);
    req.tenantId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
router.post('/login', async (req, res) => {
  const { username, password } = req.body; 

  if (!username || !password) {
    return res.status(400).json({ error: 'សូមបញ្ចូល Username និង Password' });
  }

  try {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPhone = username.trim();
    const tenant = await prisma.Tenant.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { phone: cleanPhone } 
        ]
      }
    });

    if (!tenant) {
      return res.status(401).json({ error: 'Username/លេខទូរស័ព្ទ ឬ Password មិនត្រឹមត្រូវ' });
    }
    const isMatch = await bcrypt.compare(password.trim(), tenant.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Username/លេខទូរស័ព្ទ ឬ Password មិនត្រឹមត្រូវ' });
    }

    const token = jwt.sign(
      { id: tenant.tenantid, username: tenant.username || tenant.phone },
      TENANT_SECRET,
      { expiresIn: '24h' }
    );
    const { password: _pw, ...tenantData } = tenant;

    return res.json({
      message: 'Login successful',
      token: token,
      tenant: tenantData
    });
    
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'មានបញ្ហាបច្ចេកទេសនៅលើ Server' });
  }
});

router.get('/me', tenantAuthMiddleware, async (req, res) => {
  try {
    const tenant = await prisma.Tenant.findUnique({
      where: { tenantid: req.tenantId },
      include: {
        contracts: {
          include: {
            invoices: true,
            room: true,
          },
          orderBy: { contractid: 'desc' },
        },
      },
    });

    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const { password: _pw, ...tenantData } = tenant;
    res.json(tenantData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/maintenance', tenantAuthMiddleware, async (req, res) => {
  const { description, roomid } = req.body;

  try {
    const room = await prisma.Room.findUnique({ where: { roomid: parseInt(roomid) } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const maintenance = await prisma.Maintenance.create({
      data: {
        description,
        status: 'Pending',
        roomid: parseInt(roomid),
        roomnumber: room.roomnumber,
      },
    });
    res.status(201).json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;