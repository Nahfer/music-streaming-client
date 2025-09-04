"use client";

import React, { useState } from 'react';
import { register } from '@/services/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('UNDEFINED');
  const [type, setType] = useState('LISTENER');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userData: Record<string, unknown> = { name, email, password, gender, type };

      if (bio) {
        userData.bio = bio;
      }
      if (profileImageUrl) {
        userData.profileImageUrl = profileImageUrl;
      }

      const data = await register(userData);
      if (data.error) {
        let errorMessage = 'Registration failed:';
        if (typeof data.error === 'object' && data.error.fieldErrors) {
          for (const key in data.error.fieldErrors) {
            if (data.error.fieldErrors.hasOwnProperty(key)) {
              errorMessage += `\n- ${key}: ${data.error.fieldErrors[key].join(', ')}`;
            }
          }
        } else if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (Array.isArray(data.error)) {
          errorMessage = data.error.join(', ');
        } else {
          errorMessage += `\n${JSON.stringify(data.error)}`;
        }
        setError(errorMessage);
      } else {
        alert('Registration successful! Please log in.');
        router.push('/login');
      }
    } catch {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800">
      <div className="bg-gray-900 p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-white">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-400 text-sm font-bold mb-2">Name:</label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-400 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-400 text-sm font-bold mb-2">Password:</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="gender" className="block text-gray-400 text-sm font-bold mb-2">Gender:</label>
            <select
              id="gender"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="UNDEFINED">Undefined</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="type" className="block text-gray-400 text-sm font-bold mb-2">Type:</label>
            <select
              id="type"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="LISTENER">Listener</option>
              <option value="ARTIST">Artist</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-gray-400 text-sm font-bold mb-2">Bio:</label>
            <textarea
              id="bio"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="profileImageUrl" className="block text-gray-400 text-sm font-bold mb-2">Profile Image URL:</label>
            <input
              type="text"
              id="profileImageUrl"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your profile image URL"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Register
            </button>
            <Link href="/login" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Already have an account? Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
