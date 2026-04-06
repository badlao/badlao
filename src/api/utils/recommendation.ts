// path: src/utils/recommendation.js

const Recommendation = Object.freeze({
  NOT_RECOMMENDED: 1,
  CONDITIONAL: 2,
  RECOMMENDED: 3,
});

/**
 * Determines applicant recommendation based on net monthly and business income.
 *
 * @param {number} netMonthlyIncome
 * @param {number} netBusinessIncome
 * @returns {{ code: number, message: string }}
 */
function getRecommendation(netMonthlyIncome, netBusinessIncome) {
  if (netMonthlyIncome < 0 && netBusinessIncome < 0) {
    return { code: Recommendation.NOT_RECOMMENDED, message: 'Applicant is not recommended' };
  }
  if (netMonthlyIncome > 0 && netBusinessIncome > 0) {
    return { code: Recommendation.RECOMMENDED, message: 'Applicant is recommended' };
  }
  if (
    (netMonthlyIncome < 0 && netBusinessIncome > 0) ||
    (netMonthlyIncome > 0 && netBusinessIncome < 0)
  ) {
    return { code: Recommendation.CONDITIONAL, message: 'Applicant may be recommended, subject to careful consideration' };
  }

  // Default fallback (e.g., both are 0)
  return { code: Recommendation.CONDITIONAL, message: 'Applicant may be recommended, subject to careful consideration' };
}

export { Recommendation, getRecommendation };
