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

    // --- CORRECTION HERE ---
    // Populate 'assignedEmployees' to include 'userId' and 'name'
    const projects = await Project.find(filter).populate('assignedEmployees', 'userId name');
    // --- END CORRECTION ---

    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err); // Added console.error for server-side debugging
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/create', async (req, res) => {
  try {
    // Note: Your frontend seems to send 'assignedUserIds' not 'employees' array of names for project creation
    // If you intend to use 'employees' (array of names) here, the logic below is for that.
    // If frontend sends assignedUserIds, consider unifying routes or adjusting.
    const { title, description, amount, employees, projectId, tasks, deadline, status, tags } = req.body;

    // If 'employees' are names, find their IDs
    let assignedObjectIds = [];
    if (employees && employees.length > 0) {
        const employeeDocs = await Employee.find({ name: { $in: employees } }, '_id');
        assignedObjectIds = employeeDocs.map(emp => emp._id);
    }

    // Create project document
    const project = new Project({
      title,
      description,
      amount,
      projectId, // Assuming projectId is now passed for new projects
      tasks,
      deadline,
      status: status || 'upcoming', // Default to 'upcoming' if not provided
      tags,
      assignedEmployees: assignedObjectIds, // Store ObjectIds
      completed: false, // Assuming 'completed' is a separate field or status handles this
    });

    await project.save();

    // Add project ID to each assigned employee's projects array
    if (assignedObjectIds && assignedObjectIds.length > 0) {
      await Employee.updateMany(
        { _id: { $in: assignedObjectIds } },
        { $addToSet: { projects: project._id } }
      );
    }

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error); // Added console.error for server-side debugging
    res.status(500).json({ message: error.message });
  }
});

// Complete project, update all assigned employees accordingly
router.put('/complete/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId).populate('assignedEmployees', 'name'); // Populate to access employee names if needed
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Assuming 'completed' field is being deprecated in favor of 'status: completed'
    // if (project.completed) return res.status(400).json({ message: 'Project already completed' });

    // Use status field
    if (project.status === 'completed') return res.status(400).json({ message: 'Project already completed' });

    project.status = 'completed'; // Update status field
    await project.save();

    // Loop through assignedEmployees (which are now ObjectIds due to schema)
    // We update based on _id which is what's stored in assignedEmployees
    if (project.assignedEmployees && project.assignedEmployees.length > 0) {
      await Promise.all(
        project.assignedEmployees.map(async (empObj) => { // empObj will be the populated employee object if populated
          // If assignedEmployees is just an array of ObjectIds, use empObj directly
          const empId = empObj._id || empObj; // Handles both populated object and raw ObjectId string/object

          await Employee.findByIdAndUpdate(empId, {
            $pull: { projects: project._id },
            $addToSet: { completedProjects: project._id },
            $inc: { amount: project.amount } // Assuming amount is numeric
          });
        })
      );
    }

    res.json({ message: 'Project completed and employees updated', project });
  } catch (error) {
    console.error('Error completing project:', error); // Added console.error for server-side debugging
    res.status(500).json({ message: error.message });
  }
});

// Edit project and update employee assignments (using 'employees' name array)
// Note: You have another PUT /:id route which uses 'assignedUserIds'.
// Consider consolidating these or clarifying their distinct uses.
router.put('/edit/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, description, amount, employees } = req.body; // employees: array of employee names

    const project = await Project.findById(projectId).populate('assignedEmployees'); // Populate current assigned for comparison
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Update project fields
    project.title = title || project.title;
    project.description = description || project.description;
    project.amount = amount || project.amount; // Ensure 'amount' is treated as a number in frontend/body

    if (employees && Array.isArray(employees)) {
      // Get current assigned Employee _ids
      const currentAssignedIds = project.assignedEmployees.map(emp => emp._id.toString());
      const currentAssignedNames = project.assignedEmployees.map(emp => emp.name);


      // Find ObjectIds for new employees by name
      const newEmployeeDocs = await Employee.find({ name: { $in: employees } }, '_id name');
      const newAssignedObjectIds = newEmployeeDocs.map(emp => emp._id);
      const newAssignedNames = newEmployeeDocs.map(emp => emp.name);


      // Employees removed (by name comparison)
      const removedNames = currentAssignedNames.filter(name => !newAssignedNames.includes(name));
      // Employees added (by name comparison)
      const addedNames = newAssignedNames.filter(name => !currentAssignedNames.includes(name));


      // Remove project from removed employees
      if (removedNames.length > 0) {
        const removedEmployeeIds = await Employee.find({ name: { $in: removedNames } }, '_id');
        await Employee.updateMany(
          { _id: { $in: removedEmployeeIds.map(e => e._id) } },
          { $pull: { projects: project._id } }
        );
      }

      // Add project to added employees
      if (addedNames.length > 0) {
        const addedEmployeeIds = await Employee.find({ name: { $in: addedNames } }, '_id');
        await Employee.updateMany(
          { _id: { $in: addedEmployeeIds.map(e => e._id) } },
          { $addToSet: { projects: project._id } }
        );
      }

      // Update project's assignedEmployees with the new ObjectIds
      project.assignedEmployees = newAssignedObjectIds;

      // **Status change logic**
      if (project.status === 'upcoming' && newAssignedObjectIds.length > 0) {
        project.status = 'current';
      }
    }

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Error editing project (by name):', error); // Added console.error for server-side debugging
    res.status(500).json({ message: error.message });
  }
});

// Primary route for updating project details including assigned employees by userId
router.put('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    const {
      title,
      description,
      tasks,
      deadline,
      assignedUserIds, // List of userIds like ['emp001', 'emp002']
      status, // Allows explicit status update
      tags,
      amount
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Step 1: Map incoming userIds to Employee ObjectIds
    let assignedObjectIds = [];
    if (assignedUserIds && assignedUserIds.length > 0) {
      const employeeDocs = await Employee.find({ userId: { $in: assignedUserIds } }, '_id');
      assignedObjectIds = employeeDocs.map(emp => emp._id);
    }

    // Step 2: Determine which employees were removed/added
    const oldAssignedObjectIds = project.assignedEmployees.map(id => id.toString()); // Convert to string for comparison
    const newAssignedObjectIdsStrings = assignedObjectIds.map(id => id.toString());

    const removedEmployeeIds = oldAssignedObjectIds.filter(id => !newAssignedObjectIdsStrings.includes(id));
    const addedEmployeeIds = newAssignedObjectIdsStrings.filter(id => !oldAssignedObjectIds.includes(id));


    // Step 3: Update employee documents for added/removed projects
    // Remove project from previous employees
    if (removedEmployeeIds.length > 0) {
      await Employee.updateMany(
        { _id: { $in: removedEmployeeIds } },
        { $pull: { projects: projectId } }
      );
    }

    // Add project to newly assigned employees
    if (addedEmployeeIds.length > 0) {
      await Employee.updateMany(
        { _id: { $in: addedEmployeeIds } },
        { $addToSet: { projects: projectId } }
      );
    }

    // Step 4: Update the project document itself
    project.title = title !== undefined ? title : project.title;
    project.description = description !== undefined ? description : project.description;
    project.tasks = tasks !== undefined ? tasks : project.tasks;
    project.deadline = deadline !== undefined ? deadline : project.deadline;
    project.assignedEmployees = assignedObjectIds; // Update the project's assignedEmployees
    project.tags = tags !== undefined ? tags : project.tags;
    project.amount = amount !== undefined ? amount : project.amount;

    // Step 5: **Status change logic for this route**
    // If status is provided explicitly, use it. Otherwise, apply default logic.
    if (status !== undefined) {
      project.status = status;
    } else if (project.status === 'upcoming' && assignedObjectIds.length > 0) {
      // If it was upcoming and now has assigned employees, change to current
      project.status = 'current';
    } else if (project.status === 'current' && assignedObjectIds.length === 0) {
      // If it was current and now has no assigned employees, perhaps revert to upcoming? (Your logic might vary)
      // For now, let's keep it current unless explicitly set, or if it was upcoming.
      // Or you might set it back to 'upcoming' if no employees. Decided to keep 'current' logic from before.
    }

    const updatedProject = await project.save(); // Save the project with all updates

    res.json(updatedProject);
  } catch (error) {
    console.error('Error editing project (by userId):', error); // Added console.error for server-side debugging
    res.status(500).json({ message: 'Failed to edit project' });
  }
});

router.post('/:id/complete', async (req, res) => {
  try {
    // Populate assignedEmployees to correctly update their projects array
    const project = await Project.findById(req.params.id).populate('assignedEmployees');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.status === 'completed') return res.status(400).json({ error: 'Project already completed' });


    const amount = project.amount;

    // Update each assigned employee by their _id
    await Promise.all(project.assignedEmployees.map(async (emp) => {
      await Employee.findByIdAndUpdate(emp._id, { // Use emp._id here because it's populated
        $pull: { projects: project._id },
        $addToSet: { completedProjects: project._id },
        $inc: { amount: amount }
      });
    }));

    project.status = 'completed';
    await project.save();

    res.json({ message: 'Project marked as completed' });
  } catch (err) {
    console.error('Error completing project:', err); // Added console.error for server-side debugging
    res.status(500).json({ error: 'Failed to complete project' });
  }
});

// Add new project (using 'assignedUserIds')
router.post('/', async (req, res) => {
  try {
    const {
      title,
      projectId,
      description,
      tasks,
      deadline,
      assignedUserIds, // List of userIds like ['emp001', 'emp002']
      status,
      tags,
      amount
    } = req.body;

    // Step 1: Map userIds to ObjectIds
    let assignedObjectIds = [];
    if (assignedUserIds && assignedUserIds.length > 0) {
      const employeeDocs = await Employee.find({ userId: { $in: assignedUserIds } }, '_id');
      assignedObjectIds = employeeDocs.map(emp => emp._id);
    }

    // Step 2: Create the project
    const newProject = new Project({
      title,
      projectId,
      description,
      tasks,
      deadline,
      assignedEmployees: assignedObjectIds,
      status: status || (assignedObjectIds.length > 0 ? 'current' : 'upcoming'), // Default status logic
      tags,
      amount,
    });

    const savedProject = await newProject.save();

    // Step 3: Update assigned employees
    if (assignedObjectIds.length > 0) {
      await Employee.updateMany(
        { _id: { $in: assignedObjectIds } },
        { $addToSet: { projects: savedProject._id } }
      );
    }

    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error); // Added console.error for server-side debugging
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
    // Populate assignedEmployees here as well if the frontend needs their details on this route
    const projects = await Project.find({
      _id: { $in: employee.projects },
      status: { $in: ['current', 'upcoming'] }
    }).populate('assignedEmployees', 'userId name'); // Added populate here too

    res.json(projects);
  } catch (err) {
    console.error('Error fetching employee projects:', err); // Added console.error for server-side debugging
    res.status(500).json({ error: 'Failed to fetch employee projects' });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    // Populate assignedEmployees here as well if the frontend needs their details on this route
    const upcomingProjects = await Project.find({ status: 'upcoming' })
      .populate('assignedEmployees', 'userId name'); // Added populate here too
    res.json(upcomingProjects);
  } catch (err) {
    console.error('Failed to fetch upcoming projects:', err); // Added console.error for server-side debugging
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
    console.error('Error deleting project:', error); // Added console.error for server-side debugging
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

export default router;