"use client";
import React, { useState } from "react";

interface SubscriptionSectionProps {
  className?: string;
}

export default function SubscriptionSection({ className }: SubscriptionSectionProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          source: 'homepage',
        }),
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
        return;
      }

      const data = await response.json();
      setMessage(data.message || "Thank you for subscribing!");
      setFormData({ name: "", email: "" });
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`relative ${className || ""}`}>
      {/* Top Separator */}
      <div className="w-full border-t border-gray-200"></div>
      
      <div className="py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Section Title with horizontal lines */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex-grow h-px bg-gray-300"></div>
          <h2 className="px-6 text-2xl md:text-3xl font-bold text-gray-900">
            Stay Updated
          </h2>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        <div className="max-w-lg mx-auto">
          <p className="text-gray-600 mb-6 text-lg">
            Get the latest recipes and cooking tips delivered to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {message && (
            <p className={`mt-4 text-sm ${
              message.includes("Thank you") ? "text-green-600" : "text-red-600"
            }`}>
              {message}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}