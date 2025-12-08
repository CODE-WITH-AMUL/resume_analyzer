import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resumeAPI } from '../services/api';
import ScoreDisplay from '../components/ScoreDisplay';

const ResultsPage = ({ user }) => {
  const { cvId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCVDetails();
  }, [cvId]);

  const fetchCVDetails = async () => {
    try {
      const data = await resumeAPI.getDetail(cvId);
      
      const formattedResult = {
        id: data.id,
        overall_score: data.overall_score,
        grammar_score: data.grammar_score,
        keyword_match_score: data.keyword_match_score,
        suggestion: data.suggestion,
        extracted_text: data.extracted_text,
        contact_information: data.contact_information,
        education: data.education,
        experience: data.experience,
        skills: data.skills,
        projects: data.projects,
        job_categories: [],
        created_at: data.created_at,
      };
      
      setResult(formattedResult);
    } catch (err) {
      setError('Failed to load resume details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="glass-effect sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Resume Analyzer
              </motion.h1>
            </Link>
            <div className="flex items-center space-x-4">
              {user && (
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                  Dashboard
                </Link>
              )}
              <Link to="/" className="btn-secondary px-4 py-2 text-sm">
                New Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <svg
              className="w-24 h-24 text-red-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Resume</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Link to="/dashboard" className="btn-primary inline-block">
              Back to Dashboard
            </Link>
          </motion.div>
        ) : result ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between"
            >
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                ← Back
              </button>
              <p className="text-sm text-gray-500">
                Analyzed on {new Date(result.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </motion.div>
            <ScoreDisplay result={result} />
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default ResultsPage;
