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

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await axios.get('https://comapay-grow-project.onrender.com/api/employees'); // Endpoint to get all employees
                setEmployees(res.data);
            } catch (err) {
                console.error('Error fetching employees:', err);
                setError('Failed to fetch employee data.');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

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
            setLoading(true); // Set loading to true to re-fetch
            const res = await axios.get('https://comapay-grow-project.onrender.com/api/employees'); // Re-fetch employees
            setEmployees(res.data);
            setLoading(false);
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

    if (loading) return <p className={styles['loading-message']}>Loading employees...</p>;
    if (error) return <p className={styles['error-message']}>{error}</p>;

    return (
        <>
            <Navbar />
            <main className={styles['admin-main']}>
                <h1 className={styles['page-title']}>All Employees</h1>

                <button
                    className={styles['add-employee-btn']}
                    onClick={() => setShowAddModal(true)}
                >
                    + Add Employee
                </button>

                <div className={styles['employees-container']}>
                    {employees.length === 0 ? (
                        <p className={styles['no-employees-message']}>No employees found. Add one!</p>
                    ) : (
                        employees.map(employee => (
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
                                    {/* <p className={styles['employee-detail']}>
                                        <strong>Badges:</strong>{' '}
                                        {employee.badges && employee.badges.length > 0 ? employee.badges.join(', ') : 'None'}
                                    </p> */}
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

                                {/* Removed Amount field from the form */}
                                {/* <label className={styles['form-label']}>Amount</label>
                                <input
                                    type="number"
                                    className={styles['form-input']}
                                    value={newEmployee.amount}
                                    onChange={e => setNewEmployee({ ...newEmployee, amount: Number(e.target.value) })}
                                /> */}

                                {/* Removed Badges field from the form */}
                                {/* <label className={styles['form-label']}>Badges (comma separated)</label>
                                <input
                                    type="text"
                                    className={styles['form-input']}
                                    value={newEmployee.badges}
                                    onChange={e => setNewEmployee({ ...newEmployee, badges: e.target.value })}
                                    placeholder="e.g., Star Performer, Innovator"
                                /> */}

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
            </main>
        </>
    );
};

export default AllEmployeesPage;