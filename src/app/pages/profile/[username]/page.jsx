'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';

const Profile = () => {
    const pathname = usePathname();
    const router = useRouter();

    const encodedUsername = pathname?.split('/').pop();
    const username = encodedUsername ? decodeURIComponent(encodedUsername) : null;

    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [education, setEducation] = useState([]);
    const [experience, setExperience] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);

        if (!username) {
            if (user?.username) {
                router.push(`/pages/profile/${encodeURIComponent(user.username)}`);
            }
            return;
        }

        const isOwner = user?.username === username;
        setIsOwnProfile(isOwner);

        const fetchProfileData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/profile/${encodeURIComponent(username)}`, {
                    headers: user?.token ? {
                        'Authorization': `Bearer ${user.token}`
                    } : {}
                });

                if (!response.ok) {
                    throw new Error('პროფილის მონაცემების მიღება ვერ მოხერხდა');
                }

                const data = await response.json();
                setUserData(data);
                setEducation(data.education || []);
                setExperience(data.experience || []);

                if (isOwner) {
                    setFormData({
                        name: data.username || '',
                        job: data.job || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        cover_letter: data.cover_letter || '',
                        education: data.education || [],
                        experience: data.experience || []
                    });
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [username, router]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://127.0.0.1:5000/profile/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...formData,
                    education: education,
                    experience: experience
                })
            });

            if (!response.ok) {
                throw new Error('პროფილის განახლება ვერ მოხერხდა');
            }

            const data = await response.json();
            setUserData(prevData => ({
                ...prevData,
                username: formData.name,
                job: formData.job,
                phone: formData.phone,
                address: formData.address,
                cover_letter: formData.cover_letter,
                education: education,
                experience: experience
            }));
            setIsEditing(false);
        } catch (err) {
            console.log(err.message)
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...education];
        newEducation[index] = {
            ...newEducation[index],
            [field]: value
        };
        setEducation(newEducation);
    };

    const handleExperienceChange = (index, field, value) => {
        const newExperience = [...experience];
        newExperience[index] = {
            ...newExperience[index],
            [field]: value
        };
        setExperience(newExperience);
    };

    const addEducation = () => {
        setEducation([...education, {
            degree: '',
            field: '',
            start_date: '',
            end_date: '',
            school_name: ''
        }]);
    };

    const addExperience = () => {
        setExperience([...experience, {
            position: '',
            company_name: '',
            start_date: '',
            end_date: ''
        }]);
    };

    const handleDeleteEducation = async (educationId) => {
        if (!window.confirm('ნამდვილად გსურთ განათლების ჩანაწერის წაშლა?')) {
            return;
        }
    
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://127.0.0.1:5000/profile/${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    type: 'education',
                    id: educationId
                })
            });
    
            if (!response.ok) {
                throw new Error('განათლების ჩანაწერის წაშლა ვერ მოხერხდა');
            }
    
            setEducation(prevEducation => 
                prevEducation.filter(edu => edu.id !== educationId)
            );
        } catch (err) {
            setError(err.message);
        }
    };
    
    const handleDeleteExperience = async (experienceId) => {
        if (!window.confirm('ნამდვილად გსურთ გამოცდილების ჩანაწერის წაშლა?')) {
            return;
        }
    
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(`http://127.0.0.1:5000/profile/${username}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    type: 'experience',
                    id: experienceId
                })
            });
    
            if (!response.ok) {
                throw new Error('გამოცდილების ჩანაწერის წაშლა ვერ მოხერხდა');
            }
    
            setExperience(prevExperience => 
                prevExperience.filter(exp => exp.id !== experienceId)
            );
        } catch (err) {
            setError(err.message);
        }
    };
    
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    if (loading) return <div>მიმდინარეობს ჩამოტვირთვა...</div>;
    if (error) return <div>შეცდომა: {error}</div>;
    if (!userData) return <div>პროფილი ვერ მოიძებნა</div>;


    const handleViewDetails = (jobId) => {
        // Save the job ID in localStorage
        localStorage.setItem('jobId', jobId);
        // Navigate to the job detail page
        router.push(`/pages/JobDetail`);
    };

    const profileImage = userData.profileImage
        ? userData.profileImage
        : `https://ui-avatars.com/api/?name=${userData.username[0]}`;

    return (
        <>
            <Header />
            <div className="profile-bg">
                <main className="profile-container">
                    <div className="sidebar">
                        <div className="profile-image">
                            <img src={profileImage} alt="პროფილი" />
                            <span className="status-badge">{userData.job || 'ხელმისაწვდომი სამუშაოდ'}</span>
                        </div>
                        <div className="role-badge">
                            <span>{userData.role}</span>
                        </div>
                        <div className="message">
                        {!isOwnProfile && (
                        <button
                            className="message-button"
                            onClick={() => router.push(`/pages/Chat/${userData.user_id}`)}
                        >
                            მიწერა
                        </button>
                    )}
                        </div>
                        <div className="profile-stats">
                            <div className="stat">
                                <span className="number">{userData.recoins}</span>
                                <span className="label">ReCoins</span>
                            </div>
                            <div className="stat">
                                <span className="number">₾{userData.totalEarnings}</span>
                                <span className="label">სრული შემოსავალი</span>
                            </div>
                        </div>
                        <div className="contact-info">
                            <h3>კონტაქტი</h3>
                            {!isEditing ? (
                                <>
                                    <div className="info-item">
                                        <i>📧</i>
                                        <span>{userData.email}</span>
                                    </div>
                                    <div className="info-item">
                                        <i>📍</i>
                                        <span>{userData.address || 'მისამართი არ არის მითითებული'}</span>
                                    </div>
                                    <div className="info-item">
                                        <i>📱</i>
                                        <span>{userData.phone || 'ტელეფონი არ არის მითითებული'}</span>
                                    </div>
                                    <div className="info-item">
                                        <i>💼</i>
                                        <span>{userData.job || 'არ არის მითითებული'}</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="info-item">
                                        <i>📧</i>
                                        <span>{userData.email}</span>
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="მისამართი"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="ტელეფონი"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="job"
                                            value={formData.job}
                                            onChange={handleChange}
                                            placeholder="სამუშაო"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="main-content">
                        {!isEditing ? (
                            <>
                                <div className="profile-header">
                                    <h1>{userData.username}</h1>
                                    <span className="verified">
                                        {userData.is_confirmed ? '✓ ვერიფიცირებული პროფესიონალი' : 'არ არის ვერიფიცირებული'}
                                    </span>
                                </div>

                                <section className="about-section">
                                    <h2>პროფესიული შეჯამება</h2>
                                    <p>{userData.cover_letter || 'შეჯამება არ არის მითითებული.'}</p>
                                </section>

                                <section className="resume-section">
                                    <h2>რეზიუმე</h2>
                                    <div className="upload-area">
                                        <input
                                            type="file"
                                            id="resume"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="resume">
                                            {selectedFile ? selectedFile.name : userData.resume_file || 'რეზიუმე არ არის ატვირთული'}
                                        </label>
                                    </div>
                                </section>
                                <section className="education-section">
                                    <h2>განათლება</h2>
                                    {education.map((edu, index) => (
                                        <div key={index} className="education-item">
                                            <h3>{edu.degree} - {edu.field}</h3>
                                            <p>{edu.school_name}</p>
                                            <p>{edu.start_date} - {edu.end_date}</p>
                                        </div>
                                    ))}
                                </section>
                                <section className="experience-section">
                                    <h2>გამოცდილება</h2>
                                    {experience.map((exp, index) => (
                                        <div key={index} className="experience-item">
                                            <h3>{exp.position}</h3>
                                            <p>{exp.company_name}</p>
                                            <p>{exp.start_date} - {exp.end_date}</p>
                                        </div>
                                    ))}
                                </section>
                            </>
                        ) : (
                            <form onSubmit={handleUpdate}>
                                <div className="form-group">
                                    <label>სახელი</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>პროფესიული შეჯამება</label>
                                    <textarea
                                        name="cover_letter"
                                        value={formData.cover_letter}
                                        onChange={handleChange}
                                        rows="4"
                                    />
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'მიმდინარეობს...' : 'შენახვა'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsEditing(false)}
                                >
                                    გაუქმება
                                </button>
                                <section className="education-section">
                                    <h2>განათლება</h2>
                                    {education.map((edu, index) => (
                                        <div key={index} className="education-form">
                                            <input
                                                type="text"
                                                value={edu.degree}
                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                placeholder="ხარისხი"
                                            />
                                            <input
                                                type="text"
                                                value={edu.field}
                                                onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                                                placeholder="სფერო"
                                            />
                                            <input
                                                type="text"
                                                value={edu.school_name}
                                                onChange={(e) => handleEducationChange(index, 'school_name', e.target.value)}
                                                placeholder="სასწავლებლის სახელი"
                                            />
                                            <input
                                                type="date"
                                                value={edu.start_date}
                                                onChange={(e) => handleEducationChange(index, 'start_date', e.target.value)}
                                            />
                                            <input
                                                type="date"
                                                value={edu.end_date}
                                                onChange={(e) => handleEducationChange(index, 'end_date', e.target.value)}
                                            />
                                            <button type="button" onClick={() => handleDeleteEducation(edu.id)}>
                                                წაშლა
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addEducation}>
                                        განათლების დამატება
                                    </button>
                                </section>

                                <section className="experience-section">
                                    <h2>გამოცდილება</h2>
                                    {experience.map((exp, index) => (
                                        <div key={index} className="experience-form">
                                            <input
                                                type="text"
                                                value={exp.position}
                                                onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                                                placeholder="პოზიცია"
                                            />
                                            <input
                                                type="text"
                                                value={exp.company_name}
                                                onChange={(e) => handleExperienceChange(index, 'company_name', e.target.value)}
                                                placeholder="კომპანიის სახელი"
                                            />
                                            <input
                                                type="date"
                                                value={exp.start_date}
                                                onChange={(e) => handleExperienceChange(index, 'start_date', e.target.value)}
                                            />
                                            <input
                                                type="date"
                                                value={exp.end_date}
                                                onChange={(e) => handleExperienceChange(index, 'end_date', e.target.value)}
                                            />
                                            <button type="button" onClick={() => handleDeleteExperience(exp.id)}>
                                                წაშლა
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addExperience}>
                                        გამოცდილების დამატება
                                    </button>
                                </section>

                                <div className="form-buttons">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'მიმდინარეობს...' : 'შენახვა'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        გაუქმება
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="action-buttons">
                            {isOwnProfile && !isEditing && (
                                <>
                                    <button
                                        className="btn-primary"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        პროფილის განახლება
                                    </button>
                                    <button className="btn-secondary">პროფილის წაშლა</button>
                                </>
                            )}
                        </div>
                    </div>
                    <section className="jobs-section">
                <h2>გამოქვეყნებული სამუშაოები</h2>
                <div className="jobs-grid">
                    {userData.jobs?.map((job, index) => (
                        <article key={index} className="job-card">
                            <div className="job-header">
                                <h3 title={job.title}>
                                    {job.title.length > 50 ? `${job.title.substring(0, 50)}...` : job.title}
                                </h3>
                            </div>

                            <div className="job-details">
                                <div className="detail-item">
                                    <span className="icon">💰</span>
                                    <span className="value">{job.min_budget} ₾ - {job.max_budget} ₾</span>
                                </div>
                            </div>

                            <p className="job-description" title={job.description}>
                                {job.description.length > 100 ?
                                    `${job.description.substring(0, 100)}...` :
                                    job.description}
                            </p>

                            <div className="job-footer">
                                <span className="date">{job.created_at}</span>
                                <button className="view-details" onClick={() => handleViewDetails(job.id)}>
                                    დეტალურად
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
                </main>
            </div>
            <Footer />

            <style jsx>{`
            .message{
                display: flex;
                justify-content: center;
            }
.message-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff; /* Blue background */
    color: #ffffff; /* White text */
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.message-button:active {
    transform: scale(0.95); /* Slightly shrink on click */
}

.message-button:disabled {
    background-color: #cccccc; /* Gray background for disabled state */
    cursor: not-allowed;
}

                .jobs-section {
                    margin: 3rem 0;
                    padding-top: 2rem;
                    border-top: 2px solid #f7fafc;
                    width: 100%;
                }

                .jobs-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    width: 100%;
                    max-width: 1440px;
                    margin-top: 1.5rem;
                }

                .job-card {
                    flex: 1 1 300px;
                    min-width: 300px;
                    max-width: calc(33.333% - 1rem);
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

            .job-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
                border-color: #cbd5e0;
            }

            .experience_item{
                display: flex;
                flex-direction: column;
                gap: 8px;}

            .job-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: linear-gradient(to right, #4299e1, #667eea);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .job-card:hover::before {
                opacity: 1;
            }

            .job-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }
               .education-section,
.experience-section {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.education-item,
.experience-item {
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
}

.education-item:last-child,
.experience-item:last-child {
    border-bottom: none;
}

.education-item h3,
.experience-item h3 {
    color: #2c3e50;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
}

.education-item p,
.experience-item p {
    color: #666;
    margin: 0.25rem 0;
    font-size: 0.95rem;
}

/* Form styles */
.education-form,
.experience-form {
    display: grid;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
}

.education-form input,
.experience-form input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
}

button[type="button"] {
    background: #e53e3e; /* Red background for delete buttons */
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

button[type="button"]:hover {
    background: #c53030; /* Darker red on hover */
}

button[type="button"]:focus {
    outline: none;
}

h2 {
    font-size: 1.5rem; /* Larger font size for section headers */
    color: #2d3748; /* Dark color for better readability */
    margin-bottom: 1rem; /* Space below the header */
}

.form-buttons {
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
    gap: 1rem; /* Space between buttons */
    margin-top: 1rem; /* Space above buttons */
}

.btn-primary {
    background: #4299e1; /* Primary button color */
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #3182ce; /* Darker blue on hover */
}

            .job-header h3 {
                font-size: 1.125rem;
                color: #2d3748;
                margin: 0;
                font-weight: 600;
                flex: 1;
                margin-right: 1rem;
            }

            .job-status {
                font-size: 0.75rem;
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-weight: 500;
                white-space: nowrap;
            }

            .job-status[data-status="active"] {
                background: #c6f6d5;
                color: #2f855a;
            }

            .job-status[data-status="completed"] {
                background: #e9d8fd;
                color: #553c9a;
            }

            .job-status[data-status="pending"] {
                background: #feebc8;
                color: #9c4221;
            }

            .job-details {
                display: flex;
                gap: 1.5rem;
                margin: 1rem 0;
            }

            .detail-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .detail-item .icon {
                font-size: 1rem;
            }

            .detail-item .value {
                color: #4a5568;
                font-size: 0.875rem;
            }

            .job-description {
                color: #718096;
                font-size: 0.875rem;
                line-height: 1.5;
                margin: 1rem 0;
                height: 3.9em;
                overflow: hidden;
            }

            .job-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid #edf2f7;
            }

            .date {
                color: #a0aec0;
                font-size: 0.75rem;
            }

            .view-details {
                background: transparent;
                border: none;
                color: #4299e1;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .view-details:hover {
                background: #ebf8ff;
                color: #2b6cb0;
            }

            @media (max-width: 640px) {
                .jobs-grid {
                    grid-template-columns: 1fr;
                }
                
                .job-card {
                    padding: 1rem;
                }
            }
                /* Keep all existing styles and add new form styles */
                .form-group {
                    margin-bottom: 1.5rem;
                }

                .btn-secondary{
                    margin-left: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #4a5568;
                    font-weight: 500;
                }

                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #4299e1;
                }

                @import url('https://fonts.googleapis.com/css2?family=BPG+Ingiri&display=swap');

                * {
                    font-family: "BPG Ingiri", sans-serif;
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    letter-spacing: 0.7px;
                }

                .profile-bg {
                    background: #f8f9fa;
                    min-height: calc(100vh - 120px);
                    padding: 2rem 1rem;
                }

                .profile-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 2rem;
                    position: relative;
                }

                .sidebar {
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 0 20px rgba(0,0,0,0.05);
                    height: fit-content;
                }

                .profile-image {
                    text-align: center;
                    position: relative;
                }

                .profile-image img {
                    border-radius: 15px;
                    margin-bottom: 1rem;
                    width: 150px;
                    height: 150px;
                    object-fit: cover;
                }

                .status-badge {
                    background: #48bb78;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    white-space: nowrap;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .role-badge {
                    text-align: center;
                    margin: 1.5rem 0;
                    padding: 0.75rem;
                    background: #ebf4ff;
                    color: #4299e1;
                    border-radius: 8px;
                    font-weight: 500;
                }

                .profile-stats {
                    margin: 2rem 0;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    text-align: center;
                }

                .stat {
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }

                .stat:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }

                .number {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #2d3748;
                }

                .label {
                    color: #718096;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                }

                .contact-info {
                    border-top: 1px solid #edf2f7;
                    padding-top: 1.5rem;
                }

                .contact-info h3 {
                    color: #2d3748;
                    margin-bottom: 1rem;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin: 0.75rem 0;
                    color: #4a5568;
                }

                .info-item span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .main-content {
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 0 20px rgba(0,0,0,0.05);
                }

                .profile-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #f7fafc;
                }

                .profile-header h1 {
                    margin: 0;
                    font-size: 2rem;
                    color: #2d3748;
                }

                .verified {
                    display: inline-block;
                    margin-top: 0.5rem;
                    color: #48bb78;
                    font-weight: 500;
                }

                .about-section, .resume-section {
                    margin-bottom: 2rem;
                }

                h2 {
                    color: #2d3748;
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                }

                .about-section p {
                    color: #4a5568;
                    line-height: 1.6;
                }

                .upload-area {
                    border: 2px dashed #e2e8f0;
                    border-radius: 10px;
                    padding: 2rem;
                    text-align: center;
                    transition: all 0.3s;
                    cursor: pointer;
                }

                .upload-area:hover {
                    border-color: #4299e1;
                    background: #f7fafc;
                }

                input[type="file"] {
                    display: none;
                }

                .upload-area label {
                    cursor: pointer;
                    color: #4a5568;
                }

                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .btn-primary, .btn-secondary {
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-primary {
                    background: #4299e1;
                    color: white;
                    border: none;
                }

                .btn-secondary {
                    background: white;
                    color: #e53e3e;
                    border: 1px solid #e53e3e;
                }

                .btn-primary:hover {
                    background: #3182ce;
                    transform: translateY(-1px);
                }

                .btn-secondary:hover {
                    background: #fed7d7;
                    transform: translateY(-1px);
                }

                @media (max-width: 768px) {
                    .profile-container {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </>
    );
};

export default Profile;
