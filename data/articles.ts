import { Article } from "@/outils/types";

const ARTICLE_SIZES =
  "(min-width: 1380px) 317px, (min-width: 780px) calc(2.24vw + 283px), (min-width: 380px) calc(100vw - 32px), calc(46.67vw + 160px)";

const latestArticles: Article[] = [
  {
    id: "pecan-pie-cheesecake",
    href: "/articles/pecan-pie-cheesecake",
    title: "Pecan Pie Cheesecake - Ultimate Holiday Dessert Recipe",
    name: "Pecan Pie Cheesecake",
    alt: "Pecan Pie Cheesecake",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1737383022522-ejw3zor2.webp",
    sizes: ARTICLE_SIZES,
    imageClassName:
      "aspect-[auto_1024_/_1024] bg-stone-100 box-border h-full max-w-full object-cover w-full",
    description:
      "This Pecan Pie Cheesecake combines the richness of cheesecake with the caramelized nutty topping of pecan pie—a perfect holiday dessert!",
  },
  {
    id: "easy-fruity-marshmallow-fudge-recipe",
    href: "/articles/easy-fruity-marshmallow-fudge-recipe",
    title: "Easy Fruity Marshmallow Fudge - Colorful & Fun Treat Recipe",
    name: "Fruity Marshmallow Fudge",
    alt: "Easy Fruity Marshmallow Fudge",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1737383092744-vrnmpnlv.webp",
    sizes: ARTICLE_SIZES,
    imageClassName:
      "aspect-[auto_928_/_1232] bg-stone-100 box-border h-full max-w-full object-cover w-full",
    description:
      "A colorful, fruity marshmallow fudge with creamy white chocolate, perfect for parties or as a fun snack.",
  },
  {
    id: "lasagna-soup",
    href: "/articles/lasagna-soup",
    title: "Lasagna Soup Recipe – Hearty & Comforting Italian Soup",
    name: "Lasagna Soup",
    alt: "Lasagna Soup",
    imageSrc:
      "https://c.animaapp.com/mer35j4wJPAxku/assets/1737383052826-w2rso1ch.webp",
    sizes: ARTICLE_SIZES,
    imageClassName:
      "aspect-[auto_928_/_1232] bg-stone-100 box-border h-full max-w-full object-cover w-full",
    description:
      "Lasagna Soup combines the flavors of classic lasagna in a warm, hearty soup. It's topped with a blend of ricotta, mozzarella, and Parmesan for a rich, comforting meal.",
  },
] as const;

export default latestArticles;
