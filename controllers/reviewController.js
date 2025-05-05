const Review = require('../models/review');
const Medicine = require('../models/medicine');

exports.addReview = async (req, res) => {
    try {
      const { medicineId, rating, comment } = req.body;
      const userId = req.user.id; 
  
      const existingReview = await Review.findOne({ userId, medicineId });
      if (existingReview) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this medicine' });
      }
  
      const review = await Review.create({ userId, medicineId, rating, comment });
  
      const reviews = await Review.find({ medicineId });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / reviews.length;
  
      await Medicine.findByIdAndUpdate(medicineId, {
        averageRating,
        totalReviews: reviews.length
      });
  
      res.status(201).json({ success: true, review });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error adding review' });
    }
  };
  

exports.getReviewsByMedicine = async (req, res) => {
  try {
    const { medicineId } = req.params;
    console.log(medicineId)
    const reviews = await Review.find({ medicineId }).populate('userId', 'name');
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching reviews' });
  }
};
exports.updateReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id;
  
      const review = await Review.findById(reviewId);
  
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
  
      if (review.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
  
      review.rating = rating || review.rating;
      review.comment = comment || review.comment;
      await review.save();
  
      res.status(200).json({ success: true, review });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error updating review' });
    }
  };
  
  exports.deleteReview = async (req, res) => {
    try {
      const { reviewId } = req.params;
      const userId = req.user.id;
  
      const review = await Review.findById(reviewId);
  
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
  
      if (review.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
  
      await review.remove();
      res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error deleting review' });
    }
  };
  