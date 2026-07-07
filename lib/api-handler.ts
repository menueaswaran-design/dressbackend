import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { initializeApp as initFirebaseAdmin, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

let initialized = false;

export async function ensureInit() {
  if (initialized) return;
  initialized = true;

  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    }
  } catch (e: any) {
    console.warn('MongoDB connection failed:', e.message);
  }

  try {
    if (getApps().length === 0 && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID !== 'your-project-id') {
      initFirebaseAdmin({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
  } catch (e: any) {
    console.warn('Firebase initialization failed:', e.message);
  }

  const cloudinary: any = (await import('cloudinary')).v2;
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name') {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
  } catch (e: any) {
    console.warn('Cloudinary configuration failed:', e.message);
  }

  await import('../server/models');
}

export class ApiError extends Error {
  statusCode: number;
  errors: any[];
  isOperational: boolean;

  constructor(statusCode: number, message: string, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message: string, errors?: any[]) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}

export async function verifyToken(request: NextRequest) {
  await ensureInit();
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No token provided');
  }
  const token = authHeader.split(' ')[1];
  const decoded = await getAuth().verifyIdToken(token);

  const AdminUser = mongoose.model('AdminUser');
  const adminUser = await AdminUser.findOne({ firebaseUid: decoded.uid });
  if (!adminUser) {
    throw ApiError.unauthorized('Admin user not found');
  }
  return adminUser;
}

export async function verifyCustomerToken(request: NextRequest) {
  await ensureInit();
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No token provided');
  }
  const token = authHeader.split(' ')[1];
  const decoded = await getAuth().verifyIdToken(token);

  const Customer = mongoose.model('Customer');
  let customer = await Customer.findOne({ firebaseUid: decoded.uid });
  if (!customer) {
    customer = await Customer.findOne({ email: decoded.email });
    if (customer) {
      customer.firebaseUid = decoded.uid;
      await customer.save();
    } else {
      customer = await Customer.create({
        firebaseUid: decoded.uid,
        name: decoded.name || decoded.email?.split('@')[0] || 'Customer',
        email: decoded.email,
      });
    }
  }
  return customer;
}

export function authorize(...roles: string[]) {
  return (adminUser: any) => {
    if (!adminUser) throw ApiError.unauthorized();
    if (!roles.includes(adminUser.role)) {
      throw ApiError.forbidden('Insufficient permissions');
    }
  };
}

export function successResponse(data: any = null, message = 'Success', statusCode = 200) {
  return NextResponse.json({ success: true, message, data }, { status: statusCode });
}

export function createdResponse(data: any = null, message = 'Created successfully') {
  return successResponse(data, message, 201);
}

export function paginatedResponse(data: any, pagination: any, message = 'Success') {
  return NextResponse.json({ success: true, message, data, pagination });
}

export function noContentResponse(message = 'Deleted successfully') {
  return NextResponse.json({ success: true, message, data: null });
}

export function errorResponse(error: any) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let errors = error.errors || [];

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errors = Object.values(error.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue)[0];
    message = `Duplicate value for ${field}`;
  }

  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }

  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors.length > 0 ? { errors } : {}),
    },
    { status: statusCode }
  );
}

export async function parseBody(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    return request.formData();
  }
  return request.json();
}

export async function convertFormFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const ext = path.extname(file.name) || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  fs.writeFileSync(filepath, buffer);
  return {
    path: filepath,
    filename,
    originalname: file.name,
    size: file.size,
    mimetype: file.type,
  };
}
