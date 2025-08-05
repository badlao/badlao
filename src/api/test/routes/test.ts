export default {
  routes: [
    {
     method: 'GET',
     path: '/test',
     handler: 'test.exampleAction',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
