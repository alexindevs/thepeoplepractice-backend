import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async createUser(
    email: string,
    password: string,
    role: 'admin' | 'customer',
  ) {
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException({
        message: 'Email already exists',
        code: 409,
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      role,
    });
    await newUser.save();

    return {
      message: 'User registered successfully',
      code: 201,
      data: { email: newUser.email, role: newUser.role },
    };
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async validateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  async generateJwtToken(user: UserDocument): Promise<string> {
    const payload = { email: user.email, role: user.role, sub: user._id };
    return this.jwtService.sign(payload);
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        code: 401,
        data: null,
      });
    }

    const token = await this.generateJwtToken(user);
    return {
      message: 'Login successful',
      code: 200,
      data: { token, user: { email: user.email, role: user.role } },
    };
  }
}
