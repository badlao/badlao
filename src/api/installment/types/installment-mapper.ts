import { InstallmentEntity, InstallmentStatus } from "./installment-entity";
import { InstallmentInitialModel } from "./installment-initial-model";

export function mapToInstallment(models: InstallmentInitialModel[]): InstallmentEntity[] {
  return models.map(p => ({
    payment_date: new Date(p.payment_date),
    amount_to_pay: p.amount_to_pay,
    payment_status: p.status,
    loan_application: p.loanAppId,

    // defaults
    amount_paid: 0,
    amount_due: p.amount_due,
    remarks: "",
  }));
}
