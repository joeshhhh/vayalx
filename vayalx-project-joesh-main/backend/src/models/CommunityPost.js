// VAYALX Community Post Model (Farmer Forum & Knowledge Sharing)
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment user is required']
  },
  userName: {
    type: String,
    trim: true,
    default: 'Farmer'
  },
  comment: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const communityPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required']
    },
    authorName: {
      type: String,
      trim: true,
      default: 'VAYALX Member'
    },
    authorRole: {
      type: String,
      trim: true,
      default: 'farmer'
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    category: {
      type: String,
      trim: true,
      enum: {
        values: [
          'Pest & Disease Control',
          'Organic Farming / பஞ்சகாவ்யா',
          'Water & Irrigation',
          'Market Rates & Trade',
          'Government Schemes & Subsidy',
          'General Farming'
        ],
        message: 'Invalid community category'
      },
      default: 'General Farming'
    },
    images: {
      type: [String],
      default: []
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSchema],
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['active', 'hidden', 'deleted'],
        message: 'Invalid status'
      },
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
communityPostSchema.index({ author: 1, status: 1 });
communityPostSchema.index({ category: 1, status: 1 });
communityPostSchema.index({ createdAt: -1 });

const CommunityPost = mongoose.models.CommunityPost || mongoose.model('CommunityPost', communityPostSchema);

module.exports = CommunityPost;
