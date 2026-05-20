import { ArrowLeft, LogOut, Menu, ShoppingCart, Store, UserCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import { useEffect, useState } from "react";
import UserCartWrapper from "./cart-wrapper";
import { fetchCartItems } from "@/store/shop/cart-slice";

function HeaderRightContent({ isMobile = false, onNavigate }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartCount = cartItems?.items?.length || 0;

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate("/");
    onNavigate?.();
  }

  function handleCartOpen() {
    if (!isAuthenticated) {
      navigate("/auth/login");
      onNavigate?.();
      return;
    }

    setOpenCartSheet(true);
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className={`flex ${isMobile ? "flex-col items-start" : "items-center"} gap-4`}>
      <Sheet
        open={openCartSheet}
        onOpenChange={(value) => {
          setOpenCartSheet(value);
          if (!value) {
            onNavigate?.();
          }
        }}
      >
        <Button
          onClick={handleCartOpen}
          variant="outline"
          size="icon"
          className="relative border-slate-300"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 ? (
            <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-xs font-semibold text-white">
              {cartCount}
            </span>
          ) : null}
          <span className="sr-only">User cart</span>
        </Button>
        <UserCartWrapper
          setOpenCartSheet={setOpenCartSheet}
          cartItems={cartItems?.items?.length ? cartItems.items : []}
        />
      </Sheet>

      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="outline-none">
              <Avatar className="bg-slate-900">
                <AvatarFallback className="bg-slate-900 text-white font-extrabold">
                  {user?.userName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56">
            <DropdownMenuLabel>Logged in as {user?.userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigate("/shop/account");
                onNavigate?.();
              }}
            >
              <UserCog className="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className={`flex ${isMobile ? "flex-col items-start" : "items-center"} gap-3`}>
          <Link className="text-sm font-medium text-slate-700 hover:text-slate-950" to="/auth/login">
            Login
          </Link>
          <Link className="text-sm font-medium text-slate-700 hover:text-slate-950" to="/auth/register">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}

function ShoppingHeader() {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Main Site
          </Link>
          <Link to="/shop/home" className="inline-flex items-center gap-2 text-xl font-bold text-slate-950">
            <Store className="h-5 w-5" />
            Little Paws Shop
          </Link>
        </div>

        <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs space-y-6">
            <HeaderRightContent isMobile onNavigate={() => setOpenMobileMenu(false)} />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
