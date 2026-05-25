export const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CUSTOMER: 'CUSTOMER',
  STOCK_MANAGER: 'STOCK_MANAGER',
  STOCK_INTERN: 'STOCK_INTERN',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const Authority = {
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',

  PRODUCT_READ: 'product:read',
  PRODUCT_WRITE: 'product:write',
  PRODUCT_DELETE: 'product:delete',
  PRODUCT_CATALOG: 'product:catalog',

  CATEGORY_READ: 'category:read',
  CATEGORY_WRITE: 'category:write',
  CATEGORY_DELETE: 'category:delete',

  ORDER_READ: 'order:read',
  ORDER_WRITE: 'order:write',
  ORDER_CANCEL: 'order:cancel',
  ORDER_MANAGE: 'order:manage',
  ORDER_OWN: 'order:own',

  PAYMENT_READ: 'payment:read',
  PAYMENT_MANAGE: 'payment:manage',

  DELIVERY_READ: 'delivery:read',
  DELIVERY_MANAGE: 'delivery:manage',

  CUSTOMER_READ: 'customer:read',
  CUSTOMER_WRITE: 'customer:write',
  CUSTOMER_DELETE: 'customer:delete',

  STOCK_READ: 'stock:read',
  STOCK_WRITE: 'stock:write',
  STOCK_COUNT: 'stock:count',
  STOCK_VALIDATE: 'stock:validate',

  REPORT_READ: 'report:read',
} as const

export type Authority = (typeof Authority)[keyof typeof Authority]
