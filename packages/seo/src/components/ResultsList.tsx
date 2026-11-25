import React, { useEffect, useRef, useState } from 'react';

import type { SeoResult } from '../types';
import { getCategoryLabel } from '../utils/labels';
import { CategoryIcons } from './icons/AssessmentIcons';

interface ResultsListProps {
  results: SeoResult[];
}

function formatScore(score: number): string {
  return `${score}/10`;
}

function ResultItem({ result, index }: { result: SeoResult; index: number }) {
  const prevStatus = useRef(result.status);
  const [shouldPing, setShouldPing] = useState(false);

  useEffect(() => {
    if (result.status === 'good' && prevStatus.current !== 'good') {
      setShouldPing(true);
      // Reset ping after animation
      const timer = setTimeout(() => setShouldPing(false), 2500);
      return () => clearTimeout(timer);
    }
    prevStatus.current = result.status;
  }, [result.status]);

  const baseClasses =
    'seo-flex-shrink-0 seo-w-3 seo-h-3 seo-rounded-full seo-mt-1.5 seo-relative';

  const statusClasses =
    result.status === 'good'
      ? `${baseClasses} seo-bg-green-500 ${
          shouldPing
            ? "before:seo-content-[''] before:seo-absolute before:seo-inset-0 before:seo-rounded-full before:seo-animate-ping before:seo-bg-green-400 before:seo-opacity-75"
            : ''
        }`
      : result.status === 'ok'
        ? `${baseClasses} seo-bg-orange-500`
        : result.status === 'poor'
          ? `${baseClasses} seo-bg-red-500`
          : `${baseClasses} seo-bg-gray-500`;

  return (
    <div
      key={index}
      className="seo-mb-3 seo-flex seo-items-start seo-gap-3 seo-rounded-lg seo-bg-gray-50 seo-p-3"
    >
      <div className={statusClasses} aria-hidden="true" />
      <div className="seo-flex-1">
        <div className="seo-flex seo-items-start seo-justify-between seo-gap-4">
          <div
            className="seo-result-content seo-text-gray-700"
            dangerouslySetInnerHTML={{ __html: result.text }}
          />
          <span className="seo-whitespace-nowrap seo-text-sm seo-font-medium seo-text-gray-500">
            {formatScore(result.score)}
          </span>
        </div>
        {result.marker && (
          <p
            className="seo-result-content seo-m-0 seo-mt-1 seo-text-sm seo-text-gray-500"
            dangerouslySetInnerHTML={{ __html: result.marker }}
          />
        )}
      </div>
    </div>
  );
}

function CategoryGroup({
  category,
  results,
  accordionDisplay,
}: {
  category: string;
  results: SeoResult[];
  accordionDisplay?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="seo-mb-6">
      {accordionDisplay && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="seo-mb-2 seo-flex seo-w-full seo-items-center seo-justify-between seo-rounded-lg seo-bg-gray-50 seo-p-3"
        >
          <div className="seo-flex seo-items-center seo-gap-2">
            {CategoryIcons[category]}
            <h3 className="seo-font-medium seo-text-gray-900">
              {getCategoryLabel(category)}
            </h3>
          </div>
          <svg
            className={`seo-size-5 seo-transition-transform ${isExpanded ? 'seo-rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}

      {isExpanded && (
        <div className="seo-space-y-2">
          {results.map((result, index) => (
            <ResultItem key={index} result={result} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ResultsList({ results }: ResultsListProps) {
  // Group results by category
  let categoryCount = 0;
  const groupedResults = results.reduce(
    (acc: Record<string, SeoResult[]>, result) => {
      if (!acc[result.category]) {
        categoryCount++;
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    },
    {},
  );

  return (
    <div className="seo-mb-6">
      {Object.entries(groupedResults).map(([category, categoryResults]) => (
        <CategoryGroup
          key={category}
          category={category}
          results={categoryResults}
          accordionDisplay={categoryCount > 1}
        />
      ))}
    </div>
  );
}
