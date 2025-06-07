import React, { useEffect, useState } from 'react';
 import styles from "../../styles/Admin/Coursepage.module.css";
 import AdminNavbar from '../../components/AdminNavbar';
 import axios from 'axios';

 const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    tags: [],
    imageUrl: '',
    badge: [],
    amount: 0,
    VideoUrl: '' // ✅ ADDED: New field for video URL
  });
  const [tagInput, setTagInput] = useState('');
  const [badgeInput, setBadgeInput] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Hardcoded backend URL for consistency with previous discussion
  const RENDER_BACKEND_URL = 'https://comapay-grow-project.onrender.com';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${RENDER_BACKEND_URL}/api/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`<span class="math-inline">\{RENDER\_BACKEND\_URL\}/api/courses/</span>{selectedId}`);
      fetchCourses();
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const openEditModal = (course) => {
    setSelectedId(course?._id || null);
    setFormData({
      title: course?.title || '',
      description: course?.description || '',
      difficulty: course?.difficulty || '',
      tags: course?.tags || [],
      imageUrl: course?.imageUrl || '',
      badge: course?.badge || [],
      amount: course?.amount || 0,
      VideoUrl: course?.VideoUrl || '' // ✅ ADDED: Populate videoURL when editing
    });
    setShowEditModal(true);
  };

  const saveCourse = async () => {
    const { title, description, amount, difficulty, VideoUrl } = formData; // Destructure videoURL

    if (
      title.trim() === '' ||
      description.trim() === '' ||
      difficulty.trim() === '' ||
      amount === '' ||
      isNaN(amount) ||
      VideoUrl.trim() === '' // ✅ ADDED: Validate videoURL
    ) {
      alert('Please fill out all required fields (including Video URL) and enter a valid number for amount.');
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      // videoURL is already part of formData, so it's included by `...formData`
    };

    try {
      if (selectedId) {
        await axios.put(`<span class="math-inline">\{RENDER\_BACKEND\_URL\}/api/courses/</span>{selectedId}`, payload);
      } else {
        await axios.post(`${RENDER_BACKEND_URL}/api/courses`, payload);
      }
      fetchCourses();
      setShowEditModal(false);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleTagAdd = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
    }
    setTagInput('');
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tagToRemove)
    });
  };

  const handleBadgeAdd = () => {
    if (badgeInput && !formData.badge.includes(badgeInput)) {
      setFormData({ ...formData, badge: [...formData.badge, badgeInput] });
    }
    setBadgeInput('');
  };

  const handleBadgeRemove = (badgeToRemove) => {
    setFormData({
      ...formData,
      badge: formData.badge.filter(b => b !== badgeToRemove)
    });
  };

  // Filter courses based on search term (name and tags)
  const filteredCourses = courses.filter(course => {
    const searchTermLower = searchTerm.toLowerCase();
    const titleMatch = course.title.toLowerCase().includes(searchTermLower);
    const tagMatch = course.tags.some(tag => tag.toLowerCase().includes(searchTermLower));
    return titleMatch || tagMatch;
  });

  return (
    <div>
      <AdminNavbar active="Courses" />
      <main className={styles['admin-main']}>
        <div className={styles['courses-container']}>
          {/* Search Bar */}
          <input
            type="text"
            className={styles['course-search']} // You might need to define this style
            placeholder="Search courses by name or tags"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredCourses.map(course => (
            <div key={course._id} className={styles['course-card']}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p><strong>Difficulty:</strong> {course.difficulty}</p>
              {course.videoUrl && ( // ✅ DISPLAY: Optionally display the video URL
                <p>
                  <strong>Video:</strong> <a href={course.videoUrl} target="_blank" rel="noopener noreferrer">Watch Course</a>
                </p>
              )}
              <div className={styles.tags}>
                {course.tags.map((tag, i) => <span key={i}>{tag}</span>)}
              </div>
              <div className={styles['card-actions']}>
                <button className={styles['edit-btn']} onClick={() => openEditModal(course)}>Edit</button>
                <button className={styles['remove-btn']} onClick={() => { setSelectedId(course._id); setShowConfirmModal(true); }}>Remove</button>
              </div>
            </div>
          ))}
          </div>
          <button className={styles['add-btn']} onClick={() => openEditModal()}>Add Course</button>
        </main>

        {showConfirmModal && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this course?</p>
              <div className={styles['modal-actions']}>
                <button className={styles['primary-btn']} onClick={handleDelete}>Yes</button>
                <button className={styles['secondary-btn']} onClick={() => setShowConfirmModal(false)}>No</button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <h3>{selectedId ? 'Edit Course' : 'Add New Course'}</h3>

              <label>Course Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />

              <label>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

              <label>Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="">Select Difficulty</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <label>Image URL</label>
              <input type="text" value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />

              {/* ✅ ADDED: Video URL Input Field */}
              <label>Video URL</label>
              <input
                type="text"
                value={formData.VideoUrl}
                onChange={e => setFormData({ ...formData, VideoUrl: e.target.value })}
                placeholder="e.g., https://youtube.com/watch?v=..."
              />

              <label>Tags</label>
              <div className={styles['tags-input']}>
                {formData.tags.map((tag, i) => (
                  <span key={i} onClick={() => handleTagRemove(tag)}>{tag} ×</span>
                ))}
              </div>
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} />
              <button className={styles['small-btn']} onClick={handleTagAdd}>Add Tag</button>

              <label>Badge(s)</label>
              <div className={styles['tags-input']}>
                {formData.badge.map((b, i) => (
                  <span key={i} onClick={() => handleBadgeRemove(b)}>{b} ×</span>
                ))}
              </div>
              <input type="text" value={badgeInput} onChange={e => setBadgeInput(e.target.value)} />
              <button className={styles['small-btn']} onClick={handleBadgeAdd}>Add Badge</button>

              <label>Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {
                    setFormData({ ...formData, amount: value === '' ? '' : Number(value) });
                  }
                }}
              />

              <div className={styles['modal-actions']}>
                <button className={styles['primary-btn']} onClick={saveCourse}>Save</button>
                <button className={styles['secondary-btn']} onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
 };

 export default CoursesPage;