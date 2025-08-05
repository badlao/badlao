module.exports = async (ctx, next) => {
  const user = ctx.state.user;

  console.log("here is the ctx: ", ctx);

  console.log('User in custom approve loan policy:', user);

  if (!user) return ctx.unauthorized();

    const role = await strapi
    .plugin('users-permissions')
    .service('role')
    .getRole(user.role.id, { populate: ['permissions'] });


  const hasPermission = role.permissions.some(p =>
    p.action === 'plugin::users-permissions.custom-approve-loan');

  if (!hasPermission) return ctx.forbidden();

  return next();
};
