import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';

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
  
  // Track open/closed state for parent category accordions
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  // Touch Swipe & Pull-Down gesture states
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDragY(0);
      setIsDragging(false);
      // Disable body overflow scroll while modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Build dynamic category list ONLY from database categoryObjects
  const groupedCategoryMap: Record<string, string[]> = {};

  categoryObjects.forEach(cat => {
    // Treat empty/unspecified parent as 'অন্যান্য ক্যাটাগরি'
    const parent = (cat.parentCategory && cat.parentCategory.trim()) 
      ? cat.parentCategory.trim() 
      : 'অন্যান্য ক্যাটাগরি';
    
    if (!groupedCategoryMap[parent]) {
      groupedCategoryMap[parent] = [];
    }
    if (!groupedCategoryMap[parent].includes(cat.name)) {
      groupedCategoryMap[parent].push(cat.name);
    }
  });

  const parentList = Object.keys(groupedCategoryMap);

  // Expand the first parent category by default once loaded
  useEffect(() => {
    if (parentList.length > 0 && Object.keys(expandedParents).length === 0) {
      setExpandedParents({ [parentList[0]]: true });
    }
  }, [categoryObjects, parentList.length]);

  if (!isOpen) return null;

  const toggleExpand = (parentName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedParents(prev => ({
      ...prev,
      [parentName]: !prev[parentName],
    }));
  };

  // Touch Handlers for Drag Down to Close
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow drag-to-close if scroll is at the top of the content or touching handle
    if (sheetRef.current && sheetRef.current.scrollTop > 0) return;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // Only allow pulling downwards
    if (deltaY > 0) {
      setDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // If pulled down by more than 90px, dismiss the modal
    if (dragY > 90) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const cleanSearch = searchQuery.trim().toLowerCase();

  return (
    <div
      className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Bottom Sheet Container */}
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[92vh] max-h-[92vh] sm:h-auto sm:max-h-[88vh] flex flex-col shadow-2xl border-t border-stone-200 overflow-hidden select-none animate-in slide-in-from-bottom duration-300"
      >
        {/* Top Swipe Drag Pill Handle */}
        <div className="pt-2.5 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0 bg-white">
          <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-2.5 flex items-center justify-between shrink-0 bg-white">
          <h3 className="text-xl font-bold text-stone-900 tracking-tight">
            Product Category
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-6 h-6 text-stone-800" />
          </button>
        </div>

        {/* Search Bar Input - Green Outlined (Matching reference photo) */}
        <div className="px-5 py-2 shrink-0 bg-white">
          <div className="relative border-2 border-emerald-600 rounded-xl bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-emerald-600/30">
            <input
              type="text"
              placeholder="Product Category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-transparent text-sm sm:text-base font-normal text-stone-900 focus:outline-none placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Category Accordion Tree List */}
        <div className="px-5 py-3 overflow-y-auto flex-1 space-y-1 divide-y divide-stone-100/60">
          
          {/* 'All Products' Option */}
          <button
            onClick={() => {
              onSelectCategory('সব');
              onClose();
            }}
            className={`w-full py-3 text-left font-bold text-sm sm:text-base flex items-center justify-between transition-colors cursor-pointer ${
              selectedCategoryName === 'সব' ? 'text-emerald-700 font-extrabold' : 'text-stone-800 hover:text-emerald-700'
            }`}
          >
            <span>All Products (সব ক্যাটাগরি)</span>
            {selectedCategoryName === 'সব' && <Check className="w-5 h-5 text-emerald-600" />}
          </button>

          {/* Grouped Parent Accordion Items */}
          {parentList.map((parentName) => {
            const subItems = groupedCategoryMap[parentName] || [];
            const isExpanded = !!expandedParents[parentName] || !!cleanSearch;

            // Filter subItems or parent if searching
            const filteredSubs = subItems.filter(sub =>
              !cleanSearch ||
              sub.toLowerCase().includes(cleanSearch) ||
              parentName.toLowerCase().includes(cleanSearch)
            );

            if (cleanSearch && filteredSubs.length === 0 && !parentName.toLowerCase().includes(cleanSearch)) {
              return null;
            }

            return (
              <div key={parentName} className="py-2.5">
                {/* Parent Row */}
                <div
                  onClick={() => toggleExpand(parentName)}
                  className="w-full flex items-center justify-between py-1 cursor-pointer group"
                >
                  <span className="text-sm sm:text-base font-semibold text-stone-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {parentName}
                  </span>
                  <button
                    type="button"
                    className="p-1 text-stone-600 group-hover:text-stone-900 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-stone-700" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-700" />
                    )}
                  </button>
                </div>

                {/* Subcategories Dropdown List */}
                {isExpanded && (
                  <div className="pl-4 pt-2 space-y-2">
                    {filteredSubs.map((subName) => {
                      const isSelected = selectedCategoryName.toLowerCase() === subName.toLowerCase();
                      return (
                        <div
                          key={subName}
                          onClick={() => {
                            onSelectCategory(subName);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between py-1.5 cursor-pointer group/sub"
                        >
                          <span
                            className={`text-sm sm:text-base transition-colors ${
                              isSelected
                                ? 'text-emerald-700 font-extrabold underline'
                                : 'text-stone-800 hover:text-emerald-700 font-normal'
                            }`}
                          >
                            {subName}
                          </span>
                          <ChevronDown className="w-4 h-4 text-stone-400 group-hover/sub:text-emerald-600 transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-stone-50 border-t border-stone-100 text-center text-[11px] text-stone-400 shrink-0">
          <span>নিচের দিকে সোয়াইপ বা ড্র্যাগ (Swipe down) করে উইন্ডো বন্ধ করুন</span>
        </div>

      </div>
    </div>
  );
};
