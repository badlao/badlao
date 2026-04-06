/**
 * business-valuation controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::business-valuation.business-valuation",
  ({ strapi }) => ({
    async performanceSummary(ctx) {
      try {
        const { loanApplicationId } = ctx.params;

        if (!loanApplicationId) {
          return ctx.badRequest("Loan application ID is required");
        }

        const summaryData = await strapi
          .service("api::business-valuation.business-valuation")
          .getPerformanceSummaryByLoanApplication(loanApplicationId);

        ctx.send({
          status: "success",
          data: summaryData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error fetching performance summary:", error);
        ctx.badRequest("Failed to fetch performance summary data");
      }
    },
  })
);
