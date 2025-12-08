import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const ScoreCircle = ({ score, label, color, delay }) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = score / 50;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(interval);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, 20);
      return () => clearInterval(interval);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [score, delay]);
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  
  const getColorClass = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${getColorClass()} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${getColorClass()}`}>
            {displayScore}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
    </motion.div>
  );
};

const ScoreDisplay = ({ result }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      <div className="card">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Resume Analysis Results
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <ScoreCircle
            score={result.overall_score || 0}
            label="Overall Score"
            color="blue"
            delay={0}
          />
          <ScoreCircle
            score={result.grammar_score || 0}
            label="Grammar Score"
            color="green"
            delay={200}
          />
          <ScoreCircle
            score={result.keyword_match_score || 0}
            label="Keyword Match"
            color="purple"
            delay={400}
          />
        </div>
        
        {result.job_categories && result.job_categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Detected Job Categories</h3>
            <div className="flex flex-wrap gap-2">
              {result.job_categories.map((category, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium"
                >
                  {category}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Contact Information
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {result.contact_information ? JSON.parse(result.contact_information) : 'Not found'}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="card"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Skills
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
            {result.skills ? (
              <div className="flex flex-wrap gap-2">
                {JSON.parse(result.skills).map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills found</p>
            )}
          </div>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="card"
      >
        <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          AI Recommendations & Suggestions
        </h3>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {result.suggestion || 'No suggestions available'}
          </div>
        </div>
      </motion.div>
      
      {result.education && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="card"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Education
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(JSON.parse(result.education), null, 2)}</pre>
          </div>
        </motion.div>
      )}
      
      {result.experience && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="card"
        >
          <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Experience
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(JSON.parse(result.experience), null, 2)}</pre>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScoreDisplay;
