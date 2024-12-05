import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Address } from 'ton-core';

interface ProfileProps {
  address: string;
}

const Reviews: React.FC<ProfileProps> = ({ address }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null); // Tracks the review dropdown visibility
  const [reviewText, setReviewText] = useState<Record<string, string>>({}); // Store text for each review

  useEffect(() => {
    const getReviews = async () => {
      try {
        const req = await axios.get("http://localhost:8081/review/");
        console.log(req.data.data);  // Log data to inspect the structure
        setReviews(req.data.data);  // Set reviews to state
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    getReviews();
  }, []);

  const handleReviewToggle = (reviewId: string) => {
    // Toggle the dropdown visibility for the clicked review
    setOpenDropdown(openDropdown === reviewId ? null : reviewId);
  };

  const handleReviewTextChange = (reviewId: string, text: string) => {
    setReviewText((prevState) => ({
      ...prevState,
      [reviewId]: text,
    }));
  };

  const tonAddress = Address.parse(address);

  const handleReviewSubmit = async (reviewId: string) => {
    const walletAddress = tonAddress.toString();  // Wallet address of the user
    const commentText = reviewText[reviewId] || '';  // Get the comment text for the current review

    try {
      const response = await axios.post(
        `http://localhost:8081/review/${reviewId}/comment`,
        { walletAddress, comment: commentText }
      );
      console.log('Comment added:', response.data);
      setReviewText((prevState) => ({
        ...prevState,
        [reviewId]: '',
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="mx-auto w-full">
      <h1 className="text-xl font-semibold">All Reviews</h1>
      <p className="text-xs text-gray-700">Explore the reviews and provide your own feedback!</p>

      {/* Scrollable container for reviews */}
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {reviews.length > 0 ? (
          reviews.map((msg: any) => (
            <div key={msg._id} className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow w-full">
              {/* Full width image */}
              <div className="w-full mb-4">
                <img
                  src={msg.image}
                  alt="Review"
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>

              {/* Review Details */}
              <div className="flex flex-col space-y-4">
                <h6 className="text-xl font-semibold text-gray-800">{msg.title}</h6>
                <p className="text-sm text-gray-600">{msg.details}</p>
                <div className="flex justify-between items-center text-sm">
                  <p className="text-green-500 font-semibold">Reward: ${msg.rewardAmount}</p>
                  <small className="text-gray-400">{msg.timestamp || 'No timestamp'}</small>
                </div>

                {/* Leave a Review Button */}
                <button
                  onClick={() => handleReviewToggle(msg._id)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Leave a Review
                </button>

                {/* Review Input Section */}
                {openDropdown === msg._id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-md">
                    <textarea
                      value={reviewText[msg._id] || ''}
                      onChange={(e) => handleReviewTextChange(msg._id, e.target.value)}
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your review here..."
                    ></textarea>
                    <button
                      onClick={() => handleReviewSubmit(msg._id)}
                      className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-lg text-gray-500">Loading reviews...</div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
