import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsDateString,
} from 'class-validator';

export class OrderDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer Name' })
  customerName: string;

  @ApiProperty({ example: 'Laptop', description: 'Product Name' })
  productName: string;

  @ApiProperty({ example: 'Electronics', description: 'Product Category' })
  productCategory: string;

  @ApiProperty({ example: 1200, description: 'Product Price' })
  price: number;

  @ApiProperty({
    example: '2024-02-17',
    description: 'Order Date (ISO format)',
  })
  orderDate: Date;

  @ApiProperty({
    example: 'customer@example.com',
    description: 'User who created the order',
  })
  createdBy: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer Name' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'Laptop', description: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 'Electronics', description: 'Product Category' })
  @IsString()
  @IsNotEmpty()
  productCategory: string;

  @ApiProperty({ example: 1200, description: 'Product Price' })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({
    example: '2024-02-17',
    description: 'Order Date (ISO format)',
  })
  @IsDateString()
  @IsNotEmpty()
  orderDate: Date;
}

export class OrderResponseDto {
  @ApiProperty({
    example: 'Order created successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({ example: 201, description: 'Response status code' })
  code: number;

  @ApiProperty({
    example: {
      customerName: 'John Doe',
      productName: 'Laptop',
      productCategory: 'Electronics',
      price: 1200,
      orderDate: '2024-02-17',
      createdBy: 'customer@example.com',
    },
    description: 'Order details',
    type: () => OrderDto,
  })
  data: OrderDto;
}

export class DeleteOrderResponseDto {
  @ApiProperty({
    example: 'Order deleted successfully',
    description: 'Response message',
  })
  message: string;

  @ApiProperty({ example: 200, description: 'Response status code' })
  code: number;

  @ApiProperty({
    type: 'null',
    example: null,
    description: 'No data returned',
  })
  data: null;
}
