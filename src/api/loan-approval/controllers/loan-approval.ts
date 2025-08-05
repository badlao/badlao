/**
 * A set of functions called "actions" for `loan-approval`
 */

export default {
    async approve(ctx) {
    console.log('Approving loan application...');
    const { id } = ctx.params;
    const user = ctx.state.user;

    console.log('Userrrrrrrrrrrrrrrrrrrrr:', user);
    ctx.send({ message: 'Loan approved', user });

    const loan = await strapi.entityService.findOne('api::loan-application.loan-application', id);

    if (!loan) {
      return ctx.notFound('Loan application not found');
    }

    const updated = await strapi.entityService.update('api::loan-application.loan-application', id, {
      data: {
        loan_status: 'Approved',
        approved_by: user.id,
      },
    });

    ctx.send({ message: 'Loan approved', loan: updated });
  }
};
