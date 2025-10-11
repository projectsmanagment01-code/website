module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Standardized responsive breakpoints (aligned with Tailwind defaults)
    screens: {
      sm: "640px",   // Small devices (tablets)
      md: "768px",   // Medium devices (tablets landscape)
      lg: "1024px",  // Large devices (desktops)
      xl: "1280px",  // Extra large devices
      "2xl": "1536px", // 2X large devices
    },
    extend: {
      // Standardized container sizes for consistent layout foundation
      maxWidth: {
        'container-sm': '768px',   // 48rem - narrow content
        'container-md': '1024px',  // 64rem - default content width
        'container-lg': '1152px',  // 72rem - wide content layouts  
        'container-xl': '1280px',  // 80rem - maximum content width
      },
      // Consistent spacing scale for vertical rhythm
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
        '38': '9.5rem',   // 152px
      },
      // Standardized section spacing
      padding: {
        'section-sm': '2rem',     // 32px
        'section-md': '3rem',     // 48px  
        'section-lg': '4rem',     // 64px
        'section-xl': '6rem',     // 96px
      },
      margin: {
        'section-sm': '2rem',     // 32px
        'section-md': '3rem',     // 48px
        'section-lg': '4rem',     // 64px
        'section-xl': '6rem',     // 96px
      }
    },
  },
  plugins: [],
};
