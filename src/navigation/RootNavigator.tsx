import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { VendorAuthProvider } from '../context/VendorAuthContext';
import { RegistrationProvider } from '../context/RegistrationContext';
import { StoreSetupProvider } from '../context/StoreSetupContext';
import { ProductCatalogProvider } from '../context/ProductCatalogContext';
import { ProductDraftProvider } from '../context/ProductDraftContext';
import { InventoryProvider } from '../context/InventoryContext';
import { OrdersProvider } from '../context/OrdersContext';
import { OffersProvider } from '../context/OffersContext';
import { OfferDraftProvider } from '../context/OfferDraftContext';
import { PaymentsProvider } from '../context/PaymentsContext';
import { AnalyticsProvider } from '../context/AnalyticsContext';
import { NotificationsProvider } from '../context/NotificationsContext';
import { SupportProvider } from '../context/SupportContext';
import { SupportDraftProvider } from '../context/SupportDraftContext';
import { DisputesProvider } from '../context/DisputesContext';
import { ProfileProvider } from '../context/ProfileContext';
import { SecurityProvider } from '../context/SecurityContext';
import { PoliciesProvider } from '../context/PoliciesContext';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { MobileNumberScreen } from '../screens/auth/MobileNumberScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { AccountNotFoundScreen } from '../screens/auth/AccountNotFoundScreen';
import { CreateAccountScreen } from '../screens/auth/CreateAccountScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';

import { BusinessTypeScreen } from '../screens/registration/BusinessTypeScreen';
import { BusinessInfoScreen } from '../screens/registration/BusinessInfoScreen';
import { OwnerInfoScreen } from '../screens/registration/OwnerInfoScreen';
import { StoreInfoScreen } from '../screens/registration/StoreInfoScreen';
import { StoreLocationScreen } from '../screens/registration/StoreLocationScreen';
import { GSTDetailsScreen } from '../screens/registration/GSTDetailsScreen';
import { PANVerificationScreen } from '../screens/registration/PANVerificationScreen';
import { BusinessProofScreen } from '../screens/registration/BusinessProofScreen';
import { BankDetailsScreen } from '../screens/registration/BankDetailsScreen';

import { KYCReviewScreen } from '../screens/kyc/KYCReviewScreen';
import { VendorAgreementScreen } from '../screens/kyc/VendorAgreementScreen';
import { KYCSubmissionScreen } from '../screens/kyc/KYCSubmissionScreen';
import { KYCPendingScreen } from '../screens/kyc/KYCPendingScreen';
import { KYCApprovedScreen } from '../screens/kyc/KYCApprovedScreen';
import { KYCRejectedScreen } from '../screens/kyc/KYCRejectedScreen';
import { RegistrationCompleteScreen } from '../screens/kyc/RegistrationCompleteScreen';

import { StoreSetupIntroScreen } from '../screens/store-setup/StoreSetupIntroScreen';
import { StoreProfileScreen } from '../screens/store-setup/StoreProfileScreen';
import { StoreLogoUploadScreen } from '../screens/store-setup/StoreLogoUploadScreen';
import { StoreCoverImageScreen } from '../screens/store-setup/StoreCoverImageScreen';
import { StoreAddressScreen } from '../screens/store-setup/StoreAddressScreen';
import { StoreLocationConfirmScreen } from '../screens/store-setup/StoreLocationConfirmScreen';
import { OperatingHoursScreen } from '../screens/store-setup/OperatingHoursScreen';
import { WeeklyScheduleScreen } from '../screens/store-setup/WeeklyScheduleScreen';
import { HolidayClosureScreen } from '../screens/store-setup/HolidayClosureScreen';
import { HolidayFormScreen } from '../screens/store-setup/HolidayFormScreen';
import { DeliverySettingsScreen } from '../screens/store-setup/DeliverySettingsScreen';
import { ServiceAvailabilityScreen } from '../screens/store-setup/ServiceAvailabilityScreen';
import { StoreStatusScreen } from '../screens/store-setup/StoreStatusScreen';
import { TempClosureScreen } from '../screens/store-setup/TempClosureScreen';
import { ClosureConfirmationScreen } from '../screens/store-setup/ClosureConfirmationScreen';
import { StoreSetupCompleteScreen } from '../screens/store-setup/StoreSetupCompleteScreen';

import { DashboardScreen } from '../screens/dashboard/DashboardScreen';

import { ProductCatalogScreen } from '../screens/catalog/ProductCatalogScreen';
import { ProductSearchScreen } from '../screens/catalog/ProductSearchScreen';
import { ProductFiltersScreen } from '../screens/catalog/ProductFiltersScreen';
import { CategoryBrowseScreen } from '../screens/catalog/CategoryBrowseScreen';
import { CategoryProductListingScreen } from '../screens/catalog/CategoryProductListingScreen';
import { ProductDetailsScreen } from '../screens/catalog/ProductDetailsScreen';

import { AddProductScreen } from '../screens/add-product/AddProductScreen';
import { ProductBasicInfoScreen } from '../screens/add-product/ProductBasicInfoScreen';
import { BrandPickerScreen } from '../screens/add-product/BrandPickerScreen';
import { ProductImagesScreen } from '../screens/add-product/ProductImagesScreen';
import { ProductCategoryStepScreen } from '../screens/add-product/ProductCategoryStepScreen';
import { ProductSubcategoryStepScreen } from '../screens/add-product/ProductSubcategoryStepScreen';
import { ProductDescriptionStepScreen } from '../screens/add-product/ProductDescriptionStepScreen';
import { PackSizeVariantScreen } from '../screens/add-product/PackSizeVariantScreen';
import { ProductMRPScreen } from '../screens/add-product/ProductMRPScreen';
import { ProductSellingPriceScreen } from '../screens/add-product/ProductSellingPriceScreen';
import { ProductDiscountScreen } from '../screens/add-product/ProductDiscountScreen';
import { ProductTaxInfoScreen } from '../screens/add-product/ProductTaxInfoScreen';
import { ProductSKUScreen } from '../screens/add-product/ProductSKUScreen';
import { ProductBarcodeScreen } from '../screens/add-product/ProductBarcodeScreen';
import { ProductStockQuantityScreen } from '../screens/add-product/ProductStockQuantityScreen';
import { ProductAvailabilityScreen } from '../screens/add-product/ProductAvailabilityScreen';
import { ReviewProductScreen } from '../screens/add-product/ReviewProductScreen';
import { PublishProductScreen } from '../screens/add-product/PublishProductScreen';
import { PublishSuccessScreen } from '../screens/add-product/PublishSuccessScreen';

import { EditProductScreen } from '../screens/edit-product/EditProductScreen';
import { EditInformationScreen } from '../screens/edit-product/EditInformationScreen';
import { EditImagesScreen } from '../screens/edit-product/EditImagesScreen';
import { EditPriceScreen } from '../screens/edit-product/EditPriceScreen';
import { EditStockScreen } from '../screens/edit-product/EditStockScreen';
import { ActivateProductScreen } from '../screens/edit-product/ActivateProductScreen';
import { DeactivateProductScreen } from '../screens/edit-product/DeactivateProductScreen';
import { DeleteProductScreen } from '../screens/edit-product/DeleteProductScreen';
import { DeleteConfirmationScreen } from '../screens/edit-product/DeleteConfirmationScreen';

import { InventoryOverviewScreen } from '../screens/inventory/InventoryOverviewScreen';
import { InStockScreen } from '../screens/inventory/InStockScreen';
import { LowStockScreen } from '../screens/inventory/LowStockScreen';
import { OutOfStockScreen } from '../screens/inventory/OutOfStockScreen';
import { UnavailableScreen } from '../screens/inventory/UnavailableScreen';
import { InventorySearchScreen } from '../screens/inventory/InventorySearchScreen';
import { InventoryFilterScreen } from '../screens/inventory/InventoryFilterScreen';
import { ProductStockDetailsScreen } from '../screens/inventory/ProductStockDetailsScreen';
import { UpdateQuantityScreen } from '../screens/inventory/UpdateQuantityScreen';
import { BulkUpdateScreen } from '../screens/inventory/BulkUpdateScreen';
import { StockAdjustmentScreen } from '../screens/inventory/StockAdjustmentScreen';
import { InventoryHistoryScreen } from '../screens/inventory/InventoryHistoryScreen';
import { LowStockAlertScreen } from '../screens/inventory/LowStockAlertScreen';
import { OOSConfirmationScreen } from '../screens/inventory/OOSConfirmationScreen';

import { OrdersListScreen } from '../screens/orders/OrdersListScreen';
import { NewOrdersScreen } from '../screens/orders/NewOrdersScreen';
import { PreparingOrdersScreen } from '../screens/orders/PreparingOrdersScreen';
import { QualityCheckScreen } from '../screens/orders/QualityCheckScreen';
import { PackingScreen } from '../screens/orders/PackingScreen';
import { ReadyForDispatchScreen } from '../screens/orders/ReadyForDispatchScreen';
import { DispatchedScreen } from '../screens/orders/DispatchedScreen';
import { CompletedOrdersScreen } from '../screens/orders/CompletedOrdersScreen';
import { CancelledOrdersScreen } from '../screens/orders/CancelledOrdersScreen';
import { FailedOrdersScreen } from '../screens/orders/FailedOrdersScreen';
import { OrderDetailsScreen } from '../screens/orders/OrderDetailsScreen';

import { NewOrderReceivedScreen } from '../screens/order-flow/NewOrderReceivedScreen';
import { AcceptOrderConfirmScreen } from '../screens/order-flow/AcceptOrderConfirmScreen';
import { RejectOrderWarningScreen } from '../screens/order-flow/RejectOrderWarningScreen';
import { RejectReasonScreen } from '../screens/order-flow/RejectReasonScreen';
import { RejectOrderConfirmationScreen } from '../screens/order-flow/RejectOrderConfirmationScreen';
import { InventoryCheckScreen } from '../screens/order-flow/InventoryCheckScreen';
import { ProductPickingScreen } from '../screens/order-flow/ProductPickingScreen';
import { ItemAvailabilityScreen } from '../screens/order-flow/ItemAvailabilityScreen';
import { MissingItemDecisionScreen } from '../screens/order-flow/MissingItemDecisionScreen';
import { ReplaceItemScreen } from '../screens/order-flow/ReplaceItemScreen';
import { RemoveItemScreen } from '../screens/order-flow/RemoveItemScreen';
import { OrderUpdatedScreen } from '../screens/order-flow/OrderUpdatedScreen';
import { QualityCheckFlowScreen } from '../screens/order-flow/QualityCheckFlowScreen';
import { QCFailedDecisionScreen } from '../screens/order-flow/QCFailedDecisionScreen';
import { QCPassedScreen } from '../screens/order-flow/QCPassedScreen';
import { PackingStartScreen } from '../screens/order-flow/PackingStartScreen';
import { PackingInProgressScreen } from '../screens/order-flow/PackingInProgressScreen';
import { PackingCompleteScreen } from '../screens/order-flow/PackingCompleteScreen';
import { ReadyForDispatchConfirmScreen } from '../screens/order-flow/ReadyForDispatchConfirmScreen';
import { DispatchQueueScreen } from '../screens/order-flow/DispatchQueueScreen';
import { PartnerAssignedScreen } from '../screens/order-flow/PartnerAssignedScreen';
import { HandoverChecklistScreen } from '../screens/order-flow/HandoverChecklistScreen';
import { HandoverConfirmationScreen } from '../screens/order-flow/HandoverConfirmationScreen';
import { OrderDispatchedScreen } from '../screens/order-flow/OrderDispatchedScreen';
import { OrderDeliveredScreen } from '../screens/order-flow/OrderDeliveredScreen';

import { CancelledOrderDetailsScreen } from '../screens/order-exceptions/CancelledOrderDetailsScreen';
import { VendorCancelOrderScreen } from '../screens/order-exceptions/VendorCancelOrderScreen';
import { CancellationReasonScreen } from '../screens/order-exceptions/CancellationReasonScreen';
import { CancellationConfirmationScreen } from '../screens/order-exceptions/CancellationConfirmationScreen';
import { FailedOrderDetailsScreen } from '../screens/order-exceptions/FailedOrderDetailsScreen';
import { OrderActionErrorScreen } from '../screens/order-exceptions/OrderActionErrorScreen';
import { RetryingActionScreen } from '../screens/order-exceptions/RetryingActionScreen';
import { ActionRecoveredScreen } from '../screens/order-exceptions/ActionRecoveredScreen';

import { PricingOverviewScreen } from '../screens/pricing/PricingOverviewScreen';
import { CategoryPricingListScreen } from '../screens/pricing/CategoryPricingListScreen';
import { ProductPricingDetailScreen } from '../screens/pricing/ProductPricingDetailScreen';
import { PricingCombinedEditScreen } from '../screens/pricing/PricingCombinedEditScreen';
import { MRPEditorScreen } from '../screens/pricing/MRPEditorScreen';
import { SellingPriceEditorScreen } from '../screens/pricing/SellingPriceEditorScreen';
import { DiscountEditorScreen } from '../screens/pricing/DiscountEditorScreen';
import { TaxEditorScreen } from '../screens/pricing/TaxEditorScreen';
import { PriceReviewScreen } from '../screens/pricing/PriceReviewScreen';
import { PriceUpdatedScreen } from '../screens/pricing/PriceUpdatedScreen';
import { PriceUpdateErrorScreen } from '../screens/pricing/PriceUpdateErrorScreen';

import { OffersScreen } from '../screens/offers/OffersScreen';
import { ActiveOffersScreen } from '../screens/offers/ActiveOffersScreen';
import { ScheduledOffersScreen } from '../screens/offers/ScheduledOffersScreen';
import { ExpiredOffersScreen } from '../screens/offers/ExpiredOffersScreen';
import { OfferDetailScreen } from '../screens/offers/OfferDetailScreen';
import { CreateOfferScreen } from '../screens/offers/CreateOfferScreen';
import { SelectOfferProductsScreen } from '../screens/offers/SelectOfferProductsScreen';
import { OfferConditionsScreen } from '../screens/offers/OfferConditionsScreen';
import { OfferDiscountValueScreen } from '../screens/offers/OfferDiscountValueScreen';
import { OfferStartDateScreen } from '../screens/offers/OfferStartDateScreen';
import { OfferEndDateScreen } from '../screens/offers/OfferEndDateScreen';
import { OfferReviewScreen } from '../screens/offers/OfferReviewScreen';
import { PublishOfferScreen } from '../screens/offers/PublishOfferScreen';
import { OfferPublishedScreen } from '../screens/offers/OfferPublishedScreen';
import { PauseOfferScreen } from '../screens/offers/PauseOfferScreen';
import { DeleteOfferScreen } from '../screens/offers/DeleteOfferScreen';

import { PaymentsOverviewScreen } from '../screens/payments/PaymentsOverviewScreen';
import { TotalSalesScreen } from '../screens/payments/TotalSalesScreen';
import { PendingSettlementScreen } from '../screens/payments/PendingSettlementScreen';
import { PaidSettlementScreen } from '../screens/payments/PaidSettlementScreen';
import { DeductionsScreen } from '../screens/payments/DeductionsScreen';
import { SettlementDetailsScreen } from '../screens/payments/SettlementDetailsScreen';
import { CommissionScreen } from '../screens/payments/CommissionScreen';
import { TaxesScreen } from '../screens/payments/TaxesScreen';
import { AdjustmentsScreen } from '../screens/payments/AdjustmentsScreen';
import { NetSettlementScreen } from '../screens/payments/NetSettlementScreen';
import { SettlementHistoryScreen } from '../screens/payments/SettlementHistoryScreen';
import { TransactionDetailsScreen } from '../screens/payments/TransactionDetailsScreen';
import { InvoiceScreen } from '../screens/payments/InvoiceScreen';
import { ViewInvoiceScreen } from '../screens/payments/ViewInvoiceScreen';
import { DownloadInvoiceScreen } from '../screens/payments/DownloadInvoiceScreen';
import { PaymentErrorScreen } from '../screens/payments/PaymentErrorScreen';
import { SettlementIssueScreen } from '../screens/payments/SettlementIssueScreen';

import { AnalyticsOverviewScreen } from '../screens/analytics/AnalyticsOverviewScreen';
import { SalesAnalyticsScreen } from '../screens/analytics/SalesAnalyticsScreen';
import { OrdersAnalyticsScreen } from '../screens/analytics/OrdersAnalyticsScreen';
import { RevenueAnalyticsScreen } from '../screens/analytics/RevenueAnalyticsScreen';
import { AverageOrderValueScreen } from '../screens/analytics/AverageOrderValueScreen';
import { BestSellingProductsScreen } from '../screens/analytics/BestSellingProductsScreen';
import { LowPerformingProductsScreen } from '../screens/analytics/LowPerformingProductsScreen';
import { CancellationAnalyticsScreen } from '../screens/analytics/CancellationAnalyticsScreen';
import { InventoryPerformanceScreen } from '../screens/analytics/InventoryPerformanceScreen';
import { SettlementSummaryScreen } from '../screens/analytics/SettlementSummaryScreen';

import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { NewOrderNotificationScreen } from '../screens/notifications/NewOrderNotificationScreen';
import { OrderCancellationNotificationScreen } from '../screens/notifications/OrderCancellationNotificationScreen';
import { LowStockNotificationScreen } from '../screens/notifications/LowStockNotificationScreen';
import { OutOfStockNotificationScreen } from '../screens/notifications/OutOfStockNotificationScreen';
import { PaymentNotificationScreen } from '../screens/notifications/PaymentNotificationScreen';
import { SettlementNotificationScreen } from '../screens/notifications/SettlementNotificationScreen';
import { ProductApprovalNotificationScreen } from '../screens/notifications/ProductApprovalNotificationScreen';
import { KYCStatusNotificationScreen } from '../screens/notifications/KYCStatusNotificationScreen';
import { StoreStatusNotificationScreen } from '../screens/notifications/StoreStatusNotificationScreen';
import { SystemAlertNotificationScreen } from '../screens/notifications/SystemAlertNotificationScreen';
import { AnnouncementNotificationScreen } from '../screens/notifications/AnnouncementNotificationScreen';
import { NotificationDetailScreen } from '../screens/notifications/NotificationDetailScreen';
import { ClearNotificationsScreen } from '../screens/notifications/ClearNotificationsScreen';

import { HelpSupportScreen } from '../screens/support/HelpSupportScreen';
import { SupportCategoriesScreen } from '../screens/support/SupportCategoriesScreen';
import { SelectIssueScreen } from '../screens/support/SelectIssueScreen';
import { IssueDetailsScreen } from '../screens/support/IssueDetailsScreen';
import { UploadEvidenceScreen } from '../screens/support/UploadEvidenceScreen';
import { PreviewEvidenceScreen } from '../screens/support/PreviewEvidenceScreen';
import { SubmitTicketScreen } from '../screens/support/SubmitTicketScreen';
import { TicketCreatedScreen } from '../screens/support/TicketCreatedScreen';
import { TicketDetailsScreen } from '../screens/support/TicketDetailsScreen';
import { TicketStatusScreen } from '../screens/support/TicketStatusScreen';
import { SupportResponseScreen } from '../screens/support/SupportResponseScreen';
import { TicketResolvedScreen } from '../screens/support/TicketResolvedScreen';
import { ReopenTicketScreen } from '../screens/support/ReopenTicketScreen';
import { EscalateTicketScreen } from '../screens/support/EscalateTicketScreen';
import { TicketClosedScreen } from '../screens/support/TicketClosedScreen';

import { DisputeCustomerIssueScreen } from '../screens/disputes/DisputeCustomerIssueScreen';
import { DisputeIssueDetailsScreen } from '../screens/disputes/DisputeIssueDetailsScreen';
import { DisputeVendorReviewScreen } from '../screens/disputes/DisputeVendorReviewScreen';
import { DisputeAcceptIssueScreen } from '../screens/disputes/DisputeAcceptIssueScreen';
import { DisputeIssueDisputeScreen } from '../screens/disputes/DisputeIssueDisputeScreen';
import { DisputeUploadEvidenceScreen } from '../screens/disputes/DisputeUploadEvidenceScreen';
import { DisputeSubmitScreen } from '../screens/disputes/DisputeSubmitScreen';
import { DisputeSupportReviewScreen } from '../screens/disputes/DisputeSupportReviewScreen';
import { DisputeDecisionScreen } from '../screens/disputes/DisputeDecisionScreen';
import { DisputeSettlementAdjustmentScreen } from '../screens/disputes/DisputeSettlementAdjustmentScreen';
import { DisputeResolvedScreen } from '../screens/disputes/DisputeResolvedScreen';

import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { ProfileVendorInfoScreen } from '../screens/profile/ProfileVendorInfoScreen';
import { ProfileEditVendorInfoScreen } from '../screens/profile/ProfileEditVendorInfoScreen';
import { ProfileOwnerInfoScreen } from '../screens/profile/ProfileOwnerInfoScreen';
import { ProfileEditOwnerInfoScreen } from '../screens/profile/ProfileEditOwnerInfoScreen';
import { ProfileStoreInfoScreen } from '../screens/profile/ProfileStoreInfoScreen';
import { ProfileEditStoreInfoScreen } from '../screens/profile/ProfileEditStoreInfoScreen';
import { ProfileAddressesScreen } from '../screens/profile/ProfileAddressesScreen';
import { ProfileAddAddressScreen } from '../screens/profile/ProfileAddAddressScreen';
import { ProfileAddressDetailsScreen } from '../screens/profile/ProfileAddressDetailsScreen';
import { ProfileDocumentsScreen } from '../screens/profile/ProfileDocumentsScreen';
import { ProfileAddDocumentScreen } from '../screens/profile/ProfileAddDocumentScreen';
import { ProfileDocumentStatusScreen } from '../screens/profile/ProfileDocumentStatusScreen';
import { ProfileReplaceDocumentScreen } from '../screens/profile/ProfileReplaceDocumentScreen';
import { ProfileBankDetailsScreen } from '../screens/profile/ProfileBankDetailsScreen';
import { ProfileEditBankDetailsScreen } from '../screens/profile/ProfileEditBankDetailsScreen';
import { ProfileNotificationSettingsScreen } from '../screens/profile/ProfileNotificationSettingsScreen';
import { ProfileSecurityScreen } from '../screens/profile/ProfileSecurityScreen';

import { SecurityChangeMobileNumberScreen } from '../screens/security/SecurityChangeMobileNumberScreen';
import { SecurityChangeMobileOtpScreen } from '../screens/security/SecurityChangeMobileOtpScreen';
import { SecurityChangePinScreen } from '../screens/security/SecurityChangePinScreen';
import { SecurityActiveSessionsScreen } from '../screens/security/SecurityActiveSessionsScreen';
import { SecurityLoginHistoryScreen } from '../screens/security/SecurityLoginHistoryScreen';
import { SecurityLogoutScreen } from '../screens/security/SecurityLogoutScreen';
import { SecurityLogoutConfirmationScreen } from '../screens/security/SecurityLogoutConfirmationScreen';
import { SecurityDeleteAccountConfirmScreen } from '../screens/security/SecurityDeleteAccountConfirmScreen';

import { PolicyTermsScreen } from '../screens/policies/PolicyTermsScreen';
import { PolicyPrivacyScreen } from '../screens/policies/PolicyPrivacyScreen';
import { PolicyVendorAgreementScreen } from '../screens/policies/PolicyVendorAgreementScreen';
import { PolicyCancellationScreen } from '../screens/policies/PolicyCancellationScreen';
import { PolicySettlementScreen } from '../screens/policies/PolicySettlementScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function RootNavigator() {
  return (
    <VendorAuthProvider>
    <RegistrationProvider>
    <StoreSetupProvider>
    <ProductCatalogProvider>
    <ProductDraftProvider>
    <InventoryProvider>
    <OrdersProvider>
    <OffersProvider>
    <OfferDraftProvider>
    <PaymentsProvider>
    <AnalyticsProvider>
    <NotificationsProvider>
    <SupportProvider>
    <SupportDraftProvider>
    <DisputesProvider>
    <ProfileProvider>
    <SecurityProvider>
    <PoliciesProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          <Stack.Screen name="AccountNotFound" component={AccountNotFoundScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          <Stack.Screen name="BusinessType" component={BusinessTypeScreen} />
          <Stack.Screen name="BusinessInfo" component={BusinessInfoScreen} />
          <Stack.Screen name="OwnerInfo" component={OwnerInfoScreen} />
          <Stack.Screen name="StoreInfo" component={StoreInfoScreen} />
          <Stack.Screen
            name="StoreLocation"
            component={StoreLocationScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="GSTDetails" component={GSTDetailsScreen} />
          <Stack.Screen name="PANVerification" component={PANVerificationScreen} />
          <Stack.Screen name="BusinessProof" component={BusinessProofScreen} />
          <Stack.Screen name="BankDetails" component={BankDetailsScreen} />

          <Stack.Screen name="KYCReview" component={KYCReviewScreen} />
          <Stack.Screen
            name="VendorAgreement"
            component={VendorAgreementScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="KYCSubmission"
            component={KYCSubmissionScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="KYCPending" component={KYCPendingScreen} />
          <Stack.Screen name="KYCApproved" component={KYCApprovedScreen} />
          <Stack.Screen name="KYCRejected" component={KYCRejectedScreen} />
          <Stack.Screen
            name="RegistrationComplete"
            component={RegistrationCompleteScreen}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen name="StoreSetupIntro" component={StoreSetupIntroScreen} />
          <Stack.Screen name="StoreProfile" component={StoreProfileScreen} />
          <Stack.Screen name="StoreLogoUpload" component={StoreLogoUploadScreen} />
          <Stack.Screen name="StoreCoverImage" component={StoreCoverImageScreen} />
          <Stack.Screen name="StoreAddress" component={StoreAddressScreen} />
          <Stack.Screen
            name="StoreLocationConfirm"
            component={StoreLocationConfirmScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="OperatingHours" component={OperatingHoursScreen} />
          <Stack.Screen name="WeeklySchedule" component={WeeklyScheduleScreen} />
          <Stack.Screen name="HolidayClosure" component={HolidayClosureScreen} />
          <Stack.Screen name="HolidayForm" component={HolidayFormScreen} />
          <Stack.Screen name="DeliverySettings" component={DeliverySettingsScreen} />
          <Stack.Screen name="ServiceAvailability" component={ServiceAvailabilityScreen} />
          <Stack.Screen name="StoreStatus" component={StoreStatusScreen} />
          <Stack.Screen
            name="TempClosure"
            component={TempClosureScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="ClosureConfirmation" component={ClosureConfirmationScreen} />
          <Stack.Screen
            name="StoreSetupComplete"
            component={StoreSetupCompleteScreen}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen name="ProductCatalog" component={ProductCatalogScreen} />
          <Stack.Screen
            name="ProductSearch"
            component={ProductSearchScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="ProductFilters"
            component={ProductFiltersScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="CategoryBrowse" component={CategoryBrowseScreen} />
          <Stack.Screen name="CategoryProductListing" component={CategoryProductListingScreen} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

          <Stack.Screen name="AddProduct" component={AddProductScreen} />
          <Stack.Screen name="ProductBasicInfo" component={ProductBasicInfoScreen} />
          <Stack.Screen
            name="BrandPicker"
            component={BrandPickerScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="ProductImages" component={ProductImagesScreen} />
          <Stack.Screen name="ProductCategoryStep" component={ProductCategoryStepScreen} />
          <Stack.Screen name="ProductSubcategoryStep" component={ProductSubcategoryStepScreen} />
          <Stack.Screen name="ProductDescriptionStep" component={ProductDescriptionStepScreen} />
          <Stack.Screen name="PackSizeVariant" component={PackSizeVariantScreen} />
          <Stack.Screen name="ProductMRP" component={ProductMRPScreen} />
          <Stack.Screen name="ProductSellingPrice" component={ProductSellingPriceScreen} />
          <Stack.Screen name="ProductDiscount" component={ProductDiscountScreen} />
          <Stack.Screen name="ProductTaxInfo" component={ProductTaxInfoScreen} />
          <Stack.Screen name="ProductSKU" component={ProductSKUScreen} />
          <Stack.Screen name="ProductBarcode" component={ProductBarcodeScreen} />
          <Stack.Screen name="ProductStockQuantity" component={ProductStockQuantityScreen} />
          <Stack.Screen name="ProductAvailability" component={ProductAvailabilityScreen} />
          <Stack.Screen name="ReviewProduct" component={ReviewProductScreen} />
          <Stack.Screen name="PublishProduct" component={PublishProductScreen} />
          <Stack.Screen
            name="PublishSuccess"
            component={PublishSuccessScreen}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen name="EditProduct" component={EditProductScreen} />
          <Stack.Screen name="EditInformation" component={EditInformationScreen} />
          <Stack.Screen name="EditImages" component={EditImagesScreen} />
          <Stack.Screen name="EditPrice" component={EditPriceScreen} />
          <Stack.Screen name="EditStock" component={EditStockScreen} />
          <Stack.Screen
            name="ActivateProduct"
            component={ActivateProductScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="DeactivateProduct"
            component={DeactivateProductScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="DeleteProduct"
            component={DeleteProductScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="DeleteConfirmation"
            component={DeleteConfirmationScreen}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen name="InventoryOverview" component={InventoryOverviewScreen} />
          <Stack.Screen name="InStock" component={InStockScreen} />
          <Stack.Screen name="LowStock" component={LowStockScreen} />
          <Stack.Screen name="OutOfStock" component={OutOfStockScreen} />
          <Stack.Screen name="Unavailable" component={UnavailableScreen} />
          <Stack.Screen
            name="InventorySearch"
            component={InventorySearchScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="InventoryFilter"
            component={InventoryFilterScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="ProductStockDetails" component={ProductStockDetailsScreen} />
          <Stack.Screen name="UpdateQuantity" component={UpdateQuantityScreen} />
          <Stack.Screen name="BulkUpdate" component={BulkUpdateScreen} />
          <Stack.Screen name="StockAdjustment" component={StockAdjustmentScreen} />
          <Stack.Screen name="InventoryHistory" component={InventoryHistoryScreen} />
          <Stack.Screen name="LowStockAlert" component={LowStockAlertScreen} />
          <Stack.Screen
            name="OOSConfirmation"
            component={OOSConfirmationScreen}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen name="OrdersList" component={OrdersListScreen} />
          <Stack.Screen name="NewOrders" component={NewOrdersScreen} />
          <Stack.Screen name="PreparingOrders" component={PreparingOrdersScreen} />
          <Stack.Screen name="QualityCheckOrders" component={QualityCheckScreen} />
          <Stack.Screen name="PackingOrders" component={PackingScreen} />
          <Stack.Screen name="ReadyForDispatchOrders" component={ReadyForDispatchScreen} />
          <Stack.Screen name="DispatchedOrders" component={DispatchedScreen} />
          <Stack.Screen name="CompletedOrders" component={CompletedOrdersScreen} />
          <Stack.Screen name="CancelledOrders" component={CancelledOrdersScreen} />
          <Stack.Screen name="FailedOrders" component={FailedOrdersScreen} />
          <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />

          <Stack.Screen name="NewOrderReceived" component={NewOrderReceivedScreen} />
          <Stack.Screen name="AcceptOrderConfirm" component={AcceptOrderConfirmScreen} />
          <Stack.Screen name="RejectOrderWarning" component={RejectOrderWarningScreen} />
          <Stack.Screen name="RejectReason" component={RejectReasonScreen} />
          <Stack.Screen
            name="RejectOrderConfirmation"
            component={RejectOrderConfirmationScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="InventoryCheck"
            component={InventoryCheckScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="ProductPicking" component={ProductPickingScreen} />
          <Stack.Screen name="ItemAvailability" component={ItemAvailabilityScreen} />
          <Stack.Screen name="MissingItemDecision" component={MissingItemDecisionScreen} />
          <Stack.Screen name="ReplaceItem" component={ReplaceItemScreen} />
          <Stack.Screen name="RemoveItem" component={RemoveItemScreen} />
          <Stack.Screen name="OrderUpdated" component={OrderUpdatedScreen} />
          <Stack.Screen name="QualityCheckFlow" component={QualityCheckFlowScreen} />
          <Stack.Screen name="QCFailedDecision" component={QCFailedDecisionScreen} />
          <Stack.Screen name="QCPassed" component={QCPassedScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="PackingStart" component={PackingStartScreen} />
          <Stack.Screen name="PackingInProgress" component={PackingInProgressScreen} />
          <Stack.Screen
            name="PackingComplete"
            component={PackingCompleteScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="ReadyForDispatchConfirm" component={ReadyForDispatchConfirmScreen} />
          <Stack.Screen
            name="DispatchQueue"
            component={DispatchQueueScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="PartnerAssigned" component={PartnerAssignedScreen} />
          <Stack.Screen name="HandoverChecklist" component={HandoverChecklistScreen} />
          <Stack.Screen name="HandoverConfirmation" component={HandoverConfirmationScreen} />
          <Stack.Screen
            name="OrderDispatched"
            component={OrderDispatchedScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="OrderDelivered"
            component={OrderDeliveredScreen}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen name="CancelledOrderDetails" component={CancelledOrderDetailsScreen} />
          <Stack.Screen name="VendorCancelOrder" component={VendorCancelOrderScreen} />
          <Stack.Screen name="CancellationReason" component={CancellationReasonScreen} />
          <Stack.Screen
            name="CancellationConfirmation"
            component={CancellationConfirmationScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="FailedOrderDetails" component={FailedOrderDetailsScreen} />
          <Stack.Screen name="OrderActionError" component={OrderActionErrorScreen} />
          <Stack.Screen
            name="RetryingAction"
            component={RetryingActionScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="ActionRecovered"
            component={ActionRecoveredScreen}
            options={{ gestureEnabled: false }}
          />

          <Stack.Screen name="PricingOverview" component={PricingOverviewScreen} />
          <Stack.Screen name="CategoryPricingList" component={CategoryPricingListScreen} />
          <Stack.Screen name="ProductPricingDetail" component={ProductPricingDetailScreen} />
          <Stack.Screen name="PricingCombinedEdit" component={PricingCombinedEditScreen} />
          <Stack.Screen name="MRPEditor" component={MRPEditorScreen} />
          <Stack.Screen name="SellingPriceEditor" component={SellingPriceEditorScreen} />
          <Stack.Screen name="DiscountEditor" component={DiscountEditorScreen} />
          <Stack.Screen name="TaxEditor" component={TaxEditorScreen} />
          <Stack.Screen name="PriceReview" component={PriceReviewScreen} />
          <Stack.Screen
            name="PriceUpdated"
            component={PriceUpdatedScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="PriceUpdateError" component={PriceUpdateErrorScreen} />

          <Stack.Screen name="OffersOverview" component={OffersScreen} />
          <Stack.Screen name="ActiveOffers" component={ActiveOffersScreen} />
          <Stack.Screen name="ScheduledOffers" component={ScheduledOffersScreen} />
          <Stack.Screen name="ExpiredOffers" component={ExpiredOffersScreen} />
          <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
          <Stack.Screen name="CreateOffer" component={CreateOfferScreen} />
          <Stack.Screen name="SelectOfferProducts" component={SelectOfferProductsScreen} />
          <Stack.Screen name="OfferConditions" component={OfferConditionsScreen} />
          <Stack.Screen name="OfferDiscountValue" component={OfferDiscountValueScreen} />
          <Stack.Screen name="OfferStartDate" component={OfferStartDateScreen} />
          <Stack.Screen name="OfferEndDate" component={OfferEndDateScreen} />
          <Stack.Screen name="OfferReview" component={OfferReviewScreen} />
          <Stack.Screen
            name="PublishOffer"
            component={PublishOfferScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="OfferPublished"
            component={OfferPublishedScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="PauseOffer"
            component={PauseOfferScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="DeleteOffer"
            component={DeleteOfferScreen}
            options={{ presentation: 'modal' }}
          />

          <Stack.Screen name="PaymentsOverview" component={PaymentsOverviewScreen} />
          <Stack.Screen name="TotalSales" component={TotalSalesScreen} />
          <Stack.Screen name="PendingSettlement" component={PendingSettlementScreen} />
          <Stack.Screen name="PaidSettlement" component={PaidSettlementScreen} />
          <Stack.Screen name="Deductions" component={DeductionsScreen} />
          <Stack.Screen name="SettlementDetails" component={SettlementDetailsScreen} />
          <Stack.Screen name="Commission" component={CommissionScreen} />
          <Stack.Screen name="Taxes" component={TaxesScreen} />
          <Stack.Screen name="Adjustments" component={AdjustmentsScreen} />
          <Stack.Screen name="NetSettlement" component={NetSettlementScreen} />
          <Stack.Screen name="SettlementHistory" component={SettlementHistoryScreen} />
          <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
          <Stack.Screen name="Invoice" component={InvoiceScreen} />
          <Stack.Screen name="ViewInvoice" component={ViewInvoiceScreen} />
          <Stack.Screen name="DownloadInvoice" component={DownloadInvoiceScreen} />
          <Stack.Screen name="PaymentError" component={PaymentErrorScreen} />
          <Stack.Screen name="SettlementIssue" component={SettlementIssueScreen} />

          <Stack.Screen name="AnalyticsOverview" component={AnalyticsOverviewScreen} />
          <Stack.Screen name="SalesAnalytics" component={SalesAnalyticsScreen} />
          <Stack.Screen name="OrdersAnalytics" component={OrdersAnalyticsScreen} />
          <Stack.Screen name="RevenueAnalytics" component={RevenueAnalyticsScreen} />
          <Stack.Screen name="AverageOrderValue" component={AverageOrderValueScreen} />
          <Stack.Screen name="BestSellingProducts" component={BestSellingProductsScreen} />
          <Stack.Screen name="LowPerformingProducts" component={LowPerformingProductsScreen} />
          <Stack.Screen name="CancellationAnalytics" component={CancellationAnalyticsScreen} />
          <Stack.Screen name="InventoryPerformance" component={InventoryPerformanceScreen} />
          <Stack.Screen name="SettlementSummary" component={SettlementSummaryScreen} />

          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="NewOrderNotification" component={NewOrderNotificationScreen} />
          <Stack.Screen
            name="OrderCancellationNotification"
            component={OrderCancellationNotificationScreen}
          />
          <Stack.Screen name="LowStockNotification" component={LowStockNotificationScreen} />
          <Stack.Screen name="OutOfStockNotification" component={OutOfStockNotificationScreen} />
          <Stack.Screen name="PaymentNotification" component={PaymentNotificationScreen} />
          <Stack.Screen name="SettlementNotification" component={SettlementNotificationScreen} />
          <Stack.Screen
            name="ProductApprovalNotification"
            component={ProductApprovalNotificationScreen}
          />
          <Stack.Screen name="KYCStatusNotification" component={KYCStatusNotificationScreen} />
          <Stack.Screen name="StoreStatusNotification" component={StoreStatusNotificationScreen} />
          <Stack.Screen name="SystemAlertNotification" component={SystemAlertNotificationScreen} />
          <Stack.Screen name="AnnouncementNotification" component={AnnouncementNotificationScreen} />
          <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
          <Stack.Screen
            name="ClearNotifications"
            component={ClearNotificationsScreen}
            options={{ presentation: 'modal' }}
          />

          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="SupportCategories" component={SupportCategoriesScreen} />
          <Stack.Screen name="SelectIssue" component={SelectIssueScreen} />
          <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} />
          <Stack.Screen name="UploadEvidence" component={UploadEvidenceScreen} />
          <Stack.Screen name="PreviewEvidence" component={PreviewEvidenceScreen} />
          <Stack.Screen name="SubmitTicket" component={SubmitTicketScreen} />
          <Stack.Screen
            name="TicketCreated"
            component={TicketCreatedScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
          <Stack.Screen name="TicketStatus" component={TicketStatusScreen} />
          <Stack.Screen name="SupportResponse" component={SupportResponseScreen} />
          <Stack.Screen name="TicketResolved" component={TicketResolvedScreen} />
          <Stack.Screen
            name="ReopenTicket"
            component={ReopenTicketScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="EscalateTicket"
            component={EscalateTicketScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="TicketClosed" component={TicketClosedScreen} />

          <Stack.Screen name="DisputeCustomerIssue" component={DisputeCustomerIssueScreen} />
          <Stack.Screen name="DisputeIssueDetails" component={DisputeIssueDetailsScreen} />
          <Stack.Screen name="DisputeVendorReview" component={DisputeVendorReviewScreen} />
          <Stack.Screen name="DisputeAcceptIssue" component={DisputeAcceptIssueScreen} />
          <Stack.Screen name="DisputeIssueDispute" component={DisputeIssueDisputeScreen} />
          <Stack.Screen name="DisputeUploadEvidence" component={DisputeUploadEvidenceScreen} />
          <Stack.Screen name="DisputeSubmit" component={DisputeSubmitScreen} />
          <Stack.Screen name="DisputeSupportReview" component={DisputeSupportReviewScreen} />
          <Stack.Screen name="DisputeDecision" component={DisputeDecisionScreen} />
          <Stack.Screen
            name="DisputeSettlementAdjustment"
            component={DisputeSettlementAdjustmentScreen}
          />
          <Stack.Screen name="DisputeResolved" component={DisputeResolvedScreen} />

          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ProfileVendorInfo" component={ProfileVendorInfoScreen} />
          <Stack.Screen name="ProfileEditVendorInfo" component={ProfileEditVendorInfoScreen} />
          <Stack.Screen name="ProfileOwnerInfo" component={ProfileOwnerInfoScreen} />
          <Stack.Screen name="ProfileEditOwnerInfo" component={ProfileEditOwnerInfoScreen} />
          <Stack.Screen name="ProfileStoreInfo" component={ProfileStoreInfoScreen} />
          <Stack.Screen name="ProfileEditStoreInfo" component={ProfileEditStoreInfoScreen} />
          <Stack.Screen name="ProfileAddresses" component={ProfileAddressesScreen} />
          <Stack.Screen name="ProfileAddAddress" component={ProfileAddAddressScreen} />
          <Stack.Screen name="ProfileAddressDetails" component={ProfileAddressDetailsScreen} />
          <Stack.Screen name="ProfileDocuments" component={ProfileDocumentsScreen} />
          <Stack.Screen name="ProfileAddDocument" component={ProfileAddDocumentScreen} />
          <Stack.Screen name="ProfileDocumentStatus" component={ProfileDocumentStatusScreen} />
          <Stack.Screen name="ProfileReplaceDocument" component={ProfileReplaceDocumentScreen} />
          <Stack.Screen name="ProfileBankDetails" component={ProfileBankDetailsScreen} />
          <Stack.Screen name="ProfileEditBankDetails" component={ProfileEditBankDetailsScreen} />
          <Stack.Screen
            name="ProfileNotificationSettings"
            component={ProfileNotificationSettingsScreen}
          />
          <Stack.Screen name="ProfileSecurity" component={ProfileSecurityScreen} />

          <Stack.Screen name="SecurityChangeMobileNumber" component={SecurityChangeMobileNumberScreen} />
          <Stack.Screen name="SecurityChangeMobileOtp" component={SecurityChangeMobileOtpScreen} />
          <Stack.Screen name="SecurityChangePin" component={SecurityChangePinScreen} />
          <Stack.Screen name="SecurityActiveSessions" component={SecurityActiveSessionsScreen} />
          <Stack.Screen name="SecurityLoginHistory" component={SecurityLoginHistoryScreen} />
          <Stack.Screen name="SecurityLogout" component={SecurityLogoutScreen} />
          <Stack.Screen
            name="SecurityLogoutConfirmation"
            component={SecurityLogoutConfirmationScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen
            name="SecurityDeleteAccountConfirm"
            component={SecurityDeleteAccountConfirmScreen}
            options={{ presentation: 'modal' }}
          />

          <Stack.Screen name="PolicyTerms" component={PolicyTermsScreen} />
          <Stack.Screen name="PolicyPrivacy" component={PolicyPrivacyScreen} />
          <Stack.Screen name="PolicyVendorAgreement" component={PolicyVendorAgreementScreen} />
          <Stack.Screen name="PolicyCancellation" component={PolicyCancellationScreen} />
          <Stack.Screen name="PolicySettlement" component={PolicySettlementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PoliciesProvider>
    </SecurityProvider>
    </ProfileProvider>
    </DisputesProvider>
    </SupportDraftProvider>
    </SupportProvider>
    </NotificationsProvider>
    </AnalyticsProvider>
    </PaymentsProvider>
    </OfferDraftProvider>
    </OffersProvider>
    </OrdersProvider>
    </InventoryProvider>
    </ProductDraftProvider>
    </ProductCatalogProvider>
    </StoreSetupProvider>
    </RegistrationProvider>
    </VendorAuthProvider>
  );
}
