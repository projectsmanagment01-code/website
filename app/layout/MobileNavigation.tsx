"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { NavigationItem } from "@/outils/types";

interface MobileNavigationProps {
  mobileNavigationItems: NavigationItem[];
}

export default function MobileNavigation({ mobileNavigationItems }: MobileNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleMobileMenuClose = () => {
    const details = document.querySelector("details[open]");
    if (details) details.removeAttribute("open");
  };

  return (
    <details className="lg:hidden relative flex-shrink-0 ml-auto">
      <summary
        aria-label="Toggle Mobile Menu"
        className="list-none cursor-pointer inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
      >
        <Icon name="menu" size={24} className="text-gray-700 hover:text-orange-700 transition-colors duration-200" />
      </summary>

      <div className="fixed inset-0 bg-white z-50 flex flex-col">
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

        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col p-6 gap-y-1">
            {mobileNavigationItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  title={item.title}
                  className={`flex items-center gap-x-3 px-4 py-3 rounded-md transition-colors text-base ${
                    isActive(item.href)
                      ? "bg-gray-100 text-black font-medium"
                      : "text-gray-700 hover:bg-gray-50 hover:text-orange-700"
                  }`}
                  onClick={handleMobileMenuClose}
                >
                  <Icon
                    name={item.iconSrc || ""}
                    size={16}
                    className={isActive(item.href) ? "text-black" : "text-gray-500"}
                  />
                  {item.label && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}