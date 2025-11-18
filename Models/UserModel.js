
const mongoose = require('mongoose');


// new schema for users
const UserSchema = new mongoose.Schema ({
  name : {
    type: String,
    required: [true,'username is required']    
  },
  email : { 
    type : String,
    unique : true,
    required : [true,'Email is required'] 
 },
  password : { 
    type : String,
    required : [true,'Password is required']
  },
  count: {type: Number, default: 0}
        
}, {timestamps : true});



module.exports = mongoose.model('Users', UserSchema)

