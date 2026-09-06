const express = require('express');
const path = require('path');
require('dotenv').config();


const app = express();

// middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
const mailRoutes = require('./routes/mailRoutes');
app.use('/', mailRoutes);

// server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});