export interface SeoData {
    title: string;
    description: string;
    keywords?: string;
    canonical?: string;
    ogImage?: string;
    type: 'article' | 'website';
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
}