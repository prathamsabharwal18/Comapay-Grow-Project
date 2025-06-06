import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/AdminNavbar'; // Assuming admin navbar for this page
import styles from '../../styles/Admin/AllEmployeesPage.module.css'; // New CSS module

const AllEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
  console.log(employees);

  if (loading) return <p>Loading employees...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (employees.length === 0) return <p>No employees found.</p>;

  const handleCardClick = (employeeId) => {
    navigate(`/employees/${employeeId}`); // Navigate to the specific employee's profile
  };

  return (
    <main className={styles['admin-main']}>
      <Navbar />
      <div className={styles['employees-container']}>
        <h1>All Employees</h1>
        {employees.map(employee => (
          <div
            key={employee._id}
            className={styles['employee-card']}
            onClick={() => handleCardClick(employee.userId)} // Pass userId for navigation
          >
            <div className={styles['profile-icon']}>👤</div>
            <div className={styles['employee-info']}>
              <h3>{employee.name}</h3>
              <p><strong>ID:</strong> {employee.userId}</p>
              <p><strong>Role:</strong> {employee.role}</p>
              <p><strong>Email:</strong> {employee.Email || 'N/A'}</p>
              <p>
                <strong>Badges:</strong>{' '}
                {employee.badges && employee.badges.length > 0 ? employee.badges.join(', ') : 'None'}
              </p>
              <p>
                <strong>Tags:</strong>{' '}
                {employee.tags && employee.tags.length > 0 ? employee.tags.join(', ') : 'None'}
              </p>
            </div>
            <div className={styles['card-actions']}>
              {/* You can add more actions here if needed, e.g., Edit Employee */}
              <button 
                className={styles['view-profile-btn']}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click from firing
                  handleCardClick(employee.userId);
                }}
              >
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AllEmployeesPage;