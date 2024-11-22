//chemins
const express = require('express');

// creation de l'application expres
const app = express();

//importer mongoose
const mongoose = require('mongoose');
const path = require('path');

const stuffRoutes = require('./routes/stuff')
const userRoutes = require('./routes/user')

// connection mongodb atlas
mongoose.connect('mongodb+srv://youblalIsagi:6u7vOfdHek2XxKUJ@cluster0.1daai.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


//intercepte les requete qui contiennet du json pour le mettre a notre dispo
app.use(express.json());

//app.get('/', (req, res, next) => {
  // res.status(200).send('Bienvenue sur le serveur backend !');
 //});
 
//app.listen(PORT, function(){
//      console.log(`Server is running on: ${PORT}`);
//})

// CORS
app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
   next();
});


app.use('/api/stuff', stuffRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;