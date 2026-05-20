import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { apiUrl } from "@/lib/api";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;
import { 
  ChevronDown, 
  ChevronUp, 
  PawPrint,
  Users,
  AlertTriangle,
  Heart,
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Search,
  Dog,
  Cat,
  Bird,
  Fish,
  Activity,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Home,
  MessageCircle,
  FileText,
  TrendingUp
} from "lucide-react";
import MainNavbar from "@/components/main-navbar/MainNavbar";
import NotificationsPanel from "@/components/common/NotificationsPanel";
import AdminChatPanel from "@/components/common/AdminChatPanel";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/use-socket";

const adoptionStatuses = ["pending", "approved", "rejected"];
const reportStatuses = ["pending", "in_progress", "resolved", "unable_to_process"];
const unableToProcessReasons = [
  "Invalid location",
  "Out of service area",
  "Insufficient details",
  "Other",
];

const formatStatus = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusClasses = (value) => {
  switch (value) {
    case "approved":
    case "resolved":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "rejected":
    case "withdrawn":
    case "unable_to_process":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "in_progress":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "approved":
    case "resolved":
      return CheckCircle;
    case "rejected":
    case "withdrawn":
    case "unable_to_process":
      return XCircle;
    case "in_progress":
      return Clock;
    default:
      return Clock;
  }
};

const initialPetForm = {
  name: "",
  breed: "",
  age: "",
  gender: "Male",
  description: "",
  category: "Dog",
  healthStatus: "Healthy",
  image: null,
};
const petCategoryOptions = ["Dog", "Cat", "Bird", "Hamster", "Rabbit"];
const petGenderOptions = ["Male", "Female"];
const petHealthOptions = ["Healthy", "Vaccinated", "Under Treatment", "Special Care"];

const categoryIcons = {
  Dog: Dog,
  Cat: Cat,
  Bird: Bird,
  Hamster: Heart,
  Rabbit: Heart,
};

function MapController({ centerPos }) {
  const map = useMap();
  useEffect(() => {
    if (centerPos) {
      map.setView(centerPos, 15, { animate: true });
    }
  }, [centerPos, map]);
  return null;
}

function MainAdminPanel() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("adoptions");
  const [adoptions, setAdoptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [pets, setPets] = useState([]);
  const [petForm, setPetForm] = useState(initialPetForm);
  const [editingPetId, setEditingPetId] = useState("");
  const [openAdoptionId, setOpenAdoptionId] = useState(null);
  const [openReportId, setOpenReportId] = useState(null);
  const [reportReasonDrafts, setReportReasonDrafts] = useState({});
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const { toast } = useToast();
  const { on, off } = useSocket();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [adoptionResponse, reportResponse, petResponse] = await Promise.all([
        axios.get(apiUrl("/api/shelter/adoptions"), { withCredentials: true }),
        axios.get(apiUrl("/api/shelter/reports"), { withCredentials: true }),
        axios.get(apiUrl("/api/shelter/pets"), { withCredentials: true }),
      ]);

      setAdoptions(adoptionResponse.data?.data || []);
      setReports(reportResponse.data?.data || []);
      setPets(petResponse.data?.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setAdoptions([]);
      setReports([]);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleRealtimeUpdate = () => {
      fetchDashboardData();
    };

    on("adoption_requested", handleRealtimeUpdate);
    on("stray_reported", handleRealtimeUpdate);
    on("adoption_updated", handleRealtimeUpdate);
    on("stray_updated", handleRealtimeUpdate);

    return () => {
      off("adoption_requested", handleRealtimeUpdate);
      off("stray_reported", handleRealtimeUpdate);
      off("adoption_updated", handleRealtimeUpdate);
      off("stray_updated", handleRealtimeUpdate);
    };
  }, [on, off]);

  const updateAdoption = async (adoptionId, status, shelterMessage) => {
    try {
      await axios.put(
        apiUrl(`/api/shelter/adoptions/${adoptionId}`),
        { status, shelterMessage },
        { withCredentials: true }
      );
      toast({
        title: "Adoption request saved",
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Failed to save adoption request",
        variant: "destructive",
      });
    }
  };

  const deleteAdoption = async (adoptionId) => {
    if (!window.confirm("Delete this adoption request?")) {
      return;
    }

    await axios.delete(apiUrl(`/api/shelter/adoptions/${adoptionId}`), {
      withCredentials: true,
    });
    fetchDashboardData();
  };

  const updateReport = async (reportId, status, reason = "") => {
    try {
      await axios.put(
        apiUrl(`/api/shelter/reports/${reportId}`),
        { status, reason },
        { withCredentials: true }
      );
      toast({
        title: "Stray report updated",
      });
      setReportReasonDrafts((current) => {
        const next = { ...current };
        delete next[reportId];
        return next;
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Failed to update stray report",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm("Delete this stray report permanently?")) {
      return;
    }

    await axios.delete(apiUrl(`/api/shelter/stray/${reportId}`), {
      withCredentials: true,
    });
    fetchDashboardData();
  };

  const submitPet = async (event) => {
    event.preventDefault();
    if (
      !petForm.name ||
      !petForm.breed ||
      !petForm.age ||
      !petForm.gender ||
      !petForm.category ||
      !petForm.description ||
      !petForm.healthStatus
    ) {
      toast({
        title: "Please fill all required pet fields",
        variant: "destructive",
      });
      return;
    }
    if (!editingPetId && !petForm.image) {
      toast({
        title: "Please select a pet image",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    Object.entries(petForm).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      setIsSubmittingPet(true);
      if (editingPetId) {
        await axios.put(apiUrl(`/api/shelter/pets/${editingPetId}`), formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(apiUrl("/api/shelter/pets"), formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast({
        title: editingPetId ? "Pet updated successfully" : "Pet added successfully",
      });
      setPetForm(initialPetForm);
      setEditingPetId("");
      fetchDashboardData();
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Failed to add pet, try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPet(false);
    }
  };

  const deletePet = async (petId) => {
    if (!window.confirm("Remove this pet from the shelter?")) {
      return;
    }
    await axios.delete(apiUrl(`/api/shelter/pets/${petId}`), {
      withCredentials: true,
    });
    fetchDashboardData();
  };

  const resetPetForm = () => {
    setPetForm(initialPetForm);
    setEditingPetId("");
  };

  const filteredPets = pets.filter(pet =>
    pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const approvedAdoptions = adoptions.filter((adoption) => adoption.status === "approved").length;
  const pendingAdoptions = adoptions.filter((adoption) => adoption.status === "pending").length;
  const rejectedAdoptions = adoptions.filter((adoption) => adoption.status === "rejected").length;
  const pendingReports = reports.filter((report) => report.reportStatus === "pending").length;
  const activeReports = reports.filter((report) => report.reportStatus === "in_progress").length;
  const resolvedReports = reports.filter((report) => report.reportStatus === "resolved").length;
  const availablePets = pets.filter((pet) => pet.adoptionStatus !== "adopted").length;

  const stats = [
    { 
      label: "Adoption Requests", 
      value: adoptions.length, 
      icon: Heart, 
      gradient: "from-rose-500 to-pink-600",
      change: pendingAdoptions,
      changeLabel: "pending"
    },
    { 
      label: "Resolved Adoptions", 
      value: approvedAdoptions, 
      icon: CheckCircle, 
      gradient: "from-emerald-500 to-teal-600",
      change: rejectedAdoptions,
      changeLabel: "rejected"
    },
    { 
      label: "Active Rescue Cases", 
      value: pendingReports + activeReports, 
      icon: AlertTriangle, 
      gradient: "from-amber-500 to-orange-600",
      change: resolvedReports,
      changeLabel: "resolved"
    },
    { 
      label: "Pets Available", 
      value: availablePets, 
      icon: PawPrint, 
      gradient: "from-blue-500 to-indigo-600",
      change: pets.length - availablePets,
      changeLabel: "adopted"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <MainNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading shelter dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <MainNavbar />
      
      {/* Animated Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl shadow-lg">
                  <PawPrint className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Shelter Operations
                  </h1>
                  <p className="text-slate-500 mt-1">Manage adoptions, reports, and rescued animals</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-slate-700 hover:text-slate-900"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">Refresh Data</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    {stat.change && (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                        {stat.change} {stat.changeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
                <div className={`h-1 w-full bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-6">
          <div className="bg-gradient-to-br from-rose-900 to-pink-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-rose-300" />
                <p className="text-sm font-semibold uppercase tracking-wider text-rose-300">Compassion in Action</p>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Animal Welfare Dashboard</h2>
              <p className="text-rose-100 text-sm">Managing shelter operations with care and transparency</p>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <p className="text-sm text-rose-200">Approved Adoptions</p>
                  <p className="mt-2 text-2xl font-bold text-white">{approvedAdoptions}</p>
                  <p className="mt-1 text-xs text-rose-100">{pendingAdoptions} waiting for review</p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <p className="text-sm text-rose-200">Rescue Reports Closed</p>
                  <p className="mt-2 text-2xl font-bold text-white">{resolvedReports}</p>
                  <p className="mt-1 text-xs text-rose-100">{activeReports} currently in progress</p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <p className="text-sm text-rose-200">Pets Ready for Adoption</p>
                  <p className="mt-2 text-2xl font-bold text-white">{availablePets}</p>
                  <p className="mt-1 text-xs text-rose-100">{pets.length} total pets under shelter care</p>
                </div>
              </div>
            </div>
          </div>
          <NotificationsPanel />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex gap-6 overflow-x-auto">
              {[
                { id: "adoptions", label: "Adoption Requests", icon: Heart, count: adoptions.filter(a => a.status === "pending").length },
                { id: "reports", label: "Stray Reports", icon: AlertTriangle, count: reports.filter(r => r.reportStatus === "pending").length },
                { id: "pets", label: "Rescued Pets", icon: PawPrint, count: pets.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-rose-600 text-rose-600"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === tab.id ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Adoption Requests Tab */}
          {activeTab === "adoptions" && (
            <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Adoption Applications</h2>
                    <p className="text-sm text-slate-500 mt-1">Review and process adoption requests</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search adoptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                {adoptions.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No adoption requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adoptions.filter(adoption => 
                      adoption.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      adoption.user?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      adoption.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((adoption) => {
                      const StatusIcon = getStatusIcon(adoption.status);
                      return (
                        <div
                          key={adoption._id}
                          className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-5 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-rose-50 rounded-xl">
                                  <Heart className="h-5 w-5 text-rose-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {adoption.pet?.name || adoption.adoptionDetails?.petName || "Pet Adoption"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-slate-500">{adoption.user?.userName || adoption.personalInfo?.fullName}</span>
                                    <span className="text-xs text-slate-300">•</span>
                                    <span className="text-sm text-slate-500">{adoption.city || "Unknown city"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusClasses(adoption.status)}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {formatStatus(adoption.status)}
                                </div>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                  onClick={() => setOpenAdoptionId(openAdoptionId === adoption._id ? null : adoption._id)}
                                >
                                  {openAdoptionId === adoption._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  {openAdoptionId === adoption._id ? "Hide Details" : "View Details"}
                                </button>
                              </div>
                            </div>

                            {/* Adoption Details Expandable Section */}
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                openAdoptionId === adoption._id ? "mt-5 max-h-[3000px]" : "max-h-0"
                              }`}
                            >
                              <div className="border-t border-slate-100 pt-5 mt-2">
                                <div className="grid gap-6 md:grid-cols-2">
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                      <Users className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Personal Information</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p><span className="font-medium">Full Name:</span> {adoption.personalInfo?.fullName}</p>
                                          <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {adoption.personalInfo?.email}</p>
                                          <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {adoption.personalInfo?.phone}</p>
                                          <p><span className="font-medium">Occupation:</span> {adoption.personalInfo?.occupation}</p>
                                          <p><span className="font-medium">Working Hours:</span> {adoption.personalInfo?.workingHours}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Home className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Living Conditions</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p><span className="font-medium">Residence:</span> {adoption.livingConditions?.residenceType}</p>
                                          <p><span className="font-medium">Ownership:</span> {adoption.livingConditions?.ownershipStatus}</p>
                                          <p><span className="font-medium">Has Yard:</span> {String(adoption.livingConditions?.hasYard)}</p>
                                          <p><span className="font-medium">Household Members:</span> {adoption.livingConditions?.householdMembers}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                      <PawPrint className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pet Experience</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p><span className="font-medium">Current Pets:</span> {adoption.petExperience?.currentPets || "None"}</p>
                                          <p><span className="font-medium">Previous Pets:</span> {adoption.petExperience?.previousPets}</p>
                                          <p><span className="font-medium">Veterinarian:</span> {adoption.petExperience?.vetName || "N/A"}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MessageCircle className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adoption Motivation</p>
                                        <p className="mt-2 text-sm text-slate-700">{adoption.adoptionDetails?.reasonToAdopt}</p>
                                        <p className="mt-2 text-sm"><span className="font-medium">Time Commitment:</span> {adoption.adoptionDetails?.timeWithPet}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Shelter Notes</p>
                                  <p className="mt-2 text-sm text-amber-800">{adoption.shelterMessage || "No notes added yet."}</p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                              <select
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                                value={adoption.status}
                                disabled={adoption.status === "withdrawn"}
                                onChange={(event) =>
                                  setAdoptions((current) =>
                                    current.map((item) =>
                                      item._id === adoption._id ? { ...item, status: event.target.value } : item
                                    )
                                  )
                                }
                              >
                                {adoptionStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {formatStatus(status)}
                                  </option>
                                ))}
                              </select>
                              <input
                                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                                placeholder="Add shelter message or notes..."
                                disabled={adoption.status === "withdrawn"}
                                value={adoption.shelterMessage || ""}
                                onChange={(event) =>
                                  setAdoptions((current) =>
                                    current.map((item) =>
                                      item._id === adoption._id
                                        ? { ...item, shelterMessage: event.target.value }
                                        : item
                                    )
                                  )
                                }
                              />
                              <button
                                type="button"
                                className="rounded-xl bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={adoption.status === "withdrawn"}
                                onClick={() => updateAdoption(adoption._id, adoption.status, adoption.shelterMessage)}
                              >
                                {adoption.status === "withdrawn" ? "Locked" : "Save Changes"}
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                onClick={() => deleteAdoption(adoption._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stray Reports Tab */}
          {activeTab === "reports" && (
            <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">Stray Animal Reports</h2>
                <p className="text-sm text-slate-500 mt-1">Coordinate rescue operations and track responses</p>
              </div>

              {/* Admin Map Section */}
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Live Reports Map
                </h3>
                <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative" style={{ zIndex: 0 }}>
                  <MapContainer center={mapCenter || [30.7333, 76.7794]} zoom={11} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController centerPos={mapCenter} />
                    {reports.filter(r => r.latitude && r.longitude).map((report) => (
                      <Marker key={report._id} position={[report.latitude, report.longitude]}>
                        <Popup>
                          <div className="text-sm">
                            <p className="font-bold text-slate-900">{report.name} ({report.type})</p>
                            <p className="text-slate-600 mb-1">{report.reportLocation}</p>
                            <div className={`inline-block px-2 py-0.5 rounded text-xs ${report.reportStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                              Status: {formatStatus(report.reportStatus)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
                <p className="text-xs text-slate-500 mt-2">Map automatically updates as new strays are reported. Click markers for details.</p>
              </div>
              <div className="p-6">
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No stray reports submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const StatusIcon = getStatusIcon(report.reportStatus);
                      return (
                        <div
                          key={report._id}
                          className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-5 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-50 rounded-xl">
                                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">{report.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-slate-500">{report.type} • {report.breed}</span>
                                    <span className="text-xs text-slate-300">•</span>
                                    <span className="text-sm text-slate-500">Age: {report.age}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusClasses(report.reportStatus)}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {formatStatus(report.reportStatus)}
                                </div>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                  onClick={() => setOpenReportId(openReportId === report._id ? null : report._id)}
                                >
                                  {openReportId === report._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  {openReportId === report._id ? "Hide Details" : "View Details"}
                                </button>
                                {report.latitude && report.longitude && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMapCenter([report.latitude, report.longitude]);
                                      window.scrollTo({ top: 300, behavior: 'smooth' });
                                    }}
                                    className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm text-sky-700 hover:bg-sky-100 transition-colors"
                                  >
                                    <MapPin className="h-4 w-4" /> View on Map
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Report Details Expandable Section */}
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                openReportId === report._id ? "mt-5 max-h-[2000px]" : "max-h-0"
                              }`}
                            >
                              <div className="border-t border-slate-100 pt-5 mt-2">
                                <div className="grid gap-6 md:grid-cols-2">
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Location Details</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p><span className="font-medium">City/Region:</span> {report.region}</p>
                                          <p><span className="font-medium">Exact Location:</span> {report.reportLocation || "N/A"}</p>
                                          <p><span className="font-medium">Distance:</span> {report.distanceFromChandigarhKm || 0} km from city</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Description</p>
                                        <p className="mt-2 text-sm text-slate-700">{report.description || "No description provided."}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                      <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Report Timeline</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p>Reported: {new Date(report.createdAt || Date.now()).toLocaleString("en-IN")}</p>
                                          <p><span className="font-medium">Reported by:</span> {report.reporter?.userName || "Anonymous"}</p>
                                        </div>
                                      </div>
                                    </div>
                                    {(report.pictures?.length || report.image) && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Images</p>
                                        <div className="flex flex-wrap gap-2">
                                          {(report.pictures?.length ? report.pictures : [report.image]).filter(Boolean).slice(0, 3).map((image, idx) => (
                                            <img
                                              key={idx}
                                              src={image}
                                              alt={report.name}
                                              className="h-20 w-20 rounded-xl object-cover border border-slate-200"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-3">
                              <select
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                                value={report.reportStatus}
                                onChange={(event) =>
                                  setReports((current) =>
                                    current.map((item) =>
                                      item._id === report._id
                                        ? { ...item, reportStatus: event.target.value }
                                        : item
                                    )
                                  )
                                }
                              >
                                {reportStatuses.map((status) => (
                                  <option key={status} value={status}>
                                    {formatStatus(status)}
                                  </option>
                                ))}
                              </select>
                              <select
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                                value={
                                  unableToProcessReasons.includes(reportReasonDrafts[report._id])
                                    ? reportReasonDrafts[report._id]
                                    : unableToProcessReasons.includes(report.reportIssueReason)
                                    ? report.reportIssueReason
                                    : reportReasonDrafts[report._id] || report.reportIssueReason
                                    ? "Other"
                                    : ""
                                }
                                onChange={(event) =>
                                  setReportReasonDrafts((current) => ({
                                    ...current,
                                    [report._id]: event.target.value,
                                  }))
                                }
                              >
                                <option value="">Reason (optional)</option>
                                {unableToProcessReasons.map((reason) => (
                                  <option key={reason} value={reason}>
                                    {reason}
                                  </option>
                                ))}
                              </select>
                              {reportReasonDrafts[report._id] === "Other" ? (
                                <input
                                  className="min-w-[200px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                                  placeholder="Enter custom reason"
                                  value={report.customIssueReason || report.reportIssueReason || ""}
                                  onChange={(event) =>
                                    setReports((current) =>
                                      current.map((item) =>
                                        item._id === report._id
                                          ? { ...item, customIssueReason: event.target.value }
                                          : item
                                      )
                                    )
                                  }
                                />
                              ) : null}
                              <button
                                type="button"
                                className="rounded-xl bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700 transition-colors"
                                onClick={() =>
                                  updateReport(
                                    report._id,
                                    report.reportStatus,
                                    (reportReasonDrafts[report._id] || "") === "Other"
                                      ? report.customIssueReason || ""
                                      : reportReasonDrafts[report._id] || ""
                                  )
                                }
                              >
                                Update Status
                              </button>
                              <button
                                type="button"
                                className="rounded-xl bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 transition-colors"
                                onClick={() =>
                                  updateReport(
                                    report._id,
                                    "unable_to_process",
                                    (reportReasonDrafts[report._id] || "") === "Other"
                                      ? report.customIssueReason || ""
                                      : reportReasonDrafts[report._id] || ""
                                  )
                                }
                              >
                                Unable to Process
                              </button>
                              <button
                                type="button"
                                className="rounded-xl border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                                onClick={() => deleteReport(report._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rescued Pets Tab */}
          {activeTab === "pets" && (
            <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Rescued Pets</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage shelter animals available for adoption</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search pets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  {/* Add/Edit Pet Form */}
                  <form onSubmit={submitPet} className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="h-5 w-5 text-rose-600" />
                      <h3 className="font-semibold text-slate-900">
                        {editingPetId ? "Edit Pet Details" : "Add New Rescued Pet"}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <input 
                        required 
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent" 
                        placeholder="Pet name *" 
                        value={petForm.name} 
                        onChange={(event) => setPetForm({ ...petForm, name: event.target.value })} 
                      />
                      <input 
                        required 
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent" 
                        placeholder="Breed *" 
                        value={petForm.breed} 
                        onChange={(event) => setPetForm({ ...petForm, breed: event.target.value })} 
                      />
                      <input 
                        required 
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent" 
                        type="number" 
                        placeholder="Age (years) *" 
                        value={petForm.age} 
                        onChange={(event) => setPetForm({ ...petForm, age: event.target.value })} 
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select 
                          required 
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent" 
                          value={petForm.gender} 
                          onChange={(event) => setPetForm({ ...petForm, gender: event.target.value })}
                        >
                          {petGenderOptions.map((gender) => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                        <select 
                          required 
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent" 
                          value={petForm.category} 
                          onChange={(event) => setPetForm({ ...petForm, category: event.target.value })}
                        >
                          {petCategoryOptions.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <select 
                        required 
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent" 
                        value={petForm.healthStatus} 
                        onChange={(event) => setPetForm({ ...petForm, healthStatus: event.target.value })}
                      >
                        {petHealthOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <textarea 
                        required 
                        rows="3"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none" 
                        placeholder="Description *" 
                        value={petForm.description} 
                        onChange={(event) => setPetForm({ ...petForm, description: event.target.value })} 
                      />
                      <div className="mt-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Pet Photo</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <ImageIcon className="h-4 w-4 text-slate-600" />
                            <span className="text-sm text-slate-700">Choose File</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              className="hidden"
                              onChange={(event) => setPetForm({ ...petForm, image: event.target.files?.[0] || null })}
                            />
                          </label>
                          {petForm.image && (
                            <span className="text-sm text-slate-600">{petForm.image.name}</span>
                          )}
                        </div>
                      </div>
                      {editingPetId && (
                        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">Editing existing pet - image optional</p>
                      )}
                      <div className="flex gap-3 pt-2">
                        <button 
                          className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-white font-medium hover:bg-rose-700 transition-colors disabled:opacity-50" 
                          type="submit" 
                          disabled={isSubmittingPet}
                        >
                          {isSubmittingPet ? "Saving..." : editingPetId ? "Update Pet" : "Add Pet"}
                        </button>
                        {editingPetId && (
                          <button 
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-slate-700 font-medium hover:bg-slate-50 transition-colors" 
                            type="button" 
                            onClick={resetPetForm}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  {/* Pets List */}
                  <div>
                    {filteredPets.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl">
                        <PawPrint className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No rescued pets found</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredPets.map((pet) => {
                          const CategoryIcon = categoryIcons[pet.category] || PawPrint;
                          return (
                            <div key={pet._id} className="flex gap-4 p-4 rounded-2xl border border-slate-200 hover:shadow-md transition-all bg-white">
                              <div className="flex-shrink-0">
                                <img 
                                  src={pet.image || pet.pictures?.[0]} 
                                  alt={pet.name} 
                                  className="h-24 w-24 rounded-xl object-cover border border-slate-200" 
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                      {pet.name}
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                        {pet.gender}
                                      </span>
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <CategoryIcon className="h-3 w-3 text-slate-400" />
                                      <p className="text-xs text-slate-500">{pet.category} • {pet.breed}</p>
                                    </div>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    pet.healthStatus === "Healthy" ? "bg-emerald-100 text-emerald-700" :
                                    pet.healthStatus === "Vaccinated" ? "bg-blue-100 text-blue-700" :
                                    "bg-amber-100 text-amber-700"
                                  }`}>
                                    {pet.healthStatus}
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{pet.description}</p>
                                <div className="flex gap-2 mt-3">
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                    onClick={() => {
                                      setEditingPetId(pet._id);
                                      setPetForm({
                                        name: pet.name || "",
                                        breed: pet.breed || "",
                                        age: pet.age || "",
                                        gender: pet.gender || "Male",
                                        description: pet.description || "",
                                        category: pet.category || pet.type || "Dog",
                                        healthStatus: pet.healthStatus || "Healthy",
                                        image: null,
                                      });
                                    }}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                                    onClick={() => deletePet(pet._id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="mt-6">
          <AdminChatPanel currentUser={user} />
        </div>
      </div>
    </div>
  );
}

export default MainAdminPanel;
