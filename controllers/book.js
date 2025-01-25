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
  .then(() => {
    res.status(201).json({ message: 'Livre enregistré !' });
  })
  .catch(error => {
    res.status(400).json({ error });
  })
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
  console.log("lol")

  // Récupérer l'id depuis req.params
  const id = req.params.id;

  console.log('Données reçues:', { userId, rating, id });

  // Vérifie si l'utilisateur correspond
  if (userId !== req.auth.userId) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  // Vérifie si l'ID est manquant
  if (!id) {
    return res.status(400).json({ message: "L'ID du livre est manquant" });
  }

  // Vérifie si la note est entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5." });
  }

  // Cherche le livre par son ID
  Book.findById(id)
    .then(book => {
      if (!book) {
        console.error('Livre non trouvé');
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Vérifie si l'utilisateur actuel est différent de l'utilisateur qui a téléchargé le livre
      if (book.uploaderId === userId) {
        console.error('Vous ne pouvez pas noter votre propre livre');
        return res.status(403).json({ message: "Vous ne pouvez pas noter votre propre livre" });
      }

      // Vérifie si l'utilisateur a déjà noté ce livre
      const existingRating = book.ratings.find(r => r.userId === userId);
      if (existingRating) {
        console.error('Vous avez déjà noté ce livre');
        return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
      }

      // Ajoute la note de l'utilisateur au livre
      book.ratings.push({ userId, grade: rating });
      console.log('Notes actuelles:', book.ratings);
      // Calcule la nouvelle moyenne des notes
      const totalRatings = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = totalRatings / book.ratings.length;

      // Vérifie que averageRating n'est pas NaN
      if (isNaN(book.averageRating)) {
        console.error('Erreur: averageRating est NaN');
        return res.status(500).json({ error: 'Erreur lors du calcul de la moyenne des notes' });
      }

      // Sauvegarde le livre avec la nouvelle note
      book.save()
        .then((r) => res.status(200).json(r))
        .catch(error => {
          console.error('Error saving book:', error);
          res.status(500).json({ error: 'Erreur lorddds de la sauvegarde du livre', details: error });
        });
    })
    .catch(error => {
      console.error('Error finding book:', error);
      res.status(500).json({ error: 'Erreur lors de leea recherche du livre', details: error });
    });
};

function AverageRating(ratings) {
  const sumOfAllGrades = ratings.reduce((sum, rating) => sum + rating.grade, 0);
  return sumOfAllGrades / ratings.length;
}

// notation meilleure livre ²
exports.getBestRating = (req, res, next) => {
  console.log("Début de la recherche des meilleurs livres");
  
  Book.find()
    .sort({ averageRating: -1 }) // Tri décroissant
    .limit(3) // Limitation à 3 résultats
    .then(books => {
      console.log("Livres récupérés avec succès :", books);
      res.status(200).json(books);
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des livres :", error);
      res.status(400).json({ error });
    })
    .finally(() => {
      console.log("Fin de l'exécution de getBestRating");
    });
};