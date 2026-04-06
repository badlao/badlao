/**
 * dashboard service
 */

export default () => ({
  async getOverviewStats() {
    try {
      // Get total applications count
      const totalApplications = await strapi.entityService.count(
        "api::loan-application.loan-application"
      );

      // Get applications by loan_status
      const pendingApplications = await strapi.entityService.count(
        "api::loan-application.loan-application",
        {
          filters: {
            loan_status: {
              $in: [
                "DRAFT",
                "INITIATE_APPROVAL_PROCESS",
                "FORWARDED_FOR_APPROVAL",
                "IN_PROGRESS",
              ],
            },
          },
        }
      );

      const approvedApplications = await strapi.entityService.count(
        "api::loan-application.loan-application",
        {
          filters: {
            loan_status: "APPROVED",
          },
        }
      );

      const rejectedApplications = await strapi.entityService.count(
        "api::loan-application.loan-application",
        {
          filters: {
            loan_status: "REJECTED",
          },
        }
      );

      // For disbursed loans, we'll use approved applications for now
      // This is a simplified approach - you may need to adjust based on your business logic
      const disbursedLoans = await strapi.entityService.count(
        "api::loan-application.loan-application",
        {
          filters: {
            loan_status: "APPROVED",
          },
        }
      );

      // Calculate total loan amount (sum of all approved loan amounts)
      const loanApplications = await strapi.entityService.findMany(
        "api::loan-application.loan-application",
        {
          filters: {
            loan_status: "APPROVED",
          },
          fields: ["loan_amount_requested"],
        }
      );

      const totalLoanAmount = loanApplications.reduce((sum, loan) => {
        return sum + (loan.loan_amount_requested || 0);
      }, 0);

      // Calculate approval rate (approved applications / total applications * 100)
      const approvalRate =
        totalApplications > 0
          ? parseFloat(
              ((approvedApplications / totalApplications) * 100).toFixed(1)
            )
          : 0;

      // Calculate recovery rate - this would need actual recovery data
      // For now, using a placeholder calculation
      const recoveryRate =
        disbursedLoans > 0
          ? parseFloat((Math.random() * 30 + 10).toFixed(1)) // Placeholder: random between 10-40%
          : 0;

      return {
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        disbursedLoans,
        totalLoanAmount: parseFloat(totalLoanAmount.toFixed(2)),
        recoveryRate,
        approvalRate,
      };
    } catch (error) {
      console.error("Error in getOverviewStats service:", error);
      throw error;
    }
  },

  async getChartsData() {
    try {
      // Get all loan applications for analysis
      const allApplications = await strapi.entityService.findMany(
        "api::loan-application.loan-application",
        {
          fields: [
            "loan_status",
            "age",
            "loan_purpose",
            "loan_amount_requested",
          ],
        }
      );

      const totalCount = allApplications.length;

      // Status Distribution
      const statusCounts = {};
      allApplications.forEach((app) => {
        const status = app.loan_status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const statusDistribution = {
        type: "pie",
        data: [
          {
            label: "Approved",
            value:
              totalCount > 0
                ? parseFloat(
                    (
                      ((statusCounts["APPROVED"] || 0) / totalCount) *
                      100
                    ).toFixed(1)
                  )
                : 0,
            count: statusCounts["APPROVED"] || 0,
          },
          {
            label: "Rejected",
            value:
              totalCount > 0
                ? parseFloat(
                    (
                      ((statusCounts["REJECTED"] || 0) / totalCount) *
                      100
                    ).toFixed(1)
                  )
                : 0,
            count: statusCounts["REJECTED"] || 0,
          },
          {
            label: "Pending",
            value:
              totalCount > 0
                ? parseFloat(
                    (
                      (((statusCounts["DRAFT"] || 0) +
                        (statusCounts["INITIATE_APPROVAL_PROCESS"] || 0)) /
                        totalCount) *
                      100
                    ).toFixed(1)
                  )
                : 0,
            count:
              (statusCounts["DRAFT"] || 0) +
              (statusCounts["INITIATE_APPROVAL_PROCESS"] || 0),
          },
          {
            label: "Under Review",
            value:
              totalCount > 0
                ? parseFloat(
                    (
                      (((statusCounts["FORWARDED_FOR_APPROVAL"] || 0) +
                        (statusCounts["IN_PROGRESS"] || 0)) /
                        totalCount) *
                      100
                    ).toFixed(1)
                  )
                : 0,
            count:
              (statusCounts["FORWARDED_FOR_APPROVAL"] || 0) +
              (statusCounts["IN_PROGRESS"] || 0),
          },
        ],
      };

      // Loan Type Distribution (using loan_purpose field)
      const loanTypeCounts = {};
      allApplications.forEach((app) => {
        const purpose = app.loan_purpose || "Other";
        // Categorize loan purposes into common types
        let category = "Personal Loan"; // default
        if (
          purpose.toLowerCase().includes("home") ||
          purpose.toLowerCase().includes("house")
        ) {
          category = "Home Loan";
        } else if (
          purpose.toLowerCase().includes("auto") ||
          purpose.toLowerCase().includes("car") ||
          purpose.toLowerCase().includes("vehicle")
        ) {
          category = "Auto Loan";
        } else if (
          purpose.toLowerCase().includes("business") ||
          purpose.toLowerCase().includes("trade")
        ) {
          category = "Business Loan";
        }
        loanTypeCounts[category] = (loanTypeCounts[category] || 0) + 1;
      });

      const loanTypeDistribution = {
        type: "bar",
        data: Object.entries(loanTypeCounts).map(([category, count]) => ({
          category,
          count: count as number,
          percentage:
            totalCount > 0
              ? parseFloat((((count as number) / totalCount) * 100).toFixed(1))
              : 0,
        })),
      };

      // Age Group Distribution
      const ageGroups = {
        "18-25": 0,
        "26-35": 0,
        "36-45": 0,
        "46-55": 0,
        "55+": 0,
      };

      const ageGroupApproved = {
        "18-25": 0,
        "26-35": 0,
        "36-45": 0,
        "46-55": 0,
        "55+": 0,
      };

      allApplications.forEach((app) => {
        const age = app.age || 30; // default age if not provided
        let ageGroup = "26-35"; // default
        if (age >= 18 && age <= 25) ageGroup = "18-25";
        else if (age >= 26 && age <= 35) ageGroup = "26-35";
        else if (age >= 36 && age <= 45) ageGroup = "36-45";
        else if (age >= 46 && age <= 55) ageGroup = "46-55";
        else if (age > 55) ageGroup = "55+";

        ageGroups[ageGroup]++;
        if (app.loan_status === "APPROVED") {
          ageGroupApproved[ageGroup]++;
        }
      });

      const ageGroupDistribution = {
        type: "bar",
        data: Object.entries(ageGroups).map(([ageGroup, count]) => ({
          ageGroup,
          count,
          approvalRate:
            count > 0
              ? parseFloat(
                  ((ageGroupApproved[ageGroup] / count) * 100).toFixed(1)
                )
              : 0,
        })),
      };

      // Income Range Distribution (using loan_amount_requested as proxy for income capacity)
      const incomeRanges = {
        "0-25k": 0,
        "25k-50k": 0,
        "50k-75k": 0,
        "75k-100k": 0,
        "100k+": 0,
      };

      const incomeRangeApproved = {
        "0-25k": 0,
        "25k-50k": 0,
        "50k-75k": 0,
        "75k-100k": 0,
        "100k+": 0,
      };

      allApplications.forEach((app) => {
        const loanAmount = app.loan_amount_requested || 25000; // default amount
        let range = "25k-50k"; // default
        if (loanAmount <= 25000) range = "0-25k";
        else if (loanAmount <= 50000) range = "25k-50k";
        else if (loanAmount <= 75000) range = "50k-75k";
        else if (loanAmount <= 100000) range = "75k-100k";
        else range = "100k+";

        incomeRanges[range]++;
        if (app.loan_status === "APPROVED") {
          incomeRangeApproved[range]++;
        }
      });

      const incomeRangeDistribution = {
        type: "bar",
        data: Object.entries(incomeRanges).map(([range, count]) => ({
          range,
          count,
          approvalRate:
            count > 0
              ? parseFloat(
                  ((incomeRangeApproved[range] / count) * 100).toFixed(1)
                )
              : 0,
        })),
      };

      return {
        statusDistribution,
        loanTypeDistribution,
        ageGroupDistribution,
        incomeRangeDistribution,
      };
    } catch (error) {
      console.error("Error in getChartsData service:", error);
      throw error;
    }
  },

  async getTimeseriesData(period = "12months") {
    try {
      // Parse period parameter to determine months
      let monthsToFetch = 12;
      if (period.includes("months")) {
        monthsToFetch = parseInt(period.replace("months", "")) || 12;
      } else if (period.includes("year")) {
        monthsToFetch = parseInt(period.replace("year", "")) * 12 || 12;
      }

      // Generate date range for the specified period
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - monthsToFetch + 1);
      startDate.setDate(1); // First day of the month

      // Get all loan applications within the date range
      const allApplications = await strapi.entityService.findMany(
        "api::loan-application.loan-application",
        {
          filters: {
            application_date: {
              $gte: startDate.toISOString(),
              $lte: endDate.toISOString(),
            },
          },
          fields: ["application_date", "loan_status", "loan_amount_requested"],
        }
      );

      // Generate month labels for the period
      const months = [];
      for (let i = monthsToFetch - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
        months.push(monthKey);
      }

      // Initialize data structures for each month
      const monthlyData = {};
      months.forEach((month) => {
        monthlyData[month] = {
          applications: { total: 0, approved: 0, rejected: 0, pending: 0 },
          loanAmounts: { total: 0, count: 0 },
        };
      });

      // Process applications and group by month
      allApplications.forEach((app) => {
        if (!app.application_date) return;

        const appDate = new Date(app.application_date);
        const monthKey = appDate.toISOString().slice(0, 7);

        if (monthlyData[monthKey]) {
          // Count applications by status
          monthlyData[monthKey].applications.total++;

          switch (app.loan_status) {
            case "APPROVED":
              monthlyData[monthKey].applications.approved++;
              // Add to loan amounts if approved
              if (app.loan_amount_requested) {
                monthlyData[monthKey].loanAmounts.total +=
                  app.loan_amount_requested;
                monthlyData[monthKey].loanAmounts.count++;
              }
              break;
            case "REJECTED":
              monthlyData[monthKey].applications.rejected++;
              break;
            case "DRAFT":
            case "INITIATE_APPROVAL_PROCESS":
            case "FORWARDED_FOR_APPROVAL":
            case "IN_PROGRESS":
              monthlyData[monthKey].applications.pending++;
              break;
          }
        }
      });

      // Format data for response
      const applications = months.map((month) => ({
        month,
        count: monthlyData[month].applications.total,
        approved: monthlyData[month].applications.approved,
        rejected: monthlyData[month].applications.rejected,
        pending: monthlyData[month].applications.pending,
      }));

      const loanAmounts = months.map((month) => {
        const data = monthlyData[month];
        const averageAmount =
          data.loanAmounts.count > 0
            ? Math.round(data.loanAmounts.total / data.loanAmounts.count)
            : 0;

        return {
          month,
          totalAmount: data.loanAmounts.total,
          averageAmount,
        };
      });

      return {
        applications,
        loanAmounts,
      };
    } catch (error) {
      console.error("Error in getTimeseriesData service:", error);
      throw error;
    }
  },
});
