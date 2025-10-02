import { Core } from "@strapi/strapi";
import {
  CombinedLoanData,
  CombinedDataQuery,
  CombinedDataResponse,
  PersonInfo,
  LoanInfo,
  InstallmentInfo,
  BankingInfo,
  GuarantorInfo,
  BusinessInfo,
  ProgramInfo,
  HolofnamaInfo,
} from "../types";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Get combined data from all loan-related domains
   */
  async getCombinedData(
    query: CombinedDataQuery
  ): Promise<CombinedDataResponse> {
    try {
      const {
        page = 1,
        pageSize = 25,
        domain,
        status,
        programName,
        district,
        applicantName,
        nationalId,
        loanAmountMin,
        loanAmountMax,
        dateFrom,
        dateTo,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = query;

      let combinedData: CombinedLoanData[] = [];
      const totalByDomain: Record<string, number> = {};

      // Determine which domains to fetch
      const domainsToFetch = domain
        ? Array.isArray(domain)
          ? domain
          : [domain]
        : [
            "loan-application",
            "loan-acceptance",
            "business-valuation",
            "holofnama",
            "bail-bond",
          ];

      // Always start with loan-application as the primary table (LEFT JOIN approach)
      if (
        domainsToFetch.includes("loan-application") ||
        domainsToFetch.length === 5
      ) {
        combinedData = await this.fetchLoanApplicationsWithRelations(query);
        totalByDomain["loan-application"] = combinedData.length;
      }

      // If specific domains other than loan-application are requested, add their standalone data
      for (const domainName of domainsToFetch) {
        if (domainName !== "loan-application") {
          const domainData = await this.fetchDomainData(domainName, query);

          // Only add standalone records that don't have corresponding loan applications
          const standaloneRecords = domainData.filter((record) => {
            const relationKey = this.getRelationKey(domainName);
            return !combinedData.some(
              (existing) => existing.relations[relationKey] === record.id
            );
          });

          combinedData.push(...standaloneRecords);
          totalByDomain[domainName] = domainData.length;
        }
      }

      // Apply cross-domain filters
      combinedData = this.applyFilters(combinedData, query);

      // Sort data
      combinedData.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case "applicantName":
            aValue = a.applicant.name?.toLowerCase() || "";
            bValue = b.applicant.name?.toLowerCase() || "";
            break;
          case "loanAmount":
            aValue = a.loan.amount || 0;
            bValue = b.loan.amount || 0;
            break;
          case "applicationDate":
            aValue = new Date(a.loan.applicationDate || 0).getTime();
            bValue = new Date(b.loan.applicationDate || 0).getTime();
            break;
          default:
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });

      // Calculate pagination
      const total = combinedData.length;
      const pageCount = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      const paginatedData = combinedData.slice(startIndex, endIndex);

      // Calculate summary statistics
      const totalAmount = combinedData.reduce(
        (sum, item) => sum + (item.loan.amount || 0),
        0
      );
      const statusDistribution: Record<string, number> = {};

      combinedData.forEach((item) => {
        const status = item.loan.status || "unknown";
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      });

      return {
        data: paginatedData,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount,
            total,
          },
          summary: {
            totalByDomain,
            totalAmount,
            statusDistribution,
          },
        },
      };
    } catch (error) {
      strapi.log.error("Error in getCombinedData:", error);
      throw new Error(`Failed to fetch combined data: ${error.message}`);
    }
  },

  /**
   * Fetch data from a specific domain
   */
  async fetchDomainData(
    domain: string,
    query: CombinedDataQuery
  ): Promise<CombinedLoanData[]> {
    try {
      let entityData;
      const populateFields = this.getPopulateFields(domain);

      switch (domain) {
        case "loan-application":
          entityData = await strapi.entityService.findMany(
            "api::loan-application.loan-application",
            {
              populate: populateFields,
              pagination: { start: 0, limit: -1 }, // Get all for now, we'll paginate later
            }
          );
          return entityData.map((item) => this.transformLoanApplication(item));

        case "loan-acceptance":
          entityData = await strapi.entityService.findMany(
            "api::loan-acceptance.loan-acceptance",
            {
              populate: populateFields,
              pagination: { start: 0, limit: -1 },
            }
          );
          return entityData.map((item) => this.transformLoanAcceptance(item));

        case "business-valuation":
          entityData = await strapi.entityService.findMany(
            "api::business-valuation.business-valuation",
            {
              populate: populateFields,
              pagination: { start: 0, limit: -1 },
            }
          );
          return entityData.map((item) =>
            this.transformBusinessValuation(item)
          );

        case "holofnama":
          entityData = await strapi.entityService.findMany(
            "api::holofnama.holofnama",
            {
              populate: populateFields,
              pagination: { start: 0, limit: -1 },
            }
          );
          return entityData.map((item) => this.transformHolofnama(item));

        case "bail-bond":
          entityData = await strapi.entityService.findMany(
            "api::bail-bond.bail-bond",
            {
              populate: populateFields,
              pagination: { start: 0, limit: -1 },
            }
          );
          return entityData.map((item) => this.transformBailBond(item));

        default:
          return [];
      }
    } catch (error) {
      strapi.log.error(`Error fetching ${domain} data:`, error);
      return [];
    }
  },

  /**
   * Get populate fields for each domain
   */
  getPopulateFields(domain: string): any {
    switch (domain) {
      case "loan-application":
        return {
          applicant_photos: true,
          applicant_signature: true,
          applicant_nid_doc: true,
          loanee_nid_doc: true,
          guarantors_document: true,
          social_evaluation: true,
          bank: true,
          approved_by: true,
          installments: true,
          bail_bonds: true,
          holofnama: true,
          loan_acceptance: true,
          business_valuation: true,
        };

      case "loan-acceptance":
        return {
          loanees: true,
          coordinator_signature: true,
          program_manager_signature: true,
          accounts_officer_signature: true,
          group_photo: true,
          loan_applications: true,
        };

      case "business-valuation":
        return {
          permanentBusinessAsset: true,
          continuedInvestment: true,
          businessExpense: true,
          requiredMaterialsForBusinessExtension: true,
          businessPossibleIncome: true,
          unitManagerSignature: true,
          programManagerSignature: true,
          loan_application: true,
        };

      case "holofnama":
        return {
          cheque_ack_cert: true,
          branch_manager_signature: true,
          unit_manager_signature: true,
          loan_applications: true,
        };

      case "bail-bond":
        return {
          first_guarantor_signature: true,
          second_guarantor_signature: true,
          loan_application: true,
        };

      default:
        return {};
    }
  },

  /**
   * Transform loan application data
   */
  transformLoanApplication(data: any): CombinedLoanData {
    const applicant: PersonInfo = {
      id: data.id,
      name: data.applicant_name,
      nationalId: data.national_id,
      phone: data.phone_number,
      address: data.current_address || data.permanent_address,
      age: data.age,
      gender: data.gender,
      educationLevel: data.education_level,
      photos: data.applicant_photos,
      signature: data.applicant_signature,
      nidDoc: data.applicant_nid_doc,
    };

    const loanee: PersonInfo | undefined =
      data.loanee_name && data.loanee_name !== data.applicant_name
        ? {
            id: data.id,
            name: data.loanee_name,
            nationalId: data.loanee_nid,
            nidDoc: data.loanee_nid_doc,
          }
        : undefined;

    const loan: LoanInfo = {
      id: data.id,
      formNo: data.form_no,
      memberNo: data.member_no,
      groupNo: data.group_no,
      loanNo: data.loan_no,
      amount: data.loan_amount_requested,
      duration: data.loan_duration,
      durationUnit: data.loan_duration_unit,
      purpose: data.loan_purpose,
      status: data.loan_status,
      businessType: data.business_type,
      userOfLoan: data.user_of_loan,
      applicationDate: data.application_date,
    };

    const installment: InstallmentInfo = {
      withMultipleInstallments: data.with_multiple_installments,
      installmentAmount: data.installment_amount,
      totalInstallments: data.total_installments,
      installmentDuration: data.installment_duration,
      installmentDurationUnit: data.installment_duration_unit,
    };

    const banking: BankingInfo = {
      mobileBankingType: data.mobile_banking_type,
      mobileBankingAccNo: data.mobile_banking_acc_no,
      hasBankAccount: data.has_bank_account,
      bankName: data.bank?.name,
      bankBranch: data.bank_branch,
      bankAccountTitle: data.bank_account_title,
      bankAccountNumber: data.bank_account_number,
    };

    return {
      id: data.id,
      domain: "loan-application",
      applicant,
      loanee,
      loan,
      installment,
      banking,
      flags: {
        hasLoanAcceptance: false,
        hasBusinessValuation: false,
        hasHolofnama: false,
        hasBailBond: false,
      },
      relations: {
        loanApplicationId: data.id,
        loanAcceptanceId: data.loan_acceptance?.id,
        businessValuationId: data.business_valuation?.id,
        holofnamaId: data.holofnama?.id,
        bailBondIds: data.bail_bonds?.map((bb) => bb.id) || [],
        installmentIds: data.installments?.map((inst) => inst.id) || [],
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  /**
   * Transform loan acceptance data
   */
  transformLoanAcceptance(data: any): CombinedLoanData {
    const applicant: PersonInfo = {
      id: data.id,
      name: data.group_leader_name || "Group Leader",
      educationLevel: data.education_level,
    };

    const loan: LoanInfo = {
      id: data.id,
      groupId: data.group_id,
      amount: data.previous_loan_amount || data.repayable_loan_amount,
      approvalDate: data.approval_meeting_date,
    };

    const installment: InstallmentInfo = {
      installmentStartDate: data.installment_start_date,
    };

    const program: ProgramInfo = {
      programName: data.program_name,
      district: data.district,
      groupLeaderName: data.group_leader_name,
      committeChairName: data.committee_chair_name,
      coordinatorSignature: data.coordinator_signature,
      programManagerSignature: data.program_manager_signature,
      accountsOfficerSignature: data.accounts_officer_signature,
      groupPhoto: data.group_photo,
    };

    return {
      id: data.id,
      domain: "loan-acceptance",
      applicant,
      loan,
      installment,
      program,
      flags: {
        hasLoanAcceptance: true,
        hasBusinessValuation: false,
        hasHolofnama: false,
        hasBailBond: false,
      },
      relations: {
        loanAcceptanceId: data.id,
        loanApplicationIds: data.loan_applications?.map((la) => la.id) || [],
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  /**
   * Transform business valuation data
   */
  transformBusinessValuation(data: any): CombinedLoanData {
    const applicant: PersonInfo = {
      id: data.id,
      name: data.applicantName,
    };

    const loan: LoanInfo = {
      id: data.id,
      amount: 0, // Business valuation doesn't have loan amount directly
    };

    const business: BusinessInfo = {
      companyName: data.companyName,
      placeOfBusiness: data.placeOfBusiness,
      businessDescription: data.businessDescription,
      reasonForLoan: data.reasonForLoan,
      appraiserName: data.appraiserName,
      permanentBusinessAsset: data.permanentBusinessAsset,
      continuedInvestment: data.continuedInvestment,
      businessExpense: data.businessExpense,
      requiredMaterials: data.requiredMaterialsForBusinessExtension,
      possibleIncome: data.businessPossibleIncome,
    };

    const program: ProgramInfo = {
      programName: data.programName,
      unitManagerSignature: data.unitManagerSignature,
      programManagerSignature: data.programManagerSignature,
    };

    return {
      id: data.id,
      domain: "business-valuation",
      applicant,
      loan,
      business,
      program,
      flags: {
        hasLoanAcceptance: false,
        hasBusinessValuation: true,
        hasHolofnama: false,
        hasBailBond: false,
      },
      relations: {
        businessValuationId: data.id,
        loanApplicationId: data.loan_application?.id,
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  /**
   * Transform holofnama data
   */
  transformHolofnama(data: any): CombinedLoanData {
    const applicant: PersonInfo = {
      id: data.id,
      name: data.branch_manager_name || data.unit_manager_name || "Manager",
    };

    const loan: LoanInfo = {
      id: data.id,
      amount: 0, // Holofnama doesn't have direct loan amount
    };

    const holofnama: HolofnamaInfo = {
      holofnamaDate: data.holofnama_date,
      chequeAckCert: data.cheque_ack_cert,
    };

    const program: ProgramInfo = {
      programName: data.program_name,
      branchManagerName: data.branch_manager_name,
      branchManagerSignature: data.branch_manager_signature,
      unitManagerName: data.unit_manager_name,
      unitManagerSignature: data.unit_manager_signature,
    };

    return {
      id: data.id,
      domain: "holofnama",
      applicant,
      loan,
      holofnama,
      program,
      flags: {
        hasLoanAcceptance: false,
        hasBusinessValuation: false,
        hasHolofnama: true,
        hasBailBond: false,
      },
      relations: {
        holofnamaId: data.id,
        loanApplicationIds: data.loan_applications?.map((la) => la.id) || [],
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  /**
   * Transform bail bond data
   */
  transformBailBond(data: any): CombinedLoanData {
    const applicant: PersonInfo = {
      id: data.id,
      name: data.loanee_name,
      nationalId: data.loanee_nid,
      phone: data.phone_no,
      address: data.full_address,
    };

    const loan: LoanInfo = {
      id: data.id,
      amount: data.loan_amount_requested,
    };

    const guarantors: GuarantorInfo[] = [
      {
        name: data.first_guarantor_name,
        nid: data.first_guarantor_nid,
        address: data.first_guarantor_address,
        phone: data.first_guarantor_phone,
        signature: data.first_guarantor_signature,
      },
      {
        name: data.second_guarantor_name,
        nid: data.second_guarantor_nid,
        address: data.second_guarantor_address,
        phone: data.second_guarantor_phone,
        signature: data.second_guarantor_signature,
      },
    ].filter((g) => g.name); // Only include guarantors with names

    return {
      id: data.id,
      domain: "bail-bond",
      applicant,
      loan,
      guarantors,
      flags: {
        hasLoanAcceptance: false,
        hasBusinessValuation: false,
        hasHolofnama: false,
        hasBailBond: true,
      },
      relations: {
        bailBondIds: [data.id],
        loanApplicationId: data.loan_application?.id,
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  /**
   * Apply filters to combined data
   */
  applyFilters(
    data: CombinedLoanData[],
    query: CombinedDataQuery
  ): CombinedLoanData[] {
    const {
      status,
      programName,
      district,
      applicantName,
      nationalId,
      loanAmountMin,
      loanAmountMax,
      dateFrom,
      dateTo,
    } = query;

    return data.filter((item) => {
      // Status filter
      if (status && item.loan.status !== status) {
        return false;
      }

      // Program name filter
      if (
        programName &&
        !item.program?.programName
          ?.toLowerCase()
          .includes(programName.toLowerCase())
      ) {
        return false;
      }

      // District filter
      if (district && item.program?.district !== district) {
        return false;
      }

      // Applicant name filter
      if (
        applicantName &&
        !item.applicant.name
          ?.toLowerCase()
          .includes(applicantName.toLowerCase())
      ) {
        return false;
      }

      // National ID filter
      if (
        nationalId &&
        String(item.applicant.nationalId) !== String(nationalId)
      ) {
        return false;
      }

      // Loan amount filters
      if (loanAmountMin && (item.loan.amount || 0) < loanAmountMin) {
        return false;
      }
      if (loanAmountMax && (item.loan.amount || 0) > loanAmountMax) {
        return false;
      }

      // Date filters
      if (dateFrom || dateTo) {
        const itemDate = new Date(item.loan.applicationDate || item.createdAt);
        if (dateFrom && itemDate < new Date(dateFrom)) {
          return false;
        }
        if (dateTo && itemDate > new Date(dateTo)) {
          return false;
        }
      }

      return true;
    });
  },

  /**
   * Get summary statistics
   */
  async getSummaryStatistics(): Promise<any> {
    try {
      const stats = {
        totalRecords: 0,
        domainCounts: {},
        statusDistribution: {},
        totalLoanAmount: 0,
        averageLoanAmount: 0,
        recentApplications: 0,
      };

      // Get counts for each domain
      const domainMap = {
        "loan-application": "api::loan-application.loan-application",
        "loan-acceptance": "api::loan-acceptance.loan-acceptance",
        "business-valuation": "api::business-valuation.business-valuation",
        holofnama: "api::holofnama.holofnama",
        "bail-bond": "api::bail-bond.bail-bond",
      };

      for (const [domain, entityType] of Object.entries(domainMap)) {
        try {
          const count = await strapi.entityService.count(entityType as any);
          stats.domainCounts[domain] = count;
          stats.totalRecords += count;
        } catch (error) {
          strapi.log.warn(`Failed to get count for ${domain}:`, error);
          stats.domainCounts[domain] = 0;
        }
      }

      // Get loan applications for detailed statistics
      const loanApplications = await strapi.entityService.findMany(
        "api::loan-application.loan-application",
        {
          fields: ["loan_amount_requested", "loan_status", "application_date"],
          pagination: { start: 0, limit: -1 },
        }
      );

      // Calculate loan statistics
      const totalAmount = loanApplications.reduce(
        (sum, app) => sum + (app.loan_amount_requested || 0),
        0
      );
      stats.totalLoanAmount = totalAmount;
      stats.averageLoanAmount =
        loanApplications.length > 0 ? totalAmount / loanApplications.length : 0;

      // Status distribution
      loanApplications.forEach((app) => {
        const status = app.loan_status || "unknown";
        stats.statusDistribution[status] =
          (stats.statusDistribution[status] || 0) + 1;
      });

      // Recent applications (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      stats.recentApplications = loanApplications.filter(
        (app) =>
          app.application_date && new Date(app.application_date) > thirtyDaysAgo
      ).length;

      return stats;
    } catch (error) {
      strapi.log.error("Error getting summary statistics:", error);
      throw new Error(`Failed to get summary statistics: ${error.message}`);
    }
  },

  /**
   * Fetch loan applications with all related data (LEFT JOIN approach)
   */
  async fetchLoanApplicationsWithRelations(
    query: CombinedDataQuery
  ): Promise<CombinedLoanData[]> {
    try {
      // Fetch all loan applications with their relations
      const loanApplications = await strapi.entityService.findMany(
        "api::loan-application.loan-application",
        {
          populate: {
            applicant_photos: true,
            applicant_signature: true,
            applicant_nid_doc: true,
            loanee_nid_doc: true,
            guarantors_document: true,
            social_evaluation: true,
            bank: true,
            approved_by: true,
            installments: true,
            bail_bonds: {
              populate: {
                first_guarantor_signature: true,
                second_guarantor_signature: true,
              },
            },
            holofnama: {
              populate: {
                cheque_ack_cert: true,
                branch_manager_signature: true,
                unit_manager_signature: true,
              },
            },
            loan_acceptance: {
              populate: {
                loanees: true,
                coordinator_signature: true,
                program_manager_signature: true,
                accounts_officer_signature: true,
                group_photo: true,
              },
            },
            business_valuation: {
              populate: {
                permanentBusinessAsset: true,
                continuedInvestment: true,
                businessExpense: true,
                requiredMaterialsForBusinessExtension: true,
                businessPossibleIncome: true,
                unitManagerSignature: true,
                programManagerSignature: true,
              },
            },
          },
          pagination: { start: 0, limit: -1 },
        }
      );

      // Transform each loan application with its related data
      return loanApplications.map((loanApp) =>
        this.transformLoanApplicationWithRelations(loanApp)
      );
    } catch (error) {
      strapi.log.error(
        "Error fetching loan applications with relations:",
        error
      );
      return [];
    }
  },

  /**
   * Transform loan application with all its related data
   */
  transformLoanApplicationWithRelations(data: any): CombinedLoanData {
    const applicant: PersonInfo = {
      id: data.id,
      name: data.applicant_name,
      nationalId: data.national_id,
      phone: data.phone_number,
      address: data.current_address || data.permanent_address,
      age: data.age,
      gender: data.gender,
      educationLevel: data.education_level,
      photos: data.applicant_photos,
      signature: data.applicant_signature,
      nidDoc: data.applicant_nid_doc,
    };

    const loanee: PersonInfo | undefined =
      data.loanee_name && data.loanee_name !== data.applicant_name
        ? {
            id: data.id,
            name: data.loanee_name,
            nationalId: data.loanee_nid,
            nidDoc: data.loanee_nid_doc,
          }
        : undefined;

    const loan: LoanInfo = {
      id: data.id,
      formNo: data.form_no,
      memberNo: data.member_no,
      groupNo: data.group_no,
      loanNo: data.loan_no,
      amount: data.loan_amount_requested,
      duration: data.loan_duration,
      durationUnit: data.loan_duration_unit,
      purpose: data.loan_purpose,
      status: data.loan_status,
      businessType: data.business_type,
      userOfLoan: data.user_of_loan,
      applicationDate: data.application_date,
    };

    const installment: InstallmentInfo = {
      withMultipleInstallments: data.with_multiple_installments,
      installmentAmount: data.installment_amount,
      totalInstallments: data.total_installments,
      installmentDuration: data.installment_duration,
      installmentDurationUnit: data.installment_duration_unit,
    };

    const banking: BankingInfo = {
      mobileBankingType: data.mobile_banking_type,
      mobileBankingAccNo: data.mobile_banking_acc_no,
      hasBankAccount: data.has_bank_account,
      bankName: data.bank?.name,
      bankBranch: data.bank_branch,
      bankAccountTitle: data.bank_account_title,
      bankAccountNumber: data.bank_account_number,
    };

    // Add related domain data if available
    let business: BusinessInfo | undefined;
    let program: ProgramInfo | undefined;
    let holofnama: HolofnamaInfo | undefined;
    let guarantors: GuarantorInfo[] | undefined;

    // Business valuation data
    if (data.business_valuation) {
      const bv = data.business_valuation;
      business = {
        companyName: bv.companyName,
        placeOfBusiness: bv.placeOfBusiness,
        businessDescription: bv.businessDescription,
        reasonForLoan: bv.reasonForLoan,
        appraiserName: bv.appraiserName,
        permanentBusinessAsset: bv.permanentBusinessAsset,
        continuedInvestment: bv.continuedInvestment,
        businessExpense: bv.businessExpense,
        requiredMaterials: bv.requiredMaterialsForBusinessExtension,
        possibleIncome: bv.businessPossibleIncome,
      };
    }

    // Loan acceptance / Program data
    if (data.loan_acceptance) {
      const la = data.loan_acceptance;
      program = {
        programName: la.program_name,
        district: la.district,
        groupLeaderName: la.group_leader_name,
        committeChairName: la.committee_chair_name,
        coordinatorSignature: la.coordinator_signature,
        programManagerSignature: la.program_manager_signature,
        accountsOfficerSignature: la.accounts_officer_signature,
        groupPhoto: la.group_photo,
      };

      // Update installment start date from loan acceptance
      if (la.installment_start_date) {
        installment.installmentStartDate = la.installment_start_date;
      }
    }

    // Holofnama data
    if (data.holofnama) {
      const hf = data.holofnama;
      holofnama = {
        holofnamaDate: hf.holofnama_date,
        chequeAckCert: hf.cheque_ack_cert,
      };

      // Add program info from holofnama if not available from loan acceptance
      if (!program) {
        program = {
          programName: hf.program_name,
          branchManagerName: hf.branch_manager_name,
          branchManagerSignature: hf.branch_manager_signature,
          unitManagerName: hf.unit_manager_name,
          unitManagerSignature: hf.unit_manager_signature,
        };
      }
    }

    // Bail bond data (guarantors)
    if (data.bail_bonds && data.bail_bonds.length > 0) {
      guarantors = [];
      data.bail_bonds.forEach((bb) => {
        if (bb.first_guarantor_name) {
          guarantors.push({
            name: bb.first_guarantor_name,
            nid: bb.first_guarantor_nid,
            address: bb.first_guarantor_address,
            phone: bb.first_guarantor_phone,
            signature: bb.first_guarantor_signature,
          });
        }
        if (bb.second_guarantor_name) {
          guarantors.push({
            name: bb.second_guarantor_name,
            nid: bb.second_guarantor_nid,
            address: bb.second_guarantor_address,
            phone: bb.second_guarantor_phone,
            signature: bb.second_guarantor_signature,
          });
        }
      });
    }

    return {
      id: data.id,
      domain: "loan-application",
      applicant,
      loanee,
      loan,
      installment,
      banking,
      guarantors,
      business,
      program,
      holofnama,
      flags: {
        hasLoanAcceptance: !!data.loan_acceptance,
        hasBusinessValuation: !!data.business_valuation,
        hasHolofnama: !!data.holofnama,
        hasBailBond: !!(data.bail_bonds && data.bail_bonds.length > 0),
      },
      relations: {
        loanApplicationId: data.id,
        loanAcceptanceId: data.loan_acceptance?.id,
        businessValuationId: data.business_valuation?.id,
        holofnamaId: data.holofnama?.id,
        bailBondIds: data.bail_bonds?.map((bb) => bb.id) || [],
        installmentIds: data.installments?.map((inst) => inst.id) || [],
      },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },

  /**
   * Get relation key for domain
   */
  getRelationKey(domain: string): string {
    switch (domain) {
      case "loan-acceptance":
        return "loanAcceptanceId";
      case "business-valuation":
        return "businessValuationId";
      case "holofnama":
        return "holofnamaId";
      case "bail-bond":
        return "bailBondIds";
      default:
        return "loanApplicationId";
    }
  },
});
