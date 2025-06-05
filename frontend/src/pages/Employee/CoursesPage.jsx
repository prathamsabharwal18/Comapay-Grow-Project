import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar.jsx';
import styles from '../../styles/Employee/CoursesPage.module.css';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tag, setTag] = useState('');

  const userId = localStorage.getItem('userId'); // changed from employeeId

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));

    axios.get(`http://localhost:5000/api/employees/${userId}`)
      .then(res => setEnrolledCourses(res.data.enrolledCourses || []))
      .catch(err => console.error(err));
  }, [userId]);

  const handleEnroll = async (courseId) => {
    try {
      await axios.post('http://localhost:5000/api/enroll', {
        userId,   // changed from employeeId
        courseId,
      });
      setEnrolledCourses(prev => [...prev, courseId]);
    } catch (err) {
      console.error('Enroll error:', err);
    }
  };

  const filteredCourses = courses.filter(course => {
    const nameMatch = course.title?.toLowerCase().includes(searchText.toLowerCase());
    const difficultyMatch = !difficulty || course.difficulty === difficulty;
    const tagMatch = !tag || course.tags.includes(tag);
    return nameMatch && difficultyMatch && tagMatch;
  });

  return (
    <div className="bodyCourses">
      <Navbar />
      <div className={styles.controls}>
        <input
          type="search"
          placeholder="Search courses..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All Tags</option>
          <option value="JavaScript">JavaScript</option>
          <option value="React">React</option>
          <option value="Node.js">Node.js</option>
          <option value="Python">Python</option>
        </select>
      </div>

      <div className={styles['courses-container']}>
        {filteredCourses.map(course => (
          <div
            key={course._id}
            className={styles['course-card']}
            style={{ backgroundImage: `url(${course.imageUrl})` }}
          >
            <div className={styles['course-info']}>
              <h3>{course.title}</h3>
              <div className={styles.tags}>
                {course.tags.map((t, idx) => <span key={idx}>{t}</span>)}
                <span>{course.difficulty}</span>
              </div>
              <p>{course.description}</p>
              <button
                onClick={() => handleEnroll(course._id)}
                disabled={enrolledCourses.includes(course._id)}
              >
                {enrolledCourses.includes(course._id) ? 'Enrolled' : 'Enroll'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
