import express from 'express';


import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils.js';
import User from '../model/userModel.js';
import nodemailer from 'nodemailer'
import axios from 'axios'


const userRouter = express.Router();

userRouter.post('/register', expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const userphone = await User.findOne({ phone: req.body.phone });

    let decoded;

    //Check if verification key is altered or not and store it in variable decoded after decryption
    try{
      decoded = await decode(verification_key)
    }
    catch(err) {
      const response={"Status":"Failure", "Details":"Bad Request"}
      return res.status(400).send(response)
    }

    var obj= JSON.parse(decoded)
    const check_obj = obj.check

    // Check if the OTP was meant for the same email or phone number for which it is being verified 
    if(check_obj!=check){
      const response={"Status":"Failure", "Details": "OTP was not sent to this particular email or phone number"}
      return res.status(400).send(response) 
    }

    const otp_schema = await OTP.findOne({ where: { id: obj.otp_id } })
    if (otp_schema.verification != true) {
        const response={"Status":"Failure","Details":"OTP NOT Verified"}
        return res.status(400).send(response) 

    }
   
    if (!user) {
        
        
        if (!userphone) {
            const bcryptpassword = bcrypt.hashSync(req.body.password, 8)
            const user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                isAdmin: req.body.isAdmin,
                isVendor: req.body.isVendor,
                isCustomer: req.body.isCustomer,
                password: bcryptpassword,
            })

           
            const adduser = await user.save();
            if (adduser) {  
                const output = `
                    <p>You have a new contact request</p>
                    <h3>Your Details Details</h3>
                    <ul>  
                    <li>First Name: ${adduser.firstname}</li>
                    <li>Last Name: ${adduser.lastname}</li>
                    <li>Email: ${adduser.email}</li>
                    <li>Phone: ${adduser.phone}</li>
                    </ul>
                    
                `;
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port:587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: 'pdlbibash77@gmail.com ', // generated ethereal user
                        pass: 'Bibash7$$&&@@'  // generated ethereal password
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                // setup email data with unicode symbols
                let mailOptions = {
                    from: '"TechFortress" <contact@techfortress.com>', // sender address
                    to: adduser.email, // list of receivers
                    subject: 'Welcome Message', // Subject line
                    text: "Dear " + adduser.firstname + ', \n \n Thank You for Registration. \n Successfully Register', // plain text body
                    html :output
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId);
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                    res.render('contact', { msg: 'Email has been sent' });
                });
                return res.status(201).send({ message: "Your Account has been Created" })

                    
            }
           else{
                return res.status(500).send({ message: error })
                
            }
        }
        else {
            return res.status(400).send({message:'user already exist with this phone number'})
        }
        
    }
    else{
        return res.status(400).send({message:'user already exist with this email'})
    }
}));




//signin function
userRouter.post('/signin', expressAsyncHandler(async (req, res) => {
    const text = req.body.text;
    const user = await User.findOne({ email: req.body.email });
    const userphone = await User.findOne({phone:req.body.phone});
       
    if(user || userphone){
        if(bcrypt.compareSync(req.body.password, user.password)){
            res.send({
                _id:user._id,
                firstname: user.firstname,
                lastname:user.lastname,
                email: user.email,
                phone: user.phone,
                isAdmin:user.isAdmin,
                isVendor:user.isVendor,
                isCustomer:user.isCustomer,
                token:generateToken(user)
            });
            return ;
        }
        else{
            res.status(401).send({message:"invalid password"})
        }
            
        } else {
            return res.status(400).send({message:'Invalid Email or Phone'})
        }
    }));


export default userRouter;