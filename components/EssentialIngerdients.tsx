import { hasHtmlTags, renderSafeHtml } from "@/lib/utils";

export default function EssentialIngredients({
  essIngredientGuide,
}: {
  essIngredientGuide: any;
}) {
  return (
    <div className="rounded-lg p-4 shadow-sm border-2" style={{ 
      borderColor: '#3F7D58',
      background: 'linear-gradient(135deg, #E8F5EA 0%, #D4E6D7 100%)'
    }}>
      <h2
        className="
                          relative flex items-center
                          before:content-[''] before:rounded-2xl
                          before:w-[0.7rem] before:min-w-[0.7rem]
                          before:me-[0.7rem] 
                          before:self-stretch
                          text-[calc(var(--mo-font-size)*1.5)]
                          leading-[1.2]
                          font-bold
                          text-[2rem]
                          mb-3

                        "
        style={{ color: '#2D5A42' }}
      >
        <span className="w-[0.7rem] min-w-[0.7rem] me-[0.7rem] self-stretch rounded-2xl" style={{ backgroundColor: '#3F7D58' }}></span>
        Essential Ingredient Guide
      </h2>

      <div className="pt-1 rounded-lg">
        <ul className="list-none">
          {essIngredientGuide.map((item: any, index: any) => (
            <li
              key={index}
              className="mb-3 text-[19.2px] leading-relaxed text-gray-800 p-2 px-3 rounded-lg bg-white shadow-sm"
            >
              <span>
                {hasHtmlTags(item.ingredient) ? (
                  <span
                    dangerouslySetInnerHTML={renderSafeHtml(item.ingredient)}
                  />
                ) : (
                  <strong style={{ color: '#2D5A42' }}>{item.ingredient}:</strong>
                )}
              </span>{" "}
              {hasHtmlTags(item.note) ? (
                <span dangerouslySetInnerHTML={renderSafeHtml(item.note)} />
              ) : (
                item.note
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
