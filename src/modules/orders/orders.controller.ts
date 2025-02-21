import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/guards/roles.decorator';
import {
  CreateOrderDto,
  OrderResponseDto,
  DeleteOrderResponseDto,
} from './orders.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('customer')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new order (Customer only)' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  createOrder(@Body() orderData: CreateOrderDto, @Req() req) {
    return this.ordersService.createOrder(orderData, req.user.email);
  }

  @Get('all')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all orders with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
  })
  @ApiResponse({ status: 200, description: 'Paginated orders retrieved' })
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.ordersService.getAllOrders(page, limit);
  }

  @Get('my-orders')
  @Roles('customer')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get orders for the logged-in customer' })
  @ApiResponse({ status: 200, description: 'Customer orders retrieved' })
  getCustomerOrders(@Req() req) {
    return this.ordersService.getCustomerOrders(req.user.email);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Delete an order (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Order deleted successfully',
    type: DeleteOrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  deleteOrder(@Param('id') orderId: string, @Req() req) {
    return this.ordersService.deleteOrder(orderId, req.user.role);
  }

  @Get('analytics/revenue')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get total revenue' })
  @ApiQuery({
    name: 'timeframe',
    required: false,
    enum: ['thisMonth', 'lastMonth', 'thisYear', 'lastYear'],
  })
  @ApiResponse({ status: 200, description: 'Total revenue retrieved' })
  getTotalRevenue(@Query('timeframe') timeframe: string) {
    return this.ordersService.getTotalRevenue(timeframe);
  }

  @Get('analytics/orders-count')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get total number of orders' })
  @ApiQuery({
    name: 'timeframe',
    required: false,
    enum: ['thisMonth', 'lastMonth', 'thisYear', 'lastYear'],
  })
  @ApiResponse({ status: 200, description: 'Total order count retrieved' })
  getOrderCount(@Query('timeframe') timeframe: string) {
    return this.ordersService.getOrderCount(timeframe);
  }

  @Get('analytics/customers-count')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get number of unique customers' })
  @ApiQuery({
    name: 'timeframe',
    required: false,
    enum: ['thisMonth', 'lastMonth', 'thisYear', 'lastYear'],
  })
  @ApiResponse({ status: 200, description: 'Unique customers count retrieved' })
  getUniqueCustomers(@Query('timeframe') timeframe: string) {
    return this.ordersService.getUniqueCustomers(timeframe);
  }

  @Get('analytics/orders-by-category')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get order count by category (Pie Chart)' })
  @ApiQuery({
    name: 'timeframe',
    required: false,
    enum: ['thisMonth', 'lastMonth', 'thisYear', 'lastYear'],
  })
  @ApiResponse({ status: 200, description: 'Orders by category retrieved' })
  getOrdersByCategory(@Query('timeframe') timeframe: string) {
    return this.ordersService.getOrdersByCategory(timeframe);
  }

  @Get('analytics/revenue-trend')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get revenue trend over time (Line Chart)' })
  @ApiResponse({ status: 200, description: 'Revenue trend retrieved' })
  getRevenueTrend() {
    return this.ordersService.getRevenueTrend();
  }
}
