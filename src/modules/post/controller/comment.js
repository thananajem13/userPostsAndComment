import mongoose from "mongoose"
import { commentModel } from "../../../../DB/models/comment.model.js"
import { postModel } from "../../../../DB/models/post.model.js"

export const createComment = async (req, res) => {
    const { postId } = req.params
    const { commentBody } = req.body
    const CreatedBy = req.user._id
    const post = await postModel.findOne({ _id: postId, isDeleted: false })

    if (!post) {
        return res.status(400).json({ message: "invalid post id or deleted post" })
    }
    const comment = new commentModel({ commentBody, postId, CreatedBy })
    const savedComment = await comment.save()
    if (!savedComment) {
        return res.status(400).json({ message: "failed to save or invalid post id" })
    }

    const commentID = savedComment._id
    if(! (req.params.commentReplyTo)){

        const addCommentToPost = await postModel.findByIdAndUpdate({ _id: postId,isDeleted:false }, { $addToSet: { comments: commentID } }, { new: true }).populate('CreatedBy comments')
    if (!addCommentToPost) {
        return res.status(400).json({ message: "failed to add comment to post or invalid post id" })
    }
    return res.status(201).json({ message: "Done", addCommentToPost })

    }
    
    else {
        console.log({ commentID, commentReplyToID: mongoose.Types.ObjectId(req.params.commentReplyTo) });
        const checkIfCommentReplyToExist = await commentModel.findOne({isDeleted:false,_id:req.params.commentReplyTo})
        if(!checkIfCommentReplyToExist){
            return res.status(400).json({message:"comment try to reply to doesn't exist"})
        }
        const addCommentReplyTo = await commentModel.findByIdAndUpdate({ _id: commentID, isDeleted: false }, { commentReplyTo: mongoose.Types.ObjectId(req.params.commentReplyTo) }, { new: true })
        if (!addCommentReplyTo) {
            return res.status(400).json({ message: "failed to add replied comment to it's parent comment or comment which you want to add to it is  deleted " })
        }
        return res.status(201).json({ message: "Done", addCommentReplyTo })
    }
}
export const editComment = async (req, res) => {
    const { commentID } = req.params
    const { _id } = req.user
    const { commentBody } = req.body
    const updateComment = await commentModel.findByIdAndUpdate({ _id: commentID, CreatedBy: _id, isDeleted: false }, { commentBody }, { new: true })
    updateComment ? res.status(200).json({ message: "Done", comment: updateComment }) : res.status(400).json({ message: "invalid comment id or you are not comment's owner or comment is deleted", comment: updateComment })
}
export const softDeleteComment = async (req, res) => {
    const { commentID } = req.params
    const { _id, role } = req.user
    const commentFind = await commentModel.findOne( {_id:commentID,isDeleted:false}  )
   
    if(role=="admin"){
        const comment = await commentModel.findOneAndUpdate({_id:commentID,isDeleted:false},{isDeleted:true,deletedBy:_id})
         console.log({comment });
        if(comment){
            return res.status(200).json({message:"Done",comment})
        }else{
            return res.status(400).json({message:"invalid comment id or deleted comment"})
        }

    }

    const commentOwner = await commentModel.findOneAndUpdate( {_id:commentID,CreatedBy:_id,isDeleted:false}   ,{isDeleted:true,deletedBy:_id},{new:true})
    if(commentOwner){
        return res.status(200).json({message:"Done",commentOwner})
    }else{
        return res.status(200).json({message:"invalid comment id or deleted comment",commentOwner})
    }
}
export const likeComment = async (req,res)=>{
    const {id} = req.params
    const {_id} = req.user
    const commentLike = await commentModel.findOneAndUpdate({_id:id,isDeleted:false,likes: {$nin: [_id]}},{$addToSet:{likes:_id}},{new:true})
    console.log({commentLike})
    if(!commentLike){
        return res.status(400).json({message:"invalid comment id  or you liked post previously"})
    }
    return res.status(200).json({message:"Done",post})
}
export const getComment = async(req,res)=>{
    const {id} = req.params
    const comment = await commentModel.findOne({_id:id,isDeleted:false}).populate([{
        path:"CreatedBy"
    },{
        path:"postId",
        populate:[{
            path:"CreatedBy"
        }]
    }])
    if(!comment){
        return res.status(400).json({message:"invalid id or comment is deleted"})
    }
    return res.status(400).json({message:"Done",comment})
}