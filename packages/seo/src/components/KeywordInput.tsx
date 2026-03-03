import React from 'react';

interface KeywordInputProps {
  keyword: string;
  onChange: (keyword: string) => void;
}

export function KeywordInput({ keyword, onChange }: KeywordInputProps) {
  return (
    <div className="seo-mb-6 seo-rounded-lg seo-border seo-border-gray-200 seo-bg-white seo-p-4">
      <h4 className="seo-mb-3 seo-text-base seo-font-semibold seo-text-gray-800">
        Focus keyword
      </h4>
      <input
        type="text"
        value={keyword}
        onChange={(e) => onChange(e.target.value)}
        className="seo-focus:outline-none seo-focus:ring-2 seo-focus:ring-blue-500 seo-w-full seo-rounded-md seo-border seo-border-gray-200 
          seo-px-3 seo-py-2 seo-text-sm"
        placeholder="Enter your focus keyword"
      />
      <p className="seo-mt-2 seo-text-xs seo-text-gray-500">
        Pick the main keyword or keyphrase that this page is about.
      </p>
    </div>
  );
}
