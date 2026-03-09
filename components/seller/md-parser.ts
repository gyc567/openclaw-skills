/**
 * MD File Parser
 * Parses Markdown files with YAML frontmatter
 */

export interface ParsedListingData {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  priceUsd?: number;
  version?: string;
  packageUrl?: string;
}

/**
 * Parse YAML frontmatter from markdown content
 * @param content - Full markdown file content
 * @returns Parsed listing data
 */
export function parseMdFile(content: string): ParsedListingData {
  const result: ParsedListingData = {};
  
  // Check for frontmatter delimiters
  if (!content.startsWith('---')) {
    // No frontmatter, treat entire content as description (strip markdown headers)
    const cleanContent = content.replace(/^#+\s*/gm, '').trim();
    result.description = cleanContent || content.trim();
    return result;
  }
  
  // Extract frontmatter
  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    // Invalid frontmatter, treat as description
    const cleanContent = content.replace(/^#+\s*/gm, '').trim();
    result.description = cleanContent || content.trim();
    return result;
  }
  
  const frontmatter = content.slice(3, frontmatterEnd).trim();
  const body = content.slice(frontmatterEnd + 3).trim();
  
  // Parse YAML-like frontmatter (simple key-value pairs)
  const lines = frontmatter.split('\n');
  let currentKey: string | null = null;
  let currentArray: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Check for array item (starts with -)
    if (trimmed.startsWith('- ')) {
      if (currentKey === 'tags') {
        const value = trimmed.slice(2).trim();
        if (value) currentArray.push(value);
      }
      continue;
    }
    
    // Check for key: value pair
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0) {
      // Save previous array if any
      if (currentKey === 'tags' && currentArray.length > 0) {
        result.tags = [...currentArray];
        currentArray = [];
      }
      
      const key = trimmed.slice(0, colonIndex).trim();
      let value = trimmed.slice(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Only set if not already set (first wins)
      switch (key) {
        case 'name':
          if (!result.name) result.name = value;
          break;
        case 'description':
          if (!result.description) result.description = value;
          break;
        case 'category':
          if (!result.category) result.category = value;
          break;
        case 'tags':
          currentKey = 'tags';
          if (value) {
            currentArray = [value];
          }
          break;
        case 'priceUsd':
        case 'price':
          if (!result.priceUsd) result.priceUsd = parseFloat(value) || 0;
          break;
        case 'version':
          if (!result.version) result.version = value;
          break;
        case 'packageUrl':
        case 'package_url':
        case 'url':
          if (!result.packageUrl) result.packageUrl = value;
          break;
      }
    }
  }
  
  // Save remaining array
  if (currentKey === 'tags' && currentArray.length > 0) {
    result.tags = [...currentArray];
  }
  
  // If no description from frontmatter, use body content
  if (!result.description && body) {
    const cleanBody = body.replace(/^#+\s*/gm, '').trim();
    result.description = cleanBody.slice(0, 500) || body.slice(0, 500);
  }
  
  return result;
}

/**
 * Validate that file is markdown
 * @param fileName - Name of the file
 * @returns true if valid markdown file
 */
export function isValidMdFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.md') || 
         fileName.toLowerCase().endsWith('.markdown');
}
