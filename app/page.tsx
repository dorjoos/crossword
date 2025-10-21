"use client";

import { useState, useEffect } from "react";
import CrosswordGame from "@/components/crossword-game";
import LoginPage from "@/components/login-page";

interface User {
  name: string;
  token: string;
  user_id: number;
  logged_status: boolean;
  last_final_score: number;
  award_sent: boolean;
  award_response_status: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage or session)
    const savedUser = localStorage.getItem('crosswordUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        // If localStorage data is corrupted, clear it
        localStorage.removeItem('crosswordUser');
        setUser(null);
      }
    }
    setLoading(false);

    // Listen for localStorage changes (for auto logout)
    const handleStorageChange = () => {
      const currentUser = localStorage.getItem('crosswordUser');
      if (!currentUser) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('crosswordUser', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('crosswordUser');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050915] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {user ? (
        <div>
          <CrosswordGame user={user} />
          {/* Logout button */}
          
        </div>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
}
