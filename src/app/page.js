"use client";

import { useEffect, useState } from "react";
import { auth, googleProvider } from "../../firebase";
import useStore from "../../store/store";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import ChatRoom from "./components/ChatRoom";
import GoogleSignIn from "./components/GoogleSignin";

export default function Home() {
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  // Google Sign-In
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  // Sign-Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Handle hydration mismatch
  if (!isClient) return null;

  // If not logged in, show the sign-in page
  if (!user) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] overflow-hidden">
        {/* Floating Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-50 animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>

        <GoogleSignIn onSignIn={handleSignIn} />
      </div>
    );
  }

  // If logged in, show the chat UI
  return (
    <div className="relative flex flex-col min-h-screen bg-[#f0f2f5]">

      {/* Chat Content */}
      <main className="flex items-center justify-center flex-1 p-4 bg-gradient-to-b from-[#0F2027] via-[#203A43] to-[#2C5364]">
  <ChatRoom />
</main>



      {/* Floating Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-50 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
