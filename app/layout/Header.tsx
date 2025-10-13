import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { navigationItems, mobileNavigationItems } from "@/data/navigation";
import { siteConfig } from "@/config/site";
import Logo from "@/components/Logo";
import MobileNavigation from "./MobileNavigation";

interface HeaderProps {
  className?: string;
}

export default async function Header({ className }: HeaderProps) {
  // Get pathname from server-side headers
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const segments = pathname.split("/").filter(Boolean);

  const isAdmin = segments[segments.length - 1] === "admin";
  if (isAdmin) {
    return <></>;
  }

  return (
    <header
      className={`relative bg-white border-b border-gray-200 box-border w-full ${
        className || ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-4">
          {/* Desktop Navigation - Server-side rendered */}
          <ul className="items-center hidden lg:flex gap-x-8 ml-4">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  title={item.title}
                  className="relative text-gray-700 font-medium text-sm uppercase tracking-wide transition-all duration-300 hover:text-orange-700 hover:scale-105"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Logo - Right aligned with spacing */}
          <Link
            href="/"
            title={siteConfig.description}
            className="flex items-center flex-shrink-0 mr-4"
          >
            <Logo className="h-6 sm:h-7 lg:h-8 leading-none" />
          </Link>

          {/* Mobile Navigation */}
          <MobileNavigation mobileNavigationItems={mobileNavigationItems} />
        </nav>
      </div>
    </header>
  );
}
