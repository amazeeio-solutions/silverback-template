import type { AssessmentResult } from '../types/assessments';

export const assessmentHandlers: Record<string, (result: AssessmentResult) => { category: string; status: string }> = {
  TextLength: (result) => {
    const wordCount = result.wordCount || 0;
    const recommended = result.recommendedMinimum || 300;
    
    return {
      category: 'textLength',
      status: wordCount >= recommended ? 'good' :
              wordCount >= recommended * 0.8 ? 'okay' :
              wordCount >= recommended * 0.5 ? 'bad' :
              'veryBad'
    };
  },

  ImageAltTags: (result) => {
    const noAltCount = result.noAlt || 0;
    const imageCount = result.imageCount || 0;
    
    return {
      category: 'imageAltTags',
      status: noAltCount === 0 && imageCount > 0 ? 'good' :
              noAltCount === imageCount ? 'none' :
              'some'
    };
  },

  SingleH1: (result) => {
    const h1Count = result.h1Count || 0;
    
    return {
      category: 'singleH1',
      status: h1Count === 1 ? 'good' :
              h1Count === 0 ? 'none' :
              'multiple'
    };
  },

  SubheadingsDistributionTooLong: (result) => {
    return {
      category: 'subheadings',
      status: !result.hasSubheadings ? 'none' :
              result.tooLong ? 'long' :
              'good'
    };
  },

  OutboundLinks: (result) => {
    const count = result.linkCount || 0;
    
    return {
      category: 'outboundLinks',
      status: count === 0 ? 'none' :
              count === 1 ? 'good' :
              'multiple'
    };
  },

  InternalLinks: (result) => {
    const count = result.linkCount || 0;
    
    return {
      category: 'internalLinks',
      status: count === 0 ? 'none' :
              count === 1 ? 'good' :
              'multiple'
    };
  },

  MetaDescriptionLength: (result) => {
    if (!result.hasDescription) {
      return { category: 'metaDescription', status: 'none' };
    }

    const length = result.descriptionLength || 0;
    const maxLength = result.maxLength || 160;
    
    return {
      category: 'metaDescription',
      status: length > maxLength ? 'tooLong' :
              length < maxLength * 0.4 ? 'tooShort' :
              'good'
    };
  },

  TitleWidth: (result) => {
    const width = result.titleWidth || 0;
    const maxWidth = result.maxWidth || 600;
    
    return {
      category: 'titleWidth',
      status: width > maxWidth ? 'tooLong' :
              width < maxWidth * 0.4 ? 'tooShort' :
              'good'
    };
  }
}; 