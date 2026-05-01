import { useState, useRef, useEffect } from 'react';
import { Avatar } from './index';

const MentionInput = ({ value, onChange, placeholder, rows = 3, className = '', suggestions = [] }) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    const filtered = suggestions.filter(s => 
      s.name?.toLowerCase().includes(mentionSearch) || s.email?.toLowerCase().includes(mentionSearch)
    );
    setFilteredSuggestions(filtered);
  }, [mentionSearch, suggestions]);

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');

    if (lastAtPos !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtPos + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length > 0) {
        setMentionSearch(textAfterAt.toLowerCase());
        setMentionStartIndex(lastAtPos);
        setShowMentions(true);
      } else if (textAfterAt === '') {
        setMentionSearch('');
        setMentionStartIndex(lastAtPos);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    const text = value;
    const before = text.slice(0, mentionStartIndex);
    const after = text.slice(textareaRef.current.selectionStart);
    const newText = `${before}@${user.name} ${after}`;
    onChange(newText);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${className}`}
      />
      {showMentions && filteredSuggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl max-h-56 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
            Mention someone
          </div>
          {filteredSuggestions.map((user) => (
            <button
              key={user.id || user._id}
              type="button"
              onClick={() => insertMention(user)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
            >
              <Avatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
              </div>
              <span className="text-xs text-blue-500 font-medium">@{user.name.toLowerCase().replace(/\s/g, '')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;