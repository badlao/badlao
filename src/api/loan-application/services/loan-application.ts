/**
 * loan-application service
 */

import { factories } from "@strapi/strapi";
import { getRecommendation } from "../../utils/recommendation"

export default factories.createCoreService(
  "api::loan-application.loan-application",

  ({ strapi }) => ({
    async getLoanSuggestionSummary(loanApplicationId: string) {
      try {
        // First, fetch the loan application to get the business valuation
        const raw = await strapi.entityService.findOne(
          "api::loan-application.loan-application",
          loanApplicationId,
          {
            fields: ["id"],
            populate: {
              social_evaluation: {
                fields: [
                  "monthly_income",
                  "total_expense",
                  "financial_behavior_rating",
                ],
              },
              business_valuation: {
                fields: ["id"],
                populate: {
                  permanentBusinessAsset: true,
                  continuedInvestment: true,
                  businessPossibleIncome: true,
                },
              },
            },
          }
        );

        const loanApplication = raw as {
          id: number;
          documentId: string;
          social_evaluation?: { monthly_income: number; total_expense: number; financial_behavior_rating: string } | null;
          business_valuation?: {
            id: number;
            documentId: string;
            permanentBusinessAsset: any[];
            continuedInvestment: any[];
            businessPossibleIncome: any[];
          } | null;
        };

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
        const netBusinessIncome = totalPreviousBusinessIncome - totalBusinessExpense;

        //loan application's social evaluation analyze
        const monthlyIncoome = parseFloat(loanApplication.social_evaluation.monthly_income.toFixed(2));
        const monthlyExpense = parseFloat(loanApplication.social_evaluation.total_expense.toFixed(2));
        const netMonthlyIncome = monthlyIncoome - monthlyExpense;
        const recommendation = getRecommendation(netMonthlyIncome, netBusinessIncome);

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
          netBusinessIncome: netBusinessIncome,
          monthlyIncoome: monthlyIncoome,
          monthlyExpense: parseFloat(loanApplication.social_evaluation.total_expense.toFixed(2)),
          netMonthlyIncome: netMonthlyIncome,
          financialBehaviourRating: loanApplication.social_evaluation.financial_behavior_rating,
          recommendation: recommendation,
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
