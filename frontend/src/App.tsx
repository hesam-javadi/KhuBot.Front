import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div dir="rtl" className="h-screen w-full max-w-full p-0 m-0 overflow-hidden bg-white text-gray-900">
          <Toaster 
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 5000,
              style: {
                fontFamily: 'IranSansX, sans-serif',
                textAlign: 'right',
                direction: 'rtl',
              }
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
