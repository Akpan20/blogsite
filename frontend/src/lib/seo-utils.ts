export function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  
  export function optimizeTitle(title: string): string {
    const maxLength = 60;
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).replace(/\s+\S*$/, '');
  }
  
  export function optimizeDescription(description: string): string {
    const maxLength = 160;
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).replace(/\s+\S*$/, '...');
  }
  