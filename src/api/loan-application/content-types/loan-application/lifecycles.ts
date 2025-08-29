// Helper function defined at the top or bottom of the file.
async function syncAcceptanceWithLoan(loan) {
  if (loan.loan_status !== "Pending") return;

  const [existing] = await strapi.entityService.findMany(
    'api::loan-acceptance.loan-acceptance',
    { filters: { loan_applications: loan.id }, limit: 1 }
  );

  const acceptanceData = {
    group_id: null,
    program_name: null,
    group_leader_name: null,
    education_level: null,
    district: null,
    previous_loan_amount: null,
    repayable_loan_amount: null,

    // NEW: loanees is an array with one object, matching the component fields
    loanees: [
      {
        recipient_name: loan.applicant_name,
        national_id: loan.national_id,
        loan_amount: loan.loan_amount_requested,
        cheque_no: '', // Or from loan if available
        repayment_method: loan.installment_type,
        repayment_duration_days: loan.loan_duration_days,
        repayment_duration: loan.loan_duration_unit
      }
    ],
    approval_meeting_date: new Date(),
    loan_application: loan.id,
  };

  if (existing) {
    await strapi.service('api::loan-acceptance.loan-acceptance').update(existing.id, {
      data: acceptanceData
    });
  } else {
    await strapi.service('api::loan-acceptance.loan-acceptance').create({
      data: acceptanceData
    });
  }
}

// Your lifecycle methods simply call the helper.
export default {
  async afterCreate(event) {
    await syncAcceptanceWithLoan(event.result);
  },
  async afterUpdate(event) {
    await syncAcceptanceWithLoan(event.result);
  }
};