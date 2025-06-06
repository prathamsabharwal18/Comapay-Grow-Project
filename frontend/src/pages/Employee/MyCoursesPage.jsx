import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Employee/MyCoursesPage.module.css';

const MyCoursesPage = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [completedCourseIds, setCompletedCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Hardcoded backend URL as requested
  const RENDER_BACKEND_URL = 'https://comapay-grow-project.onrender.com';

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in localStorage');
        setLoading(false);
        return;
      }
      console.log("Fetching data for userId:", userId); // Added for debugging

      try {
        // Fetch enrolled courses
        const enrolledRes = await axios.get(`${RENDER_BACKEND_URL}/api/employees/${userId}/enrolledCourses`);
        setMyCourses(enrolledRes.data);

        // Fetch completed courses
        const completedRes = await axios.get(`${RENDER_BACKEND_URL}/api/employees/${userId}/completedCourses`);
        const completedIds = new Set(completedRes.data.map(course => course._id));
        setCompletedCourseIds(completedIds);
      } catch (err) {
        console.error('Error fetching data:', err);
        // More specific error handling could be added here
        if (axios.isAxiosError(err)) {
          console.error('Axios Error Response:', err.response?.status, err.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array as RENDER_BACKEND_URL is constant

  const handleComplete = async (event, courseId, title) => {
    // Stop the event from bubbling up to the card's onClick handler
    event.stopPropagation();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not logged in. Please log in to complete courses.');
      return;
    }

    try {
      await axios.post(`${RENDER_BACKEND_URL}/api/employees/${userId}/completeCourse`, {
        courseId,
      });

      alert(`${title} marked as completed!`);
      // Update the state to reflect completion instantly
      setCompletedCourseIds(prev => new Set(prev).add(courseId));
    } catch (err) {
      console.error('Error marking course as completed:', err);
      alert('Failed to mark course as completed. Please try again.');
    }
  };

  // New function to handle card click (navigation)
  const handleCardClick = (VideoUrl) => {
    if (VideoUrl) {
      window.open(VideoUrl, '_blank'); // Opens the URL in a new tab
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
                onClick={() => handleCardClick(course.VideoUrl)} // Assume 'videoURL' is the field name
                style={{ cursor: course.VideoUrl ? 'pointer' : 'default' }} // Add cursor styling
              >
                <div
                  className={styles.courseImage}
                  style={{ backgroundImage: `url(${course.imageUrl || '/default-course-bg.jpg'})` }}
                />
                <div className={styles.courseInfo}>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <span className={styles.courseDifficulty}>{course.difficulty}</span>
                  {course.tags && course.tags.map((tag, idx) => (
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