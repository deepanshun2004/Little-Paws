import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { getImageSrc } from "@/lib/image";
import { Heart } from "lucide-react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
  handleWishlist,
}) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <div onClick ={() => handleGetProductDetails(product?._id)}>
        <div className="relative">
          <img
            src={getImageSrc(product?.image, product?.title || "Product")}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
          {/* {product?.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              {`Only ${product?.totalStock} items left`}
            </Badge>
          ) :  */}
           {product?.salePrice > 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          ) : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleWishlist?.(product?._id);
            }}
            className={`absolute right-2 top-2 rounded-full p-2 ${
              product?.wishlisted ? "bg-rose-500 text-white" : "bg-white/90 text-slate-700"
            }`}
          >
            <Heart className={`h-4 w-4 ${product?.wishlisted ? "fill-current" : ""}`} />
          </button>
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[16px] text-muted-foreground">
              {product?.category}
            </span>
            <span className="text-[16px] text-muted-foreground">
              {product?.brand}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              Rs {product?.price}
            </span>
            {product?.salePrice > 0 ? (
              <span className="text-lg font-semibold text-primary">
                Rs {product?.salePrice}
              </span>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter>
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full"
          >
            Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
