// webapp/components/dashboard-wrapper.tsx
import React from 'react';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children }) => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {children}
    </div>
  );
};

export default DashboardWrapper;