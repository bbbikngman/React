import CryptoJS from 'crypto-js';


// 加密服务类
class EncryptionService {
    constructor(secretKey) {
        // 密钥必须是32字节长的buffer, IV(初始化向量为16字节)
        // 注意：`crypto-js` 不支持直接处理 32 字节的密钥，因此我们可以通过适当处理将密钥调整为合适的长度
        this.secretKey = CryptoJS.enc.Hex.parse(CryptoJS.SHA256(secretKey).toString(CryptoJS.enc.Hex)).toString(CryptoJS.enc.Hex);
        this.iv = CryptoJS.lib.WordArray.random(16); // iv 为16字节，随机生成
    }

    // 对文本进行加密
    encrypt(text) {
        const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Hex.parse(this.secretKey), {
            iv: this.iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return {
            iv: this.iv.toString(CryptoJS.enc.Hex),
            content: encrypted.toString()
        };
    }

    // 对文本进行解密
    decrypt(encryptedText, iv) {
        const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Hex.parse(this.secretKey), {
            iv: CryptoJS.enc.Hex.parse(iv),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    // 校验加密后的密码是否匹配
    isPasswordMatch(inputPassword, encryptedPassword, iv) {
        const encryptedInput = this.encrypt(inputPassword).content;
        return encryptedInput === encryptedPassword;
    }
}

export default EncryptionService;
