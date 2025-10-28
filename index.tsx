import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
<<<<<<< HEAD
import { AuthProvider } from './contexts/AuthContext';
=======
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
<<<<<<< HEAD
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
=======
    <LanguageProvider>
      <App />
    </LanguageProvider>
>>>>>>> 39ceae5246b9efa5d915fc623f5e55a25c810605
  </React.StrictMode>
);