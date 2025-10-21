"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

interface User {
  name: string;
  token: string;
  user_id: number;
  logged_status: boolean;
  last_final_score: number;
  award_sent: boolean;
  award_response_status: number;
}

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Fetch user data
      console.log("Current window location:", window.location.href);
      console.log("Fetching user data from /user.json");
      
      // Force local URL to prevent external redirects
      const localUrl = `${window.location.protocol}//${window.location.host}/user.json`;
      console.log("Using local URL:", localUrl);
      
      let response;
      try {
        response = await fetch(localUrl);
      } catch (fetchError) {
        console.log("Local URL failed, trying relative URL");
        response = await fetch("/user.json");
      }
      console.log("User data response status:", response.status);
      console.log("Response URL:", response.url);
      console.log("Expected URL:", localUrl);
      
      if (response.url !== localUrl && !response.url.includes(window.location.host)) {
        console.error("WARNING: Response URL is different from expected!");
        console.error("Expected:", localUrl);
        console.error("Got:", response.url);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      console.log("Response text:", responseText.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      console.log("User data:", data);
      
      // Find user by token (password)
      const user = data.users.find((u: User) => u.token === password);
      
      if (!user) {
        setError("Нууц үг буруу байна");
        setLoading(false);
        return;
      }

      // Check if user is already logged in
      if (user.logged_status) {
        setError("Та аль хэдийн нэвтэрсэн байна. Зөвхөн нэг удаа нэвтрэх боломжтой.");
        setLoading(false);
        return;
      }

      // Password validation is already done above when finding user by token

      // Update user's logged status
      const updatedUsers = data.users.map((u: User) => 
        u.user_id === user.user_id ? { ...u, logged_status: true } : u
      );

      // Update user.json file
      console.log("Updating user data:", { users: updatedUsers });
      
      try {
        // Try relative URL first, then absolute URL as fallback
        let updateResponse;
        try {
          updateResponse = await fetch("/api/update-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ users: updatedUsers }),
          });
        } catch (relativeError) {
          console.log("Relative URL failed, trying absolute URL");
          const baseUrl = window.location.origin;
          updateResponse = await fetch(`${baseUrl}/api/update-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ users: updatedUsers }),
          });
        }

        console.log("Update response status:", updateResponse.status);
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error("Update response error:", errorText);
          throw new Error(`Хэрэглэгчийн мэдээлэл шинэчлэхэд алдаа гарлаа: ${updateResponse.status} ${errorText}`);
        }

        // Login successful
        onLoginSuccess(user);
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        throw new Error(`API холболтод алдаа гарлаа: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        setError(`Нэвтрэхэд алдаа гарлаа: ${err.message}`);
      } else {
        setError("Нэвтрэхэд алдаа гарлаа. Дахин оролдоно уу.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050915] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-b from-[#06121a] to-[#041018] rounded-xl border border-gray-800 shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-[#071018] to-[#0b2230] flex items-center justify-center border border-gray-800">
              <div style={{ width: 48, height: 48, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', borderRadius: 8 }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'oklch(0.52 0.23 21.3)' }}>
              Үгийн сүлжээ
            </h1>
            <p className="text-gray-400 text-sm">
              Нэвтрэхдээ нууц үгээ оруулна уу
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Нууц үг (abc123)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-[#071018] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="abc123"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Нэвтрэх"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Нууц үг: abc123 | Зөвхөн нэг удаа нэвтрэх боломжтой
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
