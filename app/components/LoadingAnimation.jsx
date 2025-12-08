import { motion } from 'framer-motion';

const LoadingAnimation = ({ message = 'Analyzing your resume...' }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-md w-full mx-4"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <motion.div
              className="w-24 h-24 rounded-full border-4 border-blue-200"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600"></div>
            </motion.div>
            
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-800">{message}</h3>
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                className="w-2 h-2 bg-blue-600 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-600 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-600 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </div>
          
          <div className="w-full space-y-2">
            <div className="text-sm text-gray-600 text-center">
              <p>• Extracting text from your resume</p>
              <p>• Analyzing content with AI</p>
              <p>• Generating recommendations</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingAnimation;
