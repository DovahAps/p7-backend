const Book = require('../models/Books.js');  
const fs = require('fs');

// Route to create a book
const createBook = (req, res, next) => {
  let bookObject;
  try {
    bookObject = JSON.parse(req.body.thing);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON data' });
  }
  
  delete bookObject._id;
  delete bookObject._userId;

  const newBook = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  newBook.save()
    .then(() => res.status(201).json({ message: 'Livre crée!' }))
    .catch(error => res.status(400).json({ error }));
};

// Route to update a book
const modifyBook = (req, res, next) => {
  let bookObject;

  try {
    bookObject = req.file ? {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON data' });
  }

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch(error => res.status(400).json({ error }));
};

// Route to delete a book
const deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        return res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];

        
        fs.access(`images/${filename}`, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(`images/${filename}`, (err) => {
              if (err) return res.status(500).json({ error: 'File deletion failed' });

              Book.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Book deleted!' }))
                .catch(error => res.status(401).json({ error }));
            });
          } else {
            
            Book.deleteOne({ _id: req.params.id })
              .then(() => res.status(200).json({ message: 'Book deleted, image not found.' }))
              .catch(error => res.status(401).json({ error }));
          }
        });
      }
    })
    .catch(error => res.status(500).json({ error }));
};

// Route to get one book
const getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({ error }));
};

// Route to get all books
const getBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};
// Route to rate boks
const rateBooks = (req,res,next)=> {
    const userId = req.auth.userId;
    const grade = req.body.rating;
    if (grade < 0 || grade >5){
        return res.status(400).json({message:'La note doit être comprise entre 0 et 5'})
    }
    Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

    
      const existingRating = book.ratings.find(rating => rating.userId === userId);
      if (existingRating) {
        return res.status(400).json({ message: 'Vous avez déjà noté ce livre' });
      }

     
      book.ratings.push({ userId, grade });

      
      const totalRatings = book.ratings.length;
      const totalGrade = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
      book.averageRating = totalGrade / totalRatings;

      
      book.save()
        .then(() => res.status(200).json({ message: 'Note ajoutée avec succès !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};


module.exports = {
  createBook,
  modifyBook,
  deleteBook,
  getOneBook,
  getBooks,
  rateBooks,
};
