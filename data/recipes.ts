export interface Recipe {
  readonly id: string;
  readonly href: string;
  readonly title: string;
  readonly name: string;
  readonly alt: string;
  readonly imageSrc: string;
  readonly sizes: string;
  readonly description: string;
}

const RECIPE_SIZES =
  "(min-width: 1380px) 317px, (min-width: 780px) calc(2.24vw + 283px), (min-width: 380px) calc(100vw - 32px), calc(46.67vw + 160px)";

export const latestRecipes: Recipe[] = [
  {
    id: "honey-sesame-chicken-broccoli",
    href: "/recipes/honey-sesame-chicken-broccoli",
    title: "Honey Sesame Chicken and Broccoli - 30 Minute Meal",
    name: "Honey Sesame Chicken and Broccoli",
    alt: "Honey Sesame Chicken and Broccoli",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1753113321200-qrb53cbf.webp",
    sizes: RECIPE_SIZES,
    description:
      "Crispy chicken and tender broccoli coated in a sweet and savory honey sesame sauce, ready in 30 minutes.",
  },
  {
    id: "cheesy-stuffed-potato-cakes",
    href: "/recipes/cheesy-stuffed-potato-cakes",
    title: "Cheesy Stuffed Potato Cakes - Simple 2-Ingredient Recipe",
    name: "Cheesy Stuffed Potato Cakes",
    alt: "Easy Chicken Gyro Zucchini Roll",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1753093885667-ki8lksm8.webp",
    sizes: RECIPE_SIZES,
    description:
      "Golden crispy potato cakes with melted cheese centers, made from simple ingredients in just 30 minutes.",
  },
  {
    id: "biscuit-and-gravy-casserole",
    href: "/recipes/biscuit-and-gravy-casserole",
    title: "Easy Biscuit and Gravy Casserole Recipe",
    name: "Biscuit and Gravy Casserole",
    alt: "Biscuit and Gravy Casserole",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1752685153778-knutpaey.webp",
    sizes: RECIPE_SIZES,
    description:
      "Comfort food at its finest - layers of biscuits, sausage, and creamy gravy baked together for the perfect breakfast casserole.",
  },
  {
    id: "loaded-baked-potatoes-bacon-cheddar",
    href: "/recipes/loaded-baked-potatoes-bacon-cheddar",
    title: "Loaded Baked Potatoes with Bacon and Cheddar Cheese",
    name: "Loaded Baked Potatoes Bacon Cheddar",
    alt: "Loaded Baked Potatoes with Bacon and Cheddar",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1752574678712-3qgn0yqy.webp",
    sizes: RECIPE_SIZES,
    description:
      "Perfectly baked Russet potatoes topped with cheddar cheese, crispy bacon, sour cream, and fresh chives.",
  },
  {
    id: "grilled-seafood-boil-skewers",
    href: "/recipes/grilled-seafood-boil-skewers",
    title: "Grilled Seafood Boil Skewers with Crab Boil Garlic Butter",
    name: "Grilled Seafood Boil Skewers",
    alt: "Grilled Seafood Boil Skewers with Crab Boil Garlic Butter",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1752251109346-ru6655oa.webp",
    sizes: RECIPE_SIZES,
    description:
      "Southern-style grilled skewers with shrimp, sausage, potatoes, and corn basted in spicy crab boil garlic butter.",
  },
  {
    id: "philly-cheesesteak-grilled-cheese-casserole",
    href: "/recipes/philly-cheesesteak-grilled-cheese-casserole",
    title: "Philly Cheese Steak Grilled Cheese Casserole Recipe",
    name: "Philly Cheesesteak Grilled Cheese Casserole",
    alt: "Philly Cheese Steak Grilled Cheese Casserole",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1752163571663-kgzt4u4b.webp",
    sizes: RECIPE_SIZES,
    description:
      "All the flavors of a Philly cheesesteak sandwich transformed into an easy casserole with layers of bread and melted cheese.",
  },
  {
    id: "mozzarella-in-carrozza",
    href: "/recipes/mozzarella-in-carrozza",
    title: "Mozzarella in Carrozza - Italian Fried Mozzarella Sandwiches",
    name: "Mozzarella in Carrozza",
    alt: "Mozzarella in Carrozza (Italian Fried Mozzarella Sandwiches)",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1752162762852-6c1b22qi.webp",
    sizes: RECIPE_SIZES,
    description:
      "Traditional Italian fried mozzarella sandwiches with a crispy golden coating and perfectly melted cheese center.",
  },
  {
    id: "bacon-cheeseburger-grilled-cheese-casserole",
    href: "/recipes/bacon-cheeseburger-grilled-cheese-casserole",
    title: "Bacon Cheeseburger Grilled Cheese Casserole - Easy Family Dinner",
    name: "Bacon Cheeseburger Grilled Cheese Casserole",
    alt: "Bacon Cheeseburger Grilled Cheese Casserole",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1752161985766-2qkkw1w8.webp",
    sizes: RECIPE_SIZES,
    description:
      "The ultimate comfort food mashup with layers of bread, cheeseburger filling, and melted cheese baked to golden perfection.",
  },
] as const;
