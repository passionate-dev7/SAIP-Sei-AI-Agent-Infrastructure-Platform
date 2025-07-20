import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface TemplateFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  onClearFilters: () => void;
}

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  selectedTags,
  onTagToggle,
  availableTags,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedCategory !== 'all' || selectedTags.length > 0 || priceRange[1] < 1000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category}
                checked={selectedCategory === category}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="rounded border-input"
              />
              <span className="text-sm capitalize">{category.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Price Range</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={priceRange[0] === 0 && priceRange[1] === 0}
              onChange={() => onPriceRangeChange([0, 0])}
              className="rounded border-input"
            />
            <span className="text-sm">Free only</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={priceRange[0] === 0 && priceRange[1] === 1000}
              onChange={() => onPriceRangeChange([0, 1000])}
              className="rounded border-input"
            />
            <span className="text-sm">All prices</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="price"
              checked={priceRange[0] === 0 && priceRange[1] === 50}
              onChange={() => onPriceRangeChange([0, 50])}
              className="rounded border-input"
            />
            <span className="text-sm">Under $50</span>
          </label>
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Tags</h4>
        <div className="flex flex-wrap gap-1">
          {availableTags.slice(0, 12).map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div>
          <h4 className="text-sm font-medium mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-1">
            {selectedCategory !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategory}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => onCategoryChange('all')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            {selectedTags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => onTagToggle(tag)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateFilters;