'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../utils/api';
import SecurityToggle from '../../components/SecurityToggle';
import Link from 'next/link';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Fetch user info from API
    api.users.getById(parsedUser.id)
      .then(setDbUser)
      .catch(() => setError('Failed to fetch user info'));
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">{error}</h2>
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
      <div className="container mx-auto px-4 max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">My Profile</h1>
        <SecurityToggle />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8">
          {!dbUser ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-14 h-14 flex items-center justify-center text-3xl font-bold mr-4">
                  {dbUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xl font-semibold text-gray-800 dark:text-white">{dbUser.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{dbUser.email}</div>
                </div>
              </div>
              <div className="mb-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">User ID:</span> {dbUser.id}
              </div>
              <div className="mb-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Role:</span> {dbUser.is_admin ? 'Admin' : 'User'}
              </div>
              <div className="mb-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Joined:</span> {new Date(dbUser.created_at).toLocaleString()}
              </div>
              <div className="mt-8 text-center">
                <Link href="/forum">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200">
                    Go to Forum
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
