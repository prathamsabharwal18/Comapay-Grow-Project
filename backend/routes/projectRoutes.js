import express from 'express';
import Project from '../models/Project.js';
import Employee from '../models/Employee.js';

const router = express.Router();

// Create project with multiple employees assigned
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['current', 'upcoming'] };
    }

    const projects = await Project.find(filter).populate('assignedEmployees', 'name');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { title, description, amount, employees } = req.body; // employees: array of employee names

    // Create project document
    const project = new Project({
      title,
      description,
      amount,
      employees, // array of employee names
      completed: false,
    });

    await project.save();

    // Add project ID to each assigned employee's projects array
    if (employees && employees.length > 0) {
      await Promise.all(
        employees.map(async (empName) => {
          const emp = await Employee.findOne({ name: empName });
          if (emp) {
            if (!emp.projects.includes(project._id)) {
              emp.projects.push(project._id);
              await emp.save();
            }
          }
        })
      );
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete project, update all assigned employees accordingly
router.put('/complete/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.completed) return res.status(400).json({ message: 'Project already completed' });

    project.completed = true;
    await project.save();

    if (project.employees && project.employees.length > 0) {
      await Promise.all(
        project.employees.map(async (empName) => {
          const emp = await Employee.findOne({ name: empName });
          if (emp) {
            // Remove project from active projects
            emp.projects = emp.projects.filter(projId => !projId.equals(project._id));

            // Add project to completedProjects if not already present
            if (!emp.completedProjects.includes(project._id)) {
              emp.completedProjects.push(project._id);
            }

            // Add project amount to employee's amount
            emp.amount = (emp.amount || 0) + project.amount;

            await emp.save();
          }
        })
      );
    }

    res.json({ message: 'Project completed and employees updated', project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Edit project and update employee assignments
router.put('/edit/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, description, amount, employees } = req.body; // employees: array of employee names

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Update project fields
    project.title = title || project.title;
    project.description = description || project.description;
    project.amount = amount || project.amount;

    if (employees && Array.isArray(employees)) {
      const oldEmployees = project.employees || [];

      // Employees removed
      const removedEmployees = oldEmployees.filter(e => !employees.includes(e));
      // Employees added
      const addedEmployees = employees.filter(e => !oldEmployees.includes(e));

      // Remove project from removed employees
      await Promise.all(
        removedEmployees.map(async (empName) => {
          const emp = await Employee.findOne({ name: empName });
          if (emp) {
            emp.projects = emp.projects.filter(projId => !projId.equals(project._id));
            await emp.save();
          }
        })
      );

      // Add project to added employees
      await Promise.all(
        addedEmployees.map(async (empName) => {
          const emp = await Employee.findOne({ name: empName });
          if (emp && !emp.projects.includes(project._id)) {
            emp.projects.push(project._id);
            await emp.save();
          }
        })
      );

      project.employees = employees;

      // **Status change logic**
      if (project.status === 'upcoming' && employees.length > 0) {
        project.status = 'current';
      }
    }

    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const {
      title,
      description,
      tasks,
      deadline,
      assignedUserIds,  // List of userIds like ['emp001', 'emp002']
      status,
      tags,
      amount
    } = req.body;

    // Map userIds to ObjectIds
    const employeeDocs = await Employee.find({ userId: { $in: assignedUserIds } }, '_id');
    const assignedObjectIds = employeeDocs.map(emp => emp._id);

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        title,
        description,
        tasks,
        deadline,
        assignedEmployees: assignedObjectIds,
        // We will handle status below
        tags,
        amount,
      },
      { new: true }
    );

    // Remove project from all previous employees
    await Employee.updateMany(
      { projects: projectId },
      { $pull: { projects: projectId } }
    );

    // Add project to newly assigned employees
    await Employee.updateMany(
      { _id: { $in: assignedObjectIds } },
      { $addToSet: { projects: projectId } }
    );

    // **Status change logic: update status to 'current' if it was 'upcoming' and employees assigned**
    if (updatedProject.status === 'upcoming' && assignedObjectIds.length > 0) {
      updatedProject.status = 'current';
      await updatedProject.save();
    } else if (status) {
      // If status provided explicitly and different, update it
      updatedProject.status = status;
      await updatedProject.save();
    }

    res.json(updatedProject);
  } catch (error) {
    console.error('Error editing project:', error);
    res.status(500).json({ message: 'Failed to edit project' });
  }
});

router.post('/:id/complete', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const amount = project.amount;

    // Update each assigned employee
    await Promise.all(project.assignedEmployees.map(async (empId) => {
      await Employee.findByIdAndUpdate(empId, {
        $pull: { projects: project._id },
        $addToSet: { completedProjects: project._id },
        $inc: { amount: amount }
      });
    }));

    project.status = 'completed';
    await project.save();

    res.json({ message: 'Project marked as completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to complete project' });
  }
});
// Add new project
router.post('/', async (req, res) => {
  try {
    const {
      title,
      projectId,
      description,
      tasks,
      deadline,
      assignedUserIds,
      status,
      tags,
      amount
    } = req.body;

    // Step 1: Map userIds to ObjectIds
    const employeeDocs = await Employee.find({ userId: { $in: assignedUserIds } }, '_id');
    const assignedObjectIds = employeeDocs.map(emp => emp._id);

    // Step 2: Create the project
    const newProject = new Project({
      title,
      projectId,
      description,
      tasks,
      deadline,
      assignedEmployees: assignedObjectIds,
      status,
      tags,
      amount,
    });

    const savedProject = await newProject.save();

    // Step 3: Update assigned employees
    await Employee.updateMany(
      { _id: { $in: assignedObjectIds } },
      { $addToSet: { projects: savedProject._id } }
    );

    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});
router.get('/myprojects', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId query param' });

    // Find the employee document by userId
    const employee = await Employee.findOne({ userId });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    // Fetch projects whose _id is in employee.projects array AND status is current or upcoming
    const projects = await Project.find({
      _id: { $in: employee.projects },
      status: { $in: ['current', 'upcoming'] }
    });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch employee projects' });
  }
});
// Add this to your project routes file (e.g. routes/project.js)

router.get('/upcoming', async (req, res) => {
  try {
    const upcomingProjects = await Project.find({ status: 'upcoming' });
    res.json(upcomingProjects);
  } catch (err) {
    console.error('Failed to fetch upcoming projects:', err);
    res.status(500).json({ error: 'Failed to fetch upcoming projects' });
  }
});
router.delete('/:id', async (req, res) => {
    try {
        const projectId = req.params.id;

        // Step 1: Find the project to get its details before deleting it
        // This is important because we need its ID to pull from employees
        const projectToDelete = await Project.findById(projectId);

        if (!projectToDelete) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Step 2: Delete the project from the Project collection
        await Project.findByIdAndDelete(projectId);
        console.log(`Project with ID ${projectId} deleted from Project collection.`);

        // Step 3: Remove this project's ID from ALL employees' 'projects' array
        await Employee.updateMany(
            { projects: projectToDelete._id }, // Find employees who have this project in their 'projects' array
            { $pull: { projects: projectToDelete._id } } // Remove it
        );
        console.log(`Project ID ${projectId} removed from 'projects' array of employees.`);

        // Step 4: Remove this project's ID from ALL employees' 'completedProjects' array
        await Employee.updateMany(
            { completedProjects: projectToDelete._id }, // Find employees who have this project in their 'completedProjects' array
            { $pull: { completedProjects: projectToDelete._id } } // Remove it
        );
        console.log(`Project ID ${projectId} removed from 'completedProjects' array of employees.`);

        res.json({ message: 'Project and its references deleted successfully' });

    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Failed to delete project' });
    }
});

export default router;