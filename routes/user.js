import express from 'express'
import { User } from '../models/user.js'
import { Token } from '../models/token.js'
import bcrypt from 'bcrypt'
import dotenv from "dotenv"
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import middleware from '../lib/middleware.js'



dotenv.config()

const router = express.Router()

router.post('/protected',middleware, async (req, res, ) => {
    try {
     return   res.status(200).json({ success: true, msg: "You are successfully authenticated to this route!",user:req.user});
    } catch (error) {
        console.log(error)
    }
    
});

router.post('/register',async(req,res)=>{

    try {
        
        const schema = Joi.object({
            name: Joi.string()
                .min(3)
                .max(30)
                .required(),
        
            password: Joi.string()
            .min(3)
            .max(30)
            .required(),
        
            email: Joi.string()
                .email({ minDomainSegments: 2 })
        })
        const {value,error} =  schema.validate(req.body)

        if(error) return res.status(400).json({error:error.details[0].message})

      
        const existingUser = await User.findOne({email:value.email})

        if(existingUser) return  res.status(400).json({ email: "Email already exists" });

        
        const user = new User({
             name:value.name,
             email:value.email,
             password:value.password,
        })
        
        
        bcrypt.genSalt(12,(err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                if(err) throw err;
                user.password = hash;
                user.save()
                .then(user => res.status(200).json(user))
                .catch(err => res.status(400).json(err));
               
               
            })
        })


        
    } catch (error) {

        res.status(400).json(error)

    }

})


router.post('/login',async(req,res)=>{

    try {
        
        const schema = Joi.object({
            password: Joi.string()
            .min(3)
            .max(30)
            .required(),
        
            email: Joi.string()
                .email({ minDomainSegments: 2 })
                .required()
        })
        const {value,error} =  schema.validate(req.body)

        if(error) return res.status(400).json({error:error.details[0].message})

        const existingUser = await User.findOne({email:value.email})

        if(!existingUser) return  res.status(400).json({ error: "User does not exists" });

        const matched =await bcrypt.compare(value.password,existingUser.password)

        if(!matched) return res.status(400).json({ error: "Invalid email or password" })
        
        
        const token = jwt.sign(
            {_id: existingUser.id},
            process.env.SECRET_KEY,
            {expiresIn:"365d"}
        )

        const newToken = new Token({
             token:token
        })

        await newToken.save()

        return res.status(200).json({success:true,token})
        



        
    } catch (error) {

        res.status(400).json(error)

    }

})


router.post('/logout',async(req,res)=>{

    try {
        const { authorization } = req.headers;

        const token = authorization.split(' ')[1];

        await Token.findOneAndDelete({token:token})
        
        res.status(200).json({error:'Logged out successfuly'})
        
    } catch (error) {

        res.status(400).json(error)

    }

})




export default router