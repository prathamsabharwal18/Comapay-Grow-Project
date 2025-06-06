import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import styles from '../../styles/Employee/ProjectsPage.module.css';

const EmployeeProjectsPage = () => {
  const [employeeProjects, setEmployeeProjects] = useState([]);
  const [allUpcomingProjects, setAllUpcomingProjects] = useState([]); // <-- all upcoming projects
  const [filteredUpcomingProjects, setFilteredUpcomingProjects] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch projects assigned to this employee (current only)
        const empRes = await axios.get(`https://comapay-grow-project.onrender.com/api/projects/myprojects?userId=${userId}`);
        const empProjects = empRes.data.filter(p => p.status === 'current');

        // Fetch all upcoming projects (globally)
        const upcomingRes = await axios.get('https://comapay-grow-project.onrender.com/api/projects/upcoming');
        const upcomingProjects = upcomingRes.data;

        // Collect tags from upcoming projects
        const tagSet = new Set();
        upcomingProjects.forEach(project => {
          project.tags.forEach(tag => tagSet.add(tag));
        });

        setEmployeeProjects(empProjects);
        setAllUpcomingProjects(upcomingProjects);
        setFilteredUpcomingProjects(upcomingProjects); // Initially no filter
        setAllTags(Array.from(tagSet));
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  const handleTagSelect = (tag) => {
    setSelectedTags(prev => {
      let newSelected;
      if (prev.includes(tag)) {
        newSelected = prev.filter(t => t !== tag);
      } else {
        newSelected = [...prev, tag];
      }

      // Filter upcoming projects by selected tags
      if (newSelected.length === 0) {
        setFilteredUpcomingProjects(allUpcomingProjects);
      } else {
        const filtered = allUpcomingProjects.filter(project =>
          newSelected.every(tag => project.tags.includes(tag))
        );
        setFilteredUpcomingProjects(filtered);
      }

      return newSelected;
    });
  };

  if (loading) return <p>Loading projects...</p>;
  if (!userId) return <p>Please login to view your projects.</p>;

  return (
    <div className={styles.projectsContainer}>
      <Navbar />
      <div className={styles.projectsContent}>
        <h2 className={styles.sectionTitle}>Your Assigned Projects</h2>
        {employeeProjects.length === 0 ? (
          <p className={styles.noDataMsg}>No projects assigned to you.</p>
        ) : (
          <div className={styles.cardGrid}>
            {employeeProjects.map(project => (
              <div className={styles.card} key={project._id}>
                <div
                  className={styles.cardImage}
                  style={{ backgroundImage: `url(/default-course-bg.jpg)` }}
                />
                <div className={styles.cardInfo}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p>Deadline: {project.deadline}</p>
                  <span className={styles.tag}>Amount: ₹{project.amount}</span>
                  {project.tags.map((tag, idx) => (
                    <span className={styles.tag} key={idx}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className={styles.sectionTitle}>Upcoming Projects</h2>

        <div className={styles.tagFilter}>
          {allTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => handleTagSelect(tag)}
              className={`${styles.filterButton} ${
                selectedTags.includes(tag) ? styles.active : ''
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {filteredUpcomingProjects.length === 0 ? (
          <p className={styles.noDataMsg}>
            No upcoming projects match the selected tags.
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {filteredUpcomingProjects.map(project => (
              <div className={styles.card} key={project._id}>
                <div
                  className={styles.cardImage}
                  style={{ backgroundImage: `url(/default-course-bg.jpg)` }}
                />
                <div className={styles.cardInfo}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p>Deadline: {project.deadline}</p>
                  <span className={styles.tag}>Amount: ₹{project.amount}</span>
                  {project.tags.map((tag, idx) => (
                    <span className={styles.tag} key={idx}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProjectsPage;
