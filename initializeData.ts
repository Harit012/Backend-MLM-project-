import { MongoClient } from "mongodb";

// Replace with your MongoDB connection string
const uri = "mongodb://localhost:27017"; // or from Atlas
const dbName = "MLM_Backend";

const run = async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);

    // Create and seed 'users' collection
    const usersCollection = db.collection("users");

    const existingUsers = await usersCollection.countDocuments();
    if (existingUsers === 0) {
      await usersCollection.insertMany([
        { name: "Alice", email: "alice@example.com" },
        { name: "Bob", email: "bob@example.com" },
      ]);
      console.log("Inserted initial users");
    } else {
      console.log("Users already exist, skipping insert");
    }

    // Create and seed 'products' collection
    const productsCollection = db.collection("products");

    const existingProducts = await productsCollection.countDocuments();
    if (existingProducts === 0) {
      await productsCollection.insertMany([
        { name: "Laptop", price: 999 },
        { name: "Phone", price: 499 },
      ]);
      console.log("Inserted initial products");
    } else {
      console.log("Products already exist, skipping insert");
    }

  } catch (err) {
    console.error("Error setting up the database:", err);
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
};

run();
