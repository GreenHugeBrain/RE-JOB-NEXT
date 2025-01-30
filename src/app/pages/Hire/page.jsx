'use client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Modal from '../../components/Modal/Modal';
import styles from './Hire.module.css';

function JobApplicationForm({ jobId, onClose }) {
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_file: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('განცხადება წარმატებით გაიგზავნა!');
        onClose();
      } else {
        alert(data.message || 'დაფიქსირდა შეცდომა');
      }
    } catch (error) {
      alert('დაფიქსირდა შეცდომა');
    }
  };

  return (
    <div className={styles.applicationForm}>
      <h3>განცხადების გაგზავნა</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>თქვენი წერილი</label>
          <textarea
            value={formData.cover_letter}
            onChange={(e) => setFormData({...formData, cover_letter: e.target.value})}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>რეზიუმე</label>
          <input
            type="text"
            value={formData.resume_file}
            onChange={(e) => setFormData({...formData, resume_file: e.target.value})}
            required
          />
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit">გაგზავნა</button>
          <button type="button" onClick={onClose}>გაუქმება</button>
        </div>
      </form>
    </div>
  );
}

export default function Hire() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeApplicationId, setActiveApplicationId] = useState(null);

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/jobs');
            const result = await response.json();
            if (response.ok) {
                setJobs(result.jobs);
                setFilteredJobs(result.jobs);
            } else {
                console.error('Failed to fetch jobs:', result.message);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleJobSubmit = async (jobData) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user?.token;

        if (!token) {
            alert('გთხოვთ გაიაროთ ავტორიზაცია.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/jobs/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(jobData),
            });

            const result = await response.json();
            if (response.ok) {
                alert('სამუშაო წარმატებით დაემატა!');
                handleCloseModal();
                fetchJobs();
            } else {
                alert(result.message || 'დაფიქსირდა შეცდომა');
            }
        } catch (error) {
            alert('დაფიქსირდა შეცდომა');
        }
    };

    const handleSearch = () => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        const filtered = jobs.filter((job) =>
            job.keywords.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredJobs(filtered);
    };

    const handleApplyClick = (job) => {
        setActiveApplicationId(activeApplicationId === job.id ? null : job.id);
    };

    return (
        <>
            <Header />
            <main className={styles.container}>
                <div className={styles.add_post}>
                    <button onClick={handleOpenModal}>პოსტის დამატება</button>
                </div>
                <div className={styles.search}>
                    <input
                        type="text"
                        placeholder="ძიების სიტყვა"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={handleSearch}>ძებნა</button>
                </div>
                <div className={styles.posts}>
                    {loading ? (
                        <p>იტვირთება...</p>
                    ) : (
                        [...filteredJobs].reverse().map((job) => (
                            <div key={job.id} className={styles.jobCard}>
                                <h3>{job.title}</h3>
                                <p className={styles.desc}>აღწერა</p>
                                <p className={styles.description}>{job.description}</p>
                                <p>ბიუჯეტი: {job.min_budget} - {job.max_budget}</p>
                                <p>საკვანძო სიტყვები: {job.keywords}</p>
                                <button
                                    className={styles.applyButton}
                                    onClick={() => handleApplyClick(job)}
                                >
                                    განცხადების გაგზავნა
                                </button>
                                {activeApplicationId === job.id && (
                                    <JobApplicationForm 
                                        jobId={job.id}
                                        onClose={() => setActiveApplicationId(null)}
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
            <Footer />
            <Modal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleJobSubmit}
            />
        </>
    );
}