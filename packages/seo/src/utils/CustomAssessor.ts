import { Paper } from 'yoastseo';
import SubheadingsDistributionTooLong from 'yoastseo/build/scoring/assessments/readability/SubheadingDistributionTooLongAssessment';
import ImageAltTagsAssessment from 'yoastseo/build/scoring/assessments/seo/ImageAltTagsAssessment';
import ImageCount from 'yoastseo/build/scoring/assessments/seo/ImageCountAssessment';
import InternalLinksAssessment from 'yoastseo/build/scoring/assessments/seo/InternalLinksAssessment';
import MetaDescriptionLength from 'yoastseo/build/scoring/assessments/seo/MetaDescriptionLengthAssessment';
import OutboundLinks from 'yoastseo/build/scoring/assessments/seo/OutboundLinksAssessment';
import TitleWidth from 'yoastseo/build/scoring/assessments/seo/PageTitleWidthAssessment';
import SingleH1Assessment from 'yoastseo/build/scoring/assessments/seo/SingleH1Assessment';
import TextLength from 'yoastseo/build/scoring/assessments/seo/TextLengthAssessment';
import Assessor from 'yoastseo/build/scoring/assessors/assessor';

import { sprintf } from './i18n';
/**
 * The CustomAssessor class is used for the general SEO analysis.
 */
export default class CustomAssessor extends Assessor {
  type: string;
  resultTexts: unknown;
  _assessments: unknown[];
  locale: string;
  translations: Record<string, Record<string, string>>;

  /**
   * Creates a new CustomAssessor instance.
   * @param {Researcher} researcher The researcher to use.
   * @param {Object} [options] The assessor options.
   */
  constructor(
    researcher?: unknown,
    options?: { locale?: string; translations?: unknown },
  ) {
    super(researcher);
    this.type = 'CustomAssessor';
    this.locale = options?.locale || 'en';

    this.initializeAssessments();
  }

  private initializeAssessments() {
    const getResultTexts = ({
      urlTitleAnchorOpeningTag,
      urlActionAnchorOpeningTag,
      numberOfImagesWithoutAlt,
      totalNumberOfImages,
    }: {
      urlTitleAnchorOpeningTag: string;
      urlActionAnchorOpeningTag: string;
      numberOfImagesWithoutAlt: number;
      totalNumberOfImages: number;
    }) => {
      return {
        good: sprintf(
          /* translators: %1$s expands to a link on yoast.com, %2$s expands to the anchor end tag. */

          '%1$sImage alt tags%2$s: All images have alt attributes. Good job! UPDATED',

          urlTitleAnchorOpeningTag,
          '</a>',
        ),
        noneHasAltBad: sprintf(
          /* translators: %1$s and %2$s expand to links on yoast.com, %3$s expands to the anchor end tag */

          '%1$sImage alt tags%3$s: None of the images has alt attributes. %2$sAdd alt attributes to your images%3$s! UPDATED',

          urlTitleAnchorOpeningTag,
          urlActionAnchorOpeningTag,
          '</a>',
        ),
        someHaveAltBad: sprintf(
          /* translators: %3$s and %4$s expand to links on yoast.com, %5$s expands to the anchor end tag, %1$d expands to the number of images without alt tags, %2$d expands to the number of images found in the text, */
          "%3$sImage alt tags%5$s: %1$d image out of %2$d doesn't have alt attributes. %4$sAdd alt attributes to your images%5$s! UPDATED",
          numberOfImagesWithoutAlt,
          totalNumberOfImages,
          urlTitleAnchorOpeningTag,
          urlActionAnchorOpeningTag,
          '</a>',
        ),
      };
    };

    this._assessments = [
      new TextLength({
        recommendedMinimum: 300,
        slightlyBelowMinimum: 250,
        belowMinimum: 200,
        veryFarBelowMinimum: 100,
      }),
      new SingleH1Assessment(),
      new SubheadingsDistributionTooLong(),
      new OutboundLinks(),
      new InternalLinksAssessment(),
      new MetaDescriptionLength(),
      new TitleWidth(),
      new ImageCount(),
      new ImageAltTagsAssessment({
        callbacks: getResultTexts,
      }),
    ].map((assessment) => {
      assessment.identifier =
        assessment.identifier || assessment.constructor.name;
      return assessment;
    });
  }

  assess(paper: Paper): void {
    super.assess(paper);
  }

  normalizeScore(score: number): number {
    // Ensure score is between 0 and 10
    return Math.max(0, Math.min(10, score));
  }

  getValidResults() {
    const results = super.getValidResults();

    // Map the results to a proper format
    const filtered = results
      .filter((result) => result && typeof result === 'object')
      .map((result) => ({
        text: result.text,
        score: this.normalizeScore(
          result.getScore ? result.getScore() : result.score || 0,
        ),
        marker: typeof result.marker === 'string' ? result.marker : '',
        identifier: result.identifier || result._identifier,
      }))
      .filter((result) => result.text && typeof result.score !== 'undefined');

    return filtered;
  }
}
