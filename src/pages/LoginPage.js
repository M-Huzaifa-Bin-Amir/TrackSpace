import React, { useState } from 'react';
import { auth } from '../services/firebase'; // Import the auth service
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login/Sign Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear old errors

    try {
      if (isSignUp) {
        // Create Account
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Note: We don't need to redirect manually here. 
      // App.js detects the change and redirects automatically.
    } catch (err) {
      // Show a clean error message
      setError(err.message.replace("Firebase:", "").replace("auth/", ""));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-[#340158] mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        {/* Error Message Banner */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm capitalize">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#340158] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#340158] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7e3ff2]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-gradient-to-r from-[#7e3ff2] to-[#4b0082] text-white py-3 rounded-lg font-bold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-2 text-[#7e3ff2] font-bold hover:underline"
          >
            {isSignUp ? 'Login here' : 'Sign up here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;