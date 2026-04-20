// config.js - Shop Configuration
// When creating a new shop, you only need to edit this file

const config = {
    // Shop Basic Information
    shopName: "Mama Njeri Restaurant",
    tagline: "Fresh & Delicious Meals",
    location: "Kitale Market",
    currency: "KSh",
    
    // Contact Information
    whatsappNumber: "254115652612",   // International format without +
    phoneNumber: "0115652612",
    
    // Business Details
    description: "Mama Njeri Restaurant offers fresh, home-style meals prepared with love. Located at Kitale Market.",
    
    // Social / Other Links (optional)
    facebook: "",
    instagram: "",
    
    // Delivery Settings
    defaultDeliveryFee: 100,
    
    // Colors (for easy customization later)
    primaryColor: "#00c853",
    accentColor: "#00b84a"
};

// Prevent accidental overwrite + ensure global access
if (!window.config) {
    window.config = config;
}