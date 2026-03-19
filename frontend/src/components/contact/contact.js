import React, { useState } from 'react';
// import axios from 'axios';
import { useSelector } from 'react-redux';
import './contact.css';

const ContactForm = () => {
   const { portfolioData } = useSelector((state) => state.root);
   
   const [formData, setFormData] = useState({
     name: '',
     lastName: '',
     email: '',
     subject: '',
     message: ''
    });
    
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({
      loading: false,
      success: null,
      message: ''
    });
    
    // FIXED: Added null checks with optional chaining and moved after all hooks
    const { email: contactEmail, Phone, location } = portfolioData?.contact || {};
    const { heading, description } = portfolioData?.contactInfo || {};
    const { socialLink } = portfolioData || {};

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
            newErrors.name = 'Name can only contain letters and spaces';
        }

        // LastName validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
            newErrors.lastName = 'Last name can only contain letters and spaces';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        // Subject validation
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (formData.subject.length < 3) {
            newErrors.subject = 'Subject must be at least 3 characters';
        } else if (formData.subject.length > 100) {
            newErrors.subject = 'Subject must be less than 100 characters';
        }
        
        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        } else if (formData.message.length > 1000) {
            newErrors.message = 'Message must be less than 1000 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        setStatus({ loading: true, success: null, message: '' });

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({
                    loading: false,
                    success: true,
                    message: data.message || 'Message sent successfully!'
                });
                // FIXED: Reset form with all fields including lastName
                setFormData({ 
                    name: '', 
                    lastName: '', // Added lastName to reset
                    email: '', 
                    subject: '', 
                    message: '' 
                });
                setErrors({});
                
                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                    setStatus(prev => ({ ...prev, message: '' }));
                }, 5000);
            } else {
                // Handle backend validation errors
                if (data.errors) {
                    const backendErrors = {};
                    data.errors.forEach(err => {
                        backendErrors[err.path] = err.msg;
                    });
                    setErrors(backendErrors);
                }
                setStatus({
                    loading: false,
                    success: false,
                    message: data.error || 'Failed to send message'
                });
            }
        } catch (error) {
            setStatus({
                loading: false,
                success: false,
                message: 'Network error. Please try again.'
            });
        }
    };

    // FIXED: Added loading check at the beginning of render
    if (!portfolioData) {
        return <div className="text-center text-white py-5">Loading contact form...</div>;
    }

    return (
        <div className='container-fluid skills-bg text-white py-lg-5' id="contact">
            <div className="container py-lg-5">
                <div className='row'>
                    <div className="col-lg-12 col-md-12 mx-auto text-center py-5" data-aos="fade-up" data-aos-easing="ease-in-sine">
                        <h1 className="fw-light text-white" >Get In Touch</h1>
                        <div className="gradient-bar-contact mt-3"></div> 
                        <p className='mt-4 w-100 w-md-50 w-lg-50 mx-auto'>
                         {
                            heading || 'heading not provided'
                         }
                        </p>
                    </div>
                </div>
                
                <div className="row align-items-stretch g-5 contact-wrap">
                    {/* Left Column - Contact Form */}
                    <div className="col-md-6">
                        <div className="card contact-card text-light rounded-12" data-aos="fade-up" data-aos-easing="ease-in-sine">
                            <div className="card-body p-4">
                                <div className="form h-100">
                                    <h3 className='py-4'>Send us a message</h3>
                                    
                                    {/* Status Message */}
                                    {status.message && (
                                        <div className={`alert ${status.success ? 'alert-success' : 'alert-danger'}`} 
                                             style={{
                                                padding: '10px',
                                                marginBottom: '15px',
                                                borderRadius: '4px',
                                                backgroundColor: status.success ? '#d4edda' : '#f8d7da',
                                                color: status.success ? '#155724' : '#721c24',
                                                border: `1px solid ${status.success ? '#c3e6cb' : '#f5c6cb'}`
                                             }}>
                                            {status.message}
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleSubmit} noValidate className="mb-5" name="contactForm">
                                        <div className="row mb-3">
                                            <div className="col">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Your Name *"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    disabled={status.loading}
                                                    className="form-control"
                                                />
                                                {errors.name && (
                                                    <p style={{ color: 'red', fontSize: '12px', margin: '5px 0 0' }}>
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="col">
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    placeholder="Your Last Name *"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    disabled={status.loading}
                                                    className="form-control"
                                                />
                                                {/* FIXED: Changed errors.email to errors.lastName */}
                                                {errors.lastName && (
                                                    <p style={{ color: 'red', fontSize: '12px', margin: '5px 0 0' }}>
                                                        {errors.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Your Email *"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={status.loading}
                                                className="form-control"
                                            />
                                            {errors.email && (
                                                <p style={{ color: 'red', fontSize: '12px', margin: '5px 0 0' }}>
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                name="subject"
                                                placeholder="Subject *"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                disabled={status.loading}
                                                className="form-control"
                                            />
                                            {errors.subject && (
                                                <p style={{ color: 'red', fontSize: '12px', margin: '5px 0 0' }}>
                                                    {errors.subject}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mb-3">
                                            <textarea
                                                name="message"
                                                placeholder="Your Message *"
                                                rows="5"
                                                value={formData.message}
                                                onChange={handleChange}
                                                disabled={status.loading}
                                                className="form-control"
                                            />
                                            {errors.message && (
                                                <p style={{ color: 'red', fontSize: '12px', margin: '5px 0 0' }}>
                                                    {errors.message}
                                                </p>
                                            )}
                                            <p style={{ fontSize: '12px', color: '#3c6582', margin: '5px 0 0' }}>
                                                {formData.message.length}/1000 characters
                                            </p>
                                        </div>
                                        <div className="d-grid gap-2">  
                                            <button 
                                                type="submit" 
                                                disabled={status.loading}
                                                className="btn btn-success"
                                            >
                                                {status.loading ? 'Sending...' : 'SEND MESSAGE'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column - Contact Info */}
                    <div className="col-md-6">
                        <div className="contact-info h-100" data-aos="zoom-in" data-aos-easing="ease-in-sine">
                            <h3>Let's Connect</h3>
                            <p className="mb-5 mt-4">
                                {description || 'description not provided'}
                            </p>
                            
                            <ul className="list-unstyled mb-5">
                                {/* Email Contact */}
                                <li className="d-grid gap-2 mb-3" data-aos="fade-up" data-aos-easing="ease-in-sine">
                                    <a href={`mailto:${contactEmail || ''}`} 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="btn d-flex custom-contact-link btn-block" 
                                       role="button">
                                        <div className='col-auto h-100 d-grid gap-1'>                                             
                                            <button type="button" className="btn bg-emerald-500 rounded-80" disabled>
                                                <i className="bi bi-envelope fs-4"></i>
                                            </button>
                                        </div>
                                        <div className='col d-grid'>
                                            <p className="text mb-0 ms-3 text-gray text-start">Email</p>
                                            <p className='text-light mb-0 ms-3 text-start'>
                                                {contactEmail || 'Email not provided'}
                                            </p>
                                        </div>  
                                    </a>
                                </li>   
                                
                                {/* Location Contact */}
                                <li className="d-grid gap-2 mb-3" data-aos="fade-up" data-aos-easing="ease-in-sine">
                                    <a href="https://maps.app.goo.gl/LipusFYdkSzrQerj6" 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       className="btn d-flex custom-contact-link btn-block" 
                                       role="button">
                                        <div className='col-auto h-100 d-grid gap-1'>                                             
                                            <button type="button" className="btn bg-emerald-500 rounded-80" disabled>
                                                <i className="bi bi-geo-alt fs-4"></i>
                                            </button>
                                        </div>
                                        <div className='col d-grid'>
                                            <p className="text mb-0 ms-3 text-gray text-start">Location</p>
                                            <p className='text-light mb-0 ms-3 text-start'>{location || 'Location not provided'}</p>
                                        </div>  
                                    </a>
                                </li>   
                                
                                {/* Phone Contact */}
                                <li className="d-grid gap-2 mb-3" data-aos="fade-up" data-aos-easing="ease-in-sine">
                                <div className="d-flex custom-contact-link btn-block">
                                    <div className='col-auto h-100 d-grid gap-1'>                                             
                                    <button type="button" className="btn bg-emerald-500 rounded-80" disabled>
                                        <i className="bi bi-telephone fs-4"></i>
                                    </button>
                                    </div>
                                    <div className='col d-grid'>
                                    <p className="text mb-0 ms-3 text-gray text-start">Phone</p>
                                    <div className='d-flex justify-content-start gap-3 ms-3 flex-wrap'>
                                        {Phone?.map((num, index) => {
                                        return (
                                            <a 
                                            href={`tel:${num}`} 
                                            key={index} 
                                            className='text-light text-decoration-none phone-link'
                                            style={{ padding: '4px 8px', borderRadius: '4px' }}
                                            >
                                            {num}
                                            </a>
                                        )
                                        })}
                                    </div>
                                    </div>  
                                </div>
                                </li>
                            </ul>
                            
                            <div data-aos="fade-up" data-aos-easing="ease-in-sine">
                                <p className='pt-2'>Follow Me</p>
                                <div>
                                    {socialLink?.map((item, index) => {
                                        return (
                                            <a key={index} 
                                               href={item.url} 
                                               target="_blank"
                                               rel="noopener noreferrer"
                                               className="btn btn-md btn-dark m-1 rounded-corner custom-icon-btn">
                                                <i className={`bi bi-${item.icon}`}></i>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;