export const registerFormControls=[
    {
        name:'userName',
        label:'User Name',
        placeholder:'Enter your user name',
        compoentType:'input',
        type:'text',
    },
    {
        name:'email',
        label:'Email',
        placeholder:'Enter your email',
        compoentType:'input',
        type:'email',
    },
    {
        name:'password',
        label:'Password',
        placeholder:'Enter your password',
        compoentType:'input',
        type:'password',
    },
    {
        name:'city',
        label:'City',
        placeholder:'Enter your city',
        componentType:'input',
        type:'text',
    }
];


export const loginFormControls=[
    {
        name:'email',
        label:'Email',
        placeholder:'Enter your email',
        compoentType:'input',
        type:'email',
    },
    {
        name:'password',
        label:'Password',
        placeholder:'Enter your password',
        compoentType:'input',
        type:'password',
    }
];


export const addProductFormElements = [
    {
      label: "Title",
      name: "title",
      componentType: "input",
      type: "text",
      placeholder: "Enter product title",
    },
    {
      label: "Description",
      name: "description",
      componentType: "textarea",
      placeholder: "Enter product description",
    },
    {
      label: "Category",
      name: "category",
      componentType: "select",
      options: [
        { id: "dog", label: "Dog" },
        { id: "cat", label: "Cat" },
        { id: "bird", label: "Bird" },
        { id: "fish", label: "Fish" },
        { id: "rabbit", label: "Rabbit" },
        { id: "hamster", label: "Hamster" },
      ],
    },
    {
      label: "Brand",
      name: "brand",
      componentType: "select",
      options: [
        { id: "royal-canin", label: "Royal Canin" },
        { id: "purina", label: "Purina" },
        { id: "hill's", label: "Hill's" },
        { id: "blue-buffalo", label: "Blue Buffalo" },
        { id: "orijen", label: "Orijen" },
      ],
    },
    {
      label: "Price",
      name: "price",
      componentType: "input",
      type: "number",
      placeholder: "Enter product price",
    },
    {
      label: "Sale Price",
      name: "salePrice",
      componentType: "input",
      type: "number",
      placeholder: "Enter sale price (optional)",
    },
    {
      label: "Total Stock",
      name: "totalStock",
      componentType: "input",
      type: "number",
      placeholder: "Enter total stock",
    },
  ];
  


  export const shoppingViewHeaderMenuItems = [
    {
      id: "home",
      label: "Home",
      path: "/shop/home",
    },
    // {
    //   id: "products",
    //   label: "Products",
    //   path: "/shop/listing",
    // },
    {
      id: "cat",
      label: "Cats",
      path: "/shop/listing",
    },
    {
      id: "bird",
      label: "Birds",
      path: "/shop/listing",
    },
    {
      id: "dog",
      label: "Dogs",
      path: "/shop/listing",
    },
    {
      id: "fish",
      label: "Fishes",
      path: "/shop/listing",
    },
    {
      id: "hamster",
      label: "Hamster",
      path: "/shop/listing",
    },
    // {
    //   id: "search",
    //   label: "Search",
    //   path: "/shop/search",
    // },
  ];

  export const filterOptions = {
    category: [
      { id: "dog", label: "Dog" },
      { id: "cat", label: "Cat" },
      { id: "bird", label: "Birds" },
      { id: "hamster", label: "Hamster" },
      { id: "fish", label: "Fishes" },
    ],
    brand: [
      { id: "royal-canin", label: "Royal Canin" },
      { id: "purina", label: "Purina" },
      { id: "hill's", label: "Hill's" },
      { id: "blue-buffalo", label: "Blue Buffalo" },
      { id: "orijen", label: "Orijen" },
    ],
    availability: [
      { id: "in_stock", label: "In Stock" },
      { id: "out_of_stock", label: "Out Of Stock" },
    ],
  };
  
export const sortOptions = [
    { id: "price-lowtohigh", label: "Price: Low to High" },
    { id: "price-hightolow", label: "Price: High to Low" },
    { id: "title-atoz", label: "Title: A to Z" },
    { id: "title-ztoa", label: "Title: Z to A" },
    { id: "newest", label: "Newest" },
  ];




  export const addressFormControls = [
    {
      label: "Address",
      name: "address",
      componentType: "input",
      type: "text",
      placeholder: "Enter your address",
    },
    {
      label: "City",
      name: "city",
      componentType: "input",
      type: "text",
      placeholder: "Enter your city",
    },
    {
      label: "Pincode",
      name: "pincode",
      componentType: "input",
      type: "text",
      placeholder: "Enter your pincode",
    },
    {
      label: "Phone",
      name: "phone",
      componentType: "input",
      type: "text",
      placeholder: "Enter your phone number",
    },
    {
      label: "Notes",
      name: "notes",
      componentType: "textarea",
      placeholder: "Enter any additional notes",
    },
  ];
