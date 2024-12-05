const express = require("express");
const { createReview, getAllReviews, getReviewsByUser, addComment } = require("../controller/Review");

const router = express.Router();

router.post('/', createReview);
router.get('/', getAllReviews); 
router.get('/user/:userId', getReviewsByUser);
router.post('/:reviewId/comment', addComment); 

module.exports = router;
