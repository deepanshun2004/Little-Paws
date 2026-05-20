import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, PawPrint } from "lucide-react";
import { useDispatch } from "react-redux";
import { resetPassword } from "@/store/auth-slice";
import { useToast } from "@/hooks/use-toast";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();

    if (!token) {
      toast({
        title: "Invalid reset link",
        description: "Please request a new reset email.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    dispatch(resetPassword({ token, password }))
      .then((data) => {
        setIsLoading(false);
        if (data?.payload?.success) {
          toast({
            title: "Password updated",
            description: data.payload.message,
          });
          navigate("/auth/login");
          return;
        }

        toast({
          title: "Unable to reset password",
          description: data?.payload?.message || "Please request a new reset link.",
          variant: "destructive",
        });
      })
      .catch(() => {
        setIsLoading(false);
        toast({
          title: "Unable to reset password",
          description: "Please request a new reset link.",
          variant: "destructive",
        });
      });
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl shadow-lg mb-4">
          <PawPrint className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
          New Password
        </h1>
        <p className="mt-2 text-slate-500">Create a fresh password for your account</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100 p-8 space-y-4">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>

        <Link to="/auth/forgot-password" className="block text-center text-sm text-rose-600 hover:text-rose-700 transition">
          Request a new link
        </Link>
      </form>
    </div>
  );
}

export default ResetPassword;
