"use client";

import React, { useState, useEffect } from "react";
import Icon from "@/components/Icon";

interface ContactCard {
  id: string;
  title: string;
  description: string;
  email: string;
  icon: string;
}

const ContactCardComponent = ({ title, description, email, icon }: ContactCard) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "building": return "office";
      case "scale": return "balance";
      case "chef": return "chef";
      case "mail": return "email";
      default: return "email";
    }
  };

  return (
    <div className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden p-6 shadow-lg">
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-[2.28rem] font-bold text-black">{title}</h2>
        <p className="text-lg text-black">{description}</p>
        <ul className="flex flex-col gap-2 list-none p-0 break-words">
          <li>
            <strong className="inline-flex items-center gap-1.5 text-[#394840] font-semibold">
              <Icon name={getIcon(icon)} size={16} className="text-gray-600" />
              Email
            </strong>
            <br />
            {email}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default function Contact() {
  const [contacts, setContacts] = useState<ContactCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContactContent() {
      try {
        const response = await fetch("/api/admin/content/contact");
        if (response.ok) {
          const data = await response.json();
          setContacts(data.cards || []);
        } else {
          setContacts(getDefaultContacts());
        }
      } catch (error) {
        console.error("Error loading contact content:", error);
        setContacts(getDefaultContacts());
      } finally {
        setLoading(false);
      }
    }

    loadContactContent();
  }, []);

  const getDefaultContacts = (): ContactCard[] => [
    {
      id: "advertisement",
      title: "Advertisement",
      description: "Looking to collaborate with Recipes By Clare? We'd love to hear from you! Reach out to discover exciting opportunities to showcase your brand through our recipes, articles, and more.",
      email: "ads@recipesbyclare.com",
      icon: "building"
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      description: "Have questions about how we handle your personal data or our privacy practices? Contact us to learn more about our commitment to protecting your privacy. We're here to help.",
      email: "legal@recipesbyclare.com",
      icon: "scale"
    },
    {
      id: "recipes",
      title: "Recipes",
      description: "Curious about a recipe or need inspiration for your next meal? Whether it's a special dish or new ideas you're after, Recipes By Clare is here to guide you. Send us a message and let's talk cooking!",
      email: "contact@recipesbyclare.com",
      icon: "chef"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-stone-100 rounded-[40px] p-6 shadow-lg animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {contacts.map((contact: ContactCard) => (
        <ContactCardComponent key={contact.email} {...contact} />
      ))}
    </div>
  );
}