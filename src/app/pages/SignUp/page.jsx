'use client'
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link'; // Import Link from next/link

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'freelancer' // Default role is freelancer
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Create form data object to send to the backend
    const data = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };

    // Send POST request to the backend
    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert('User registered successfully');
      } else {
        alert(result.message || 'Registration failed');
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f6f6 0%, #ffffff 100%)',
      padding: '20px'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}>
        <h1 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '2rem',
          fontWeight: '700',
          color: '#000',
          letterSpacing: '-0.025em'
        }}>
          Create Account
        </h1>
        
        {['username', 'email', 'password', 'confirmPassword'].map((field) => (
          <div key={field} style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#000',
              textTransform: 'capitalize'
            }}>
              {field === 'confirmPassword' ? 'Confirm Password' : field}
            </label>
            
            <div style={{ position: 'relative' }}>
              <input
                type={field.includes('password') ? (showPassword[field] ? 'text' : 'password') : field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  border: '2px solid #e5e5e5',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  outline: 'none',
                  backgroundColor: '#fafafa'
                }}
              />
              
              {field.includes('password') && (
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({
                    ...prev,
                    [field]: !prev[field]
                  }))}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    color: '#666'
                  }}
                >
                  {showPassword[field] ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              )}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#000',
            textTransform: 'capitalize'
          }}>
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              border: '2px solid #e5e5e5',
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}
          >
            <option value="freelancer">Freelancer</option>
            <option value="employer">Employer</option>
          </select>
        </div>

        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '0.875rem',
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: '1rem',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}
        >
          Sign Up
        </button>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          Already have an account?{' '}
          <Link
            href="./SignIn" // Use href for Next.js Link
            style={{
              color: '#000',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpForm;
