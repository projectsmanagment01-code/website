export const siteConfig = {
  name: "Recipes website",
  domain: "recipeswebsite.com",
  url: "https://recipeswebsite.com",
  email: "contact@recipeswebsite.com",
  description: "Family-Friendly Recipes That Everyone Will Love",
  version: "V10.01",
  author: {
    name: "Mia",
    email: "mia@recipeswebsite.com",
  },
  social: {
    facebook: "https://web.facebook.com/profile.php?id=61555199463164",
    instagram: "https://www.pinterest.com/recipesbyclare",
    email: "mailto:contact@recipeswebsite.com",
  },
  copyright: {
    year: new Date().getFullYear(),
    text: "All rights reserved.",
  },
};

export const getCurrentYear = () => new Date().getFullYear();
export const getCopyrightText = () =>
  `${siteConfig.copyright.year} ${siteConfig.name}. ${siteConfig.copyright.text}`;
