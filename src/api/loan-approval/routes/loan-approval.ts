// module.exports = {
//   routes: [
//     {
//       method: 'POST',
//       path: '/loan-applications/:id/approve',
//       handler: 'loan-approval.approve',
//       config: {
//         policies: [],
//         auth: {
//           scope: ['plugin::users-permissions.custom-approve-loan']
//         }
//       },
//     }
//   ]
// };
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/loan-applications/:id/forward-with-status',
      handler: 'loan-approval.forwardLoanStatus',
      config: {
        policies: [],
        
      },
    }
  ]
};