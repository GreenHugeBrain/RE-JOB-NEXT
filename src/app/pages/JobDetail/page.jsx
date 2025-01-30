'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Link from 'next/link';

const JobDetail = () => {
    const router = useRouter();
    const [jobData, setJobData] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const jobId = localStorage.getItem('jobId');
        if (!jobId) {
            router.push('/pages/profile');
            return;
        }

        const fetchJobData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const response = await fetch(`http://127.0.0.1:5000/jobs/${jobId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch job details');
                }

                const data = await response.json();
                setJobData(data);
                setApplicants(data.applicants);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobData();
    }, [router]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <>
            <Header />
            <div className="job-detail-container">
                {jobData && (
                    <div className="job-detail">
                        <div className="job-header">
                            <h1>{jobData.title}</h1>
                            <div className="job-meta">
                                <span className="budget">
                                    <span className="label">ბიუჯეტი:</span>
                                    {jobData.min_budget} ₾ - {jobData.max_budget} ₾
                                </span>
                            </div>
                        </div>
                        <div className="job-description">
                            <p>{jobData.description}</p>
                        </div>
                    </div>
                )}

                <section className="applicants-section">
                    <h2>აპლიკანტები</h2>
                    {applicants.length > 0 ? (
                        <ul className="applicants-list">
                            {applicants.map((applicant, index) => (
                                <li key={index} className="applicant-card">
                                    <Link href={`/pages/profile/${applicant.username}`} className="applicant-name">
                                    {applicant.username}
                                    </Link>
                                    <p className="applicant-exp">პროფესია: {applicant.user_job}</p>
                                    <p className="applicant-exp">ჯამში გამომუშავებული: {applicant.user_total_earnings}₾</p>
                                    <p className="applicant-letter">{applicant.cover_letter}</p>
                                    <div className="applicant-contact">
                                        <span className="email-icon">📧</span>
                                        {applicant.email}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-applicants">0 აპლიკანტი.</p>
                    )}
                </section>
            </div>
            <Footer />
            <style jsx>{`
                *{
                    font-family: "BPG Ingiri", sans-serif;
                }
                .job-detail-container {
                    max-width: 1200px;
                    margin: 60px auto;
                    padding: 40px;
                    background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                }

                .applicant-name{
                    color: black;
                    text-decoration: none;
                }

                .job-header {
                    text-align: center;
                    margin-bottom: 50px;
                    padding-bottom: 30px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                }

                .job-header h1 {
                    font-size: 3rem;
                    color: #2c3e50;
                    margin-bottom: 20px;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }

                .job-meta {
                    display: flex;
                    justify-content: center;
                    gap: 40px;
                    font-size: 1.1rem;
                    color: #666;
                }

                .label {
                    font-weight: 600;
                    color: #34495e;
                    margin-right: 8px;
                }

                .job-description {
                    font-size: 1.2rem;
                    line-height: 1.8;
                    color: #444;
                    margin: 40px 0;
                    padding: 30px;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 15px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
                }

                .applicants-section {
                    margin-top: 60px;
                }

                .applicants-section h2 {
                    font-size: 2.4rem;
                    color: #2c3e50;
                    text-align: center;
                    margin-bottom: 40px;
                    position: relative;
                }

                .applicants-section h2::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 60px;
                    height: 3px;
                    background: linear-gradient(to right, #3498db, #2980b9);
                    border-radius: 2px;
                }

                .applicants-list {
                    list-style: none;
                    padding: 0;
                    display: grid;
                    gap: 30px;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                }

                .applicant-card {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }

                .applicant-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
                }

                .applicant-name {
                    font-size: 1.4rem;
                    color: #2c3e50;
                    margin-bottom: 15px;
                    font-weight: 600;
                }

                .applicant-letter {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #555;
                    margin-bottom: 20px;
                }

                .applicant-contact {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 1.1rem;
                    color: #666;
                    padding-top: 15px;
                    border-top: 1px solid rgba(0, 0, 0, 0.1);
                }

                .email-icon {
                    font-size: 1.2rem;
                }

                .loading, .error {
                    text-align: center;
                    padding: 40px;
                    font-size: 1.4rem;
                    color: #666;
                }

                .error {
                    color: #e74c3c;
                }

                .no-applicants {
                    text-align: center;
                    font-size: 1.2rem;
                    color: #666;
                    padding: 40px;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 15px;
                }

                @media screen and (max-width: 768px) {
                    .job-detail-container {
                        margin: 20px;
                        padding: 20px;
                    }

                    .job-header h1 {
                        font-size: 2.2rem;
                    }

                    .job-meta {
                        flex-direction: column;
                        gap: 15px;
                    }

                    .job-description {
                        font-size: 1.1rem;
                        padding: 20px;
                    }
                    
                    .job-description p {
                        word-wrap: break-word;
                    }
                    
                    .applicants-section h2 {
                        font-size: 2rem;
                    }

                    .applicant-card {
                        padding: 20px;
                    }
                }
            `}</style>
        </>
    );
};

export default JobDetail;