import { Bird, Cat, ChevronLeftIcon, ChevronRightIcon, Dog, Fish, Rat, PawPrint, Heart, ShoppingBag, Star, TrendingUp, Package, Award } from 'lucide-react';
import banner2 from '../../assets/banner2.webp'
import banner5 from '../../assets/banner5.webp'
import banner4 from '../../assets/banner4.webp'
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ShoppingProductTile from '@/components/shopping-view/product-tile';
import { fetchAllFilteredProducts, fetchProductDetails, fetchWishlist, toggleWishlistItem } from '@/store/shop/products-slice';
import { addToCart } from '@/store/shop/cart-slice';
import { useNavigate } from 'react-router-dom';
import ProductDetailsDialog from '@/components/shopping-view/product-details';
import { fetchCartItems } from '@/store/shop/cart-slice';
import { useToast } from '@/hooks/use-toast';

function ShoppingHome() {
    const slides = [banner4, banner5, banner2];
    const [currentSlide, setCurrentSlide] = useState(0);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const { productList, productDetails } = useSelector((state) => state.shopProducts);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();

    function handleNavigateToListingPage(getCurrentItem, section) {
        sessionStorage.removeItem("filters");
        const currentFilter = {
            [section]: [getCurrentItem.id],
        };
        sessionStorage.setItem("filters", JSON.stringify(currentFilter));
        navigate(`/shop/listing`);
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
            navigate("/auth/login");
            return;
        }
        dispatch(addToCart({ userId: user?.id, productId: getCurrentProductId, quantity: 1 }))
            .then((data) => {
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
        const timer = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        dispatch(fetchAllFilteredProducts({
            filterParams: {},
            sortParams: "newest",
            userId: user?.id,
        }));
    }, [dispatch, user?.id]);

    useEffect(() => {
        if (productDetails !== null) setOpenDetailsDialog(true);
    }, [productDetails]);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchWishlist(user.id));
        }
    }, [dispatch, user?.id]);

    const categoriesWithIcon = [
        { id: "dog", label: "Dog", icon: Dog, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50" },
        { id: "cat", label: "Cat", icon: Cat, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50" },
        { id: "bird", label: "Birds", icon: Bird, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50" },
        { id: "hamster", label: "Hamster", icon: Rat, color: "from-rose-500 to-pink-500", bgColor: "bg-rose-50" },
        { id: "fish", label: "Fishes", icon: Fish, color: "from-purple-500 to-indigo-500", bgColor: "bg-purple-50" },
    ];

    const brandsWithIcon = [
        { id: "royal-canin", label: "Royal Canin", description: "Premium Nutrition" },
        { id: "purina", label: "Purina", description: "Trusted Care" },
        { id: "hill's", label: "Hill's", description: "Science Diet" },
        { id: "blue-buffalo", label: "Blue Buffalo", description: "Natural Choice" },
        { id: "orijen", label: "Orijen", description: "Biologically Appropriate" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Carousel */}
            <div className="relative w-full h-[500px] lg:h-[600px] overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                        }`}
                    >
                        <img
                            src={slide}
                            alt={`Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30"></div>
                    </div>
                ))}
                
                {/* Overlay Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white max-w-3xl px-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                            <PawPrint className="h-4 w-4" />
                            <span className="text-sm font-medium">Pet Care Essentials</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">Quality Products for Happy Pets</h1>
                        <p className="text-lg md:text-xl text-white/90 mb-8">Discover premium pet supplies, nutritious food, and accessories your furry friends will love.</p>
                        <Button 
                            onClick={() => navigate('/shop/listing')}
                            className="bg-white text-slate-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg"
                        >
                            Shop Now
                            <ShoppingBag className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Carousel Controls */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length)}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </Button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentSlide ? "w-8 bg-white" : "bg-white/50"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Shop by Category Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-4">
                            <Package className="h-4 w-4 text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-600">Shop by Category</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Browse by Pet Type</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Find everything your pet needs, from food to toys, tailored for their species</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {categoriesWithIcon.map((categoryItem) => (
                            <Card
                                key={categoryItem.id}
                                onClick={() => handleNavigateToListingPage(categoryItem, "category")}
                                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group"
                            >
                                <CardContent className={`flex flex-col items-center justify-center p-8 ${categoryItem.bgColor}`}>
                                    <div className={`p-4 rounded-full bg-gradient-to-r ${categoryItem.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <categoryItem.icon className="w-10 h-10 text-white" />
                                    </div>
                                    <span className="font-bold text-slate-800 text-lg">{categoryItem.label}</span>
                                    <span className="text-xs text-slate-500 mt-1">Shop Now →</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-16 bg-gradient-to-b from-white to-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
                            <Star className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-600">Handpicked for You</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Featured Products</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Discover our most popular pet products loved by thousands of happy pet parents</p>
                    </div>
                    {productList && productList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {productList.slice(0, 8).map((productItem) => (
                                <ShoppingProductTile
                                    key={productItem._id}
                                    handleGetProductDetails={handleGetProductDetails}
                                    product={productItem}
                                    handleAddtoCart={handleAddtoCart}
                                    handleWishlist={handleWishlist}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">No products available at the moment</p>
                        </div>
                    )}
                    <div className="text-center mt-12">
                        <Button 
                            onClick={() => navigate('/shop/listing')}
                            variant="outline"
                            className="px-8 py-3 rounded-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                        >
                            View All Products
                            <ChevronRightIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Shop by Brands Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                            <Award className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">Trusted Brands</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Shop by Brands</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Choose from the most trusted names in pet care and nutrition</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {brandsWithIcon.map((brandItem) => (
                            <Card
                                key={brandItem.id}
                                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                                className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-indigo-300 group"
                            >
                                <CardContent className="flex flex-col items-center justify-center p-8">
                                    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                                        <PawPrint className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <span className="font-bold text-slate-800 text-center">{brandItem.label}</span>
                                    <span className="text-xs text-slate-400 mt-1 text-center">{brandItem.description}</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center text-white">
                            <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
                                <Heart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
                            <p className="text-indigo-100">Premium products carefully selected for your pet's health</p>
                        </div>
                        <div className="text-center text-white">
                            <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
                                <ShoppingBag className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Free Shipping</h3>
                            <p className="text-indigo-100">On orders over ₹999 across India</p>
                        </div>
                        <div className="text-center text-white">
                            <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
                                <TrendingUp className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                            <p className="text-indigo-100">Expert assistance whenever you need it</p>
                        </div>
                    </div>
                </div>
            </section>

            <ProductDetailsDialog open={openDetailsDialog} setOpen={setOpenDetailsDialog} productDetails={productDetails} />
        </div>
    );
}

export default ShoppingHome;