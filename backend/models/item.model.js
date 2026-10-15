import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
    type: String,
    default: null // ⭐ Ab bina image ke bhi item add ho sakta hai
},
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    category: {
        type: String,
        enum: [
            "Snacks",
            "Main Course",
            "Desserts",
            "Pizza",
            "Burgers",
            "Sandwiches",
            "South Indian",
            "North Indian",
            "Chinese",
            "Fast Food",
            "Others"
        ],
        required:true
    },
    price :{
        type:Number,
        min:0,
        required:true
    },
    foodType :{
        type:String,
        enum:["veg","non veg"],
        required:true
    },
    rating:{
        average:{type:Number,default:0},
        count:{type:Number,default:0}
    }
}, { timestamps: true })

const Item=mongoose.model("Item",itemSchema)
export default Item