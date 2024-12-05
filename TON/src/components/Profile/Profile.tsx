import { useEffect, useState } from 'react';
import { useTonClient } from '../../hooks/useTonClient';
import { fromNano, Address } from 'ton-core';
import { useUser } from '@clerk/clerk-react';

interface ProfileProps {
  address: string;
}

const Profile: React.FC<ProfileProps> = ({ address }) => {
  const [balance, setBalance] = useState<string>('0');
  const client = useTonClient();

  const getBalance = async () => {
    if (!client || address === "Not Connected") return;
    
    try {
      // Parse the address string to TON Address type
      const tonAddress = Address.parse(address);
      const balance = await client.client?.getBalance(tonAddress);
      
      // Check if balance exists before converting
      if (balance) {
        const formattedBalance = fromNano(balance);
        setBalance(formattedBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const { user } = useUser();
  
  // This ID remains constant for the user
  const userId = user?.id;
  
  // Other useful user details
  const email = user?.primaryEmailAddress?.emailAddress;
  const username = user?.username;
  const firstName = user?.firstName;
  const lastName = user?.lastName;
  console.log(userId);

  useEffect(() => {
    getBalance();
  }, [address, client]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg h-[85vh] shadow-lg">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
          <p className="text-gray-600 mt-2">Your personal wallet information</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600">User Details</label>
            <div className="mt-1 flex flex-col sm:flex-row gap-4">
              <span className='text-black'>Email: {email}</span>
              <span className='text-black'>First Name: {firstName}</span>
              <span className='text-black'>Last Name: {lastName}</span>
            </div>
          </div>

        {/* Profile Details */}
        <div className="space-y-4">
          {/* Address Card */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600">Wallet Address</label>
            <div className="mt-1">
              <p className="text-gray-800 font-mono break-all">{address}</p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-blue-600">Wallet Balance</label>
            <div className="mt-1">
              <p className="text-2xl font-semibold text-blue-700">{balance} TON</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Network</p>
              <p className="text-gray-800 font-medium mt-1">Testnet</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Status</p>
              <p className="text-green-600 font-medium mt-1">Connected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
