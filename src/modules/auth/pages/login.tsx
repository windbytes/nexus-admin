import { LoginView } from '@/modules/auth/pages/LoginView';
import { useLoginPage } from '@/modules/auth/pages/useLoginPage';

const BORDER_BEAM_COLORS = [
  { color: '#1677ff', percent: 0 },
  { color: '#36cfc9', percent: 52 },
  { color: '#95de64', percent: 100 },
];

function Login() {
  const vm = useLoginPage();
  return <LoginView {...vm} borderBeamColors={BORDER_BEAM_COLORS} />;
}

export default Login;
