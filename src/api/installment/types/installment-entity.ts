export enum InstallmentStatus {
  PAID = 0,
  UNPAID = 1,
  PARTIAL = 2,
  OVERDUE = 3,
  LATE = 4,
  INVALID = 5,
}

export interface InstallmentEntity {
  payment_date: Date;
  amount_to_pay: number;
  amount_paid: number;
  amount_due: number;
  remarks: string;
  payment_status: InstallmentStatus;
  loan_application: number; // relation ID
}