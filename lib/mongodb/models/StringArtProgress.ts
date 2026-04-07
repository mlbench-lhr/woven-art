import mongoose, { Schema, Document } from 'mongoose'


interface IStringArtProgress extends Document {
    userId: string
    stringArtId: mongoose.Types.ObjectId
    currentStep: number
    workingState: number[]    // serialized Float32Array of working brightness
    updatedAt: Date
}

export const StringArtProgressSchema = new Schema<IStringArtProgress>({
    userId: { type: String, required: true },
    stringArtId: { type: Schema.Types.ObjectId, ref: 'StringArt', required: true },
    currentStep: { type: Number, required: true },
    workingState: { type: [Number], required: true },
    updatedAt: { type: Date, default: () => new Date() }
})

export const StringArtProgress = mongoose.model<IStringArtProgress>('StringArtProgress', StringArtProgressSchema)