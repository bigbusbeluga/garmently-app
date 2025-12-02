import React, { useEffect } from 'react';
import './About.css';

function About() {
  useEffect(() => {
    document.title = 'About - Garmently';
  }, []);

  return (
    <div className="about-page">
      <div className="about-header">
        <div className="about-logo">
          <img src="/images/logo.png" alt="Garmently Logo" />
        </div>
        <h1>About Garmently</h1>
        <p className="tagline">Your Personal Digital Wardrobe Assistant</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <div className="section-icon">
            <i className="fas fa-lightbulb"></i>
          </div>
          <h2>Our Mission</h2>
          <p>
            Garmently is designed to revolutionize the way you manage your wardrobe. 
            We believe that organizing your clothes should be simple, fun, and accessible 
            from anywhere. Our mission is to help you make the most of what you already own, 
            reduce decision fatigue, and discover new outfit combinations you never thought possible.
          </p>
        </section>

        <section className="about-section">
          <div className="section-icon">
            <i className="fas fa-star"></i>
          </div>
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <i className="fas fa-tshirt"></i>
              <h3>Digital Wardrobe</h3>
              <p>Organize all your garments in one place with photos and details</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-palette"></i>
              <h3>Mix & Match</h3>
              <p>Create and visualize outfit combinations effortlessly</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-calendar-alt"></i>
              <h3>Outfit Calendar</h3>
              <p>Plan your outfits ahead and never repeat the same look</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-soap"></i>
              <h3>Laundry Tracker</h3>
              <p>Keep track of what needs washing and when</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-camera"></i>
              <h3>Quick Capture</h3>
              <p>Add garments instantly with your phone's camera</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-mobile-alt"></i>
              <h3>PWA Ready</h3>
              <p>Install as an app and use offline on any device</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="section-icon">
            <i className="fas fa-code"></i>
          </div>
          <h2>Technology</h2>
          <p>
            Garmently is built with modern web technologies to ensure a fast, 
            responsive, and reliable experience across all devices. Our progressive 
            web app (PWA) works seamlessly on mobile and desktop, with offline 
            capabilities to access your wardrobe anytime, anywhere.
          </p>
          <div className="tech-stack">
            <span className="tech-badge">React</span>
            <span className="tech-badge">Django</span>
            <span className="tech-badge">PostgreSQL</span>
            <span className="tech-badge">AWS S3</span>
            <span className="tech-badge">PWA</span>
          </div>
        </section>

        <section className="about-section contact-section">
          <div className="section-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h2>Contact & Support</h2>
          <p>
            Have questions, feedback, or need help? We'd love to hear from you!
          </p>
          <div className="contact-info">
            <a href="mailto:garmently.supp@gmail.com" className="contact-email">
              <i className="fas fa-envelope"></i>
              garmently.supp@gmail.com
            </a>
          </div>
          <p className="response-time">
            We typically respond within 24-48 hours.
          </p>
        </section>

        <section className="about-section">
          <div className="section-icon">
            <i className="fas fa-heart"></i>
          </div>
          <h2>Privacy & Data</h2>
          <p>
            Your privacy matters to us. All your wardrobe data is securely stored 
            and only accessible to you. We never share your personal information 
            or images with third parties. Your fashion choices are yours alone!
          </p>
        </section>

        <section className="about-section version-section">
          <p className="version-info">
            Version 2.1 • December 2025
          </p>
          <p className="copyright">
            © 2025 Garmently. Made with <i className="fas fa-heart"></i> for fashion lovers everywhere.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
