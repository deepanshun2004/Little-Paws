const Cart = require("../../models/Cart");
const Product = require("../../models/Product");


const addToCart=async(req,res)=>{
    try{
        const { userId, productId, quantity } = req.body;
        if (!userId || !productId || quantity <= 0) {
            return res.status(400).json({
              success: false,
              message: "Invalid data provided!",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
              success: false,
              message: "Product not found",
            });
        }
        if (Number(product.totalStock) < quantity) {
            return res.status(400).json({
              success: false,
              message: "Requested quantity is not available",
            });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const findCurrentProductIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );
      
        if (findCurrentProductIndex === -1) {
            cart.items.push({ productId, quantity });
        } else {
            cart.items[findCurrentProductIndex].quantity += quantity;
        }
      
        await cart.save();
        res.status(200).json({
            success: true,
            data: cart,
        });
    }
    catch(error){
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Error",
        });
    }
}

const fetchCartItems=async(req,res)=>{
    try{
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is manadatory!",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
        },
      });
    }

    const productIds = cart.items.map((item) => item.productId);
    const products = await Promise.all(productIds.map((productId) => Product.findById(productId)));
    const productMap = new Map(
      products.filter(Boolean).map((product) => [String(product._id), product])
    );

    const validItems = cart.items.filter((productItem) => productMap.has(String(productItem.productId)));
  
      if (validItems.length < cart.items.length) {
        cart.items = validItems;
        await cart.save();
    }

    const populateCartItems = validItems.map((item) => ({
        productId: String(item.productId),
        image: productMap.get(String(item.productId)).image,
        title: productMap.get(String(item.productId)).title,
        price: productMap.get(String(item.productId)).price,
        salePrice: productMap.get(String(item.productId)).salePrice,
        quantity: item.quantity,
    }));
  
      res.status(200).json({
        success: true,
        data: {
          ...cart,
          items: populateCartItems,
        },
    });

    }
    catch(error){
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Error",
        });
    }
}

const updateCartItemQty=async(req,res)=>{
    try{

        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid data provided!",
          });
        }
    
        const cart = await Cart.findOne({ userId });
        if (!cart) {
          return res.status(404).json({
            success: false,
            message: "Cart not found!",
          });
        }

        const findCurrentProductIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );
      
        if (findCurrentProductIndex === -1) {
            return res.status(404).json({
              success: false,
              message: "Cart item not present !",
            });
        }
      
        cart.items[findCurrentProductIndex].quantity = quantity;
        const product = await Product.findById(productId);
        if (!product || Number(product.totalStock) < quantity) {
          return res.status(400).json({
            success: false,
            message: "Requested quantity is not available",
          });
        }
        await cart.save();

        const products = await Promise.all(
          cart.items.map((item) => Product.findById(item.productId))
        );
        const productMap = new Map(
          products.filter(Boolean).map((product) => [String(product._id), product])
        );
    
        const populateCartItems = cart.items.map((item) => ({
          productId: productMap.has(String(item.productId)) ? String(item.productId) : null,
          image: productMap.has(String(item.productId))
            ? productMap.get(String(item.productId)).image
            : null,
          title: productMap.has(String(item.productId))
            ? productMap.get(String(item.productId)).title
            : "Product not found",
          price: productMap.has(String(item.productId))
            ? productMap.get(String(item.productId)).price
            : null,
          salePrice: productMap.has(String(item.productId))
            ? productMap.get(String(item.productId)).salePrice
            : null,
          quantity: item.quantity,
        }));
    
        res.status(200).json({
          success: true,
          data: {
            ...cart,
            items: populateCartItems,
          },
        }); 
    }
    catch(error){
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Error",
        });
    }
}

const deleteCartItem=async(req,res)=>{
    try{

    const { userId, productId } = req.params;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) => String(item.productId) !== productId
    );

    await cart.save();

    const products = await Promise.all(
      cart.items.map((item) => Product.findById(item.productId))
    );
    const productMap = new Map(
      products.filter(Boolean).map((product) => [String(product._id), product])
    );

    const populateCartItems = cart.items.map((item) => ({
      productId: productMap.has(String(item.productId)) ? String(item.productId) : null,
      image: productMap.has(String(item.productId))
        ? productMap.get(String(item.productId)).image
        : null,
      title: productMap.has(String(item.productId))
        ? productMap.get(String(item.productId)).title
        : "Product not found",
      price: productMap.has(String(item.productId))
        ? productMap.get(String(item.productId)).price
        : null,
      salePrice: productMap.has(String(item.productId))
        ? productMap.get(String(item.productId)).salePrice
        : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart,
        items: populateCartItems,
      },
    });

    }
    catch(error){
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Error",
        });
    }
}

module.exports = {
    addToCart,
    updateCartItemQty,
    deleteCartItem,
    fetchCartItems,
};
