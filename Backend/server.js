const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
const adminRoutes = require('./routes/admin');
const roomRoutes = require('./routes/rooms');
const tenantRoutes = require('./routes/tenants');
const tenantAuthRoutes = require('./routes/tenantAuth');
const contractRoutes = require('./routes/contracts');
const invoiceRoutes = require('./routes/invoices');
const maintenanceRoutes = require('./routes/maintenance');
// const profileRoutes = require("./routes/profile");

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/admin', adminRoutes);
app.use('/api/tenant-auth', tenantAuthRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/maintenance', maintenanceRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Room Rental API is running!' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});