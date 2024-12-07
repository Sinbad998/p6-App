//chemins
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const bookRoutes = require('./routes/book')
const userRoutes = require('./routes/user');
const { signup } = require('./controllers/user');

console.log('MONGODB_URI:', process.env.MONGODB_URI);
// connection mongodb atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


//intercepte les requete qui contiennet du json pour le mettre a notre dispo
app.use(express.json());

// CORS (autoriser les requêtes provenant de différentes origines)
app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
});

// routes
app.use('/api/books', bookRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')));

function signUp(req, res){
   console.log("req:", req)
}


module.exports = app;