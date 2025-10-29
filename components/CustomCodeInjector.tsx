"use client";

import { useEffect } from "react";
import { adminFetch } from '@/lib/admin-fetch';

export default function CustomCodeInjector() {
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminFetch("/api/admin/settings");
        if (response.ok) {
          const settings = await response.json();
          const htmlStrings = settings.header?.html || [];

          htmlStrings.forEach((htmlString: string) => {
            if (htmlString && htmlString.trim()) {
              const temp = document.createElement("template");
              temp.innerHTML = htmlString.trim();

              Array.from(temp.content.childNodes).forEach((node) => {
                document.head.appendChild(node);
              });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching custom code settings:", error);
      }
    };

    fetchSettings();
  }, []);

  return null; // nothing rendered in React tree
}
