/**
 * A set of functions called "actions" for `loan-approval`
 */
import { approveLoan } from '../services/loan-approval';

export default {
  async approve(ctx) {
    console.log('Approving loan application...');
    const { id } = ctx.params;
    const user = ctx.state.user;

    console.log('Userrrrrrrrrrrrrrrrrrrrr:', user);
    
    const updatedLoan = await approveLoan(Number(id)).catch(err => {
      console.error('Error approving loan:', err);
      return ctx.badRequest('Failed to approve loan application');
    });

    // const loan = await strapi.db.query('api::loan-application.loan-application').findOne({
    //   where: { id }
    // });

    // if (!loan) {
    //   return ctx.notFound('Loan application not found');
    // }
    // // Update main loan application: set loan_acceptance field
    // const updatedLoan = await strapi.db.query('api::loan-application.loan-application').update({
    //   where: { id },
    //   data: {
    //     loan_status: 'Approved'
    //   }
    // });

    ctx.send({ message: 'Loan approved', loan: updatedLoan });
  }
};
