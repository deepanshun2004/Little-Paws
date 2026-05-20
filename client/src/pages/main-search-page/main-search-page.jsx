import { useEffect, useMemo, useState } from "react";
import { 
  ChevronDown, 
  FishOff, 
  MapPin, 
  PawPrint, 
  Search, 
  Filter,
  Heart,
  Star,
  TrendingUp,
  X,
  Sliders,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Sparkles,
  Clock,
  Award,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Globe
} from "lucide-react";
import PetCard from "@/components/main-search/PetCard";
import MainNavbar from "@/components/main-navbar/MainNavbar";
import { Link } from "react-router-dom";

import { apiUrl } from "@/lib/api";
const breedOptionsByAnimal = {
  Dog: ["Golden Retriever", "Labrador Retriever", "German Shepherd", "French Bulldog", "Boxer", "Beagle", "Poodle", "Rottweiler"],
  Cat: ["Persian", "Siamese", "Maine Coon", "Ragdoll", "Bengal", "Sphynx", "British Shorthair", "Scottish Fold"],
  Bird: ["Parrot", "Cockatiel", "Macaw", "African Grey", "Canary", "Finch", "Budgerigar", "Lovebird"],
  Hamster: ["Syrian", "Dwarf", "Roborovski", "Chinese"],
  Rabbit: ["Holland Lop", "Mini Rex", "Lionhead", "Netherland Dwarf", "Flemish Giant", "Angora"],
};

const animalIcons = {
  Dog: Dog,
  Cat: Cat,
  Bird: Bird,
  Hamster: Heart,
  Rabbit: Rabbit,
  All: PawPrint
};

function MainSearchPage() {
  const [pets, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breed, setBreed] = useState("Any");
  const [city, setCity] = useState("All");
  const [filteredPets, setFilteredPets] = useState([]);
  const [animal, setAnimal] = useState("All");
  const [age, setAge] = useState("Any");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isAnimating, setIsAnimating] = useState(false);

  const animals = ["All", "Dog", "Cat", "Bird", "Hamster", "Rabbit"];
  const cities = ["All", "Chandigarh", "Mohali", "Panchkula", "Zirakpur", "Kharar"];
  const ageRanges = ["Any", "Baby (0-1)", "Young (1-3)", "Adult (3-7)", "Senior (7+)"];

  const activeBreedOptions = useMemo(() => {
    if (animal === "All") {
      return [];
    }
    return breedOptionsByAnimal[animal] || [];
  }, [animal]);

  useEffect(() => {
    if (!pets) return;

    let filtered = [...pets];

    if (animal !== "All") {
      filtered = filtered.filter((pet) => pet.type === animal);
    }

    if (breed !== "Any") {
      filtered = filtered.filter((pet) => pet.breed === breed);
    }

    if (city !== "All") {
      filtered = filtered.filter((pet) => pet.region === city);
    }

    if (age !== "Any") {
      if (age === "Baby (0-1)") {
        filtered = filtered.filter((pet) => pet.age >= 0 && pet.age <= 1);
      } else if (age === "Young (1-3)") {
        filtered = filtered.filter((pet) => pet.age > 1 && pet.age <= 3);
      } else if (age === "Adult (3-7)") {
        filtered = filtered.filter((pet) => pet.age > 3 && pet.age <= 7);
      } else if (age === "Senior (7+)") {
        filtered = filtered.filter((pet) => pet.age > 7);
      }
    }

    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "age_asc") {
      filtered.sort((a, b) => a.age - b.age);
    } else if (sortBy === "age_desc") {
      filtered.sort((a, b) => b.age - a.age);
    }

    setFilteredPets(filtered);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, [pets, breed, city, age, animal, sortBy]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(apiUrl("/api/pets/"));
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const allPets = await response.json();
        const shuffledPets = allPets.sort(() => 0.5 - Math.random());
        setPet(shuffledPets);
        setFilteredPets(shuffledPets);
      } catch (fetchError) {
        setError(fetchError);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const resetFilters = () => {
    setAnimal("All");
    setBreed("Any");
    setCity("All");
    setAge("Any");
    setSortBy("newest");
  };

  const hasActiveFilters = animal !== "All" || breed !== "Any" || city !== "All" || age !== "Any";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <MainNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Finding your perfect companion...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <MainNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-10 w-10 text-red-600" />
            </div>
            <p className="text-slate-800 text-lg mb-2">Unable to load pets</p>
            <p className="text-slate-500">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <MainNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1920&h=400&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/50 to-indigo-900"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Find Your Perfect Match</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              Discover Your New
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                Best Friend
              </span>
            </h1>
            <p className="mt-4 text-lg text-indigo-100 max-w-2xl">
              Browse through our collection of wonderful pets waiting for their forever home. 
              Use our smart filters to find the perfect companion that matches your lifestyle.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Filters Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="flex-1 flex flex-wrap gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm text-slate-600 hover:bg-slate-50 transition"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
            {animal !== "All" && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {animal}
                <button onClick={() => setAnimal("All")} className="hover:text-indigo-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {breed !== "Any" && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {breed}
                <button onClick={() => setBreed("Any")} className="hover:text-indigo-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {city !== "All" && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {city}
                <button onClick={() => setCity("All")} className="hover:text-indigo-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {age !== "Any" && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {age}
                <button onClick={() => setAge("Any")} className="hover:text-indigo-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-slate-700"
          >
            <Sliders className="h-4 w-4" />
            Filters
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Sidebar Filters - Desktop */}
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} fixed lg:relative inset-0 z-50 lg:z-auto bg-white lg:bg-transparent p-6 lg:p-0 overflow-y-auto lg:overflow-visible`}>
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                      <Filter className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Filters</h2>
                      <p className="text-xs text-slate-500">Refine your search</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Animal Type Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Animal Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {animals.map((animalOption) => {
                      const Icon = animalIcons[animalOption] || PawPrint;
                      const isActive = animal === animalOption;
                      return (
                        <button
                          key={animalOption}
                          onClick={() => {
                            setAnimal(animalOption);
                            setBreed("Any");
                          }}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{animalOption}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Breed Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Breed
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      onChange={(e) => setBreed(e.target.value)}
                      value={breed}
                      disabled={animal === "All"}
                    >
                      <option value="Any">Any Breed</option>
                      {activeBreedOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {animal === "All" && (
                    <p className="text-xs text-amber-600 mt-2">Select an animal type first</p>
                  )}
                </div>

                {/* City Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      onChange={(e) => setCity(e.target.value)}
                      value={city}
                    >
                      {cities.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Age Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Age Group
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                      onChange={(e) => setAge(e.target.value)}
                      value={age}
                    >
                      {ageRanges.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Stats Card */}
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Current Match</span>
                  </div>
                  <p className="text-3xl font-bold text-indigo-900">{filteredPets.length}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {filteredPets.length === 1 ? 'pet available' : 'pets available'} with current filters
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Search className="h-5 w-5 text-indigo-600" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                    Search Results
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {filteredPets.length} {filteredPets.length === 1 ? 'Pet' : 'Pets'} Ready for Adoption
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {hasActiveFilters ? 'Filtered results based on your preferences' : 'Showing all available pets'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="age_asc">Youngest First</option>
                  <option value="age_desc">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Pet Grid */}
            <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
              {filteredPets.length > 0 ? (
                filteredPets.map((pet) => (
                  <div key={pet._id} className="animate-fadeInUp">
                    <PetCard pet={pet} />
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <div className="inline-flex p-4 bg-amber-100 rounded-full mb-4">
                      <FishOff className="h-12 w-12 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Pets Found</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      We couldn't find any pets matching your current filters. Try adjusting your search criteria or clearing some filters to see more options.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      <Filter className="h-4 w-4" />
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Load More (Optional) */}
            {filteredPets.length > 9 && (
              <div className="text-center pt-6">
                <button className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition">
                  Load More Pets
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <PawPrint className="h-8 w-8 text-indigo-400" />
                <span className="text-xl font-bold text-white">LilPaws</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connecting loving homes with wonderful pets. Every adoption creates a happy ending for a deserving animal.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 transition-colors">
                  <Facebook className="h-4 w-4 text-slate-400 hover:text-white" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 transition-colors">
                  <Twitter className="h-4 w-4 text-slate-400 hover:text-white" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 transition-colors">
                  <Instagram className="h-4 w-4 text-slate-400 hover:text-white" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 transition-colors">
                  <Linkedin className="h-4 w-4 text-slate-400 hover:text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-slate-400 hover:text-indigo-400 text-sm transition">Home</Link></li>
                <li><Link to="/search" className="text-slate-400 hover:text-indigo-400 text-sm transition">Find a Pet</Link></li>
                <li><Link to="/aboutUs" className="text-slate-400 hover:text-indigo-400 text-sm transition">About Us</Link></li>
                <li><Link to="/shop/home" className="text-slate-400 hover:text-indigo-400 text-sm transition">Pet Store</Link></li>
                <li><Link to="/reportStray" className="text-slate-400 hover:text-indigo-400 text-sm transition">Report Stray</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition">FAQ</a></li>
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition">Contact Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-indigo-400 text-sm transition">Adoption Guide</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">Get in Touch</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-400 text-sm">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>info@lilpaws.com</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>+91 123 456 7890</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>Chandigarh, India</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400 text-sm">
                  <Globe className="h-4 w-4 flex-shrink-0" />
                  <span>www.lilpaws.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-slate-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold">Stay Updated</h3>
                <p className="text-slate-400 text-sm mt-1">Get the latest pet adoption news and tips</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} LilPaws. All rights reserved. Made with <Heart className="inline h-3 w-3 text-red-500" /> for every pet.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default MainSearchPage;