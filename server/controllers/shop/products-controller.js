const Product = require("../../models/Product");
const Review = require("../../models/Review");
const Wishlist = require("../../models/Wishlist");
const User = require("../../models/User");
const { getFileUrl, deleteImageByUrl } = require("../../helpers/upload");

const categoryAliases = {
  birds: "bird",
  fishes: "fish",
  dogs: "dog",
  cats: "cat",
};

const normalizeCategory = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  return categoryAliases[normalized] || normalized;
};

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

async function enrichProduct(product, userId = null) {
  const reviews = await Review.find({ productId: product._id });
  const reviewUsers = await Promise.all(
    reviews.map((review) => User.findById(review.userId))
  );
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : Number(product.averageReview || 0);
  const wishlisted = userId
    ? Boolean(await Wishlist.findOne({ userId, productId: product._id }))
    : false;

  return {
    ...product,
    averageReview: Number(averageRating.toFixed(1)),
    reviews: reviews.map((review, index) => ({
      ...review,
      user: reviewUsers[index]
        ? {
            _id: reviewUsers[index]._id,
            userName: reviewUsers[index].userName,
          }
        : null,
    })),
    wishlisted,
  };
}

const getFilteredProducts = async (req, res) => {
  try {
    const {
      category = [],
      brand = [],
      sortBy = "price-lowtohigh",
      search = "",
      minPrice,
      maxPrice,
      availability,
      userId,
      sellerId,
    } = req.query;

    const categoryFilters = category.length
      ? category.split(",").map((item) => normalizeCategory(item))
      : [];
    const brandFilters = brand.length
      ? brand.split(",").map((item) => String(item).trim().toLowerCase())
      : [];
    const min = parseOptionalNumber(minPrice);
    const max = parseOptionalNumber(maxPrice);
    const searchTerm = String(search || "").trim().toLowerCase();
    const sellerFilter = String(sellerId || "").trim();

    const products = await Product.find({});
    const filteredProducts = products
      .filter((product) => {
        const matchesCategory =
          !categoryFilters.length || categoryFilters.includes(normalizeCategory(product.category));
        const matchesBrand =
          !brandFilters.length || brandFilters.includes(String(product.brand || "").trim().toLowerCase());
        const effectivePrice = Number(product.salePrice > 0 ? product.salePrice : product.price);
        const matchesMin = min === null || effectivePrice >= min;
        const matchesMax = max === null || effectivePrice <= max;
        const matchesAvailability =
          !availability ||
          (availability === "in_stock" ? Number(product.totalStock) > 0 : Number(product.totalStock) <= 0);
        const matchesSearch =
          !searchTerm ||
          [product.title, product.description, product.category, product.brand]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(searchTerm));
        const matchesSeller = !sellerFilter || String(product.sellerId || "") === sellerFilter;

        return matchesCategory && matchesBrand && matchesMin && matchesMax && matchesAvailability && matchesSearch && matchesSeller;
      })
      .sort((left, right) => {
        switch (sortBy) {
          case "price-lowtohigh":
            return Number(left.price) - Number(right.price);
          case "price-hightolow":
            return Number(right.price) - Number(left.price);
          case "title-atoz":
            return (left.title || "").localeCompare(right.title || "");
          case "title-ztoa":
            return (right.title || "").localeCompare(left.title || "");
          case "newest":
            return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
          default:
            return Number(left.price) - Number(right.price);
        }
      });

    res.status(200).json({
      success: true,
      data: await Promise.all(filteredProducts.map((product) => enrichProduct(product, userId))),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: await enrichProduct(product, userId),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { title, description, category, brand, price, salePrice, totalStock } = req.body;
    if (!title || !category || !brand || !price || totalStock === undefined) {
      return res.status(400).json({ success: false, message: "Missing required product fields" });
    }

    let image = null;
    if (req.file) {
      image = getFileUrl(req, req.file);
    }

    const product = new Product({
      image,
      title,
      description,
      category: normalizeCategory(category),
      brand,
      price: Number(price),
      salePrice: Number(salePrice || 0),
      totalStock: Number(totalStock),
      averageReview: 0,
      availability: Number(totalStock) > 0 ? "in_stock" : "out_of_stock",
      sellerId: req.user.id,
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to create product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (String(product.sellerId || "") !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can update only your own products." });
    }

    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.salePrice !== undefined) updates.salePrice = Number(updates.salePrice);
    if (updates.totalStock !== undefined) {
      updates.totalStock = Number(updates.totalStock);
      updates.availability = updates.totalStock > 0 ? "in_stock" : "out_of_stock";
    }
    if (updates.category) {
      updates.category = normalizeCategory(updates.category);
    }

    if (req.file) {
      if (product.image) {
        await deleteImageByUrl(product.image);
      }
      updates.image = getFileUrl(req, req.file);
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    if (String(product.sellerId || "") !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can delete only your own products." });
    }

    await Product.findByIdAndDelete(req.params.id);

    if (product.image) {
      await deleteImageByUrl(product.image);
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to delete product" });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const existingReview = await Review.findOne({ productId: req.params.id, userId });
    if (existingReview) {
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      const review = new Review({
        productId: req.params.id,
        userId,
        rating: Number(rating),
        comment,
      });
      await review.save();
    }

    const reviews = await Review.find({ productId: req.params.id });
    product.averageReview = reviews.length
      ? Number(
          (
            reviews.reduce((sum, currentReview) => sum + Number(currentReview.rating || 0), 0) /
            reviews.length
          ).toFixed(1)
        )
      : 0;
    await product.save();

    res.status(200).json({ success: true, data: await enrichProduct(product, userId) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to save review" });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const existingWishlist = await Wishlist.findOne({ userId, productId });

    if (existingWishlist) {
      await Wishlist.findByIdAndDelete(existingWishlist._id);
      return res.status(200).json({ success: true, wishlisted: false });
    }

    const wishlistItem = new Wishlist({ userId, productId });
    await wishlistItem.save();
    res.status(201).json({ success: true, wishlisted: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to update wishlist" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ userId: req.params.userId });
    const products = await Promise.all(
      wishlistItems.map((wishlistItem) => Product.findById(wishlistItem.productId))
    );
    const validProducts = products.filter(Boolean);
    res.status(200).json({
      success: true,
      data: await Promise.all(validProducts.map((product) => enrichProduct(product, req.params.userId))),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Unable to fetch wishlist" });
  }
};

module.exports = {
  getFilteredProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  toggleWishlist,
  getWishlist,
};
