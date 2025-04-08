export function stripHTML(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function cleanHTML(html: string): string {
  // Replace multiple spaces/newlines with a single space
  const cleanSpaces = html.replace(/\s+/g, ' ');
  
  // Keep <a> tags but remove all other HTML
  return cleanSpaces.replace(
    /<(?!\/?(a|href))[^>]+>/g, 
    ''
  ).trim();
} 