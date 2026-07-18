const express = require('express');
const router = express.Router();
const multer = require('multer');
const prisma = require('../prismaClient');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('គាំទ្រតែ JPG, PNG, WebP ប៉ុណ្ណោះ'));
    }
  }
});


router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.Room.findMany({
      orderBy: { roomid: 'asc' }
    });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.Room.findUnique({
      where: { roomid: parseInt(req.params.id) }
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  const { roomnumber, roomtype, price, status } = req.body;
  try {
    const room = await prisma.Room.create({
      data: {
        roomnumber,
        roomtype,
        price: parseFloat(price),
        status: status || 'Available',
        adminid: 1
      }
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/:id/upload-image', upload.single('image'), async (req, res) => {
  const roomId = parseInt(req.params.id);

  if (!req.file) {
    return res.status(400).json({ error: 'សូម Upload រូបភាព' });
  } 

  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'ssrms/rooms');
    const room = await prisma.Room.update({
      where: { roomid: roomId },
      data: { imageurl: result.secure_url }
    });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  const { roomnumber, roomtype, price, status } = req.body;
  const roomId = parseInt(req.params.id);

  try {
    const oldRoom = await prisma.Room.findUnique({ where: { roomid: roomId } });

    const room = await prisma.Room.update({
      where: { roomid: roomId },
      data: { roomnumber, roomtype, price: parseFloat(price), status }
    });

    if (oldRoom && oldRoom.status !== status && status === 'Available') {
      await prisma.LeaseContract.updateMany({
        where: { roomid: roomId, status: 'Active' },
        data: { status: 'Ended' }
      });
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id/move-in', async (req, res) => {
  const roomId = parseInt(req.params.id);
  const {
    roomnumber, roomtype, price,
    tenantname, tenantphone, deposit, startdate
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.Room.update({
        where: { roomid: roomId },
        data: {
          roomnumber,
          roomtype,
          price: parseFloat(price),
          status: 'Occupied'
        }
      });

      const tenant = await tx.Tenant.create({
        data: {
          fullname: tenantname,
          phone: tenantphone
        }
      });

      const contract = await tx.LeaseContract.create({
        data: {
          startdate: new Date(startdate || Date.now()),
          deposit: parseFloat(deposit) || 0,
          status: 'Active',
          roomid: roomId,
          tenantid: tenant.tenantid,
          roomnumber: room.roomnumber,
          tenantname: tenant.fullname
        }
      });

      return { room, tenant, contract };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.Room.delete({
      where: { roomid: parseInt(req.params.id) }
    });
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;