import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, type: [String] })
  productCategory: string[];

  @Prop({ required: true, min: 1 })
  price: number;

  @Prop({ required: true })
  orderDate: Date;

  @Prop()
  createdBy: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
