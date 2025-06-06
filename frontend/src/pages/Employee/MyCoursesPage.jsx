import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Employee/MyCoursesPage.module.css';

const MyCoursesPage = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [completedCourseIds, setCompletedCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      try {
        // Fetch enrolled courses
        const enrolledRes = await axios.get(`https://comapay-grow-project.onrender.com/api/employees/${userId}/enrolledCourses`);
        setMyCourses(enrolledRes.data);

        // Fetch completed courses
        const completedRes = await axios.get(`https://comapay-grow-project.onrender.com/api/employees/${userId}/completedCourses`);
        const completedIds = new Set(completedRes.data.map(course => course._id));
        setCompletedCourseIds(completedIds);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleComplete = async (courseId, title) => {
    const userId = localStorage.getItem('userId');
    try {
      await axios.post(`https://comapay-grow-project.onrender.com/api/employees/${userId}/completeCourse`, {
        courseId,
      });

      alert(`${title} marked as completed!`);
      setCompletedCourseIds(prev => new Set(prev).add(courseId));
    } catch (err) {
      console.error('Error marking course as completed:', err);
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
              <div className={styles.courseCard} key={course._id}>
                <div
                  className={styles.courseImage}
                  style={{ backgroundImage: `url(${course.imageUrl || '/default-course-bg.jpg'})` }}
                />
                <div className={styles.courseInfo}>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <span className={styles.courseDifficulty}>{course.difficulty}</span>
                  {course.tags.map((tag, idx) => (
                    <span className={styles.courseDifficulty} key={idx}>{tag}</span>
                  ))}
                </div>
                <button
                  className={styles.completeButton}
                  onClick={() => handleComplete(course._id, course.title)}
                  // disabled={completedCourseIds.has(course._id)}
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
