
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
export type LogoDocument = Logo & Document;

@Schema({ timestamps: true })
export class Logo {
    @Prop()
    logo: string;

    @Prop()
    logoName: string;

    @Prop()
    description?: string;
}

export const LogoSchema = SchemaFactory.createForClass(Logo);