/**
 * business-valuation service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::business-valuation.business-valuation",
  ({ strapi }) => ({
    async getPerformanceSummaryByLoanApplication(loanApplicationId: string) {
      try {
        // First, fetch the loan application to get the business valuation
        const loanApplication: any = await strapi.entityService.findOne(
          "api::loan-application.loan-application",
          loanApplicationId,
          {
            populate: {
              business_valuation: {
                populate: {
                  permanentBusinessAsset: true,
                  continuedInvestment: true,
                  businessPossibleIncome: true,
                },
              },
            },
          }
        );

        if (!loanApplication) {
          throw new Error("Loan application not found");
        }

        if (!loanApplication.business_valuation) {
          throw new Error(
            "Business valuation not found for this loan application"
          );
        }

        const businessValuation = loanApplication.business_valuation;

        // Calculate totalPermanentBusinessAsset
        // Sum of (assetNumber * assetPrice)
        const totalPermanentBusinessAsset = (
          businessValuation.permanentBusinessAsset || []
        ).reduce((sum, asset) => {
          const assetNumber = asset.assetNumber || 0;
          const assetPrice = asset.assetPrice || 0;
          return sum + assetNumber * assetPrice;
        }, 0);

        // Calculate totalContinuedInvestment
        // Sum of purchasePrice from continuedInvestment
        const totalContinuedInvestment = (
          businessValuation.continuedInvestment || []
        ).reduce((sum, investment) => {
          const purchasePrice = investment.purchasePrice || 0;
          return sum + purchasePrice;
        }, 0);

        // Calculate sum of previousBusinessIncome from businessPossibleIncome
        const totalPreviousBusinessIncome = (
          businessValuation.businessPossibleIncome || []
        ).reduce((sum, income) => {
          return sum + (income.previousBusinessIncome || 0);
        }, 0);

        // Calculate sum of totalBusinessExpense from businessPossibleIncome
        const totalBusinessExpense = (
          businessValuation.businessPossibleIncome || []
        ).reduce((sum, income) => {
          return sum + (income.totalBusinessExpense || 0);
        }, 0);

        // Calculate net income (sum of previousBusinessIncome - sum of totalBusinessExpense)
        const netIncome = totalPreviousBusinessIncome - totalBusinessExpense;

        return {
          totalPermanentBusinessAsset: parseFloat(
            totalPermanentBusinessAsset.toFixed(2)
          ),
          totalContinuedInvestment: parseFloat(
            totalContinuedInvestment.toFixed(2)
          ),
          totalPreviousBusinessIncome: parseFloat(
            totalPreviousBusinessIncome.toFixed(2)
          ),
          totalBusinessExpense: parseFloat(totalBusinessExpense.toFixed(2)),
          netIncome: parseFloat(netIncome.toFixed(2)),
        };
      } catch (error) {
        console.error(
          "Error in getPerformanceSummaryByLoanApplication service:",
          error
        );
        throw error;
      }
    },
  })
);
