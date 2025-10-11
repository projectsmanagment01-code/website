export interface TrendingRecipe {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly name: string;
  readonly alt: string;
  readonly imageSrc: string;
  readonly sizes: string;
}

const TRENDING_SIZES =
  "(min-width: 780px) 300px, (min-width: 700px) calc(50vw - 29px), 291px";

export const trendingRecipes: TrendingRecipe[] = [
  {
    id: "easy-maple-bacon-cinnamon-rolls",
    href: "/recipes/easy-maple-bacon-cinnamon-rolls",
    title: "Easy Maple Bacon Cinnamon Rolls with Candied Bacon",
    name: "Easy Maple Bacon Cinnamon Rolls",
    alt: "Easy Maple Bacon Cinnamon Rolls",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1752144103556-tsizifxz.webp",
    sizes: TRENDING_SIZES,
  },
  {
    id: "easy-chicken-broccoli-baked-alfredo",
    href: "/recipes/easy-chicken-broccoli-baked-alfredo",
    title: "Easy Chicken and Broccoli Baked Alfredo Recipe - Comfort Food",
    name: "Chicken Broccoli Baked Alfredo",
    alt: "Chicken and Broccoli Baked Alfredo",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1751912584874-vd6x89wi.webp",
    sizes: TRENDING_SIZES,
  },
  {
    id: "shrimp-crab-nacho-corn-dogs",
    href: "/recipes/shrimp-crab-nacho-corn-dogs",
    title: "Shrimp and Crab Nacho Bomb Corn Dogs - Crispy Seafood Appetizer",
    name: "Shrimp Crab Nacho Corn Dogs",
    alt: "Shrimp and Crab Nacho Bomb Corn Dogs",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1751629759104-m73sg0qa.webp",
    sizes: TRENDING_SIZES,
  },
  {
    id: "cheesy-ham-potato-casserole",
    href: "/recipes/cheesy-ham-potato-casserole",
    title: "Cheesy Ham and Potato Casserole Recipe - Comfort Food Classic",
    name: "Cheesy Ham Potato Casserole",
    alt: "Cheesy Ham & Potato Casserole",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1751540539273-bnafuyun.webp",
    sizes: TRENDING_SIZES,
  },
  {
    id: "cheesy-sloppy-joe-garlic-toast",
    href: "/recipes/cheesy-sloppy-joe-garlic-toast",
    title: "Cheesy Sloppy Joe Garlic Toast Recipe - Easy Open-Faced Sandwich",
    name: "Cheesy Sloppy Joe Garlic Toast",
    alt: "Cheesy Sloppy Joe Garlic Toast",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1751477075471-lwf5tpyr.webp",
    sizes: TRENDING_SIZES,
  },
  {
    id: "cheese-crusted-hawaiian-grilled-cheese",
    href: "/recipes/cheese-crusted-hawaiian-grilled-cheese",
    title:
      "Cheese Crusted Hawaiian Grilled Cheese Recipe - Crispy Outside, Gooey Inside",
    name: "Cheese Crusted Hawaiian Grilled Cheese",
    alt: "Cheese Crusted Hawaiian Grilled Cheese",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1751361270311-3u2fpz4a.webp",
    sizes: TRENDING_SIZES,
  },
] as const;
