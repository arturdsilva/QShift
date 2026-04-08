import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MolFormField } from '../atomic/MolFormField';
import { ObjAppLayout as BaseLayout } from '../atomic/ObjAppLayout';
import { Button, LinkButton } from '../atomic/AtmButton/index.js';
import { AtmText } from '../atomic/AtmText/index.js';
import { ObjRetryStatusBanner } from '../atomic/ObjRetryStatusBanner';
import { useLogin } from '../hooks/useLogin';
import { STATUS } from '../hooks/useRetryOnSleep';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { run, status, retryCountdown, retriesLeft, errorInfo, getMessage } = useLogin();

  const isBusy = status === STATUS.RUNNING || status === STATUS.WAKING_UP;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await run({ email, password });
    if (result?.success) {
      localStorage.setItem('token', result.data.access_token);
      navigate('/staff');
    }
  };

  const handleRetry = () => {
    handleSubmit({ preventDefault: () => { } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-600">
        <AtmText as="h3" size="2xl" weight="semibold" color="dimmer" className="mb-6 text-center block">Login</AtmText>

        <ObjRetryStatusBanner
          status={status}
          retryCountdown={retryCountdown}
          retriesLeft={retriesLeft}
          errorInfo={errorInfo}
          getMessage={getMessage}
          onRetry={handleRetry}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <MolFormField
            label="Email"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant='auth'
            disabled={isBusy}
          />
          <MolFormField
            label="Password"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-2"
            variant='auth'
            disabled={isBusy}
          />
          <Button type="submit" fullWidth variant='primary' size='lg' disabled={isBusy}>
            {isBusy ? 'Connecting…' : 'Enter'}
          </Button>
        </form>
        <div className="mt-5 text-center">
          <AtmText as="p" size="sm" color="muted">
            Don't have an account?{' '}
            <LinkButton onClick={() => navigate('/register')} disabled={isBusy}>
              Register
            </LinkButton>
          </AtmText>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
