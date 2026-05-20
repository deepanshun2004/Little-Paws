import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  UserCog, 
  LogOut, 
  HandHelping, 
  CheckCircle2, 
  Share2,
  PawPrint,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Award,
  Sparkles,
  Home,
  Calendar,
  MessageCircle,
  Gift,
  Camera,
  Globe,
  ChevronLeft,
  TreeDeciduous,
  Cloud,
  Sun,
  Flower2
} from 'lucide-react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '@/store/auth-slice';
import PetCard from '@/components/main-search/PetCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { apiUrl } from "@/lib/api";
const Landingpage = () => {
  const [pets, setPet] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('mission');
  const [isScrolled, setIsScrolled] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdminUser = user?.role === 'shelterAdmin';

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Ludhiana",
      text: "Adopting Max was the best decision ever! The team at LilPaws made the process so smooth and caring. He's brought so much joy to our family.",
      image: "https://t4.ftcdn.net/jpg/05/70/57/47/360_F_570574724_HWfki1q3XZt9WzVlCcQujOV5Jxe8UBG1.jpg",
      pet: "Max - Golden Retriever",
      bgGradient: "from-amber-50 to-orange-50"
    },
    {
      name: "Rahul Mehta",
      location: "Delhi",
      text: "Found my perfect companion Bella through LilPaws. The adoption counselors were incredibly helpful in matching us with the right pet for our lifestyle.",
      image: "https://t4.ftcdn.net/jpg/06/13/28/69/360_F_613286945_BJ7rUxmhftMxfNtyyfnwDwuD2CxK8YQM.jpg",
      pet: "Bella - Labrador",
      bgGradient: "from-emerald-50 to-teal-50"
    },
    {
      name: "Anjali Nair",
      location: "Chandigarh",
      text: "I'm so grateful for LilPaws! Their commitment to animal welfare is outstanding. Our cat Luna has transformed our home into a happy place.",
      image: "https://img.freepik.com/premium-photo/indian-girl-cheerful-studio-portrait_53876-55599.jpg?semt=ais_hybrid&w=740&q=80",
      pet: "Luna - Persian Cat",
      bgGradient: "from-rose-50 to-pink-50"
    }
  ];

  const successStories = [
    {
      title: "From Street to Family",
      description: "Tommy was found wandering the streets, hungry and scared. After 3 months at our shelter, he found his forever home with the Singh family. Now he enjoys daily walks and endless cuddles.",
      icon: Home,
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop",
      color: "from-amber-500 to-orange-500"
    },
    {
      title: "Special Needs Success",
      description: "Lily, a three-legged cat, was overlooked for months. But when the Mehta family met her, they instantly fell in love. She now rules her new kingdom with confidence and joy.",
      icon: Heart,
      image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",
      color: "from-rose-500 to-pink-500"
    },
    {
      title: "Senior Pet Adoption",
      description: "12-year-old Bruno was surrendered by his previous owners. The Kapoor family gave him a chance, and now he spends his golden years surrounded by love and comfort.",
      icon: Clock,
      image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=300&fit=crop",
      color: "from-emerald-500 to-teal-500"
    }
  ];

  const stats = [
    { number: "500+", label: "Happy Adoptions", icon: Heart, color: "from-rose-400 to-pink-500", bgColor: "bg-rose-50" },
    { number: "50+", label: "Rescued Monthly", icon: PawPrint, color: "from-emerald-400 to-teal-500", bgColor: "bg-emerald-50" },
    { number: "20+", label: "Partner Shelters", icon: Users, color: "from-blue-400 to-cyan-500", bgColor: "bg-blue-50" },
    { number: "100%", label: "Commitment to Care", icon: Shield, color: "from-purple-400 to-indigo-500", bgColor: "bg-purple-50" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl("/api/pets/"));
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const fetchedPets = await response.json();
        const shuffledPets = fetchedPets.sort(() => 0.5 - Math.random()).slice(0, 6);
        setPet(shuffledPets);
      } catch (fetchError) {
        setError(fetchError.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user?.role === 'shelterAdmin') {
      navigate('/shelterAdmin');
    }
  }, [navigate, user?.role]);

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(logoutUser());
      if (logoutUser.fulfilled.match(resultAction)) {
        alert(resultAction.payload?.message || "Logged out successfully!");
        navigate('/');
      } else {
        alert("An error occurred during logout. Please try again.");
      }
    } catch (logoutError) {
      console.error('Error logging out:', logoutError);
      alert('An error occurred. Please try again.');
    }
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!pets) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-amber-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading wonderful pets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50 overflow-x-hidden">
      {/* Soothing Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-40 right-40 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-r from-rose-500 to-amber-500 rounded-xl group-hover:scale-110 transition-transform">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">Little Paws</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              {!isAdminUser && (
                <>
                  {['Home', 'Pets', 'Ecommerce', 'Report Stray', 'About Us'].map((item, idx) => {
                    const paths = ['/', '/search', '/shop/home', '/reportStray', '/aboutUs'];
                    return (
                      <Link 
                        key={item}
                        to={paths[idx]} 
                        className="text-slate-600 hover:text-rose-500 transition-colors relative group text-sm font-medium"
                      >
                        {item}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-rose-400 to-amber-400 group-hover:w-full transition-all duration-300"></span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                isAdminUser ? (
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2 text-white hover:shadow-lg transition-all duration-300 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer ring-2 ring-rose-400 hover:ring-amber-400 transition-all">
                        <AvatarFallback className="bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold">
                          {user?.userName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-sm border-rose-100">
                      <DropdownMenuLabel className="text-rose-700">
                        Logged in as <span className="font-bold">{user?.userName}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/applicationStatus')} className="cursor-pointer hover:bg-rose-50">
                        <UserCog className="mr-2 h-4 w-4 text-rose-500" />
                        Application Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/shop/account')} className="cursor-pointer hover:bg-rose-50">
                        <Heart className="mr-2 h-4 w-4 text-rose-500" />
                        My Account
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50 text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/auth/login"
                    className="px-5 py-2 text-slate-600 hover:text-rose-500 transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full text-white text-sm font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-6 shadow-sm">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-slate-600">Join 500+ Happy Families</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight">
                Find Your
                <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent"> Perfect Companion</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Every pet deserves a loving home. Join us in our mission to connect wonderful animals with caring families. 
                Your new best friend is waiting for you!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/search">
                  <button className="group relative px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full text-white font-semibold overflow-hidden transition-all hover:shadow-xl hover:scale-105">
                    <span className="relative z-10">Find Your Pet</span>
                    <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/aboutUs">
                  <button className="px-8 py-3 border-2 border-rose-300 rounded-full text-rose-600 font-semibold hover:bg-rose-50 transition-all">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-200/40 to-amber-200/40 rounded-full blur-3xl"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop"
                    alt="Happy dog"
                    className="rounded-2xl shadow-2xl object-cover w-full h-48 hover:scale-105 transition-transform duration-300"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop"
                    alt="Happy cat"
                    className="rounded-2xl shadow-2xl object-cover w-full h-48 hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="pt-12">
                  <img
                    src="https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=500&fit=crop"
                    alt="Pets playing"
                    className="rounded-2xl shadow-2xl object-cover w-full h-64 hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
              <div className={`inline-flex p-3 bg-gradient-to-r ${stat.color} rounded-xl mb-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-800">{stat.number}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">How We Help</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Making pet adoption simple, transparent, and heartwarming</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Link to="/search">
            <div className="group relative bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-rose-100">
              <div className="mb-4 inline-flex p-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl group-hover:scale-110 transition-transform">
                <Heart className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Adopt a Pet</h3>
              <p className="text-slate-500">Find your perfect furry friend waiting for a loving home</p>
            </div>
          </Link>
          <Link to="/reportStray">
            <div className="group relative bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100">
              <div className="mb-4 inline-flex p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl group-hover:scale-110 transition-transform">
                <Camera className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Report Stray</h3>
              <p className="text-slate-500">Help us rescue animals in need in your neighborhood</p>
            </div>
          </Link>
          <Link to="/shop/home">
            <div className="group relative bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-emerald-100">
              <div className="mb-4 inline-flex p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl group-hover:scale-110 transition-transform">
                <Gift className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Pet Essentials</h3>
              <p className="text-slate-500">Shop quality products for your beloved companion</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Pets Showcase */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-4 shadow-sm">
            <PawPrint className="h-4 w-4 text-rose-500" />
            <span className="text-sm text-slate-600">Meet Our Friends</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Who are waiting for You?</h2>
          <p className="text-xl text-slate-500">Meet some of our adorable pets looking for their forever home</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pets.map((pet, index) => (
            <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <PetCard pet={pet} />
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/search">
            <button className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full text-white hover:shadow-lg transition-all font-medium">
              View All Pets
              <ChevronRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Success Stories with Images */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-4 shadow-sm">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-slate-600">Happy Endings</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Success Stories</h2>
          <p className="text-lg text-slate-500">Heartwarming tales of pets finding their forever homes</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <div key={index} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${story.color} opacity-60`}></div>
                <div className="absolute bottom-3 left-3">
                  <div className="inline-flex p-2 bg-white/90 backdrop-blur-sm rounded-lg">
                    <story.icon className={`h-5 w-5 bg-gradient-to-r ${story.color} bg-clip-text text-transparent`} />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{story.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{story.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className={`bg-gradient-to-r ${testimonials[testimonialIndex].bgGradient} rounded-3xl p-8 md:p-12 shadow-xl`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Happy Pet Parents</h2>
            <p className="text-slate-500">Real stories from families who found their perfect match</p>
          </div>
          
          <div className="relative">
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 md:-translate-x-8 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition"
            >
              <ChevronLeft className="h-5 w-5 text-rose-500" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 md:translate-x-8 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition"
            >
              <ChevronRight className="h-5 w-5 text-rose-500" />
            </button>
            
            <div className="text-center px-8">
              <img
                src={testimonials[testimonialIndex].image}
                alt={testimonials[testimonialIndex].name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
              />
              <p className="text-slate-700 text-lg italic mb-4">"{testimonials[testimonialIndex].text}"</p>
              <p className="text-slate-800 font-semibold text-lg">{testimonials[testimonialIndex].name}</p>
              <p className="text-slate-500 text-sm">{testimonials[testimonialIndex].location}</p>
              <p className="text-rose-500 text-sm mt-2 font-medium">Adopted {testimonials[testimonialIndex].pet}</p>
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === testimonialIndex ? "w-8 bg-rose-500" : "w-2 bg-rose-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-32">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['mission', 'values', 'approach'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeSection === section
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                    : 'bg-white text-slate-600 hover:bg-rose-50'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {activeSection === 'mission' && (
            <div className="text-center">
              <HandHelping className="mx-auto mb-6 text-rose-500" size={64} />
              <h3 className="text-3xl font-bold text-slate-800 mb-6">Our Mission</h3>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                To rescue, rehabilitate, and rehome stray and abandoned animals, ensuring they receive the love and care they deserve. 
                We simplify the adoption process while promoting responsible pet ownership.
              </p>
            </div>
          )}

          {activeSection === 'values' && (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-6 text-emerald-500" size={64} />
              <h3 className="text-3xl font-bold text-slate-800 mb-6">Our Core Values</h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl">
                  <Shield className="h-6 w-6 text-rose-500" />
                  <span className="text-slate-700">Compassion for all living beings</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                  <Heart className="h-6 w-6 text-amber-500" />
                  <span className="text-slate-700">Commitment to animal welfare</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                  <Star className="h-6 w-6 text-emerald-500" />
                  <span className="text-slate-700">Transparency in our operations</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                  <Users className="h-6 w-6 text-purple-500" />
                  <span className="text-slate-700">Community engagement and education</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'approach' && (
            <div className="text-center">
              <Share2 className="mx-auto mb-6 text-blue-500" size={64} />
              <h3 className="text-3xl font-bold text-slate-800 mb-6">Our Approach</h3>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                We collaborate with shelters, foster homes, and animal welfare organizations to find the perfect match between 
                pets and adopters. Our comprehensive support ensures successful, lifelong connections.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-32 mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Make a Difference Today</h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Whether you adopt, help rescue, or support daily care, your action creates lasting change in an animal's life.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/search">
                <button className="px-8 py-3 bg-white text-rose-600 rounded-full font-semibold hover:shadow-xl transform hover:scale-105 transition-all">
                  Adopt Now
                </button>
              </Link>
              <Link to="/shop/home">
                <button className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all">
                  Visit Store
                </button>
              </Link>
              <Link to="/reportStray">
                <button className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all">
                  Report Stray
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PawPrint className="h-8 w-8 text-rose-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">Little Paws</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Giving every pet a loving home they deserve. Join us in making a difference, one adoption at a time.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="p-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                  <Facebook className="h-4 w-4 text-rose-500" />
                </a>
                <a href="#" className="p-2 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                  <Twitter className="h-4 w-4 text-amber-500" />
                </a>
                <a href="#" className="p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                  <Instagram className="h-4 w-4 text-emerald-500" />
                </a>
                <a href="#" className="p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Linkedin className="h-4 w-4 text-purple-500" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-slate-800 font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-slate-500 hover:text-rose-500 text-sm transition">Home</Link></li>
                <li><Link to="/search" className="text-slate-500 hover:text-rose-500 text-sm transition">Find a Pet</Link></li>
                <li><Link to="/aboutUs" className="text-slate-500 hover:text-rose-500 text-sm transition">About Us</Link></li>
                <li><Link to="/shop/home" className="text-slate-500 hover:text-rose-500 text-sm transition">Pet Store</Link></li>
                <li><Link to="/reportStray" className="text-slate-500 hover:text-rose-500 text-sm transition">Report Stray</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-800 font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-500 hover:text-rose-500 text-sm transition">FAQ</a></li>
                <li><a href="#" className="text-slate-500 hover:text-rose-500 text-sm transition">Adoption Guide</a></li>
                <li><a href="#" className="text-slate-500 hover:text-rose-500 text-sm transition">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-500 hover:text-rose-500 text-sm transition">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-800 font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-500 text-sm">
                  <Mail className="h-4 w-4 text-rose-400" />
                  <span>info@lilpaws.com</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500 text-sm">
                  <Phone className="h-4 w-4 text-amber-400" />
                  <span>+91 123 456 7890</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>Chandigarh, India</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © 2026 Little Paws. All Rights Reserved. Made with <Heart className="inline h-3 w-3 text-rose-500" /> for every pet.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Landingpage;