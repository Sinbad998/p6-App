//logique de fonction ou construction de chaque route pour les Books
const Book = require('../models/Book')
const fs = require('fs')
const path = require("path");

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
  book.save()
  .then(() => {
    res.status(201).json({ message: 'Livre enregistré !' });
  })
  .catch(error => {
    res.status(400).json({ error });
  })
};

exports.modifyBook = async (req, res, next) => {
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete bookObject._userId;
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Pas autorisé' });
    }

    if (req.file) {
      // Séparation du nom du fichier image existant
      const filename = book.imageUrl.split('/images/')[1];
      // Suppression de l'image originale
      try {
        fs.unlinkSync(`images/${filename}`, (err) => {
          if (err) {
            console.log('Erreur lors de la suppression du fichier original:', err);
          } else {
            console.log('Ancienne image supprimée');
          }
        });
      } catch (err) {
        console.log('Erreur inattendue:', err);
      }
    }

    // Mettre à jour le livre après suppression de l'image
    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    return res.status(200).json({ message: 'Livre modifié!' });
  } catch (error) {
    return res.status(400).json({ error });
  }
};


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


exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
}


exports.getAllBooks = (req, res, next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
}

exports.postRating = (req, res, next) => {
  const { userId, rating } = req.body;
  console.log("lol")

  // Récupérer l'id depuis req.params
  const id = req.params.id;

  console.log('Données reçues:', { userId, rating, id });


  if (userId !== req.auth.userId) {
    return res.status(401).json({ message: 'Non autorisé' });
  }

  if (!id) {
    return res.status(400).json({ message: "L'ID du livre est manquant" });
  }


  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5." });
  }


  Book.findById(id)
    .then(book => {
      if (!book) {
        console.error('Livre non trouvé');
        return res.status(404).json({ message: 'Livre non trouvé' });
      }


      if (book.uploaderId === userId) {
        console.error('Vous ne pouvez pas noter votre propre livre');
        return res.status(403).json({ message: "Vous ne pouvez pas noter votre propre livre" });
      }


      const existingRating = book.ratings.find(r => r.userId === userId);
      if (existingRating) {
        console.error('Vous avez déjà noté ce livre');
        return res.status(400).json({ message: "Vous avez déjà noté ce livre" });
      }


      book.ratings.push({ userId, grade: rating });
      console.log('Notes actuelles:', book.ratings);


      const totalRatings = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = totalRatings / book.ratings.length;


      if (isNaN(book.averageRating)) {
        console.error('Erreur: averageRating est NaN');
        return res.status(500).json({ error: 'Erreur lors du calcul de la moyenne des notes' });
      }

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


exports.getBestRating = (req, res, next) => {
  console.log("Début de la recherche des meilleurs livres");
  
  Book.find()
    .sort({ averageRating: -1 }) 
    .limit(3) 
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
