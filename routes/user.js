// les routes ou middlewares pour Users

//chemins
const express = require('express');
const router = express.Router();

//on prend la logique de consturction de userCtrl 
//via le dossier controllers, fichier user.js
const userCtrl = require('../controllers/user')

//pour creer un nouveau compte 
router.post('/signup', userCtrl.signup)

//pour se connecter à un compte
router.post('/login', userCtrl.login)


module.exports = router;