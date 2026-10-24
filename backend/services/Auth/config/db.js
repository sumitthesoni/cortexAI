import mongoose from "mongoose"

const connectDb = async ()=>{
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not set")
        }
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("db connected")
    } catch (error){
        console.error("MongoDB connection failed:", error.message)
    }
}

export default connectDb