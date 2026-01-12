const { response } = require("express");
const UserService = require("../services/user_service");
const ImageService = require("../services/image_service");
const OtpCacheService = require("../services/otp_cache_service");
const sendOtpEmail = require("../utilities/mailer");
const AuthService = require("../services/auth_service");

const {uploadImage} = require("../utilities/cloudinary");
require('dotenv').config();

// Registration API
exports.register = async(req, res, next) => {
    try {
        const {email, username, password} = req.body;

        const existingEmailUser = await UserService.checkUser(email);
        if (existingEmailUser) {
            return res.status(400).json({message: "Email is already registered." });
        }

        const existingUsernameUser = await UserService.checkUser(username);
        if (existingUsernameUser) {
            return res.status(400).json({message: "Username is already taken." });
        }

        // 1. Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000);

        // 2. Save user data + OTP to cache
        await OtpCacheService.saveOtp(email, {username, password, otpCode, action: "register"});

        // 3. Send OTP via email
        await sendOtpEmail(email, otpCode);

        res.status(200).json({success: "User Registered. Please verify OTP sent to your email."});
    }
    catch (error) {
        console.log("Registration User Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

// Login API
exports.login = async(req, res, next) => {
    try {
        const {login, password} = req.body;

        const user = await UserService.checkUser(login);

        if (!user) {
            return res.status(404).json({message: "User Not Found"});
        }

        const isMatch = await UserService.checkPassword(user._id, password);
        if (isMatch === false) {
            return res.status(400).json({message: "Password incorrect"});
        }
        
        let tokenData = {userId: user._id};

        const accessToken = await AuthService.generateToken(
            tokenData, 
            process.env.ACCESS_TOKEN_SECRET, 
            "15m"
        );

        const refreshToken = await AuthService.generateToken(
            tokenData,
            process.env.REFRESH_TOKEN_SECRET,
            "7d"
        );

        await UserService.updateRefreshToken(user._id, refreshToken);
        
        const accessTokenExpire = "15m";
        res.status(201).json({
            status: true,
            _id: user._id,
            email: user.email,
            username: user.username,
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpire: accessTokenExpire,
            avatar_url: user.avatar_url
        });
    }
    catch (error) {
        console.log("Login User Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    } 
}

// Forgot Password API
exports.forgotPassword = async (req, res, next) => {
    try {
        const {email} = req.body;

        // 1. Check user is exited
        const user = await UserService.checkUser(email);
        if (!user) {
            return res.status(404).json({message: "User not found."});
        }

        // 2. Generate OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000);

        // 3. Save OTP
        await OtpCacheService.saveOtp(email, {otpCode, action: "forgotPassword"});

        // 4. Send OTP mail
        await sendOtpEmail(email, otpCode);

        res.json({status: true, success: "User Forgot Password. Please verify OTP sent to your email."});
    }
    catch (error) {
        console.log("Forgot Password Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

// Reset Password API
exports.resetPassword = async (req, res, next) => {
    try {
        const {email, newPassword} = req.body;

        await UserService.updatePassword(email, newPassword);
        
        res.status(201).json({message: "Password reset successfully"});
    }
    catch (error) {
        console.log("Reset Password Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

// Verify API
exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, otpCode } = req.body;

        // Lấy thông tin người dùng và OTP từ bộ nhớ đệm
        const cachedData = await OtpCacheService.getOtp(email);

        if (!cachedData) {
            return res.status(400).json({ message: "OTP expired or invalid" });
        }

        if (cachedData.otpCode.toString() !== otpCode.toString()) {
            return res.status(400).json({ message: "Incorrect OTP" });
        }

        let responseMessage = "OTP Verified";

        // Xử lý hành động theo loại yêu cầu
        switch (cachedData.action) {
            case "register":
                const { username, password } = cachedData;
                await UserService.registerUser(email, username, password);
                responseMessage += " and User Registered Successfully";
                break;

            case "forgotPassword":
                responseMessage += " and please send new password";
                break;

            default:
                return res.status(400).json({ message: "Invalid action type" });
        }

        // Xóa OTP khỏi bộ nhớ đệm sau khi xác minh thành công
        await OtpCacheService.deleteOtp(email);

        res.status(201).json({ message: responseMessage });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Refresh Access Token
exports.refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh Token is required" });
        }

        const user = await AuthService.verifyRefreshToken(refreshToken);

        if (!user) {
            return res.status(403).json({ message: "Invalid Refresh Token" });
        }

        const tokenData = { userId: user._id };
        const newAccessToken = await AuthService.generateToken(
            tokenData,
            process.env.ACCESS_TOKEN_SECRET,
            "15m"
        );

        res.status(200).json({
            accessToken: newAccessToken,
            accessTokenExpire: "15m"
        });

    } catch (error) {
        console.log("Refresh Access Token Error: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Logout
exports.logout = async (req, res) => {
    try {
        const {refreshToken} = req.body;

        if (!refreshToken) {
            return res.status(400).json({message: "Refresh Token is required"});
        }

        const user = await UserService.getUserByRefreshToken(refreshToken);

        if (!user) {
            return res.status(200).json({ message: "User already logged out or token invalid" });
        }

        const deleteRefreshToken = "";
        await UserService.updateRefreshToken(user._id, deleteRefreshToken);

        return res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.log("Logout Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

// Update Avatar
exports.updateAvatar = async (req, res) => {
    try {
        const imageFile = req.file;
        let userId = req.user.userId;
        
        // userId = new mongoose.Types.ObjectId(userId);

        if (!imageFile) {
            return res.status(400).json({ message: 'Image is required' });
        }   
        
        const uploadResult = await uploadImage(imageFile.path);

        const imageUrl = uploadResult.secure_url.toString();

        const user = await UserService.checkUserById(userId);

        if (!user) {
            return res.status(404).json({message: "User Not Found"});
        }

        const userUpdate = await UserService.updateAvatar(userId, imageUrl);

        res.status(201).json({
            avatar_url: userUpdate.avatar_url
        });

    }
    catch (error) {
        console.log("Update Avatar Controller Error: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}
