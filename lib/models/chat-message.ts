import mongoose, { InferSchemaType, Model } from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
      default: "user",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export type ChatMessageDocument = InferSchemaType<typeof chatMessageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ChatMessage: Model<ChatMessageDocument> =
  (mongoose.models.ChatMessage as Model<ChatMessageDocument>) ||
  mongoose.model<ChatMessageDocument>("ChatMessage", chatMessageSchema);
