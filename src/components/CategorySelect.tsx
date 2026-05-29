/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Check, 
  Globe, 
  Hourglass, 
  Atom, 
  Brain, 
  Trophy, 
  Coins, 
  Moon, 
  Flame, 
  Info,
  Sparkles,
  Tv,
  MapPin,
  Flag
} from 'lucide-react';
import { CATEGORIES } from '../data/questions';
import { CategoryId } from '../types';
import { soundEffects } from '../utils/audio';

// Dynamic mapper for Category Icons
const IconMap: Record<string, React.ComponentType<any>> = {
  Globe,
  Hourglass,
  Atom,
  Brain,
  Trophy,
  Coins,
  Moon,
  Flame,
  Tv,
  MapPin,
  Flag,
};

interface CategorySelectProps {
  onBack: () => void;
  onNext: (selectedCategories: CategoryId[]) => void;
}

export default function CategorySelect({ onBack, onNext }: CategorySelectProps) {
  // Start with all categories selected by default
  const [selectedIds, setSelectedIds] = useState<CategoryId[]>(
    CATEGORIES.map(c => c.id)
  );

  const toggleCategory = (id: CategoryId) => {
    soundEffects.playClick();
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) {
        // Must have at least one selected! Play fail-buzz
        soundEffects.playFailure();
        return;
      }
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    soundEffects.playClick();
    setSelectedIds(CATEGORIES.map(c => c.id));
  };

  const handleDeselectAll = () => {
    soundEffects.playClick();
    // Default back to first
    setSelectedIds([CATEGORIES[0].id]);
  };

  const handleProceed = () => {
    if (selectedIds.length === 0) {
      soundEffects.playFailure();
      return;
    }
    soundEffects.playClick();
    onNext(selectedIds);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen text-white bg-slate-950 p-6 select-none relative" dir="rtl">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <div className="w-full flex items-center justify-between z-10 max-w-md">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBack();
          }}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-slate-400 font-sans">تحديد تصنيفات الأسئلة</span>
        <div className="w-10 h-10" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-start z-10 mt-6 overflow-y-auto max-h-[75vh] px-1">
        {/* Helper guide */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-200">اختر المحتوى المفضل 🎯</h2>
            <p className="text-xs text-slate-400">حدد تصنيفاً واحداً على الأقل للجلسة</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={handleSelectAll}
              className="text-2xs bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1.5 rounded-lg text-indigo-300 transition-all cursor-pointer"
            >
              الكل الكل
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-2xs bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1.5 rounded-lg text-slate-400 transition-all cursor-pointer"
            >
              مسح
            </button>
          </div>
        </div>

        {/* Responsive Categories Grid - Bento design */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedIds.includes(cat.id);
            const IconComponent = IconMap[cat.icon] || Globe;
            
            return (
              <motion.div
                key={cat.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleCategory(cat.id)}
                className={`relative rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between h-[120px] cursor-pointer group ${
                  isSelected 
                    ? `bg-slate-900/40 border-${cat.color}-500/50 shadow-md shadow-${cat.color}-500/5` 
                    : 'bg-slate-900/10 border-slate-800/80 hover:border-slate-800 text-slate-400'
                }`}
              >
                {/* Accent glow on top-right of cards */}
                {isSelected && (
                  <div className={`absolute top-0 right-0 w-8 h-8 bg-${cat.color}-500/10 blur-md rounded-full pointer-events-none`} />
                )}

                <div className="flex justify-between items-center w-full">
                  <div className={`p-2 rounded-xl transition-all ${
                    isSelected 
                      ? `bg-${cat.color}-500/10 text-${cat.color}-400`
                      : 'bg-slate-950/60 text-slate-600'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {isSelected ? (
                    <div className={`w-5 h-5 rounded-full bg-${cat.color}-500 flex items-center justify-center text-white scale-100 transition-all shadow-sm`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-800 transition-all" />
                  )}
                </div>

                <div className="mt-2 text-right">
                  <h4 className={`text-sm font-extrabold pr-0.5 ${
                    isSelected ? 'text-slate-100' : 'text-slate-500'
                  }`}>
                    {cat.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-tight font-sans">
                    {cat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <div className="w-full max-w-md z-10 pt-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleProceed}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-550 hover:to-indigo-550 text-white font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-xl shadow-indigo-600/10 transition-all border border-violet-500/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          بدء المواجهة الكبرى 🚀
        </motion.button>
      </div>
    </div>
  );
}
