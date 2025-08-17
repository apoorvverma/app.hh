import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export interface PlaceAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: { description: string; place_id: string; lat?: number; lng?: number }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  disabled,
  className,
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!value || !GOOGLE_MAPS_API_KEY) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    if (controller.current) controller.current.abort();
    controller.current = new AbortController();
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            value
          )}&key=${GOOGLE_MAPS_API_KEY}&types=geocode&language=en&components=&strictbounds=false`,
          { signal: controller.current?.signal }
        );
        const data = await res.json();
        setSuggestions(data.predictions || []);
      } catch (e) {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelect = async (suggestion: any) => {
    onSelect(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-56 overflow-auto">
          {suggestions.map((s, idx) => (
            <li
              key={s.place_id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${idx === active ? "bg-gray-100" : ""}`}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActive(idx)}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
