import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, BarChart2, Bookmark, User, HelpCircle } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'My Journey',
      description: 'Record your daily thoughts and experiences',
      link: '/journey',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: BookOpen,
      title: 'Summary',
      description: 'View summaries of your entries',
      link: '/summary',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: BarChart2,
      title: 'Progress',
      description: 'Track your mood and habits over time',
      link: '/progress',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Bookmark,
      title: 'Highlights',
      description: 'Save and revisit important moments',
      link: '/highlights',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Your Wellness Journey</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A safe space to reflect, grow, and track your personal journey towards better mental health and wellbeing.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            <Link
              to={feature.link}
              className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
            >
              Get started
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Journey Today</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Take the first step towards better mental health. Your journey is unique, and we're here to support you every step of the way.
        </p>
        <Link
          to="/journey"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Begin Journaling
        </Link>
      </motion.div>
    </div>
  );
}
