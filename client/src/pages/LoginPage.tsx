import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../app/store';
import { generateLoginOtp, loginWithOtp, reset } from '../features/auth/authSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', otp: '' });
  const { email, otp } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // If login is successful, navigate to the notes page
    if (isSuccess && user) {
      navigate('/notes');
    }
    
    // Reset the auth state on component mount/unmount to clear previous messages
    return () => {
      dispatch(reset());
    };
  }, [user, isSuccess, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGetOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (email) {
      dispatch(generateLoginOtp(email));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && otp) {
      dispatch(loginWithOtp({ email, otp }));
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="mt-2 text-sm text-gray-600">Please login to continue.</p>
        </div>
        
        {isError && <p className="text-red-500 text-sm text-center py-2">{message}</p>}
        {isSuccess && message && <p className="text-green-500 text-sm text-center py-2">{message}</p>}

        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={onChange}
              placeholder="OTP"
              maxLength={6}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              onClick={handleGetOtp}
              disabled={isLoading || !email}
              className="px-4 py-2 text-sm font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-300 whitespace-nowrap"
            >
              Get OTP
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Need an account?{' '}
          <Link to="/signup" className="font-medium text-blue-500 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;