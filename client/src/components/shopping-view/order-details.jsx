import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { getImageSrc } from "@/lib/image";

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusClass(status) {
  switch (status) {
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "shipped":
      return "bg-purple-100 text-purple-700";
    case "out_for_delivery":
      return "bg-orange-100 text-orange-700";
    case "delivered":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
    case "failed":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getPaymentStatusLabel(orderDetails) {
  const paymentMethod = String(orderDetails?.paymentMethod || "").toLowerCase();
  const paymentStatus = String(orderDetails?.paymentStatus || "").toLowerCase();
  const orderStatus = String(orderDetails?.orderStatus || "").toLowerCase();

  if (paymentMethod === "cod" && orderStatus === "delivered") {
    return "Done (COD)";
  }

  if (!paymentStatus) {
    return "Pending";
  }

  return paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
}

function DetailRow({ label, value, valueClassName = "" }) {
  return (
    <div className="grid gap-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className={`min-w-0 break-words text-sm text-slate-900 ${valueClassName}`}>{value || "N/A"}</div>
    </div>
  );
}

function ShoppingOrderDetailsView({ orderDetails }) {
  return (
    <DialogContent className="w-[calc(100vw-1rem)] max-w-5xl p-0">
      {orderDetails ? (
        <div className="overflow-hidden rounded-lg bg-white">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <DialogHeader className="pr-10 text-left">
              <DialogTitle className="text-lg">Order Details</DialogTitle>
              <DialogDescription className="text-sm">
                View summary, payment, shipping, and all order items in one place.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="grid max-h-[82vh] gap-0 overflow-hidden lg:grid-cols-[320px_1fr]">
            <div className="border-b border-slate-200 bg-slate-50 p-4 sm:p-5 lg:border-b-0 lg:border-r">
              <div className="grid gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="grid gap-4">
                    <DetailRow label="Order ID" value={orderDetails?._id} />
                    <DetailRow label="Order Date" value={formatDate(orderDetails?.orderDate || orderDetails?.createdAt)} />
                    <DetailRow
                      label="Order Status"
                      value={
                        <Badge className={getStatusClass(orderDetails?.orderStatus)}>
                          {String(orderDetails?.orderStatus || "pending").replace(/_/g, " ")}
                        </Badge>
                      }
                    />
                    <DetailRow label="Payment Method" value={String(orderDetails?.paymentMethod || "N/A").toUpperCase()} />
                    <DetailRow label="Payment Status" value={getPaymentStatusLabel(orderDetails)} />
                    <DetailRow label="Tracking" value={orderDetails?.trackingStatus || orderDetails?.orderStatus} />
                    <DetailRow label="Total Amount" value={`Rs ${orderDetails?.totalAmount || 0}`} valueClassName="font-semibold" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Shipping Info</p>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-700">
                    <p className="break-words">{orderDetails?.addressInfo?.address || "N/A"}</p>
                    <p className="break-words">{orderDetails?.addressInfo?.city || "N/A"}</p>
                    <p className="break-words">{orderDetails?.addressInfo?.pincode || "N/A"}</p>
                    <p className="break-words">{orderDetails?.addressInfo?.phone || "N/A"}</p>
                    {orderDetails?.addressInfo?.notes ? (
                      <p className="break-words pt-2 text-xs text-slate-500">{orderDetails.addressInfo.notes}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Order Items</h3>
                  <p className="text-xs text-slate-500">
                    {(orderDetails?.cartItems || []).length} item{(orderDetails?.cartItems || []).length === 1 ? "" : "s"}
                  </p>
                </div>
                {(orderDetails?.cartItems || []).length > 5 ? (
                  <span className="text-xs text-slate-500">Scroll to view all</span>
                ) : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                <div className="space-y-2">
                  {(orderDetails?.cartItems || []).map((item, index) => (
                    <div
                      key={`${item.productId || item.title || "item"}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={getImageSrc(item.image, item.title || "Product")}
                          alt={item.title}
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{item.title || "Product"}</p>
                          <p className="text-xs text-slate-500">Qty: {item.quantity || 0}</p>
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-900">Rs {item.price || 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-slate-500">Loading order details...</div>
      )}
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
