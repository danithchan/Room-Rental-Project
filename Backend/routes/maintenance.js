const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient'); 

router.get('/', async (req, res) => {
  try {
    const maintenances = await prisma.Maintenance.findMany({
      orderBy: { maintenanceid: 'asc' },
      include: { room: true }
    });
    res.json(maintenances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const maintenance = await prisma.Maintenance.findUnique({
      where: { maintenanceid: parseInt(req.params.id) },
      include: { room: true }
    });
    if (!maintenance) return res.status(404).json({ error: 'Maintenance not found' });
    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  const { description, reportdate, cost, status, roomid } = req.body;
  try {
    const room = await prisma.Room.findUnique({
      where: { roomid: parseInt(roomid) }
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const maintenance = await prisma.Maintenance.create({
      data: {
        description,
        reportdate: reportdate ? new Date(reportdate) : new Date(),
        cost: cost ? parseFloat(cost) : null,
        status: status || 'Pending',
        roomid: parseInt(roomid),
        roomnumber: room.roomnumber
      }
    });
    res.status(201).json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { description, cost, status } = req.body;
  try {
    const maintenance = await prisma.Maintenance.update({
      where: { maintenanceid: parseInt(req.params.id) },
      data: { description, cost: cost ? parseFloat(cost) : null, status }
    });
    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.Maintenance.delete({
      where: { maintenanceid: parseInt(req.params.id) }
    });
    res.json({ message: 'Maintenance deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;