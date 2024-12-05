import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TonConnectButton } from "@tonconnect/ui-react";
import { useTonConnect } from "./hooks/useTonConnect";
import { CHAIN } from "@tonconnect/ui-react";
import { Address } from "ton-core";
import { useTonConnectUI } from "@tonconnect/ui-react";
import Post from "./components/Post/Post";
import Home from "./components/Home/Home";
import Profile from "./components/Profile/Profile";
import Reviews from "./components/Reviews/Reviews";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';

const App: React.FC = () => {
  const { sender, wallet, network } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI();

  const handleTransaction = async () => {
    if (!wallet) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const recipientAddress = Address.parse("kQDHaUtC4WVNhtWoUrbqU3hjI83-NcblDh_THztHfa1IL9oR");

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

  return (
    <BrowserRouter>
      <div className="container mx-auto bg-white-100 rounded-lg h-[100vh]">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-8 bg-white border flex flex-col justify-between">
            <div className="flex justify-between mb-2 p-2">
              <div className="flex items-center gap-2">
                <TonConnectButton />
                <button className="px-3 py-1 rounded bg-gray-200">
                  {network
                    ? network === CHAIN.MAINNET
                      ? "mainnet"
                      : "testnet"
                    : "N/A"}
                </button>
              </div>

              <div className="ml-4">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 rounded bg-blue-500 text-white">
                      Sign In
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>

            {/* Routes */}
            <Routes>
              {/* Home page should only be visible at the root path */}
              <Route path="/my-twa" element={<Home />} />

              <Route path="/post" element={<Post wallet={wallet || ""} />} />
              <Route path="/profile" element={
                <Profile address={wallet ? Address.parse(wallet as string).toString() : "Not Connected"} />
              } />
              <Route path="/reviews" element={<Reviews address={wallet ? Address.parse(wallet as string).toString() : "Not Connected"} />} />
            </Routes>

            {/* Navigation Links */}
            <div className="flex justify-around  border-t bottom-0 border-gray-300">
              <Link
                to="/post"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Your Posts
              </Link>
              <Link
                to="/reviews"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                All Reviews
              </Link>
              <Link
                to="/profile"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
