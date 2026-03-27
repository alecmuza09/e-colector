import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}

const SIZE_MAP = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  count,
}) => {
  const [hovered, setHovered] = useState(0);
  const iconClass = SIZE_MAP[size];
  const effective = hovered || value;

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${!readonly ? 'hover:scale-110' : ''} focus:outline-none`}
            aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={`${iconClass} transition-colors ${
                star <= effective
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
      {showValue && value > 0 && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-0.5">
          {value.toFixed(1)}
          {count !== undefined && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1">
              ({count})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
