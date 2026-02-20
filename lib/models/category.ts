import mongoose, { InferSchemaType, Model } from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameKey: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ userId: 1, updatedAt: -1 });
categorySchema.index(
  { userId: 1, nameKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      nameKey: { $type: "string" },
    },
  }
);

categorySchema.pre("validate", async function () {
  if (typeof this.name === "string") {
    this.name = this.name.trim();
    this.nameKey = this.name.toLowerCase();
  }
});

export type CategoryDocument = InferSchemaType<typeof categorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Category: Model<CategoryDocument> =
  (mongoose.models.Category as Model<CategoryDocument>) ||
  mongoose.model<CategoryDocument>("Category", categorySchema);
