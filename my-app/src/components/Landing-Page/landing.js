import React from "react";
import { Star } from "lucide-react";
import "./Landing.css";
import landingImg from './landingimg.png'
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../NavBar/Navbar";

const Landing = () => {
  const testimonials = [
    {
      name: "Mohammed Bhadsorawala",
      role: "Interior Designer",
      rating: 5,
      text: "This virtual interior design tool has revolutionized how I present concepts to clients. The visualization capabilities are outstanding!",
    },
    {
      name: "Adi Awaskar",
      role: "Homeowner",
      rating: 5,
      text: "Transformed my space without the guesswork. The Budget Estimater is spot-on and helped me achieve exactly what I envisioned, while staying in budget.",
    },
    {
      name: "Aarya B",
      role: "Architect",
      rating: 4,
      text: "I’m really impressed with this tool! It’s incredibly convenient and easy to use. I can now bring concepts to life faster than ever before",
    },
  ];

  return (
    <>
      <div className="landing-container">
        <Navbar />
        <div className="hero-content">
          <div className="hero-text">
            <h1>Transform Your Space within minutes...</h1>
            <p>
              Experience the future of interior design at your fingertips. Turn
              your ideas into stylish designs in seconds.
            </p>
            <button className="start-designing-btn">Get Started</button>
          </div>
          <div className="hero-image">
            <img src={landingImg} alt="Interior Design Preview" />
          </div>
        </div>
      </div>
      <div className="testimonials-section">
        <h2>What People Say</h2>
        <div className="testimonials-container">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="star-icon" />
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <p className="author-name">{testimonial.name}</p>
                <p className="author-role">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Landing;
