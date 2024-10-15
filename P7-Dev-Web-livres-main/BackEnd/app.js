
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');  
const app = express();
const booksRoutes = require('./routes/Books.js');
const userRoutes = require('./routes/User.js');


app.use(express.json());

// MongoDB 
mongoose
.connect('mongodb+srv://marceloaj96:lKAqbluO058wg64H@cluster0.bc30c.mongodb.net/myDatabase?retryWrites=true&w=majority')
.then(() => console.log('Connexion à MongoDB réussie!'))
.catch((error) => console.log('Connexion à MongoDB failed !', error));

// CORS 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Routes
app.use('/api/Books', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));  

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
