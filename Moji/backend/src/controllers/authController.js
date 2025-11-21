import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const ACCESS_TOEKN_TTL = '30m';
const  REFRESH_TOKEN_TTL = 14 * 24 * 60 * 1000;
export const signUp = async (req, res) => {
    try {
        const{username, password, email, firstName, lastName} = req.body;
        
        if(!username || !password || !email || !firstName || !lastName ){
            return res
                .status(400)
                .json({
                    message:"không thể thiếu username, password, email, firstname, lastname",
                });
        }
        // kiểm tra user tồn tại chưa
            const duplicate = await User.findOne({username});
            if(duplicate){
                return res
                .status(409)
                .json({
                    message:"username đã tồn tại",
                });
            }
        // mã hóa mật khẩu với brypt
            const hashedPassword = await bcrypt.hash(password, 10);
        
        // taọ user mới
            await User.create({
                username,
                hashedPassword,
                email,
                displayName: `${firstName} ${lastName}`
            });
        // return
            return res.sendStatus(204);
    } catch (error) {
        console.error("Lỗi khi gọi signUp", error);
        return res.status(500).json({message:'Lỗi hệ thống'});
    }
};
export const signIn = async (req, res) => {
    try {
        // lấy inputs
            const {username, password} = req.body;
            if(!username || !password){
                return res.status(400).json({message:"Thiếu username hoặc password."});
            }
        // lấy hashedPassword trong database để so sánh với password user input
            const user = await User.findOne({username});
            if(!user){
                return res.status(401).json({message:"user hoặc password không chính xác"});
            }
        // kiểm tra password
            const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
            if(!passwordCorrect){
                return res.status(401).json({message:"username hoặc password không chính xác "});
            }
        // nếu khớp tạo access token với JWT
            const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOEKN_TTL});
    } catch (error) {
        console.error("Lỗi khi gọi signIn", error);
        return res.status(500).json({message: "Lỗi hệ thống"});
    }
};