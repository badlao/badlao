import { LoaderFunctionArgs } from "react-router-dom";
import { InstallmentStatus } from "../../installment/types/installment-entity";
import { ApiLoanApplicationLoanApplication } from "../../../../types/generated/contentTypes";
import { LoanDurationUnit } from "../../loan-application/types/loan-duration-unit";
import { InstallmentDurationType } from "../../loan-application/types/installment-duration-type";
import { InstallmentInitialModel } from "../../installment/types/installment-initial-model";
import { mapToInstallment } from "../../installment/types/installment-mapper";
import { addDays, addMonths, addWeeks, addYears } from "../../utils/date-utils";
import holofnama from "../../holofnama/controllers/holofnama";

/**
 * loan-approval service
 */
export async function approveLoan(id: number, loan_status: string) {
  console.log("Approving loan application...");

  const loan = await strapi.db
    .query("api::loan-application.loan-application")
    .findOne({
      where: { id },
      populate: {
        loan_acceptance: {
          select: ["installment_start_date"],
        },
        installments: {
          select: ["id"],
        },
        holofnama: {
          select: ["id"],
        },
      },
    });

  if (!loan) {
    throw new Error("Loan application not found");
  }

  await strapi.db.transaction(async (transaction) => {
    const updatedLoan = await strapi.db
      .query("api::loan-application.loan-application")
      .update({
        where: { id },
        data: {
          loan_status: loan_status,
        },
      });

    if (loan_status === "APPROVED") {
      await addInstallments(loan, transaction);
      await addHolofnama(loan, transaction);
    }
  });

  return null;
}

async function addInstallments(loan: any, transaction: any) {
  if (loan.installments && loan.installments.length > 0) {
    console.log(
      "Installments already exist for this loan application. Skipping installment creation."
    );
    return;
  }
  const [loan_acceptance] = await strapi.entityService.findMany(
    "api::loan-acceptance.loan-acceptance",
    {
      filters: { loan_applications: { id: { $eq: loan.id } } },
      limit: 1,
    }
  );

  const installmentService = strapi.service("api::installment.installment");
  const loanDurationUnit = loan.loan_duration_unit;
  // const withMultipleInstallments = loan.with_multiple_installments;
  // const loanDuration = loan.loan_duration;
  const installAmount = loan.installment_amount;

  const loanAmountRequested = loan.loan_amount_requested;
  const installmentDuration = loan.installment_duration;
  const totalInstallments = loan.total_installments;

  //get installment division
  // const totalInstallment = (withMultipleInstallments == InstallmentDurationType.ONCE) ? 1 : loanDuration;

  const installmentDurationCalculator = (() => {
    switch (loanDurationUnit) {
      case LoanDurationUnit.DAYS:
        return addDays;
      case LoanDurationUnit.WEEKLY:
        return addWeeks;
      case LoanDurationUnit.MONTHLY:
        return addMonths;
      case LoanDurationUnit.YEARLY:
        return addYears;
    }
  })();

  // const installmentDuration = (withMultipleInstallments == InstallmentDurationType.ONCE) ? loanDuration
  //     : (loanDurationUnit == LoanDurationUnit.DAYS ? calculateInstallmentDurationInDays(loanAmountRequested,installAmount, loanDuration) : 1);

  let nextInstallmentPaymentDate = installmentDurationCalculator(
    new Date(loan_acceptance.installment_start_date),
    installmentDuration
  );

  const installmentInitialModels = Array.from(
    { length: totalInstallments },
    (_, i) => {
      const remainingLoanAmount = loanAmountRequested - installAmount * i;
      const amount_to_pay =
        remainingLoanAmount < installAmount
          ? remainingLoanAmount
          : installAmount;

      const installment: InstallmentInitialModel = {
        payment_date: nextInstallmentPaymentDate,
        amount_to_pay: amount_to_pay,
        status: InstallmentStatus.UNPAID,
        loanAppId: loan.id,
        amount_due: loanAmountRequested,
      };
      nextInstallmentPaymentDate = installmentDurationCalculator(
        nextInstallmentPaymentDate,
        installmentDuration
      );
      return installment;
    }
  );
  console.log("Installments to be created:", installmentInitialModels);
  return installmentService.bulkCreate(installmentInitialModels);
}

function calculateInstallmentDurationInDays(
  loanAmountRequested: number,
  installAmount: number,
  loanDuration: number
): number {
  if (loanAmountRequested <= 0 || installAmount <= 0 || loanDuration <= 0) {
    throw new Error(
      "Invalid loan parameters for calculating installment duration"
    );
  }

  const totalInstallment = Math.ceil(loanAmountRequested / installAmount);

  return Math.ceil(loanDuration / totalInstallment);
}

async function addHolofnama(loan: any, transaction: any) {
  if (loan.holofnama && loan.holofnama.id) {
    console.log(
      "Holofnama already exists for this loan application. Skipping Holofnama creation."
    );
    return;
  }
  const holofnamaService = strapi.service("api::holofnama.holofnama");
  const holofnama = await holofnamaService.create({
    data: {
      cheque_ack_cert: [
        {
          loanee_name: loan.loanee_name,
          loanee_nid: loan.loanee_nid,
          loan_amount: loan.loan_amount_requested,
          loan_recieve_type: null,
          loan_transfer_type: null,
          loan_recieve_date: null,
          loanee_signature: null,
          transaction_id: null,
        },
      ],
      branch_manager_name: null,
      branch_manager_signature: null,
      unit_manager_name: null,
      unit_manager_signature: null,
      program_name: null,
      holofnama_date: null,
    },
    transaction,
  });

  await strapi.documents("api::loan-application.loan-application").update({
    documentId: loan.documentId,
    data: { holofnama: holofnama.id },
  });
  // strapi.service('api::loan-application.loan-application').update({
  //     where: { id: loan.id },
  //     data: {
  //         holofnama: holofnama.id
  //     },
  //     transaction
  // });

  console.log("============== Created Holofnama: ", holofnama);
  return holofnama;
}
