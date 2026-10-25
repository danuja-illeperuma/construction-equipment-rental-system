import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

export const EquipmentFilter = ({
  search = '',
  onSearchChange,
  selectedCategory = '',
  onCategoryChange,
  selectedStatus = '',
  onStatusChange,
  categories = [],
  onReset,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center">
      {/* Search Input */}
      <div className="flex-1 w-full relative">
        <Input
          placeholder="Search by equipment name, code, brand, model..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={Search}
          className="w-full"
        />
      </div>

      {/* Select Category */}
      <div className="w-full md:w-52 shrink-0">
        <Select
          placeholder="All Categories"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={categories.map((c) => ({
            value: c.categoryId,
            label: c.categoryName,
          }))}
        />
      </div>

      {/* Select Status */}
      {onStatusChange && (
        <div className="w-full md:w-44 shrink-0">
          <Select
            placeholder="All Statuses"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { value: 'AVAILABLE', label: 'AVAILABLE' },
              { value: 'RENTED', label: 'RENTED' },
              { value: 'MAINTENANCE', label: 'MAINTENANCE' },
            ]}
          />
        </div>
      )}

      {/* Reset button */}
      {onReset && (search || selectedCategory || selectedStatus) && (
        <Button
          variant="ghost"
          size="sm"
          icon={X}
          onClick={onReset}
          className="text-slate-500 shrink-0"
        >
          Reset
        </Button>
      )}
    </div>
  );
};

export default EquipmentFilter;
