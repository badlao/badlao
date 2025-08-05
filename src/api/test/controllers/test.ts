/**
 * A set of functions called "actions" for `test`
 */

export default {
  exampleAction: async (ctx, next) => {
    try {
      console.log('Executing example action in test controller...');
      const { id } = ctx.params;
      const user = ctx.state.user;
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  }
};
