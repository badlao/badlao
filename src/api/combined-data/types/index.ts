export interface PersonInfo {
  id: number;
  name: string;
  nationalId?: string | number;
  phone?: string;
  address?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  educationLevel?: string;
  photos?: any[];
  signature?: any;
  nidDoc?: any;
}

export interface LoanInfo {
  id: number;
  formNo?: number;
  memberNo?: number;
  groupNo?: number;
  groupId?: string;
  loanNo?: number;
  amount: number;
  duration?: number;
  durationUnit?: string;
  purpose?: string;
  status?: string;
  businessType?: "NEW" | "OLD";
  userOfLoan?: "SELF" | "SPOUSE" | "CHILD" | "OTHER";
  applicationDate?: string;
  approvalDate?: string;
}

export interface InstallmentInfo {
  withMultipleInstallments?: boolean;
  installmentAmount?: number;
  totalInstallments?: number;
  installmentDuration?: number;
  installmentDurationUnit?: string;
  installmentStartDate?: string;
}

export interface BankingInfo {
  mobileBankingType?: "BKASH" | "NAGAD" | "ROCKET" | "OTHER";
  mobileBankingAccNo?: string;
  hasBankAccount?: boolean;
  bankName?: string;
  bankBranch?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
}

export interface GuarantorInfo {
  name: string;
  nid?: number;
  address?: string;
  phone?: string;
  signature?: any;
}

export interface BusinessInfo {
  companyName?: string;
  placeOfBusiness?: string;
  businessDescription?: string;
  reasonForLoan?: "new-business" | "business-extension";
  appraiserName?: string;
  permanentBusinessAsset?: any[];
  continuedInvestment?: any[];
  businessExpense?: any[];
  requiredMaterials?: any[];
  possibleIncome?: any[];
}

export interface ProgramInfo {
  programName?: string;
  district?: string;
  groupLeaderName?: string;
  committeChairName?: string;
  coordinatorSignature?: any;
  programManagerSignature?: any;
  accountsOfficerSignature?: any;
  unitManagerSignature?: any;
  branchManagerName?: string;
  branchManagerSignature?: any;
  unitManagerName?: string;
  groupPhoto?: any;
}

export interface HolofnamaInfo {
  holofnamaDate?: string;
  chequeAckCert?: any[];
}

export interface CombinedLoanData {
  // Core identifiers
  id: number;
  domain:
    | "loan-application"
    | "loan-acceptance"
    | "business-valuation"
    | "holofnama"
    | "bail-bond";

  // Person information (deduplicated)
  applicant: PersonInfo;
  loanee?: PersonInfo; // Only when different from applicant

  // Loan details
  loan: LoanInfo;

  // Installment information
  installment?: InstallmentInfo;

  // Banking information
  banking?: BankingInfo;

  // Guarantors (for bail bonds)
  guarantors?: GuarantorInfo[];

  // Business information
  business?: BusinessInfo;

  // Program information
  program?: ProgramInfo;

  // Holofnama specific
  holofnama?: HolofnamaInfo;

  // Relations
  relations: {
    loanApplicationId?: number;
    loanAcceptanceId?: number;
    businessValuationId?: number;
    holofnamaId?: number;
    bailBondIds?: number[];
    installmentIds?: number[];
    loanApplicationIds?: number[]; // For domains that relate to multiple loan applications
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CombinedDataQuery {
  page?: number;
  pageSize?: number;
  domain?: string | string[];
  status?: string;
  programName?: string;
  district?: string;
  applicantName?: string;
  nationalId?: string;
  loanAmountMin?: number;
  loanAmountMax?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CombinedDataResponse {
  data: CombinedLoanData[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
    summary: {
      totalByDomain: Record<string, number>;
      totalAmount: number;
      statusDistribution: Record<string, number>;
    };
  };
}
