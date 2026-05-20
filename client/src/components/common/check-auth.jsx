import { Navigate, useLocation } from "react-router-dom";

const dashboardByRole = {
  sellerAdmin: "/seller-admin",
  shelterAdmin: "/shelterAdmin",
  user: "/",
};

function CheckAuth({ isAuthenticated, user, children, allowedRoles }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname.includes("/login") ||
    location.pathname.includes("/register") ||
    location.pathname.includes("/forgot-password") ||
    location.pathname.includes("/reset-password");

  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/auth/login" />;
  }

  if (isAuthenticated && isAuthPage) {
    return <Navigate to={dashboardByRole[user?.role] || "/"} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauth-page" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
