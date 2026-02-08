// Manual mock for uuid (ESM package not compatible with Jest CommonJS transform)
let counter = 0;
module.exports = {
  v4: () => `mock-uuid-${++counter}-${Date.now()}`,
  validate: () => true,
  version: () => 4,
};
