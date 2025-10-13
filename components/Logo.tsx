import Image from "next/image";

interface LogoSettings {
  logoType: "text" | "image";
  logoText: string;
  logoImage: string;
  logoTagline: string;
}

interface LogoProps {
  className?: string;
}

// Server-side function to fetch logo settings
async function getLogoSettings(): Promise<LogoSettings> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/content/site`, {
      cache: 'force-cache'
    });
    const data = await response.json();
    return {
      logoType: data.logoType || "text",
      logoText: data.logoText || "",
      logoImage: data.logoImage || "",
      logoTagline: data.logoTagline || "",
    };
  } catch (error) {
    console.warn("Failed to load logo settings:", error);
    return {
      logoType: "text",
      logoText: "",
      logoImage: "",
      logoTagline: ""
    };
  }
}

export default async function Logo({ className }: LogoProps) {
  const logoSettings = await getLogoSettings();

  // Don't render anything if no content
  if (!logoSettings.logoText && !logoSettings.logoImage) {
    return <div className={`${className} min-h-[2rem]`}></div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Priority: Image first, then text fallback */}
      {logoSettings.logoImage ? (
        <>
          <div className="w-10 h-10 relative overflow-hidden rounded-lg">
            <Image
              src={logoSettings.logoImage}
              alt={logoSettings.logoText || "Logo"}
              fill
              className="object-cover"
              priority={true} // Load logo with high priority
              sizes="40px"
            />
          </div>
          {logoSettings.logoText && (
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">
                {logoSettings.logoText}
              </span>
              {logoSettings.logoTagline && (
                <span className="text-xs text-gray-600 -mt-1">
                  {logoSettings.logoTagline}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        // Text Logo fallback when no image
        <div className="flex flex-col">
          <span 
            className="font-bold text-gray-900 leading-none"
            style={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              letterSpacing: "-0.025em",
            }}
          >
            {logoSettings.logoText}
          </span>
          <span 
            className="text-xs text-gray-500 font-medium uppercase tracking-wider leading-none mt-0.5"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
            }}
          >
            {logoSettings.logoTagline}
          </span>
        </div>
      )}
    </div>
  );
}
