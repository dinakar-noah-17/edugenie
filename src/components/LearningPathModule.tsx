import React, { useState } from 'react';
import {
  Compass,
  Send,
  Loader2,
  Copy,
  Check,
  Sparkles,
  Download,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { marked } from 'marked';
import { SAMPLE_PROMPTS } from '../data/sampleData';
import { LearningPathResult } from '../types';

interface LearningPathModuleProps {
  onSaveResult?: (res: LearningPathResult) => void;
  compact?: boolean;
}

const DEFAULT_SQL_PATH = `## SQL Learning Path: From Zero to Hero

This learning path is structured to progressively introduce SQL concepts, starting from the basics and gradually advancing to more complex topics. It's designed to be adaptive: feel free to adjust the pace and delve deeper into areas that particularly interest you.

---

### **I. Beginner Level: Building a Foundation**
**(Estimated Time: 1-2 weeks)**

* **Key Topics:**
  * What is a Database and SQL? (Relational Model, DBMS)
  * Basic Syntax (SELECT, FROM, WHERE)
  * Data Types (INT, VARCHAR, DATE, BOOLEAN)
  * Filtering Data (WHERE clause with comparison operators: =, !=, <, >, and logical operators: AND, OR, NOT)
  * Ordering Results (ORDER BY ASC/DESC)
  * Limiting Results (LIMIT/OFFSET or TOP)
  * Basic Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
  * Introduction to Tables and Primary Keys

* **Resources:**
  * **Interactive Tutorials:**
    * **SQLZoo**: Hands-on interactive practice with immediate feedback.
    * **Khan Academy**: Visual beginner curriculum covering relational basics.
    * **Codecademy**: Interactive browser-based SQL exercises.
  * **Videos:**
    * **FreeCodeCamp's 4-Hour SQL Course**: Comprehensive video tutorial.

---

### **II. Intermediate Level: Working with Multiple Tables & Logic**
**(Estimated Time: 2-3 weeks)**

* **Key Topics:**
  * Joining Tables (INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN)
  * Subqueries and Correlated Subqueries
  * Grouping Data with Aggregates (GROUP BY)
  * Filtering Grouped Aggregates (HAVING clause)
  * Set Operations (UNION, UNION ALL, INTERSECT, EXCEPT)
  * String & Date Manipulation Functions
  * Views (Creating and using virtual tables)
  * Data Modification (INSERT, UPDATE, DELETE, Transactions)

* **Resources:**
  * **Books:**
    * *"SQL Queries for Mere Mortals"* by Michael J. Hernandez
  * **Online Documentation:**
    * PostgreSQL Official Documentation & MySQL Manual
  * **Practice Platforms:**
    * **LeetCode** (Database section: Easy & Medium questions)
    * **HackerRank** SQL Challenges

---

### **III. Advanced Level: Mastering Database Performance & Engineering**
**(Estimated Time: 3-4 weeks and beyond)**

* **Key Topics:**
  * Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, PARTITION BY)
  * Common Table Expressions (CTEs) & Recursive CTEs
  * Stored Procedures, Triggers, and User-Defined Functions (UDFs)
  * Indexes & Query Execution Plans (EXPLAIN ANALYZE)
  * Concurrency, ACID properties, and Isolation Levels
  * Database Schema Design and Normalization (1NF through BCNF)

* **Resources:**
  * **Books:**
    * *"SQL Performance Explained"* by Markus Winand
    * *"Database Internals"* by Alex Petrov
  * **Courses:**
    * Stanford / CMU Database Systems Lecture Series

---

### **Adaptive Learning Tips:**
* **Start with the basics:** Don't rush into joins and window functions before understanding SELECT and WHERE.
* **Practice regularly:** The more you write real SQL queries, the faster query syntax becomes second nature.
* **Use real-world datasets:** Import SQLite or Postgres datasets (e.g. Kaggle datasets) to practice realistic reporting questions.
* **Understand query execution order:** (FROM -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT).
* **Break down complex queries:** Use Common Table Expressions (CTEs) to solve complex analytical questions step-by-step.
* **Seek help when needed:** Leverage developer communities like StackOverflow and Reddit r/SQL.`;

export const LearningPathModule: React.FC<LearningPathModuleProps> = ({
  onSaveResult,
  compact,
}) => {
  const [topic, setTopic] = useState('SQL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<{ topic: string; recommendation: string } | null>({
    topic: 'SQL',
    recommendation: DEFAULT_SQL_PATH,
  });

  const handleGetRecommendations = async (customTopic?: string) => {
    const t = (customTopic || topic).trim();
    if (!t) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/learn/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      const newResult = { topic: t, recommendation: data.recommendation };
      setResult(newResult);

      if (onSaveResult) {
        onSaveResult({ ...newResult, timestamp: Date.now() });
      }
    } catch (err: any) {
      console.error('Learning recommendations failed:', err);
      setError(err.message || 'Failed to generate learning recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.recommendation) return;
    navigator.clipboard.writeText(result.recommendation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.recommendation) return;
    const blob = new Blob([result.recommendation], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${result.topic.toLowerCase().replace(/\s+/g, '_')}_learning_path.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 ${compact ? '' : 'max-w-4xl mx-auto'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Get Learning Recommendations
            </h2>
            <p className="text-xs text-slate-500">
              Personalized roadmap from beginner to advanced with timelines & curated resources
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          GET /api/learn/recommendations
        </span>
      </div>

      {/* Suggested chips */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Explore topics from project report:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.learningPath.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTopic(item);
                handleGetRecommendations(item);
              }}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-800 text-slate-600 transition-colors border border-slate-200 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGetRecommendations();
        }}
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. SQL, Linear Regression, Python, Machine Learning"
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            required
          />

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building Plan...</span>
              </>
            ) : (
              <span>Get Recommendations</span>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result Container (Matching Fig. Pages 15-16 from PDF) */}
      {result && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6 transition-all space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Learning Recommendations for &quot;{result.topic}&quot;:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                title="Download Roadmap as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export MD</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors cursor-pointer"
                title="Copy recommendations"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rendered Markdown report */}
          <div
            className="prose-custom text-xs sm:text-sm text-slate-800 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto"
            dangerouslySetInnerHTML={{
              __html: marked.parse(result.recommendation) as string,
            }}
          />
        </div>
      )}
    </div>
  );
};
