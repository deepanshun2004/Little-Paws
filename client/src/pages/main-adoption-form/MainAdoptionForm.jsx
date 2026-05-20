import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  Heart,
  Home,
  PawPrint,
  Users,
  Shield,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  Award,
  Send
} from "lucide-react";
import MainNavbar from "@/components/main-navbar/MainNavbar";
import { getImageSrc } from "@/lib/image";

import { apiUrl } from "@/lib/api";
const AdoptionForm = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [shelters, setShelters] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [petDetails, setPetDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    city: "",
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      altPhone: "",
      address: "",
      occupation: "",
      workingHours: "",
    },
    livingConditions: {
      residenceType: "",
      ownershipStatus: "",
      hasYard: false,
      yardFenced: false,
      householdMembers: "",
      childrenAges: "",
      landlordContact: "",
      moveFrequency: "",
    },
    petExperience: {
      currentPets: "",
      previousPets: "",
      vetName: "",
      vetContact: "",
      petAllergies: "",
      trainingExperience: "",
    },
    adoptionDetails: {
      petName: "",
      reasonToAdopt: "",
      timeWithPet: "",
      exercisePlan: "",
      emergencyPlan: "",
      adjustmentPlan: "",
      petExpenses: "",
      vacationPlan: "",
      shelterPreference: "",
    },
  });

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await axios.get(apiUrl("/api/user/shelters"));
        setShelters(response.data?.shelters || []);
      } catch (error) {
        console.error("Error fetching shelters:", error);
      }
    };

    const fetchPetDetails = async () => {
      try {
        const response = await axios.get(apiUrl(`/api/pets/${petId}`));
        setPetDetails(response.data);
        setFormData(prev => ({
          ...prev,
          adoptionDetails: {
            ...prev.adoptionDetails,
            petName: response.data.name || "",
          }
        }));
      } catch (error) {
        console.error("Error fetching pet details:", error);
      }
    };

    fetchShelters();
    fetchPetDetails();
  }, [petId]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleCheckboxChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.city) return "City is required";
        if (!formData.personalInfo.fullName) return "Full name is required";
        if (!formData.personalInfo.email) return "Email is required";
        if (!formData.personalInfo.phone) return "Phone number is required";
        if (!formData.personalInfo.address) return "Address is required";
        if (!formData.personalInfo.occupation) return "Occupation is required";
        if (!formData.personalInfo.workingHours) return "Working hours is required";
        return null;
      case 2:
        if (!formData.livingConditions.residenceType) return "Residence type is required";
        if (!formData.livingConditions.ownershipStatus) return "Ownership status is required";
        if (!formData.livingConditions.householdMembers) return "Household members is required";
        if (!formData.livingConditions.moveFrequency) return "Move frequency is required";
        return null;
      case 3:
        if (!formData.petExperience.previousPets) return "Previous pet experience is required";
        if (!formData.petExperience.trainingExperience) return "Training experience is required";
        return null;
      case 4:
        if (!formData.adoptionDetails.reasonToAdopt) return "Reason for adoption is required";
        if (!formData.adoptionDetails.timeWithPet) return "Time with pet is required";
        if (!formData.adoptionDetails.exercisePlan) return "Exercise plan is required";
        if (!formData.adoptionDetails.petExpenses) return "Pet expenses is required";
        if (!formData.adoptionDetails.vacationPlan) return "Vacation plan is required";
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      alert(error);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateStep(4);
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(apiUrl(`/api/user/adopt/${petId}`), formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/applicationStatus");
        }, 2000);
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Personal Info", icon: Users, description: "Tell us about yourself" },
    { number: 2, title: "Living Conditions", icon: Home, description: "Your home environment" },
    { number: 3, title: "Pet Experience", icon: PawPrint, description: "Your experience with pets" },
    { number: 4, title: "Adoption Details", icon: Heart, description: "Why you want to adopt" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <MainNavbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Pet Info Banner */}
        {petDetails && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center p-6">
              <img 
                src={getImageSrc(petDetails.pictures?.[0] || petDetails.image, petDetails.name || "Pet")} 
                alt={petDetails.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="md:ml-6 text-center md:text-left mt-4 md:mt-0">
                <h2 className="text-2xl font-bold text-white">Adopting {petDetails.name}</h2>
                <p className="text-blue-100 mt-1">{petDetails.breed} • {petDetails.age} years • {petDetails.gender}</p>
                <p className="text-blue-50 text-sm mt-2">You're one step away from giving {petDetails.name} a forever home!</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110' : 
                        isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}
                    `}>
                      {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-400 hidden md:block">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`absolute top-6 left-1/2 w-full h-0.5 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-slate-200'
                    }`} style={{ transform: 'translateY(-50%)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Success Overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Application Submitted!</h3>
                <p className="text-slate-600">Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="animate-fadeIn">
                <div className="border-b border-slate-200 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                      <p className="text-slate-600 mt-1">Tell us who you are and how to reach you</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.personalInfo.fullName}
                        onChange={(e) => handleInputChange("personalInfo", "fullName", e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                          value={formData.personalInfo.email}
                          onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                          value={formData.personalInfo.phone}
                          onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                          placeholder="+91 12345 67890"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Alternative Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.personalInfo.altPhone}
                        onChange={(e) => handleInputChange("personalInfo", "altPhone", e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <textarea
                          rows="2"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                          value={formData.personalInfo.address}
                          onChange={(e) => handleInputChange("personalInfo", "address", e.target.value)}
                          placeholder="Your complete address"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="Your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Occupation <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                          value={formData.personalInfo.occupation}
                          onChange={(e) => handleInputChange("personalInfo", "occupation", e.target.value)}
                          placeholder="Software Engineer, Teacher, etc."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Working Hours <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                          value={formData.personalInfo.workingHours}
                          onChange={(e) => handleInputChange("personalInfo", "workingHours", e.target.value)}
                          placeholder="9 AM - 5 PM"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Living Conditions */}
            {currentStep === 2 && (
              <div className="animate-fadeIn">
                <div className="border-b border-slate-200 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Living Conditions</h2>
                      <p className="text-slate-600 mt-1">Tell us about your home environment</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Residence Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.livingConditions.residenceType}
                        onChange={(e) => handleInputChange("livingConditions", "residenceType", e.target.value)}
                      >
                        <option value="">Select residence type</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Ownership Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.livingConditions.ownershipStatus}
                        onChange={(e) => handleInputChange("livingConditions", "ownershipStatus", e.target.value)}
                      >
                        <option value="">Select ownership status</option>
                        <option value="Own">Own</option>
                        <option value="Rent">Rent</option>
                        <option value="Live with family">Live with family</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          checked={formData.livingConditions.hasYard}
                          onChange={(e) => handleCheckboxChange("livingConditions", "hasYard", e.target.checked)}
                        />
                        <span className="text-sm text-slate-700">Has Yard</span>
                      </label>
                      {formData.livingConditions.hasYard && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            checked={formData.livingConditions.yardFenced}
                            onChange={(e) => handleCheckboxChange("livingConditions", "yardFenced", e.target.checked)}
                          />
                          <span className="text-sm text-slate-700">Yard Fenced</span>
                        </label>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Household Members <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.livingConditions.householdMembers}
                        onChange={(e) => handleInputChange("livingConditions", "householdMembers", e.target.value)}
                        placeholder="Number of people"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Children Ages
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.livingConditions.childrenAges}
                        onChange={(e) => handleInputChange("livingConditions", "childrenAges", e.target.value)}
                        placeholder="e.g., 5, 8, 12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Landlord Contact
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.livingConditions.landlordContact}
                        onChange={(e) => handleInputChange("livingConditions", "landlordContact", e.target.value)}
                        placeholder="If renting"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Move Frequency <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.livingConditions.moveFrequency}
                        onChange={(e) => handleInputChange("livingConditions", "moveFrequency", e.target.value)}
                      >
                        <option value="">Select frequency</option>
                        <option value="Rarely">Rarely (5+ years)</option>
                        <option value="Occasionally">Occasionally (2-5 years)</option>
                        <option value="Frequently">Frequently (1-2 years)</option>
                        <option value="Very Frequently">Very Frequently (Less than 1 year)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pet Experience */}
            {currentStep === 3 && (
              <div className="animate-fadeIn">
                <div className="border-b border-slate-200 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                      <PawPrint className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Pet Experience</h2>
                      <p className="text-slate-600 mt-1">Share your experience with animals</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Current Pets
                      </label>
                      <textarea
                        rows="3"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                        value={formData.petExperience.currentPets}
                        onChange={(e) => handleInputChange("petExperience", "currentPets", e.target.value)}
                        placeholder="List any current pets you have (species, breed, age)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Previous Pets <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows="3"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                        value={formData.petExperience.previousPets}
                        onChange={(e) => handleInputChange("petExperience", "previousPets", e.target.value)}
                        placeholder="Describe your previous pet ownership experience"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Veterinarian Name
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.petExperience.vetName}
                        onChange={(e) => handleInputChange("petExperience", "vetName", e.target.value)}
                        placeholder="Your vet's name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Veterinarian Contact
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.petExperience.vetContact}
                        onChange={(e) => handleInputChange("petExperience", "vetContact", e.target.value)}
                        placeholder="Vet's phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Pet Allergies
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.petExperience.petAllergies}
                        onChange={(e) => handleInputChange("petExperience", "petAllergies", e.target.value)}
                        placeholder="Any allergies in the household"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Training Experience <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows="3"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                        value={formData.petExperience.trainingExperience}
                        onChange={(e) => handleInputChange("petExperience", "trainingExperience", e.target.value)}
                        placeholder="Describe your experience with pet training"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Adoption Details */}
            {currentStep === 4 && (
              <div className="animate-fadeIn">
                <div className="border-b border-slate-200 pb-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Adoption Details</h2>
                      <p className="text-slate-600 mt-1">Help us understand why you're the perfect match</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Preferred Shelter
                      </label>
                      <select
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                        value={formData.adoptionDetails.shelterPreference}
                        onChange={(e) => handleInputChange("adoptionDetails", "shelterPreference", e.target.value)}
                      >
                        <option value="">Select shelter (optional)</option>
                        {shelters.map((shelter) => (
                          <option key={shelter._id} value={shelter._id}>
                            {shelter.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Why do you want to adopt this pet? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="4"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                      value={formData.adoptionDetails.reasonToAdopt}
                      onChange={(e) => handleInputChange("adoptionDetails", "reasonToAdopt", e.target.value)}
                      placeholder="Share your motivation for adoption..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      How much time will you spend with the pet? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="3"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                      value={formData.adoptionDetails.timeWithPet}
                      onChange={(e) => handleInputChange("adoptionDetails", "timeWithPet", e.target.value)}
                      placeholder="Describe your daily schedule and time commitment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Exercise Plan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="3"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                      value={formData.adoptionDetails.exercisePlan}
                      onChange={(e) => handleInputChange("adoptionDetails", "exercisePlan", e.target.value)}
                      placeholder="How will you ensure the pet gets enough exercise?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Emergency Plan
                    </label>
                    <textarea
                      rows="3"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                      value={formData.adoptionDetails.emergencyPlan}
                      onChange={(e) => handleInputChange("adoptionDetails", "emergencyPlan", e.target.value)}
                      placeholder="What's your plan for pet emergencies?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Adjustment Plan
                    </label>
                    <textarea
                      rows="3"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                      value={formData.adoptionDetails.adjustmentPlan}
                      onChange={(e) => handleInputChange("adoptionDetails", "adjustmentPlan", e.target.value)}
                      placeholder="How will you help the pet adjust to their new home?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Expected Pet Expenses <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="3"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                      value={formData.adoptionDetails.petExpenses}
                      onChange={(e) => handleInputChange("adoptionDetails", "petExpenses", e.target.value)}
                      placeholder="Describe your budget for pet care (food, vet, supplies, etc.)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vacation Plan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows="3"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                      value={formData.adoptionDetails.vacationPlan}
                      onChange={(e) => handleInputChange("adoptionDetails", "vacationPlan", e.target.value)}
                      placeholder="How will you care for the pet when you travel?"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={prevStep}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Helpful Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Why we ask these questions?</p>
              <p className="text-sm text-slate-600 mt-1">
                These questions help us ensure that every pet finds the perfect forever home. 
                Your honest answers will help us match you with the right companion for your lifestyle.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AdoptionForm;
