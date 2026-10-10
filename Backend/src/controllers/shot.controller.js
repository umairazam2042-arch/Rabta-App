const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { getRandomShots } = require("../services/pixabay.service");

// GET /api/v1/shots?limit=8   (random shots, database mein kuch save nahi hota)
const getShots = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 8, 15);
  const shots = await getRandomShots(limit);

  return res.status(200).json(new ApiResponse(200, { shots }, "Shots fetched"));
});

module.exports = { getShots };