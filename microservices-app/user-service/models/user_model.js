const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const db = require("../config/database");

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    username: {
        type:String,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        default: ""
    },
    avatar_url: {
        type: String,
        default: ""
    }
});

userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(this.password, salt);
    this.password = hashPass;
});

userSchema.methods.comparePassword = async function (userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    }
    catch (error) {
        throw error;
    }
}

const UserModel = db.model('users', userSchema);

module.exports = UserModel;
