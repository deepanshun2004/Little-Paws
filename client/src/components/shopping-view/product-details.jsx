import { Heart, StarIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { getImageSrc } from "@/lib/image";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { fetchWishlist, saveProductReview, toggleWishlistItem } from "@/store/shop/products-slice";
import AdminChatPanel from "@/components/common/AdminChatPanel";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [showChat, setShowChat] = useState(false);

  function handleAddtoCart(getCurrentProductId) {
    if (!user?.id) {
      toast({
        title: "Please log in to add items to cart",
        variant: "destructive",
      });
      navigate("/auth/login");
      return;
    }

    dispatch(addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  const submitReview = async () => {
    if (!user?.id || !productDetails?._id) {
      return;
    }

    await dispatch(
      saveProductReview({
        productId: productDetails._id,
        reviewData: {
          ...review,
          userId: user.id,
        },
      })
    );
    setReview({ rating: 5, comment: "" });
  };

  const handleWishlist = () => {
    if (!user?.id || !productDetails?._id) {
      return;
    }

    dispatch(toggleWishlistItem({ userId: user.id, productId: productDetails._id })).then(() => {
      dispatch(fetchWishlist(user.id));
    });
  };

  const ratingCount = Math.round(Number(productDetails?.averageReview || 0));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90vw] gap-8 sm:max-w-[80vw] sm:grid-cols-2 sm:p-12 lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={getImageSrc(productDetails?.image, productDetails?.title || "Product")}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">{productDetails?.title}</h1>
              <p className="mt-4 mb-5 text-2xl text-muted-foreground">{productDetails?.description}</p>
            </div>
            <button
              type="button"
              className={`rounded-full p-3 ${
                productDetails?.wishlisted ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-700"
              }`}
              onClick={handleWishlist}
            >
              <Heart className={`h-5 w-5 ${productDetails?.wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p
              className={`text-3xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              Rs {productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 ? (
              <p className="text-2xl font-bold text-muted-foreground">Rs {productDetails?.salePrice}</p>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((value) => (
                <StarIcon
                  key={value}
                  className={`h-5 w-5 ${value <= ratingCount ? "fill-primary text-primary" : "text-slate-300"}`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">({productDetails?.averageReview || 0})</span>
          </div>
          <div className="mt-2 text-sm text-slate-500">
            {productDetails?.totalStock > 0 ? `${productDetails.totalStock} in stock` : "Currently out of stock"}
          </div>
          <div className="mt-5 mb-5">
            <Button className="w-full" onClick={() => handleAddtoCart(productDetails?._id)}>
              Add to Cart
            </Button>
            {user?.role === "user" && productDetails?.sellerId ? (
              <Button variant="outline" className="mt-3 w-full" onClick={() => setShowChat((current) => !current)}>
                Need help? Chat with Seller
              </Button>
            ) : null}
          </div>
          <Separator />
          {showChat && user?.role === "user" && productDetails?.sellerId ? (
            <div className="mt-6">
              <AdminChatPanel
                currentUser={user}
                targetUserId={productDetails.sellerId}
                title="Chat with Seller"
              />
            </div>
          ) : null}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Reviews & Ratings</h3>
            <div className="mt-4 space-y-3">
              {productDetails?.reviews?.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{item.user?.userName || "Anonymous"}</p>
                    <p className="text-sm text-slate-500">{item.rating}/5</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.comment || "No review comment."}</p>
                </div>
              ))}
            </div>
            {user?.id ? (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex gap-3">
                  <select
                    className="rounded-xl border border-slate-300 px-3 py-2"
                    value={review.rating}
                    onChange={(event) => setReview((current) => ({ ...current, rating: Number(event.target.value) }))}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} Stars
                      </option>
                    ))}
                  </select>
                  <input
                    className="flex-1 rounded-xl border border-slate-300 px-3 py-2"
                    placeholder="Write your review"
                    value={review.comment}
                    onChange={(event) => setReview((current) => ({ ...current, comment: event.target.value }))}
                  />
                  <Button onClick={submitReview}>Submit</Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
