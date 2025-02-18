const Tag = require("../../models/Tag");

module.exports = {
  getTag: async (tagType) => {
    let tagResult = await Tag.findOneAndUpdate(
      {
        tagType,
      },
      { $inc: { sequenceNo: 1 }, updatedAt: Math.floor(Date.now() / 1000) },
      {
        upsert: true,
        new: true,
      }
    );
    return tagResult;
  },
};
