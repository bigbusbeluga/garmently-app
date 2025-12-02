import React, { useState, useEffect } from 'react';
import './GetHelp.css';

function GetHelp() {
  const [activeQuestion, setActiveQuestion] = useState(null);

  useEffect(() => {
    document.title = 'Get Help - Garmently';
  }, []);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I add garments to my wardrobe?",
      answer: "Click on 'Add Garment' in the sidebar, then either upload a photo from your device, use Quick Capture for instant camera access, or use Camera View for in-app preview. Fill in the details like name, category, color, and size, then click 'Save Garment'."
    },
    {
      question: "Can I use Garmently offline?",
      answer: "Yes! Garmently is a Progressive Web App (PWA). Once you've loaded it once, you can access your wardrobe offline. However, adding new garments or syncing changes requires an internet connection."
    },
    {
      question: "How do I create outfit combinations?",
      answer: "Go to 'Mix & Match' from the sidebar. You'll see all your garments organized by category. Drag and drop items onto the outfit canvas to create combinations. You can save your favorite outfits and schedule them on the calendar."
    },
    {
      question: "What is the background removal feature?",
      answer: "When adding a garment photo, you can use the 'Remove Background' button to automatically remove the background from your image. This makes your garments look cleaner and more professional in your digital wardrobe."
    },
    {
      question: "How do I schedule outfits on the calendar?",
      answer: "After creating an outfit in Mix & Match, save it and give it a name. Then go to the Calendar page, click on a date, and select your saved outfit to schedule it for that day."
    },
    {
      question: "Can I edit or delete garments?",
      answer: "Yes! In your Wardrobe view, click the three-dot menu on any garment card. You can edit the details, mark it as favorite, or delete it from your wardrobe."
    },
    {
      question: "What's the Laundry Tracker for?",
      answer: "The Laundry Tracker helps you keep track of dirty clothes. Mark garments as 'In Laundry' when they're worn, and move them to 'Washing' when you start a load. Once clean, mark them as done and they'll return to your available wardrobe."
    },
    {
      question: "How do I install Garmently as an app?",
      answer: "On mobile, your browser will prompt you to 'Add to Home Screen'. On desktop Chrome/Edge, look for the install icon in the address bar. Once installed, Garmently works just like a native app!"
    },
    {
      question: "Is my data private and secure?",
      answer: "Absolutely! All your wardrobe data is securely stored and only accessible to you. We never share your personal information or images with third parties. Your data is encrypted and stored on secure AWS servers."
    },
    {
      question: "Can I access my wardrobe from multiple devices?",
      answer: "Yes! Log in with the same account on any device (phone, tablet, computer) and your entire wardrobe will sync automatically."
    },
    {
      question: "What image formats are supported?",
      answer: "Garmently supports all common image formats including JPG, PNG, HEIC, and WebP. For best results, use clear, well-lit photos with simple backgrounds."
    },
    {
      question: "How do I change my password?",
      answer: "Click on your profile dropdown in the top right, select 'Change Password', enter your current password and new password, then save. You'll receive a confirmation once it's updated."
    }
  ];

  return (
    <div className="help-page">
      <div className="help-header">
        <div className="help-icon">
          <i className="fas fa-question-circle"></i>
        </div>
        <h1>Get Help</h1>
        <p>Find answers to common questions and learn how to use Garmently</p>
      </div>

      <div className="help-content">
        {/* Quick Contact */}
        <div className="help-contact-card">
          <div className="contact-card-icon">
            <i className="fas fa-headset"></i>
          </div>
          <h2>Need More Help?</h2>
          <p>Can't find what you're looking for? Our support team is here to help!</p>
          <a href="mailto:garmently.supp@gmail.com" className="contact-support-btn">
            <i className="fas fa-envelope"></i>
            Contact Support
          </a>
          <p className="support-email">garmently.supp@gmail.com</p>
          <p className="response-note">We typically respond within 24-48 hours</p>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2 className="faq-title">
            <i className="fas fa-comments"></i>
            Frequently Asked Questions
          </h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeQuestion === index ? 'active' : ''}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleQuestion(index)}
                >
                  <span>{faq.question}</span>
                  <i className={`fas fa-chevron-${activeQuestion === index ? 'up' : 'down'}`}></i>
                </button>
                {activeQuestion === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="tips-section">
          <h2 className="tips-title">
            <i className="fas fa-lightbulb"></i>
            Quick Tips
          </h2>
          <div className="tips-grid">
            <div className="tip-card">
              <i className="fas fa-camera"></i>
              <h3>Photo Tips</h3>
              <p>Take photos against plain backgrounds in good lighting for best background removal results.</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-tags"></i>
              <h3>Stay Organized</h3>
              <p>Use categories, colors, and tags to organize your wardrobe and find items quickly.</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-calendar-check"></i>
              <h3>Plan Ahead</h3>
              <p>Schedule outfits for the week on Sunday to save time during busy mornings.</p>
            </div>
            <div className="tip-card">
              <i className="fas fa-star"></i>
              <h3>Mark Favorites</h3>
              <p>Mark your go-to pieces as favorites for quick access when creating outfits.</p>
            </div>
          </div>
        </div>

        {/* Video Tutorials Placeholder */}
        <div className="tutorials-section">
          <h2 className="tutorials-title">
            <i className="fas fa-play-circle"></i>
            Getting Started
          </h2>
          <div className="tutorial-grid">
            <div className="tutorial-card">
              <div className="tutorial-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h3>Adding Your First Garment</h3>
              <p>Learn how to quickly add items to your digital wardrobe</p>
            </div>
            <div className="tutorial-card">
              <div className="tutorial-icon">
                <i className="fas fa-tshirt"></i>
              </div>
              <h3>Creating Outfits</h3>
              <p>Discover how to mix and match items to create perfect looks</p>
            </div>
            <div className="tutorial-card">
              <div className="tutorial-icon">
                <i className="fas fa-calendar"></i>
              </div>
              <h3>Using the Calendar</h3>
              <p>Plan your weekly outfits and never repeat the same look</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GetHelp;
