import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/components/LoginPage.module.css'; // Import the CSS module

function LoginPage() {
  const [role, setRole] = useState('employee');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Note: Correct endpoint path here (with /login)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Save userId to localStorage
      localStorage.setItem('userId', data.user.userId);  // <-- store userId here
      {console.log(data.user.userId)}
      // Redirect based on role
      if (data.user.role === 'employee') {
        navigate('/employee/courses');
      } else if (data.user.role === 'admin') {
        navigate('/admin/courses');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <>
      <div className={styles.bodyLogin}>
        <div className={styles["logo-container"]}>
          <span className={styles["logo-text"]}>CompanyGrow</span>
        </div>
        <div className={styles["login-container"]}>
          <div className={styles["toggle-buttons"]}>
            <button
              type="button"
              className={role === 'employee' ? styles.active : ''}
              onClick={() => handleRoleChange('employee')}
            >
              Employee Login
            </button>
            <button
              type="button"
              className={role === 'admin' ? styles.active : ''}
              onClick={() => handleRoleChange('admin')}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <h2>{role === 'employee' ? 'Employee Login' : 'Admin Login'}</h2>

            <div className={styles["input-group"]}>
              <label htmlFor="userId">ID</label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your ID"
                required
              />
            </div>

            <div className={`${styles["input-group"]} ${styles["password-wrapper"]}`}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <span
                className={styles["eye"]}
                onClick={() => setShowPassword(prev => !prev)}
                style={{ cursor: 'pointer' }}
                aria-label="Toggle password visibility"
              >
                <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </span>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button type="submit" className={styles["submit-btn"]}>
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
export default LoginPage;
