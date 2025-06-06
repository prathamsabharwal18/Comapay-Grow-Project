import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/Admin/ProjectPage.module.css'; // Your CSS module
import Navbar from '../../components/AdminNavbar';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [addingProject, setAddingProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [editingAssignedEmployees, setEditingAssignedEmployees] = useState('');
  const [assignedEmployeesChanged, setAssignedEmployeesChanged] = useState(false);

  // State for tags input when adding a project (array of trimmed strings)
  const [addingTags, setAddingTags] = useState([]);

  // State for tags input when editing a project (string, comma separated)
  const [editingTagsString, setEditingTagsString] = useState('');

  // Hardcoded backend URL for consistency
  const RENDER_BACKEND_URL = 'https://comapay-grow-project.onrender.com';

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    // When editing project changes, update editingTagsString accordingly
    if (editingProject) {
      setEditingTagsString((editingProject.tags || []).join(', '));
      // Initialize assigned employees string for editing modal
      const userIds = (editingProject.assignedEmployees || [])
        .map(emp => {
          if (typeof emp === 'string') return emp; // If it's just the userId string
          if (emp && typeof emp === 'object' && emp.userId) return emp.userId; // If populated object
          return '';
        })
        .filter(id => id.length > 0)
        .join(', ');
      setEditingAssignedEmployees(userIds);
      setAssignedEmployeesChanged(false); // Reset this flag
    } else {
      setEditingTagsString('');
      setEditingAssignedEmployees(''); // Clear for add or after closing edit
    }
  }, [editingProject]); // Dependency on editingProject for proper initialization

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${RENDER_BACKEND_URL}/api/projects`);
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${RENDER_BACKEND_URL}/api/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      console.log('Deleting project:', projectId);
      await axios.delete(`${RENDER_BACKEND_URL}/api/projects/${projectId}`);
      fetchProjects();
      setConfirmDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      // More robust error handling
      if (axios.isAxiosError(err) && err.response) {
        alert(`Delete failed: ${err.response.data.message || err.response.statusText}`);
      } else {
        alert('Delete failed due to a network or server error.');
      }
    }
  };

  const handleComplete = async (projectId) => {
    try {
      // Assuming your backend changes the project status to 'completed'
      await axios.post(`${RENDER_BACKEND_URL}/api/projects/${projectId}/complete`);
      fetchProjects(); // Re-fetch to update status in UI
    } catch (err) {
      console.error('Complete error:', err);
      if (axios.isAxiosError(err) && err.response) {
        alert(`Failed to complete project: ${err.response.data.message || err.response.statusText}`);
      } else {
        alert('Failed to complete project due to a network or server error.');
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!addingProject.title || !addingProject.projectId || !addingProject.description || !addingProject.deadline) {
      alert('Please fill in all required fields: Title, Project ID, Description, Deadline.');
      return;
    }
    if (isNaN(addingProject.amount) || addingProject.amount < 0) {
      alert('Amount must be a non-negative number.');
      return;
    }

    const payload = {
      ...addingProject, // This now includes assignedUserIds from the state
      tasks: (addingProject.tasks || []).map(t => t.trim()).filter(t => t !== ''), // Ensure tasks are clean
      tags: addingTags.map(t => t.trim()).filter(t => t !== ''), // Use addingTags state
      amount: Number(addingProject.amount),
    };

    try {
      await axios.post(`${RENDER_BACKEND_URL}/api/projects`, payload);
      setAddingProject(false); // Close modal
      setAddingTags([]); // Clear tags input
      fetchProjects(); // Refresh project list
    } catch (err) {
      console.error('Add error:', err.response ? err.response.data : err.message);
      alert(`Failed to add project: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for required fields
    if (!editingProject.title || !editingProject.projectId || !editingProject.description || !editingProject.deadline) {
      alert('Please fill in all required fields: Title, Project ID, Description, Deadline.');
      return;
    }
    if (isNaN(editingProject.amount) || editingProject.amount < 0) {
      alert('Amount must be a non-negative number.');
      return;
    }

    let assignedUserIds;
    // If assignedEmployees input was changed, parse it
    if (assignedEmployeesChanged) {
      assignedUserIds = editingAssignedEmployees
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
    } else {
      // Otherwise, use the existing assigned employees (already mapped to userIds)
      assignedUserIds = editingProject.assignedEmployees
        .map(emp => (typeof emp === 'string' ? emp : emp?.userId))
        .filter(id => id); // Filter out any null/undefined/empty strings
    }

    // Parse editingTagsString into array
    const tagsArray = editingTagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    const payload = {
      ...editingProject, // Spread existing project data
      tasks: (editingProject.tasks || []).map(t => t.trim()).filter(t => t !== ''), // Clean tasks
      tags: tagsArray, // Use the parsed tags array
      assignedUserIds, // Use the determined assignedUserIds
      amount: Number(editingProject.amount),
    };

    try {
      await axios.put(`${RENDER_BACKEND_URL}/api/projects/${editingProject._id}`, payload);
      setEditingProject(null); // Close modal
      setEditingAssignedEmployees('');
      setAssignedEmployeesChanged(false);
      setEditingTagsString('');
      fetchProjects(); // Refresh project list
    } catch (err) {
      console.error('Edit error:', err.response ? err.response.data : err.message);
      alert(`Failed to edit project: ${err.response?.data?.message || err.message}`);
    }
  };

  const getEmployeeNames = (assignedEmployees) => {
    if (!assignedEmployees || assignedEmployees.length === 0) return 'No employees assigned';
    return assignedEmployees.map(emp => {
      // Check if emp is already a populated object
      if (emp && typeof emp === 'object' && emp.name) return emp.name;
      // If it's just a userId string, try to find the name from the fetched employees
      if (typeof emp === 'string') {
        const found = employees.find(e => e.userId === emp);
        return found ? found.name : emp; // Return name if found, else the userId
      }
      return '';
    }).filter(name => name.length > 0).join(', '); // Filter out empty strings
  };

  return (
    <main className={styles['admin-main']}>
      <Navbar />
      <div className={styles['projects-container']}> {/* Changed to projects-container for clarity */}
        {projects.length === 0 ? (
          <p>No projects found. Add one!</p>
        ) : (
          projects.map(project => (
            <div key={project._id} className={styles['project-card']}> {/* Changed to project-card for clarity */}
              <h3>{project.title} <small>({project.status})</small></h3>
              <p><strong>ID:</strong> {project.projectId}</p>
              <p>{project.description}</p>
              <p><strong>Amount:</strong> ₹{project.amount}</p>
              <p><strong>Deadline:</strong> {project.deadline}</p>
              <p><strong>Tasks:</strong> {(project.tasks || []).join(', ')}</p>
              <p><strong>Employees:</strong> {getEmployeeNames(project.assignedEmployees)}</p>

              {/* DISPLAY TAGS */}
              <p><strong>Tags:</strong> {(project.tags || []).join(', ')}</p>

              <div className={styles['card-actions']}>
                <button
                  className={styles['edit-btn']}
                  onClick={() => {
                    // Set the editingProject state directly from the project object
                    setEditingProject(project);
                    // The useEffect will handle initializing editingTagsString and editingAssignedEmployees
                  }}
                >
                  Edit
                </button>

                <button
                  className={styles['remove-btn']}
                  onClick={() => setConfirmDelete(project)}
                >
                  Delete
                </button>

                {/* Only show 'Complete' button if status is not already 'completed' */}
                {project.status !== 'completed' && (
                  <button
                    className={styles['primary-btn']}
                    onClick={() => handleComplete(project._id)}
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        className={styles['add-btn']}
        onClick={() => {
          setAddingProject({
            title: '',
            projectId: '',
            description: '',
            tasks: [],
            deadline: '',
            amount: 0,
            assignedUserIds: [], // Important: Initialize as empty array
            status: 'upcoming' // Default status for new projects
          });
          setAddingTags([]); // Reset tags input for new project
        }}
      >
        + Add Project
      </button>

      {/* Add Modal */}
      {addingProject && (
        <>
          <div className={styles.overlay} />
          <div className={styles.modal}>
            <h2>Add New Project</h2>
            <form onSubmit={handleAddSubmit}>
              <label>Title</label>
              <input
                type="text"
                required
                value={addingProject.title}
                onChange={e => setAddingProject({ ...addingProject, title: e.target.value })}
              />

              <label>Project ID</label>
              <input
                type="text"
                required
                value={addingProject.projectId}
                onChange={e => setAddingProject({ ...addingProject, projectId: e.target.value })}
              />

              <label>Description</label>
              <textarea
                value={addingProject.description}
                onChange={e => setAddingProject({ ...addingProject, description: e.target.value })}
              />

              <label>Deadline (e.g., YYYY-MM-DD)</label>
              <input
                type="text"
                value={addingProject.deadline}
                onChange={e => setAddingProject({ ...addingProject, deadline: e.target.value })}
                placeholder="e.g., 2025-12-31"
              />

              <label>Amount</label>
              <input
                type="number"
                value={addingProject.amount}
                onChange={e => setAddingProject({ ...addingProject, amount: Number(e.target.value) })}
              />

              <label>Tasks (comma separated)</label>
              <input
                type="text"
                value={(addingProject.tasks || []).join(', ')}
                onChange={e => setAddingProject({
                  ...addingProject,
                  tasks: e.target.value.split(',').map(t => t.trim()).filter(t => t) // Filter out empty strings
                })}
              />

              <label>Assign Employees (by userId, comma separated)</label>
              <input
                type="text"
                value={(addingProject.assignedUserIds || []).join(', ')}
                onChange={e => setAddingProject({
                  ...addingProject,
                  assignedUserIds: e.target.value.split(',').map(id => id.trim()).filter(id => id) // Filter out empty strings
                })}
              />

              {/* Tags input */}
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={addingTags.join(', ')}
                onChange={e => setAddingTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="e.g. frontend, backend, urgent"
              />

              <div className={styles['modal-actions']}>
                <button className={styles['primary-btn']} type="submit">Add Project</button>
                <button
                  className={styles['secondary-btn']}
                  type="button"
                  onClick={() => {
                    setAddingProject(false);
                    setAddingTags([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingProject && (
        <>
          <div className={styles.overlay} />
          <div className={styles.modal}>
            <h2>Edit Project</h2>
            <form onSubmit={handleEditSubmit}>
              <label>Title</label>
              <input
                type="text"
                required
                value={editingProject.title}
                onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
              />

              <label>Project ID</label>
              <input
                type="text"
                required
                value={editingProject.projectId}
                onChange={e => setEditingProject({ ...editingProject, projectId: e.target.value })}
              />

              <label>Description</label>
              <textarea
                value={editingProject.description}
                onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
              />

              <label>Deadline (e.g., YYYY-MM-DD)</label>
              <input
                type="text"
                value={editingProject.deadline}
                onChange={e => setEditingProject({ ...editingProject, deadline: e.target.value })}
                placeholder="e.g., 2025-12-31"
              />

              <label>Amount</label>
              <input
                type="number"
                value={editingProject.amount}
                onChange={e => setEditingProject({ ...editingProject, amount: Number(e.target.value) })}
              />

              <label>Tasks (comma separated)</label>
              <input
                type="text"
                value={(editingProject.tasks || []).join(', ')}
                onChange={e => setEditingProject({
                  ...editingProject,
                  tasks: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
              />

              <label>Edit Assigned Employees (by userId, comma separated)</label>
              <input
                type="text"
                value={editingAssignedEmployees} // This is managed by useEffect and handleEditSubmit
                onChange={e => {
                  setEditingAssignedEmployees(e.target.value);
                  setAssignedEmployeesChanged(true); // Indicate that this field was manually edited
                }}
              />

              {/* Tags input */}
              <label>Edit Tags (comma separated)</label>
              <input
                type="text"
                value={editingTagsString}
                onChange={e => setEditingTagsString(e.target.value)}
                placeholder="e.g. frontend, backend, urgent"
              />

              <div className={styles['modal-actions']}>
                <button className={styles['primary-btn']} type="submit">Save</button>
                <button
                  className={styles['secondary-btn']}
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setEditingAssignedEmployees(''); // Clear this on cancel
                    setAssignedEmployeesChanged(false); // Reset flag on cancel
                    setEditingTagsString(''); // Clear tags string on cancel
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <>
          <div className={styles.overlay} />
          <div className={styles.modal}>
            <p>Are you sure you want to delete project: <strong>{confirmDelete.title}</strong>?</p>
            <div className={styles['modal-actions']}>
              <button
                className={styles['remove-btn']}
                onClick={() => handleDelete(confirmDelete._id)}
              >
                Yes, Delete
              </button>
              <button
                className={styles['secondary-btn']}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default ProjectPage;