"use client";
import { useState } from "react";
import { hasHtmlTags, renderSafeHtml, getItemText } from "@/lib/utils";

const Ingredient = ({ ingredient, index: itemIndex }: any) => {
  const [clicked, setClicked] = useState(false);
  const ingredientText = getItemText(ingredient);

  return (
    <>
      <li key={itemIndex} className="flex items-start">
        <span
          onClick={() => setClicked(!clicked)}
          className={`text-white relative rounded-full px-4 py-2 text-base font-bold mr-6 cursor-pointer whitespace-nowrap select-none transition-all duration-500 min-w-[48px] text-center ${
            clicked
              ? " shadow-[0px_0_0_rgba(128,128,128,0.25)]  left-0 line-through"
              : " left-3  shadow-[-13px_0_0_rgba(63,125,88,0.25)]"
          }`}
          style={{ 
            background: clicked ? '#6B7280' : 'linear-gradient(135deg, #3F7D58 0%, #2D5A42 100%)'
          }}
        >
          {String(itemIndex + 1).padStart(2, "0")}
        </span>
        <span
          className={`recipe__interact-list-content text-black flex-1 leading-relaxed text-[19.2px] ${
            clicked ? "line-through" : ""
          }`}
        >
          {hasHtmlTags(ingredientText) ? (
            <span dangerouslySetInnerHTML={renderSafeHtml(ingredientText)} />
          ) : (
            ingredientText
          )}
        </span>
      </li>
    </>
  );
};

export default Ingredient;
