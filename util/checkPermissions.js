const CustomErros = require("../errors");

const checkPermissions = (requestUser, resourceId) => {
  if (requestUser?.role === "admin") return; //admin can access to any user

  if (requestUser?.userId === resourceId.toString()) return; // if user is trying to fetch itself

  throw new CustomErros.Unauthorized("Unathorized to access this route");
};

module.exports = checkPermissions;
