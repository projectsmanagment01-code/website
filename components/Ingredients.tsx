import Ingredient from "./Ingredient";
import Recipe from "@/outils/types";
import { hasHtmlTags, renderSafeHtml } from "@/lib/utils";

const IngredientsList = ({
  ingredients,
}: {
  ingredients: Recipe["ingredients"];
}) => {
  return (
    <div
      id="recipe-ingredients"
      className="recipe__interact-list space-y-3 mb-8"
    >
      {ingredients?.map((ingredientGroup: any, index: any) => (
        <div key={index} className="mb-4">
          <h4 className="text-xl font-bold text-black mb-2">
            {hasHtmlTags(ingredientGroup.section) ? (
              <span
                dangerouslySetInnerHTML={renderSafeHtml(
                  ingredientGroup.section
                )}
              />
            ) : (
              ingredientGroup.section
            )}
          </h4>
          <ul className="space-y-2">
            {ingredientGroup.items.map((ingredient: any, itemIndex: any) => (
              <Ingredient key={itemIndex} ingredient={ingredient} index={itemIndex} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default IngredientsList;
