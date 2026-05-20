import { useEffect, useState } from "react";
import axios from "axios";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  PawPrint,
  AlertTriangle,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  MessageCircle,
  Heart,
  FileText,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import MainNavbar from "@/components/main-navbar/MainNavbar";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/use-socket";
import { useSelector } from "react-redux";
import AdminChatPanel from "@/components/common/AdminChatPanel";

import { apiUrl } from "@/lib/api";
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
    case "unable_to_process":
    case "withdrawn":
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
    case "unable_to_process":
    case "withdrawn":
      return XCircle;
    case "in_progress":
      return Clock;
    default:
      return Clock;
  }
};

const getStatusMessage = (status) => {
  switch (status) {
    case "approved":
      return "Your adoption request has been approved! The shelter will contact you soon.";
    case "rejected":
      return "Your adoption request was not approved. Please contact the shelter for more details.";
    case "withdrawn":
      return "You have withdrawn this adoption request.";
    case "in_progress":
      return "Your request is currently being reviewed by the shelter team.";
    case "pending":
      return "Your request is pending review. We'll update you soon.";
    default:
      return "Your request is being processed.";
  }
};

function ApplicationStatus() {
  const { user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeChatApplicationId, setActiveChatApplicationId] = useState(null);
  const { toast } = useToast();
  const { on, off } = useSocket();

  const fetchStatusData = async () => {
    setIsLoading(true);
    try {
      const [applicationsResponse, reportsResponse] = await Promise.all([
        axios.get(apiUrl("/api/user/adoption-status"), {
          withCredentials: true,
        }),
        axios.get(apiUrl("/api/user/reported-strays"), {
          withCredentials: true,
        }),
      ]);

      setApplications(applicationsResponse?.data?.applications || []);
      setReports(reportsResponse?.data?.reports || []);
    } catch (error) {
      console.error("Error fetching status data:", error);
      toast({
        title: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusData();
  }, []);

  useEffect(() => {
    const handleRealtimeUpdate = () => {
      fetchStatusData();
    };

    on("adoption_updated", handleRealtimeUpdate);
    on("stray_updated", handleRealtimeUpdate);

    return () => {
      off("adoption_updated", handleRealtimeUpdate);
      off("stray_updated", handleRealtimeUpdate);
    };
  }, [on, off]);

  const withdrawAdoption = async (application) => {
    const reason = window.prompt("Optional withdrawal reason:", application.withdrawalReason || "");
    if (reason === null) {
      return;
    }

    try {
      const response = await axios.put(
        apiUrl(`/api/user/adoption-status/${application._id}/withdraw`),
        { reason },
        { withCredentials: true }
      );
      const updatedApplication = response?.data?.application;
      setApplications((current) =>
        current.map((item) => (item._id === application._id ? updatedApplication || item : item))
      );
      toast({
        title: "Adoption request withdrawn successfully",
      });
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Failed to withdraw adoption request",
        variant: "destructive",
      });
    }
  };

  const deleteAdoption = async (applicationId) => {
    if (!window.confirm("Are you sure you want to delete this adoption request? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(apiUrl(`/api/user/adoption-status/${applicationId}`), {
        withCredentials: true,
      });
      setApplications((current) => current.filter((item) => item._id !== applicationId));
      toast({
        title: "Adoption request deleted",
      });
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Failed to delete adoption request",
        variant: "destructive",
      });
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this stray report? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(apiUrl(`/api/user/reported-strays/${reportId}`), {
        withCredentials: true,
      });
      setReports((current) => current.filter((item) => item._id !== reportId));
      toast({
        title: "Stray report deleted",
      });
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Failed to delete stray report",
        variant: "destructive",
      });
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "Recently";
    const diff = Math.floor((new Date() - new Date(date)) / 1000 / 60 / 60);
    if (diff < 1) return "Just now";
    if (diff < 24) return `${diff} hours ago`;
    return `${Math.floor(diff / 24)} days ago`;
  };

  const getApplicationChatTargetId = (application) =>
    application?.chatTargetUserId ||
    application?.shelterAdminId ||
    application?.shelterDetails?.shelterAdmin ||
    application?.petDetails?.shelterAdminId ||
    "";

  const getReportChatTargetId = (report) =>
    report?.chatTargetUserId ||
    report?.shelterAdminId ||
    report?.shelterDetails?.shelterAdmin ||
    "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <MainNavbar />
      
      {/* Animated Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-rose-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg">
                  <PawPrint className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Application Status
                  </h1>
                  <p className="text-slate-500 mt-1">Track your adoption requests and stray reports</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchStatusData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-slate-700 hover:text-slate-900"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">Refresh Status</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Heart className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{applications.length}</span>
                </div>
                <p className="text-sm font-medium text-slate-700">Total Applications</p>
                <p className="text-xs text-slate-500 mt-1">Adoption requests</p>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-bold text-amber-600">{reports.length}</span>
                </div>
                <p className="text-sm font-medium text-slate-700">Total Reports</p>
                <p className="text-xs text-slate-500 mt-1">Stray animal reports</p>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {applications.filter(a => a.status === "approved").length}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700">Approved</p>
                <p className="text-xs text-slate-500 mt-1">Successful adoptions</p>
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Clock className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {applications.filter(a => a.status === "pending").length + reports.filter(r => r.reportStatus === "pending").length}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700">Pending Review</p>
                <p className="text-xs text-slate-500 mt-1">Awaiting response</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your applications...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Adoption Requests Section */}
            <section className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="h-5 w-5 text-rose-500" />
                      <h2 className="text-xl font-semibold text-slate-900">Adoption Requests</h2>
                    </div>
                    <p className="text-sm text-slate-500">Track the status of your adoption applications</p>
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded-full">
                    <p className="text-sm font-medium text-slate-600">{applications.length} requests</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No adoption requests found</p>
                    <p className="text-sm text-slate-400 mt-1">Your adoption applications will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => {
                      const StatusIcon = getStatusIcon(application.status);
                      const chatTargetUserId = getApplicationChatTargetId(application);
                      return (
                        <div
                          key={application._id}
                          className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-slate-900 text-lg">
                                    {application.petDetails?.name || application.adoptionDetails?.petName || "Pet"}
                                  </h3>
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClasses(application.status)}`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {formatStatus(application.status)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {application.city || "City not specified"}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {getTimeAgo(application.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedApplication(selectedApplication === application._id ? null : application._id)}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <ChevronRight className={`h-5 w-5 transform transition-transform ${selectedApplication === application._id ? "rotate-90" : ""}`} />
                              </button>
                            </div>

                            {/* Expandable Details */}
                            {selectedApplication === application._id && (
                              <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                                <div className="space-y-3">
                                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                    <div className="flex items-start gap-2">
                                      <MessageCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Status Update</p>
                                        <p className="text-sm text-emerald-800 mt-1">{getStatusMessage(application.status)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Request Details</p>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="font-medium text-slate-700">Pet Name:</span> {application.petDetails?.name || application.adoptionDetails?.petName}</p>
                                      <p><span className="font-medium text-slate-700">Assigned Shelter:</span> {application.shelterDetails?.name || application.shelterDetails?.city || "Awaiting assignment"}</p>
                                      <p><span className="font-medium text-slate-700">Shelter Message:</span> {application.shelterMessage || "No message yet. We'll update you soon."}</p>
                                      {application.withdrawalReason && (
                                        <p className="text-rose-600"><span className="font-medium">Withdrawal Reason:</span> {application.withdrawalReason}</p>
                                      )}
                                      <p className="text-xs text-slate-400">Submitted on {new Date(application.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                                    </div>
                                  </div>

                                  {chatTargetUserId ? (
                                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shelter Chat</p>
                                          <p className="mt-1 text-sm text-slate-600">
                                            Ask follow-up questions directly to the shelter handling this application.
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                                          onClick={() =>
                                            setActiveChatApplicationId(
                                              activeChatApplicationId === application._id ? null : application._id
                                            )
                                          }
                                        >
                                          <MessageCircle className="h-4 w-4" />
                                          {activeChatApplicationId === application._id ? "Hide Chat" : "Chat with Shelter"}
                                        </button>
                                      </div>

                                      {activeChatApplicationId === application._id ? (
                                        <div className="mt-4">
                                          <AdminChatPanel
                                            currentUser={user}
                                            targetUserId={chatTargetUserId}
                                            title={`Chat with ${application.shelterDetails?.name || "Shelter"}`}
                                          />
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            )}

                            <div className="mt-4 flex gap-3">
                              {chatTargetUserId ? (
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                                  onClick={() => {
                                    setSelectedApplication(application._id);
                                    setActiveChatApplicationId(
                                      activeChatApplicationId === application._id ? null : application._id
                                    );
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  {activeChatApplicationId === application._id ? "Hide Chat" : "Chat with Shelter"}
                                </button>
                              ) : null}
                              {application.status === "approved" && application.status !== "withdrawn" && (
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200 transition-colors"
                                  onClick={() => withdrawAdoption(application)}
                                >
                                  <Clock className="h-4 w-4" />
                                  Withdraw Request
                                </button>
                              )}
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                onClick={() => deleteAdoption(application._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete Request
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Stray Reports Section */}
            <section className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <h2 className="text-xl font-semibold text-slate-900">Stray Reports</h2>
                    </div>
                    <p className="text-sm text-slate-500">Track your reported stray animals</p>
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded-full">
                    <p className="text-sm font-medium text-slate-600">{reports.length} reports</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No stray reports found</p>
                    <p className="text-sm text-slate-400 mt-1">Your reported strays will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => {
                      const StatusIcon = getStatusIcon(report.reportStatus);
                      const chatTargetUserId = getReportChatTargetId(report);
                      return (
                        <div
                          key={report._id}
                          className="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-slate-900 text-lg">{report.name}</h3>
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClasses(report.reportStatus)}`}>
                                    <StatusIcon className="h-3 w-3" />
                                    {formatStatus(report.reportStatus)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {report.region}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {getTimeAgo(report.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedReport(selectedReport === report._id ? null : report._id)}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <ChevronRight className={`h-5 w-5 transform transition-transform ${selectedReport === report._id ? "rotate-90" : ""}`} />
                              </button>
                            </div>

                            <p className="mt-3 text-sm text-slate-600 line-clamp-2">{report.description}</p>

                            {/* Expandable Details */}
                            {selectedReport === report._id && (
                              <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
                                <div className="space-y-3">
                                  <div className="bg-slate-50 rounded-xl p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Report Details</p>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="font-medium text-slate-700">Type:</span> {report.type}</p>
                                      <p><span className="font-medium text-slate-700">Breed:</span> {report.breed}</p>
                                      <p><span className="font-medium text-slate-700">Age:</span> {report.age}</p>
                                      <p><span className="font-medium text-slate-700">Assigned Shelter:</span> {report.shelterDetails?.name || report.shelterDetails?.city || "Awaiting assignment"}</p>
                                      {report.reportLocation && (
                                        <p><span className="font-medium text-slate-700">Location:</span> {report.reportLocation}</p>
                                      )}
                                      {report.reportIssueReason && (
                                        <p className="text-amber-700"><span className="font-medium">Issue Reason:</span> {report.reportIssueReason}</p>
                                      )}
                                      <p className="text-xs text-slate-400">Reported on {new Date(report.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                                    </div>
                                  </div>
                                  {(report.pictures?.length || report.image) && (
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Attached Images</p>
                                      <div className="flex gap-2">
                                        {(report.pictures?.length ? report.pictures : [report.image]).filter(Boolean).slice(0, 3).map((img, idx) => (
                                          <img
                                            key={idx}
                                            src={img}
                                            alt={report.name}
                                            className="h-20 w-20 rounded-xl object-cover border border-slate-200"
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {chatTargetUserId ? (
                                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shelter Chat</p>
                                          <p className="mt-1 text-sm text-slate-600">
                                            Message the shelter handling this stray report for updates or clarification.
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                                          onClick={() =>
                                            setActiveChatApplicationId(
                                              activeChatApplicationId === report._id ? null : report._id
                                            )
                                          }
                                        >
                                          <MessageCircle className="h-4 w-4" />
                                          {activeChatApplicationId === report._id ? "Hide Chat" : "Chat with Shelter"}
                                        </button>
                                      </div>

                                      {activeChatApplicationId === report._id ? (
                                        <div className="mt-4">
                                          <AdminChatPanel
                                            currentUser={user}
                                            targetUserId={chatTargetUserId}
                                            title={`Chat with ${report.shelterDetails?.name || "Shelter"}`}
                                          />
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            )}

                            <div className="mt-4">
                              <div className="flex gap-3">
                                {chatTargetUserId ? (
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                                    onClick={() => {
                                      setSelectedReport(report._id);
                                      setActiveChatApplicationId(
                                        activeChatApplicationId === report._id ? null : report._id
                                      );
                                    }}
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    {activeChatApplicationId === report._id ? "Hide Chat" : "Chat with Shelter"}
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                                  onClick={() => deleteReport(report._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete Report
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Helpful Tips Section */}
        {!isLoading && (applications.length > 0 || reports.length > 0) && (
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Need assistance?</p>
                <p className="text-sm text-slate-600 mt-1">
                  If you have questions about your application status, please contact the shelter directly.
                  Approved applications will receive further instructions via email and chat.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationStatus;
