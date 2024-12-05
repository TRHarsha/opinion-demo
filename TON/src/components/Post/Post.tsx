import { ID } from 'appwrite';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Client, Databases, Storage } from 'appwrite';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { P } from '@clerk/clerk-react/dist/useAuth-D1ySo1Ar';
import { Address } from 'ton-core';
import { useTonClient } from '../../hooks/useTonClient';
import { useTonConnectUI } from '@tonconnect/ui-react';

interface Message {
  id: number;
  title: string;
  rewardAmount: string;
  details: string;
  image: string;
  timestamp: string;
  comments: any[]; 
}

interface PostProps {
  wallet: string;
}

const Post: React.FC<PostProps> = ({wallet}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>('');
  const [reward, setReward] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [storage, setStorage] = useState<any>();
  const [userReview, setUserReview] = useState<Message[]>([]);

  const {user} = useUser()

  const [isCommentOpen, setIsCommentOpen] = useState<{ [key: number]: boolean }>({});

  const toggleComments = (msgId: number) => {
    setIsCommentOpen((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  useEffect(() => {
    const client = new Client().setEndpoint('https://cloud.appwrite.io/v1').setProject('674faebc0038a09c39d2');
    const database = new Databases(client);
    const storage = new Storage(client)
    setStorage(storage)
  }, []);

  useEffect(() => {
    const getReviewsUser = async () => {
      try {
        const req = await axios.get(`http://localhost:8081/review/user/${user?.primaryEmailAddress?.emailAddress}`)
        setUserReview(req.data.data)
      } catch (error) {
        console.log("error: ", error)
      }
    }
    getReviewsUser()
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    try {
      const fileId = ID.unique();
      const data = await storage.createFile('674faecc002f7c1f887f', fileId, file);
      const imageURL = await storage.getFilePreview('674faecc002f7c1f887f', fileId);
      setImage(imageURL.href);
    } catch (error) {
      console.log("error: ", error)
    }
  };

  const sendMessage = async () => {
    if (!title || !reward || !description) {
      alert('Please fill all fields');
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      title,
      rewardAmount: reward,
      details: description,
      image: image || 'https://via.placeholder.com/150',
      timestamp: new Date().toLocaleString(),
      comments: []
    };

    setMessages([...messages, newMessage]);

    try {
      const newMessage = {
        "title": title,
        "details": description,
        "rewardAmount": reward,
        "rewarded": true,
        "image": image,
        "userId": user?.primaryEmailAddress?.emailAddress
      }

      await axios.post("http://localhost:8081/review/", newMessage);
    } catch (error) {
      console.log("Error sending message:", error);
    }

    setTitle('');
    setReward('');
    setDescription('');
    setImage(null);
    (document.getElementById('imageInput') as HTMLInputElement).value = '';
  };

  const [tonConnectUI] = useTonConnectUI();
  const [openCommentId, setOpenCommentId] = useState<number | null>(null); 
  const toggleCommentSection = (postId: number) => {
    setOpenCommentId(openCommentId === postId ? null : postId); // Toggle visibility for specific post
  };

  const handleTransaction = async (address: any) => {
    if (!wallet) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const recipientAddress = Address.parse(address);

      const transaction: any = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{
          address: recipientAddress.toString(),
          amount: '1000000000',
        }]
      };
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Transaction result:', result);
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };


  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <div className="container-fluid h-[85vh] d-flex flex-column bg-white">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />

      <div className="row flex-grow-1 overflow-auto">
        <div className="col-12">
          {messages.map((msg) => (
            <div key={msg.id} className="card mb-4 shadow-sm rounded-lg">
              <div className="card-body p-0">
                {/* Post Image */}
                <div className="relative w-full bg-gray-300">
                  <img src={msg.image} className="object-cover rounded-t-lg" alt="Post" />
                </div>

                {/* Post Content */}
                <div className="px-4 py-3">
                  <h5 className="text-xl font-semibold">{msg.title}</h5>
                  <p className="text-base text-gray-700 mb-2">{msg.details}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-green-600 font-semibold">Reward: ${msg.rewardAmount}</p>
                    <p className="text-xs text-gray-500">{msg.timestamp}</p>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="px-4 pb-3">
                  <button className="w-full text-blue-600 text-sm py-2" data-bs-toggle="collapse" data-bs-target={`#commentSection${msg.id}`} aria-expanded="false" aria-controls={`commentSection${msg.id}`}>
                    View Comments
                  </button>
                  <div className="collapse" id={`commentSection${msg.id}`}>
                    <div className="mt-2">
                      {msg.comments.length > 0 ? (
                        msg.comments.map((item, index) => (
                          <div key={index} className="flex flex-col space-y-2">
                            <div className="flex items-center flex-col space-x-2">
                              <div className="text-sm font-semibold">{item.walletAddress}</div>
                              <p className="text-sm">{item.comment}</p>
                            </div>
                            <button
                              onClick={(e) => handleTransaction(item.walletAddress)}
                              className="bg-blue-500 text-white text-xs py-1 px-2 rounded-full mt-2 hover:bg-blue-600 transition"
                            >
                              Reward
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm">No comments yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {userReview.map((msg) => (
            <div key={msg.id} className="card mb-4 shadow-sm rounded-lg">
              <div className="card-body p-0">
                {/* Post Image */}
                <div className="relative w-full  bg-gray-300">
                  <img src={msg.image} className="object-cover w-full h-full rounded-t-lg" alt="Post" />
                </div>

                {/* Post Content */}
                <div className="px-4 py-3">
                  <h5 className="text-xl font-semibold">{msg.title}</h5>
                  <p className="text-base text-gray-700 mb-2">{msg.details}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-green-600 font-semibold">Reward: ${msg.rewardAmount}</p>
                    <p className="text-xs text-gray-500">{msg.timestamp}</p>
                  </div>
                </div>

                               {/* Comments Section */}
                
                               {/* <div className="px-4 pb-3">
                  <button
                    className="w-full text-blue-600 text-sm py-2"
                    onClick={() => toggleComments(msg.id)}
                  >
                    {isCommentOpen[msg.id] ? 'Hide Comments' : 'View Comments'}
                  </button>
                  {isCommentOpen[msg.id] && (
                    <div className="mt-2">
                      {msg.comments.length > 0 ? (
                        msg.comments.map((item, index) => (
                          <div key={index} className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-semibold">{item.walletAddress}</div>
                              <p className="text-sm">{item.comment}</p>
                            </div>
                            <button
                              onClick={(e) => handleTransaction(item.walletAddress)}
                              className="bg-blue-500 text-white text-xs py-1 px-2 rounded-full mt-2 hover:bg-blue-600 transition"
                            >
                              Reward
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-sm">No comments yet</div>
                      )}
                    </div>
                  )}
                </div> */}

<div className="px-4 pb-3">
                  <button
                    className="w-full text-blue-600 text-sm py-2"
                    onClick={() => toggleCommentSection(msg.id)} // Toggle specific post
                  >
                    {openCommentId === msg.id ? 'Hide Comments' : 'View Comments'}
                  </button>
                  <div className={openCommentId === msg.id ? 'mt-2' : 'hidden'}>
                    {msg.comments.length > 0 ? (
                      msg.comments.map((item, index) => (
                        <div key={index} className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition">
  <div className="flex flex-col space-y-2">
    <div className="text-lg font-semibold text-gray-800">{item.walletAddress}</div>
    <p className="text-sm text-gray-600">{item.comment}</p>
  </div>
  <div>
    <button
      onClick={(e) => handleTransaction(item.walletAddress)}
      className="bg-blue-500 text-white text-sm py-2 px-4 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-200"
    >
      Reward
    </button>
  </div>
</div>

                      ))
                    ) : (
                      <div className="text-gray-500 text-sm">No comments yet</div>
                    )}
                  </div>
                </div>
              </div> 
            </div>
          ))}
        </div>
      </div>

      {/* New Post Form */}
      <div>
      <button className="btn btn-primary" onClick={openModal}>
        Create New Post
      </button>

      {/* Modal */}
      <div
        className={`modal fade ${isModalOpen ? "show" : ""}`}
        id="createPostModal"
        aria-labelledby="createPostModalLabel"
        aria-hidden={!isModalOpen}
        style={{ display: isModalOpen ? "block" : "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="createPostModalLabel">
                Create New Post
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeModal}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-control"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="reward" className="form-label">
                  Reward Amount
                </label>
                <input
                  type="text"
                  id="reward"
                  className="form-control"
                  placeholder="Enter reward amount"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  id="description"
                  className="form-control"
                  placeholder="Enter post description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="mb-3">
                <label htmlFor="imageInput" className="form-label">
                  Upload Image
                </label>
                <input
                  id="imageInput"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={closeModal}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={sendMessage}
              >
                Submit Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Post;

