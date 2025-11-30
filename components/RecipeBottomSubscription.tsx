'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function RecipeBottomSubscription() {
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
        body: JSON.stringify({ name, email, source: 'recipe-bottom' }),
      });

      if (response.ok) {
        // Track conversion
        try {
          const sessionId = sessionStorage.getItem('analytics_session_id');
          fetch('/api/admin/analytics/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'subscribe',
              sessionId,
              meta: { source: 'recipe-bottom' }
            })
          });
        } catch (e) { console.error(e); }
      }

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
    <div className="hidden md:block rounded-2xl p-8 md:p-12 shadow-2xl my-12" style={{ background: 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)' }}>
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-6 shadow-lg">
          <Mail className="w-8 h-8" style={{ color: '#3F7D58' }} />
        </div>
        
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Love This Recipe?
        </h3>
        <p className="text-green-50 mb-8 text-base md:text-lg leading-relaxed">
          Get more delicious recipes like this delivered to your inbox every week!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-stretch">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="md:w-64 px-5 py-4 text-base bg-white border-2 border-white rounded-xl focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg transition-all"
          />
          
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="md:w-64 px-5 py-4 text-base bg-white border-2 border-white rounded-xl focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg transition-all"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="md:w-auto w-full bg-white py-4 px-10 rounded-xl font-bold text-base hover:bg-green-50 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{ color: '#3F7D58' }}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm inline-block ${
              message.includes('Thank you') || message.includes('already subscribed')
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
