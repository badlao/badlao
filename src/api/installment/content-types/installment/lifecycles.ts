module.exports = {
  async beforeCreate(event) {

    const { data } = event.params;

    console.log('✅ Lifecycle beforeCreate triggered data: ', data);

    // Extract loan ID safely (Admin Panel or REST)
    let loanId = null;

    // REST API sends directly as number
    if (typeof data.loan_application === 'number') {
      loanId = data.loan_application.id;
    }
    else if (Array.isArray(data.loan_applicatio)) {
      return data.loan_applicatio[0]?.id;
    }
    else if (data.loan_applicatio instanceof Set) {
      const first = data.loan_applicatio.values().next().value;
      return first?.id;
    }
    // Admin Panel (Content Manager) sends { connect: [{ id: 1 }] }
    else if (
      typeof data.loan_application === 'object' &&
      data.loan_application?.connect?.[0]?.id
    ) {
      loanId = data.loan_application.connect[0].id;

      // Fix the relation so Strapi doesn't complain
      data.loan_application = loanId;
    }
    if (!loanId) {
      throw new Error('Installment must be linked to a loan application.');
    }

    // Fetch latest previous installment
    const previousInstallments = await strapi.entityService.findMany('api::installment.installment', {
      filters: {
        loan_application: loanId,
      },
      sort: ['payment_date:desc'],
      limit: 1,
    });

    if (previousInstallments.length === 0) {
      // First installment
      const loan = await strapi.entityService.findOne('api::loan-application.loan-application', loanId);
      const totalLoan = loan.loan_amount_requested;

      data.amount_due = totalLoan - data.amount_paid;
    } else {
      // Subsequent installment
      const last = previousInstallments[0];
      data.amount_due = Number(last.amount_due) - Number(data.amount_paid);
    }

    // Prevent negative
    if (data.amount_due < 0) {
      throw new Error('Amount due cannot be negative.');
    }

    // Optional: flag final payment
    if (data.amount_due === 0) {
      data.is_final_payment = true;
    }
  }
};
