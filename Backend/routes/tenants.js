const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const bcrypt = require('bcrypt'); 

// GET - ទាញយកទិន្នន័យអ្នកជួលទាំងអស់
router.get('/', async (req, res) => {
  try {
    const tenants = await prisma.Tenant.findMany({
      orderBy: { tenantid: 'asc' }
    });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - ទាញយកអ្នកជួលតាម ID
router.get('/:id', async (req, res) => {
  try {
    const tenant = await prisma.Tenant.findUnique({
      where: { tenantid: parseInt(req.params.id) },
      include: { contracts: true }
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - បង្កើតអ្នកជួលថ្មី
router.post('/', async (req, res) => {
  const { fullname, gender, phone, idcardnumber, address, username, password } = req.body;
  try {
    if (username) {
      const existingTenant = await prisma.Tenant.findUnique({ where: { username } });
      if (existingTenant) {
        return res.status(400).json({ error: 'Username នេះមានគេប្រើប្រាស់រួចហើយ' });
      }
    }

    let hashedPassword = password;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const tenant = await prisma.Tenant.create({
      data: { 
        fullname, 
        gender, 
        phone, 
        idcardnumber, 
        address,
        username,
        password: hashedPassword 
      }
    });
    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - កែប្រែព័ត៌មានអ្នកជួល
router.put('/:id', async (req, res) => {
  const tenantId = parseInt(req.params.id);
  const { fullname, gender, phone, idcardnumber, address, username, password } = req.body;
  
  try {
    const updateData = { fullname, gender, phone, idcardnumber, address };

    if (username) {
      const existingTenant = await prisma.Tenant.findFirst({
        where: {
          username: username,
          NOT: { tenantid: tenantId } 
        }
      });

      if (existingTenant) {
        return res.status(400).json({ error: 'Username នេះមានអ្នកជួលផ្សេងប្រើប្រាស់រួចហើយ!' });
      }

      updateData.username = username;
    }

    if (password && password.trim() !== '') {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const tenant = await prisma.Tenant.update({
      where: { tenantid: tenantId },
      data: updateData
    });
    
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - លុបអ្នកជួល
router.delete('/:id', async (req, res) => {
  try {
    await prisma.Tenant.delete({
      where: { tenantid: parseInt(req.params.id) }
    });
    res.json({ message: 'Tenant deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;