const mongoose = require('mongoose');

const trendSchema = mongoose.Schema({
  hashtag: String,
  count: Number, 
});

const Trend = mongoose.model('trends', trendSchema);

module.exports = Trend;