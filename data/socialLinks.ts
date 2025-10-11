export interface SocialLink {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly iconSrc: string;
}

export const socialLinks: SocialLink[] = [
  {
    id: "facebook",
    href: "https://web.facebook.com/profile.php?id=61555199463164",
    title: "Facebook",
    iconSrc: "https://c.animaapp.com/mer35j4wJPAxku/assets/icon-19.svg",
  },
  {
    id: "instagram",
    href: "https://www.pinterest.com/recipesbyclare",
    title: "Pinterest",
    iconSrc: "https://c.animaapp.com/mer35j4wJPAxku/assets/icon-20.svg",
  },
  {
    id: "email",
    href: "mailto://contact@recipesbyclare.com",
    title: "Email",
    iconSrc: "https://c.animaapp.com/mer35j4wJPAxku/assets/icon-21.svg",
  },
] as const;
