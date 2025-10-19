import React from "react";
import { getAdminSettings } from "@/lib/admin-settings";

// ---------- Icon Components ----------
const getIconComponent = (iconType: string) => {
  switch (iconType) {
    case "flame":
      return <FlameIcon />;
    case "chef":
      return <ChefIcon />;
    case "hand":
      return <HandIcon />;
    case "heart":
      return <HeartIcon />;
    case "star":
      return <StarIcon />;
    case "utensils":
      return <UtensilsIcon />;
    case "book":
      return <BookIcon />;
    case "home":
      return <HomeIcon />;
    case "coffee":
      return <CoffeeIcon />;
    case "cake":
      return <CakeIcon />;
    case "leaf":
      return <LeafIcon />;
    case "apple":
      return <AppleIcon />;
    case "wheat":
      return <WheatIcon />;
    case "fish":
      return <FishIcon />;
    case "pizza":
      return <PizzaIcon />;
    case "wine":
      return <WineIcon />;
    case "candy":
      return <CandyIcon />;
    case "soup":
      return <SoupIcon />;
    case "salad":
      return <SaladIcon />;
    case "ice-cream":
      return <IceCreamIcon />;
    default:
      return <FlameIcon />; // Default fallback
  }
};

// Standard icon styling
const iconClass = "h-12 w-12 md:h-10 md:w-10 text-gray-800";

// ---------- Icon Components ----------
const FlameIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M8.5 12.5a3.5 3.5 0 1 0 7 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M17 22a6.37 6.37 0 0 1-3.88-1.35L12 19l-1.12 1.65A6.37 6.37 0 0 1 7 22C4.24 22 2 19.76 2 17c0-3.72 2.78-6.85 6.35-8.14A7.48 7.48 0 0 1 12 4.64 7.48 7.48 0 0 1 15.65 8.86C19.22 10.15 22 13.28 22 17c0 2.76-2.24 5-5 5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const ChefIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M17 21v-8a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M3 21h14M7 21v-4M11 21v-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const HandIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v5M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8.5a1 1 0 0 1-1.4.9L3 14.9a1 1 0 0 0-1.3 1.3l3.6 4.8a8 8 0 0 0 6.4 3.2H15a8 8 0 0 0 8-8V9a2 2 0 0 0-2-2 2 2 0 0 0-2 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const UtensilsIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3ZM21 15v7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const CoffeeIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M10 2v2M14 2v2M4 21a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-13H4v13Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const CakeIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M2 21h20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M7 8v2M12 8v2M17 8v2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M10.2 6.5c.9-1.37 2.17-2.5 4.8-2.5a4.1 4.1 0 0 1 .5 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const WheatIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M2 12h6l4-9 4 9h6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M6 20v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const FishIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M18 12v.01M6.5 12a16 16 0 0 0-6.5 6M6.5 12a16 16 0 0 1-6.5-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const PizzaIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M15 11h.01M11 15h.01M16 16h.01M2 16l20-6-6 20c-1 1-1 1-2 1l-8-9c-1-1-1-1-1-2Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const WineIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M8 22h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M7 10h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M12 15v7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const CandyIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M9.5 7.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 0-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const SoupIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M17 21a1 1 0 0 0 1-1v-5.35a2 2 0 0 0 .5-.65L19 13a2 2 0 0 0 0-2l-.5-1a2 2 0 0 0-.5-.65V4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v5.35a2 2 0 0 0-.5.65L5 11a2 2 0 0 0 0 2l.5 1a2 2 0 0 0 .5.65V20a1 1 0 0 0 1 1Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M12 9v1M9 9v1M15 9v1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const SaladIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M7 21h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M12.5 8.5a2.5 2.5 0 0 0-2.4-2.4M15 6.5A2.5 2.5 0 0 0 12.5 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

const IceCreamIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={iconClass}>
    <path d="M7 11v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M13 11v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M7 11a5 5 0 0 1 10 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    <path d="M8 6a3 3 0 0 1 6 0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
  </svg>
);

// ---------- Component Definitions ----------
const StyledList = ({ children }: any) => (
  <ol className="list-[circle] pl-6 text-base md:text-lg text-left marker:text-black marker:font-normal marker:tabular-nums space-y-2">
    {children}
  </ol>
);

const AboutCard = ({ icon, title, children, position = "left" }: any) => {
  const isRight = position === "right";
  
  return (
    <li
      className={`col-span-1 md:col-span-11 ${isRight ? 'md:col-start-2' : 'md:col-start-1'} bg-stone-100 rounded-3xl overflow-hidden transition-all duration-300 outline outline-1 outline-dashed outline-black text-black w-full shadow-lg`}
      style={{ outlineOffset: "calc(-0.5rem)" }}
    >
      {/* Mobile Layout - Stack vertically with icon on top */}
      <div className="md:hidden">
        <div className="p-4 bg-stone-200 flex items-center justify-center">
          {icon}
        </div>
        <div className="p-6 gap-4 flex flex-col">
          <h2 className="text-xl font-semibold break-words">{title}</h2>
          <div className="break-words">
            {children}
          </div>
        </div>
      </div>
      
      {/* Desktop Layout - Side by side */}
      <div className={`hidden md:grid ${isRight ? 'grid-cols-[1fr_120px]' : 'grid-cols-[120px_1fr]'}`}>
        {!isRight && (
          <div className="p-6 bg-stone-200 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="p-6 gap-4 flex flex-col min-w-0">
          <h2 className="text-xl font-semibold break-words">{title}</h2>
          <div className="break-words overflow-wrap-anywhere">
            {children}
          </div>
        </div>
        {isRight && (
          <div className="p-6 bg-stone-200 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </li>
  );
};

// ---------- Main Component ----------
export default async function About() {
  const settings = await getAdminSettings();
  const aboutContent = settings.staticPages?.about;
  const aboutPageContent = settings.aboutPageContent;

  // If structured content exists in settings, use it
  if (aboutPageContent) {
    return (
      <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        {(aboutPageContent.heroTitle || aboutPageContent.heroSubtitle) && (
          <div className="text-center space-y-4 py-8">
            {aboutPageContent.heroTitle && (
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {aboutPageContent.heroTitle}
              </h1>
            )}
            {aboutPageContent.heroSubtitle && (
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                {aboutPageContent.heroSubtitle}
              </p>
            )}
          </div>
        )}

        {/* Cards Section */}
        <ul className="grid grid-cols-1 md:grid-cols-12 auto-rows-auto gap-8 p-0 w-full">
          {/* First Card */}
          <AboutCard
            icon={getIconComponent(aboutPageContent.recipesCardIcon || "flame")}
            title={aboutPageContent.recipesCardTitle || ""}
            position={aboutPageContent.recipesCardPosition || "left"}
          >
            <StyledList>
              {aboutPageContent.recipesCardItems?.map((item: string, index: number) => (
                <li key={index} className="break-words leading-relaxed">{item}</li>
              ))}
            </StyledList>
          </AboutCard>

          {/* Second Card */}
          <AboutCard 
            icon={getIconComponent(aboutPageContent.meetAuthorCardIcon || "chef")} 
            title={aboutPageContent.meetAuthorCardTitle || ""} 
            position={aboutPageContent.meetAuthorCardPosition || "right"}
          >
            <StyledList>
              {aboutPageContent.meetAuthorCardItems?.map((item: string, index: number) => (
                <li key={index} className="break-words leading-relaxed">{item}</li>
              ))}
            </StyledList>
          </AboutCard>

          {/* Third Card */}
          <AboutCard 
            icon={getIconComponent(aboutPageContent.missionCardIcon || "hand")} 
            title={aboutPageContent.missionCardTitle || ""} 
            position={aboutPageContent.missionCardPosition || "left"}
          >
            <StyledList>
              {aboutPageContent.missionCardItems?.map((item: string, index: number) => (
                <li key={index} className="break-words leading-relaxed">{item}</li>
              ))}
            </StyledList>
          </AboutCard>

          {/* Custom Sections */}
          {aboutPageContent.customSections?.map((section: any) => (
            <AboutCard
              key={section.id}
              icon={getIconComponent(section.icon || "flame")}
              title={section.title}
              position={section.position || "left"}
            >
              <StyledList>
                {section.items?.map((item: string, index: number) => (
                  <li key={index} className="break-words leading-relaxed">{item}</li>
                ))}
              </StyledList>
            </AboutCard>
          ))}
        </ul>
      </div>
    );
  }

  // If legacy content exists in settings, render it as HTML
  if (aboutContent && aboutContent.trim()) {
    return (
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: aboutContent }}
      />
    );
  }

  // Fallback to default content
  return (
    <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto px-4">
      <ul className="grid grid-cols-1 md:grid-cols-12 auto-rows-auto gap-8 p-0 w-full">
        <AboutCard
          icon={<FlameIcon />}
          title="What Will You Find on Recipes by Clare?"
          position="left"
        >
          <StyledList>
            <li className="break-words leading-relaxed">Time-tested family recipes that work every time</li>
            <li className="break-words leading-relaxed">Practical cooking tips from years of kitchen experience</li>
            <li className="break-words leading-relaxed">Personal stories behind favorite family dishes</li>
            <li className="break-words leading-relaxed">Kitchen wisdom for cooks of all skill levels</li>
          </StyledList>
        </AboutCard>

        <AboutCard icon={<ChefIcon />} title="Meet Clare" position="right">
          <StyledList>
            <li className="break-words leading-relaxed">A passionate home cook sharing tried-and-true recipes</li>
            <li className="break-words leading-relaxed">Creator of RecipesByClare.com</li>
            <li className="break-words leading-relaxed">Dedicated to making cooking accessible and enjoyable</li>
            <li className="break-words leading-relaxed">Bringing families together through shared meals</li>
          </StyledList>
        </AboutCard>

        <AboutCard icon={<HandIcon />} title="My Mission" position="left">
          <StyledList>
            <li className="break-words leading-relaxed">Help you feel confident in your kitchen</li>
            <li className="break-words leading-relaxed">Share reliable, delicious recipes for every occasion</li>
            <li className="break-words leading-relaxed">Create joyful cooking experiences</li>
            <li className="break-words leading-relaxed">Build a community of happy home cooks</li>
          </StyledList>
        </AboutCard>
      </ul>
    </div>
  );
}