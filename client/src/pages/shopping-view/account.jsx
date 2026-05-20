import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shopping-view/address";
import banner2 from "@/assets/banner2.webp";
import banner4 from "@/assets/banner4.webp";
import banner5 from "@/assets/banner5.webp";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "@/store/shop/products-slice";
import { getAllOrdersByUserId, getOrderDetails, resetOrderDetails } from "@/store/shop/order-slice";
import NotificationsPanel from "@/components/common/NotificationsPanel";
import AdminChatPanel from "@/components/common/AdminChatPanel";
import ShoppingOrderDetailsView from "@/components/shopping-view/order-details";
import { Dialog } from "@/components/ui/dialog";
import { registerSocketUser, subscribeToSocketEvent } from "@/lib/socket";
import { User, Package, MapPin, Heart, MessageCircle, Clock, Truck, CheckCircle, XCircle, AlertCircle, ChevronRight } from "lucide-react";

// Custom Orders Component with color-coded statuses
function CustomOrders() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails, isLoading } = useSelector((state) => state.shopOrder);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const formatShortId = (value, size = 8) => {
    if (value === null || value === undefined) {
      return "N/A";
    }

    const normalized = String(value);
    return normalized.length > size ? normalized.slice(-size) : normalized;
  };

  const handleFetchOrderDetails = (orderId) => {
    dispatch(getOrderDetails(orderId));
    setOpenDetailsDialog(true);
  };

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    registerSocketUser(user);

    const refreshOrders = async (orderPayload) => {
      if (String(orderPayload?.userId) !== String(user.id)) {
        return;
      }

      dispatch(getAllOrdersByUserId(user.id));

      if (openDetailsDialog && String(orderDetails?._id) === String(orderPayload?._id)) {
        dispatch(getOrderDetails(orderPayload._id));
      }
    };

    const unsubscribeCreated = subscribeToSocketEvent("order:created", refreshOrders);
    const unsubscribeUpdated = subscribeToSocketEvent("order:updated", refreshOrders);

    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, [dispatch, openDetailsDialog, orderDetails?._id, user?.id]);
  
  const getStatusStyle = (status) => {
    const statusMap = {
      confirmed: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: Clock,
        label: "Confirmed"
      },
      shipped: {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: Truck,
        label: "Shipped"
      },
      out_for_delivery: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: Truck,
        label: "Out for Delivery"
      },
      delivered: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: CheckCircle,
        label: "Delivered"
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: XCircle,
        label: "Cancelled"
      },
      pending: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: AlertCircle,
        label: "Pending"
      }
    };
    
    return statusMap[status?.toLowerCase()] || statusMap.pending;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <p className="text-slate-500">Loading your orders...</p>
      </div>
    );
  }

  if (!orderList || orderList.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No orders yet</p>
        <a
          href="/shop/listing"
          className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Start Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orderList.map((order) => {
        const statusStyle = getStatusStyle(order.orderStatus);
        const StatusIcon = statusStyle.icon;
        
        return (
          <div key={order._id} className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Package className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Order #{formatShortId(order._id)}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                  <StatusIcon className="h-4 w-4" />
                  <span>{statusStyle.label}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="space-y-3">
                  {order.cartItems?.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-slate-800">Rs {item.price}</p>
                    </div>
                  ))}
                  {order.cartItems?.length > 2 && (
                    <p className="text-sm text-slate-500 text-center">
                      +{order.cartItems.length - 2} more items
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-xl font-bold text-slate-900">Rs {order.totalAmount?.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleFetchOrderDetails(order._id)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <Dialog
        open={openDetailsDialog}
        onOpenChange={(value) => {
          setOpenDetailsDialog(value);
          if (!value) {
            dispatch(resetOrderDetails());
          }
        }}
      >
        <ShoppingOrderDetailsView orderDetails={orderDetails} />
      </Dialog>
    </div>
  );
}

function ShoppingAccount() {
  const slides = [banner2, banner4, banner5];
  const [activeSlide, setActiveSlide] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.shopProducts);
  const { orderList } = useSelector((state) => state.shopOrder);

  const totalOrders = orderList?.length || 0;
  const deliveredOrders = orderList?.filter((order) => order.orderStatus === "delivered").length || 0;
  const inTransitOrders =
    orderList?.filter((order) =>
      ["confirmed", "shipped", "out_for_delivery"].includes(order.orderStatus)
    ).length || 0;
  const cancelledOrders = orderList?.filter((order) => order.orderStatus === "cancelled").length || 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlist(user.id));
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <div className="relative h-[280px] w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
              activeSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(99, 102, 241, 0.6)), url(${slide})`,
            }}
          />
        ))}
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">My Account</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user?.userName || "Pet Parent"}!</h1>
            <p className="text-white/90 text-sm">Manage your orders, addresses, and preferences</p>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSlide === index ? "w-6 bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main Content Area */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <Tabs defaultValue="orders" className="w-full">
              <div className="border-b border-slate-200 px-6 pt-6">
                <TabsList className="flex flex-wrap gap-1 bg-transparent">
                  <TabsTrigger 
                    value="orders" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-600 hover:text-slate-900 transition-all"
                  >
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="address" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-600 hover:text-slate-900 transition-all"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Address</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="wishlist" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-600 hover:text-slate-900 transition-all"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                    {wishlist.length > 0 && (
                      <span className="ml-1 text-xs bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat" 
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-600 hover:text-slate-900 transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="orders" className="mt-0">
                  <CustomOrders />
                </TabsContent>

                <TabsContent value="address" className="mt-0">
                  <Address />
                </TabsContent>

                <TabsContent value="wishlist" className="mt-0">
                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Your wishlist is empty</p>
                      <a
                        href="/shop/listing"
                        className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Browse Products
                      </a>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {wishlist.map((item) => (
                        <div key={item._id} className="group rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-all">
                          <div className="relative h-48 overflow-hidden bg-slate-100">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {item.salePrice > 0 && (
                              <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                SALE
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h3>
                            <div className="mt-2 flex items-baseline gap-2">
                              {item.salePrice > 0 ? (
                                <>
                                  <span className="text-lg font-bold text-emerald-600">Rs {item.salePrice}</span>
                                  <span className="text-sm text-slate-400 line-through">Rs {item.price}</span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-slate-900">Rs {item.price}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="chat" className="mt-0">
                  <AdminChatPanel
                    currentUser={user}
                    title="Chat with Seller Admin"
                    allowedRoles={["sellerAdmin"]}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NotificationsPanel allowedTypes={["order", "chat"]} />
            
            {/* Order Snapshot */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Order Snapshot</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Total Orders</span>
                  <span className="text-lg font-semibold text-slate-900">{totalOrders}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
                  <span className="text-sm text-emerald-700">Delivered</span>
                  <span className="text-lg font-semibold text-emerald-800">{deliveredOrders}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3">
                  <span className="text-sm text-indigo-700">In Progress</span>
                  <span className="text-lg font-semibold text-indigo-800">{inTransitOrders}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3">
                  <span className="text-sm text-rose-700">Cancelled</span>
                  <span className="text-lg font-semibold text-rose-800">{cancelledOrders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
