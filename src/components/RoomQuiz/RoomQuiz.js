import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, CheckCircle } from 'lucide-react';
import './RoomQuiz.css';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '../Login-in/LogoutButton';
import { useNavigate, Link } from 'react-router-dom';
import { Search, User, Plus } from 'lucide-react';

function NavLink({ children, to }) {
    return (
      <Link to={to} className="nav-link">
        {children}
      </Link>
    );
  }

function Navigation() {
    return (
      <nav className="nav">
        <div className="nav-content">
          <div className="nav-left">
            <h1 className="logo">Decora</h1>
            <div className="nav-links">
              <NavLink to="/">Design</NavLink>
              <NavLink to="/products">Products</NavLink>
              <a href="/budget-estimator">Budget Estimator</a>
            </div>
          </div>
          <div className="nav-right">
            <div className="search-container">
              <input type="text" placeholder="Search" className="search-input" />
              <Search className="search-icon" />
            </div>
            <button className="profile-button">
              <User className="profile-icon" />
            </button>
            <LogoutButton />
          </div>
        </div>
      </nav>
    );
  }

const questions = [
    {
      id: 'bedrooms',
      title: 'Bedrooms',
      question: 'How many bedrooms does your house have?',
      icon: '🛏️',
      options: ['1', '2', '3', '4 or more']
    },
    {
      id: 'sqft',
      title: 'Square Footage',
      question: 'What is the area of your house in square feet?',
      icon: '📏',
      options: ['Less than 500 sq. ft', '500-1000 sq. ft', '1001-1500 sq. ft', 'More than 1500 sq. ft']
    },
    {
      id: 'price',
      title: 'Price per Sqft',
      question: 'What is the price per square foot of your house?',
      icon: '💰',
      options: ['Less than ₹10,000', '₹10,001 - ₹50,000', '₹50,001 - ₹1,00,000', 'More than ₹1,00,000']
    },
    {
      id: 'toilets',
      title: 'Bathrooms',
      question: 'How many bathrooms are there in your house?',
      icon: '🚽',
      options: ['1', '2', '3', '4 or more']
    },
    {
      id: 'locality',
      title: 'Location',
      question: 'Where is your house located?',
      icon: '📍',
      options: ['Urban', 'Rural']
    },
    {
      id: 'renovation',
      title: 'Renovation',
      question: 'What type of renovation was done in your house?',
      icon: '🔨',
      options: ['Necessity', 'Moderate', 'Luxury']
    },
    {
      id: 'cost',
      title: 'Renovation Cost',
      question: 'What was the total renovation cost of your house?',
      icon: '💸',
      options: ['Less than ₹10L', '₹10L - ₹50L', '₹50L - ₹1Cr', 'More than ₹1Cr']
    },
    {
      id: 'age',
      title: 'House Age',
      question: 'How old is your house?',
      icon: '⏳',
      options: ['Less than 10 years', '10-20 years', '21-40 years', 'More than 40 years']
    },
    {
      id: 'quality',
      title: 'Material Quality',
      question: 'What is the quality of materials used in your house?',
      icon: '⭐',
      options: ['Low', 'Medium', 'High']
    },
    {
      id: 'energy',
      title: 'Energy Rating',
      question: 'What is the energy efficiency rating of your house?',
      icon: '⚡',
      options: ['1 (Poor)', '2 (Fair)', '3 (Good)', '4 or more (Excellent)']
    }
  ];

const RoomQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [estimatedBudget, setEstimatedBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animation, setAnimation] = useState('quiz-fade-in');

  // Function to handle answer selection
  const handleAnswer = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: answer,
    }));
  };

  // Function to fetch budget from ML model
  const fetchEstimatedBudget = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/predict-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });
      const data = await response.json();
      setEstimatedBudget(data.estimatedBudget); // Replace `estimatedBudget` with the correct field name from your API
    } catch (error) {
      console.error('Error fetching budget:', error);
      setEstimatedBudget('Error calculating budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setAnimation('quiz-fade-out');
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setIsCompleted(true);
        fetchEstimatedBudget(); // Fetch the budget when the quiz is completed
      }
      setAnimation('quiz-fade-in');
    }, 300);
  };

  const handlePrevious = () => {
    setAnimation('quiz-fade-out');
    setTimeout(() => {
      if (currentQuestion > 0) {
        setCurrentQuestion((prev) => prev - 1);
      }
      setAnimation('quiz-fade-in');
    }, 300);
  };

  if (isCompleted) {
    return (
        <>
        <Navigation />
      <div className="quiz-wrapper">
        <div className="quiz-card">
          <div className="text-center p-4">
            <CheckCircle className="quiz-completion-icon w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#463024] mb-2">
              {loading ? 'Calculating your budget...' : 'Done! 🎉'}
            </h2>
            <p className="text-[#694832] mb-4">
              {loading
                ? 'Please wait while we calculate your estimated budget...'
                : `The estimated budget for your room is:`}
            </p>
            {!loading && (
                <h3 className="budget-display">
                  {estimatedBudget ? `₹ ${estimatedBudget}` : 'N/A'}
                </h3>
              )}
          </div>
          <div className="px-4 pb-4">
            {!loading && (
              <button
                onClick={() => window.location.reload()}
                className="quiz-button w-full py-2 px-4 rounded-lg font-semibold"
              >
                Take Quiz Again
              </button>
            )}
          </div>
        </div>
      </div>
    </>
    );
  }

  return (
    <>
    <Navigation/>
    <div className="quiz-wrapper">
      <div className="quiz-card">
        <div className="quiz-header">
          <h1 className="quiz-title">{questions[currentQuestion].title}</h1>
          <p className="quiz-subtitle">{questions[currentQuestion].question}</p>
          <div className="quiz-progress">
            <span>{currentQuestion + 1}</span>
            <div className="quiz-progress-container">
              <div
                className="quiz-progress-fill"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <span>{questions.length}</span>
          </div>
        </div>

        <div className="question-area">
          <div className={`options-grid ${animation}`}>
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`quiz-option ${
                  answers[questions[currentQuestion].id] === option ? 'selected' : ''
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="quiz-button"
          >
            <ChevronLeft className="w-5 h-5" /> Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!answers[questions[currentQuestion].id]}
            className="quiz-button"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default RoomQuiz;
