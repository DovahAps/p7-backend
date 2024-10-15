const express = require('express');
const auth = require('../middleware/Auth.js');
const router = express.Router();
const bookCtrl = require('../controllers/Books-cntrl.js');
const multer = require('../middleware/Multer-config.js');

// Book routes
router.get('/', auth, bookCtrl.getBooks);
router.post('/', auth, multer, bookCtrl.createBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/:id', auth, bookCtrl.getOneBook);
router.post('/:id/rating', auth, bookCtrl.rateBooks);  

module.exports = router;
