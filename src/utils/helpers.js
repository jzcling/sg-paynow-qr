import { CRC16_TABLE } from "./constants";
// import QRCode from "easyqrcodejs-nodejs";

/**
 * Pad string with 0s up to n (number of chars)
 *
 * @param {string} s
 * @param {number} n Number of chars
 * @return {string}
 */
export function padLeft(s, n) {
  if (n < String(s).length) {
    return s.toString();
  } else {
    return Array(n - String(s).length + 1).join("0") + s;
  }
}

/**
 * Generate Base64 image
 *
 * @param {string} data
 * @param {number} size
 * @param {string} pathToLogo
 * @return {string}
 */
export function createAsBase64Image(data, size, pathToLogo = null) {
  return (
    "data:image/svg+xml;utf8," +
    generateQrCode(data, size, pathToLogo || "./utils/Paynow.jpeg")
  );
}

/**
 * Generate a QR code
 *
 * @param {string} data
 * @param {number} qrSize
 * @param {string} logo
 * @return {string}
 */
export async function generateQrCode(data, qrSize, logo) {
  // return await new QRCode({
  //   text: data,
  //   width: qrSize,
  //   height: qrSize,
  //   correctLevel: QRCode.CorrectLevel.H,
  //   logo: logo,
  // }).toSVGText();
}

/**
 * Calculate CRC16 value
 *
 * @param {string} data
 * @return {string}
 */
export function crc16(data) {
  var crc = 0xffff;
  var j, i;

  for (i = 0; i < data.length; i++) {
    let c = data.charCodeAt(i);
    if (c > 255) {
      throw new RangeError();
    }
    j = (c ^ (crc >> 8)) & 0xff;
    crc = CRC16_TABLE[j] ^ (crc << 8);
  }

  return ((crc ^ 0) & 0xffff).toString(16).toUpperCase();
}

export function formatDate(d) {
  return (
    d.getFullYear() +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    ("0" + d.getDate()).slice(-2) +
    ("0" + d.getHours()).slice(-2) +
    ("0" + d.getMinutes()).slice(-2) +
    ("0" + d.getSeconds()).slice(-2)
  );
}
