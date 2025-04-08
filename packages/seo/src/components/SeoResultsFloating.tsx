import { useIntl } from '@amazeelabs/react-intl';
import React, { useEffect, useState } from 'react';

import { seoConfig } from '../config';
import type { SeoResult } from '../types';
import { ResultsList } from './ResultsList';
import { SeoIntlProvider } from './SeoIntlProvider';

interface SeoResultsFloatingProps {
  results: SeoResult[];
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  content: string;
  isAnalyzing?: boolean;
  error?: Error | null;
  locale: string;
}

function getScoreColor(score: number) {
  if (score >= 8) return 'seo-text-green-500 seo-bg-green-50';
  if (score >= 6) return 'seo-text-orange-500 seo-bg-orange-50';
  return 'seo-text-red-500 seo-bg-red-50';
}

function getScoreLabel(score: number) {
  if (score >= 8) return 'GOOD';
  if (score >= 6) return 'OK';
  return 'POOR';
}


export function SeoResultsFloating(props: SeoResultsFloatingProps) {
  return (
    <SeoIntlProvider locale={props.locale}>
      <SeoResultsFloatingContent {...props} />
    </SeoIntlProvider>
  );
}

export function SeoResultsFloatingContent({
  results,
  isAnalyzing,
  error,
}: SeoResultsFloatingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  const intl = useIntl();
  const [hasAnimated, setHasAnimated] = useState(false);

  const getSummary = () => {
    if (!results.length) return { score: 0, color: '#6b7280', status: 'ok' };
    const avgScore =
      results.reduce((sum, result) => sum + result.score, 0) / results.length;
    const roundedScore = Math.round(avgScore);
    return {
      score: roundedScore,
      color: getScoreColor(roundedScore),
      status:
        roundedScore >= seoConfig.scoring.thresholds.good
          ? 'good'
          : roundedScore >= seoConfig.scoring.thresholds.ok
            ? 'ok'
            : 'poor',
    };
  };

  const summary = getSummary();

  const overallScore = results.length
    ? Math.round(
        results.reduce((sum, result) => sum + result.score, 0) / results.length,
      )
    : null;

  const scoreColorClass = getScoreColor(overallScore);
  const scoreLabel = getScoreLabel(overallScore);

  useEffect(() => {
    if (summary.status === 'good' && !hasAnimated) {
      setHasAnimated(true);
      setTimeout(() => setHasAnimated(false), 2000);
    }
  }, [summary.status, hasAnimated]);

  return (
    <>
      {isExpanded && (
        <div
          className="seo-fixed seo-inset-0 seo-z-[996] seo-bg-black/20"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={`seo-fixed seo-top-0 seo-z-[998] seo-flex seo-h-full seo-w-[400px] seo-flex-col seo-bg-white seo-shadow-lg seo-transition-all seo-duration-300 seo-ease-in-out ${
          isExpanded ? 'seo-right-0' : 'seo--right-[400px]'
        }`}
      >
        <h2 className="seo-sr-only">
          {intl.formatMessage({
            id: 'ZXRwur',
            defaultMessage: 'SEO Analysis Results',
          })}
        </h2>
        <div className="seo-flex seo-items-center seo-justify-between seo-border-b seo-border-gray-200 seo-p-5">
          <div className="seo-flex seo-items-center seo-gap-3">
            <h3 className="seo-m-0 seo-font-semibold seo-text-gray-800">
              {intl.formatMessage({
                id: 'IXl785',
                defaultMessage: 'SEO Analysis',
              })}
            </h3>
            <div className="seo-relative">
              <div className="seo-flex seo-items-center seo-gap-2">
                <div
                  className={`seo-rounded-full seo-px-3 seo-py-1 ${scoreColorClass} seo-flex seo-items-center seo-gap-2`}
                >
                  <span className="seo-font-medium">
                    {scoreLabel}
                  </span>
                  <span className="seo-font-bold">
                    {`${overallScore}`}
                    <span className={'tracking-tighter'}>{` / `}</span>10
                  </span>
                </div>

                <div
                  className="p-1 seo-cursor-help seo-text-gray-400 hover:seo-text-gray-600"
                  onMouseEnter={() => setTooltipVisible(true)}
                  onMouseLeave={() => setTooltipVisible(false)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                {isTooltipVisible && (
                  <div
                    className="seo-absolute seo-left-1/2 seo-top-full 
                      seo-z-[1000] seo-mt-4 seo-w-64 seo--translate-x-1/2 seo-rounded-lg
                      seo-bg-gray-900 seo-p-3 seo-text-sm seo-text-white seo-shadow-lg"
                  >
                    <div
                      className="seo-absolute seo-bottom-full seo-left-1/2 seo--translate-x-1/2 
                        seo-border-8 seo-border-transparent seo-border-b-gray-900"
                    />
                    <div className="seo-whitespace-pre-line">
                      {intl.formatMessage({
                        id: 'MXk3OY',
                        defaultMessage: `SEO Scoring Guide:\n• 0/10: Critical errors or broken content\n• 3/10: Missing recommended elements (needs improvement)\n• 6/10: Meets basic requirements\n• 8-10/10: Excellent optimization`,
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="seo-hover:bg-gray-100 seo-cursor-pointer seo-rounded seo-border-none seo-bg-transparent seo-p-1"
            aria-label={intl.formatMessage({
              id: 'rbrahO',
              defaultMessage: 'Close',
            })}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M6 6l8 8m0-8l-8 8"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="seo-flex-1 seo-overflow-y-auto seo-p-5">
          <ResultsList results={results} />
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`seo-fixed seo-top-1/2 seo--translate-y-1/2 
            ${isExpanded ? 'seo-right-[400px]' : 'seo-right-0'}
            seo-z-[997] seo-flex 
            seo-h-28 seo-w-10
            seo-flex-col seo-items-center seo-justify-center seo-overflow-hidden seo-rounded-l-lg
            seo-border-y seo-border-l seo-border-gray-200 seo-bg-white
            seo-shadow-[-2px_0_8px_rgba(0,0,0,0.1)] seo-transition-all seo-duration-300
            hover:seo-bg-gray-50
            ${scoreColorClass}`}
      >
        {/* Score cap */}
        <div
          className={`
            seo-absolute seo-left-0
            seo-top-0 seo-flex seo-h-8
            seo-w-full
            seo-items-center seo-justify-center seo-rounded-tl-lg
            seo-text-sm seo-font-bold seo-text-white
            ${summary.status === 'good' ? 'seo-score-animation' : ''}
            ${
              summary.status === 'good'
                ? 'seo-bg-green-500'
                : summary.status === 'ok'
                  ? 'seo-bg-orange-500'
                  : 'seo-bg-red-500'
            }
          `}
        >
          {overallScore === null ? (
            <div className="seo-size-4 seo-animate-spin seo-rounded-full seo-border-2 seo-border-white seo-border-t-transparent"></div>
          ) : (
            overallScore
          )}
        </div>

        {/* Button content */}
        <div className="seo-mt-9 seo-flex seo-flex-col seo-items-center seo-gap-3">
          <span className="seo-rotate-90 seo-text-sm seo-font-medium">
            {intl.formatMessage({
              id: '8E67p7',
              defaultMessage: 'SEO',
            })}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`seo-transition-transform seo-duration-300 ${
              isExpanded ? 'seo-rotate-180' : ''
            }`}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
      </button>

      {isAnalyzing && (
        <div className="seo-flex seo-items-center seo-justify-center seo-p-4">
          <div className="seo-size-5 seo-animate-spin seo-rounded-full seo-border-2 seo-border-blue-500 seo-border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="seo-rounded-lg seo-bg-red-50 seo-p-4 seo-text-red-600">
          {error.message}
        </div>
      )}
    </>
  );
}
