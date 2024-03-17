const mongoose = require('mongoose');
const plm = require("passport-local-mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/PinterestDB")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],
  profileImage: {
    type: String 
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  fullname: {
    type: String,
    required: true
  },
  boards: {
    type: Array,
    default: []
  }
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);