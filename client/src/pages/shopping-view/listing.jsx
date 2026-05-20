import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sortOptions } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
  fetchWishlist,
  toggleWishlistItem,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      queryParams.push(`${key}=${encodeURIComponent(value.trim())}`);
    }
  }

  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { productList, productDetails } = useSelector((state) => state.shopProducts);
  const { user } = useSelector((state) => state.auth);
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState({ minPrice: "", maxPrice: "" });

  function handleSort(value) {
    setSort(value);
  }

  function handleFilter(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption],
      };
    } else {
      const indexOfCurrentOption = cpyFilters[getSectionId].indexOf(getCurrentOption);

      if (indexOfCurrentOption === -1) cpyFilters[getSectionId].push(getCurrentOption);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails({ id: getCurrentProductId, userId: user?.id }));
  }

  function handleAddtoCart(getCurrentProductId) {
    if (!user?.id) {
      toast({
        title: "Please log in to add items to cart",
        variant: "destructive",
      });
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

  function handleWishlist(productId) {
    if (!user?.id) {
      toast({
        title: "Please log in to save wishlist items",
        variant: "destructive",
      });
      return;
    }

    dispatch(toggleWishlistItem({ userId: user.id, productId })).then(() => {
      dispatch(fetchWishlist(user.id));
    });
  }

  useEffect(() => {
    const savedFilters = JSON.parse(sessionStorage.getItem("filters")) || {};
    const categoryFromUrl = searchParams.get("category");
    const brandFromUrl = searchParams.get("brand");
    const initialFilters = { ...savedFilters };

    if (categoryFromUrl) {
      initialFilters.category = categoryFromUrl.split(",");
    }
    if (brandFromUrl) {
      initialFilters.brand = brandFromUrl.split(",");
    }

    setFilters(initialFilters);
    setSearch(searchParams.get("search") || "");
    setPriceRange({
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    const createQueryString = createSearchParamsHelper({
      ...filters,
      search,
      ...priceRange,
    });
    setSearchParams(new URLSearchParams(createQueryString));
  }, [filters, priceRange, search, setSearchParams]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {
          ...filters,
          search,
          ...priceRange,
        },
        sortParams: sort,
        userId: user?.id,
      })
    );
  }, [dispatch, sort, filters, search, priceRange, user?.id]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchWishlist(user.id));
    }
  }, [dispatch, user?.id]);

  return (
    <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr] md:p-6">
      <ProductFilter filters={filters} handleFilter={handleFilter} />
      <div className="w-full rounded-lg bg-background shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold">All Products</h2>
            <span className="text-muted-foreground">{productList?.length} Products</span>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Min price"
              type="number"
              value={priceRange.minPrice}
              onChange={(event) => setPriceRange((current) => ({ ...current, minPrice: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              placeholder="Max price"
              type="number"
              value={priceRange.maxPrice}
              onChange={(event) => setPriceRange((current) => ({ ...current, maxPrice: event.target.value }))}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span>Sort by</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem value={sortItem.id} key={sortItem.id}>
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {productList && productList.length > 0
            ? productList.map((productItem) => (
                <ShoppingProductTile
                  key={productItem._id}
                  handleGetProductDetails={handleGetProductDetails}
                  product={productItem}
                  handleAddtoCart={handleAddtoCart}
                  handleWishlist={handleWishlist}
                />
              ))
            : null}
        </div>
        <ProductDetailsDialog
          open={openDetailsDialog}
          setOpen={setOpenDetailsDialog}
          productDetails={productDetails}
        />
      </div>
    </div>
  );
}

export default ShoppingListing;
