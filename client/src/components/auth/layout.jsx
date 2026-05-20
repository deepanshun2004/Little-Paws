import { Link, Outlet } from "react-router-dom";
import { PawPrint, Heart, Shield, Sparkles, ChevronRight } from "lucide-react";

function AuthLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-amber-50 to-emerald-100 animate-gradient-xy"></div>
      
      {/* Animated Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Decorative Pattern */}
        <svg className="absolute bottom-0 left-0 w-full h-32 opacity-10" preserveAspectRatio="none" viewBox="0 0 1440 120">
          <path fill="url(#gradient)" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Creative Navbar */}
      <nav className="relative z-20 bg-gradient-to-r from-rose-600/95 via-amber-600/95 to-emerald-600/95 backdrop-blur-sm border-b border-white/20 shadow-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                <div className="relative p-2 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <PawPrint className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  LilPaws
                </span>
                <p className="text-xs text-white/70 hidden sm:block"></p>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <Link 
                to="/" 
                className="group flex items-center gap-1 text-white/90 hover:text-white transition-all duration-300 relative"
              >
                <span>Home</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-300 to-amber-300 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                to="/search" 
                className="group flex items-center gap-1 text-white/90 hover:text-white transition-all duration-300 relative"
              >
                <span>Find a Pet</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-300 to-amber-300 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                to="/aboutUs" 
                className="group flex items-center gap-1 text-white/90 hover:text-white transition-all duration-300 relative"
              >
                <span>About Us</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-300 to-amber-300 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                to="/reportStray" 
                className="group flex items-center gap-1 text-white/90 hover:text-white transition-all duration-300 relative"
              >
                <span>Report Stray</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-300 to-amber-300 group-hover:w-full transition-all duration-300"></div>
              </Link>
            </div>

            {/* Decorative Elements */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1">
                <div className="w-2 h-2 bg-rose-300 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse delay-200"></div>
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse delay-500"></div>
              </div>
              <span className="text-white/60 text-xs hidden sm:block">🐾</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-1 items-center justify-center min-h-[calc(100vh-72px)] px-4 py-12 sm:px-6 lg:px-8">
        {/* Decorative Card Frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full max-w-md">
            <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-emerald-500/20 rounded-3xl blur-xl"></div>
          </div>
        </div>

        {/* Floating Ornaments */}
        <div className="absolute top-20 right-10 hidden lg:block pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-400/20 rounded-full blur-xl animate-ping"></div>
            <Heart className="h-12 w-12 text-rose-400/40 animate-float" />
          </div>
        </div>
        <div className="absolute bottom-20 left-10 hidden lg:block pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl animate-ping delay-700"></div>
            <Shield className="h-10 w-10 text-amber-400/40 animate-float-delayed" />
          </div>
        </div>
        <div className="absolute top-1/2 right-20 hidden xl:block pointer-events-none">
          <Sparkles className="h-8 w-8 text-emerald-400/30 animate-pulse-slow" />
        </div>

        {/* Main Card Container */}
        <div className="relative w-full max-w-md">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-3xl blur-xl opacity-75 animate-pulse-slow"></div>
          
          {/* Content Card */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Decorative Top Bar */}
            <div className="h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"></div>
            
            {/* Decorative Pattern */}
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
              <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
                <path d="M50 0 L50 100 M0 50 L100 50" stroke="currentColor" strokeWidth="2"/>
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-16 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>

      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 10s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}

export default AuthLayout;