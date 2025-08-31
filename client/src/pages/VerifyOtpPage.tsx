import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AppDispatch, RootState } from '../app/store';
import { verifyOtp, reset } from '../features/auth/authSlice';

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const email = location.state?.email;

  const { user, loadingAction, isError, isSuccess, message } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
    if (isSuccess && user) {
      navigate('/notes');
    }
    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, message, navigate, dispatch, email]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpData = { email, otp };
    dispatch(verifyOtp(otpData));
  };
  
  return (
    <div className="grid h-screen w-screen place-items-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            An OTP has been sent to <strong>{email || 'your email'}</strong>. Please enter it below.
          </p>
        </div>
        
        {isError && <p className="text-red-500 text-center">{message}</p>}

        <form className="space-y-6" onSubmit={onSubmit}>
          <input
            type="text"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-Digit OTP"
            maxLength={6}
            className="w-full px-4 py-2 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loadingAction === 'verify'}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {loadingAction === 'verify' ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtpPage;