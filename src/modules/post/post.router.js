import Router from 'express'
import * as postController from './controller/post.js'
import * as commentController from './controller/comment.js'
import { validation } from '../../middleware/validation.js'
import * as postAndCommentValidators from './post.validation.js'
import { auth } from '../../middleware/auth.js'
import { HME, myMulter, pathName, validationTypes } from '../../services/cloudinaryMulter.js'
const router = Router()
router.post('/posts/pic',
    myMulter(validationTypes.image, pathName.postPic).single('postPicture'),
    HME, auth(['user', 'admin']), postController.addPost)
router.patch('/post/:id', auth(['admin', 'user']), validation(postAndCommentValidators.editPost), postController.editPost)
router.patch('/postDel/:id', auth(['admin', 'user']), validation(postAndCommentValidators.deletePost), postController.deletePost)
router.patch('/like/:id', auth(['admin', 'user']), validation(postAndCommentValidators.likePost), postController.likePost)
router.patch('/unLike/:id', auth(['admin', 'user']), validation(postAndCommentValidators.unLikePost), postController.unLikePost)
router.get('/posts/:id/page/:page?/size/:size?', validation(postAndCommentValidators.getPostsOfUser), postController.getPostsOfUser)
router.get('/posts/page/:page?/size/:size?', validation(postAndCommentValidators.getPostsOfUserOwner), postController.getPostsOfUserOwner)

router.patch('/comment/likes/:id', auth(['admin', 'user']), validation(postAndCommentValidators.likeComment), commentController.likeComment)


router.get('/comment/:id', validation(postAndCommentValidators.getComment), commentController.getComment)
router.post('/addComment/:postId/:commentReplyTo?', auth(['user', 'admin']), validation(postAndCommentValidators.createComment), commentController.createComment)

router.patch("/comment/:commentID", auth(['admin', 'user']), validation(postAndCommentValidators.editComment), commentController.editComment)
router.patch("/softDelComment/:commentID", auth(['admin', 'user']), validation(postAndCommentValidators.softDelComment), commentController.softDeleteComment)


export default router