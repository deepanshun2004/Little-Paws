import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, PawPrint } from "lucide-react";
import { useDispatch } from "react-redux";
import { requestPasswordReset } from "@/store/auth-slice";
import { useToast } from "@/hooks/use-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    dispatch(requestPasswordReset(email))
      .then((data) => {
        setIsLoading(false);
        if (data?.payload?.success) {
          toast({
            title: "Check your email",
            description: data.payload.message,
          });
          return;
        }

        toast({
          title: "Unable to send reset email",
          description: data?.payload?.message || "Please try again later.",
          variant: "destructive",
        });
      })
      .catch(() => {
        setIsLoading(false);
        toast({
          title: "Unable to send reset email",
          description: "Please try again later.",
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
          Reset Password
        </h1>
        <p className="mt-2 text-slate-500">Enter your email to receive a secure reset link</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100 p-8 space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-400" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>

        <Link to="/auth/login" className="block text-center text-sm text-rose-600 hover:text-rose-700 transition">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}

export default ForgotPassword;
