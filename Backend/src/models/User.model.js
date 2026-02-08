const mongoose = require("mongoose");

const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    refreshToken:{
      type:String,
      default:null

    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "driver", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function(){
  if(!this.isModified("password")){
    return ;
  }
  this.password = await bcrypt.hash(this.password ,10);
})



userSchema.methods.toJSON = function(){

  
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;

  return user;
}

module.exports = mongoose.model("User", userSchema);
