// After saving or updating a project:
await Employee.updateMany(
  { projects: project._id },
  { $pull: { projects: project._id } }
); // Remove this project from all employees first

await Employee.updateMany(
  { _id: { $in: assignedEmployees } },
  { $addToSet: { projects: project._id } }
); // Add to newly assigned employees
