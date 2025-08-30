// import { useState } from 'react';
// import { FiEye, FiEyeOff, FiCalendar } from 'react-icons/fi';
// import logo from '../assets/logo.png';
// import containerImage from '../assets/container.jpg';

// const SignupPage = () => {
//   const [step, setStep] = useState(1);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleGetOtp = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Getting OTP...');
//     setStep(2);
//   };

//   const handleSignup = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Signing up...');
//   };

//   return (
//     <div className="h-screen w-full grid grid-cols-1 md:grid-cols-[1fr_1.5fr]">
        
//       {/* Left Side - Form */}
//       <div className="bg-white grid place-items-center p-6">
//         <div className="w-full max-w-md">
//           {/* Logo */}
//           <div className="mb-4 flex items-center gap-2">
//             <img src={logo} alt="HD Logo" className="h-6 w-auto" />
//           </div>

//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sign up</h1>
//           <p className="mt-1 text-gray-600">
//             {step === 1
//               ? 'Sign up to enjoy the feature of HD'
//               : 'Enter the OTP sent to your email'}
//           </p>

//           <form
//             className="mt-4 space-y-3"
//             onSubmit={step === 1 ? handleGetOtp : handleSignup}
//           >
//             {/* Common Fields */}
//             <div>
//               <label className="text-sm font-medium text-gray-500" htmlFor="name">
//                 Your Name
//               </label>
//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 placeholder="Enter your full name"
//                 className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="text-sm font-medium text-gray-500" htmlFor="dob">
//                 Date of Birth
//               </label>
//               <div className="relative">
//                 <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   id="dob"
//                   name="dob"
//                   type="text"
//                   placeholder="Select your date of birth"
//                   className="mt-1 block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium text-gray-500" htmlFor="email">
//                 Email
//               </label>
//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="you@example.com"
//                 className="mt-1 block w-full rounded-lg border-2 border-blue-500 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//               />
//             </div>
            
//             {/* Conditional OTP Field */}
//             {step === 2 && (
//               <div>
//                 <label className="text-sm font-medium text-gray-500" htmlFor="otp">
//                   OTP
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="otp"
//                     name="otp"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Enter your OTP"
//                     className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <FiEyeOff /> : <FiEye />}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Conditional Button */}
//             <button
//               type="submit"
//               className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               {step === 1 ? 'Get OTP' : 'Sign up'}
//             </button>
//           </form>

//           <p className="mt-4 text-center text-sm text-gray-600">
//             Already have an account?{' '}
//             <a href="#" className="font-medium text-blue-600 hover:underline">
//               Sign in
//             </a>
//           </p>
//         </div>
//       </div>

//       {/* Right Side - Image (Only visible on desktop) */}
//       <div className="hidden md:block bg-white-900 m-3">
//         <img
//           src={containerImage}
//           alt="Abstract background"
//           className="h-full w-full object-cover rounded-xl"
//         />
//       </div>
//     </div>
//   );
// };

// export default SignupPage;

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { AppDispatch, RootState } from '../app/store';
import { signup, verifyOtp, reset } from '../features/auth/authSlice';

// Asset Imports
import logo from '../assets/logo.png';
import containerImage from '../assets/container.jpg';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    email: '',
    password: '',
    otp: '',
  });
  const [step, setStep] = useState(1);
  const [showOtp, setShowOtp] = useState(false);
  const { name, dateOfBirth, email, password, otp } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user, loadingAction, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // When the backend confirms OTP has been sent
    if (isSuccess && message.includes('OTP sent')) {
      setStep(2);
      dispatch(reset()); // Reset for the next step
    }

    // When OTP verification is successful and we have a user
    if (isSuccess && user) {
      navigate('/notes');
    }

    // Clean up state on unmount
    return () => { dispatch(reset()); };
  }, [user, isSuccess, message, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { name, dateOfBirth, email, password };
    dispatch(signup(userData));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const otpData = { email, otp };
    dispatch(verifyOtp(otpData));
  };

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-[1fr_1.5fr]">
      
      {/* Left Side - Form */}
      <div className="bg-white grid place-items-center p-6 relative">
        
        <div className="absolute top-8 left-8 flex items-center gap-2">
            <img src={logo} alt="HD Logo" className="h-6 w-auto" />
        </div>

        <div className="w-full max-w-md">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sign up</h1>
          <p className="mt-1 text-gray-600">
            {step === 1
              ? 'Sign up to enjoy the feature of HD'
              : `Enter the OTP sent to ${email}`}
          </p>
          
          {isError && <p className="mt-4 text-sm text-center text-red-500">{message}</p>}
          {isSuccess && message.includes('OTP sent') && <p className="mt-4 text-sm text-center text-green-500">OTP sent successfully!</p>}

          <form
            className="mt-4 space-y-3"
            onSubmit={step === 1 ? handleGetOtp : handleSignup}
          >
            {/* Step 1: User Details */}
            {step === 1 && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500" htmlFor="name">Your Name</label>
                  <input id="name" name="name" type="text" placeholder="Enter your full name" value={name} onChange={onChange} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500" htmlFor="dob">Date of Birth</label>
                  <input id="dob" name="dateOfBirth" type="date" value={dateOfBirth} onChange={onChange} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500" htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" placeholder="you@example.com" value={email} onChange={onChange} required className="mt-1 block w-full rounded-lg border-2 border-blue-500 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500" htmlFor="password">Password</label>
                  <input id="password" name="password" type="password" placeholder="6+ characters" value={password} onChange={onChange} required className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500" />
                </div>
              </>
            )}
            
            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div>
                <label className="text-sm font-medium text-gray-500" htmlFor="otp">OTP</label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type={showOtp ? 'text' : 'password'}
                    placeholder="Enter your OTP"
                    value={otp}
                    onChange={onChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  />
                  <button type="button" onClick={() => setShowOtp(!showOtp)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showOtp ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingAction === 'signup' || loadingAction === 'verify'}
              className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {loadingAction === 'signup' ? 'Sending OTP...' : (loadingAction === 'verify' ? 'Verifying...' : (step === 1 ? 'Get OTP' : 'Sign up'))}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden md:block bg-white-900 m-3">
        <img
          src={containerImage}
          alt="Abstract background"
          className="h-full w-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
};

export default SignupPage;