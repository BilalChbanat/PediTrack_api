import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FamilyDocument = Family & Document;

@Schema({
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            ret._id = ret._id.toString();
            ret.parentId = ret.parentId?.toString();
            ret.children = ret.children?.map((id: Types.ObjectId) => id.toString());
            return ret;
        }
    }
})
export class Family {
    @Prop({
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    })
    familyName: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true
    })
    parentId: Types.ObjectId;

    @Prop({
        type: [{ type: Types.ObjectId, ref: 'Patient' }],
        default: []
    })
    children: Types.ObjectId[];

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const FamilySchema = SchemaFactory.createForClass(Family);

FamilySchema.index({ familyName: 1 });
FamilySchema.index({ parentId: 1 });
FamilySchema.index({ children: 1 });

FamilySchema.pre<FamilyDocument>('save', function (next) {
    if (this.isModified() && !this.isNew) {
        this.updatedAt = new Date();
    }
    next();
});

FamilySchema.virtual('totalMembers').get(function (this: FamilyDocument) {
    return (this.parentId ? 1 : 0) + (this.children?.length || 0);
});
