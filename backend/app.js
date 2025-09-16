const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Health
//http://localhost:7000/health
app.get('/health', (req,res)=>{
  res.json({ service: 'okoak', time: new Date().toISOString() });
});


// Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const openapi = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf-8'));
// app.get('/openapi.json', (req,res)=> res.json(openapi));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Routes
// const exampleRoutes = require('./routes/example.routes');
// const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');
const resultsRoutes = require('./routes/results.routes');
const reportsRoutes = require('./routes/reports.routes');
const assignmentsRoutes = require('./routes/assignments.routes');

// http://localhost:7000/api/auth/login
// app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/auth', authRoutes);
// http://localhost:7000/api/users
app.use('/api/users', userRoutes);
// http://localhost:7000/api/upload
app.use('/api/upload', uploadRoutes);
// http://localhost:7000/api/results
app.use('/api/results', resultsRoutes);
// http://localhost:7000/api/reports
app.use('/api/reports', reportsRoutes);
// http://localhost:7000/api/assignments
app.use('/api/assignments', assignmentsRoutes);

// 404
app.use((req,res,next)=>{
  res.status(404).json({ success:false, message:'ไม่พบหน้านี้'});
});

// Error handler
const error = require('./middlewares/error');
app.use(error);
// console.log(module);// Debug: log the module object to see its properties

module.exports = app;
