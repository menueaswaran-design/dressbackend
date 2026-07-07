import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

import {
  ensureInit,
  verifyToken,
  verifyCustomerToken,
  authorize,
  ApiError,
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse,
  errorResponse,
  convertFormFile,
} from '@/lib/api-handler';

import authService from '@/server/services/authService';
import productService from '@/server/services/productService';
import categoryService from '@/server/services/categoryService';
import collectionService from '@/server/services/collectionService';
import orderService from '@/server/services/orderService';
import customerService from '@/server/services/customerService';
import couponService from '@/server/services/couponService';
import homepageService from '@/server/services/homepageService';
import cmsService from '@/server/services/cmsService';
import navigationService from '@/server/services/navigationService';
import settingService from '@/server/services/settingService';
import mediaService from '@/server/services/mediaService';
import reportService from '@/server/services/reportService';
import notificationService from '@/server/services/notificationService';
import backupService from '@/server/services/backupService';

function matchPattern(pattern: string[], segments: string[]): Record<string, string> | null {
  if (pattern.length !== segments.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i].startsWith(':')) {
      params[pattern[i].slice(1)] = segments[i];
    } else if (pattern[i] !== segments[i]) {
      return null;
    }
  }
  return params;
}

interface RouteContext {
  request: NextRequest;
  params: Record<string, string>;
  query: URLSearchParams;
  body: any;
  adminUser: any;
  customer: any;
}

interface RouteDef {
  resource: string;
  pattern: string[];
  methods: string[];
  roles?: string[];
  handler: (ctx: RouteContext) => Promise<NextResponse>;
}

const routeDefs: RouteDef[] = [];

function def(
  resource: string,
  pattern: string[],
  methods: string[],
  handler: (ctx: RouteContext) => Promise<NextResponse>,
  opts?: { roles?: string[] }
) {
  routeDefs.push({ resource, pattern, methods, handler, roles: opts?.roles });
}

async function handleResource(
  request: NextRequest,
  resource: string,
  remaining: string[],
  method: string
): Promise<NextResponse> {
  const query = request.nextUrl.searchParams;
  let body: any = undefined;
  try {
    const ct = request.headers.get('content-type') || '';
    if (method !== 'GET' && method !== 'HEAD') {
      if (ct.includes('multipart/form-data')) {
        body = await request.formData();
      } else {
        body = await request.json();
      }
    }
  } catch {}

  for (const route of routeDefs) {
    if (route.resource !== resource) continue;
    if (!route.methods.includes(method)) continue;
    const routeParams = matchPattern(route.pattern, remaining);
    if (routeParams === null) continue;

    const authHeader = request.headers.get('authorization') || '';
    const needsAuth = route.roles !== undefined;

    let adminUser: any = undefined;
    let customer: any = undefined;

    if (needsAuth && route.roles!.length > 0 && !route.roles!.includes('customer')) {
      try {
        adminUser = await verifyToken(request);
      } catch (e: any) {
        return errorResponse(e);
      }
      if (route.roles!.length > 0) {
        try {
          authorize(...route.roles!)(adminUser);
        } catch (e: any) {
          return errorResponse(e);
        }
      }
    } else if (needsAuth && route.roles!.includes('customer')) {
      try {
        customer = await verifyCustomerToken(request);
      } catch (e: any) {
        return errorResponse(e);
      }
    }

    try {
      return await route.handler({
        request,
        params: routeParams,
        query,
        body,
        adminUser,
        customer,
      });
    } catch (e: any) {
      return errorResponse(e);
    }
  }

  return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
}

function getModel(name: string) {
  return mongoose.models[name] || (() => { throw new Error(`Model ${name} not registered`); })();
}

// ── Auth ──
def('auth', ['login'], ['POST'], async (ctx) => {
  const { idToken } = ctx.body;
  const firebaseUser = await authService.verifyFirebaseToken(idToken);
  const adminUser = await authService.findOrCreateAdmin(firebaseUser);
  await authService.logActivity(adminUser._id, 'login', 'AdminUser', adminUser._id, {}, {
    ip: ctx.request.headers.get('x-forwarded-for') || '',
    headers: { 'user-agent': ctx.request.headers.get('user-agent') || '' },
  });
  return successResponse({ admin: adminUser }, 'Login successful');
});

def('auth', ['profile'], ['GET'], async (ctx) => {
  const admin = await authService.getAdminProfile(ctx.adminUser._id);
  return successResponse({ admin });
}, { roles: ['admin'] });

def('auth', ['profile'], ['PUT'], async (ctx) => {
  const admin = await authService.updateAdminProfile(ctx.adminUser._id, ctx.body);
  if (!admin) return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
  await authService.logActivity(ctx.adminUser._id, 'update_profile', 'AdminUser', admin._id, ctx.body, {
    ip: ctx.request.headers.get('x-forwarded-for') || '',
    headers: { 'user-agent': ctx.request.headers.get('user-agent') || '' },
  });
  return successResponse({ admin }, 'Profile updated');
}, { roles: ['admin'] });

def('auth', ['admins'], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await authService.listAdmins(q);
  return paginatedResponse({ admins: data.admins }, { total: data.total, page: data.page, totalPages: data.totalPages });
}, { roles: ['super_admin'] });

def('auth', ['admins'], ['POST'], async (ctx) => {
  const admin = await authService.createAdmin(ctx.body);
  await authService.logActivity(ctx.adminUser._id, 'create_admin', 'AdminUser', admin._id, ctx.body, {
    ip: ctx.request.headers.get('x-forwarded-for') || '',
    headers: { 'user-agent': ctx.request.headers.get('user-agent') || '' },
  });
  return createdResponse({ admin }, 'Admin created');
}, { roles: ['super_admin'] });

def('auth', ['admins', ':id'], ['PUT'], async (ctx) => {
  const admin = await authService.updateAdmin(ctx.params.id, ctx.body);
  await authService.logActivity(ctx.adminUser._id, 'update_admin', 'AdminUser', admin._id, ctx.body, {
    ip: ctx.request.headers.get('x-forwarded-for') || '',
    headers: { 'user-agent': ctx.request.headers.get('user-agent') || '' },
  });
  return successResponse({ admin }, 'Admin updated');
}, { roles: ['super_admin'] });

def('auth', ['admins', ':id'], ['DELETE'], async (ctx) => {
  await authService.deleteAdmin(ctx.params.id);
  await authService.logActivity(ctx.adminUser._id, 'delete_admin', 'AdminUser', ctx.params.id, {}, {
    ip: ctx.request.headers.get('x-forwarded-for') || '',
    headers: { 'user-agent': ctx.request.headers.get('user-agent') || '' },
  });
  return noContentResponse('Admin deleted');
}, { roles: ['super_admin'] });

def('auth', ['admins', ':id', 'disable'], ['PATCH'], async (ctx) => {
  const admin = await authService.disableAdmin(ctx.params.id);
  return successResponse({ admin }, 'Admin disabled');
}, { roles: ['super_admin'] });

def('auth', ['admins', ':id', 'enable'], ['PATCH'], async (ctx) => {
  const admin = await authService.enableAdmin(ctx.params.id);
  return successResponse({ admin }, 'Admin enabled');
}, { roles: ['super_admin'] });

// ── Dashboard ──
def('dashboard', ['stats'], ['GET'], async (ctx) => {
  const Product = getModel('Product');
  const [orderStats, totalCust, returningCust, totalProducts, lowStock, outOfStock] = await Promise.all([
    orderService.getDashboardStats(),
    customerService.getTotalCustomers(),
    customerService.getReturningCustomers(),
    Product.countDocuments({ isDeleted: false }),
    productService.getLowStockProducts(),
    productService.getOutOfStockProducts(),
  ]);
  return successResponse({
    ...orderStats,
    totalCustomers: totalCust,
    returningCustomers: returningCust,
    totalProducts,
    lowStockProducts: lowStock?.length || 0,
    outOfStockProducts: outOfStock?.length || 0,
  });
}, { roles: ['admin'] });

def('dashboard', ['charts'], ['GET'], async (ctx) => {
  const charts = await reportService.getDashboardCharts();
  return successResponse(charts);
}, { roles: ['admin'] });

// ── Products ──
def('products', [], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await productService.listProducts(q);
  return paginatedResponse(data.products, data.pagination);
});

def('products', ['slug', ':slug'], ['GET'], async (ctx) => {
  const product = await productService.getProductBySlug(ctx.params.slug);
  if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  return successResponse({ product });
});

def('products', [':id'], ['GET'], async (ctx) => {
  const product = await productService.getProductById(ctx.params.id);
  if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  return successResponse({ product });
});

def('products', [], ['POST'], async (ctx) => {
  const product = await productService.createProduct(ctx.body);
  return createdResponse({ product }, 'Product created');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('products', [':id'], ['PUT'], async (ctx) => {
  const product = await productService.updateProduct(ctx.params.id, ctx.body);
  return successResponse({ product }, 'Product updated');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('products', [':id'], ['DELETE'], async (ctx) => {
  await productService.deleteProduct(ctx.params.id);
  return noContentResponse('Product deleted');
}, { roles: ['super_admin', 'admin'] });

def('products', [':id', 'restore'], ['PATCH'], async (ctx) => {
  const product = await productService.restoreProduct(ctx.params.id);
  return successResponse({ product }, 'Product restored');
}, { roles: ['super_admin', 'admin'] });

def('products', ['bulk', 'delete'], ['POST'], async (ctx) => {
  await productService.bulkDeleteProducts(ctx.body.ids);
  return noContentResponse('Products deleted');
}, { roles: ['super_admin', 'admin'] });

def('products', ['bulk', 'status'], ['POST'], async (ctx) => {
  await productService.bulkUpdateStatus(ctx.body.ids, ctx.body.isActive);
  return successResponse(null, 'Products updated');
}, { roles: ['super_admin', 'admin'] });

def('products', ['upload', 'images'], ['POST'], async (ctx) => {
  const fd = ctx.body;
  const files: File[] = [];
  if (fd instanceof FormData) {
    for (const [, val] of fd.entries()) {
      if (val instanceof File) files.push(val);
    }
  }
  if (files.length === 0) {
    return NextResponse.json({ success: false, message: 'No files uploaded' }, { status: 400 });
  }
  const converted = await Promise.all(files.map((f) => convertFormFile(f)));
  const images = await mediaService.uploadMultiple(converted, 'dress/products');
  return successResponse({ images }, 'Images uploaded');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('products', ['images', ':publicId'], ['DELETE'], async (ctx) => {
  await mediaService.deleteImage(ctx.params.publicId);
  return noContentResponse('Image deleted');
}, { roles: ['admin'] });

// ── Categories ──
def('categories', [], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await categoryService.listCategories(q);
  return paginatedResponse(data.categories || data, data.pagination || {});
});

def('categories', ['slug', ':slug'], ['GET'], async (ctx) => {
  const category = await categoryService.getCategoryBySlug(ctx.params.slug);
  if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  return successResponse({ category });
});

def('categories', [':id'], ['GET'], async (ctx) => {
  const category = await categoryService.getCategoryById(ctx.params.id);
  if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  return successResponse({ category });
});

def('categories', [], ['POST'], async (ctx) => {
  const category = await categoryService.createCategory(ctx.body);
  return createdResponse({ category }, 'Category created');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('categories', [':id'], ['PUT'], async (ctx) => {
  const category = await categoryService.updateCategory(ctx.params.id, ctx.body);
  return successResponse({ category }, 'Category updated');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('categories', [':id'], ['DELETE'], async (ctx) => {
  await categoryService.deleteCategory(ctx.params.id);
  return noContentResponse('Category deleted');
}, { roles: ['super_admin', 'admin'] });

// ── Collections ──
def('collections', [], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await collectionService.listCollections(q);
  return paginatedResponse(data.collections || data, data.pagination || {});
});

def('collections', ['slug', ':slug'], ['GET'], async (ctx) => {
  const collection = await collectionService.getCollectionBySlug(ctx.params.slug);
  if (!collection) return NextResponse.json({ success: false, message: 'Collection not found' }, { status: 404 });
  return successResponse({ collection });
});

def('collections', [':id'], ['GET'], async (ctx) => {
  const collection = await collectionService.getCollectionById(ctx.params.id);
  if (!collection) return NextResponse.json({ success: false, message: 'Collection not found' }, { status: 404 });
  return successResponse({ collection });
}, { roles: ['admin'] });

def('collections', [], ['POST'], async (ctx) => {
  const collection = await collectionService.createCollection(ctx.body);
  return createdResponse({ collection }, 'Collection created');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('collections', [':id'], ['PUT'], async (ctx) => {
  const collection = await collectionService.updateCollection(ctx.params.id, ctx.body);
  return successResponse({ collection }, 'Collection updated');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('collections', [':id'], ['DELETE'], async (ctx) => {
  await collectionService.deleteCollection(ctx.params.id);
  return noContentResponse('Collection deleted');
}, { roles: ['super_admin', 'admin'] });

def('collections', [':id', 'products'], ['POST'], async (ctx) => {
  const collection = await collectionService.addProductsToCollection(ctx.params.id, ctx.body.productIds);
  return successResponse({ collection }, 'Products added');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('collections', [':id', 'products'], ['DELETE'], async (ctx) => {
  const collection = await collectionService.removeProductsFromCollection(ctx.params.id, ctx.body.productIds);
  return successResponse({ collection }, 'Products removed');
}, { roles: ['super_admin', 'admin', 'product_manager'] });

// ── Orders ──
def('orders', ['my', 'all'], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await orderService.listCustomerOrders(ctx.customer._id, q);
  return paginatedResponse(data.orders, data.pagination);
}, { roles: ['customer'] });

def('orders', ['my', ':id'], ['GET'], async (ctx) => {
  const order = await orderService.getCustomerOrder(ctx.customer._id, ctx.params.id);
  if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  return successResponse({ order });
}, { roles: ['customer'] });

def('orders', ['checkout'], ['POST'], async (ctx) => {
  const { shippingAddress, paymentMethod } = ctx.body;
  const order = await orderService.createOrderFromCart(ctx.customer, shippingAddress, paymentMethod);
  return createdResponse({ order }, 'Order placed successfully');
}, { roles: ['customer'] });

def('orders', ['number', ':orderNumber'], ['GET'], async (ctx) => {
  const order = await orderService.getOrderByNumber(ctx.params.orderNumber);
  if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  return successResponse({ order });
}, { roles: ['admin'] });

def('orders', [], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await orderService.listOrders(q);
  return paginatedResponse(data.orders, data.pagination);
}, { roles: ['admin'] });

def('orders', [':id'], ['GET'], async (ctx) => {
  const order = await orderService.getOrderById(ctx.params.id);
  if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  return successResponse({ order });
}, { roles: ['admin'] });

def('orders', [], ['POST'], async (ctx) => {
  const order = await orderService.createOrder(ctx.body);
  await notificationService.sendOrderNotification(order);
  return createdResponse({ order }, 'Order created');
}, { roles: ['super_admin', 'admin', 'order_manager'] });

def('orders', [':id', 'status'], ['PATCH'], async (ctx) => {
  const { status, notes } = ctx.body;
  const order = await orderService.updateOrderStatus(ctx.params.id, status, notes);
  return successResponse({ order }, 'Order status updated');
}, { roles: ['super_admin', 'admin', 'order_manager'] });

def('orders', [':id', 'payment'], ['PATCH'], async (ctx) => {
  const { status, transactionId } = ctx.body;
  const order = await orderService.updatePaymentStatus(ctx.params.id, status, transactionId);
  return successResponse({ order }, 'Payment status updated');
}, { roles: ['super_admin', 'admin', 'order_manager'] });

def('orders', [':id'], ['DELETE'], async (ctx) => {
  await orderService.deleteOrder(ctx.params.id);
  return noContentResponse('Order deleted');
}, { roles: ['super_admin', 'admin'] });

// ── Customers ──
def('customers', [], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await customerService.listCustomers(q);
  return paginatedResponse(data.customers || data, data.pagination || {});
}, { roles: ['admin'] });

def('customers', [':id'], ['GET'], async (ctx) => {
  const customer = await customerService.getCustomerById(ctx.params.id);
  if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
  return successResponse({ customer });
}, { roles: ['admin'] });

def('customers', [':id'], ['PUT'], async (ctx) => {
  const customer = await customerService.updateCustomer(ctx.params.id, ctx.body);
  return successResponse({ customer }, 'Customer updated');
}, { roles: ['super_admin', 'admin', 'customer_support'] });

def('customers', [':id'], ['DELETE'], async (ctx) => {
  await customerService.deleteCustomer(ctx.params.id);
  return noContentResponse('Customer deleted');
}, { roles: ['super_admin', 'admin'] });

// ── Coupons ──
def('coupons', [], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await couponService.listCoupons(q);
  return paginatedResponse(data.coupons || data, data.pagination || {});
}, { roles: ['admin'] });

def('coupons', [':id'], ['GET'], async (ctx) => {
  const coupon = await couponService.getCouponById(ctx.params.id);
  if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
  return successResponse({ coupon });
}, { roles: ['admin'] });

def('coupons', [], ['POST'], async (ctx) => {
  const coupon = await couponService.createCoupon(ctx.body);
  return createdResponse({ coupon }, 'Coupon created');
}, { roles: ['super_admin', 'admin'] });

def('coupons', ['validate'], ['POST'], async (ctx) => {
  const { code, cartTotal } = ctx.body;
  const result: any = await couponService.validateCoupon(code, cartTotal, ctx.customer._id);
  return successResponse(result, result.valid ? 'Coupon applied' : 'Invalid coupon');
}, { roles: ['customer'] });

def('coupons', [':id'], ['PUT'], async (ctx) => {
  const coupon = await couponService.updateCoupon(ctx.params.id, ctx.body);
  return successResponse({ coupon }, 'Coupon updated');
}, { roles: ['super_admin', 'admin'] });

def('coupons', [':id'], ['DELETE'], async (ctx) => {
  await couponService.deleteCoupon(ctx.params.id);
  return noContentResponse('Coupon deleted');
}, { roles: ['super_admin', 'admin'] });

// ── Homepage ──
def('homepage', ['sections'], ['GET'], async (ctx) => {
  const sections = await homepageService.getAllSections();
  return successResponse({ sections });
});

def('homepage', ['sections', ':type'], ['GET'], async (ctx) => {
  const section = await homepageService.getSectionByType(ctx.params.type);
  if (!section) return NextResponse.json({ success: false, message: 'Section not found' }, { status: 404 });
  return successResponse({ section });
});

def('homepage', ['sections', ':type'], ['PUT'], async (ctx) => {
  const section = await homepageService.upsertSection(ctx.params.type, ctx.body);
  return successResponse({ section }, 'Section updated');
}, { roles: ['super_admin', 'admin'] });

def('homepage', ['hero-banners'], ['PUT'], async (ctx) => {
  const result = await homepageService.updateHeroBanners(ctx.body);
  return successResponse(result, 'Hero banners updated');
}, { roles: ['super_admin', 'admin'] });

def('homepage', ['announcement-bar'], ['PUT'], async (ctx) => {
  const result = await homepageService.updateAnnouncementBar(ctx.body);
  return successResponse(result, 'Announcement bar updated');
}, { roles: ['super_admin', 'admin'] });

def('homepage', ['newsletter'], ['PUT'], async (ctx) => {
  const result = await homepageService.updateNewsletter(ctx.body);
  return successResponse(result, 'Newsletter updated');
}, { roles: ['super_admin', 'admin'] });

def('homepage', ['instagram'], ['PUT'], async (ctx) => {
  const result = await homepageService.updateInstagram(ctx.body);
  return successResponse(result, 'Instagram updated');
}, { roles: ['super_admin', 'admin'] });

def('homepage', [], ['POST'], async (ctx) => {
  const { announcement, banners, newsletter } = ctx.body;
  const operations = [];
  if (banners) operations.push(homepageService.updateHeroBanners({ heroBanners: banners }));
  if (announcement) operations.push(homepageService.updateAnnouncementBar(announcement));
  if (newsletter) operations.push(homepageService.updateNewsletter(newsletter));
  await Promise.all(operations);
  return successResponse(null, 'Homepage saved');
}, { roles: ['super_admin', 'admin'] });

// ── CMS ──
def('cms', [], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await cmsService.listPages(q);
  return paginatedResponse(data.pages || data, data.pagination || {});
}, { roles: ['admin'] });

def('cms', ['slug', ':slug'], ['GET'], async (ctx) => {
  const page = await cmsService.getPageBySlug(ctx.params.slug);
  if (!page) return NextResponse.json({ success: false, message: 'Page not found' }, { status: 404 });
  return successResponse({ page });
});

def('cms', [':id'], ['GET'], async (ctx) => {
  const page = await cmsService.getPageById(ctx.params.id);
  if (!page) return NextResponse.json({ success: false, message: 'Page not found' }, { status: 404 });
  return successResponse({ page });
}, { roles: ['admin'] });

def('cms', [], ['POST'], async (ctx) => {
  const page = await cmsService.createPage(ctx.body);
  return createdResponse({ page }, 'Page created');
}, { roles: ['super_admin', 'admin'] });

def('cms', [':id'], ['PUT'], async (ctx) => {
  const page = await cmsService.updatePage(ctx.params.id, ctx.body);
  return successResponse({ page }, 'Page updated');
}, { roles: ['super_admin', 'admin'] });

def('cms', [':id'], ['DELETE'], async (ctx) => {
  await cmsService.deletePage(ctx.params.id);
  return noContentResponse('Page deleted');
}, { roles: ['super_admin', 'admin'] });

// ── Navigation ──
def('navigation', [':location'], ['GET'], async (ctx) => {
  const navigation = await navigationService.getNavigationByLocation(ctx.params.location);
  if (!navigation) return NextResponse.json({ success: false, message: 'Navigation not found' }, { status: 404 });
  return successResponse({ navigation });
});

def('navigation', [':location'], ['PUT'], async (ctx) => {
  const navigation = await navigationService.upsertNavigation(ctx.params.location, ctx.body);
  return successResponse({ navigation }, 'Navigation updated');
}, { roles: ['super_admin', 'admin'] });

def('navigation', [':location', 'items'], ['PATCH'], async (ctx) => {
  const navigation = await navigationService.updateNavigationItems(ctx.params.location, ctx.body.items);
  return successResponse({ navigation }, 'Navigation items updated');
}, { roles: ['super_admin', 'admin'] });

// ── Settings ──
def('settings', [], ['GET'], async (ctx) => {
  const settings = await settingService.getAllSettings();
  return successResponse({ settings });
}, { roles: ['admin'] });

def('settings', [':group'], ['GET'], async (ctx) => {
  const settings = await settingService.getSettingsByGroup(ctx.params.group);
  return successResponse({ settings });
}, { roles: ['admin'] });

def('settings', [':group'], ['PUT'], async (ctx) => {
  const { key, value, description } = ctx.body;
  const result = await settingService.upsertSetting(ctx.params.group, key, value, description);
  return successResponse({ setting: result }, 'Setting updated');
}, { roles: ['super_admin', 'admin'] });

def('settings', [':group', 'bulk'], ['POST'], async (ctx) => {
  const result = await settingService.bulkUpsertSettings(ctx.params.group, ctx.body.settings);
  return successResponse({ settings: result }, 'Settings updated');
}, { roles: ['super_admin', 'admin'] });

// ── Media ──
def('media', [], ['GET'], async (ctx) => {
  const folder = ctx.query.get('folder') || 'dress';
  const nextCursor = ctx.query.get('nextCursor') || undefined;
  const data = await mediaService.listImages(folder, nextCursor);
  return successResponse(data);
}, { roles: ['admin'] });

def('media', ['upload'], ['POST'], async (ctx) => {
  const fd = ctx.body;
  let file: File | null = null;
  if (fd instanceof FormData) {
    for (const [, val] of fd.entries()) {
      if (val instanceof File) { file = val; break; }
    }
  }
  if (!file) return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
  const converted = await convertFormFile(file);
  const image = await mediaService.uploadImage(converted);
  return createdResponse({ image }, 'File uploaded');
}, { roles: ['admin'] });

def('media', ['upload-multiple'], ['POST'], async (ctx) => {
  const fd = ctx.body;
  const files: File[] = [];
  if (fd instanceof FormData) {
    for (const [, val] of fd.entries()) {
      if (val instanceof File) files.push(val);
    }
  }
  if (files.length === 0) {
    return NextResponse.json({ success: false, message: 'No files uploaded' }, { status: 400 });
  }
  const converted = await Promise.all(files.map((f) => convertFormFile(f)));
  const images = await mediaService.uploadMultiple(converted);
  return createdResponse({ images }, 'Files uploaded');
}, { roles: ['admin'] });

def('media', [':publicId'], ['DELETE'], async (ctx) => {
  await mediaService.deleteImage(ctx.params.publicId);
  return noContentResponse('File deleted');
}, { roles: ['super_admin', 'admin'] });

def('media', ['bulk-delete'], ['POST'], async (ctx) => {
  await mediaService.bulkDeleteImages(ctx.body.publicIds);
  return noContentResponse('Files deleted');
}, { roles: ['super_admin', 'admin'] });

// ── Reports ──
def('reports', ['sales'], ['GET'], async (ctx) => {
  const startDate = ctx.query.get('startDate') || undefined;
  const endDate = ctx.query.get('endDate') || undefined;
  const data = await reportService.getSalesReport(startDate, endDate);
  return successResponse(data);
}, { roles: ['super_admin', 'admin'] });

def('reports', ['inventory'], ['GET'], async (ctx) => {
  const data = await reportService.getInventoryReport();
  return successResponse(data);
}, { roles: ['super_admin', 'admin', 'product_manager'] });

def('reports', ['customers'], ['GET'], async (ctx) => {
  const data = await reportService.getCustomerReport();
  return successResponse(data);
}, { roles: ['super_admin', 'admin'] });

def('reports', ['coupons'], ['GET'], async (ctx) => {
  const data = await reportService.getCouponReport();
  return successResponse(data);
}, { roles: ['super_admin', 'admin'] });

// ── Notifications ──
def('notifications', ['unread', 'count'], ['GET'], async (ctx) => {
  const count = await notificationService.getUnreadCount('Admin', ctx.adminUser._id);
  return successResponse({ count });
}, { roles: ['admin'] });

def('notifications', [], ['GET'], async (ctx) => {
  const q = Object.fromEntries(ctx.query.entries());
  const data = await notificationService.listNotifications(q);
  return paginatedResponse(data.notifications || data, data.pagination || {});
}, { roles: ['admin'] });

def('notifications', [':id', 'read'], ['PATCH'], async (ctx) => {
  await notificationService.markAsRead(ctx.params.id);
  return successResponse(null, 'Notification marked as read');
}, { roles: ['admin'] });

def('notifications', ['mark-all-read'], ['POST'], async (ctx) => {
  await notificationService.markAllAsRead('Admin', ctx.adminUser._id);
  return successResponse(null, 'All notifications marked as read');
}, { roles: ['admin'] });

// ── Backup ──
def('backup', ['create'], ['POST'], async (ctx) => {
  const backup = await backupService.createDatabaseBackup();
  return createdResponse({ backup }, 'Backup created');
}, { roles: ['super_admin'] });

def('backup', [], ['GET'], async (ctx) => {
  const backups = await backupService.listBackups();
  return successResponse({ backups });
}, { roles: ['super_admin'] });

def('backup', ['restore'], ['POST'], async (ctx) => {
  const { filename } = ctx.body;
  const result = await backupService.restoreBackup(filename);
  return successResponse(result, 'Backup restored');
}, { roles: ['super_admin'] });

// ── Cart ──
def('cart', [], ['GET'], async (ctx) => {
  await ctx.customer.populate('cart.product', 'name slug sellingPrice mrp images stock');
  return successResponse({ cart: ctx.customer.cart || [] });
}, { roles: ['customer'] });

def('cart', [], ['POST'], async (ctx) => {
  const { productId, quantity = 1, size, color } = ctx.body;
  const Product = getModel('Product');
  const product = await Product.findById(productId);
  if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

  const existingIndex = ctx.customer.cart.findIndex(
    (item: any) => item.product.toString() === productId && item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    ctx.customer.cart[existingIndex].quantity = Math.min(
      ctx.customer.cart[existingIndex].quantity + quantity,
      product.stock || 99
    );
  } else {
    ctx.customer.cart.push({
      product: productId,
      name: product.name,
      price: product.sellingPrice,
      quantity,
      size,
      color,
      image: product.images?.[0]?.url || '',
      stock: product.stock || 99,
    });
  }

  await ctx.customer.save();
  await ctx.customer.populate('cart.product', 'name slug sellingPrice mrp images stock');
  return successResponse({ cart: ctx.customer.cart }, 'Added to cart');
}, { roles: ['customer'] });

def('cart', [':itemId'], ['PUT'], async (ctx) => {
  const { quantity } = ctx.body;
  const item = ctx.customer.cart.id(ctx.params.itemId);
  if (!item) return NextResponse.json({ success: false, message: 'Item not found in cart' }, { status: 404 });
  item.quantity = Math.max(1, quantity);
  await ctx.customer.save();
  await ctx.customer.populate('cart.product', 'name slug sellingPrice mrp images stock');
  return successResponse({ cart: ctx.customer.cart }, 'Cart updated');
}, { roles: ['customer'] });

def('cart', [':itemId'], ['DELETE'], async (ctx) => {
  ctx.customer.cart = ctx.customer.cart.filter((item: any) => item._id.toString() !== ctx.params.itemId);
  await ctx.customer.save();
  await ctx.customer.populate('cart.product', 'name slug sellingPrice mrp images stock');
  return successResponse({ cart: ctx.customer.cart }, 'Removed from cart');
}, { roles: ['customer'] });

def('cart', [], ['DELETE'], async (ctx) => {
  ctx.customer.cart = [];
  await ctx.customer.save();
  return successResponse({ cart: [] }, 'Cart cleared');
}, { roles: ['customer'] });

// ── Wishlist ──
def('wishlist', [], ['GET'], async (ctx) => {
  await ctx.customer.populate('wishlist', 'name slug sellingPrice mrp images stock');
  return successResponse({ wishlist: ctx.customer.wishlist || [] });
}, { roles: ['customer'] });

def('wishlist', [], ['POST'], async (ctx) => {
  const { productId } = ctx.body;
  const Product = getModel('Product');
  const product = await Product.findById(productId);
  if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

  const exists = ctx.customer.wishlist.some((id: any) => id.toString() === productId);
  if (!exists) {
    ctx.customer.wishlist.push(productId);
    await ctx.customer.save();
  }

  await ctx.customer.populate('wishlist', 'name slug sellingPrice mrp images stock');
  return successResponse({ wishlist: ctx.customer.wishlist }, 'Added to wishlist');
}, { roles: ['customer'] });

def('wishlist', [':productId'], ['DELETE'], async (ctx) => {
  ctx.customer.wishlist = ctx.customer.wishlist.filter((id: any) => id.toString() !== ctx.params.productId);
  await ctx.customer.save();
  await ctx.customer.populate('wishlist', 'name slug sellingPrice mrp images stock');
  return successResponse({ wishlist: ctx.customer.wishlist }, 'Removed from wishlist');
}, { roles: ['customer'] });

// ── HTTP Method Handlers ──
async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  await ensureInit();
  const { path: rawPath } = await params;
  const segments = rawPath || [];
  if (segments.length === 0) return NextResponse.json({ success: false, message: 'Route not found' }, { status: 404 });
  const resource = segments[0];
  const remaining = segments.slice(1);
  return handleResource(request, resource, remaining, request.method);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}
