
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectInputProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  disabled = false,
}) => {
  return (
    <div className="relative group w-full">
      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
            transition-all font-medium appearance-none
            ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'text-slate-700'}
          `}
          disabled={disabled}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default SelectInput;
