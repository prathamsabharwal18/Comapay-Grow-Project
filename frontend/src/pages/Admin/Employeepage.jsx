import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/AdminNavbar'; // Assuming admin navbar for this page
import styles from '../../styles/Admin/AllEmployeesPage.module.css'; // Your CSS module

const AllEmployeesPage = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // State for the Add Employee Modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        userId: '',
        Email: '',
        password: '',
        role: 'employee', // Default role based on your model
        tags: '', // Will be comma-separated string in input, converted to array on submit
    });

    // State for Delete Confirmation Modal
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null); // Stores the employee object to be deleted

    // State for Search
    const [searchTerm, setSearchTerm] = useState('');

    // Function to fetch employees (extracted for reusability)
    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('https://comapay-grow-project.onrender.com/api/employees'); // Endpoint to get all employees
            setEmployees(res.data);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError('Failed to fetch employee data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []); // Fetch employees on component mount

    const handleCardClick = (employeeId) => {
        navigate(`/employees/${employeeId}`); // Navigate to the specific employee's profile
    };

    const handleAddEmployeeSubmit = async (e) => {
        e.preventDefault();

        // Basic validation for required fields from your model
        if (!newEmployee.name || !newEmployee.userId || !newEmployee.Email || !newEmployee.password || !newEmployee.role) {
            alert('Please fill all required fields: Name, User ID, Email, Password, and Role.');
            return;
        }

        // Convert comma-separated strings to arrays
        const payload = {
            name: newEmployee.name,
            userId: newEmployee.userId,
            Email: newEmployee.Email,
            password: newEmployee.password,
            role: newEmployee.role,
            tags: newEmployee.tags.split(',').map(s => s.trim()).filter(s => s),
            // Badges and Amount are not sent as per your request, assuming backend handles defaults
        };

        try {
            await axios.post('https://comapay-grow-project.onrender.com/api/employees/register', payload);
            alert('Employee added successfully!');
            handleCloseAddModal(); // Close modal and reset form
            fetchEmployees(); // Re-fetch employees to update the list
        } catch (err) {
            console.error('Error adding employee:', err.response ? err.response.data : err.message);
            alert(`Failed to add employee: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setNewEmployee({ // Reset form data when closing, excluding amount and badges
            name: '',
            userId: '',
            Email: '',
            password: '',
            role: 'employee',
            tags: '',
        });
    };

    // --- Delete Functionality ---
    const handleDeleteClick = (employee, e) => {
        e.stopPropagation(); // Prevent card click when delete button is pressed
        console.log('Delete clicked for employee:', employee);
        setEmployeeToDelete(employee);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        try {
            console.log(employeeToDelete);
            // Assuming your backend uses userId for delete, adjust if it uses _id
            await axios.delete(`https://comapay-grow-project.onrender.com/api/employees/remove/${employeeToDelete.userId}`);
            alert('Employee deleted successfully!');
            fetchEmployees(); // Re-fetch employees to update the list
            cancelDelete(); // Close the confirmation modal
        } catch (err) {
            console.error('Error deleting employee:', err.response ? err.response.data : err.message);
            alert(`Failed to delete employee: ${err.response?.data?.message || err.message}`);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setEmployeeToDelete(null); // Clear the employee to delete
    };

    // --- Search/Filter Functionality ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredEmployees = employees.filter(employee => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const matchesName = employee.name.toLowerCase().includes(lowerCaseSearchTerm);
        const matchesTags = employee.tags && employee.tags.some(tag =>
            tag.toLowerCase().includes(lowerCaseSearchTerm)
        );
        return matchesName || matchesTags;
    });


    if (loading) return <p className={styles['loading-message']}>Loading employees...</p>;
    if (error) return <p className={styles['error-message']}>{error}</p>;

    return (
        <>
            <Navbar />
            <main className={styles['admin-main']}>
                <h1 className={styles['page-title']}>All Employees</h1>

                <div className={styles['action-bar']}>
                    <input
                        type="text"
                        placeholder="Search by name or tag..."
                        className={styles['search-input']}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <button
                        className={styles['add-employee-btn']}
                        onClick={() => setShowAddModal(true)}
                    >
                        + Add Employee
                    </button>
                </div>

                <div className={styles['employees-container']}>
                    {filteredEmployees.length === 0 ? (
                        <p className={styles['no-employees-message']}>
                            {searchTerm ? `No employees found matching "${searchTerm}".` : 'No employees found. Add one!'}
                        </p>
                    ) : (
                        filteredEmployees.map(employee => (
                            <div
                                key={employee._id}
                                className={styles['employee-card']}
                                onClick={() => handleCardClick(employee.userId)} // Pass userId for navigation
                            >
                                <div className={styles['profile-icon']}>👤</div>
                                <div className={styles['employee-info']}>
                                    <h3>{employee.name}</h3>
                                    <p className={styles['employee-detail']}><strong>ID:</strong> {employee.userId}</p>
                                    <p className={styles['employee-detail']}><strong>Role:</strong> {employee.role}</p>
                                    <p className={styles['employee-detail']}><strong>Email:</strong> {employee.Email || 'N/A'}</p>
                                    {/* These are commented out as per your request not to show them,
                                        but if your backend returns them, they could be displayed */}
                                    {/* <p className={styles['employee-detail']}>
                                        <strong>Amount:</strong> ₹{employee.amount !== undefined ? employee.amount : 'N/A'}
                                    </p> */}
                                    <p className={styles['employee-detail']}>
                                        <strong>Badges:</strong>{' '}
                                        {employee.badges && employee.badges.length > 0 ? employee.badges.join(', ') : 'None'}
                                    </p>
                                    <p className={styles['employee-detail']}>
                                        <strong>Tags:</strong>{' '}
                                        {employee.tags && employee.tags.length > 0 ? employee.tags.join(', ') : 'None'}
                                    </p>
                                </div>
                                <div className={styles['card-actions']}>
                                    <button
                                        className={`${styles['base-button']} ${styles['view-profile-btn']}`}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent card click from firing
                                            handleCardClick(employee.userId);
                                        }}
                                    >
                                        View Profile
                                    </button>
                                    <button
                                        className={`${styles['base-button']} ${styles['delete-employee-btn']}`}
                                        onClick={(e) => handleDeleteClick(employee, e)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Employee Modal */}
                {showAddModal && (
                    <>
                        <div className={styles.overlay} onClick={handleCloseAddModal}></div>
                        <div className={styles.modal}>
                            <h2 className={styles['modal-title']}>Add New Employee</h2>
                            <form onSubmit={handleAddEmployeeSubmit}>
                                <label className={styles['form-label']}>Name</label>
                                <input
                                    type="text"
                                    className={styles['form-input']}
                                    required
                                    value={newEmployee.name}
                                    onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                />

                                <label className={styles['form-label']}>User ID</label>
                                <input
                                    type="text"
                                    className={styles['form-input']}
                                    required
                                    value={newEmployee.userId}
                                    onChange={e => setNewEmployee({ ...newEmployee, userId: e.target.value })}
                                />

                                <label className={styles['form-label']}>Email</label>
                                <input
                                    type="email"
                                    className={styles['form-input']}
                                    required
                                    value={newEmployee.Email}
                                    onChange={e => setNewEmployee({ ...newEmployee, Email: e.target.value })}
                                />

                                <label className={styles['form-label']}>Password</label>
                                <input
                                    type="password"
                                    className={styles['form-input']}
                                    required
                                    value={newEmployee.password}
                                    onChange={e => setNewEmployee({ ...newEmployee, password: e.target.value })}
                                />

                                <label className={styles['form-label']}>Role</label>
                                <select
                                    className={styles['form-input']}
                                    value={newEmployee.role}
                                    onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    {/* Add other roles as needed */}
                                </select>

                                <label className={styles['form-label']}>Tags (comma separated)</label>
                                <input
                                    type="text"
                                    className={styles['form-input']}
                                    value={newEmployee.tags}
                                    onChange={e => setNewEmployee({ ...newEmployee, tags: e.target.value })}
                                    placeholder="e.g., frontend, backend, HR"
                                />

                                <div className={styles['modal-actions']}>
                                    <button type="submit" className={`${styles['base-button']} ${styles['primary-btn']}`}>
                                        Add Employee
                                    </button>
                                    <button type="button" className={`${styles['base-button']} ${styles['secondary-btn']}`} onClick={handleCloseAddModal}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && employeeToDelete && (
                    <>
                        <div className={styles.overlay} onClick={cancelDelete}></div>
                        <div className={styles.modal}>
                            <h2 className={styles['modal-title']}>Confirm Deletion</h2>
                            <p>Are you sure you want to delete employee <strong>{employeeToDelete.name} ({employeeToDelete.userId})</strong>?</p>
                            <div className={styles['modal-actions']}>
                                <button type="button" className={`${styles['base-button']} ${styles['delete-confirm-btn']}`} onClick={confirmDelete}>
                                    Yes, Delete
                                </button>
                                <button type="button" className={`${styles['base-button']} ${styles['secondary-btn']}`} onClick={cancelDelete}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </>
    );
};

export default AllEmployeesPage;