import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  projectId: { type: String, required: true },
  description: String,
  tasks: [{ type: String }],
  deadline: String,
  assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  status: { type: String, enum: ['current', 'upcoming', 'completed'], required: true },
  tags: [{ type: String }],
  amount: { type: Number, required: true },
});

const Project = mongoose.model('CompanyProject', projectSchema); // Matches your 'companyprojects' collection
export default Project;
