/**
 * A set of functions called "actions" for `dashboard`
 */

export default {
  async overview(ctx) {
    try {
      const overviewData = await strapi
        .service("api::dashboard.dashboard")
        .getOverviewStats();

      ctx.send({
        status: "success",
        data: overviewData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching dashboard overview:", error);
      ctx.badRequest("Failed to fetch dashboard overview data");
    }
  },

  async charts(ctx) {
    try {
      const chartsData = await strapi
        .service("api::dashboard.dashboard")
        .getChartsData();

      ctx.send({
        status: "success",
        data: chartsData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching dashboard charts:", error);
      ctx.badRequest("Failed to fetch dashboard charts data");
    }
  },

  async timeseries(ctx) {
    try {
      const { period } = ctx.query;
      const timeseriesData = await strapi
        .service("api::dashboard.dashboard")
        .getTimeseriesData(period || "12months");

      ctx.send({
        status: "success",
        data: timeseriesData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching dashboard timeseries:", error);
      ctx.badRequest("Failed to fetch dashboard timeseries data");
    }
  },
};
