// client/src/app/page.js
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SecurityToggle from '../components/SecurityToggle';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Database Security Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Learn about common web security vulnerabilities and how to protect against them
          </p>
        </div>
        
        <SecurityToggle />
        
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <VulnerabilityCard
            title="SQL Injection"
            description="SQL Injection allows attackers to execute malicious SQL commands by manipulating user inputs. This can lead to unauthorized data access, data corruption, or even complete system takeover."
            examples={[
              "admin' --",
              "1 OR 1=1",
              "' OR '1'='1",
            ]}
            route="/login"
            buttonText="Demo Login"
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
          />
          
          <VulnerabilityCard
            title="Cross-Site Scripting (XSS)"
            description="XSS allows attackers to inject malicious client-side scripts into web pages viewed by other users. This can be used to steal cookies, session tokens, or spread malware."
            examples={[
              "<script>alert('XSS')</script>",
              "<img src='x' onerror='alert(\"XSS\")'>",
              "<div onmouseover='alert(1)'>Hover me</div>",
            ]}
            route="/forum"
            buttonText="Demo Forum"
            icon={(
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          />
        </div>
        
        <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">How to Use This Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InstructionCard 
              number="1"
              title="Toggle Security Mode"
              description="Use the security toggle to switch between secured and unsecured versions of the application."
            />
            
            <InstructionCard 
              number="2"
              title="Try the Attacks"
              description="In unsecured mode, test SQL injection in the login form and XSS attacks in the forum."
            />
            
            <InstructionCard 
              number="3"
              title="See the Protection"
              description="Switch to secured mode to see how proper security measures prevent these attacks."
            />
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-blue-800 dark:text-blue-300">Educational Purpose Only</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  This application is designed for educational purposes to demonstrate web security vulnerabilities. 
                  Never attempt these techniques on real websites without permission.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/register">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}

function VulnerabilityCard({ title, description, examples, route, buttonText, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col items-center mb-4">
        {icon}
        <h2 className="text-2xl font-bold mb-2 text-center">{title}</h2>
      </div>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{description}</p>
      
      <div className="mb-6">
        <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Example Payloads:</h3>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <div key={index} className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-sm overflow-x-auto">
              {example}
            </div>
          ))}
        </div>
      </div>
      
      <Link href={route}>
        <button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
          {buttonText}
        </button>
      </Link>
    </div>
  );
}

function InstructionCard({ number, title, description }) {
  return (
    <div className="relative p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-2 mt-2 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}