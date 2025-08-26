
'use strict';

function fetchLoanId(loan_application) {
  if (typeof loan_application === 'number') {
    return loan_application;
  } else if (Array.isArray(loan_application)) {
    return loan_application[0]?.id;
  } else if (typeof loan_application === 'object' && loan_application !== null && Array.isArray(loan_application.set)) {
    return loan_application.set[0].id;
  } else if (typeof loan_application === 'object' && loan_application?.connect?.[0]?.id) {
    return loan_application.connect[0].id;
  }
  return null;
}

module.exports = {
  async beforeCreate(event) {

    const { data } = event.params;
    const { loan_application, skipDueCalculation } = data;
    console.log('✅ Lifecycle beforeCreate triggered data: ', data);

    if (skipDueCalculation) {
      console.log('Skipping due calculation as per request.');
      return;
    }
    // Extract loan ID safely (Admin Panel or REST)
    let loanId = fetchLoanId(loan_application);

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
