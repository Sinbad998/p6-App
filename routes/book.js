// les routes ou middlewares pour Books

//chemins
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')
const sharp = require('../middleware/sharp');


//on prend la logique de consturction de bookCtrl 
//via le dossier controllers, fichier book.js
const bookCtrl = require('../controllers/book')

//pour sauvegarder ou creer les objets(Books) 
router.post('/',auth, multer,sharp, bookCtrl.createBook);

//pour noter un livre
router.post('/:id/rating', auth, bookCtrl.postRating);

// pour modifier les objets(Books)
router.put('/:id',auth,multer, sharp, bookCtrl.modifyBook);

// pour supprimer un objet(Book)
router.delete('/:id',auth, bookCtrl.deleteBook);

// pour recup les miuex notées
router.get('/bestrating', bookCtrl.getBestRating);

//pour recuper un objet(Book) specifique
router.get('/:id', bookCtrl.getOneBook );

//pour recup les objets(Books) de la base de données
router.get('/', bookCtrl.getAllBooks);






module.exports = router;