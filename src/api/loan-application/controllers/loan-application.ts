/**
 * loan-application controller
 */

// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::loan-application.loan-application');

/**
 * loan-application controller
 */
// @ts-ignore
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::loan-application.loan-application",

  ({ strapi }) => ({
    async loanSuggestionSummary(ctx) {
      try {
        const { loanApplicationId } = ctx.params;

        if (!loanApplicationId) {
          return ctx.badRequest("Loan application ID is required");
        }

        const summaryData = await strapi
          .service("api::loan-application.loan-application")
          .getLoanSuggestionSummary(loanApplicationId);

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
