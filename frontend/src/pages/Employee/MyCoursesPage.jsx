import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Employee/MyCoursesPage.module.css';

const MyCoursesPage = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [completedCourseIds, setCompletedCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Define your backend base URL using the environment variable
  // Make sure VITE_APP_BACKEND_URL is set correctly in Vercel environment variables
  // and in your .env.local file for local development.
  const BACKEND_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        setLoading(false);
        return;
      }
      try {
        // Fetch enrolled courses
        const enrolledRes = await axios.get(`${BACKEND_BASE_URL}/api/employees/${userId}/enrolledCourses`);
        setMyCourses(enrolledRes.data);

        // Fetch completed courses
        const completedRes = await axios.get(`${BACKEND_BASE_URL}/api/employees/${userId}/completedCourses`);
        const completedIds = new Set(completedRes.data.map(course => course._id));
        setCompletedCourseIds(completedIds);
      } catch (err) {
        console.error('Error fetching data:', err);
        // Add more user-friendly error feedback here if needed
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [BACKEND_BASE_URL]); // Add BACKEND_BASE_URL to dependency array for clarity, though it won't change

  const handleComplete = async (event, courseId, title) => {
    // Stop the event from bubbling up to the card's onClick handler
    event.stopPropagation();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not logged in. Please log in to complete courses.');
      return;
    }

    try {
      await axios.post(`${BACKEND_BASE_URL}/api/employees/${userId}/completeCourse`, {
        courseId,
      });

      alert(`${title} marked as completed!`);
      // Update the state to reflect completion instantly
      setCompletedCourseIds(prev => new Set(prev).add(courseId));
      // Optionally, refetch all data to ensure consistency
      // fetchData();
    } catch (err) {
      console.error('Error marking course as completed:', err);
      alert('Failed to mark course as completed. Please try again.');
    }
  };

  // New function to handle card click (navigation)
  const handleCardClick = (videourl) => {
    if (videourl) {
      window.open(videourl, '_blank'); // Opens the URL in a new tab
    } else {
      alert('No video URL available for this course.');
    }
  };

  if (loading) return <p>Loading your courses...</p>;

  return (
    <div className={styles.myCoursesContainer}>
      <Navbar />
      <div className={styles.myCoursesContent}>
        <h2 className={styles.myCoursesTitle}>Your Enrolled Courses</h2>
        {myCourses.length === 0 ? (
          <p className={styles.noCoursesMsg}>You have not enrolled in any courses yet.</p>
        ) : (
          <div className={styles.courseCardContainer}>
            {myCourses.map((course) => (
              <div
                className={styles.courseCard}
                key={course._id}
                onClick={() => handleCardClick(course.videourl)} // Assume 'videoURL' is the field name
                style={{ cursor: course.videourl ? 'pointer' : 'default' }} // Add cursor styling
              >
                <div
                  className={styles.courseImage}
                  style={{ backgroundImage: `url(${course.imageUrl || '/default-course-bg.jpg'})` }}
                />
                <div className={styles.courseInfo}>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <span className={styles.courseDifficulty}>{course.difficulty}</span>
                  {course.tags && course.tags.map((tag, idx) => ( // Add check for tags array
                    <span className={styles.courseDifficulty} key={idx}>{tag}</span>
                  ))}
                </div>
                <button
                  className={styles.completeButton}
                  onClick={(event) => handleComplete(event, course._id, course.title)} // Pass event here
                  disabled={completedCourseIds.has(course._id)}
                >
                  {completedCourseIds.has(course._id) ? 'Completed' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;