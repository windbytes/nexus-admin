import CryptoJS from 'crypto-js';

/**
 * 封装加密，加密逻辑：使用 AES 对数据进行加密，然后使用 RSA 对 AES 的密钥进行加密。
 * RSA 使用浏览器 Web Crypto（RSAES-PKCS1-v1_5），与后端 JSEncrypt 解密兼容，且不在产物中引入含私钥模板的第三方库。
 */

// RSA 公钥（可公开；仅用于加密 AES 密钥）
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

let importedPublicKey: CryptoKey | null = null;

function pemToSpkiDer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

async function getPublicKey(): Promise<CryptoKey> {
  if (importedPublicKey) {
    return importedPublicKey;
  }
  importedPublicKey = await crypto.subtle.importKey(
    'spki',
    pemToSpkiDer(publicKey),
    { name: 'RSAES-PKCS1-v1_5' },
    false,
    ['encrypt']
  );
  return importedPublicKey;
}

async function rsaEncryptPlaintext(plaintext: string): Promise<string> {
  const key = await getPublicKey();
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'RSAES-PKCS1-v1_5' }, key, encoded);
  return arrayBufferToBase64(encrypted);
}

/**
 * 前端进行数据加密处理
 * @param data 待加密的数据
 * @returns 返回加密的数据和加密的秘钥
 */
export async function encrypt(data: string) {
  const aesKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  const encryptedData = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(aesKey), {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  const encryptAESKey = await rsaEncryptPlaintext(aesKey);
  return {
    data: encryptedData,
    key: encryptAESKey,
  };
}
