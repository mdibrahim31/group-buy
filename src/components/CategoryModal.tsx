import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Search, ChevronDown, ChevronUp, Folder, Check } from 'lucide-react';
import { Category } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryName: string) => void;
  selectedCategoryName?: string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  selectedCategoryName = 'সব',
}) => {
  const { categoryObjects } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({
    'Bag & Shoes': true,
    'Apparel & Accessories': true,
    'Electric Equipment Component & Telecom': false,
  });

  if (!isOpen) return null;

  const toggleExpand = (parentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedParents(prev => ({
      ...prev,
      [parentName]: !prev[parentName],
    }));
  };

  // Group categoryObjects by parentCategory or top level
  const groupedCategories: { parent: string; items: Category[] }[] = [];
  const parentMap: Record<string, Category[]> = {};

  categoryObjects.forEach(cat => {
    const parent = cat.parentCategory || 'সাধারণ ক্যাটাগরি';
    if (!parentMap[parent]) parentMap[parent] = [];
    parentMap[parent].push(cat);
  });

  Object.keys(parentMap).forEach(parent => {
    groupedCategories.push({
      parent,
      items: parentMap[parent],
    });
  });

  // Filter based on search query
  const cleanSearch = searchQuery.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-white">
          <h3 className="text-lg font-black text-stone-900 tracking-tight">
            Product Category <span className="text-xs font-normal text-stone-500">(পণ্যের ক্যাটাগরি)</span>
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-4 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Product Category খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-600/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all font-medium placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Category List */}
        <div className="p-2 sm:p-4 overflow-y-auto flex-1 divide-y divide-stone-100">
          
          {/* 'All Categories' Option */}
          <button
            onClick={() => {
              onSelectCategory('সব');
              onClose();
            }}
            className={`w-full py-3 px-4 rounded-xl text-left font-bold text-sm flex items-center justify-between transition-all cursor-pointer ${
              selectedCategoryName === 'সব'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'hover:bg-stone-50 text-stone-800'
            }`}
          >
            <span>সব ক্যাটাগরি (All Products)</span>
            {selectedCategoryName === 'সব' && <Check className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Grouped Expandable Categories */}
          {groupedCategories.map(group => {
            const isExpanded = !!expandedParents[group.parent] || !!cleanSearch;
            const filteredItems = group.items.filter(item =>
              !cleanSearch ||
              item.name.toLowerCase().includes(cleanSearch) ||
              group.parent.toLowerCase().includes(cleanSearch)
            );

            if (cleanSearch && filteredItems.length === 0) return null;

            return (
              <div key={group.parent} className="py-2">
                {/* Parent Header */}
                <div
                  onClick={(e) => toggleExpand(group.parent, e)}
                  className="w-full py-2.5 px-3 rounded-lg flex items-center justify-between hover:bg-stone-50 cursor-pointer font-bold text-stone-800 text-sm sm:text-base"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-emerald-600" />
                    <span>{group.parent}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-stone-400 font-normal">({filteredItems.length})</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                </div>

                {/* Subcategories List */}
                {isExpanded && (
                  <div className="pl-6 pt-1 space-y-1">
                    {filteredItems.map(item => {
                      const isSelected = selectedCategoryName === item.name;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectCategory(item.name);
                            onClose();
                          }}
                          className={`w-full py-2 px-3 rounded-lg text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-2xs font-extrabold'
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                            <span className="capitalize">{item.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-100 bg-stone-50 text-center shrink-0">
          <p className="text-xs text-stone-500 font-medium">
            পছন্দের ক্যাটাগরি বেছে নিয়ে সহজেই পণ্য খুঁজুন
          </p>
        </div>

      </div>
    </div>
  );
};
