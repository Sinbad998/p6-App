//chemins
const express = require('express');

// creation de l'application expres
const app = express();

//importer mongoose
const mongoose = require('mongoose');
const path = require('path');

const stuffRoutes = require('./routes/book')
const userRoutes = require('./routes/user');
const { signup } = require('./controllers/user');

// connection mongodb atlas
mongoose.connect('mongodb+srv://youblalIsagi:6u7vOfdHek2XxKUJ@cluster0.1daai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
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
app.post("api/auth/signup", signUp)
app.use('/api/stuff', stuffRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')));

function signUp(req, res){
   console.log("req:", req)
}

module.exports = app;