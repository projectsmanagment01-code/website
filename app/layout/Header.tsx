"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { mobileNavigationItems, navigationItems } from "@/data/navigation";
import { siteConfig } from "@/config/site";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const isAdmin = segments[segments.length - 1] === "admin";
  if (isAdmin) {
    return <></>;
  }

  // Function to check if a navigation item is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`relative bg-white border-b border-gray-200 box-border w-full ${
        className || ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4">
          {/* Desktop Navigation - Left aligned with spacing */}
          <ul className="items-center hidden lg:flex gap-x-8 ml-4">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  title={item.title}
                  className={`relative text-gray-700 font-medium text-sm uppercase tracking-wide transition-all duration-300 hover:text-orange-700 hover:scale-105 ${
                    isActive(item.href)
                      ? "text-black font-semibold" // Active state
                      : "" // Default state
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Logo - Right aligned with spacing */}
          <a
            href="/"
            title={siteConfig.description}
            className="flex items-center flex-shrink-0 mr-4"
          >
            <Logo className="h-6 sm:h-7 lg:h-8 leading-none" />
          </a>

          {/* Mobile Menu Button - Right aligned */}
          <details className="lg:hidden relative flex-shrink-0 ml-auto">
            <summary
              aria-label="Toggle Mobile Menu"
              className="list-none cursor-pointer inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <Icon name="menu" size={24} className="text-gray-700 hover:text-orange-700 transition-colors duration-200" />
            </summary>

            <div className="fixed inset-0 bg-white z-50 flex flex-col">
              {/* Header with close button */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const details = e.currentTarget.closest("details");
                    if (details) details.removeAttribute("open");
                  }}
                  className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Close Menu"
                >
                  <Icon name="close" size={24} className="text-gray-700" />
                </button>
              </div>

              {/* Navigation items */}
              <div className="flex-1 overflow-y-auto">
                <ul className="flex flex-col p-6 gap-y-1">
                  {mobileNavigationItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        title={item.title}
                        className={`flex items-center gap-x-3 px-4 py-3 rounded-md transition-colors text-base ${
                          isActive(item.href)
                            ? "bg-gray-100 text-black font-medium" // Active state for mobile
                            : "text-gray-700 hover:bg-gray-50 hover:text-orange-700" // Default state
                        }`}
                        onClick={() => {
                          // Close the menu when a link is clicked
                          const details =
                            document.querySelector("details[open]");
                          if (details) details.removeAttribute("open");
                        }}
                      >
                        <Icon
                          name={item.iconSrc}
                          size={16}
                          className={isActive(item.href) ? "text-black" : "text-gray-500"}
                        />
                        {item.label && <span>{item.label}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
