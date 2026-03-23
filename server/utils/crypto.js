const crypto = require('crypto');

// Must be 256 bits (32 bytes) for AES-256-CBC
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); 
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  if (!text) return text;
  
  // Generate a random initialization vector for every single message
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Return the IV and the encrypted text joined by a colon
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  
  // Fallback: If it doesn't have our colon separator, it's an unencrypted legacy message
  if (!text.includes(':')) return text;

  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    return "🔒 [Encrypted Message]";
  }
}

module.exports = { encrypt, decrypt };