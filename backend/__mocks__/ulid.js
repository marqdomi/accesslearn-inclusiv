// Manual mock for ulid (ESM package not compatible with Jest CommonJS transform)
let counter = 0;
module.exports = {
  ulid: () => `MOCK${String(++counter).padStart(22, '0')}`,
};
