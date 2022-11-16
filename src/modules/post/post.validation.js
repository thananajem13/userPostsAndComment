import joi from "joi";

export const createComment = {
    body: joi.object().required().keys({
        commentBody: joi.string().required().messages({
            "string.empty": "fill commentBody filed, shouldn't be empty",
            "string.base": "commentBody must be a string",
            "any.required": "commentBody is required"
        })
    }),
    params: joi.object().required().keys({
        postId: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }),
        commentReplyTo: joi.string().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }),
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "string.empty": "fill authorization filed, shouldn't be empty",
            "string.base": "authorization must be a string",
            "any.required": "authorization is required"
        })
    }).options({ allowUnknown: true })
}
export const editComment = {
    body: joi.object().required().keys({
        commentBody: joi.string().required().messages({
            "string.empty": "fill commentBody filed, shouldn't be empty",
            "string.base": "commentBody must be a string",
            "any.required": "commentBody is required"
        })
    }),
    params: joi.object().required().keys({
        commentID: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }) 
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "string.empty": "fill authorization filed, shouldn't be empty",
            "string.base": "authorization must be a string",
            "any.required": "authorization is required"
        })
    }).options({ allowUnknown: true })
}
export const softDelComment = {
    
    params: joi.object().required().keys({
        commentID: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }) 
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "string.empty": "fill authorization filed, shouldn't be empty",
            "string.base": "authorization must be a string",
            "any.required": "authorization is required"
        })
    }).options({ allowUnknown: true })
}
export const editPost = {
    body: joi.object().required().keys({
        postBody: joi.string().required().messages({
            "string.empty": "fill postBody filed, shouldn't be empty",
            "string.base": "postBody must be a string",
            "any.required": "postBody is required"
        })
    }),
    params: joi.object().required().keys({
        id: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }) 
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "string.empty": "fill authorization filed, shouldn't be empty",
            "string.base": "authorization must be a string",
            "any.required": "authorization is required"
        })
    }).options({ allowUnknown: true })
}
export const deletePost = { 
    params: joi.object().required().keys({
        id: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }) 
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "string.empty": "fill authorization filed, shouldn't be empty",
            "string.base": "authorization must be a string",
            "any.required": "authorization is required"
        })
    }).options({ allowUnknown: true })
}
export const likePost = { 
    params: joi.object().required().keys({
        id: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }) 
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "string.empty": "fill authorization filed, shouldn't be empty",
            "string.base": "authorization must be a string",
            "any.required": "authorization is required"
        })
    }).options({ allowUnknown: true })
}
export const unLikePost = { 
    params: joi.object().required().keys({
        id: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }) 
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "string.empty": "fill authorization filed, shouldn't be empty",
            "string.base": "authorization must be a string",
            "any.required": "authorization is required"
        })
    }).options({ allowUnknown: true })
}
export const getPostsOfUser = { 
    params: joi.object().required().keys({
        id: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        }) , page: joi.number().positive().messages({
            "number.positive": "page must be positive",
            "number.base": "page must be a number"
        }),
        size: joi.number().positive().messages({
            "number.positive": "size must be positive",
            "number.base": "size must be a number"
        }),
    }),
    
}
export const getPostsOfUserOwner = { 
    params: joi.object().required().keys({
          page: joi.number().positive().messages({
            "number.positive": "page must be positive",
            "number.base": "page must be a number"
        }),
        size: joi.number().positive().messages({
            "number.positive": "size must be positive",
            "number.base": "size must be a number"
        }),
    }),
    
}
export const likeComment = { 
    params: joi.object().required().keys({
        id: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        })
    }),
    
}
export const getComment = {
    params: joi.object().required().keys({
        id: joi.string().required().min(24).max(24).messages({
            "string.min": "id must has 24 length",
            "string.max": "id must has 24 length",
            "string.empty": "fill id filed, shouldn't be empty",
            "string.base": "id must be a string",
            "any.required": "id is required"
        })
    }),
}