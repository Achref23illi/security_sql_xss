'use client';
import { useEffect, useState } from 'react';
import './globals.css';

export default function RootLayout({ children }) {
  // Add a client-side only rendering state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Database Security Demo</title>
      </head>
      <body>
        {/* Only render children when on client to avoid hydration mismatch */}
        {isClient ? children : 
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      </body>
    </html>
  );
}
