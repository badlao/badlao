module.exports = {
    routes: [
    {
      method: 'POST',
      path: '/loan-applications/:id/forward-with-status',
      handler: 'loan-approval.forwardLoanStatus',
      config: {
        policies: [
          {
            name: 'global::loan-forward-guard',
            config: {
              key: 'status', // the body key to read
              map: {
                APPROVED: ['manager'],       // only Managers can approve
                DISBURSED: ['field-officer'] // only Field Officers can disburse
              },
            },
          },
        ],
        middlewares: [],
      },
    },
  ],
};
