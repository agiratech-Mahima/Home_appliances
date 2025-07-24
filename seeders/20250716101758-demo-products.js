"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert("products", [
      {
        name: "Washing Machine",
       
      
        description: "Premium front-load washing machine with advanced features",
        price: 30000,
        stock: 10,
        image_url: "https://plus.unsplash.com/premium_photo-1664372899525-d99a419fd21a?q=80&w=694&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        created_at: now,
        updated_at: now,
      },
      {
        name: "Kitchen Appliances Set",
    
        
        description: "Complete kitchen appliance combo for modern homes",
        price: 15000,
        stock: 20,
        image_url: "https://images.unsplash.com/photo-1593853761096-d0423b545cf9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
       created_at: now,
        updated_at: now,
      },
      {
        name: "Coffee Machine",
        
     
        description: "Automatic coffee machine for perfect brewing",
        price: 8000,
        stock: 15,
        image_url: "https://images.unsplash.com/photo-1620051787208-a45bc64e32ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvbWUlMjBhcHBsaWFuY2VzfGVufDB8fDB8fHww",
         created_at: now,
        updated_at: now,
      },
      {
        name: "Refrigerator",
       
       
        description: "Large double-door refrigerator with energy saving",
        price: 25000,
        stock: 8,
        image_url: "https://media.istockphoto.com/id/1310926096/photo/woman-taking-food-from-fridge.webp?s=2048x2048&w=is&k=20&c=CTnVTCKArWO8cMywYSgD2snNeQbvJ3rINpQtrimhiuA=",
     created_at: now,
        updated_at: now,
      },
          {
        name: "Home Needs",
   
     
        description: "Set of contemporary home appliances.",
        price: 15000,
        stock: 12,
        image_url:
          "https://media.istockphoto.com/id/1174598609/photo/set-of-contemporary-house-appliances-isolated-on-white.webp?s=2048x2048&w=is&k=20&c=j33jrc6Hqo3JnbjWCUw-xEK40HdJIzHKyS7YzIqXML8=",
        created_at: now,
        updated_at: now,
      },
      {
        name: "Vacuum Cleaner",
        
        
        description: "Powerful and efficient vacuum cleaner.",
        price: 9000,
        stock: 8,
        image_url:
          "https://plus.unsplash.com/premium_photo-1664372899494-774422f7ce61?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
           created_at: now,
        updated_at: now,
      },
      {
        name: "Television",
     
      
        description: "High-definition smart television.",
        price: 45000,
        stock: 6,
        image_url:
          "https://images.unsplash.com/photo-1461151304267-38535e780c79?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      created_at: now,
        updated_at: now,
      },
      {
        name: "Home Decors",
      
        
        description: "Stylish and modern home décor items.",
        price: 7000,
        stock: 20,
        image_url:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          created_at: now,
        updated_at: now,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", null, {});
  }
};

