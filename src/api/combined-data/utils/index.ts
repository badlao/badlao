/**
 * Utility functions for data processing and validation
 */

export class DataDeduplicator {
  /**
   * Remove duplicate fields between applicant and loanee
   */
  static deduplicatePersonInfo(
    applicant: any,
    loanee: any
  ): { applicant: any; loanee?: any } {
    if (!loanee || !loanee.name) {
      return { applicant };
    }

    // If loanee is the same person as applicant, don't include separate loanee info
    if (
      loanee.name === applicant.name &&
      loanee.nationalId === applicant.nationalId
    ) {
      return { applicant };
    }

    // Remove fields from loanee that are identical to applicant
    const deduplicatedLoanee = { ...loanee };
    Object.keys(deduplicatedLoanee).forEach((key) => {
      if (applicant[key] === deduplicatedLoanee[key]) {
        delete deduplicatedLoanee[key];
      }
    });

    return { applicant, loanee: deduplicatedLoanee };
  }

  /**
   * Merge related data to avoid duplication
   */
  static mergeRelatedData(items: any[]): any[] {
    const merged = new Map();

    items.forEach((item) => {
      const key = `${item.applicant.nationalId || item.applicant.name}_${item.loan.formNo || item.id}`;

      if (merged.has(key)) {
        const existing = merged.get(key);
        // Merge relations
        existing.relations = {
          ...existing.relations,
          ...item.relations,
        };

        // Merge additional info based on domain
        if (item.business && !existing.business) {
          existing.business = item.business;
        }
        if (item.guarantors && !existing.guarantors) {
          existing.guarantors = item.guarantors;
        }
        if (item.holofnama && !existing.holofnama) {
          existing.holofnama = item.holofnama;
        }
        if (item.program && !existing.program) {
          existing.program = item.program;
        }
      } else {
        merged.set(key, item);
      }
    });

    return Array.from(merged.values());
  }
}

export class DataValidator {
  /**
   * Validate query parameters
   */
  static validateQuery(query: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (query.page !== undefined && (isNaN(query.page) || query.page < 1)) {
      errors.push("Page must be a positive number");
    }

    if (
      query.pageSize !== undefined &&
      (isNaN(query.pageSize) || query.pageSize < 1 || query.pageSize > 100)
    ) {
      errors.push("Page size must be between 1 and 100");
    }

    if (
      query.loanAmountMin !== undefined &&
      (isNaN(query.loanAmountMin) || query.loanAmountMin < 0)
    ) {
      errors.push("Minimum loan amount must be a non-negative number");
    }

    if (
      query.loanAmountMax !== undefined &&
      (isNaN(query.loanAmountMax) || query.loanAmountMax < 0)
    ) {
      errors.push("Maximum loan amount must be a non-negative number");
    }

    if (
      query.loanAmountMin !== undefined &&
      query.loanAmountMax !== undefined &&
      query.loanAmountMin > query.loanAmountMax
    ) {
      errors.push(
        "Minimum loan amount cannot be greater than maximum loan amount"
      );
    }

    if (query.dateFrom && !this.isValidDate(query.dateFrom)) {
      errors.push("Date from must be a valid date in YYYY-MM-DD format");
    }

    if (query.dateTo && !this.isValidDate(query.dateTo)) {
      errors.push("Date to must be a valid date in YYYY-MM-DD format");
    }

    if (
      query.dateFrom &&
      query.dateTo &&
      new Date(query.dateFrom) > new Date(query.dateTo)
    ) {
      errors.push("Date from cannot be after date to");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if date string is valid
   */
  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return (
      date instanceof Date &&
      !isNaN(date.getTime()) &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    );
  }
}

export class DataTransformer {
  /**
   * Transform Strapi media objects to simplified format
   */
  static transformMedia(media: any): any {
    if (!media) return null;

    if (Array.isArray(media)) {
      return media.map((m) => ({
        id: m.id,
        name: m.name,
        url: m.url,
        alternativeText: m.alternativeText,
        size: m.size,
        mime: m.mime,
      }));
    }

    return {
      id: media.id,
      name: media.name,
      url: media.url,
      alternativeText: media.alternativeText,
      size: media.size,
      mime: media.mime,
    };
  }

  /**
   * Sanitize and format currency values
   */
  static formatCurrency(amount: any): number {
    if (!amount) return 0;
    const num = parseFloat(amount.toString());
    return isNaN(num) ? 0 : Math.round(num * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Normalize phone numbers
   */
  static normalizePhone(phone: string): string {
    if (!phone) return "";
    return phone.replace(/[^\d+]/g, ""); // Keep only digits and +
  }

  /**
   * Normalize National ID
   */
  static normalizeNationalId(nid: any): string {
    if (!nid) return "";
    return nid.toString().replace(/[^\d]/g, ""); // Keep only digits
  }
}

export class ErrorHandler {
  /**
   * Handle and log errors consistently
   */
  static handle(
    error: any,
    context: string
  ): { message: string; code?: string } {
    console.error(`[${context}] Error:`, error);

    if (error.name === "ValidationError") {
      return {
        message: `Validation error: ${error.message}`,
        code: "VALIDATION_ERROR",
      };
    }

    if (error.name === "CastError") {
      return {
        message: "Invalid data format provided",
        code: "CAST_ERROR",
      };
    }

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return {
        message: "Database connection error",
        code: "DB_CONNECTION_ERROR",
      };
    }

    return {
      message: error.message || "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}
