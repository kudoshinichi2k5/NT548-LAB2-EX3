const cache = require("../utilities/cache");

class OtpCacheService {

    static async saveOtp(email, data) {
        cache.set(email, data); // data = { username, password, otpCode }.
    }
    
    static async getOtp(email) {
        return cache.get(email);
    }
    
    static async deleteOtp(email) {
        cache.del(email);
    }

}

module.exports = OtpCacheService;