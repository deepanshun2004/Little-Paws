import Commonform from "@/components/common/form";
import { loginFormControls } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { loginUser, loginWithGoogle } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { PawPrint, Shield, Heart, Sparkles } from "lucide-react";

const initialState = {
  email: '',
  password: ''
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function navigateByRole(user) {
    const role = user?.role;
    if (role === "sellerAdmin") {
      navigate("/seller-admin");
      return;
    }
    if (role === "shelterAdmin") {
      navigate("/shelterAdmin");
      return;
    }
    navigate("/");
  }

  function onGoogleSignIn() {
    setIsGoogleLoading(true);

    dispatch(loginWithGoogle())
      .then((data) => {
        setIsGoogleLoading(false);
        if (data?.payload?.success) {
          toast({
            title: data?.payload?.message,
          });
          navigateByRole(data?.payload?.user);
          return;
        }

        const payload = data?.payload;
        let errorMessage = payload?.message || "Google sign-in failed";
        let description = "Please try again.";

        if (payload?.isDev && payload?.code) {
           description = `[DEV] Code: ${payload.code}`;
        }

        toast({
          title: errorMessage,
          description: description,
          variant: "destructive",
        });
      })
      .catch(() => {
        setIsGoogleLoading(false);
        toast({
          title: "Google sign-in failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      });
  }

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    dispatch(loginUser(formData)).then(data => {
      setIsLoading(false);
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        navigateByRole(data?.payload?.user);
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    }).catch(() => {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    });
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Logo Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl shadow-lg mb-4">
          <PawPrint className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="mt-2 text-slate-500">Sign in to continue your journey</p>
      </div>

      {/* Login Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Sign in to your account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link className="font-medium text-rose-600 hover:text-rose-700 transition" to='/auth/register'>
              Create an account
            </Link>
          </p>
        </div>

        <Commonform
          formControls={loginFormControls}
          buttonText={isLoading ? 'Signing In...' : 'Sign In'}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />

        {/* Forgot Password Link */}
        <div className="mt-4 text-right">
          <Link to="/auth/forgot-password" className="text-sm text-rose-600 hover:text-rose-700 transition">
            Forgot password?
          </Link>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white/80 text-slate-500">Or continue with</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div>
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={isGoogleLoading}
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-rose-50 hover:border-rose-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm font-medium">
              {isGoogleLoading ? "Connecting..." : "Google"}
            </span>
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2">
              <Shield className="h-5 w-5 text-rose-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Secure Login</p>
            </div>
            <div className="p-2">
              <Heart className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Pet Protection</p>
            </div>
            <div className="p-2">
              <Sparkles className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Easy Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-slate-400 text-xs">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

export default AuthLogin;
