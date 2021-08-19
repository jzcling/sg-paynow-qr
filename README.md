# SG PayNow QR

A PayNow QR Generator for Singapore.

## Installation

```
npm install --save @jeremyling/sg-paynow-qr
```

## Usage Example

```js
import * as pn from "@jeremyling/sg-paynow-qr";

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
