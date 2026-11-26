const express = require('express');
const router = express.Router();
const { getBookJourney } = require('../controllers/journeyController');

router.get('/:bookId', getBookJourney);

module.exports = router;
