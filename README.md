# SG PayNow QR

A PayNow QR Generator for Singapore.

asImage flag does not work for now due to issues finding decent QRCode with logo generators for NodeJS. The QR string returned can be used as the content for QR Code generators on the browser.

## Installation

```
npm install --save @jeremyling/sg-paynow-qr
```

## Usage Example

```js
import * as pn from "@jeremyling/sg-paynow-qr";

const date = new Date();

const [qrString, error] = pn.generateQr({
  amount: 10.1, // Optional
  editable: 0, // 1 - Payment Amount is editable, 0 - Payment Amount not editable
  billNumber: "A12345", // Optional, defaults to '***' (User to input reference within payment app)
  merchantName: "Payee", // Optional, defaults to 'NA'
  merchantCountry: "SG", // Optional, defaults to 'SG'
  merchantCity: "Singapore", // Optional, defaults to 'Singapore'
  expiry: new Date(date.setDate(date.getDate() + 1)), // Optional, defaults to 1 day from now
  uen: undefined, // Required if mobile is null, PayNow registered UEN for businesses
  mobile: "+6591234567", // Required if uen is null, PayNow registered Mobile Number for P2P transfers
});
```
