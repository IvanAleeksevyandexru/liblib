export type RegContextConfirmState =
  'PVG' | // validating
  'PVD' | // validated
  'PVF' | // validation failed
  'PCF' | // confirmation failed
  'PCD' | // confirmed
  'PS' | // simplified
  'PR' | // simplified ready to confirm
  'PV' | // verified
  'PT'; // trusted
