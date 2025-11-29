'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function SidebarSubscription() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, source: 'recipe-sidebar' }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = "Something went wrong. Please try again.";
        try {
          const data = JSON.parse(text);
          errorMessage = data.error || errorMessage;
        } catch {
          console.error('Non-JSON error response:', text);
        }
        setMessage(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      setMessage(data.message || 'Thank you for subscribing!');
      setName('');
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 shadow-sm border border-orange-100">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-600 rounded-full mb-3">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Get New Recipes
        </h3>
        <p className="text-sm text-gray-600">
          Weekly recipes delivered to your inbox
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-orange-600 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm text-center ${
            message.includes('Thank you') || message.includes('already subscribed')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
