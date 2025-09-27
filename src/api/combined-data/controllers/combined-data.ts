import { Core } from "@strapi/strapi";
import { CombinedDataQuery } from "../types";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Get combined data from all domains
   * GET /api/combined-data
   */
  async find(ctx) {
    try {
      const query: CombinedDataQuery = {
        page: parseInt(ctx.query.page) || 1,
        pageSize: Math.min(parseInt(ctx.query.pageSize) || 25, 100), // Max 100 items per page
        domain: ctx.query.domain,
        status: ctx.query.status,
        programName: ctx.query.programName,
        district: ctx.query.district,
        applicantName: ctx.query.applicantName,
        nationalId: ctx.query.nationalId,
        loanAmountMin: parseFloat(ctx.query.loanAmountMin),
        loanAmountMax: parseFloat(ctx.query.loanAmountMax),
        dateFrom: ctx.query.dateFrom,
        dateTo: ctx.query.dateTo,
        sortBy: ctx.query.sortBy || "createdAt",
        sortOrder: ctx.query.sortOrder || "desc",
      };

      // Validate query parameters
      if (query.page < 1) {
        return ctx.badRequest("Page must be greater than 0");
      }

      if (query.pageSize < 1 || query.pageSize > 100) {
        return ctx.badRequest("Page size must be between 1 and 100");
      }

      if (query.sortOrder && !["asc", "desc"].includes(query.sortOrder)) {
        return ctx.badRequest('Sort order must be "asc" or "desc"');
      }

      const validSortFields = [
        "createdAt",
        "applicantName",
        "loanAmount",
        "applicationDate",
      ];
      if (query.sortBy && !validSortFields.includes(query.sortBy)) {
        return ctx.badRequest(
          `Sort by must be one of: ${validSortFields.join(", ")}`
        );
      }

      const validDomains = [
        "loan-application",
        "loan-acceptance",
        "business-valuation",
        "holofnama",
        "bail-bond",
      ];
      if (query.domain) {
        const domains = Array.isArray(query.domain)
          ? query.domain
          : [query.domain];
        const invalidDomains = domains.filter((d) => !validDomains.includes(d));
        if (invalidDomains.length > 0) {
          return ctx.badRequest(
            `Invalid domains: ${invalidDomains.join(", ")}. Valid domains: ${validDomains.join(", ")}`
          );
        }
      }

      // Get combined data
      const result = await strapi
        .service("api::combined-data.combined-data")
        .getCombinedData(query);

      ctx.send(result);
    } catch (error) {
      strapi.log.error("Error in combined-data.find:", error);
      ctx.internalServerError("Failed to fetch combined data");
    }
  },

  /**
   * Get summary statistics
   * GET /api/combined-data/summary
   */
  async summary(ctx) {
    try {
      const stats = await strapi
        .service("api::combined-data.combined-data")
        .getSummaryStatistics();
      ctx.send(stats);
    } catch (error) {
      strapi.log.error("Error in combined-data.summary:", error);
      ctx.internalServerError("Failed to fetch summary statistics");
    }
  },

  /**
   * Get a specific record by ID and domain
   * GET /api/combined-data/:domain/:id
   */
  async findOne(ctx) {
    try {
      const { domain, id } = ctx.params;

      const validDomains = [
        "loan-application",
        "loan-acceptance",
        "business-valuation",
        "holofnama",
        "bail-bond",
      ];
      if (!validDomains.includes(domain)) {
        return ctx.badRequest(
          `Invalid domain: ${domain}. Valid domains: ${validDomains.join(", ")}`
        );
      }

      if (!id || isNaN(parseInt(id))) {
        return ctx.badRequest("Valid ID is required");
      }

      // Fetch single record
      const query: CombinedDataQuery = {
        domain: [domain],
        page: 1,
        pageSize: 1,
      };

      const result = await strapi
        .service("api::combined-data.combined-data")
        .getCombinedData(query);
      const record = result.data.find((item) => item.id === parseInt(id));

      if (!record) {
        return ctx.notFound(
          `Record not found with ID ${id} in domain ${domain}`
        );
      }

      ctx.send({ data: record });
    } catch (error) {
      strapi.log.error("Error in combined-data.findOne:", error);
      ctx.internalServerError("Failed to fetch record");
    }
  },

  /**
   * Get records by applicant National ID
   * GET /api/combined-data/by-nid/:nid
   */
  async findByNationalId(ctx) {
    try {
      const { nid } = ctx.params;

      if (!nid) {
        return ctx.badRequest("National ID is required");
      }

      const query: CombinedDataQuery = {
        nationalId: nid,
        page: 1,
        pageSize: 100, // Get all records for this NID
      };

      const result = await strapi
        .service("api::combined-data.combined-data")
        .getCombinedData(query);

      ctx.send(result);
    } catch (error) {
      strapi.log.error("Error in combined-data.findByNationalId:", error);
      ctx.internalServerError("Failed to fetch records by National ID");
    }
  },

  /**
   * Get records by program name
   * GET /api/combined-data/by-program/:programName
   */
  async findByProgram(ctx) {
    try {
      const { programName } = ctx.params;

      if (!programName) {
        return ctx.badRequest("Program name is required");
      }

      const query: CombinedDataQuery = {
        programName: decodeURIComponent(programName),
        page: parseInt(ctx.query.page) || 1,
        pageSize: Math.min(parseInt(ctx.query.pageSize) || 25, 100),
      };

      const result = await strapi
        .service("api::combined-data.combined-data")
        .getCombinedData(query);

      ctx.send(result);
    } catch (error) {
      strapi.log.error("Error in combined-data.findByProgram:", error);
      ctx.internalServerError("Failed to fetch records by program");
    }
  },

  /**
   * Export data to CSV
   * GET /api/combined-data/export
   */
  async export(ctx) {
    try {
      const query: CombinedDataQuery = {
        ...ctx.query,
        page: 1,
        pageSize: 10000, // Large number for export
      };

      const result = await strapi
        .service("api::combined-data.combined-data")
        .getCombinedData(query);

      // Convert to CSV
      if (result.data.length === 0) {
        return ctx.notFound("No data found for export");
      }

      const csvRows = [];

      // Header row
      const headers = [
        "ID",
        "Domain",
        "Applicant Name",
        "National ID",
        "Phone",
        "Loan Amount",
        "Loan Status",
        "Application Date",
        "Program Name",
        "District",
        "Business Type",
        "Company Name",
        "Guarantor 1",
        "Guarantor 2",
      ];
      csvRows.push(headers.join(","));

      // Data rows
      result.data.forEach((item) => {
        const row = [
          item.id,
          item.domain,
          `"${item.applicant.name || ""}"`,
          item.applicant.nationalId || "",
          item.applicant.phone || "",
          item.loan.amount || 0,
          item.loan.status || "",
          item.loan.applicationDate || item.createdAt,
          `"${item.program?.programName || ""}"`,
          `"${item.program?.district || ""}"`,
          item.loan.businessType || "",
          `"${item.business?.companyName || ""}"`,
          `"${item.guarantors?.[0]?.name || ""}"`,
          `"${item.guarantors?.[1]?.name || ""}"`,
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");

      ctx.set("Content-Type", "text/csv");
      ctx.set(
        "Content-Disposition",
        `attachment; filename="combined-loan-data-${new Date().toISOString().split("T")[0]}.csv"`
      );
      ctx.send(csvContent);
    } catch (error) {
      strapi.log.error("Error in combined-data.export:", error);
      ctx.internalServerError("Failed to export data");
    }
  },
});
