import { QWERTY_LAYOUT } from '@/utils/colorAssignment';
import React from 'react';

interface CharacterGridProps {
  characterColors: Record<string, string>;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({ characterColors }) => {
  const renderCharacter = (char: string) => {
    const color = characterColors[char] || '#FFFFFF';

    return (
      <div
        key={char}
        className="flex items-center justify-center h-12 min-w-[2.75rem] px-2 border-2 border-pixel-border bg-black transition-all duration-200 hover:scale-105"
        style={{ color }}
      >
        <span className="font-data text-2xl font-bold">{char}</span>
      </div>
    );
  };

  return (
    <div className="space-y-3 p-4 border-4 border-pixel-border bg-pixel-bgDark">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-pixel text-pixel-text mb-1">FIND YOUR PASSWORD</h3>
        <p className="text-xs font-pixelSmall text-pixel-text/70">
          Locate your password character and note its color
        </p>
      </div>

      {/* Numbers Row */}
      <div className="space-y-1">
        <p className="text-xs font-pixelSmall text-pixel-text/50 px-1">NUMBERS</p>
        <div className="flex flex-wrap gap-1 justify-center">
          {QWERTY_LAYOUT.row1.map(renderCharacter)}
        </div>
      </div>

      {/* Letters - QWERTY Layout */}
      <div className="space-y-1">
        <p className="text-xs font-pixelSmall text-pixel-text/50 px-1">LETTERS</p>
        <div className="space-y-1">
          {/* Q-P */}
          <div className="flex flex-wrap gap-1 justify-center">
            {QWERTY_LAYOUT.row2.map(renderCharacter)}
          </div>
          {/* A-L */}
          <div className="flex flex-wrap gap-1 justify-center">
            {QWERTY_LAYOUT.row3.map(renderCharacter)}
          </div>
          {/* Z-M */}
          <div className="flex flex-wrap gap-1 justify-center">
            {QWERTY_LAYOUT.row4.map(renderCharacter)}
          </div>
        </div>
      </div>

      {/* Special Characters Row */}
      <div className="space-y-1">
        <p className="text-xs font-pixelSmall text-pixel-text/50 px-1">SPECIAL</p>
        <div className="flex flex-wrap gap-1 justify-center">
          {QWERTY_LAYOUT.row5.map(renderCharacter)}
        </div>
      </div>
    </div>
  );
};

