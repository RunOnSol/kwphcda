import React from 'react';
import { Activity } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">KWSPHCDA</h2>
        <p className="mt-2 text-sm text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;