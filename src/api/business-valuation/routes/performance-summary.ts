module.exports = {
  routes: [
    {
      method: "GET",
      path: "/business-valuation/performance-summary/loan-application/:loanApplicationId",
      handler: "business-valuation.performanceSummary",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
