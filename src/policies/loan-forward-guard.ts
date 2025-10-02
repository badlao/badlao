export default async (policyContext, config, { strapi }) => {
  if(true) return true;
  // Add your own logic here.
  // For example:
  const { user } = policyContext.state;
  if (!user) {
    return false;
  }

  const key = config.key || 'status';
  const requested = policyContext.request.body[key];
  if(!requested){
    return false;
  }
  const roleName = user.role?.name?.toLowerCase();
  if(!roleName){
    return false;
  }
  const roleMap = config?.map ?? [];
  const allowedRoles = (roleMap[requested] ??  []).map(r => r.toLowerCase());

  return allowedRoles.includes(roleName);
}