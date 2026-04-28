import React from "react";
import { PixelIcon } from "./PixelIcon";

interface PixelCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

// кастомный бруталистский чекбокс. теперь с нормальной галочкой.
export function PixelCheckbox({ checked, onChange, label }: PixelCheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div 
        onClick={() => onChange(!checked)}
        className={`
          w-6 h-6 border-4 border-black transition-colors flex items-center justify-center
          ${checked ? "bg-[#00FA9A]" : "bg-white"}
          group-hover:border-[#7FFF00]
        `}
      >
        {checked && (
          <div className="w-5 h-5">
            <PixelIcon.Check />
          </div>
        )}
      </div>
      {label && <span className="font-bold uppercase text-sm tracking-tighter">{label}</span>}
    </label>
  );
}
