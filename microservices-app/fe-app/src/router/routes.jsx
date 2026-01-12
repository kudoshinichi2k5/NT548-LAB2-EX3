import { Routes, Route } from 'react-router-dom';
import Login from '../pages/login/login';
import Signup from '../pages/signup/signup';
import Home from '../pages/home/home';
import FoodPage from '../pages/food/food';
import AddFoodPage from '../pages/add_food/add_food';
import VerifyOtp from '../pages/verify-otp/verify_otp';
import ForgotPassword from '../pages/forgot-password/forgot-password';
import ResetPassword from '../pages/reset-password/reset-password';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/recipe/:id" element={<FoodPage />} />
      <Route path="/add_food" element={<AddFoodPage />} />
      <Route path="/verify_otp" element={<VerifyOtp />} />
      <Route path="/forgot_password" element={<ForgotPassword />} />
      <Route path="/reset_password" element={<ResetPassword />} />
      
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;
