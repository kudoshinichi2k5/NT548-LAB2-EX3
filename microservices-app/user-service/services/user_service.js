const UserModel = require("../models/user_model");

class UserService {

    static async registerUser(email, username, password) {
        try {
            const createUser = new UserModel({email, username, password});
            return await createUser.save();
        } 
        catch (error) {
            console.log("Register User Service Error: ", error);
        }
    }

    static async updatePassword(email, newPassword) {
        try {
            const user = await UserModel.findOne({email});
            if (!user) {
                throw new Error("User not found");
            }
            user.password = newPassword;
            await user.save();
        }
        catch (error) {
            console.log("Update Password Service Error:", error);
        }
    }

    static async checkPassword(userId, password) {
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                console.log("Check Password Error: User not found");
                return false;
            }

            const isMatch = await user.comparePassword(password);
            return isMatch;
        } catch (error) {
            console.log("Check Password Error:", error);
        }
    }

    static async updateRefreshToken(userId, newRefreshToken) {
        try {
            const user = await UserModel.findOne({_id: userId});
            if (!user) {
                console.log("Update Refresh Token Error: User not found");
            }
            else {
                user.refreshToken = newRefreshToken;
                await user.save();
            }
        }
        catch (error) {
            console.log("Update Refresh Token Error: ", error);
        }
    }

    static async checkUser(login) {
        try {
            if (!login || typeof login !== 'string') {
                throw new Error("Invalid login input");
            }

            let query = {};
            if (login.includes('@')) {
                query = { email: login };
            } else {
                query = { username: login };
            }

            const user = await UserModel.findOne(query);
            return user;
        } catch (error) {
            console.log("Check User Service Error: ", error);
            return null;
        }
    }


    static async checkUserById(userId) {
        try {
            const user = await UserModel.findById(userId);
            if (user) return user;
            else return null;
        }
        catch (error) {
            console.log("Check User By Id Service Error: ", error);
            return null;
        }
    }

    static async getUserByRefreshToken(refreshToken) {
        try {
            const user = await UserModel.findOne({refreshToken: refreshToken});
            if (!user) return null;
            return user;
        }
        catch (error) {
            console.log("Get user by refreshToken Error: ", error);
        }
    }

    static async updateAvatar(userId, avatarUrl) {
        try {
            const user = await UserModel.findOne({_id: userId});

            user.avatar_url = avatarUrl;
            return await user.save();
        }
        catch (error) {
            console.log("Update avatar Service Error: ", error);
        }
    }
}

module.exports = UserService;