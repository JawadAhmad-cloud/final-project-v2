# System Architecture Diagrams

## 1. Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              USER MANAGEMENT                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐                                                        │
│  │      User        │                                                        │
│  ├──────────────────┤                                                        │
│  │ _id (PK)         │                                                        │
│  │ username (U)     │                                                        │
│  │ email (U)        │────────────────┐                                       │
│  │ password         │                │                                       │
│  │ firstname        │                │                                       │
│  │ lastname         │                │                                       │
│  │ phonenumber      │                │                                       │
│  │ dob              │                │                                       │
│  │ role             │──────┐         │                                       │
│  │ addresses[]      │      │         │                                       │
│  │ isactive         │      │         │                                       │
│  │ isverified       │      │         │                                       │
│  │ currency         │      │         │                                       │
│  │ language         │      │         │                                       │
│  └──────────────────┘      │         │                                       │
│         │  (1)              │         │                                       │
│         │                   │         │                                       │
│         ├─ (M) ─────────────┼─────────┼──────────► ┌──────────────────┐     │
│         │                   │         │             │    Favourite     │     │
│         │                   │         │             ├──────────────────┤     │
│         │                   │         │             │ _id (PK)         │     │
│         │                   │         │             │ user (FK,U)      │     │
│         │                   │         │             │ products[]       │     │
│         │                   │         │             └──────────────────┘     │
│         │                   │         │                                       │
│         │                   │         └──────────────────────►               │
│         │                   │              (1) if role=seller                │
│         │                   │                                                 │
│         │                   ▼                                                 │
│         │            ┌──────────────────┐                                    │
│         │            │      Shop        │                                    │
│         │            ├──────────────────┤                                    │
│         │            │ _id (PK)         │                                    │
│         │            │ seller (FK,U)    │                                    │
│         │            │ shopname         │                                    │
│         │            │ description      │                                    │
│         │            │ products[]       │                                    │
│         │            │ contact          │                                    │
│         │            │ isverified       │                                    │
│         │            │ rating           │                                    │
│         │            │ earnings         │                                    │
│         │            └──────────────────┘                                    │
│         │                   │ (1)                                            │
│         │                   │                                                │
│         │                   ├─ (M) ─►  ┌──────────────────┐                 │
│         │                   │          │     Product      │                 │
│         │                   │          ├──────────────────┤                 │
│         │                   │          │ _id (PK)         │                 │
│         │                   │          │ seller (FK)      │                 │
│         │                   │          │ name             │                 │
│         │                   │          │ price            │                 │
│         │                   │          │ totalStock       │                 │
│         │                   │          │ availableStock   │                 │
│         │                   │          │ reservedStock    │                 │
│         │                   │          │ images           │                 │
│         │                   │          │ rating           │                 │
│         │                   │          │ reviews[]        │                 │
│         │                   │          │ status           │                 │
│         │                   │          └──────────────────┘                 │
│         │                   │                   │ (1)                        │
│         │                   │                   │                           │
│         │                   │                   ├─ (M) ─► ┌──────────────┐ │
│         │                   │                   │         │    Review    │ │
│         │                   │                   │         ├──────────────┤ │
│         │                   │                   │         │ _id (PK)     │ │
│         │                   │                   │         │ product (FK) │ │
│         │                   │                   │         │ user (FK)    │ │
│         │                   │                   │         │ rating       │ │
│         │                   │                   │         │ title        │ │
│         │                   │                   │         │ comment      │ │
│         │                   │                   │         │ verified     │ │
│         │                   │                   │         │ helpful      │ │
│         │                   │                   │         └──────────────┘ │
│         │                   │                   │                           │
│         └─────────────────────────────────────────────────────────────────► │
│            (M)                                                               │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                         TRANSACTION MANAGEMENT                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────┐                                                        │
│  │     Order        │                                                        │
│  ├──────────────────┤                                                        │
│  │ _id (PK)         │                                                        │
│  │ user (FK)────────┼───────────┐                                           │
│  │ seller (FK)──────┼───────┐   │                                           │
│  │ items[]          │       │   │                                           │
│  │ status           │       │   │                                           │
│  │ sellerStatus     │       │   │                                           │
│  │ totalAmount      │       │   │                                           │
│  │ totalPrice       │       │   │                                           │
│  │ shippingAddress  │       │   │                                           │
│  │ shipping         │       │   │                                           │
│  │ payment          │───┐   │   │                                           │
│  └──────────────────┘   │   │   │                                           │
│         │ (1)           │   │   │                                           │
│         │               │   │   │                                           │
│         ├─ (1) ──────────────┼───────────────────────┐                      │
│         │                │   │   │                   │                      │
│         │                │   │   │                   │                      │
│         │                ▼   │   │                   │                      │
│         │         ┌──────────────────┐               │                      │
│         │         │    Payment       │               │                      │
│         │         ├──────────────────┤               │                      │
│         │         │ _id (PK)         │               │                      │
│         │         │ orderId (FK)     │               │                      │
│         │         │ amount           │               │                      │
│         │         │ platformFee      │               │                      │
│         │         │ sellerAmount     │               │                      │
│         │         │ status           │               │                      │
│         │         │ paymentMethod    │               │                      │
│         │         │ transactionId    │               │                      │
│         │         │ checkoutData     │               │                      │
│         │         │ paidAt           │               │                      │
│         │         │ refundInfo       │               │                      │
│         │         └──────────────────┘               │                      │
│         │                                            │                      │
│         └────────────────────────────────────────────┤                      │
│                                                      │                      │
│                                                      ▼                      │
│                                              ┌──────────────┐               │
│                                              │     Shop     │               │
│                                              ├──────────────┤               │
│                                              │ _id (PK)     │               │
│                                              │ seller (FK)  │               │
│                                              │ ...          │               │
│                                              └──────────────┘               │
│                                                                              │
│                                                      │                      │
│                                                      └────────────────────┐ │
│                                                                           │ │
│                                                                           ▼ │
│                                                                  ┌──────────────┐
│                                                                  │    User      │
│                                                                  ├──────────────┤
│                                                                  │ _id (PK)     │
│                                                                  │ ...          │
│                                                                  └──────────────┘
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
U = Unique
(1) = One
(M) = Many
```

## 2. Data Flow Diagram (DFD) - Level 0

```
                         ┌──────────────────┐
                         │    Customer      │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │    Browse    │ │  Place Order │ │  Leave Review│
            │  Products   │ │              │ │              │
            └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                   │                │                │
                   └────────────────┼────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │  E-Commerce System   │
                        └──────┬──────────────┬─┘
                               │              │
                        ┌──────▼──┐    ┌────▼────┐
                        │ Database │    │ Stripe  │
                        │          │    │(Payment)│
                        └──────────┘    └─────────┘
                               │
                         ┌─────▼────┐
                         │  Seller  │
                         │ Dashboard│
                         └──────────┘
```

## 3. System Architecture - Three-Tier

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION TIER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React.js Frontend                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  ┌─────────────────┐  ┌────────────────────────┐  │   │
│  │  │ User Interface  │  │ Seller Dashboard       │  │   │
│  │  ├─────────────────┤  ├────────────────────────┤  │   │
│  │  │ Product Browse  │  │ Shop Management        │  │   │
│  │  │ Shopping Cart   │  │ Order Management       │  │   │
│  │  │ Checkout        │  │ Analytics              │  │   │
│  │  │ Order Tracking  │  │ Revenue Tracking       │  │   │
│  │  │ Reviews         │  │ Product Management     │  │   │
│  │  │ User Profile    │  │ Stock Management       │  │   │
│  │  └─────────────────┘  └────────────────────────┘  │   │
│  │                                                     │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 APPLICATION TIER                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Express.js Backend API Server              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│  │  │Controllers│ │ Middleware│ │ Routes & Services │  │   │
│  │  ├──────────┤ ├──────────┤ ├──────────────────┤  │   │
│  │  │User Auth │ │Authentication│ POST /auth/login   │  │   │
│  │  │Products  │ │Authorization │ GET /products      │  │   │
│  │  │Orders    │ │Validation    │ POST /orders       │  │   │
│  │  │Payments  │ │CORS          │ POST /payments     │  │   │
│  │  │Reviews   │ │Error Handler │ GET /reviews       │  │   │
│  │  │Seller    │ │Rate Limiting │ POST /shops        │  │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐ │   │
│  │  │      Business Logic & Data Validation        │ │   │
│  │  ├──────────────────────────────────────────────┤ │   │
│  │  │ Authentication  │ Product Management         │ │   │
│  │  │ Authorization   │ Inventory Tracking         │ │   │
│  │  │ Payment Process │ Order Status Management    │ │   │
│  │  │ Email Service   │ Revenue Calculation        │ │   │
│  │  │ Image Upload    │ Review Aggregation         │ │   │
│  │  └──────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                         │                                  │
│        ┌────────────────┼────────────────┐                │
│        │                │                │                │
│        ▼                ▼                ▼                │
│  ┌──────────┐    ┌──────────────┐  ┌──────────────┐   │
│  │Stripe API│    │ ImageKit API │  │ Email Service│   │
│  │(Payments)│    │(Images)      │  │              │   │
│  └──────────┘    └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │ MongoDB Query
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA TIER                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           MongoDB Database                         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │   │
│  │  │ Users  │ │Products│ │ Orders │ │ Shops  │    │   │
│  │  │        │ │        │ │        │ │        │    │   │
│  │  │-username│-name   │ │-user   │ │-seller │    │   │
│  │  │-email  │ │-price │ │-seller │ │-shopname│   │   │
│  │  │-role   │ │-stock │ │-items  │ │-products│   │   │
│  │  │-address│ │-seller│ │-status │ │-earnings│   │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘    │   │
│  │                                                     │   │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐│   │
│  │  │Payments│ │Reviews │ │Favourite │ │Inventory││   │
│  │  │        │ │        │ │          │ │Tracking ││   │
│  │  │-amount │ │-rating │ │-user     │ │-product ││   │
│  │  │-status │ │-comment│ │-products │ │-stock   ││   │
│  │  │-trans  │ │-verified│ │         │ │-reserved││   │
│  │  └────────┘ └────────┘ └──────────┘ └──────────┘│   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 4. API Request/Response Flow

```
┌─────────────────┐
│   Frontend      │
│   React App     │
└────────┬────────┘
         │
         │ 1. User Action (e.g., Add to Cart)
         │
         ▼
┌──────────────────────────────────────┐
│  HTTP Request                        │
│  POST /api/orders                    │
│  Headers: Authorization: Bearer JWT  │
│  Body: {items, shippingAddress}      │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Express.js Server                   │
│  1. Route Handler (POST /api/orders) │
│  2. Auth Middleware (verify JWT)     │
│  3. Validation (input validation)    │
│  4. Controller (order.controller.js) │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Business Logic                      │
│  1. Verify user authorization        │
│  2. Check product availability       │
│  3. Calculate totals & taxes         │
│  4. Save order to database           │
│  5. Update inventory                 │
│  6. Create payment session           │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Database Operations                 │
│  1. Insert Order document            │
│  2. Update Product stock             │
│  3. Create Payment record            │
│  4. Retrieve data for response       │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  HTTP Response                       │
│  Status: 201 Created                 │
│  Body: {orderId, stripeUrl}          │
│  Headers: Set-Cookie: session        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Frontend                            │
│  1. Update UI with response          │
│  2. Redirect to Stripe checkout      │
│  3. Show success/error message       │
└──────────────────────────────────────┘
```

## 5. Order Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    ORDER LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐
│   PENDING    │ ◄─── Order created, payment pending
└──────┬───────┘
       │
       │ [Seller accepts order]
       │
       ▼
┌──────────────┐
│  ACCEPTED    │ ◄─── Seller confirmed, preparing shipment
└──────┬───────┘
       │
       │ [Payment confirmed]
       │
       ▼
┌──────────────┐
│  SHIPPED     │ ◄─── Order dispatched with tracking
└──────┬───────┘
       │
       │ [In transit]
       │
       ▼
┌──────────────┐
│  DELIVERED   │ ◄─── Received by customer
└──────┬───────┘
       │
       │ [Customer can now review]
       │
       ▼
┌──────────────┐
│  COMPLETED   │ ◄─── Order finalized, seller paid
└──────────────┘

                    [REJECTION PATH]
┌──────────────┐
│   PENDING    │
└──────┬───────┘
       │
       │ [Seller rejects]
       │
       ▼
┌──────────────┐
│  REJECTED    │ ◄─── Order declined, refund issued
└──────────────┘

                  [CANCELLATION PATH]
┌──────────────┐
│   PENDING    │ ────► ┌───────────┐
│   or other   │       │ CANCELLED │ ◄─── User cancels, refund issued
└──────────────┘       └───────────┘
```

## 6. Payment Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│              PAYMENT PROCESSING FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. CHECKOUT INITIATION
   ┌─────────────┐
   │   Customer  │
   │ places order│
   └──────┬──────┘
          │
          ▼
   ┌─────────────────────────┐
   │ Backend creates Stripe  │
   │ checkout session        │
   └──────┬──────────────────┘

2. PAYMENT PROCESSING
   ┌──────────────────────────┐
   │ Frontend redirects to    │
   │ Stripe payment form      │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ Customer enters payment  │
   │ details (handled by      │
   │ Stripe, not stored)      │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ Stripe processes payment │
   │ Authorizes card/bank     │
   └──────┬───────────────────┘

3. PAYMENT CONFIRMATION
   ┌──────────────────────────┐
   │ Stripe sends webhook     │
   │ to backend               │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ Backend updates:         │
   │ - Order status: paid     │
   │ - Payment record         │
   │ - Inventory              │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ Frontend receives        │
   │ confirmation            │
   │ Shows success message    │
   └──────────────────────────┘

4. PAYMENT DISTRIBUTION
   ┌──────────────────────────┐
   │ Calculate fees:          │
   │ Total - Platform Fee =   │
   │ Seller Amount            │
   └──────┬───────────────────┘
          │
          ▼
   ┌──────────────────────────┐
   │ Credit seller earnings   │
   │ Record transaction       │
   └──────────────────────────┘
```

---

**Diagram Version**: 1.0  
**Created**: May 2026
