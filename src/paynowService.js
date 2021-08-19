import { ValidationError } from "yup";
import { INPUT_SCHEMA, PAYMENT_TYPES } from "./utils/constants";
import {
  crc16,
  createAsBase64Image,
  formatDate,
  padLeft,
} from "./utils/helpers";

/**
 * Generate PayNow QR Code
 *
 * @param {object} input {
 *  amount - (Optional) Amount of transaction,
 *  editable - (Optional) If amount is editable,
 *  billNumber - (Optional) Unique reference for QR Code,
 *  merchantName - (Default: NA) Merchant Name,
 *  merchantCountry - (Default: SG) ISO 3166-1 alpha-2 country code of merchant company,
 *  merchantCity - (Default: Singapore) City of merchant company,
 *  expiry - (Default: now + 1 day) Expiry date of QR Code,
 *  uen - (Required unless mobile) Company UEN to pay,
 *  mobile - (Required unless uen) Mobile number to pay,
 * }
 * @param {bool} asImage Return QR Code as Base64 image
 * @param {number} imageSize Size of image in pixels
 * @param {string} logo Path to logo image (if applicable)
 * @return {array} Array of form [result, error]. Result is QR code data in string (default) or base64 image of generate QR code (asImage = true)
 */
export function generateQr(
  input,
  asImage = false,
  imageSize = 300,
  logo = null
) {
  try {
    const validatedInput = INPUT_SCHEMA.validateSync(input);
    if (validatedInput.uen) {
      validatedInput.paymentType = PAYMENT_TYPES["uen"];
    } else {
      validatedInput.paymentType = PAYMENT_TYPES["mobile"];
    }
    if (validatedInput.mobile) {
      validatedInput.mobile = validatedInput.mobile.replace(
        /^([3689][0-9]{7})$/g,
        "+65$1"
      );
    }

    const payload = constructPayloadData(validatedInput);
    var qr = generateQrString(payload);

    // if (asImage) {
    //   qr = createAsBase64Image(qr, imageSize, logo);
    // }
    return [qr];
  } catch (error) {
    if (error instanceof ValidationError) {
      return [undefined, error.errors];
    } else {
      return [undefined, error];
    }
  }
}

/**
 * Generate the PayNow QR string
 *
 * @param {object} data Payload according to PayNow specs
 * @return {string} QR code data in string
 */
function generateQrString(data) {
  var output = "";
  for (var { id, value } of data) {
    if (Array.isArray(value)) {
      var concatenatedValue = "";
      for (const { id: nestedId, value: nestedValue } of value) {
        concatenatedValue +=
          String(nestedId) +
          padLeft(nestedValue.length.toString(), 2) +
          nestedValue;
      }
      value = concatenatedValue;
    }
    output += String(id) + padLeft(value.length.toString(), 2) + value;
  }

  // Here we add "6304" to the previous string
  // ID 63 (Checksum) 04 (4 characters)
  // Do a CRC16 of the whole string including the "6304"
  // then append it to the end.
  output += "6304" + padLeft(crc16(output + "6304"), 4);

  return output;
}

/**
 * Construct payload data from input
 *
 * @param {object} input Validated input
 * @return {array} Payload data as defined by PayNow specs
 */
function constructPayloadData(input) {
  const dynamic = !!input.amount;

  const data = [
    { id: "00", value: "01" }, // ID 00: Payload Format Indicator (Fixed to '01')
    { id: "01", value: dynamic ? "12" : "11" }, // ID 01: Point of Initiation Method 11: static, 12: dynamic
    // ID 26: Merchant Account Info Template
    {
      id: "26",
      value: [
        { id: "00", value: "SG.PAYNOW" }, // Fixed for paynow
        { id: "01", value: String(input.paymentType) }, // 0 for mobile, 2 for UEN. 1 is not used.
        {
          id: "02",
          value:
            input.paymentType === "2"
              ? String(input.uen) // PayNow UEN (Company Unique Entity Number)
              : String(input.mobile), // Mobile for P2P
        },
        { id: "03", value: dynamic && !input.editable ? "0" : "1" }, // 1 = Payment amount is editable, 0 = Not Editable
        { id: "04", value: formatDate(new Date(input.expiry)) }, // Expiry date (YYYYMMDDHHMMSS)
      ],
    },
    { id: "52", value: "0000" }, // ID 52: Merchant Category Code ("0000" if not used)
    { id: "53", value: "702" }, // ID 53: Currency. SGD is 702
    { id: "58", value: String(input.merchantCountry) }, // ID 58: 2-letter Country Code (SG)
    { id: "59", value: String(input.merchantName) }, // ID 59: Company Name
    { id: "60", value: String(input.merchantCity) }, // ID 60: Merchant City
  ];

  if (dynamic) {
    if (input.amount) {
      // ID 54: Transaction Amount
      data.push({
        id: "54",
        value: (Math.round(input.amount * 100) / 100).toFixed(2),
      });
    }
    if (input.billNumber) {
      // ID 62: Additional Data Field Template
      data.push({
        id: "62",
        value: [{ id: "01", value: String(input.billNumber) }], // ID 01: Bill Number
      });
    }
  }

  return data.sort((a, b) => Number(a.id) - Number(b.id));
}
