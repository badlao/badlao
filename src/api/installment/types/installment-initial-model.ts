import { InstallmentStatus } from "./installment-entity";

export interface InstallmentInitialModel {
  payment_date: Date;
  amount_to_pay: number;
  status: InstallmentStatus;
  loanAppId: number;
  amount_due: number; // Optional, can be calculated later
}
