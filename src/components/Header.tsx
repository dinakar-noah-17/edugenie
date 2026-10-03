import React from 'react';
import { ActiveTab } from '../types';
import {
  GraduationCap,
  Sparkles,
  HelpCircle,
  Lightbulb,
  FileQuestion,
  FileText,
  Compass,
  LayoutGrid,
  Info,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenArchitecture,
}) => {
  const tabs = [
    { id: 'all' as ActiveTab, label: 'All-in-One View', icon: LayoutGrid },
    { id: 'qa' as ActiveTab, label: 'Q&A Module', icon: HelpCircle },
    { id: 'explain' as ActiveTab, label: 'Concept Explainer', icon: Lightbulb },
    { id: 'quiz' as ActiveTab, label: 'Interactive Quiz', icon: FileQuestion },
    { id: 'summarize' as ActiveTab, label: 'Summarizer', icon: FileText },
    { id: 'learning_path' as ActiveTab, label: 'Learning Roadmap', icon: Compass },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  EduGenie
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    AI Tutor
                  </span>
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Your personal AI tutor for learning support!
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenArchitecture}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
              title="View Architecture Diagram & Project Specs"
            >
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Project Architecture</span>
            </button>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span>SmartBridge / SmartInternz</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
