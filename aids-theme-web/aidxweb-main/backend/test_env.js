
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Check Env
console.log("-----------------------------------------");
console.log("🔍 Checking Environment Variables:");
const envVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'MONGO_URI'];
let missing = false;
envVars.forEach(v => {
    if (process.env[v]) {
        console.log(`${v}: ✅ Set`);
    } else {
        console.log(`${v}: ❌ MISSING`);
        missing = true;
    }
});
console.log("-----------------------------------------");

if (missing) {
    console.error("❌ CRITICAL: Missing environment variables. Exiting.");
    process.exit(1);
}

// Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test Cloudinary
async function testCloudinary() {
    console.log("\n☁️ Testing Cloudinary Connection...");
    try {
        const result = await cloudinary.api.ping();
        console.log("✅ Cloudinary Ping Success:", result);
        return true;
    } catch (error) {
        console.error("❌ Cloudinary Error:", error.message);
        return false;
    }
}

// Test MongoDB
async function testMongo() {
    console.log("\n🍃 Testing MongoDB Connection...");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Configuration Valid & Connected!");
        console.log("   Db Name:", mongoose.connection.name);
        console.log("   Host:", mongoose.connection.host);

        // List Collections (Optional verification)
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("   Collections found:", collections.map(c => c.name).join(', ') || 'None (New DB)');

        await mongoose.disconnect();
        return true;
    } catch (error) {
        console.error("❌ MongoDB Error:", error.message);
        return false;
    }
}

async function runTests() {
    const cloudOk = await testCloudinary();
    const mongoOk = await testMongo();

    if (cloudOk && mongoOk) {
        console.log("\n✨ ALL SYSTEMS GO! ✨");
        process.exit(0);
    } else {
        console.error("\n⚠️ Verification Failed.");
        process.exit(1);
    }
}

runTests();
