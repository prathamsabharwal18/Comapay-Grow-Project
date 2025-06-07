import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar'; // Assuming this Navbar is appropriate for employees
import styles from '../../styles/Employee/ProfilePage.module.css';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useParams } from 'react-router-dom'; // Import useParams
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const EmployeeProfilePage = () => {
  const { userId: paramUserId } = useParams(); // Get userId from URL params
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false); // State for withdraw button loading
  const [withdrawMessage, setWithdrawMessage] = useState(''); // State for withdraw success/error messages

  // Determine which userId to use: URL param first, then localStorage
  const currentUserId = paramUserId || localStorage.getItem('userId');

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!currentUserId) {
        setError('No user ID provided. Please login or navigate from a valid link.');
        setLoading(false);
        return;
      }
      try {
        // Fetch employee profile data, including populated courses and projects
        const res = await axios.get(`https://comapay-grow-project.onrender.com/api/employees/profile/${currentUserId}`);
        setEmployee(res.data);
      } catch (err) {
        setError('Failed to fetch employee data. User might not exist or network issue.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [currentUserId]); // Dependency on currentUserId

  // Handle Withdrawal function
  const handleWithdraw = async () => {
    if (employee.amount <= 0) {
      setWithdrawMessage('No amount to withdraw.');
      return;
    }

    setWithdrawLoading(true);
    setWithdrawMessage(''); // Clear previous messages

    try {
      // Make a PUT request to your backend to reset the employee's amount to 0
      // You'll need to create this endpoint in your backend (e.g., /api/employees/reset-amount/:userId)
      const res = await axios.put(`https://comapay-grow-project.onrender.com/api/employees/reset-amount/${currentUserId}`);

      if (res.status === 200) {
        setWithdrawMessage('Amount withdrawn successfully! Your balance has been reset to ₹0.00.');
        // Optimistically update the UI to show 0 amount immediately
        setEmployee(prevEmployee => ({
          ...prevEmployee,
          amount: 0,
        }));
      } else {
        setWithdrawMessage('Withdrawal failed: Unexpected response from server.');
      }
    } catch (err) {
      console.error('Error during withdrawal:', err);
      setWithdrawMessage(`Withdrawal failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setWithdrawLoading(false);
    }
  };


  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!employee) return <p>No employee data found.</p>;

  // Prepare data for Course Completion Chart:
  const allCourseIds = new Set([...employee.enrolledCourses.map(c => c._id), ...employee.completedCourses.map(c => c._id)]);
  const totalUniqueCourses = allCourseIds.size;

  const courseDoughnutData = {
    labels: ['Completed Courses', 'Enrolled (In Progress)'],
    datasets: [
      {
        label: 'Courses',
        data: [employee.completedCourses.length, employee.enrolledCourses.length],
        backgroundColor: ['#4CAF50', '#F44336'], // Green for completed, Red for in progress
        hoverOffset: 10,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Prepare data for Projects Doughnut Chart:
  const assignedProjectsCount = employee.projects ? employee.projects.length : 0;
  const completedProjectsCount = employee.completedProjects ? employee.completedProjects.length : 0;
  const inProgressProjectsCount = assignedProjectsCount - completedProjectsCount;

  const projectDoughnutData = {
    labels: ['Completed Projects', 'Assigned (In Progress) Projects'],
    datasets: [
      {
        label: 'Projects',
        data: [completedProjectsCount, inProgressProjectsCount > 0 ? inProgressProjectsCount : 0],
        backgroundColor: ['#2196F3', '#FFC107'], // Blue for completed, Amber for in progress
        hoverOffset: 10,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Earnings Bar Chart Data
  const barData = {
    labels: ['Available Amount (₹)'],
    datasets: [
      {
        label: 'Earnings',
        data: [employee.amount],
        backgroundColor: '#2196f3', // Blue for earnings
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className={styles.profileContainer}>
        <h1>Employee Profile: {employee.name}</h1>
        <div className={styles.profileTop}>
          <div className={styles.photoPlaceholder}>
            <span role="img" aria-label="profile" style={{ fontSize: '5rem' }}>
              👤
            </span>
          </div>
          <div className={styles.profileInfo}>
            <p>
              <strong>Name:</strong> {employee.name}
            </p>
            <p>
              <strong>User ID:</strong> {employee.userId}
            </p>
            <p>
              <strong>Role:</strong> {employee.role}
            </p>
            <p>
              <strong>Email:</strong> {employee.Email || 'Not provided'}
            </p>
            <p>
              <strong>Badges:</strong>{' '}
              {employee.badges && employee.badges.length > 0 ? employee.badges.join(', ') : 'None'}
            </p>
            <p>
              <strong>Tags:</strong>{' '}
              {employee.tags && employee.tags.length > 0 ? employee.tags.join(', ') : 'None'}
            </p>
            <p>
              <strong>Available Amount:</strong> ₹{employee.amount ? employee.amount.toFixed(2) : '0.00'}
            </p>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading || employee.amount <= 0} // Disable if loading or amount is zero
              className={styles.withdrawBtn}
            >
              {withdrawLoading ? 'Processing Withdrawal...' : 'Withdraw Amount'}
            </button>
            {withdrawMessage && (
              <p className={withdrawMessage.includes('successfully') ? styles.successMsg : styles.errorMsg}>
                {withdrawMessage}
              </p>
            )}
          </div>
        </div>

        <div className={styles.chartsContainer}>
          <div className={styles.chartBox}>
            <h3>Course Completion</h3>
            <Doughnut data={courseDoughnutData} />
            <p className={styles.chartSummary}>
              {employee.completedCourses.length} of {totalUniqueCourses} courses completed.
            </p>
          </div>
          <div className={styles.chartBox}>
            <h3>Project Status</h3>
            <Doughnut data={projectDoughnutData} />
            <p className={styles.chartSummary}>
              {completedProjectsCount} of {assignedProjectsCount} projects completed.
            </p>
          </div>
          <div className={styles.chartBox}>
            <h3>Earnings Overview</h3>
            <Bar data={barData} options={{ scales: { y: { beginAtZero: true } } }} />
            <p className={styles.chartSummary}>
              Total available earnings: ₹{employee.amount ? employee.amount.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeProfilePage;
