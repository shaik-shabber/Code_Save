import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-200 dark:bg-gray-800 py-4 text-center">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
