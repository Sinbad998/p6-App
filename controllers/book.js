//logique de fonction ou construction de chaque route pour les Books
const Book = require('../models/Book')
const fs = require('fs')

//pour sauvegarder ou creer les objets(Books)
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      averageRating: bookObject.ratings[0].grade

  });
  // sauveagrdedu livre
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
  
  // si le user ne correspond pas 
  if (user !== req.auth.userId) {
    return res.status(401).json({ message: 'Non autorisé' });
  }
  // si l'id est manquant
  if (id == null || id == "undefined") {
    res.status(400).send("Book id is missing");
    return;
  }
  // verifie si la note est entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5." });
  }
  // cherche le livre par son id
  Book.findById(req.params.id)
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: "Livre pas trouvée." });
      }
      const ratingDb = book.ratings;
      const ratingUser = ratingDb.find((rating) => rating.userId == userId);
      if (ratingUser != null) {
        res.status(400).send("You have already rated this book");
        return;
      }
      const newRating = { userId, grade: rating };
      ratingDb.push(newRating);
      book.averageRating = AverageRating(ratingDb);

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

function AverageRating(ratings) {
  const sumOfAllGrades = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return sumOfAllGrades / ratings.length;
}

// notation meilleure livre ²
exports.getBestRating = (req, res, next) => {
  Book.find().sort({ averageRating: -1 }).limit(3) 
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

