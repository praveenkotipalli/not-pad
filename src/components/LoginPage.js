import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './LoginPage.css';

function LoginPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      alert("Failed to sign in. Check the console.");
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className={`navigation ${isVisible ? 'visible' : ''}`}>
        <div className="nav-content">
          <div className="logo-section">
            <div className="logo-icon">N</div>
            <span className="logo-text">Notpad</span>
          </div>
          
        </div>
      </nav>

      {/* Hero Section */}
      <main className="main-content">
        <div className="hero-grid">
          {/* Left Side - Content */}
          <div className={`content-sectionh ${isVisible ? 'visible' : ''}`}>
            <h1 className="hero-title">
              Scattered thoughts?
              <br />
              <span className="hero-title-bold">Organized ideas.</span>
            </h1>
            
            <p className="hero-subtitle">
              The AI for capturing and organizing your thoughts
            </p>

            {/* Sign In Card */}
            <div className="signin-card">
            <div className="divider-container">
                <div className="divider-line"></div>
                <span className="divider-text">Login/Sign up</span>
              </div>
              <button onClick={handleGoogleSignIn} className="google-signin-btn">
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              

              {/* <input 
                type="email" 
                placeholder="Enter your email"
                className="email-input"
              /> */}
              
              {/* <button className="email-signin-btn">
                Continue with email
              </button> */}
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className={`visual-section ${isVisible ? 'visible' : ''}`}>
  <div className="visual-wrapper">
    <div className="visual-glow"></div>

    <div className="visual-card">
      <div className="visual-contenth">
        <video 
          src="./claude_login.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="visual-video"
        ></video>
      </div>
    </div>
  </div>
</div>

        </div>

        {/* Feature highlights */}
        <div className={`features-grid ${isVisible ? 'visible' : ''}`}>
          <div className="feature-card">
            <div className="feature-icon feature-icon-blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="feature-title">AI-Powered Insights</h3>
            <p className="feature-description">Automatically organize and connect your thoughts with intelligent suggestions</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon feature-icon-purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="feature-title">Instant Capture</h3>
            <p className="feature-description">Record thoughts faster than you can type with voice-to-text and quick notes</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon feature-icon-orange">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="feature-title">Private & Secure (not yet)</h3>
            
            <p className="feature-description">Your notes stay yours with end-to-end encryption and privacy-first design</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;