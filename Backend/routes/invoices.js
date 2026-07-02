const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient'); 
const WATER_PRICE = 0.5;
const ELECTRIC_PRICE = 0.15;

router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.Invoice.findMany({
      orderBy: { invoiceid: 'asc' },
      include: { contract: true }
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.Invoice.findUnique({
      where: { invoiceid: parseInt(req.params.id) },
      include: { contract: true }
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const {
    invoicedate, contractid,
    oldwatermeter, newwatermeter,
    oldelectricmeter, newelectricmeter
  } = req.body;
  try {
    const contract = await prisma.LeaseContract.findUnique({
      where: { contractid: parseInt(contractid) },
      include: { room: true }
    });
    if (!contract) return res.status(404).json({ error: 'Contract not found' });
    const waterUsage = newwatermeter - oldwatermeter;
    const electricUsage = newelectricmeter - oldelectricmeter;
    const totalAmount =
      parseFloat(contract.room.price) +
      waterUsage * WATER_PRICE +
      electricUsage * ELECTRIC_PRICE;

    const invoice = await prisma.Invoice.create({
      data: {
        invoicedate: new Date(invoicedate),
        oldwatermeter: parseInt(oldwatermeter),
        newwatermeter: parseInt(newwatermeter),
        oldelectricmeter: parseInt(oldelectricmeter),
        newelectricmeter: parseInt(newelectricmeter),
        totalamount: totalAmount,
        paymentstatus: 'Unpaid',
        contractid: parseInt(contractid),
        roomnumber: contract.roomnumber,
        tenantname: contract.tenantname
      }
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.put('/:id', async (req, res) => {
  const { paymentstatus } = req.body;
  try {
    const invoice = await prisma.Invoice.update({
      where: { invoiceid: parseInt(req.params.id) },
      data: { paymentstatus }
    });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete('/:id', async (req, res) => {
  try {
    await prisma.Invoice.delete({
      where: { invoiceid: parseInt(req.params.id) }
    });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;