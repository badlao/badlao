export default {
  routes: [
    {
      method: "GET",
      path: "/combined-data",
      handler: "combined-data.find",
      config: {
        auth: false, // Set to true if you want authentication
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/combined-data/summary",
      handler: "combined-data.summary",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/combined-data/export",
      handler: "combined-data.export",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/combined-data/by-nid/:nid",
      handler: "combined-data.findByNationalId",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/combined-data/by-program/:programName",
      handler: "combined-data.findByProgram",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/combined-data/:domain/:id",
      handler: "combined-data.findOne",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
