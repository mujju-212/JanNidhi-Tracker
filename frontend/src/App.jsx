import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SALayout from './pages/superadmin/SALayout.jsx';
import SADashboard from './pages/superadmin/SADashboard.jsx';
import SAPlaceholder from './pages/superadmin/SAPlaceholder.jsx';
import SACreateMinistry from './pages/superadmin/SACreateMinistry.jsx';
import SAMinistryList from './pages/superadmin/SAMinistryList.jsx';
import SAMinistryDetail from './pages/superadmin/SAMinistryDetail.jsx';
import SAAllocateBudget from './pages/superadmin/SAAllocateBudget.jsx';
import SABudgetHistory from './pages/superadmin/SABudgetHistory.jsx';
import SAFlagCenter from './pages/superadmin/SAFlagCenter.jsx';
import SASchemePlaceholder from './pages/superadmin/SASchemePlaceholder.jsx';
import SAUserManagement from './pages/superadmin/SAUserManagement.jsx';
import SACreateCAG from './pages/superadmin/SACreateCAG.jsx';
import SAMasterReports from './pages/superadmin/SAMasterReports.jsx';
import SASystemSettings from './pages/superadmin/SASystemSettings.jsx';
import MinLayout from './pages/ministry/MinLayout.jsx';
import MinDashboard from './pages/ministry/MinDashboard.jsx';
import MinViewBudget from './pages/ministry/MinViewBudget.jsx';
import MinCreateScheme from './pages/ministry/MinCreateScheme.jsx';
import MinSchemeList from './pages/ministry/MinSchemeList.jsx';
import MinSchemeDetail from './pages/ministry/MinSchemeDetail.jsx';
import MinCreateState from './pages/ministry/MinCreateState.jsx';
import MinStateList from './pages/ministry/MinStateList.jsx';
import MinStateProgress from './pages/ministry/MinStateProgress.jsx';
import MinReleaseFunds from './pages/ministry/MinReleaseFunds.jsx';
import MinTransactions from './pages/ministry/MinTransactions.jsx';
import MinFlagCenter from './pages/ministry/MinFlagCenter.jsx';
import MinReports from './pages/ministry/MinReports.jsx';
import STLayout from './pages/state/STLayout.jsx';
import STDashboard from './pages/state/STDashboard.jsx';
import STViewFunds from './pages/state/STViewFunds.jsx';
import STReleaseFunds from './pages/state/STReleaseFunds.jsx';
import STReleaseMatchingFund from './pages/state/STReleaseMatchingFund.jsx';
import STCreateStateScheme from './pages/state/STCreateStateScheme.jsx';
import STStateSchemeList from './pages/state/STStateSchemeList.jsx';
import STCreateDistrict from './pages/state/STCreateDistrict.jsx';
import STDistrictList from './pages/state/STDistrictList.jsx';
import STDistrictProgress from './pages/state/STDistrictProgress.jsx';
import STSubmitUC from './pages/state/STSubmitUC.jsx';
import STTransactions from './pages/state/STTransactions.jsx';
import STFlagCenter from './pages/state/STFlagCenter.jsx';
import STReports from './pages/state/STReports.jsx';
import DTLayout from './pages/district/DTLayout.jsx';
import DTDashboard from './pages/district/DTDashboard.jsx';
import DTAddBeneficiary from './pages/district/DTAddBeneficiary.jsx';
import DTBulkEnroll from './pages/district/DTBulkEnroll.jsx';
import DTBeneficiaryList from './pages/district/DTBeneficiaryList.jsx';
import DTBeneficiaryDetail from './pages/district/DTBeneficiaryDetail.jsx';
import DTTriggerPayment from './pages/district/DTTriggerPayment.jsx';
import DTPaymentStatus from './pages/district/DTPaymentStatus.jsx';
import DTHeldPayments from './pages/district/DTHeldPayments.jsx';
import DTComplaints from './pages/district/DTComplaints.jsx';
import DTFlagCenter from './pages/district/DTFlagCenter.jsx';
import DTViewFunds from './pages/district/DTViewFunds.jsx';
import DTReleaseFunds from './pages/district/DTReleaseFunds.jsx';
import DTSubmitUC from './pages/district/DTSubmitUC.jsx';
import DTTransactions from './pages/district/DTTransactions.jsx';
import DTCreateBlock from './pages/district/DTCreateBlock.jsx';
import DTBlockList from './pages/district/DTBlockList.jsx';
import DTCreatePanchayat from './pages/district/DTCreatePanchayat.jsx';
import DTPanchayatList from './pages/district/DTPanchayatList.jsx';
import CAGLayout from './pages/auditor/CAGLayout.jsx';
import CAGDashboard from './pages/auditor/CAGDashboard.jsx';
import CAGLiveFeed from './pages/auditor/CAGLiveFeed.jsx';
import CAGFlagManagement from './pages/auditor/CAGFlagManagement.jsx';
import CAGRaiseFlag from './pages/auditor/CAGRaiseFlag.jsx';
import CAGReports from './pages/auditor/CAGReports.jsx';
import PublicLayout from './pages/public/PublicLayout.jsx';
import PublicHome from './pages/public/PublicHome.jsx';
import ExploreByLocation from './pages/public/ExploreByLocation.jsx';
import ExploreByScheme from './pages/public/ExploreByScheme.jsx';
import VerifyTransaction from './pages/public/VerifyTransaction.jsx';
import AadhaarLogin from './pages/public/AadhaarLogin.jsx';
import CitizenDashboard from './pages/public/CitizenDashboard.jsx';
import UserProfile from './pages/common/UserProfile.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public" element={<PublicLayout />}>
        <Route index element={<PublicHome />} />
        <Route path="explore" element={<ExploreByLocation />} />
        <Route path="schemes" element={<ExploreByScheme />} />
        <Route path="verify" element={<VerifyTransaction />} />
        <Route path="citizen-login" element={<AadhaarLogin />} />
        <Route path="citizen-dashboard" element={<CitizenDashboard />} />
      </Route>

      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SALayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SADashboard />} />
        <Route path="ministry" element={<SAMinistryList />} />
        <Route path="ministry/:ministryId" element={<SAMinistryDetail />} />
        <Route path="create-ministry" element={<SACreateMinistry />} />
        <Route path="create-cag" element={<SACreateCAG />} />
        <Route path="fund-allocation" element={<SAAllocateBudget />} />
        <Route path="allocate-budget" element={<SAAllocateBudget />} />
        <Route path="transactions" element={<SABudgetHistory />} />
        <Route path="audit" element={<SAFlagCenter />} />
        <Route path="flags" element={<SAFlagCenter />} />
        <Route path="schemes" element={<SASchemePlaceholder />} />
        <Route path="reports" element={<SAMasterReports />} />
        <Route path="users" element={<SAUserManagement />} />
        <Route path="settings" element={<SASystemSettings />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path=":section" element={<SAPlaceholder />} />
      </Route>

      <Route
        path="/ministry"
        element={
          <ProtectedRoute allowedRoles={['ministry_admin']}>
            <MinLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MinDashboard />} />
        <Route path="view-budget" element={<MinViewBudget />} />
        <Route path="create-scheme" element={<MinCreateScheme />} />
        <Route path="schemes" element={<MinSchemeList />} />
        <Route path="scheme/:schemeId" element={<MinSchemeDetail />} />
        <Route path="create-state" element={<MinCreateState />} />
        <Route path="states" element={<MinStateList />} />
        <Route path="state-progress" element={<MinStateProgress />} />
        <Route path="release-funds" element={<MinReleaseFunds />} />
        <Route path="transactions" element={<MinTransactions />} />
        <Route path="flags" element={<MinFlagCenter />} />
        <Route path="reports" element={<MinReports />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route
        path="/state"
        element={
          <ProtectedRoute allowedRoles={['state_admin']}>
            <STLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<STDashboard />} />
        <Route path="view-funds" element={<STViewFunds />} />
        <Route path="release-funds" element={<STReleaseFunds />} />
        <Route path="release-matching" element={<STReleaseMatchingFund />} />
        <Route path="create-state-scheme" element={<STCreateStateScheme />} />
        <Route path="state-schemes" element={<STStateSchemeList />} />
        <Route path="create-district" element={<STCreateDistrict />} />
        <Route path="districts" element={<STDistrictList />} />
        <Route path="district-progress" element={<STDistrictProgress />} />
        <Route path="submit-uc" element={<STSubmitUC />} />
        <Route path="transactions" element={<STTransactions />} />
        <Route path="flags" element={<STFlagCenter />} />
        <Route path="reports" element={<STReports />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route
        path="/district"
        element={
          <ProtectedRoute allowedRoles={['district_admin']}>
            <DTLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DTDashboard />} />
        <Route path="add-beneficiary" element={<DTAddBeneficiary />} />
        <Route path="bulk-enroll" element={<DTBulkEnroll />} />
        <Route path="beneficiaries" element={<DTBeneficiaryList />} />
        <Route path="beneficiaries/:beneficiaryId" element={<DTBeneficiaryDetail />} />
        <Route path="trigger-payment" element={<DTTriggerPayment />} />
        <Route path="payment-status" element={<DTPaymentStatus />} />
        <Route path="held-payments" element={<DTHeldPayments />} />
        <Route path="view-funds" element={<DTViewFunds />} />
        <Route path="release-funds" element={<DTReleaseFunds />} />
        <Route path="complaints" element={<DTComplaints />} />
        <Route path="flags" element={<DTFlagCenter />} />
        <Route path="submit-uc" element={<DTSubmitUC />} />
        <Route path="transactions" element={<DTTransactions />} />
        <Route path="create-block" element={<DTCreateBlock />} />
        <Route path="blocks" element={<DTBlockList />} />
        <Route path="create-panchayat" element={<DTCreatePanchayat />} />
        <Route path="panchayats" element={<DTPanchayatList />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route
        path="/auditor"
        element={
          <ProtectedRoute allowedRoles={['central_cag', 'state_auditor']}>
            <CAGLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CAGDashboard />} />
        <Route path="live-feed" element={<CAGLiveFeed />} />
        <Route path="flags" element={<CAGFlagManagement />} />
        <Route path="raise-flag" element={<CAGRaiseFlag />} />
        <Route path="reports" element={<CAGReports />} />
        <Route path="profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
