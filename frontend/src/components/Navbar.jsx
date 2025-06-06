import React from 'react'; // Make sure React is imported
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import axios from 'axios'; // Import axios for the API call

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (target) => {
    navigate(`/${target}`);
  };

  const handleLogout = async () => {
    try {
      // Call your backend logout endpoint (optional, but good practice for extensibility)
      await axios.post('https://comapay-grow-project.onrender.com/api/auth/logout'); 
      
      // Clear user data from localStorage
      localStorage.removeItem('userId');
      // You might also have localStorage.removeItem('role'); if you store it
      // localStorage.removeItem('userRole'); 

      // Redirect to the login page
      navigate('/'); 
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if backend logout fails, clear local storage and redirect
      localStorage.removeItem('userId'); 
      navigate('/');
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles['logo-container']}>
        <span className={styles['logo-text']}>CompanyGrow</span>
      </div>
      <div className={styles['nav-buttons']}>
        <button
          className={`${styles['nav-btn']} ${location.pathname === '/employee/courses' ? styles.active : ''}`}
          onClick={() => handleNavClick('employee/courses')}
        >
          Courses
        </button>
        <button
          className={`${styles['nav-btn']} ${location.pathname === '/employee/projects' ? styles.active : ''}`}
          onClick={() => handleNavClick('employee/projects')}
        >
          Projects
        </button>
        <button
          className={`${styles['nav-btn']} ${location.pathname === '/my-courses' ? styles.active : ''}`}
          onClick={() => handleNavClick('my-courses')}
        >
          My Courses
        </button>
      </div>
      <div className={styles.profile}>
        {/* Logout Button */}
        <button 
          onClick={handleLogout} 
          className={styles['logout-btn']} // Apply a new CSS class for styling
        >
          Logout
        </button>
        {/* Profile Image - keep it as is */}
        <img
          src="../profile.png"
          alt="Profile"
          id="profileBtn"
          onClick={() => navigate('/profile')}
        />
      </div>
    </nav>
  );
};

export default Navbar;