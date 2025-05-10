// client/src/app/forum/[id]/page.js
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../utils/api';
import SecurityToggle from '../../../components/SecurityToggle';

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const params = useParams();
  const router = useRouter();
  const postId = params.id;

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchPostAndComments = async () => {
      try {
        const data = await api.forum.getPost(postId);
        setPost(data.post);
        setComments(data.comments);
      } catch (error) {
        setError('Failed to fetch post details');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to comment');
      router.push('/login');
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    try {
      const commentData = {
        content: newComment,
        userId: user.id,
        postId: parseInt(postId),
      };
      
      const response = await api.forum.addComment(commentData);
      
      // Add the new comment to the list
      setComments([
        {
          ...response,
          username: user.username,
        },
        ...comments,
      ]);
      
      // Clear the comment form
      setNewComment('');
    } catch (error) {
      alert('Failed to add comment');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center p-4">
        <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold mb-2">{error}</h2>
          <p className="mb-4">Unable to load the requested post.</p>
          <Link href="/forum">
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
              Return to Forum
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center mb-6">
          <Link href="/forum" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Forum
          </Link>
        </div>
        
        <SecurityToggle />
        
        {post && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">{post.title}</h1>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    {post.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{post.username}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{post.content}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Discussion ({comments.length})
          </h2>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-6">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-300 text-lg mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              XSS Vulnerability Demo
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
              In unsecured mode, try adding a comment with HTML and JavaScript code to test XSS vulnerabilities:
            </p>
            <div className="space-y-2">
              <div className="font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded text-sm overflow-x-auto">
                &lt;script&gt;alert(&quot;XSS Attack!&quot;)&lt;/script&gt;
              </div>
              <div className="font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded text-sm overflow-x-auto">
                &lt;img src=&quot;x&quot; onerror=&quot;alert(&apos;XSS&apos;)&quot;&gt;
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Add a Comment</h3>
            <form onSubmit={handleSubmitComment}>
              <div className="mb-4">
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={handleCommentChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[120px]"
                  placeholder={user ? "What are your thoughts?" : "Please login to comment"}
                  disabled={!user}
                  required
                ></textarea>
              </div>
              <div className="flex justify-between items-center">
                {!user && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You need to{' '}
                    <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                      login
                    </Link>{' '}
                    to comment
                  </p>
                )}
                <button
                  type="submit"
                  className={`bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200 ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!user}
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
          
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function CommentCard({ comment }) {
  // Add state to track security mode
  const [isSecured, setIsSecured] = useState(false);
  
  // Fetch security status when component mounts
  useEffect(() => {
    const fetchSecurityStatus = async () => {
      try {
        const response = await api.security.getStatus();
        setIsSecured(response.isSecured);
      } catch (error) {
        console.error('Error fetching security status:', error);
      }
    };
    
    fetchSecurityStatus();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full w-8 h-8 flex items-center justify-center mr-3">
            {comment.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <span className="font-medium text-gray-800 dark:text-white">{comment.username}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(comment.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      {/* Conditional rendering based on security mode */}
      {isSecured ? (
        // Secure mode: Render text safely without dangerouslySetInnerHTML
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 overflow-hidden">
          {comment.content}
        </div>
      ) : (
        // Insecure mode: Keep dangerouslySetInnerHTML for demonstration
        <div
          dangerouslySetInnerHTML={{ __html: comment.content }}
          className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 overflow-hidden"
        />
      )}
      
      {/* Add a warning for unsecured mode */}
      {!isSecured && (
        <div className="mt-3 text-xs p-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded border border-yellow-200 dark:border-yellow-800">
          <span className="font-semibold">XSS Demo:</span> This comment is rendered unsafely in insecure mode.
        </div>
      )}
    </div>
  );
}