import React from "react";
import { X, Search } from "lucide-react";

export default function SearchBox() {
  return (
    <div
      id="search"
      className="
        bg-[#f1f1f1] text-[#0b0a0a]
        p-2 
        rounded-lg outline outline-1 outline-dashed outline-[#141413]
        transition-all duration-300
      "
    >
      <form className="flex items-center w-full">
        {/* Input */}
        <div className="flex items-center h-[42px] flex-1 border-none">
          <input
            id="gsc-i-id1"
            name="search"
            type="text"
            autoComplete="off"
            aria-label="Rechercher"
            className="
              w-full h-auto 
              bg-white border border-gray-300 text-base
              placeholder-gray-500
            "
          />
        </div>

        {/* Clear button (hidden by default, show when text entered) */}
        <button
          type="button"
          className="
            hidden text-[#c64118] font-bold
            ml-2 hover:underline
          "
        >
          <X size={18} />
        </button>

        {/* Search button */}
        <button
          type="submit"
          className="

        border border-[#333] rounded-sm
        bg-[#333] text-[#0b0a0a]
        cursor-pointer select-none
        align-middle
        flex items-center justify-center
        transition-colors duration-200
        hover:bg-[#444]
        h-[1.5rem]
        w-[3rem]
        ml-[0.5rem]
      "
          aria-label="Rechercher"
        >
          <Search className="bg-[#141413] text-white" size={14} />
        </button>
      </form>
    </div>
  );
}
