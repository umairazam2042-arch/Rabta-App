// Async controller mein error aaye to khud error middleware tak pahuncha deta hai
// Is se har controller mein try/catch nahi likhna padta
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;