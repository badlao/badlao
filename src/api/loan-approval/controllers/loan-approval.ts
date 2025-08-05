/**
 * A set of functions called "actions" for `loan-approval`
 */

export default {
  async approve(ctx) {
    console.log('Approving loan application...');
    const { id } = ctx.params;
    const user = ctx.state.user;

    console.log('Userrrrrrrrrrrrrrrrrrrrr:', user);

    const loan = await strapi.entityService.findOne('api::loan-application.loan-application', id);

    if (!loan) {
      return ctx.notFound('Loan application not found');
    }

    // Auto-fill loan approval form
    await strapi.entityService.create('api::loan-acceptance.loan-acceptance', {
      data: {
        group_id: null,
        program_name: null,
        group_leader_name: null,
        education_level: null,
        district: null,
        previous_loan_amount: null,
        repayable_loan_amount: null,
        // loan_approval_no: generateApprovalNumber(), // your logic
        recipient_name: loan.applicant_name,
        national_id: loan.national_id,
        loan_amount: loan.loan_amount_requested,
        cheque_no: '', // to be set
        repayment_method: loan.installment_type,
        repayment_duration_days: loan.loan_duration_days,
        approval_meeting_date: new Date(),
        loan_application: loan.id
      },
    });

    // Update main loan application: set loan_acceptance field
    const updatedLoan = await strapi.entityService.update('api::loan-application.loan-application', id, {
      data: {
        loan_status: 'Approved',
        // approved_by: user.id,
      }
    });

    ctx.send({ message: 'Loan approved', loan: updatedLoan });
  }
};
