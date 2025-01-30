'use client'

import styles from './Modal.module.css';
import { useState } from 'react';

export default function Modal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    min_budget: '',
    max_budget: ''
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Pass formData to the onSubmit prop
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.modalTitle}>სამუშაოს დამატება</h2>
        <form className={styles.form} onSubmit={handleFormSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">სათაური</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="description">აღწერა</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="keywords">საკვანძო სიტყვები</label>
            <input
              type="text"
              id="keywords"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="min_budget">მინიმალური ბიუჯეტი</label>
            <input
              type="number"
              id="min_budget"
              name="min_budget"
              value={formData.min_budget}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="max_budget">მაქსიმალური ბიუჯეტი</label>
            <input
              type="number"
              id="max_budget"
              name="max_budget"
              value={formData.max_budget}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>Submit</button>
        </form>
      </div>
    </div>
  );
}
