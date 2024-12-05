const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  rewardAmount: {
    type: Number,
    required: true
  },
  rewarded: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    required: false
  },
  userId: {
    type: String,
    required: true
  },
  comments: [
    {
      walletAddress: {
        type: String
      },
      comment: {
        type: String
      }
    },
  ]
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Review };
