import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { Order, OrderDocument } from './schemas/orders.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async createOrder(orderData: any, userEmail: string) {
    const order = new this.orderModel({ ...orderData, createdBy: userEmail });
    await order.save();
    return {
      message: 'Order created successfully',
      code: 201,
      data: order,
    };
  }

  async getAllOrders(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find()
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(),
    ]);

    return {
      data: orders,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCustomerOrders(userEmail: string) {
    const orders = await this.orderModel.find({ createdBy: userEmail }).exec();
    return {
      message: 'Customer orders retrieved',
      code: 200,
      data: orders,
    };
  }

  async deleteOrder(orderId: string, userRole: string) {
    if (userRole !== 'admin') {
      throw new ForbiddenException({
        message: 'Only admins can delete orders',
        code: 403,
        data: null,
      });
    }
    const order = await this.orderModel.findByIdAndDelete(orderId);
    if (!order) {
      throw new NotFoundException({
        message: 'Order not found',
        code: 404,
        data: null,
      });
    }
    return {
      message: 'Order deleted successfully',
      code: 200,
      data: null,
    };
  }

  private getTimeframeFilter(timeframe: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (timeframe) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;

      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;

      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;

      default:
        return {};
    }

    return { orderDate: { $gte: startDate, $lte: endDate } };
  }

  private async calculatePercentageChange(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  async getTotalRevenue(timeframe: string) {
    const filter = this.getTimeframeFilter(timeframe);
    const previousFilter = this.getTimeframeFilter(
      timeframe === 'thisYear' ? 'lastYear' : 'lastMonth',
    );

    const currentResult = await this.orderModel.aggregate([
      { $match: filter },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } },
    ]);

    const previousResult = await this.orderModel.aggregate([
      { $match: previousFilter },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } },
    ]);

    const currentRevenue = currentResult[0]?.totalRevenue || 0;
    const previousRevenue = previousResult[0]?.totalRevenue || 0;
    const percentageChange = await this.calculatePercentageChange(
      currentRevenue,
      previousRevenue,
    );

    return {
      message: 'Total revenue retrieved',
      code: 200,
      data: { totalRevenue: currentRevenue, percentageChange },
    };
  }

  async getOrderCount(timeframe: string) {
    const filter = this.getTimeframeFilter(timeframe);
    const previousFilter = this.getTimeframeFilter(
      timeframe === 'thisYear' ? 'lastYear' : 'lastMonth',
    );

    const currentCount = await this.orderModel.countDocuments(filter);
    const previousCount = await this.orderModel.countDocuments(previousFilter);
    const percentageChange = await this.calculatePercentageChange(
      currentCount,
      previousCount,
    );

    return {
      message: 'Total order count retrieved',
      code: 200,
      data: { orderCount: currentCount, percentageChange },
    };
  }

  async getUniqueCustomers(timeframe: string) {
    const filter = this.getTimeframeFilter(timeframe);
    const previousFilter = this.getTimeframeFilter(
      timeframe === 'thisYear' ? 'lastYear' : 'lastMonth',
    );

    const currentResult = await this.orderModel.aggregate([
      { $match: filter },
      { $group: { _id: '$customerName' } },
      { $count: 'uniqueCustomers' },
    ]);

    const previousResult = await this.orderModel.aggregate([
      { $match: previousFilter },
      { $group: { _id: '$customerName' } },
      { $count: 'uniqueCustomers' },
    ]);

    const currentCount = currentResult[0]?.uniqueCustomers || 0;
    const previousCount = previousResult[0]?.uniqueCustomers || 0;
    const percentageChange = await this.calculatePercentageChange(
      currentCount,
      previousCount,
    );

    return {
      message: 'Unique customers count retrieved',
      code: 200,
      data: { uniqueCustomers: currentCount, percentageChange },
    };
  }

  async getOrdersByCategory(timeframe: string) {
    let startDate, endDate;

    if (timeframe === 'thisMonth') {
      startDate = moment().startOf('month').toDate();
      endDate = moment().endOf('month').toDate();
    } else if (timeframe === 'lastMonth') {
      startDate = moment().subtract(1, 'months').startOf('month').toDate();
      endDate = moment().subtract(1, 'months').endOf('month').toDate();
    } else if (timeframe === 'thisYear') {
      startDate = moment().startOf('year').toDate();
      endDate = moment().endOf('year').toDate();
    } else if (timeframe === 'lastYear') {
      startDate = moment().subtract(1, 'years').startOf('year').toDate();
      endDate = moment().subtract(1, 'years').endOf('year').toDate();
    } else {
      throw new BadRequestException('Invalid timeframe');
    }

    const result = await this.orderModel.aggregate([
      { $match: { orderDate: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: '$productCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return {
      message: `Orders by category retrieved for ${timeframe}`,
      code: 200,
      data: result,
    };
  }

  async getRevenueTrend() {
    const result = await this.orderModel.aggregate([
      {
        $group: { _id: { $month: '$orderDate' }, revenue: { $sum: '$price' } },
      },
      { $sort: { _id: 1 } },
    ]);
    return {
      message: 'Revenue trend retrieved',
      code: 200,
      data: result,
    };
  }
}
