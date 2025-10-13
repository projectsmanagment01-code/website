import { TipCard } from "./TipCard";
import { hasHtmlTags, renderSafeHtml } from "@/lib/utils";

export default function CompleteCookingProcess({
  completeProcess,
}: {
  completeProcess: any;
}) {
  return (
    <div>
      <h2
        className="
          relative flex items-center
          before:content-[''] before:rounded-2xl
          before:w-[0.7rem] before:min-w-[0.7rem]
          before:me-[0.7rem] before:bg-[var(--mo-article-any)]
          before:self-stretch
          text-[calc(var(--mo-font-size)*1.5)]
          leading-[1.2]
          font-bold
          text-[2rem]
          m-4
          ml-0
        "
      >
        Complete Cooking Process
      </h2>

      <div className=" pt-2 space-y-6">
        <ul className="space-y-4">
          {completeProcess.map((step: any, index: number) => {
            // Handle Card-type items separately
            if (step.type === "Card") {
              return (
                <TipCard
                  key={`complete-process-card-${index}`}
                  title={step.title}
                  items={step.items}
                  after={step.after}
                />
              );
            }

            // Handle normal process items
            return (
              <div key={`complete-process-step-${index}`} className="block">
                <span
                  className="font-sans font-bold text-xl"
                  style={{
                    fontFamily: "system-ui",
                    fontWeight: "var(--font-weight-extrabold)",
                  }}
                >
                  {step.title ?? step.section}:
                </span>{" "}
                
                {/* Render items array if it exists, otherwise fall back to description */}
                {step.items && Array.isArray(step.items) ? (
                  <ul className="mt-2 space-y-2">
                    {step.items.map((item: string, itemIndex: number) => (
                      <li 
                        key={`step-${index}-item-${itemIndex}`} 
                        className="text-gray-700 leading-relaxed text-[19.2px] list-disc ml-6"
                      >
                        {hasHtmlTags(item) ? (
                          <span dangerouslySetInnerHTML={renderSafeHtml(item)} />
                        ) : (
                          item
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className=" text-gray-700 leading-relaxed block text-[19.2px]">
                    {hasHtmlTags(step.description) ? (
                      <span
                        dangerouslySetInnerHTML={renderSafeHtml(step.description)}
                      />
                    ) : (
                      step.description
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
