import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar'; // Assuming this Navbar is appropriate for employees
import styles from '../../styles/Employee/ProfilePage.module.css';
import { Doughnut , Bar} from 'react-chartjs-2';
import { useParams } from 'react-router-dom'; // Import useParams
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement, // Keep BarElement if you plan to re-add the earnings bar chart later
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement // Register it if you kept it in imports
);

const EmployeeProfilePage = () => {
  const { userId: paramUserId } = useParams(); // Get userId from URL params
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [createAccountLoading, setCreateAccountLoading] = useState(false);
  const [createAccountMessage, setCreateAccountMessage] = useState('');

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
        const res = await axios.get(`/api/employees/${currentUserId}`); // Use currentUserId
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

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!employee) return <p>No employee data found.</p>;

  // Prepare data for Course Completion Chart:
  const totalCourses = employee.enrolledCourses.length + employee.completedCourses.length;
  const courseDoughnutData = {
    labels: ['Completed Courses', 'Enrolled but Incomplete'],
    datasets: [
      {
        label: 'Courses',
        data: [employee.completedCourses.length, employee.enrolledCourses.length],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverOffset: 10,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Prepare data for Projects Doughnut Chart:
  const assignedButNotCompleted = employee.projects.length - employee.completedProjects.length;
  const projectDoughnutData = {
    labels: ['Completed Projects', 'Assigned (In Progress) Projects'],
    datasets: [
      {
        label: 'Projects',
        data: [employee.completedProjects.length, assignedButNotCompleted > 0 ? assignedButNotCompleted : 0],
        backgroundColor: ['#2196F3', '#FFC107'],
        hoverOffset: 10,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // Earnings Bar Chart Data (re-added for completeness, as it was in your original snippet)
  const barData = {
    labels: ['Available Amount (₹)'],
    datasets: [
      {
        label: 'Earnings',
        data: [employee.amount],
        backgroundColor: '#2196f3',
      },
    ],
  };


  // Stripe related functions (unchanged)
  const handleWithdraw = async () => {
    // ... (Your existing handleWithdraw logic) ...
  };

  const handleCreateStripeAccount = async () => {
    // ... (Your existing handleCreateStripeAccount logic) ...
  };

  return (
    <>
      <Navbar />
      <div className={styles.profileContainer}>
        <h1>Employee Profile: {employee.name}</h1> {/* Updated title */}
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
              <strong>Available Amount:</strong> ₹{employee.amount.toFixed(2)}
            </p>

            {/* Stripe Account Linking/Withdrawal (conditionally rendered for self-profile or admin interaction) */}
            {paramUserId === undefined || paramUserId === localStorage.getItem('userId') ? ( // Only show for own profile
                employee.stripeAccountId ? (
                    <>
                        <p style={{ color: 'green' }}>Stripe Account Linked</p>
                        <button
                            onClick={handleWithdraw}
                            disabled={withdrawLoading || employee.amount <= 0}
                            className={styles.withdrawBtn}
                        >
                            {withdrawLoading ? 'Processing...' : 'Withdraw Amount'}
                        </button>
                    </>
                ) : (
                    <>
                        <p style={{ color: 'red' }}>No Stripe Account Linked</p>
                        <button
                            onClick={handleCreateStripeAccount}
                            disabled={createAccountLoading}
                            className={styles.withdrawBtn}
                        >
                            {createAccountLoading ? 'Creating Stripe Account...' : 'Create Stripe Account'}
                        </button>
                        {createAccountMessage && (
                            <p style={{ color: createAccountMessage.includes('success') || createAccountMessage.includes('Redirecting') ? 'green' : 'red' }}>
                                {createAccountMessage}
                            </p>
                        )}
                    </>
                )
            ) : (
                <p style={{color: '#666', fontSize: '0.9em'}}>Stripe account management available on your own profile.</p>
            )}
            {withdrawMessage && <p className={styles.withdrawMsg}>{withdrawMessage}</p>}
          </div>
        </div>

        <div className={styles.chartsContainer}>
          <div className={styles.chartBox}>
            <h3>Course Completion</h3>
            <Doughnut data={courseDoughnutData} />
          </div>
          <div className={styles.chartBox}>
            <h3>Project Status</h3>
            <Doughnut data={projectDoughnutData} />
          </div>
          {/* Re-adding the Earnings chart as it was in your original component,
              though it might not be relevant for *other* employee profiles visually.
              You could wrap this in a condition if you only want it on the employee's own profile.
          */}
          <div className={styles.chartBox}>
            <h3>Earnings</h3>
            <Bar data={barData} options={{ scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeProfilePage;