module.exports = {
  routes: [
    {
      method: "GET",
      path: "/loan-applications/:loanApplicationId/loan-suggestion-summary",
      handler: "loan-application.loanSuggestionSummary",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
