import { useState, useRef } from 'react';

const DEFAULT_SECTIONS = [
  { key: 'world', label: 'World' },
  { key: 'technology', label: 'Technology' },
  { key: 'business', label: 'Business' },
  { key: 'science', label: 'Science' },
  { key: 'sport', label: 'Sport' },
  { key: 'culture', label: 'Culture' },
  { key: 'environment', label: 'Environment' },
  { key: 'politics', label: 'Politics' },
  { key: 'ai', label: 'AI' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'cricket', label: 'Cricket' },
  { key: 'startups', label: 'Startups' },
  { key: 'space', label: 'Space' },
  { key: 'crypto', label: 'Crypto' },
];

export default function CategoryCustomizer({ sections, onSave, onClose }) {
  const [items, setItems] = useState(sections);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleToggle = (key) => {
    setItems((prev) =>
      prev.map((s) => (s.key === key ? { ...s, pinned: !s.pinned } : s))
    );
  };

  const handleDragStart = (index) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copy = [...items];
    const [dragged] = copy.splice(dragItem.current, 1);
    copy.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setItems(copy);
  };

  const handleReset = () => {
    setItems(DEFAULT_SECTIONS.map((s) => ({ ...s, pinned: true })));
  };

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const copy = [...items];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    setItems(copy);
  };

  const moveDown = (index) => {
    if (index === items.length - 1) return;
    const copy = [...items];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    setItems(copy);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-xl border border-[#e8e4df] dark:border-[#2e2e2e] w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl text-[#1a1a1a] dark:text-[#e8e4df]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Customize Sections
          </h3>
          <button onClick={onClose} className="text-[#9a9a9a] hover:text-[#1a1a1a] dark:hover:text-[#e8e4df]">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-[#9a9a9a] dark:text-[#6b6b6b] mb-4">Toggle sections on/off and drag to reorder.</p>

        <div className="space-y-1 max-h-80 overflow-y-auto">
          {items.map((section, index) => (
            <div
              key={section.key}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-colors ${
                section.pinned !== false
                  ? 'bg-[#faf8f5] dark:bg-[#252525]'
                  : 'bg-transparent opacity-50'
              }`}
            >
              {/* Drag handle */}
              <svg className="w-4 h-4 text-[#9a9a9a] shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
              </svg>

              <span className="flex-1 text-sm text-[#1a1a1a] dark:text-[#e8e4df] capitalize">{section.label}</span>

              {/* Mobile up/down arrows */}
              <div className="flex flex-col gap-0.5 sm:hidden">
                <button onClick={() => moveUp(index)} className="text-[#9a9a9a] hover:text-[#1a1a1a] dark:hover:text-[#e8e4df]">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m18 15-6-6-6 6" /></svg>
                </button>
                <button onClick={() => moveDown(index)} className="text-[#9a9a9a] hover:text-[#1a1a1a] dark:hover:text-[#e8e4df]">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggle(section.key)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  section.pinned !== false ? 'bg-[#e05d44]' : 'bg-[#e8e4df] dark:bg-[#3e3e3e]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    section.pinned !== false ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#e8e4df] dark:border-[#2e2e2e]">
          <button
            onClick={handleReset}
            className="text-xs text-[#9a9a9a] dark:text-[#6b6b6b] hover:text-[#1a1a1a] dark:hover:text-[#e8e4df] transition-colors"
          >
            Reset to default
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-[#e05d44] text-white rounded-full hover:bg-[#c94e38] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_SECTIONS };
