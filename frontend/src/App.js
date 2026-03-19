import React, { useEffect } from 'react'; 
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPortfolioData } from './redux/rootSlice';
import Intro from './components/intro/Intro.js';
import AppNavbar from './components/navbar/Navbar.js';
import About from './components/about/about.js'; 
import Footer from './components/footer/footer.js'; 
import LatestProjects from './components/projects/projects.js'; 
import TestSkills from './components/skills/testSkills.js'; 
import Contact from './components/contact/contact.js'; 

import AOS from 'aos';
import 'aos/dist/aos.css';  
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const { portfolioData, loading } = useSelector((state) => state.root); 
  const dispatch = useDispatch();

  
  const getPortfolioData = async () => {
    try {
      // Fixed: Updated API endpoint to match backend route
      const response = await axios.get("/api/protfolio/get-protfolio-data/"); // Adjust based on your actual route
      
      // If your backend wraps data in a 'data' property
      if (response.data.success && response.data.data) {
        dispatch(setPortfolioData(response.data.data));
      } else {
        // If backend returns data directly
        dispatch(setPortfolioData(response.data));
      }
    } catch (error) {
      console.log("Error fetching portfolio data:", error);
    }
  }

  useEffect(() => {
    getPortfolioData(); // Fixed: Using corrected function name
  }, []); // Added empty dependency array

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
    AOS.refresh();
  }, []);

  // Show loading state while fetching data
  if (loading) {
    return <div className="loader">Loading Portfolio...</div>;
  }

  // If data is missing after loading, show error message
  if (!portfolioData) {
    return <div className="error-message">Failed to load portfolio data. Please try again later.</div>;
  }

  return (
    <div>
      <div>
        <AppNavbar />
        <Intro />
        <About />
        <TestSkills />
        <LatestProjects />
        <Contact />
        <Footer />
      </div>
    </div>
  )
}

export default App;