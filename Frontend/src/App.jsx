import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import components
import Navbar from './Components/Navbar/Navbar';
import Home from './Components/Pages/Home/Home';
import Login from './Components/Auth/Login/Login';
import Register from './Components/Auth/Register/Register';
import ForgotPassword from './Components/Auth/ForgotPassword/ForgotPassword';
import ResetPassword from './Components/Auth/ResetPassword/ResetPassword';
import OAuthCallback from './Components/Auth/OAuthCallback';
import Menu from './Components/Pages/Menu/Menu';
import Cart from './Components/Pages/Cart/Cart';
import OrderHistory from './Components/Pages/OrderHistory/OrderHistory';
import QRVerification from './Components/Pages/QRVerification/QRVerification';
import StaffQRScanner from './Components/Pages/StaffQRScanner/StaffQRScanner';
import AdminLogin from './Components/Admin/AdminLogin/AdminLogin';
import AdminDashboard from './Components/Admin/AdminDashboard/AdminDashboard';
import SuperAdminDashboard from './Components/SuperAdmin/SuperAdminDashboard/SuperAdminDashboard';
import SellersManagement from './Components/SuperAdmin/SellersManagement/SellersManagement';
import CreateSeller from './Components/SuperAdmin/CreateSeller/CreateSeller';

// Context for user authentication
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/verify" element={<QRVerification />} />
                <Route path="/staff/scanner" element={<StaffQRScanner />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/super-admin" element={<SuperAdminDashboard />} />
                <Route path="/super-admin/sellers" element={<SellersManagement />} />
                <Route path="/super-admin/create-seller" element={<CreateSeller />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
