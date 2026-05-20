import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { 
  ChevronDown, 
  ChevronUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Image as ImageIcon,
  Search,
  Filter,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  RefreshCw
} from "lucide-react";
import MainNavbar from "@/components/main-navbar/MainNavbar";
import NotificationsPanel from "@/components/common/NotificationsPanel";
import AdminChatPanel from "@/components/common/AdminChatPanel";
import { useToast } from "@/hooks/use-toast";
import { registerSocketUser, subscribeToSocketEvent } from "@/lib/socket";

import { apiUrl } from "@/lib/api";
const categoryOptions = ["dog", "cat", "bird", "hamster", "fish"];
const brandOptions = ["royal-canin", "purina", "hill's", "blue-buffalo", "orijen"];

const initialProduct = {
  title: "",
  description: "",
  category: "dog",
  brand: "royal-canin",
  price: "",
  salePrice: "",
  totalStock: "",
  image: null,
};

const statusColors = {
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  out_for_delivery: "bg-orange-100 text-orange-700 border-orange-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
};

const statusIcons = {
  confirmed: Clock,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle,
};

function SellerAdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState(initialProduct);
  const [editingProductId, setEditingProductId] = useState("");
  const [openOrderId, setOpenOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("inventory");

  const fetchDashboardData = async () => {
    try {
      const [productsResponse, ordersResponse, analyticsResponse] = await Promise.all([
        axios.get(apiUrl(`/api/shop/products/get?sellerId=${user?.id || ""}&sortBy=newest`), { withCredentials: true }),
        axios.get(apiUrl("/api/shop/order/admin/list"), { withCredentials: true }),
        axios.get(apiUrl("/api/shop/order/admin/analytics"), { withCredentials: true }),
      ]);

      setProducts(productsResponse.data?.data || []);
      setOrders(ordersResponse.data?.data || []);
      setAnalytics(analyticsResponse.data?.analytics || null);
      setCustomers(analyticsResponse.data?.customers || []);
      setPayments(analyticsResponse.data?.payments || []);
    } catch (error) {
      setProducts([]);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    registerSocketUser(user);

    const handleRealtimeOrderChange = () => {
      fetchDashboardData();
    };

    const unsubscribeCreated = subscribeToSocketEvent("order:created", handleRealtimeOrderChange);
    const unsubscribeUpdated = subscribeToSocketEvent("order:updated", handleRealtimeOrderChange);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, [user?.id]);

  const submitProduct = async (event) => {
    event.preventDefault();
    if (!formData.title || !formData.brand || !formData.category || !formData.price || !formData.totalStock) {
      toast({
        title: "Please complete all required product fields",
        variant: "destructive",
      });
      return;
    }
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        payload.append(key, value);
      }
    });

    const url = editingProductId
      ? apiUrl(`/api/shop/products/update/${editingProductId}`)
      : apiUrl("/api/shop/products/create");
    const method = editingProductId ? "put" : "post";

    try {
      await axios[method](url, payload, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: editingProductId ? "Product updated successfully" : "Product added successfully",
      });
      setFormData(initialProduct);
      setEditingProductId("");
      fetchDashboardData();
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Unable to save product",
        variant: "destructive",
      });
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(apiUrl(`/api/shop/products/delete/${productId}`), {
        withCredentials: true,
      });
      toast({
        title: "Product deleted successfully",
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Unable to delete product",
        variant: "destructive",
      });
    }
  };

  const updateOrder = async (orderId, orderStatus) => {
    await axios.put(
      apiUrl(`/api/shop/order/admin/update/${orderId}`),
      { orderStatus, paymentStatus: orderStatus === "delivered" ? "paid" : undefined },
      { withCredentials: true }
    );
    fetchDashboardData();
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "N/A";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
    }

    return parsed.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortId = (value, size = 6) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    const normalized = String(value);
    return normalized.length > size ? normalized.slice(-size) : normalized;
  };

  const resetProductForm = () => {
    setFormData(initialProduct);
    setEditingProductId("");
  };

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { 
      label: "Total Revenue", 
      value: `Rs ${analytics?.totalRevenue?.toLocaleString() || 0}`, 
      icon: DollarSign, 
      gradient: "from-emerald-500 to-teal-600",
      change: "+12.5%"
    },
    { 
      label: "Total Orders", 
      value: analytics?.totalOrders?.toLocaleString() || 0, 
      icon: ShoppingCart, 
      gradient: "from-blue-500 to-indigo-600",
      change: "+8.2%"
    },
    { 
      label: "Active Products", 
      value: analytics?.totalProducts?.toLocaleString() || 0, 
      icon: Package, 
      gradient: "from-purple-500 to-pink-600",
      change: "+3.1%"
    },
    { 
      label: "Total Customers", 
      value: customers.length, 
      icon: Users, 
      gradient: "from-orange-500 to-red-600",
      change: "+15.3%"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <MainNavbar />
      
      {/* Animated Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section with Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Seller Dashboard
                  </h1>
                  <p className="text-slate-500 mt-1">Manage your store operations efficiently</p>
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
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
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
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Performance</p>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Commerce Operations</h2>
              <p className="text-slate-300 text-sm">Real-time insights and analytics for your store</p>
              
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <p className="text-sm text-slate-300">Avg. Order Value</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    Rs {analytics?.totalOrders ? Math.round(analytics.totalRevenue / analytics.totalOrders) : 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <p className="text-sm text-slate-300">Completion Rate</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {orders.length ? Math.round((orders.filter(o => o.orderStatus === "delivered").length / orders.length) * 100) : 0}%
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 hover:bg-white/15 transition-all duration-200">
                  <p className="text-sm text-slate-300">Active Orders</p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {orders.filter(o => o.orderStatus !== "delivered").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <NotificationsPanel />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex gap-6">
              {[
                { id: "inventory", label: "Inventory Management", icon: Package },
                { id: "add-product", label: editingProductId ? "Edit Product" : "Add Product", icon: editingProductId ? Edit2 : Plus },
                { id: "orders", label: "Orders", icon: ShoppingCart },
                { id: "chat", label: "Support Chat", icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "border-slate-800 text-slate-800"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Product Inventory</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your product catalog</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No products found</p>
                    <button
                      onClick={() => setActiveTab("add-product")}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product, index) => (
                      <div
                        key={product._id}
                        className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-12 w-12 text-slate-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.totalStock > 10 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                            }`}>
                              {product.totalStock > 0 ? `${product.totalStock} in stock` : "Out of stock"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1">
                            {product.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 capitalize">{product.category}</span>
                            <span className="text-xs text-slate-300">â€¢</span>
                            <span className="text-xs text-slate-500 capitalize">{product.brand}</span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-2">
                            {product.salePrice > 0 ? (
                              <>
                                <span className="text-lg font-bold text-emerald-600">Rs {product.salePrice}</span>
                                <span className="text-sm text-slate-400 line-through">Rs {product.price}</span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-slate-900">Rs {product.price}</span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{product.description || "No description"}</p>
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                              onClick={() => {
                                setEditingProductId(product._id);
                                setFormData({
                                  title: product.title || "",
                                  description: product.description || "",
                                  category: product.category || "",
                                  brand: product.brand || "",
                                  price: product.price || "",
                                  salePrice: product.salePrice || "",
                                  totalStock: product.totalStock || "",
                                  image: null,
                                });
                                setActiveTab("add-product");
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 transition-colors"
                              onClick={() => deleteProduct(product._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add/Edit Product Tab */}
          {activeTab === "add-product" && (
            <form onSubmit={submitProduct} className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {editingProductId ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {editingProductId ? "Update product details" : "Fill in the details to add a new product"}
                  </p>
                </div>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Title *</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-shadow"
                    placeholder="Enter product title"
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                    value={formData.category}
                    onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                  >
                    {categoryOptions.map((category) => (
                      <option key={category} value={category} className="capitalize">{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                    value={formData.brand}
                    onChange={(event) => setFormData({ ...formData, brand: event.target.value })}
                  >
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand} className="capitalize">{brand}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (Rs) *</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price (Optional)</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.salePrice}
                    onChange={(event) => setFormData({ ...formData, salePrice: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.totalStock}
                    onChange={(event) => setFormData({ ...formData, totalStock: event.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Image</label>
                  <div className="mt-1 flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                      <ImageIcon className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-700">Choose File</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={(event) => setFormData({ ...formData, image: event.target.files?.[0] || null })}
                      />
                    </label>
                    {formData.image && (
                      <span className="text-sm text-slate-600">{formData.image.name}</span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-white font-medium hover:bg-slate-800 transition-colors shadow-sm"
                  type="submit"
                >
                  {editingProductId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingProductId ? "Update Product" : "Add Product"}
                </button>
                {editingProductId && (
                  <button
                    className="rounded-xl border border-slate-200 px-6 py-2.5 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    type="button"
                    onClick={resetProductForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-semibold text-slate-900">Order Management</h2>
                <p className="text-sm text-slate-500 mt-1">Track and manage customer orders</p>
              </div>
              <div className="p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const StatusIcon = statusIcons[order.orderStatus] || AlertCircle;
                      return (
                        <div
                          key={order._id}
                          className="rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-5 bg-white">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 rounded-xl">
                                  <Package className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">Order #{order._id.slice(-8)}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-slate-500">{order.user?.userName || "Customer"}</span>
                                    <span className="text-xs text-slate-300">â€¢</span>
                                    <span className="text-sm text-slate-600 font-medium">Rs {order.totalAmount?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusColors[order.orderStatus] || "bg-slate-100 text-slate-700"}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {order.orderStatus?.replace(/_/g, " ").toUpperCase() || "PENDING"}
                                </div>
                                <select
                                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                  value={order.orderStatus}
                                  onChange={(event) => updateOrder(order._id, event.target.value)}
                                >
                                  <option value="confirmed">Confirmed</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="out_for_delivery">Out for delivery</option>
                                  <option value="delivered">Delivered</option>
                                </select>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                  onClick={() => setOpenOrderId(openOrderId === order._id ? null : order._id)}
                                >
                                  {openOrderId === order._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  {openOrderId === order._id ? "Hide Details" : "View Details"}
                                </button>
                              </div>
                            </div>

                            {/* Order Details Expandable Section */}
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                openOrderId === order._id ? "mt-5 max-h-[2000px]" : "max-h-0"
                              }`}
                            >
                              <div className="border-t border-slate-100 pt-5 mt-2">
                                <div className="grid gap-6 md:grid-cols-2">
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                      <Users className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Information</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {order.user?.email || "N/A"}</p>
                                          <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {order.addressInfo?.phone || "N/A"}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Shipping Address</p>
                                        <p className="mt-2 text-sm text-slate-700">{order.addressInfo?.address || "N/A"}</p>
                                        <p className="text-sm text-slate-600 mt-1">{order.addressInfo?.city}, {order.addressInfo?.pincode}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                      <CreditCard className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payment Details</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p><span className="font-medium">Method:</span> {order.payment?.method?.toUpperCase() || "N/A"}</p>
                                          <p><span className="font-medium">Status:</span> {order.payment?.status || "N/A"}</p>
                                          <p><span className="font-medium">Amount:</span> Rs {order.payment?.amount || order.totalAmount}</p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order Timeline</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p>Ordered: {formatDateTime(order.orderDate || order.createdAt)}</p>
                                          <p>Last Update: {formatDateTime(order.updatedAt)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-5">
                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Order Items</p>
                                  <div className="space-y-2">
                                    {(order.cartItems || []).map((item, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                          <p className="font-medium text-slate-800">{item.title || "Product"}</p>
                                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-slate-900">Rs {item.price}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
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

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden">
              <AdminChatPanel currentUser={user} />
            </div>
          )}
        </div>

        {/* Customers & Payments Section (visible in all tabs) */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Recent Customers</h2>
            </div>
            {customers.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No customer data available</p>
            ) : (
              <div className="space-y-3">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-medium text-slate-800">{customer.userName}</p>
                      <p className="text-xs text-slate-500">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">{customer.city || "Location not set"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-3xl bg-white shadow-xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Recent Payments</h2>
            </div>
            {payments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No payment records</p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div>
                      <p className="font-medium text-slate-800">Order #{formatShortId(payment.orderId)}</p>
                      <p className="text-xs text-slate-500 capitalize">{payment.method || "unknown"} • {payment.status || "pending"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">Rs {payment.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerAdminDashboard;

