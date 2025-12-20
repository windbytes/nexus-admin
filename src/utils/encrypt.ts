import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

/**
 * 封装加密，加密逻辑：使用AES对数据进行加密，然后使用RSA对AES的密钥进行加密
 */

// RSA的公钥
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9rT8QRdW7oHKMit2ADrU
jAK9VUeGCR37qSPBLkicR6VlOCVzt+pL9fjiLPrMbXZL8ttkzYao3HvYt0+yhM+y
5+2vHIJsVpekC1JQHl2x2pUUU09hvcnEquXDeja0NBXDqVEvtEp70H19xp3G4DRi
5N6EJceez4JHmU9r18/tguCGWQPqJG8bSanDyZlOPuYHvHbU+pqglgWPc1k40uyR
MVo4XTSO+RIwx/2Z4+DczCNPkCCqF/WLFMw5EqrUlki5kGPt61++T0EBIKKtoV9i
pQIJJ0UjPP3jQMgaw85/XMvEspjNmyKLCj7Kob3mC8XB78gtUTkQIqT1YnmqgOs3
LwIDAQAB
-----END PUBLIC KEY-----
`;

/**
 * 前端进行数据加密处理
 * @param data 待加密的数据
 * @returns 返回加密的数据和加密的秘钥
 */
export const encrypt = (data: string) => {
  // 生成AES秘钥
  const aesKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  // 加密数据
  const encryptedData = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(aesKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  // 使用RSA对AES的秘钥进行加密
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  const encryptAESKey = encrypt.encrypt(aesKey);
  return {
    data: encryptedData,
    key: encryptAESKey,
  };
};
