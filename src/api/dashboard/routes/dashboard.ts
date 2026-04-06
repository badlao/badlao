module.exports = {
  routes: [
    {
      method: "GET",
      path: "/dashboard/overview",
      handler: "dashboard.overview",
      config: {
        auth: false, // Make this endpoint public
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/dashboard/charts",
      handler: "dashboard.charts",
      config: {
        auth: false, // Make this endpoint public
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/dashboard/timeseries",
      handler: "dashboard.timeseries",
      config: {
        auth: false, // Make this endpoint public
        policies: [],
        middlewares: [],
      },
    },
  ],
};
