export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: { message?: string } | undefined;
  MobileNumber: { intent: 'login' | 'create-account' };
  OtpVerification: { mobileNumber: string; intent: 'login' | 'create-account' };
  AccountNotFound: { mobileNumber: string };
  CreateAccount: { mobileNumber: string; verifiedPhoneToken: string };
  ResetPassword: { resetToken: string };

  BusinessType: undefined;
  BusinessInfo: undefined;
  OwnerInfo: undefined;
  StoreInfo: undefined;
  StoreLocation: undefined;
  GSTDetails: undefined;
  PANVerification: undefined;
  BusinessProof: undefined;
  BankDetails: undefined;

  KYCReview: undefined;
  VendorAgreement: undefined;
  KYCSubmission: undefined;
  KYCPending: undefined;
  KYCApproved: undefined;
  KYCRejected: { rejectionReason?: string } | undefined;

  StoreSetupIntro: undefined;
  StoreProfile: undefined;
  StoreLogoUpload: undefined;
  StoreCoverImage: undefined;
  StoreAddress: undefined;
  StoreLocationConfirm: undefined;
  OperatingHours: undefined;
  WeeklySchedule: undefined;
  HolidayClosure: undefined;
  HolidayForm: { holidayId?: string } | undefined;
  DeliverySettings: undefined;
  ServiceAvailability: undefined;
  StoreStatus: undefined;
  TempClosure: undefined;
  ClosureConfirmation: undefined;
  StoreSetupComplete: undefined;

  Dashboard: undefined;

  ProductCatalog: undefined;
  ProductSearch: undefined;
  ProductFilters: undefined;
  CategoryBrowse: undefined;
  CategoryProductListing: { categoryId: string };
  ProductDetails: { productId: string };

  AddProduct: undefined;
  ProductBasicInfo: undefined;
  ProductImages: undefined;
  ProductCategoryStep: undefined;
  ProductSubcategoryStep: { categoryId: string };
  ProductDescriptionStep: undefined;
  PackSizeVariant: undefined;
  ProductMRP: undefined;
  ProductSellingPrice: undefined;
  ProductDiscount: undefined;
  ProductTaxInfo: undefined;
  ProductSKU: undefined;
  ProductStockQuantity: undefined;
  ReviewProduct: undefined;
  PublishProduct: undefined;
  PublishSuccess: undefined;

  EditProduct: { productId: string };
  EditInformation: { productId: string };
  EditImages: { productId: string };
  EditPrice: { productId: string };
  EditStock: { productId: string };
  ActivateProduct: { productId: string };
  DeactivateProduct: { productId: string };
  DeleteProduct: { productId: string };
  DeleteConfirmation: { productName: string; sku: string };

  InventoryOverview: undefined;
  InStock: undefined;
  LowStock: undefined;
  OutOfStock: undefined;
  Unavailable: undefined;
  InventorySearch: undefined;
  InventoryFilter: undefined;
  ProductStockDetails: { productId: string };
  UpdateQuantity: { productId: string };
  BulkUpdate: { productIds?: string[] };
  StockAdjustment: { productId?: string };
  InventoryHistory: { productId?: string };
  LowStockAlert: undefined;
  OOSConfirmation: { productId: string };

  OrdersList: undefined;
  NewOrders: undefined;
  PreparingOrders: undefined;
  ReadyForDispatchOrders: undefined;
  DispatchedOrders: undefined;
  CompletedOrders: undefined;
  CancelledOrders: undefined;
  OrderDetails: { orderId: string };

  NewOrderReceived: { orderId: string };
  RejectReason: { orderId: string };
  RejectOrderConfirmation: { orderId: string; reasonLabel: string };
  ProductPicking: { orderId: string };
  ReadyForDispatchConfirm: { orderId: string };
  OrderDispatched: { orderId: string };
  OrderDelivered: { orderId: string };

  CancelledOrderDetails: { orderId: string };
  VendorCancelOrder: { orderId: string };
  CancellationReason: { orderId: string };
  CancellationConfirmation: { orderId: string; reasonLabel: string };
  OrderActionError: {
    orderId: string;
    action: 'accept' | 'reject' | 'preparing' | 'ready' | 'cancel';
    note?: string;
    message?: string;
  };

  PricingOverview: undefined;
  CategoryPricingList: { categoryId?: string; categoryName?: string };
  ProductPricingDetail: { productId: string };
  PricingCombinedEdit: { productId: string };
  MRPEditor: { productId: string };
  SellingPriceEditor: { productId: string };
  DiscountEditor: { productId: string };
  TaxEditor: { productId: string };
  PriceUpdated: { productId: string; headline: string; message: string };

  OffersOverview: undefined;
  ActiveOffers: undefined;
  ScheduledOffers: undefined;
  ExpiredOffers: undefined;
  OfferDetail: { offerId: string };
  CreateOffer: { offerId?: string };
  SelectOfferProducts: undefined;
  OfferConditions: undefined;
  OfferDiscountValue: undefined;
  OfferStartDate: undefined;
  OfferEndDate: undefined;
  OfferReview: undefined;
  PublishOffer: undefined;
  OfferPublished: { offerId: string };
  PauseOffer: { offerId: string };
  DeleteOffer: { offerId: string };

  PaymentsOverview: undefined;
  TotalSales: undefined;
  PendingSettlement: undefined;
  PaidSettlement: undefined;
  SettlementDetails: { settlementId: string };
  NetSettlement: undefined;
  SettlementHistory: undefined;
  ViewInvoice: { settlementId: string };

  AnalyticsOverview: undefined;
  SalesAnalytics: undefined;
  OrdersAnalytics: undefined;
  AverageOrderValue: undefined;
  BestSellingProducts: undefined;
  LowPerformingProducts: undefined;
  CancellationAnalytics: undefined;
  InventoryPerformance: undefined;

  Notifications: undefined;
  NewOrderNotification: { notificationId: string };
  OrderCancellationNotification: { notificationId: string };
  LowStockNotification: { notificationId: string };
  OutOfStockNotification: { notificationId: string };
  PaymentNotification: { notificationId: string };
  ProductApprovalNotification: { notificationId: string };
  KYCStatusNotification: { notificationId: string };
  NotificationDetail: { notificationId: string };
  ClearNotifications: undefined;

  HelpSupport: undefined;


  Profile: undefined;
  ProfileVendorInfo: undefined;
  ProfileEditVendorInfo: undefined;
  ProfileOwnerInfo: undefined;
  ProfileEditOwnerInfo: undefined;
  ProfileStoreInfo: undefined;
  ProfileEditStoreInfo: undefined;
  ProfileAddresses: undefined;
  ProfileAddAddress: undefined;
  ProfileAddressDetails: { addressId: string };
  ProfileDocuments: undefined;
  ProfileAddDocument: undefined;
  ProfileDocumentStatus: { documentId: string };
  ProfileReplaceDocument: { documentId: string };
  ProfileBankDetails: undefined;
  ProfileEditBankDetails: undefined;
  ProfileNotificationSettings: undefined;
  ProfileSecurity: undefined;

  SecurityLogout: undefined;

  PolicyTerms: undefined;
  PolicyPrivacy: undefined;
  PolicyVendorAgreement: undefined;
  PolicyCancellation: undefined;
  PolicySettlement: undefined;
};
