import { Schema, model,Types } from 'mongoose'
import { qrCodeGeneration } from '../../src/modules/user/controller/user.js';
import bcrypt from 'bcrypt'
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, default:"male",enum:["male","female"] },
    postsID: [{type:Types.ObjectId,ref:'Post',default:null}],
    // age: { type: Types.Decimal128,  },
    age: { type: Number,default:20  },
    profilePic: String,
    coverPics: Array,
    isDeleted:{type:Boolean,default:false},
    isBlocked:{type:Boolean,default:false},
    qrCode:String,
    confirmEmail: { type: Boolean, default: false },
    role:{type:String,default:'user',enum:['user','admin']},
    deletedBy:{type:Types.ObjectId,ref:'User',default:null},
    cloudinaryID:String,
    cloudinaryIDs:[String],
}, {
    timestamps: true
})


userSchema.pre('save', function( next ) { 
    // update password
    if(this.isModified("password")){
        this.password = bcrypt.hashSync(this.password, parseInt(process.env.SALTROUND))
    } 
    // this.__v = this.isNew ? 0 : this.__v+1;
    this.increment()
    // update qrcode
    this.qrCode = qrCodeGeneration(this, this._id, false);
    
    next()
  }); 
export const userModel  =  model('User', userSchema)