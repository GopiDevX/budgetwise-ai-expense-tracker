import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled, { keyframes, css } from 'styled-components';
import { FiLock, FiEye, FiEyeOff, FiMail, FiKey, FiShield, FiTrendingUp, FiActivity, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import usePageTitle from '../hooks/usePageTitle';
import authService from '../services/authService';
// ParticleWaveBackground is optional since we have the CSS particles in LeftPanel, 
// but Register.js seems to use a custom background component plus CSS particles?
// Looking at Register.js content provided earlier, it DOES import ParticleWaveBackground (line 8) but doesn't seem to use it in the JSX provided in the view_file output?
// Wait, looking at Step 110 output of Register.js:
// It has `import ParticleWaveBackground ...`
// But in the JSX (which was truncated), I should check if it's used.
// The user wants "same as sign up", so I should replicate it.
// However, the `LeftPanel` styles in Register.js (Step 227) has a background gradient and pseudo-elements for particles/shimmer.
// It also defined `ParticlesContainer` and `Particle` components in Step 227.
// I will adhere to the styled-components provided in Step 227.

// --- Animations (Copied from Register.js) ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const moveParticle = keyframes`
  0% { transform: translate(0, 0); }
  25% { transform: translate(10px, -15px); }
  50% { transform: translate(-5px, -25px); }
  75% { transform: translate(-15px, -10px); }
  100% { transform: translate(0, 0); }
`;

const scaleUp = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

// --- Finance Animation Helpers ---
const floatAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

// eslint-disable-next-line no-unused-vars
const floatAnimationReverse = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(15px) rotate(-1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const borderRotate = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// --- Layout Components (Copied from Register.js) ---
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
`;

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #172554 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 0%, transparent 20%),
      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 20%);
    pointer-events: none;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const ParticlesContainer = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

const Particle = styled.div`
  position: absolute;
  width: ${props => props.size || '4px'};
  height: ${props => props.size || '4px'};
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  top: ${props => props.top};
  left: ${props => props.left};
  animation: ${moveParticle} ${props => props.duration || '10s'} infinite linear alternate;
`;

const LogoDisplay = styled.div`
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #ffffff, #93c5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  width: fit-content;
  z-index: 10;
`;

const FinanceComposition = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  perspective: 1000px;
`;

const MainCard = styled.div`
  width: 300px;
  height: 190px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 1.5rem;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
  animation: ${scaleUp} 0.8s ease-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.1) 20%,
      rgba(255, 255, 255, 0.2) 60%,
      rgba(255, 255, 255, 0)
    );
    animation: ${shimmer} 3s infinite;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  z-index: 2;
`;

const CardBalance = styled.div`
  font-size: 2.25rem;
  font-weight: 700;
  color: #fff;
  margin-top: 0.25rem;
  letter-spacing: -0.02em;
  z-index: 2;
`;

const CardGraph = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 50px;
  margin-top: auto;
  z-index: 2;
`;

const GraphBar = styled.div`
  flex: 1;
  background: ${props => props.$active ? '#60a5fa' : 'rgba(255,255,255,0.15)'};
  border-radius: 4px;
  height: ${props => props.$height};
  animation: ${scaleUp} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: ${props => props.$delay};
  transform-origin: bottom;
`;

const FloatingElement = styled.div`
  position: absolute;
  background: ${props => props.$bg || 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.$color || '#0f172a'};
  padding: 0.75rem 1rem;
  border-radius: 12px;
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.2);
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 3;
  animation: ${floatAnimation} 5s ease-in-out infinite;
  animation-delay: ${props => props.$delay || '0s'};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.5);

  svg {
    color: ${props => props.$iconColor};
    width: 20px;
    height: 20px;
  }
`;

// --- Right Panel (Form) ---
const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f1f5f9;
  position: relative;
  overflow-y: auto;
`;

const LoginCard = styled.div`
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1), 
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 480px;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  z-index: 1;

  /* Animated Border Effect */
  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    z-index: -1;
    border-radius: 1.6rem;
    background: linear-gradient(
      45deg, 
      #eff6ff, 
      #3b82f6, 
      #eff6ff, 
      #60a5fa
    );
    background-size: 300% 300%;
    animation: ${borderRotate} 4s ease infinite;
    opacity: 0.6;
  }
  
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    background: #ffffff;
    border-radius: 1.5rem;
  }

  @media (max-width: 640px) {
    padding: 1.5rem;
    box-shadow: none;
    &::before { display: none; }
    &::after { display: none; }
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.925rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 12px;
    color: #94a3b8;
    width: 18px;
    height: 18px;
    transition: color 0.2s;
  }

  &:focus-within svg {
    color: #2563eb;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 3.5rem 0.75rem 2.5rem;
  font-size: 0.925rem;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &::placeholder {
    color: #cbd5e1;
  }

  &:focus {
    outline: none;
    border-color: #2563eb;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  ${props => props.$hasError && css`
    border-color: #ef4444;
    background: #fef2f2;
    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 2.25rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  display: flex;
  align-items: center;
  z-index: 10;
  
  &:hover {
    color: #475569;
  }
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  background: #2563eb;
  color: white;
  font-size: 0.925rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Spinner = styled.div`
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.875rem;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
  
  &::before {
    margin-right: 1rem;
  }
  
  &::after {
    margin-left: 1rem;
  }
`;

const SignUpPrompt = styled.p`
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
`;

const SignUpLink = styled(Link)`
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ForgotText = styled(Link)`
  display: inline-block;
  text-align: right;
  color: #2563eb;
  font-size: 0.875rem;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const ResendLink = styled.button`
  background: none;
  border: none;
  color: ${props => props.disabled ? '#94a3b8' : '#2563eb'};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  padding: 0;
  margin-top: 1rem;
  text-decoration: ${props => props.disabled ? 'none' : 'underline'};
  
  &:hover {
    color: ${props => props.disabled ? '#94a3b8' : '#1d4ed8'};
  }
`;

const Login = () => {
  usePageTitle('Login | BudgetWise');
  const navigate = useNavigate();
  const { setUserAuthenticated } = useAuth(); // Assuming this context exists as per previous code

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: initial, 2: password verified, 3: OTP verified
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const resendInterval = useRef(null);

  const handleContinue = async (e) => {
    e.preventDefault();

    if (!email || (!password && !showOtpInput)) {
      setError('Please enter email and password');
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);

      let result;
      if (step === 1) {
        // Step 1: Verify password and send OTP
        const loginResp = await authService.loginUser(email, password);
        // backend returns { token, message } on successful credential verification
        if (loginResp && loginResp.token) {
          // Password verified, send OTP (backend sends asynchronously)
          try {
            await authService.requestLoginOtp(email);
            // start resend countdown
            setResendTimer(60);
            if (resendInterval.current) clearInterval(resendInterval.current);
            resendInterval.current = setInterval(() => {
              setResendTimer((s) => {
                if (s <= 1) { clearInterval(resendInterval.current); return 0; }
                return s - 1;
              });
            }, 1000);
            setStep(2);
            setShowOtpInput(true);
            setMessage('OTP has been sent to your email');
          } catch (mailErr) {
            // Mail failed, but password was valid - show friendly error
            if (mailErr.message && mailErr.message.includes('temporary')) {
              setError('Mail server is temporarily unavailable. Please try again in a moment.');
            } else if (mailErr.message && mailErr.message.includes('internet')) {
              setError('Connection issue. Please check your internet and try again.');
            } else {
              setError('Unable to send OTP. Please verify your email and try again.');
            }
            console.error('Mail error:', mailErr);
          }
        } else {
          setError('Invalid email or password');
        }
      } else if (step === 2) {
        // Step 2: Verify OTP and complete login
        result = await authService.verifyLoginOtp(email, otp);
        if (result && result.token) {
          // OTP verified, login successful
          const token = result.token;
          localStorage.setItem('budgetwise_token', token);
          const user = JSON.parse(atob(token.split('.')[1]));
          localStorage.setItem('budgetwise_user', JSON.stringify(user));
          // update AuthContext so ProtectedRoute recognizes authenticated user
          setUserAuthenticated(user);
          navigate('/dashboard');
        } else {
          setError('Invalid OTP');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);
      await authService.requestLoginOtp(email);
      setMessage('OTP has been resent to your email');
      // restart resend timer
      setResendTimer(60);
      if (resendInterval.current) clearInterval(resendInterval.current);
      resendInterval.current = setInterval(() => {
        setResendTimer((s) => {
          if (s <= 1) { clearInterval(resendInterval.current); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      // Handle mail errors gracefully
      if (err.message && err.message.includes('temporary')) {
        setError('Mail server is temporarily unavailable. Please try again in a moment.');
      } else if (err.message && err.message.includes('internet')) {
        setError('Connection issue. Please check your internet and try again.');
      } else {
        setError(err.message || 'Failed to resend OTP. Please try again.');
      }
      console.error('Resend OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { if (resendInterval.current) clearInterval(resendInterval.current); };
  }, []);

  return (
    <Container>
      <LeftPanel>
        <ParticlesContainer>
          {[...Array(20)].map((_, i) => (
            <Particle
              key={i}
              size={`${Math.random() * 4 + 2}px`}
              top={`${Math.random() * 100}%`}
              left={`${Math.random() * 100}%`}
              duration={`${Math.random() * 10 + 10}s`}
            />
          ))}
        </ParticlesContainer>

        <LogoDisplay>BudgetWise</LogoDisplay>

        <FinanceComposition>
          <MainCard>
            <CardHeader>
              <span>Total Balance</span>
              <FiDollarSign />
            </CardHeader>
            <CardBalance>$24,500.00</CardBalance>
            <CardGraph>
              <GraphBar $height="40%" $active={false} $delay="0.1s" />
              <GraphBar $height="60%" $active={false} $delay="0.2s" />
              <GraphBar $height="35%" $active={false} $delay="0.3s" />
              <GraphBar $height="85%" $active={true} $delay="0.4s" />
              <GraphBar $height="55%" $active={false} $delay="0.5s" />
              <GraphBar $height="70%" $active={false} $delay="0.6s" />
            </CardGraph>
          </MainCard>

          <FloatingElement
            style={{ top: '10%', right: '-10%' }}
            $iconColor="#10b981"
            $delay="0s"
          >
            <FiTrendingUp /> Income +12%
          </FloatingElement>

          <FloatingElement
            style={{ bottom: '20%', left: '-10%' }}
            $iconColor="#3b82f6"
            $delay="2s"
          >
            <FiActivity /> Active Goals: 5
          </FloatingElement>

          <FloatingElement
            style={{ bottom: '-5%', right: '10%' }}
            $iconColor="#f59e0b"
            $delay="1s"
          >
            <FiShield /> Secure Data
          </FloatingElement>
        </FinanceComposition>
      </LeftPanel>

      <RightPanel>
        <LoginCard>
          <Title>Welcome Back</Title>
          <Subtitle>
            {step === 1 ? 'Enter your credentials to access your account' : 'Enter the code sent to your email'}
          </Subtitle>

          {error && <ErrorMessage><FiAlertCircle size={16} /> {error}</ErrorMessage>}
          {message && <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>{message}</div>}

          <Form onSubmit={handleContinue}>
            {step === 1 && (
              <>
                <InputGroup>
                  <Label htmlFor="email">Email Address</Label>
                  <InputWrapper>
                    <FiMail />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      autoFocus
                    />
                  </InputWrapper>
                </InputGroup>

                <InputGroup>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Label htmlFor="password">Password</Label>
                    <ForgotText to="/forgot-password">Forgot password?</ForgotText>
                  </div>
                  <InputWrapper>
                    <FiLock />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </PasswordToggle>
                  </InputWrapper>
                </InputGroup>
              </>
            )}

            {step === 2 && (
              <InputGroup>
                <Label htmlFor="otp">One-Time Password (OTP)</Label>
                <InputWrapper>
                  <FiKey />
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </InputWrapper>
                <div style={{ textAlign: 'center' }}>
                  <ResendLink type="button" onClick={handleResendOtp} disabled={resendTimer > 0}>
                    {resendTimer > 0 ? `Resend in ${resendTimer} s` : 'Resend OTP'}
                  </ResendLink>
                </div>
              </InputGroup>
            )}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? <Spinner /> : (step === 1 ? 'Sign In' : 'Verify & Login')}
            </SubmitButton>
          </Form>

          <Divider>or</Divider>

          <SignUpPrompt>
            Don't have an account? <SignUpLink to="/register">Create Account</SignUpLink>
          </SignUpPrompt>
        </LoginCard>
      </RightPanel>
    </Container>
  );
};

export default Login;
