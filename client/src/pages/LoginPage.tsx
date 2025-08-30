// import { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import type { AppDispatch, RootState } from '../app/store';
// import { generateLoginOtp, loginWithOtp, reset } from '../features/auth/authSlice';

// const LoginPage = () => {
//   const [formData, setFormData] = useState({ email: '', otp: '' });
//   const { email, otp } = formData;

//   const navigate = useNavigate();
//   const dispatch = useDispatch<AppDispatch>();

//   const { user, isLoading, isError, isSuccess, message } = useSelector(
//     (state: RootState) => state.auth
//   );

//   useEffect(() => {
//     // If login is successful, navigate to the notes page
//     if (isSuccess && user) {
//       navigate('/notes');
//     }
    
//     // Reset the auth state on component mount/unmount to clear previous messages
//     return () => {
//       dispatch(reset());
//     };
//   }, [user, isSuccess, navigate, dispatch]);

//   const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData((prevState) => ({
//       ...prevState,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleGetOtp = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();
//     if (email) {
//       dispatch(generateLoginOtp(email));
//     }
//   };

//   const onSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (email && otp) {
//       dispatch(loginWithOtp({ email, otp }));
//     }
//   };
  
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
//           <p className="mt-2 text-sm text-gray-600">Please login to continue.</p>
//         </div>
        
//         {isError && <p className="text-red-500 text-sm text-center py-2">{message}</p>}
//         {isSuccess && message && <p className="text-green-500 text-sm text-center py-2">{message}</p>}

//         <form className="space-y-4" onSubmit={onSubmit}>
//           <input
//             type="email"
//             name="email"
//             value={email}
//             onChange={onChange}
//             placeholder="Email"
//             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
          
//           <div className="flex items-center space-x-2">
//             <input
//               type="text"
//               name="otp"
//               value={otp}
//               onChange={onChange}
//               placeholder="OTP"
//               maxLength={6}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//             <button
//               onClick={handleGetOtp}
//               disabled={isLoading || !email}
//               className="px-4 py-2 text-sm font-bold text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-300 whitespace-nowrap"
//             >
//               Get OTP
//             </button>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
//           >
//             {isLoading ? 'Signing In...' : 'Sign In'}
//           </button>
//         </form>
//         <p className="text-sm text-center text-gray-600">
//           Need an account?{' '}
//           <Link to="/signup" className="font-medium text-blue-500 hover:underline">
//             Create one
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

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
                    // ✅ UPDATE this disabled check
                    disabled={loadingAction === 'getOtp' || !email}
                    className="text-sm font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {/* ✅ UPDATE this text conditional */}
                    {loadingAction === 'getOtp' ? 'Sending...' : 'Get OTP'}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              // ✅ UPDATE this disabled check
              disabled={loadingAction === 'login'}
              className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {/* ✅ UPDATE this text conditional */}
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