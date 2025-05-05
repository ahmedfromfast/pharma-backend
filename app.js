//-------------------------- Libraries --------------------------//
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // Load env vars

//------------------------- Local Modules -------------------------//
const authRoutes = require('./routes/authRoutes'); 
const appointmentRoutes = require('./routes/aptRoutes');
const reportRoutes = require('./routes/repRoutes');
const medRoutes = require('./routes/medRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const doctorRoutes = require('./routes/docRoutes');
const profileRoutes = require('./routes/prfRoutes')
//------------------------- App Setup -------------------------//
const app = express();

//------------------------- Middleware -------------------------//
const corsOptions = {
  origin: ['http://localhost:8081','http://localhost:5173'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT',"PATCH", 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads')); // For product images
app.use('/api/profile/avatars', express.static('uploads/avatars'));

//------------------------- API Routes -------------------------//
app.use('/api/auth', authRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/reports', reportRoutes); 
app.use('/api/medicines', medRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/profile',profileRoutes)

//------------------------- Health Check -------------------------//
app.get('/', (req, res) => {
  res.send('💊 Pharma Care API is running');
});

module.exports = app;
