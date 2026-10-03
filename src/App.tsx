/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { QnaModule } from './components/QnaModule';
import { ExplainModule } from './components/ExplainModule';
import { QuizModule } from './components/QuizModule';
import { SummaryModule } from './components/SummaryModule';
import { LearningPathModule } from './components/LearningPathModule';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ActiveTab, QnaResult, ExplainResult, QuizResult, SummaryResult, LearningPathResult } from './types';
import {
  Sparkles,
  HelpCircle,
  Lightbulb,
  FileQuestion,
  FileText,
  Compass,
  GraduationCap,
  History,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Recent activity logs
  const [recentHistory, setRecentHistory] = useState<
    Array<{
      id: string;
      type: string;
      title: string;
      snippet: string;
      time: string;
    }>
  >([
    {
      id: '1',
      type: 'Q&A',
      title: 'Which is the largest ocean?',
      snippet: 'The Pacific Ocean is the largest ocean on Earth...',
      time: 'Just now',
    },
    {
      id: '2',
      type: 'Explanation',
      title: 'Photosynthesis',
      snippet: 'Photosynthesis is how plants use sunlight, water, and air...',
      time: '2 mins ago',
    },
    {
      id: '3',
      type: 'Quiz',
      title: 'The Pythagoras Theorem',
      snippet: '3 multiple-choice questions generated',
      time: '5 mins ago',
    },
    {
      id: '4',
      type: 'Summary',
      title: 'The Industrial Revolution',
      snippet: 'Shifted manual agrarian labor to steam-powered factories...',
      time: '10 mins ago',
    },
    {
      id: '5',
      type: 'Roadmap',
      title: 'SQL Zero to Hero',
      snippet: 'Beginner, Intermediate & Advanced structured curriculum',
      time: '15 mins ago',
    },
  ]);

  const addHistory = (type: string, title: string, snippet: string) => {
    setRecentHistory((prev) => [
      {
        id: String(Date.now()),
        type,
        title,
        snippet: snippet.slice(0, 80) + '...',
        time: 'Just now',
      },
      ...prev.slice(0, 15),
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Banner with Fast Scenario Launchers */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold tracking-wide uppercase text-blue-100 mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              SmartBridge Project Showcase
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Welcome to EduGenie 🎓✨
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed mb-5">
              EduGenie is a lightweight AI-powered educational assistant that simplifies learning through Google Gemini generative AI. Designed for students of all academic levels with 5 dedicated learning modules.
            </p>

            {/* Quick Scenario Jumper (from PDF Scenarios 1, 2, 3) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-blue-200">
                Quick Test Scenarios:
              </span>
              <button
                onClick={() => setActiveTab('qa')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-blue-900 font-medium transition-all backdrop-blur-xs cursor-pointer"
              >
                🌊 Scenario 1: Largest Ocean (Q&A)
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-blue-900 font-medium transition-all backdrop-blur-xs cursor-pointer"
              >
                📐 Scenario 2: Pythagoras Quiz
              </button>
              <button
                onClick={() => setActiveTab('learning_path')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-blue-900 font-medium transition-all backdrop-blur-xs cursor-pointer"
              >
                🗺️ Scenario 3: SQL Roadmap
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/30 text-blue-100 font-medium transition-all cursor-pointer border border-white/20"
              >
                📑 View All Modules
              </button>
            </div>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Dynamic Content based on Active Tab */}
        {activeTab === 'all' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  All-in-One Learning Workspace
                </h3>
                <p className="text-xs text-slate-500">
                  Access every EduGenie capability on a single page matching the project documentation layout.
                </p>
              </div>
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Recent Queries ({recentHistory.length})</span>
              </button>
            </div>

            {/* Q&A Module */}
            <section id="qa-section">
              <QnaModule
                onSaveResult={(res: QnaResult) =>
                  addHistory('Q&A', res.question, res.answer)
                }
              />
            </section>

            {/* Explanation Module */}
            <section id="explain-section">
              <ExplainModule
                onSaveResult={(res: ExplainResult) =>
                  addHistory('Explanation', res.topic, res.explanation)
                }
              />
            </section>

            {/* Summarize Module */}
            <section id="summarize-section">
              <SummaryModule
                onSaveResult={(res: SummaryResult) =>
                  addHistory('Summary', 'Educational Passage', res.summary)
                }
              />
            </section>

            {/* Quiz Module */}
            <section id="quiz-section">
              <QuizModule
                onSaveResult={(res: QuizResult) =>
                  addHistory('Quiz', res.topic, `${res.questions.length} questions`)
                }
              />
            </section>

            {/* Learning Path Module */}
            <section id="learning-path-section">
              <LearningPathModule
                onSaveResult={(res: LearningPathResult) =>
                  addHistory('Roadmap', res.topic, res.recommendation)
                }
              />
            </section>
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="py-2">
            <QnaModule
              onSaveResult={(res: QnaResult) =>
                addHistory('Q&A', res.question, res.answer)
              }
            />
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="py-2">
            <ExplainModule
              onSaveResult={(res: ExplainResult) =>
                addHistory('Explanation', res.topic, res.explanation)
              }
            />
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="py-2">
            <QuizModule
              onSaveResult={(res: QuizResult) =>
                addHistory('Quiz', res.topic, `${res.questions.length} questions`)
              }
            />
          </div>
        )}

        {activeTab === 'summarize' && (
          <div className="py-2">
            <SummaryModule
              onSaveResult={(res: SummaryResult) =>
                addHistory('Summary', 'Educational Passage', res.summary)
              }
            />
          </div>
        )}

        {activeTab === 'learning_path' && (
          <div className="py-2">
            <LearningPathModule
              onSaveResult={(res: LearningPathResult) =>
                addHistory('Roadmap', res.topic, res.recommendation)
              }
            />
          </div>
        )}

        {/* History Drawer / Modal */}
        {historyOpen && (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm mt-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Recent Learning Activity
                </h4>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Close Activity
              </button>
            </div>
            <div className="divide-y divide-slate-100 mt-2">
              {recentHistory.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-900">{item.title}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-slate-500 truncate max-w-xl">{item.snippet}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700">EduGenie</span>
            <span>— Google Gemini Powered Learning Assistant</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>SmartBridge / SmartInternz Project</span>
            <span>Submitted by: <strong>Tella Divya Sree</strong></span>
            <span>Mentor: <strong>Siri</strong></span>
          </div>
        </div>
      </footer>

      {/* Architecture Diagram Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}
