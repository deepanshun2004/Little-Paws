import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { apiUrl } from "@/lib/api";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

import { 
  Camera, 
  MapPin, 
  PawPrint, 
  AlertTriangle,
  Send,
  Upload,
  X,
  ChevronRight,
  Shield,
  Heart,
  Clock,
  Navigation,
  Phone,
  Mail,
  CheckCircle
} from "lucide-react";
import MainNavbar from "@/components/main-navbar/MainNavbar";
import banner2 from "@/assets/banner2.webp";
import banner4 from "@/assets/banner4.webp";
import banner5 from "@/assets/banner5.webp";
import { useToast } from "@/hooks/use-toast";

const MainReportStray = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    breed: "",
    description: "",
    age: "",
    city: "",
    location: "",
    latitude: 30.7333,
    longitude: 76.7794,
    distanceFromChandigarhKm: "",
    shelterId: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [shelters, setShelters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const slides = [banner5, banner2, banner4];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await axios.get(apiUrl("/api/user/shelters"));
        setShelters(response.data?.shelters || []);
      } catch (error) {
        setShelters([]);
      }
    };

    fetchShelters();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        handleInputChange("latitude", e.latlng.lat);
        handleInputChange("longitude", e.latlng.lng);
      },
    });

    return formData.latitude && formData.longitude ? (
      <Marker position={[formData.latitude, formData.longitude]} />
    ) : null;
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
    const validFiles = [];
    let hasInvalid = false;
    
    files.forEach(file => {
      // Validate by mime type or extension (for HEIC sometimes mimetype is missing)
      if (allowedMimeTypes.includes(file.type) || file.name.toLowerCase().match(/\.(heic|heif|webp)$/)) {
        validFiles.push(file);
      } else {
        hasInvalid = true;
      }
    });

    if (hasInvalid) {
      toast({
        title: "Invalid file type",
        description: "Only jpg, jpeg, png, webp and heic files are allowed.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
      const previews = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previews]);
    }
    
    // Reset file input
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Pet name is required";
    if (!formData.type.trim()) newErrors.type = "Pet type is required";
    if (!formData.breed.trim()) newErrors.breed = "Breed is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.age || formData.age <= 0) newErrors.age = "Valid age is required";
    if (formData.distanceFromChandigarhKm === "" || Number(formData.distanceFromChandigarhKm) < 0) {
      newErrors.distanceFromChandigarhKm = "Valid distance is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("breed", formData.breed);
    data.append("description", formData.description);
    data.append("age", formData.age);
    data.append("city", formData.city);
    data.append("location", formData.location);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    data.append("distanceFromChandigarhKm", formData.distanceFromChandigarhKm);
    data.append("shelterId", formData.shelterId);

    images.forEach((image) => {
      data.append("pictures", image);
    });

    try {
      const response = await axios.post(apiUrl("/api/user/report-stray"), data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/applicationStatus");
      }, 2000);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <MainNavbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-sky-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section with Slideshow */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl">
          {slides.map((slide, index) => (
            <div
              key={slide}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${
                activeSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(56, 189, 248, 0.75)), url(${slide})`,
              }}
            />
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_70%)]" />
          <div className="relative z-10 py-20 px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-fadeIn">
              <AlertTriangle className="h-4 w-4 text-amber-300 animate-pulse" />
              <span className="text-sm text-white font-medium">Need Help? Report a Stray</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fadeInUp">
              Help a Stray Animal
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fadeInUp delay-200">
              Your report can save a life. Provide details and our team will respond quickly to help animals in need.
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Quick Response</h3>
            </div>
            <p className="text-sm text-slate-600">Within 40km of Chandigarh? Our team will arrange pickup within 24 hours.</p>
          </div>
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 border border-sky-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-sky-100 rounded-xl">
                <Shield className="h-5 w-5 text-sky-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Safe & Humane</h3>
            </div>
            <p className="text-sm text-slate-600">Trained professionals handle every rescue with care and compassion.</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Heart className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Medical Care</h3>
            </div>
            <p className="text-sm text-slate-600">Every rescued animal receives veterinary care and rehabilitation.</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="relative mx-auto max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Success Overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
              <div className="text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Report Submitted!</h3>
                <p className="text-slate-600">Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="border-b border-slate-200 pb-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                  <PawPrint className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Report a Stray Animal</h2>
              </div>
              <p className="text-slate-600">
                Share the animal details. Your report will be reviewed by our shelter partners who will coordinate rescue efforts.
              </p>
            </div>

            <div className="space-y-5">
              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Pet Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Pet Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <PawPrint className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter pet's name"
                      className={`w-full rounded-xl border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-400'} pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type of Pet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    placeholder="e.g., Dog, Cat, Bird"
                    className={`w-full rounded-xl border ${errors.type ? 'border-red-300' : 'border-slate-200'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all`}
                  />
                  {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                </div>

                {/* Breed */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Breed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => handleInputChange("breed", e.target.value)}
                    placeholder="e.g., Golden Retriever"
                    className={`w-full rounded-xl border ${errors.breed ? 'border-red-300' : 'border-slate-200'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all`}
                  />
                  {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Age (years) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="Enter age in years"
                    className={`w-full rounded-xl border ${errors.age ? 'border-red-300' : 'border-slate-200'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all`}
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter your city"
                      className={`w-full rounded-xl border ${errors.city ? 'border-red-300' : 'border-slate-200'} pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all`}
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Exact Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="Landmark or street address"
                      className={`w-full rounded-xl border ${errors.location ? 'border-red-300' : 'border-slate-200'} pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all`}
                    />
                  </div>
                  {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                </div>
              </div>

              {/* Map Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pin Exact Location <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mb-2">Click on the map to select exact stray location.</p>
                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative" style={{ zIndex: 0 }}>
                  <MapContainer center={[formData.latitude, formData.longitude]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker />
                  </MapContainer>
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Distance From Chandigarh (km) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.distanceFromChandigarhKm}
                  onChange={(e) => handleInputChange("distanceFromChandigarhKm", e.target.value)}
                  placeholder="Enter distance in km"
                  className={`w-full rounded-xl border ${errors.distanceFromChandigarhKm ? 'border-red-300' : 'border-slate-200'} px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all`}
                />
                {errors.distanceFromChandigarhKm && (
                  <p className="text-red-500 text-xs mt-1">{errors.distanceFromChandigarhKm}</p>
                )}
                <p className="mt-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                  {Number(formData.distanceFromChandigarhKm) <= 40 && formData.distanceFromChandigarhKm > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Great! Within 40km - our team can arrange pickup.
                    </span>
                  ) : Number(formData.distanceFromChandigarhKm) > 40 ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> Outside pickup range. You may need to bring the animal to the shelter.
                    </span>
                  ) : (
                    "If your location is within 40 km of Chandigarh, our team can arrange pickup. Otherwise, you will need to bring the animal to the assigned center."
                  )}
                </p>
              </div>

              {/* Shelter Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preferred Shelter
                </label>
                <select
                  value={formData.shelterId}
                  onChange={(e) => handleInputChange("shelterId", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Auto assign nearest shelter</option>
                  {shelters.map((shelter) => (
                    <option key={shelter._id} value={shelter._id}>
                      {shelter.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe the animal's appearance, behavior, and any special notes..."
                  rows="4"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Upload Pictures
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PNG, JPG, WEBP, HEIC up to 5MB each</p>
                  </label>
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="h-4 w-4" />
                <span>All reports are confidential and reviewed by shelter partners</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Report
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default MainReportStray;