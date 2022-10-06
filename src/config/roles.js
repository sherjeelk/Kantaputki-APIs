const roles = ['user', 'admin', 'service'];

const roleRights = new Map();
roleRights.set(roles[0], ['user']);
roleRights.set(roles[2], ['service']);
roleRights.set(roles[1], ['getUsers', 'manageUsers']);

module.exports = {
  roles,
  roleRights,
};
