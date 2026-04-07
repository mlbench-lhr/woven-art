    import mongoose, { Schema, Document } from 'mongoose'

    export interface IStringArt extends Document {
    userId: string
    thumbnail: string | null
    totalPins: number
    totalLines: number
    finalSequence: number[] | null
    unlocked?: boolean
    createdAt: Date
    }

    const StringArtSchema = new Schema<IStringArt>({
    userId: { type: String, required: true, index: true },
    thumbnail: { type: String, default: null },
    totalPins: { type: Number, default: 240 },
    totalLines: { type: Number, required: true },
    finalSequence: { type: [Number], default: null },
    unlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
    })

    export const StringArt =
    mongoose.models.StringArt ??
    mongoose.model<IStringArt>('StringArt', StringArtSchema)
