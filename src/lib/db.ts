// Deprecated: This project now uses Google Apps Script as its backend,
// via src/lib/gas.ts. The Prisma client has been removed.
//
// This file is kept as a stub so any old import still resolves. It throws
// a helpful error if something accidentally tries to use it.

throw new Error(
  'src/lib/db.ts is no longer the data layer. The Rehab Shop now uses ' +
  'Google Apps Script (GAS) as its backend. Import from "@/lib/gas" instead ' +
  'and call /api/gas (browser) or gasFetch() (server) to talk to the data store.'
);
