import React from 'react';
import { X, Server, Layers, Cpu, Code2, CheckCircle2, ArrowRight } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>EduGenie System Architecture & Workflows</span>
            </h3>
            <p className="text-xs text-slate-500">
              Based on the SmartBridge / SmartInternz project specification
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6 text-sm text-slate-700">
          {/* Architectural Diagram Flow */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Architectural Request Flow
            </h4>
            <div className="flex flex-col items-center gap-2 text-xs font-medium">
              <div className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg border border-blue-200 text-center w-64 shadow-2xs">
                Start: User opens EduGenie
              </div>
              <div className="text-slate-400">↓</div>
              <div className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 text-center w-64">
                Frontend: User Input & Task Selection
              </div>
              <div className="text-slate-400">↓</div>
              <div className="px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-center w-80 shadow-2xs">
                <span className="font-semibold block mb-1">Backend Dispatcher</span>
                Routes to the respective endpoint
              </div>
              <div className="text-slate-400">↓</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full text-center">
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Explanation</strong>
                  <span className="block text-[10px] text-amber-700">/explain</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                  <strong>Q&A Module</strong>
                  <span className="block text-[10px] text-blue-700">/qa</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                  <strong>Quiz Generator</strong>
                  <span className="block text-[10px] text-emerald-700">/quiz</span>
                </div>
                <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-[11px]">
                  <strong>Summarizer</strong>
                  <span className="block text-[10px] text-sky-700">/summarize</span>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px]">
                  <strong>Learning Path</strong>
                  <span className="block text-[10px] text-purple-700">/learn/recommendations</span>
                </div>
              </div>
              <div className="text-slate-400">↓</div>
              <div className="px-4 py-2 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-200 text-center w-64 shadow-2xs">
                Frontend: Real-Time Results & Feedback
              </div>
            </div>
          </div>

          {/* AI Model Selection & Endpoints */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h5 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                AI Models & Engine
              </h5>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Google Gemini:</strong> Advanced reasoning, structured JSON quiz parsing, and adaptive educational roadmaps.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Simplified Student Tuning:</strong> Fine-tuned prompting for school student clarity, analogies, and accessible explanations.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <h5 className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-600" />
                Backend Endpoints
              </h5>
              <div className="space-y-1 font-mono text-[11px] text-slate-700">
                <p>• <span className="text-blue-600 font-semibold">GET/POST</span> /qa & /api/qa</p>
                <p>• <span className="text-blue-600 font-semibold">POST</span> /explain & /api/explain</p>
                <p>• <span className="text-blue-600 font-semibold">POST</span> /quiz & /api/quiz</p>
                <p>• <span className="text-blue-600 font-semibold">POST</span> /summarize & /api/summarize</p>
                <p>• <span className="text-blue-600 font-semibold">GET/POST</span> /learn/recommendations</p>
              </div>
            </div>
          </div>

          {/* Project Submission metadata */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">EduGenie Project</span>
              <p>Submitted by: Tella Divya Sree | Mentor: Siri</p>
            </div>
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono text-[11px]">
              SmartBridge
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
