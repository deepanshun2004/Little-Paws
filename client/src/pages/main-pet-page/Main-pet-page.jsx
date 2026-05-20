import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sparkles,
  Heart,
  Bookmark,
  Calendar,
  Activity,
  CheckCircle,
  Home,
  Clock,
  Award,
  Users,
  Star
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import PetCard from "@/components/main-search/PetCard";
import MainNavbar from "@/components/main-navbar/MainNavbar";
import { getImageSrc } from "@/lib/image";
import { useSelector } from "react-redux";

import { apiUrl } from "@/lib/api";
function PetPage() {
  const { petId } = useParams();
  const [petInfo, setPetInfo] = useState(null);
  const [relatedPets, setRelatedPets] = useState([]);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    async function fetchPetData() {
      setIsLoading(true);
      try {
        const response = await axios.get(apiUrl(`/api/pets/${petId}`));
        setPetInfo(response.data);
      } catch (fetchError) {
        console.error("Error fetching pet data:", fetchError);
        setError("Unable to load pet details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPetData();
  }, [petId]);

  useEffect(() => {
    async function fetchRelatedPets() {
      try {
        const response = await fetch(apiUrl("/api/pets/"));
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const allPets = await response.json();
        const filtered = allPets
          .filter((pet) => pet._id !== petId && pet.category === petInfo?.category)
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);

        setRelatedPets(filtered);
      } catch (fetchError) {
        console.error("Error fetching related pets:", fetchError);
      }
    }

    if (petInfo) {
      fetchRelatedPets();
    }
  }, [petId, petInfo]);

  const petFacts = useMemo(() => {
    if (!petInfo) {
      return [];
    }

    return [
      { label: "Type", value: petInfo.type || petInfo.category || "Pet", icon: PawPrint, color: "from-purple-500 to-pink-500" },
      { label: "Breed", value: petInfo.breed || "Mixed", icon: Sparkles, color: "from-blue-500 to-cyan-500" },
      { label: "Age", value: `${petInfo.age} years`, icon: Calendar, color: "from-emerald-500 to-teal-500" },
      { label: "Health", value: petInfo.healthStatus || "Healthy", icon: Activity, color: "from-orange-500 to-red-500" },
      { label: "Location", value: petInfo.region || petInfo.city || "Local Shelter", icon: MapPin, color: "from-indigo-500 to-purple-500" },
      { label: "Gender", value: petInfo.gender || "Not specified", icon: Users, color: "from-rose-500 to-pink-500" },
    ];
  }, [petInfo]);

  const compatibilityScore = useMemo(() => {
    if (!petInfo) return 85;
    // Random but consistent score based on pet ID
    const hash = petId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 70 + (hash % 25);
  }, [petId, petInfo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <MainNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading pet details...</p>
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
            <p className="text-slate-800 text-lg mb-2">Oops! Something went wrong</p>
            <p className="text-slate-500">{error}</p>
            <Link to="/search" className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition">
              Browse Other Pets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!petInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <MainNavbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-rose-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <section className="relative py-8 pb-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-slate-500 hover:text-indigo-600 transition">Home</Link>
              <span className="text-slate-400">/</span>
              <Link to="/search" className="text-slate-500 hover:text-indigo-600 transition">Find a Pet</Link>
              <span className="text-slate-400">/</span>
              <span className="text-indigo-600 font-medium">{petInfo.name}</span>
            </nav>
          </div>

          {/* Status Badges */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              <BadgeCheck className="h-4 w-4" />
              Available for Adoption
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              <Heart className="h-4 w-4" />
              Verified Profile
            </span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Main Pet Card */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                  {/* Image Section */}
                  <div className="relative min-h-[500px] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                    <img
                      src={getImageSrc(petInfo.pictures?.[0], petInfo.name || "Pet")}
                      alt={petInfo.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                        <BadgeCheck size={16} />
                        Ready for a loving home
                      </div>
                      <h1 className="mt-4 text-5xl md:text-6xl font-black text-white tracking-tight">
                        {petInfo.name}
                      </h1>
                      <div className="mt-3 flex items-center gap-2 text-white/90">
                        <MapPin size={18} />
                        {petInfo.region || petInfo.city || "Local Shelter"}
                      </div>
                    </div>
                    {/* Favorite Button */}
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg"
                    >
                      <Bookmark className={`h-5 w-5 ${isFavorite ? 'fill-indigo-600 text-indigo-600' : 'text-slate-600'}`} />
                    </button>
                  </div>

                  {/* Info Section */}
                  <div className="bg-white p-6 md:p-8">
                    <div className="mb-6">
                      <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                        Meet {petInfo.name}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        Your Perfect Companion Awaits
                      </h2>
                      <div className="mt-4 h-1 w-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                    </div>

                    <p className="text-slate-600 leading-relaxed">
                      {petInfo.description ||
                        `${petInfo.name} is a wonderful ${petInfo.breed || 'pet'} looking for a forever home. 
                        With a gentle nature and loving personality, ${petInfo.name} is ready to bring joy to 
                        a caring family. This ${petInfo.age}-year-old companion is vaccinated, healthy, 
                        and eager to meet you!`}
                    </p>

                    {/* Facts Grid */}
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      {petFacts.slice(0, 4).map((fact) => {
                        const Icon = fact.icon;
                        return (
                          <div
                            key={fact.label}
                            className="group/fact flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300"
                          >
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${fact.color} bg-opacity-10 group-hover/fact:scale-110 transition-transform`}>
                              <Icon size={18} className="text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-slate-500">
                                {fact.label}
                              </p>
                              <p className="text-sm font-medium text-slate-800">{fact.value}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Compatibility Score */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">Compatibility Score</span>
                        <span className="text-2xl font-bold text-indigo-600">{compatibilityScore}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000"
                          style={{ width: `${compatibilityScore}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Based on lifestyle and care requirements</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-3">
                      <Link
                        to={`/form/${petId}`}
                        className="group/btn w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-bold text-white transition-all hover:shadow-xl hover:scale-105"
                      >
                        <HeartHandshake size={18} className="group-hover/btn:scale-110 transition" />
                        Adopt {petInfo.name}
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition" />
                      </Link>
                      
                      <div className="flex gap-3">
                        <Link
                          to="/search"
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition-all"
                        >
                          Browse More Pets
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Adoption Tips Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl">
                  <div className="inline-flex p-3 bg-white/10 rounded-xl mb-4">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Adoption Perspective</h3>
                  <p className="text-indigo-100 text-sm leading-relaxed">
                    Good adoptions are built on fit, not speed. Think about your daily routine, 
                    home environment, and the type of care you can sustain long-term.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-indigo-200 text-xs">
                    <CheckCircle size={14} />
                    <span>Thoughtful adoption process</span>
                  </div>
                </div>
              </div>

              {/* Care Requirements */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800">Care Requirements</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Daily exercise: 30-60 minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Home className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Needs space to roam</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Heart className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Loves attention and playtime</span>
                  </div>
                </div>
              </div>

              {/* Profile Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-slate-800">Why Adopt {petInfo.name}?</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Fully vaccinated and health-checked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Loving personality, great with families</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Ready to bring joy to your home</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Related Pets Section */}
      {relatedPets.length > 0 && (
        <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                  Similar Profiles
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  You Might Also Like
                </h2>
                <p className="mt-2 text-slate-500">
                  Discover other wonderful pets waiting for their forever home
                </p>
              </div>
              <Link 
                to="/search" 
                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 transition"
              >
                View All Pets
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPets.slice(0, 3).map((pet) => (
                <div key={pet._id} className="animate-fadeInUp">
                  <PetCard pet={pet} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default PetPage;
