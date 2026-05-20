
import { Route, Routes } from 'react-router-dom'
import './App.css'
import AuthLayout from './components/auth/layout'
import AuthLogin from './pages/auth/login'
import AuthRegister from './pages/auth/register'; 
import ForgotPassword from './pages/auth/forgot-password';
import ResetPassword from './pages/auth/reset-password';
import ShoppingLayout from './components/shopping-view/layout';
import ShoppingHome from './pages/shopping-view/home';
import ShoppingListing from './pages/shopping-view/listing';
import ShoppingCheckout from './pages/shopping-view/checkout';
import ShoppingAccount from './pages/shopping-view/account';
import CheckAuth from './components/common/check-auth';
import UnauthPage from './pages/unauth-page';
import Landingpage from './pages/main-home-page/landing-page';
import MainSearchPage from './pages/main-search-page/main-search-page';
import PetPage from './pages/main-pet-page/Main-pet-page';
import MainAdoptionForm from './pages/main-adoption-form/MainAdoptionForm';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, restoreFirebaseSession } from './store/auth-slice';
import { useEffect } from 'react';
import { Skeleton } from './components/ui/skeleton';
import MainAdminPanel from './pages/main-shelter-admin/mainShelterAdmin';
import MainReportStray from './pages/main-report-stray/mainReportStray';
import AboutUs from './pages/main-about-us/MainAboutUs';
import ApplicationStatus from './pages/main-application-status/ApplicationStatus';
import SellerAdminDashboard from './pages/main-seller-admin/SellerAdminDashboard';
import { useSocket } from './hooks/use-socket';

function App() {

  const {user,isAuthenticated,isLoading}=useSelector(state=>state.auth)
  
  const dispatch = useDispatch();
  useSocket(); // Initialize global socket connection

  useEffect(() => {
    dispatch(checkAuth()).then((action) => {
      if (!action.payload?.success) {
        dispatch(restoreFirebaseSession());
      }
    });
  }, [dispatch]);

  if (isLoading) return <Skeleton className="w-[800] bg-black h-[600px]" />;

  return (
    <>
    <div className="flex flex-col overflow-hidden bg-white">
    <Routes>
      <Route path='/' element={<Landingpage/>}/>
      <Route path='/search' element={<MainSearchPage/>}/>
      <Route path='/pet/:petId' element={<PetPage/>}/>
      <Route path='/aboutUs' element ={<AboutUs/>}/>
      <Route path='/form/:petId' element={
        <CheckAuth isAuthenticated={isAuthenticated} user={user} allowedRoles={["user"]}>
              <MainAdoptionForm/>
          </CheckAuth>}/>
      <Route path='/applicationStatus' element={
        <CheckAuth isAuthenticated={isAuthenticated} user={user} allowedRoles={["user"]}>
              <ApplicationStatus/>
          </CheckAuth>}/>
      
  
        
      <Route path='/reportStray' element={
        <CheckAuth isAuthenticated={isAuthenticated} user={user} allowedRoles={["user"]}>
              <MainReportStray/>
          </CheckAuth>}/>
      
      <Route path="/shelterAdmin" element={
        <CheckAuth isAuthenticated={isAuthenticated} user={user} allowedRoles={["shelterAdmin"]}>
          <MainAdminPanel/>
        </CheckAuth>
      }></Route>
      <Route path="/seller-admin" element={
        <CheckAuth isAuthenticated={isAuthenticated} user={user} allowedRoles={["sellerAdmin"]}>
          <SellerAdminDashboard/>
        </CheckAuth>
      }></Route>
    </Routes>
    
      <Routes>
      <Route
          path="/shop"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            ></CheckAuth>
          }
        />
        <Route path="/auth" element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <AuthLayout/>
          </CheckAuth>
        }>
        <Route path="login" element={<AuthLogin/>}/>
        <Route path="register" element={<AuthRegister/>}/>
        <Route path="forgot-password" element={<ForgotPassword/>}/>
        <Route path="reset-password" element={<ResetPassword/>}/>
        </Route>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>

        <Route path='/shop' element={
          <ShoppingLayout/> 
        }>
        <Route path='home' element={
          <ShoppingHome/>
        }/>
        <Route path='listing' element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
          <ShoppingListing/>
          </CheckAuth>
          }/>
        <Route path='place-order' element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <ShoppingCheckout/>
          </CheckAuth>
        }/>
        <Route path='account' element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}>
            <ShoppingAccount/>
          </CheckAuth>
        }/>
        </Route>
        <Route path="/unauth-page" element={<UnauthPage/>}/>
        {/* <Route path="*" element={<NotFound/>}/> */}
      </Routes>
    </div>
    </>
  )
}

export default App
