const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient'); 
router.get('/', async (req, res) => {
  try {
    const contracts = await prisma.LeaseContract.findMany({
      orderBy: { contractid: 'asc' },
      include: {
        room: true,
        tenant: true
      }
    });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const contract = await prisma.LeaseContract.findUnique({
      where: { contractid: parseInt(req.params.id) },
      include: { room: true, tenant: true, invoices: true }
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/', async (req, res) => {
  const { startdate, enddate, deposit, status, roomid, tenantid } = req.body;
  try {
    const room = await prisma.Room.findUnique({ where: { roomid: parseInt(roomid) } });
    const tenant = await prisma.Tenant.findUnique({ where: { tenantid: parseInt(tenantid) } });
    if (!room || !tenant) {
      return res.status(404).json({ error: 'Room or Tenant not found' });
    }
    await prisma.Room.update({
      where: { roomid: parseInt(roomid) },
      data: { status: 'Occupied' }
    });
    const contract = await prisma.LeaseContract.create({
      data: {
        startdate: new Date(startdate),
        enddate: enddate ? new Date(enddate) : null,
        deposit: parseFloat(deposit),
        status: status || 'Active',
        roomid: parseInt(roomid),
        tenantid: parseInt(tenantid),
        roomnumber: room.roomnumber,
        tenantname: tenant.fullname
      }
    });
    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', async (req, res) => {
  const { startdate, enddate, deposit, status } = req.body;
  try {
    const contract = await prisma.LeaseContract.update({
      where: { contractid: parseInt(req.params.id) },
      data: {
        startdate: new Date(startdate),
        enddate: enddate ? new Date(enddate) : null,
        deposit: parseFloat(deposit),
        status
      }
    });
    if (status === 'Ended') {
      await prisma.Room.update({
        where: { roomid: contract.roomid },
        data: { status: 'Available' }
      });
    }
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    await prisma.LeaseContract.delete({
      where: { contractid: parseInt(req.params.id) }
    });
    res.json({ message: 'Contract deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;