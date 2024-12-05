import React from 'react';

const Home: React.FC = () => {
  return (
    <div className='h-[80vh] flex flex-col justify-center items-center text-center bg-gradient-to-b from-blue-100 to-white py-10 px-6 rounded-lg'>
              <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Opinion</h1>
              <p className="text-xl text-gray-600 mb-6">
                Where you can earn by solving problems and correcting errors
              </p>
              <div className="text-lg text-gray-500 max-w-3xl mx-auto">
                <p>
                  Join the community and start solving real-world problems while earning rewards for your valuable input. Whether it's fixing issues or providing insights, your contributions make a difference!
                </p>
              </div>
            </div>
  );
}

export default Home;