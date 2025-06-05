import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/Admin/Projectpage.module.css'; // Your CSS module
import Navbar from '../../components/AdminNavbar';

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [addingProject, setAddingProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [editingAssignedEmployees, setEditingAssignedEmployees] = useState('');
  const [assignedEmployeesChanged, setAssignedEmployeesChanged] = useState(false);

  // NEW state for tags input in Add form
  const [addingTags, setAddingTags] = useState([]);

  // NEW state for tags input in Edit form (string, comma separated)
  const [editingTagsString, setEditingTagsString] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    // When editing project changes, update editingTagsString accordingly
    if (editingProject) {
      setEditingTagsString((editingProject.tags || []).join(', '));
    } else {
      setEditingTagsString('');
    }
  }, [editingProject]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleDelete = async (projectId) => {
    try {
      console.log('Deleting project:', projectId);
      await axios.delete(`/api/projects/${projectId}`);
      fetchProjects();
      setConfirmDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleComplete = async (projectId) => {
    try {
      await axios.post(`/api/projects/${projectId}/complete`);
      fetchProjects();
    } catch (err) {
      console.error('Complete error:', err);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload with tags as array of trimmed strings
    const payload = {
      title: addingProject.title,
      projectId: addingProject.projectId,
      description: addingProject.description,
      tasks: addingProject.tasks || [],
      deadline: addingProject.deadline,
      amount: addingProject.amount,
      status: addingProject.status,
      assignedUserIds: addingProject.assignedUserIds || [],
      tags: addingTags.map(t => t.trim()).filter(t => t !== ''),
    };

    try {
      await axios.post('/api/projects', payload);
      setAddingProject(false);
      setAddingTags([]);
      fetchProjects();
    } catch (err) {
      console.error('Add error:', err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    let assignedUserIds;

    if (assignedEmployeesChanged) {
      assignedUserIds = editingAssignedEmployees
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
    } else {
      assignedUserIds = editingProject.assignedEmployees.map(emp => {
        if (typeof emp === 'string') return emp;
        if (emp && typeof emp === 'object' && emp.userId) return emp.userId;
        return '';
      }).filter(id => id.length > 0);
    }

    // Parse editingTagsString into array
    const tagsArray = editingTagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    const payload = {
      title: editingProject.title,
      projectId: editingProject.projectId,
      description: editingProject.description,
      tasks: editingProject.tasks || [],
      deadline: editingProject.deadline,
      amount: editingProject.amount,
      status: editingProject.status,
      tags: tagsArray,
      assignedUserIds,
    };

    try {
      await axios.put(`/api/projects/${editingProject._id}`, payload);
      setEditingProject(null);
      setEditingAssignedEmployees('');
      setAssignedEmployeesChanged(false);
      setEditingTagsString('');
      fetchProjects();
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  const getEmployeeNames = (assignedEmployees) => {
    if (!assignedEmployees) return '';
    return assignedEmployees.map(emp => {
      if (typeof emp === 'string') {
        const found = employees.find(e => e.userId === emp);
        return found ? found.name : emp;
      }
      if (emp && typeof emp === 'object') return emp.name || emp.userId || '';
      return '';
    }).join(', ');
  };

  return (
    <main className={styles['admin-main']}>
      <Navbar />
      <div className={styles['courses-container']}>
        {projects.map(project => (
          <div key={project._id} className={styles['course-card']}>
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
                  setEditingProject(project);
                  const userIds = (project.assignedEmployees || []).map(emp => {
                    if (typeof emp === 'string') return emp;
                    if (emp && typeof emp === 'object' && emp.userId) return emp.userId;
                    return '';
                  }).filter(id => id.length > 0).join(', ');
                  if(userIds.length>0){
                    project.status='current';
                  }
                  setEditingAssignedEmployees(userIds);
                  setAssignedEmployeesChanged(false);

                  // Also set editing tags string for the modal
                  setEditingTagsString((project.tags || []).join(', '));
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

              <button
                className={styles['primary-btn']}
                onClick={() => handleComplete(project._id)}
              >
                Complete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className={styles['add-btn']}
        onClick={() => {
          setAddingProject({
            title: '', projectId: '', description: '', tasks: [],
            deadline: '', amount: 0, assignedUserIds: [], status: 'upcoming'
          });
          setAddingTags([]); // reset tags input
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

              <label>Deadline</label>
              <input
                type="text"
                value={addingProject.deadline}
                onChange={e => setAddingProject({ ...addingProject, deadline: e.target.value })}
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
                  tasks: e.target.value.split(',').map(t => t.trim())
                })}
              />

              <label>Assign Employees (by userId, comma separated)</label>
              <input
                type="text"
                value={(addingProject.assignedUserIds || []).join(', ')}
                onChange={e => setAddingProject({
                  ...addingProject,
                  assignedUserIds: e.target.value.split(',').map(id => id.trim()).filter(id => id)
                })}
              />

              {/* NEW Tags input */}
              <label>Tags (comma separated)</label>
              <input
                type="text"
                value={addingTags.join(', ')}
                onChange={e => setAddingTags(e.target.value.split(',').map(t => t.trim()))}
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

              <label>Deadline</label>
              <input
                type="text"
                value={editingProject.deadline}
                onChange={e => setEditingProject({ ...editingProject, deadline: e.target.value })}
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
                  tasks: e.target.value.split(',').map(t => t.trim())
                })}
              />

              <label>Edit Assigned Employees (by userId, comma separated)</label>
              <input
                type="text"
                value={editingAssignedEmployees}
                onChange={e => {
                  setEditingAssignedEmployees(e.target.value);
                  setAssignedEmployeesChanged(true);
                }}
              />

              {/* NEW Tags input */}
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
                    setEditingAssignedEmployees('');
                    setAssignedEmployeesChanged(false);
                    setEditingTagsString('');
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
