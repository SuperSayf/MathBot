const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
    id: String,
    name: String,
    points: Number,
});

module.exports = mongoose.model("leaderboard", leaderboardSchema);