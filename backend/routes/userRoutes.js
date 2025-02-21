const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  addFavorite,
  removeFavorite,
  addSavedForLater,
  removeSavedForLater,
  markSolved,
} = require('../controllers/userController');

// All user routes are protected
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/favorites', addFavorite);
router.delete('/favorites', removeFavorite);
router.post('/saved', addSavedForLater);
router.delete('/saved', removeSavedForLater);
router.post('/solved', markSolved);

module.exports = router;
