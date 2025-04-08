export interface MetaInfo {
  title: string;
  description: string;
  url: string;
  siteName: string;
}

export function extractMetaInfo(content: string): MetaInfo {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  // Look for title in different places, prioritizing title tag
  const titleTag = tempDiv.querySelector('title')?.textContent;
  const metaTitle = tempDiv.querySelector('meta[name="title"]')?.getAttribute('content');
  const ogTitle = tempDiv.querySelector('meta[property="og:title"]')?.getAttribute('content');
  
  return {
    title: titleTag || metaTitle || ogTitle || '',
    description: tempDiv.querySelector('meta[name="description"]')?.getAttribute('content')
      || tempDiv.querySelector('meta[property="og:description"]')?.getAttribute('content')
      || '',
    url: tempDiv.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    siteName: tempDiv.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || ''
  };
} 