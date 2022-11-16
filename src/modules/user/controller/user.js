import { userModel } from "../../../../DB/models/user.model.js"
import { JSONToSTR } from "../../../helper/convertJSONToSTR.js"
import sendEmail from "../../../services/email.js"
import { generateQR } from "../../../services/generateQRCode.js"
import cloudinary from '../../../services/cloudinary.js'
import jwt from 'jsonwebtoken'
import { paginate } from "../../../services/pagination.js"
import { postModel } from "../../../../DB/models/post.model.js"
import { commentModel } from "../../../../DB/models/comment.model.js" 
export const addUser = async (req, res) => {
    res.status(201).json({ message: "Done" })
}


export const qrCodeGeneration = async (updatedValueNeeded, userID, send = true) => {
    // delete updatedValueNeeded.qrCode
    // delete updatedValueNeeded.isBlocked
    // delete updatedValueNeeded.isDeleted
    const { name, email, password, gender, age, isDeleted, isBlocked, confirmEmail, role } = updatedValueNeeded
    const UserJSONToStr = JSONToSTR({ name, email, password, gender, age, isDeleted, isBlocked, confirmEmail, role })
    const { qrStr } = await generateQR(UserJSONToStr)
    if (send) {
        await userModel.findByIdAndUpdate({ _id: userID }, { qrCode: qrStr })
    }
    return qrStr
}
export const blockUser = async (req, res) => {
    const { id } = req.params

    const user = await userModel.findOneAndUpdate({ _id: id, role: { $ne: "admin" }, isBlocked: false }, { isBlocked: true }, { new: true })
    console.log({ user });
    if (!user) {
        return res.status(400).json({ message: "invalid id or user block previously or user is admin and you can't delete another admin just users role" })
    }
    return res.status(200).json({ message: "Done", user })

}
//prevent update the same value
export const updateProfile = async (req, res) => {
    // try {
    const user = req.body
    const { _id } = req.user
    let strResponse = ""
    const userr = await userModel.findById({ _id })
    const updatedValueNeeded = {}
    /**
     * 
     * name
     * email
     * password
     * gender 
     * age
     * profilePic
     * coverPics
     * 
     */


    if (!userr) {
        return res.status(400).json({ message: "invalid user id" })
    }
    if (user.password && userr?.password != user.password) {
        // userr.password = bcrypt.hashSync(user.password, parseInt(process.env.SALTROUND))
        userr.password = user.password

    }
    if (user.name && userr?.name != user.name) {
        userr.name = user.name
    }

    if (user.gender && userr?.gender != user.gender) {
        userr.gender = user.gender
    }
    if (user.age && userr?.age != user.age) {
        userr.age = userr.age
    }


    // console.log({ equals: (userr.email == user.email) });
    if (user.email && userr?.email != user.email) {
        // console.log({ email: user.email });
        userr.email = user.email
        // const userUpdateEmail = await userModel.findOneAndUpdate({ email: userr.email }, { email: user.email, confirmEmail: false }, { new: true })
        userr.confirmEmail = false
        // console.log({ update: userUpdateEmail });


        // if (userUpdateEmail) {
        const token = jwt.sign({ id: userr._id }, process.env.EMAILTOKEN, { expiresIn: '1h' })
        const message = `
        <a href="${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}">Confirm Email</a>
        `
        await sendEmail([user.email], 'Confirm-Email', message)
        // userr.email = user.email
        strResponse = "please confirm updated email"
        // }
    }
    // console.log({updatedValueNeeded});

    const updatedUser = await userr.save()
    if (updatedUser) {

        // console.log({ updatedUser });
        // qrCodeGeneration(updatedUser, userr._id)
        return res.status(200).json({ message: "Done, " + strResponse, updatedUser })
    } else {
        return res.status(400).json({ message: "filed to update", updatedUser })
    }
    // } catch (error) {
    //     if (error.code == 11000) {
    //         return res.status(500).json({ message: "email exist" })

    //     }
    //     return res.status(500).json({ message: "catch error", error })
    // }

}
export const softDelete = async (req, res) => {
    const { id } = req.params
    const loginUser = req.user

    const adminsCount = await userModel.find({ role: "admin", _id: { $ne: id } }).count()


    if (loginUser.role == 'admin' && adminsCount == 0) {
        return res.status(409).json({ message: "website will be with no admins so set any user to be admin" })
    }

    const user = await userModel.findOne({ $or: [{ $and: [{ _id: loginUser._id }, { _id: id }] }, { $and: [{ _id: id }, { role: "admin" }] }] })
    if (!user) {
        return res.status(400).json({ message: "invalid id or un-authorized user" })
    } else {
        const updatedUser = await userModel.findByIdAndUpdate(id, { isDeleted: true, deletedBy: loginUser._id }, { new: true })
        if (!updatedUser) {
            return res.status(400).json({ message: "fail to soft delete account" })
        } else {
            res.status(200).json({ message: "soft deleted done", updatedUser })
        }
    }
}
export const addProfilePic = async (req, res) => {
    console.log({ api_key: process.env.APIKEY });
    console.log({ file_pic_user_controller: req.file });
    const user = await userModel.findOne({ _id: req.user._id }).select('cloudinaryID')

    if (!req.file) {
        return res.json({ message: "Please upload u image" })
    } else {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: `user/profilePic/${req.user._id}`
        })

        const updateProfilePic = await userModel.findByIdAndUpdate({ _id: req.user._id }, { profilePic: secure_url, cloudinaryID: public_id })//public_id to use it in destroy
        if (updateProfilePic.modifiedCount) {
            await cloudinary.uploader.destroy(user.cloudinaryID)
            // qrCodeGeneration(updateProfilePic, req.user._id)
            return res.status(200).json({ message: "Done", secure_url })
        } else {
            return res.status(400).json({ message: "filed to update cover pic" })

        }
    }

}
export const addCoverPics = async (req, res) => {
    const user = await userModel.findOne({ _id: req.user._id }).select('cloudinaryIDs')
    let secureURLs = []
    let publicIDs = []
    console.log({ file_pic_user_controller: req.files });
    if (!req.files) {
        return res.status(400).json({ message: "please upload at least 2 cover pictures" })
    }
    if (!(req.files?.length > 1)) {
        return res.status(400).json({ message: "Please upload at least 2 cover pictures" })
    } else {


        for (const file of req.files) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                folder: `user/coverPic/${req.user._id}`
            })
            console.log({ secure_url, public_id });

            secureURLs.push(secure_url)
            publicIDs.push(public_id)
            console.log({ secureURLs, publicIDs });
        }
        console.log({ test: "after", secureURLs, publicIDs });

        const updateCoverPics = await userModel.findByIdAndUpdate({ _id: req.user._id }, { coverPics: secureURLs, cloudinaryIDs: publicIDs })//public_id to use it in destroy
        if (updateCoverPics.modifiedCount) {
            // qrCodeGeneration(updateCoverPics, req.user._id)
            user.cloudinaryIDs.forEach(async (cloudinaryID) => {
                await cloudinary.uploader.destroy(cloudinaryID)
            })
            return res.status(200).json({ message: "Done", secureURLs })
        } else {

        }
    }

}
const recursivePopulateReplies = async (
    comment,
    parents = new Set(),
    maxDepth = 3
  ) => {
    if (parents.has(comment._id)) return;
    parents.add(comment._id);
    comment.replies = await commentModel
      .find({ isDeleted: false, commentReplyTo: comment._id })
      .lean();
    if (comment.replies.length === 0) return;
    return await Promise.all(
      comment.replies.map((c) => recursivePopulateReplies(c, parents, maxDepth - 1))
    );
  };
export const getUsersAndPostsAndComments = async (req, res) => {
    let { page, size } = req.params;
    if (!page || isNaN(page)) {
      page = 1;
    }
    if (!size || isNaN(size)) {
      size = 2;
    }
    const { limit, skip } = paginate(page, size);
    const userPostsComments = await userModel.find({isDeleted:false,isBlocked:false,confirmEmail:true}).populate([{
        path:"postsID",
        $match:{isDeleted:false}
    }]).skip(skip).limit(limit).lean()
    for (const user of userPostsComments) {
        for (const post of user.postsID) {
            post.postComment = await postModel.findById({_id:post._id}).populate('comments').lean();
            if(post.postComment){
                await Promise.all(
                    post.postComment.comments.map((c) => recursivePopulateReplies(c))
                  );
            }
        }
    }
  res.json({userPostsComments})
     
  } 
export const getFixedPostOfUser = async (req, res) => {
    // const {postId} = req.params
    let { page, size } = req.params
    if (!page || isNaN(page)) {
        page = 1
    }
    if (!size || isNaN(size)) {
        size = 2
    }
    const { limit, skip } = paginate(page, size)
    const { _id } = req.params
    const userPost = await userModel.findOne({ _id, isBlocked: false, isDeleted: false, confirmEmail: true }).populate([{
        path: "postsID"
    }]).skip(skip).limit(limit)
    userPost.length ? res.status(200).json({ message: "Done", userPost }) : res.status(404).json({ message: "no user found", userPost })


}