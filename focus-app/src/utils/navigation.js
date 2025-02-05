import { useNavigate } from 'react-router-dom';

export function useNavigation() {
  const navigate = useNavigate();

  return {
    // homepage
    toHome: () => navigate('/'),
    
    // products
    toAbout: () => navigate('/about'),
    toOurProducts: () => navigate('/products'),

    // terms and conditions
    toTermsAndConditions: () => navigate('/terms-and-conditions'),

    // privacy policy
    toPrivacyPolicy: () => navigate('/privacy-policy'),

    // account menu
    toDashboard: () => navigate('/account/dashboard'),
    toProfile: () => navigate('/account/profile'),
    toSettings: () => navigate('/account/settings'),
    
    // registration tab
    toLogin: () => navigate('/login'),
    toRegister: () => navigate('/register'),
    toReset: () => navigate('/reset-password'),
    //error
    toNotFound: () => navigate('error/404'),
    toNotAuthorized: () => navigate('error/403'),

    toCalibration: (file, parsedText) => navigate('/calibrate', { state: { file, parsedText } }),
    toReadingPage: (file, parsedText) => navigate('/reading', { state: { file, parsedText } }),
    
    toDrive: () => navigate('/drive'),
    
    toCustom: (path) => navigate(path), 
  };
}
