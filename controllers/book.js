//logique de fonction ou construction de chaque route
const Book = require('../models/Book')
const fs = require('fs')
const path = require('path')

//pour sauvegarder ou creer les objets(Books)
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
  .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

// pour modifier les objets(Books)
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id})
      .then((book) => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({ message : 'Pas autoriser'});
          } else {
              Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Livre modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

// pour supprimer un objet(Book)
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

//pour recuper un objet(Book) specifique
exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
}

//pour recup les objets(Books) de la base de données
exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
}

// notation livre
exports.postRating = (req, res, next) => {
  const { userId, rating } = req.body;

  const user = req.body.userId;
  
  if (user !== req.auth.userId) {
    return res.status(401).json({ message: 'Non autorisé' });
  }
  
  // Check that the note is between 0 and 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5." });
  }
  
  Book.findById(req.params.id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: "Livre non trouvé." });
      }
      const userRating = book.ratings.find(rating => rating.userId === userId);
      if (userRating) {
        return res.status(400).json({ error: "L'utilisateur a déjà noté ce livre." });
      }
      book.ratings.push({ userId, grade: rating });
      book.save()
        .then(newBook => {
          res.status(200).json(newBook);
        })
        .catch(error => {
          res.status(500).json({ error });
        });
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

