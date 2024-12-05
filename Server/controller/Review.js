const { Review } = require('../model/Review');

// Create a new review
const createReview = async (req, res) => {
  try {
    const {title, details, rewardAmount, rewarded, image, userId } = req.body;
    console.log(title)

    const newReview = new Review({
      title,
      details,
      rewardAmount,
      rewarded: rewarded || false, // Default to false if not provided
      image,
      userId
    });

    const savedReview = await newReview.save();
    res.status(201).json({
      success: true,
      data: savedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error creating review'
    });
  }
};

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ _id: -1 }); // Latest first
    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching reviews'
    });
  }
};

// Get reviews by userId
const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Received userId from params:", userId);  // Log the userId

    const reviews = await Review.find({ userId: userId }).sort({ _id: -1 });

    if (!reviews.length) {
      return res.status(404).json({
        success: false,
        message: 'No reviews found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching user reviews'
    });
  }
};



const addComment = async (req, res) => {
  try {
    console.log("addComment called");
    const { reviewId } = req.params;  // Get the reviewId from the URL
    const { walletAddress, comment } = req.body;  // Get the walletAddress and comment from the body
    console.log("Review ID:", reviewId);
    console.log("Wallet Address:", walletAddress);
    console.log("Comment:", comment);

    // Find the review by its ID
    const review = await Review.findById(reviewId);
    if (!review) {
      console.log("Review not found");
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Add the new comment to the comments array
    review.comments.push({ walletAddress, comment });

    // Save the updated review
    const updatedReview = await review.save();

    res.status(200).json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({
      success: false,
      error: 'Error adding comment',
    });
  }
};




// Export functions
module.exports = {
  createReview,
  getAllReviews,
  getReviewsByUser,
  addComment
};
