// Helper function defined at the top or bottom of the file.
async function syncAcceptanceWithLoan(loan) {
  if (loan.loan_status !== "INITIATE_APPROVAL_PROCESS") return;

  const [existing] = await strapi.entityService.findMany(
    "api::loan-acceptance.loan-acceptance",
    {
      filters: { loan_applications: { id: { $eq: loan.id } } },
      limit: 1,
    }
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
        loanee_nid: loan.loanee_nid,
        loan_amount: loan.loan_amount_requested,
        cheque_no: "", // Or from loan if available
        repayment_duration: loan.loan_duration,
        repayment_duration_unit: loan.loan_duration_unit,
      },
    ],
    approval_meeting_date: new Date(),
  };

  var result;

  if (existing) {
    result = await strapi
      .service("api::loan-acceptance.loan-acceptance")
      .update(existing.id, {
        data: acceptanceData,
      });
  } else {
    result = await strapi
      .service("api::loan-acceptance.loan-acceptance")
      .create({
        data: acceptanceData,
      });
  }

  //now update the loan application to link to the acceptance record
  if (result) {
    console.log("============== Created/Updated Loan Acceptance:", result.id);
    await strapi.documents("api::loan-application.loan-application").update({
      documentId: loan.documentId,
      data: { loan_acceptance: result.id },
    });
  }
}

// Helper function to sync bail bond with loan
async function syncBailBondWithLoan(loan) {
  if (loan.loan_status !== "INITIATE_APPROVAL_PROCESS") return;

  const [existingBailBond] = await strapi.entityService.findMany(
    "api::bail-bond.bail-bond",
    {
      filters: { loan_application: { id: { $eq: loan.id } } },
      limit: 1,
    }
  );

  const bailBondData = {
    loanee_name: loan.applicant_name,
    loanee_nid: loan.loanee_nid,
    loan_amount_requested: loan.loan_amount_requested,
    full_address: loan.full_address || null,
    phone_no: loan.phone_no || null,
    // Keep guarantor fields null as requested
    first_guarantor_name: null,
    first_guarantor_nid: null,
    first_guarantor_signature: null,
    first_guarantor_address: null,
    first_guarantor_phone: null,
    second_guarantor_name: null,
    second_guarantor_nid: null,
    second_guarantor_signature: null,
    second_guarantor_address: null,
    second_guarantor_phone: null,
    loan_application: loan.id,
  };

  var bailBondResult;

  if (existingBailBond) {
    bailBondResult = await strapi
      .service("api::bail-bond.bail-bond")
      .update(existingBailBond.id, {
        data: bailBondData,
      });
  } else {
    bailBondResult = await strapi.service("api::bail-bond.bail-bond").create({
      data: bailBondData,
    });
  }

  if (bailBondResult) {
    console.log("============== Created/Updated Bail Bond:", bailBondResult.id);
  }
}

// Your lifecycle methods simply call the helper.
export default {
  async afterCreate(event) {
    await syncAcceptanceWithLoan(event.result);
    await syncBailBondWithLoan(event.result);
  },
  async afterUpdate(event) {
    await syncAcceptanceWithLoan(event.result);
    await syncBailBondWithLoan(event.result);
  },
};
