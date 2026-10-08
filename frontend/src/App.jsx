import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import FormPage from './pages/FormPage';
import InputPage from './pages/InputPage';
import ResultPage from './pages/ResultPage';
import SchemesPage from './pages/SchemesPage';
import CalculatorPage from './pages/CalculatorPage';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1A1A1A]">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/advisor" element={<InputPage />} />
              <Route path="/input" element={<InputPage />} />
              <Route path="/advisory" element={<InputPage />} />
              <Route path="/form" element={<FormPage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
