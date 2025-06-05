import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../styles/Navbar.module.css'; // same CSS file
import axios from 'axios'; // 

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (target) => {
    navigate(`/${target}`);
  };
  const handleLogout = async () => {
      try {
        // Call your backend logout endpoint (optional, but good practice for extensibility)
        await axios.post('http://localhost:5000/api/auth/logout'); 
        
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
          className={`${styles['nav-btn']} ${location.pathname === '/admin/courses' ? styles.active : ''}`}
          onClick={() => handleNavClick('admin/courses')}
        >
          Courses
        </button>
        <button
          className={`${styles['nav-btn']} ${location.pathname === '/admin/projects' ? styles.active : ''}`}
          onClick={() => handleNavClick('admin/projects')}
        >
          Projects
        </button>
        <button
          className={`${styles['nav-btn']} ${location.pathname === '/admin/employees' ? styles.active : ''}`}
          onClick={() => handleNavClick('admin/employees')}
        >
          Employees
        </button>
        <button 
                  onClick={handleLogout} 
                  className={styles['nav-btn']} // Apply a new CSS class for styling
                >
                  Logout
                </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
