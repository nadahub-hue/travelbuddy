import * as Reactstrap from "reactstrap"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { Provider } from "react-redux"
import './App.css';

import Header from "./components/Header"
import Footer from "./components/Footer"
import Welcome from "./components/Welcome"
import UserType from "./components/UserType"
import Register from "./components/Register"
import Login from "./components/Login"
import DriverRegister from "./components/Driver/DriverRegister"
import DriverLogin from "./components/Driver/DriverLogin"
import ForgotPw from "./components/ForgotPw"
import AboutUs from "./components/AboutUs"
import SearchTrips from "./components/SearchTrips"
import Chat from "./components/Chat"
import PaymentMethod from "./components/PaymentMethod"
import CardPayment from "./components/CardPayment"
import Feedback from "./components/Feedback"
import Home from "./components/Home"
import travelBuddyStore from "./store/travelBuddyStore"
import AdminLogin from "./components/Admin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Booking from "./components/Booking"
import ConformBooking from "./components/ConformBooking"
import ResetPassword from "./components/ResetPassword"


function AppContent() {
  const location = useLocation()

  const hideHeaderOnThisPage = location.pathname === "/home"

  return (
    <Reactstrap.Container fluid>
      {!hideHeaderOnThisPage && (
        <Reactstrap.Row>
          <Header />
        </Reactstrap.Row>
      )}

      <Reactstrap.Row className="p-3">
        <Routes>
          <Route path="/" element={<Welcome />} />

          <Route path="/user-type" element={<UserType />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotPassword" element={<ForgotPw />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />


          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/driver-register" element={<DriverRegister />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/about" element={<AboutUs />} />
          <Route path="/search" element={<SearchTrips />} />

          <Route path="/chat" element={<Chat />} />

          <Route path="/booking" element={<Booking />} />

          <Route path="/conform-booking" element={<ConformBooking />} />

          <Route path="/payment-method" element={<PaymentMethod />} />
          <Route path="/card-payment" element={<CardPayment />} />

          <Route path="/feedback" element={<Feedback />} />
          <Route path="/reset-password" element={<ResetPassword />} />


        </Routes>
      </Reactstrap.Row>

      <Reactstrap.Row>
        <Footer />
      </Reactstrap.Row>
    </Reactstrap.Container>
  )
}

function App() {
  return (
    <Provider store={travelBuddyStore}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  )
}

export default App
