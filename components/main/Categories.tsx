import { Category } from "@/outils/types";
import React from "react";

export default function Categories({ categories }: any) {
  return (
    <div className="bg-white text-black mt-4 ">
      <div className="flex flex-col gap-12">
        {/* Header */}
        <div className="flex items-center justify-between uppercase">
          <h2
            className="text-neutral-900 text-[24.96px] font-bold items-center box-border flex basis-[0%] grow leading-[29.952px] md:text-[36.48px] md:leading-[43.776px] after:accent-auto after:bg-zinc-200 after:box-border after:text-neutral-900 after:block after:basis-[0%] after:grow after:text-[24.96px] after:not-italic after:normal-nums after:font-bold after:h-1.5 after:tracking-[normal] after:leading-[29.952px] after:list-outside after:list-disc after:min-w-4 after:outline-dashed after:outline-1 after:text-start after:indent-[0px] after:uppercase after:visible after:w-full after:ml-4 after:rounded-lg after:border-separate after:font-system_ui after:md:text-[36.48px] after:md:leading-[43.776px]
                          before:bg-zinc-200 before:box-border before:text-neutral-900 before:block before:basis-[0%] before:grow before:text-[24.96px] before:not-italic before:normal-nums before:font-bold before:h-1.5 before:tracking-[normal] before:leading-[29.952px] before:list-outside before:list-disc before:min-w-4 before:outline-dashed before:outline-1 before:text-start before:indent-[0px] before:uppercase before:visible before:w-full before:ml-4 before:rounded-lg before:border-separate before:font-system_ui before:md:text-[36.48px] before:md:leading-[43.776px]
          "
          >
            All categories
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any, index: any) => (
            <div key={index} className="group">
              <a
                href={category.href}
                title={category.description}
                className="block relative overflow-hidden rounded-xl h-40 no-underline transform transition-transform duration-300 hover:scale-105"
              >
                <img
                  className="w-full h-full object-cover object-left-center bg-stone-100 transition-transform duration-300 group-hover:scale-110"
                  height={160}
                  width={372}
                  alt={category.alt}
                  src={category.image}
                  loading="lazy"
                />
                <span
                  className="absolute bottom-0 left-4 text-xl font-black text-black"
                  style={{
                    textShadow:
                      "-1px -1px 0 #f6f5f3, 1px -1px 0 #f6f5f3, -1px 1px 0 #f6f5f3, 1px 1px 0 #f6f5f3",
                  }}
                >
                  {category.title}
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
