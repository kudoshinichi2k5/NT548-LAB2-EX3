require("dotenv").config();
const UserModel = require("../models/user_model");
const jwt = require("jsonwebtoken");

class AuthService {
    
    static async generateToken(tokenData, secretKey, jwt_expire) {
        try {
            return jwt.sign(tokenData, secretKey, {expiresIn:jwt_expire});
        }
        catch (error) {
            console.log("Generate Token Service Error: ", error);
        }
    }

    static async verifyRefreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = UserModel.findOne({
                _id: decoded.userId,
                refreshToken: refreshToken
            });

            if (!user) {
                return null;
            }
            else {
                return user;
            }
        }
        catch (error) {
            console.log("Failed to verify refresh token: ", error);
        }
    }
}
module.exports = AuthService;