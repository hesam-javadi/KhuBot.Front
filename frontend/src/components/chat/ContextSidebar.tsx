import React, { useState, useEffect, useRef } from "react";
import { RagContext } from "../../types";
import { IoChevronDown, IoChevronUp, IoLayersOutline } from "react-icons/io5";

interface ContextSidebarProps {
  contexts: RagContext[];
  selectedContextId: number;
  onSelectContext: (contextId: number) => void;
  isLoading?: boolean;
}

const ContextList: React.FC<{
  contexts: RagContext[];
  selectedContextId: number;
  onSelect: (id: number) => void;
  isLoading: boolean;
}> = ({ contexts, selectedContextId, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-300 border-t-indigo-600" />
      </div>
    );
  }

  const active = contexts.filter((c) => c.isActive);
  if (active.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">موردی یافت نشد</p>
    );
  }

  return (
    <>
      {active.map((ctx) => {
        const isSelected = ctx.id === selectedContextId;
        return (
          <button
            key={ctx.id}
            onClick={() => onSelect(ctx.id)}
            className={`
              w-full text-right rounded-xl px-3 py-3 mb-1 transition-all duration-150
              ${
                isSelected
                  ? "bg-gradient-to-l from-indigo-50 to-blue-50 ring-1 ring-indigo-200 text-indigo-700 shadow-sm"
                  : "hover:bg-gray-50 text-gray-700"
              }
            `}
          >
            <div className="flex items-center gap-2">
              {isSelected ? (
                <span className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex-shrink-0 shadow-sm" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
              )}
              <span className="text-sm font-medium leading-snug">
                {ctx.name}
              </span>
            </div>
            {ctx.description && (
              <p className="text-xs text-gray-400 mt-1 mr-4 line-clamp-2 leading-relaxed">
                {ctx.description}
              </p>
            )}
          </button>
        );
      })}
    </>
  );
};

const ContextSidebar: React.FC<ContextSidebarProps> = ({
  contexts,
  selectedContextId,
  onSelectContext,
  isLoading = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedContext = contexts.find((c) => c.id === selectedContextId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: number) => {
    onSelectContext(id);
    setDropdownOpen(false);
  };

  return (
    <>
      {/* ── DESKTOP: fixed right sidebar (lg+) ─────────────────────────── */}
      <aside className="hidden lg:flex fixed top-0 right-0 h-full w-64 flex-col bg-white/90 backdrop-blur-md border-l border-white/60 shadow-xl shadow-indigo-100/40 z-20">
        {/* Header row — same height as main header */}
        <div className="flex items-center gap-2.5 px-4 h-[57px] border-b border-gray-100/80 flex-shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-400 shadow-sm">
            <IoLayersOutline size={15} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            پایگاه دانش
          </span>
        </div>

        {/* Context list */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <ContextList
            contexts={contexts}
            selectedContextId={selectedContextId}
            onSelect={handleSelect}
            isLoading={isLoading}
          />
        </div>
      </aside>

      {/* ── MOBILE: floating dropdown pill below header (< lg) ─────────── */}
      <div
        ref={dropdownRef}
        className="lg:hidden fixed top-[54px] left-1/2 -translate-x-1/2 z-30"
      >
        {/* Pill trigger */}
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="
            flex items-center gap-2
            bg-white/90 backdrop-blur-md
            border border-white/70 rounded-full
            px-4 py-1.5 shadow-lg shadow-indigo-100/60
            text-sm text-gray-700
            hover:bg-white transition-colors
          "
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-blue-400 flex-shrink-0">
            <IoLayersOutline size={12} className="text-white" />
          </div>
          <span className="max-w-[150px] truncate">
            {isLoading
              ? "در حال بارگذاری..."
              : (selectedContext?.name ?? "انتخاب پایگاه دانش")}
          </span>
          {dropdownOpen ? (
            <IoChevronUp size={13} className="text-gray-400 flex-shrink-0" />
          ) : (
            <IoChevronDown size={13} className="text-gray-400 flex-shrink-0" />
          )}
        </button>

        {/* Dropdown panel */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 -z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-white/95 backdrop-blur-md border border-white/70 rounded-2xl shadow-xl shadow-indigo-100/50 py-2 px-2">
              <ContextList
                contexts={contexts}
                selectedContextId={selectedContextId}
                onSelect={handleSelect}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ContextSidebar;
