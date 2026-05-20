import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Address from "@/components/shopping-view/address";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/hooks/use-toast";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { useNavigate } from "react-router-dom";
import banner2 from "@/assets/banner2.webp";
import banner4 from "@/assets/banner4.webp";
import banner5 from "@/assets/banner5.webp";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  Shield,
  Clock,
  CheckCircle,
  MapPin,
  Wallet,
  IndianRupee,
  ArrowLeft,
  Package,
} from "lucide-react";

import { apiUrl } from "@/lib/api";
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { isLoading } = useSelector((state) => state.shopOrder);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const slides = [banner4, banner2, banner5];

  const totalCartAmount =
    cartItems?.items?.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0 ? currentItem.salePrice : currentItem.price) *
              currentItem.quantity,
          0
        )
      : 0;

  const deliveryCharge = totalCartAmount > 500 ? 0 : 50;
  const totalAmount = totalCartAmount + deliveryCharge;

  function buildOrderPayload() {
    return {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: (cartItems?.items || []).map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price: singleCartItem?.salePrice > 0 ? singleCartItem.salePrice : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      totalAmount: totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentMethod,
    };
  }

  async function placeOrder() {
    if (!cartItems?.items?.length) {
      toast({
        title: "Your cart is empty",
        description: "Please add items to proceed with checkout",
        variant: "destructive",
      });
      return;
    }

    if (!currentSelectedAddress) {
      toast({
        title: "Shipping address required",
        description: "Please select or add a shipping address to proceed",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "online") {
      setIsSubmittingOrder(true);
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        toast({ title: "Razorpay SDK failed to load. Are you online?", variant: "destructive" });
        setIsSubmittingOrder(false);
        return;
      }

      try {
        const result = await axios.post(
          apiUrl("/api/shop/payment/create-order"),
          { totalAmount },
          { withCredentials: true }
        );

        if (!result.data.success) {
          toast({ title: "Failed to create Razorpay order", description: result.data.message || "Unknown error", variant: "destructive" });
          setIsSubmittingOrder(false);
          return;
        }

        const options = {
          key: result.data.keyId,
          amount: result.data.amount.toString(),
          currency: result.data.currency,
          name: "LITTLE PAWS",
          description: "Order Payment",
          order_id: result.data.orderId,
          handler: async function (response) {
            try {
              const verifyResult = await axios.post(
                apiUrl("/api/shop/payment/verify"),
                {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                },
                { withCredentials: true }
              );

              if (verifyResult.data.success) {
                const finalOrderPayload = {
                  ...buildOrderPayload(),
                  paymentId: verifyResult.data.paymentId,
                  mockPaymentStatus: "paid", // satisfy backend logic
                };

                const resultAction = await dispatch(createNewOrder(finalOrderPayload));
                if (resultAction?.payload?.success) {
                  if (user?.id) {
                    await dispatch(fetchCartItems(user.id));
                  }
                  setIsSubmittingOrder(false);
                  toast({
                    title: "Payment Successful! 🎉",
                    description: "Your order has been placed.",
                  });
                  navigate("/shop/account");
                } else {
                  setIsSubmittingOrder(false);
                  toast({ title: "Order save failed", variant: "destructive" });
                }
              } else {
                setIsSubmittingOrder(false);
                toast({ title: "Payment verification failed", variant: "destructive" });
              }
            } catch (err) {
              setIsSubmittingOrder(false);
              toast({ title: "Verification Error", description: err.message, variant: "destructive" });
            }
          },
          prefill: {
            name: user?.userName || "User",
            email: user?.email || "test@test.com",
          },
          theme: {
            color: "#4f46e5",
          },
          modal: {
            ondismiss: function () {
              setIsSubmittingOrder(false);
              toast({ title: "Payment Cancelled", variant: "default" });
            },
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        setIsSubmittingOrder(false);
        const errorMessage = err.response?.data?.message || err.message;
        toast({ title: "Payment Error", description: errorMessage, variant: "destructive" });
      }
    } else {
      setIsSubmittingOrder(true);
      const resultAction = await dispatch(
        createNewOrder({ ...buildOrderPayload(), mockPaymentStatus: "pending" })
      );
      const payload = resultAction?.payload;

      if (!payload?.success) {
        setIsSubmittingOrder(false);
        toast({
          title: "Order failed",
          description: payload?.message || resultAction?.error?.message || "Unable to place order",
          variant: "destructive",
        });
        return;
      }

      if (user?.id) {
        await dispatch(fetchCartItems(user.id));
      }

      setIsSubmittingOrder(false);
      toast({
        title: "Order placed successfully! 🎉",
        description: "Thank you for your purchase. You can track your order in the Orders section.",
      });
      navigate("/shop/account");
    }
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="relative h-[240px] w-full overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 transform ${
              activeSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(99, 102, 241, 0.6)), url(${slide})`,
            }}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm font-medium">Secure Checkout</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Complete Your Order</h1>
            <p className="text-white/90 text-sm">Review your items and proceed to payment</p>
          </div>
        </div>

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

      <div className="container mx-auto px-4 pt-6">
        <button
          onClick={() => navigate("/shop/cart")}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Cart</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Order Items</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1">{cartItems?.items?.length || 0} items in your cart</p>
            </div>
            <div className="p-5">
              {cartItems?.items?.length > 0 ? (
                <div className="space-y-4">
                  {cartItems.items.map((item) => (
                    <UserCartItemsContent key={item.productId} cartItem={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Your cart is empty</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/shop/listing")}
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Shipping Address</h2>
                </div>
                <p className="text-sm text-slate-500 mt-1">Select where you want your order delivered</p>
              </div>
              <div className="p-5">
                <Address
                  selectedId={currentSelectedAddress?._id}
                  setCurrentSelectedAddress={setCurrentSelectedAddress}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden sticky top-24">
              <div className="border-b border-slate-100 p-5">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>Rs {totalCartAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Delivery Charge</span>
                  </div>
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600">Free</span>
                  ) : (
                    <span>Rs {deliveryCharge}</span>
                  )}
                </div>

                {deliveryCharge > 0 && totalCartAmount < 500 && (
                  <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
                    Add items worth Rs {500 - totalCartAmount} more to get free delivery!
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-lg font-bold text-slate-900">
                    <span>Total Amount</span>
                    <span>Rs {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold text-slate-900">Payment Method</h3>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-slate-700">Cash on Delivery</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Pay when you receive your order</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "online"}
                      onChange={() => setPaymentMethod("online")}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-slate-700">Online Payment</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Pay securely using card, UPI, or netbanking</p>
                    </div>
                  </label>

                </div>
              </div>

              <div className="border-t border-slate-100 p-5 space-y-3">
                <Button
                  className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading || isSubmittingOrder || !cartItems?.items?.length}
                  onClick={placeOrder}
                >
                  {isSubmittingOrder ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Placing Order...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Confirm Order • Rs {totalAmount.toLocaleString()}</span>
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/shop/account")}
                >
                  View My Orders
                </Button>
              </div>

              <div className="bg-slate-50 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span>Secure Checkout • 100% Safe Shopping</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
                  <Clock className="h-3 w-3" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
