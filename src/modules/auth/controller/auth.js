import { userModel } from "../../../../DB/models/user.model.js"
import bcrypt from 'bcrypt' 
import jwt from 'jsonwebtoken'
import sendEmail from "../../../services/email.js"

export const signUp = async (req, res) => {
    const { name, email, password } = req.body
    const user = await userModel.findOne({ email }).select('email')
    if (user) {
        return res.status(400).json({ message: "email exist" })
    } else {  
        const newUser = new userModel({ name, email, password  })
        const savedUser = await newUser.save()
        if (!savedUser) {
            return res.status(400).json({ message: "fail to register new account" })
        }
        else {
            const token = jwt.sign({ id: savedUser._id }, process.env.EMAILTOKEN, { expiresIn: '1h' })
            const message = `
            <a href="${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}">Confirm Email</a>
            `
            await sendEmail([email], 'Confirm-Email', message)
            return res.status(201).json({ message: "Done, please check your email to confirm" })
        }
    }
}
export const signIn = async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email, isBlocked: false, confirmEmail: true }).populate('deletedBy')
    //.select("name email profilePic role")
    // res.json({ userInAuth: user.deletedBy.role });

    if (!user) {
        return res.status(400).json({ message: "invalid account or un confirmed email or blocked" })
    } else {
        if (user.deletedBy?.role == 'admin' && user.deletedBy != user._id) {
            return res.status(400).json({ message: "deleted account by admin you can't login" })

        } else {
            const match = bcrypt.compareSync(password, user.password)
            if (!match) {
                return res.status(400).json({ message: "invalid account" })
            } else {
                const token = jwt.sign({ id: user._id, isLoggedIn: true }, process.env.EMAILTOKEN, { expiresIn: "1h" })
                const rfToken = jwt.sign({ id: user._id, isLoggedIn: true }, process.env.EMAILTOKEN, { expiresIn: "30d" })
                return res.status(200).json({ message: "Done", accessToken: token, refreshToken: rfToken })
            }
        }

    }
}
export const confirmEmail = async (req, res) => {
    try {
        const { token } = req.params

        const decoded = jwt.verify(token, process.env.EMAILTOKEN)
        console.log({ decoded });
        if (!decoded?.id) {
            return res.status(400).json({ message: "in-valid token payload" })
        } else {
            const user = await userModel.findOneAndUpdate({ _id: decoded.id, confirmEmail: false },
                { confirmEmail: true })
            if (!user) {
                return res.status(400).json({ message: "Already confirmed" })
            } else {
                return res.status(200).json({ message: "Email confirmed plz login" })

            }
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error })

    }
}
