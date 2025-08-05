// Helper function defined at the top or bottom of the file.
async function syncAcceptanceWithLoan(loan) {
  if (loan.loan_status !== "Pending") return;

  const [existing] = await strapi.entityService.findMany(
    'api::loan-acceptance.loan-acceptance',
    { filters: { loan_application: loan.id }, limit: 1 }
  );

  const acceptanceData = {
    group_id: null,
    program_name: null,
    group_leader_name: null,
    education_level: null,
    district: null,
    previous_loan_amount: null,
    repayable_loan_amount: null,
    recipient_name: loan.applicant_name,
    national_id: loan.national_id,
    loan_amount: loan.loan_amount_requested,
    cheque_no: '',
    repayment_method: loan.installment_type,
    repayment_duration_days: loan.loan_duration_days,
    approval_meeting_date: new Date(),
    loan_application: loan.id,
  };

  if (existing) {
    await strapi.entityService.update(
      'api::loan-acceptance.loan-acceptance',
      existing.id,
      { data: acceptanceData }
    );
  } else {
    await strapi.entityService.create(
      'api::loan-acceptance.loan-acceptance',
      { data: acceptanceData }
    );
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