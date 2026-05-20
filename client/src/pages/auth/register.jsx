import Commonform from "@/components/common/form";
import { registerFormControls } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { loginWithGoogle, registerUser } from "@/store/auth-slice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  PawPrint, 
  Shield, 
  Heart, 
  Sparkles, 
  User, 
  Mail, 
  Lock, 
  MapPin,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const initialState = {
  userName: '',
  email: '',
  password: '',
  city: ''
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onGoogleSignUp() {
    setIsGoogleLoading(true);

    dispatch(loginWithGoogle())
      .then((data) => {
        setIsGoogleLoading(false);
        if (data?.payload?.success) {
          toast({
            title: data?.payload?.message,
          });
          navigate("/");
          return;
        }

        const payload = data?.payload;
        let errorMessage = payload?.message || "Google sign-up failed";
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
          title: "Google sign-up failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      });
  }

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
    setPasswordChecks(checks);
    
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
  }, [formData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-rose-500";
    if (passwordStrength <= 2) return "bg-amber-500";
    if (passwordStrength <= 3) return "bg-emerald-500";
    return "bg-teal-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    return "Strong";
  };

  function onSubmit(event) {
    event.preventDefault();
    
    // Validate password strength
    if (passwordStrength < 2) {
      toast({
        title: "Password Too Weak",
        description: "Please create a stronger password with at least 8 characters, uppercase, lowercase, and numbers.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    dispatch(registerUser(formData)).then((data) => {
      setIsLoading(false);
      if (data?.payload?.success) {
        toast({
          title: "Welcome to LilPaws! 🎉",
          description: data?.payload?.message || "Account created successfully! Please login to continue.",
        });
        navigate('/auth/login');
      } else {
        toast({
          title: "Registration Failed",
          description: data?.payload?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }).catch(() => {
      setIsLoading(false);
      toast({
        title: "Registration Failed",
        description: "Unable to create account. Please try again later.",
        variant: "destructive",
      });
    });
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Logo Section */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl shadow-lg mb-4 animate-float">
          <PawPrint className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
          Join LilPaws
        </h1>
        <p className="mt-2 text-slate-500">Create your free account and start your journey</p>
      </div>

      {/* Register Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Create new account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Already have an account?{' '}
            <Link className="font-medium text-rose-600 hover:text-rose-700 transition" to='/auth/login'>
              Sign in here
            </Link>
          </p>
        </div>

        {/* Enhanced Form Fields */}
        <div className="space-y-4">
          {/* Username Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <User className="h-5 w-5 text-rose-400" />
            </div>
            <input
              type="text"
              name="userName"
              placeholder="Username"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Mail className="h-5 w-5 text-amber-400" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Password Field with Strength Meter */}
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock className="h-5 w-5 text-emerald-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                  <span className={`ml-3 text-xs font-medium ${
                    passwordStrength <= 1 ? 'text-rose-500' :
                    passwordStrength <= 2 ? 'text-amber-500' :
                    passwordStrength <= 3 ? 'text-emerald-500' : 'text-teal-500'
                  }`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                
                {/* Password Requirements */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${passwordChecks.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordChecks.length ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordChecks.uppercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Uppercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordChecks.lowercase ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.number ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {passwordChecks.number ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    <span>Number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* City Field */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="h-5 w-5 text-rose-400" />
            </div>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              required
            />
            <label htmlFor="terms" className="text-sm text-slate-600">
              I agree to the{' '}
              <a href="#" className="text-rose-600 hover:text-rose-700 underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-rose-600 hover:text-rose-700 underline">Privacy Policy</a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Create Account</span>
                <Sparkles className="h-4 w-4" />
              </div>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white/80 text-slate-500">Or sign up with</span>
          </div>
        </div>

        {/* Social Sign Up Buttons */}
        <div>
          <button
            type="button"
            onClick={onGoogleSignUp}
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
              <p className="text-xs text-slate-500">Secure Registration</p>
            </div>
            <div className="p-2">
              <Heart className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Pet Protection</p>
            </div>
            <div className="p-2">
              <Sparkles className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-slate-500">Easy Process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-slate-400 text-xs">
        Join thousands of happy pet parents and shelters
      </p>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default AuthRegister;
