/**
 * A set of functions called "actions" for `loan-approval`
 */
import { approveLoan } from '../services/loan-approval';

export default {
  async forwardLoanStatus(ctx) {
    console.log('Approving loan application...');
    const { id } = ctx.params;
    const user = ctx.state.user;
    const status = ctx.request.body.status;
    if (!id) {
      return ctx.badRequest('Loan application ID is required');
    }
    if (!status) {
      return ctx.badRequest('Loan status is required');
    }

    console.log('Userrrrrrrrrrrrrrrrrrrrr:', user);
    
    const updatedLoan = await approveLoan(Number(id), status).catch(err => {
      console.error('Error approving loan:', err);
      return ctx.badRequest('Failed to approve loan application');
    });

    ctx.send({ message: 'Loan status changed', loan: updatedLoan });
  }
};
