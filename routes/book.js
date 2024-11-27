// les routes ou middlewares pour Books

//chemins
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')

//on prend la logique de consturction de bookCtrl 
//via le dossier controllers, fichier book.js
const bookCtrl = require('../controllers/book')

//pour sauvegarder ou creer les objets(Books) 
router.post('/',auth, multer, bookCtrl.createBook);

//pour noter un livre
router.post('/:id/rating', auth, bookCtrl.postRating);

// pour modifier les objets(Books)
router.put('/:id',auth,multer, bookCtrl.modifyBook);

// pour supprimer un objet(Book)
router.delete('/:id',auth, bookCtrl.deleteBook);

//pour recuper un objet(Book) specifique
router.get('/:id',auth, bookCtrl.getOneBook );

//pour recup les objets(Books) de la base de données
router.get('/',auth, bookCtrl.getAllBooks);

// pour recup les miuex notées
router.get('/bestrating', bookCtrl.getBestRating);



module.exports = router;