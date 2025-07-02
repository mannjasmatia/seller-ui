import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../store/appStore';
import Button from '../../components/BasicComponents/Button';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const VerificationPending = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const language = useSelector((state: RootState) => state.language?.value)['verificationPending'];
  const userInfo = useSelector((state: RootState) => state.user.userInfo);

  // Redirect if user is already verified
  useEffect(() => {
    if (userInfo?.isVerified) {
      const preferredLang = lang || localStorage.getItem("lang") || "en";
      navigate(`/${preferredLang}/dashboard`, { replace: true });
    }
  }, [userInfo, lang, navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleContactSupport = () => {
    // You can implement contact support functionality here
    window.open('mailto:support@canadianbazaar.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/logo.png" alt="Canadian Bazaar" className="h-12" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="absolute -top-1 -right-1">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {language.title}
            </h1>
            <p className="text-gray-600">
              {language.subtitle}
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  {language.status.title}
                </h3>
                <p className="text-yellow-700 mb-4">
                  {language.status.description}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-yellow-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {language.status.steps.profileSubmitted}
                  </div>
                  <div className="flex items-center text-sm text-yellow-700">
                    <div className="h-4 w-4 border-2 border-yellow-500 rounded-full mr-2 flex items-center justify-center">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    </div>
                    {language.status.steps.underReview}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full mr-2"></div>
                    {language.status.steps.approved}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Timeline Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">{language.timeline.title}</h4>
              </div>
              <p className="text-sm text-blue-700">{language.timeline.description}</p>
            </div>

            {/* Next Steps Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">{language.nextSteps.title}</h4>
              </div>
              <p className="text-sm text-green-700">{language.nextSteps.description}</p>
            </div>
          </div>

          {/* What's Being Verified */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3">{language.verification.title}</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="h-2 w-2 bg-gray-400 rounded-full mr-3"></div>
                {language.verification.items.businessRegistration}
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-gray-400 rounded-full mr-3"></div>
                {language.verification.items.businessType}
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-gray-400 rounded-full mr-3"></div>
                {language.verification.items.addressVerification}
              </li>
              <li className="flex items-center">
                <div className="h-2 w-2 bg-gray-400 rounded-full mr-3"></div>
                {language.verification.items.companyLogo}
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="md"
              theme={['cb-red', 'white']}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              fullWidth
            >
              {language.actions.refresh}
            </Button>
            
            <Button
              onClick={handleContactSupport}
              variant="solid"
              size="md"
              theme={['cb-red', 'white']}
              fullWidth
            >
              {language.actions.contactSupport}
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {language.footer.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;