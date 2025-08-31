import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { AppDispatch, RootState } from '../app/store';
import { generateLoginOtp, loginWithOtp, reset } from '../features/auth/authSlice';

// Asset Imports
import logo from '../assets/logo.png';
import backgroundImage from '../assets/container.jpg';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, loadingAction, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (isSuccess && user) {
      navigate('/notes'); // Navigate to notes page on successful login
    }
    // Clean up messages when the component is left
    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, navigate, dispatch]);

  const handleGetOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (email) {
      dispatch(generateLoginOtp(email));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && otp) {
      dispatch(loginWithOtp({ email, otp }));
    }
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-[1fr_1.5fr]">
        
      {/* Left Side - Form */}
      <div className="bg-white grid place-items-center p-6 relative">
        
        {/* Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2">
            <img src={logo} alt="HD Logo" className="h-6 w-auto" />
        </div>

        <div className="w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sign in</h1>
          <p className="mt-1 text-gray-600">
            Please login to continue to your account.
          </p>
          
          {/* Error/Success Message Display */}
          {isError && <p className="mt-4 text-sm text-center text-red-500">{message}</p>}
          {isSuccess && message && <p className="mt-4 text-sm text-center text-green-500">{message}</p>}

          <form className="mt-4 space-y-3" onSubmit={handleLogin}>
            <div>
              <label className="text-sm font-medium text-gray-500" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-lg border-2 border-blue-500 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500" htmlFor="otp">
                OTP
              </label>
              <div className="relative">
                <input
                  id="otp"
                  name="otp"
                  type={showOtp ? 'text' : 'password'}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter your OTP"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOtp ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <div className="mt-1 text-right">
                <button 
                    type="button" 
                    onClick={handleGetOtp} 
                    disabled={loadingAction === 'getOtp' || !email}
                    className="text-sm font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {loadingAction === 'getOtp' ? 'Sending...' : 'Get OTP'}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loadingAction === 'login'}
              className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {loadingAction === 'login' ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Need an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image (Only visible on desktop) */}
      <div className="hidden md:block bg-white-900 m-3">
        <img
          src={backgroundImage}
          alt="Abstract background"
          className="h-full w-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
};

export default LoginPage;