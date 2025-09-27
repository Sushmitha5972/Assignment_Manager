import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="overlay"></div>

      <header className="landing-header">
        <h1 className="landing-title">Welcome to Productivity Manager</h1>
        <p className="landing-subtitle">Organize, Track & Boost Your Productivity Effortlessly</p>
        <div className="landing-buttons">
          <a href="/login" className="btn primary-btn">Get Started</a>
          
        </div>
      </header>

      
    </div>
  );
};

export default LandingPage;