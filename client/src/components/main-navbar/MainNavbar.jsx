import { LogOut, UserCog, PawPrint } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutUser } from "@/store/auth-slice";

const MainNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isShelterAdmin = user?.role === "shelterAdmin";
  const isSellerAdmin = user?.role === "sellerAdmin";

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <nav className="bg-slate-950 p-4 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold group">
          <div className="p-1.5 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all">
            <PawPrint className="h-6 w-6" />
          </div>
          <span className="bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
            Little Paws
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
          {!isShelterAdmin && !isSellerAdmin ? (
            <>
              <Link to="/" className="transition-all hover:text-amber-300 relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/search" className="transition-all hover:text-amber-300 relative group">
                Pets
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/shop/home" className="transition-all hover:text-amber-300 relative group">
                Ecommerce
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/reportStray" className="transition-all hover:text-amber-300 relative group">
                Report Stray
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/aboutUs" className="transition-all hover:text-amber-300 relative group">
                About Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </>
          ) : null}
          {isShelterAdmin ? (
            <Link to="/shelterAdmin" className="transition-all hover:text-amber-300 relative group">
              Shelter Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ) : null}
          {isSellerAdmin ? (
            <Link to="/seller-admin" className="transition-all hover:text-amber-300 relative group">
              Seller Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ) : null}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="outline-none">
                  <Avatar className="ring-2 ring-white/30 hover:ring-amber-400 transition-all">
                    <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold">
                      {user?.userName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-56 border-rose-100">
                <DropdownMenuLabel className="text-rose-700">
                  Logged in as <span className="font-bold">{user?.userName}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isShelterAdmin && !isSellerAdmin ? (
                  <DropdownMenuItem onClick={() => navigate("/applicationStatus")} className="cursor-pointer hover:bg-rose-50">
                    <UserCog className="mr-2 h-4 w-4 text-rose-600" />
                    Application Status
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-rose-50 text-rose-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-3">
              <Link 
                to="/auth/login" 
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105"
              >
                Login
              </Link>
              <Link 
                to="/auth/register" 
                className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-medium hover:shadow-lg transition-all hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;