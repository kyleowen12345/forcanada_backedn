import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { User } from "../models/user.js";
import { Token } from '../models/token.js'




dotenv.config()



export default async (req, res, next) => {
    try {
        const { authorization } = req.headers;
	
	if (!authorization) return res.status(401).json({ error: "you must be logged in" });
	
    const token = authorization.split(' ')[1]
    
    const {token:validToken} = await Token.findOne({token:token})

    if(!validToken) return res.status(401).json({ error: "you must be logged in" });
     
	jwt.verify(validToken, process.env.SECRET_KEY,async (err, payload) => {
		if (err) {
            await Token.findOneAndDelete({token:validToken})
			return res.status(401).json({ error: "session expired" });
		}
		const { _id } = payload;
	        const userData = await	User.findById(_id)
			req.user = userData;
			next();
		
	});
    } catch (error) {
        res.status(400).json({ error: "Incorrect credentials you must login" })
    }
	
};