// les routes ou middlewares

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')

const stuffCtrl = require('../controllers/stuff')

//on prend la logique de consturction de sruffCtrl 
//via le dossier controllers, fichier stuff.js

//pour sauvegarder ou creer les objets(Books) 
router.post('/',auth, multer, stuffCtrl.createBook);

//pour noter un livre
router.post('/:id/rating', auth, stuffCtrl.postRating);

// pour modifier les objets(Books)
router.put('/:id',auth,multer, stuffCtrl.modifyBook);

// pour supprimer un objet(Book)
router.delete('/:id',auth, stuffCtrl.deleteBook);

//pour recuper un objet(Book) specifique
router.get('/:id',auth, stuffCtrl.getOneBook );

//pour recup les objets(Books) de la base de données
router.get('/',auth, stuffCtrl.getAllBooks);

module.exports = router;