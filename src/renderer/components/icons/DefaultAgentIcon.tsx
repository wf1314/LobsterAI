import React from 'react';

const DefaultAgentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 5V3.5M8.75 5h6.5A4.75 4.75 0 0 1 20 9.75v5A4.75 4.75 0 0 1 15.25 19h-6.5A4.75 4.75 0 0 1 4 14.25v-4.5A4.75 4.75 0 0 1 8.75 5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M9 12h.01M15 12h.01M9.75 15.25h4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export default DefaultAgentIcon;
