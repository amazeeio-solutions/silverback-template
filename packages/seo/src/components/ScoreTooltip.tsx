import { formatScore, getScoreExplanation } from '../utils/scoring';

function ScoreTooltip({ score }: { score: number }) {
  return (
    <div className="seo-group">
      <div className="seo-relative seo-inline-block">
        <div className="seo-score-badge seo-cursor-help">
          {formatScore(score)}
          <div
            className="seo-group-hover:seo-visible seo-invisible seo-absolute seo-bottom-full seo-left-1/2
            seo-z-50 seo-mb-2 seo-w-48 seo--translate-x-1/2 seo-rounded-lg seo-bg-gray-900 seo-p-2
            seo-text-sm seo-text-white seo-shadow-lg"
          >
            {getScoreExplanation(score)}
            <div
              className="seo-absolute seo-left-1/2 seo-top-full seo--translate-x-1/2
              seo-border-4 seo-border-transparent seo-border-t-gray-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreTooltip;
