import React from "react";
import { Metadata } from "next";

const FAQSection = ({ title, questions }: any) => (
  <div className="space-y-6 mb-12">
    <div className="flex items-center justify-between uppercase">
      <h2
        className="text-neutral-900 text-[24.96px] font-bold items-center box-border flex basis-[0%] grow leading-[29.952px] md:text-[36.48px] md:leading-[43.776px] after:accent-auto after:bg-zinc-200 after:box-border after:text-neutral-900 after:block after:basis-[0%] after:grow after:text-[24.96px] after:not-italic after:normal-nums after:font-bold after:h-1.5 after:tracking-[normal] after:leading-[29.952px] after:list-outside after:list-disc after:min-w-4 after:outline-dashed after:outline-1 after:text-start after:indent-[0px] after:uppercase after:visible after:w-full after:ml-4 after:rounded-lg after:border-separate after:font-system_ui after:md:text-[36.48px] after:md:leading-[43.776px]
                          before:bg-zinc-200 before:box-border before:text-neutral-900 before:block before:basis-[0%] before:grow before:text-[24.96px] before:not-italic before:normal-nums before:font-bold before:h-1.5 before:tracking-[normal] before:leading-[29.952px] before:list-outside before:list-disc before:min-w-4 before:outline-dashed before:outline-1 before:text-start before:indent-[0px] before:uppercase before:visible before:w-full before:mr-4 before:rounded-lg before:border-separate before:font-system_ui before:md:text-[36.48px] before:md:leading-[43.776px]
          "
      >
        {title}
      </h2>
    </div>
    <div className="space-y-4 w-full flex flex-col">
      {questions.map((faq: any, index: any) => (
        <details
          key={index}
          className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-600 text-gray-600"
        >
          <summary className="text-xl font-medium cursor-pointer hover:text-gray-800 transition-colors">
            {faq.question}
          </summary>
          <div className="mt-6">
            <p className="text-base leading-relaxed">{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  </div>
);

// Function to get FAQ data for metadata (moved to page level)
// This function is now only used for type reference
interface FAQData {
  heroTitle: string;
  heroIntro: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
}

export default function Component({ faqData }: { faqData: FAQData }) {

  // If content exists and is HTML, render it directly
  if (faqData.content && faqData.content.trim() && faqData.content.includes('<')) {
    return (
      <div className="w-full mx-auto">
        {/* Hero Section */}
        <div className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden py-8 pr-8 pl-4 shadow-lg mb-12">
          <div className="text-center mb-12">
            <h1 className="text-[2.28rem] font-bold text-black mb-4">
              {faqData.heroTitle}
            </h1>
            <p className="text-lg text-black max-w-3xl mx-auto">
              {faqData.heroIntro}
            </p>
          </div>
          <div 
            className="max-w-4xl mx-auto"
            dangerouslySetInnerHTML={{ __html: faqData.content }}
          />
        </div>
      </div>
    );
  }

  // Fallback to default FAQ content with hero section
  const defaultFaqData = [
    {
      title: "Cooking and Recipes",
      questions: [
        {
          question: "How can I adjust a recipe for more or fewer servings?",
          answer:
            "Each recipe on our site specifies the number of servings. You can easily adjust the ingredients to suit your needs. Remember to modify cooking times if necessary!",
        },
        {
          question: "Can I substitute ingredients in the recipes?",
          answer:
            "Absolutely! Cooking is all about creativity. If you're missing an ingredient, we often include suggested substitutions in the recipe notes.",
        },
        {
          question: "Do you provide nutritional information for recipes?",
          answer:
            "Not all recipes include nutritional details yet, but we're working on adding more. Stay tuned for updates!",
        },
        {
          question: "How do I know if a recipe is kid-friendly?",
          answer:
            'We tag recipes with "Kid-Friendly" to make it easy to find dishes your little ones will love.',
        },
        {
          question: "Can I submit my own recipe to the site?",
          answer:
            "We don't currently accept recipe submissions, but we'd love to hear your ideas! Feel free to reach out via our contact page.",
        },
      ],
    },
    {
      title: "Meal Planning",
      questions: [
        {
          question: "Do you offer meal plans?",
          answer:
            "We don't provide full meal plans, but our recipe collections can help you plan meals for any occasion, from breakfast to dinner.",
        },
        {
          question: "What are the most popular recipe categories?",
          answer:
            'Our most-loved categories include "Dinner Favorites," "Quick Weeknight Meals," and "Desserts." Check them out for crowd-pleasers!',
        },
        {
          question: "How can I find vegan or gluten-free recipes?",
          answer:
            'Use the search bar to find recipes tailored to your dietary needs. Simply type "vegan" or "gluten-free" to see all available options.',
        },
        {
          question: "Do you have seasonal recipes?",
          answer:
            "Yes! We regularly update our site with recipes featuring fresh, in-season ingredients to help you make the most of what's available.",
        },
        {
          question: 'What are "Clare\'s Favorite Recipes"?',
          answer:
            "These are handpicked dishes chosen by Clare herself, showcasing her personal favorites to inspire your cooking.",
        },
      ],
    },
    {
      title: "Cooking Tips and Techniques",
      questions: [
        {
          question: "How can I ensure my baked goods turn out well?",
          answer:
            "Follow the recipe closely, use the recommended tools, and measure ingredients accurately. Baking is all about precision!",
        },
        {
          question: "What is the best way to store leftovers?",
          answer:
            "Store leftovers in airtight containers and refrigerate within 2 hours of cooking. Most dishes keep well for up to 3 days, or longer if frozen.",
        },
        {
          question: "Can I freeze the recipes?",
          answer:
            "Many of our recipes are freezer-friendly. Check the recipe instructions for tips on freezing and reheating.",
        },
        {
          question: "Do you have tips for beginner cooks?",
          answer:
            'Yes! Start with our "Easy Recipes" collection, which includes simple dishes to help build your confidence in the kitchen.',
        },
        {
          question: "What's the best way to cook pasta to perfection?",
          answer:
            "Always cook pasta in boiling salted water and follow the package instructions. Test for an al dente texture before draining.",
        },
      ],
    },
    {
      title: "Website Features",
      questions: [
        {
          question: "Do I need to create an account to use the site?",
          answer:
            "No, an account isn't required! You can browse, save, and print recipes without signing up.",
        },
        {
          question: "How often do you add new recipes?",
          answer:
            "We add fresh recipes regularly! Check back often or subscribe to our newsletter for updates.",
        },
        {
          question: "Can I save my favorite recipes?",
          answer:
            "Yes! Bookmark your favorite recipes or print them for easy access later.",
        },
        {
          question: "How can I contact you?",
          answer:
            "You can reach us via the contact page. We're always happy to assist or hear your feedback.",
        },
        {
          question: "Can I share recipes from your site on social media?",
          answer:
            "Of course! We encourage sharing but ask that you credit us when you do.",
        },
      ],
    },
  ];

  return (
    <div className="w-full mx-auto">
      {/* Hero Section */}
      <div className="bg-stone-100 box-border border border-dashed border-black rounded-[40px] overflow-hidden py-8 pr-8 pl-4 shadow-lg mb-12">
        <div className="text-center mb-12">
          <h1 className="text-[2.28rem] font-bold text-black mb-4">
            {faqData.heroTitle}
          </h1>
          <p className="text-lg text-black max-w-3xl mx-auto">
            {faqData.heroIntro}
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="my-12 space-y-12 flex flex-col">
            {defaultFaqData.map((section, index) => (
              <FAQSection
                key={index}
                title={section.title}
                questions={section.questions}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
