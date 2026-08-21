import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IOrganization {
  name: string;
  ownerId?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrganizationDocument extends IOrganization, Document {}

const organizationSchema = new Schema<IOrganizationDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Organization: Model<IOrganizationDocument> = mongoose.model<IOrganizationDocument>(
  "Organization",
  organizationSchema
);

export default Organization;