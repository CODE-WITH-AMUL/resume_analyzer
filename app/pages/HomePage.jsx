import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import LoadingAnimation from '../components/LoadingAnimation';
import ScoreDisplay from '../components/ScoreDisplay';
import { resumeAPI } from '../services/api';

const HomePage = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await resumeAPI.uploadAndAnalyze(file);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="glass-effect sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              Resume Analyzer
            </motion.h1>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Dashboard
                  </Link>
                  <span className="text-gray-600">Welcome, {user.username}</span>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!result ? (
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <h2 className="text-5xl font-bold text-gray-900">
                Get Your Resume
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Analyzed by AI
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Upload your resume and get instant AI-powered analysis with detailed recommendations
                to improve your chances of landing your dream job.
              </p>
            </motion.div>

            <FileUpload onFileSelect={handleFileSelect} loading={loading} />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-600"
              >
                {error}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            >
              <div className="card text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Resume</h3>
                <p className="text-gray-600">
                  Simply drag and drop or click to upload your resume in PDF, DOCX, or TXT format.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  Our advanced AI analyzes your resume for structure, keywords, and overall quality.
                </p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Results</h3>
                <p className="text-gray-600">
                  Receive detailed scores and actionable recommendations to improve your resume.
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="space-y-6">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setResult(null)}
              className="btn-secondary"
            >
              ← Analyze Another Resume
            </motion.button>
            <ScoreDisplay result={result} />
          </div>
        )}
      </main>

      {loading && <LoadingAnimation />}
    </div>
  );
};

export default HomePage;
