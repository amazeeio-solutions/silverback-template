import React from 'react';

interface SnippetPreviewProps {
  title: string;
  url: string;
  description: string;
}

export function SnippetPreview({
  title,
  url,
  description,
}: SnippetPreviewProps) {
  return (
    <div
      className="snippet-preview mb-4"
      style={{ fontFamily: 'arial, sans-serif' }}
    >
      <div style={{ color: '#1a0dab', fontSize: '20px', marginBottom: '3px' }}>
        {title}
      </div>
      <div style={{ color: '#006621', fontSize: '14px', marginBottom: '3px' }}>
        {url}
      </div>
      <div style={{ color: '#545454', fontSize: '14px', lineHeight: '1.58' }}>
        {description}
      </div>
    </div>
  );
}
