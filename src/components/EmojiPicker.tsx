"use client";

import { useMemo, useState } from "react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_LIBRARY: Record<string, string[]> = {
  Smileys: [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩",
    "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤔", "🤨", "😐", "😑", "😶",
    "😏", "😒", "🙄", "😬", "😮", "😔", "😪", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶"
  ],
  People: [
    "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆",
    "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💪",
    "🧠", "👀", "👂", "👃", "👄", "👶", "🧒", "👦", "👧", "🧑", "👨", "👩", "🧔", "👮", "👷", "🕵️"
  ],
  Nature: [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
    "🐧", "🐦", "🦉", "🦇", "🐺", "🐴", "🦄", "🐝", "🦋", "🐞", "🌸", "🌼", "🌻", "🌺", "🌹", "🌷",
    "🌲", "🌳", "🌴", "🌵", "🍀", "🍁", "🍂", "🍃", "🌍", "🌎", "🌏", "⭐", "🌟", "✨", "⚡", "☄️"
  ],
  Food: [
    "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍒", "🍑", "🍍", "🥝", "🍅", "🥑", "🍆", "🥔",
    "🥕", "🌽", "🥒", "🥬", "🥦", "🍄", "🍞", "🥐", "🥖", "🥨", "🥯", "🧀", "🍖", "🍗", "🥩", "🥓",
    "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🥙", "🍜", "🍝", "🍣", "🍱", "🍰", "🎂", "🍩", "🍪"
  ],
  Activities: [
    "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🏒", "🏏", "🥊", "🥋", "🎽",
    "🛹", "⛸️", "🎿", "🏂", "🏋️", "🤸", "⛹️", "🤺", "🏄", "🏊", "🚴", "🚵", "🧗", "🏆", "🥇", "🥈",
    "🥉", "🎖️", "🎫", "🎟️", "🎪", "🎭", "🎨", "🎬", "🎤", "🎧", "🎹", "🥁", "🎷", "🎺", "🎸", "🎮"
  ],
  Symbols: [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖",
    "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☯️", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏",
    "♐", "♑", "♒", "♓", "❌", "⭕", "🛑", "⛔", "🚫", "💯", "✅", "✔️", "☑️", "🔔", "🔕", "📣"
  ],
};

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const categories = Object.keys(EMOJI_LIBRARY);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [query, setQuery] = useState("");

  const visibleEmojis = useMemo(() => {
    if (query.trim()) {
      const all = categories.flatMap((category) => EMOJI_LIBRARY[category]);
      const q = query.toLowerCase();
      return all.filter((emoji) => emoji.includes(q));
    }

    return EMOJI_LIBRARY[activeCategory] ?? [];
  }, [activeCategory, categories, query]);

  return (
    <div className="absolute bottom-[100%] left-3 right-3 z-30 mb-2 rounded-xl border border-[#3f4147] bg-[#2b2d31] shadow-xl md:left-4 md:right-4">
      <div className="flex items-center justify-between border-b border-[#3f4147] px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Emoji Library</span>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-white">Close</button>
      </div>

      <div className="border-b border-[#3f4147] px-3 py-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search emojis"
          className="w-full rounded bg-[#1e1f22] px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none ring-1 ring-transparent focus:ring-[#5865f2]/50"
        />
      </div>

      {!query.trim() && (
        <div className="flex gap-1 overflow-x-auto border-b border-[#3f4147] px-2 py-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded px-2 py-1 text-xs ${activeCategory === category ? "bg-[#5865f2] text-white" : "bg-[#404249] text-gray-300 hover:bg-[#4e5058]"}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-64 overflow-auto p-2">
        <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
          {visibleEmojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              onClick={() => onSelect(emoji)}
              className="flex h-9 w-full items-center justify-center rounded text-xl hover:bg-[#404249]"
            >
              {emoji}
            </button>
          ))}
        </div>
        {visibleEmojis.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-gray-500">No emojis found.</p>
        )}
      </div>
    </div>
  );
}
