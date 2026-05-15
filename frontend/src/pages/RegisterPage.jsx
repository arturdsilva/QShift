import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MolFormField } from '../atomic/MolFormField';
import { Button, LinkButton } from '../atomic/AtmButton/index.js';
import { AtmText } from '../atomic/AtmText/index.js';
import { RegisterApi } from '../services/api.js';
import { useRegister } from '../hooks/useRegister.js';
import { ObjRetryStatusBanner } from '../atomic/ObjRetryStatusBanner';
import { STATUS } from '../hooks/useRetryOnSleep';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { run, status, retryCountdown, retriesLeft, errorInfo, getMessage } = useRegister();
  const [email, setEmail] = useState('');
  const [confEmail, setConfEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isBusy = status === STATUS.RUNNING || status === STATUS.WAKING_UP;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !confEmail || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (email !== confEmail) {
      setError('Emails do not match');
      return;
    }
    const result = run({ email, password });
    const resultData = result.data;
    if (resultData?.success) {
      alert('User registered successfully');
      navigate('/login');
    } else if (resultData?.error.response?.data?.detail === 'Email already registered') {
      setError('Email already registered');
    }
    console.error(resultData?.error);
  };

  return (
    <div className="register-page">
      <div className="register-page__card">
        <AtmText as="h3" size="2xl" weight="semibold" color="dimmer" className="register-page__title">Register</AtmText>
        <ObjRetryStatusBanner
          status={status}
          getMessage={getMessage}
          retryCountdown={retryCountdown}
          retriesLeft={retriesLeft}
          errorInfo={errorInfo}
          className="mb-4"
        />
        <form onSubmit={handleSubmit} className="register-page__form">
          {error && (
            <div className="register-page__error">
              <AtmText size="sm" color="red">{error}</AtmText>
            </div>
          )}
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
            label="Confirm Email"
            id="confirm-email"
            type="email"
            placeholder="Confirm your email"
            value={confEmail}
            onChange={(e) => setConfEmail(e.target.value)}
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
            className="register-page__last-field"
            variant='auth'
            disabled={isBusy}
          />
          <Button type="submit" fullWidth variant='primary' size='lg' disabled={isBusy}>
            Register
          </Button>
        </form>
        <div className="register-page__footer">
          <AtmText as="p" size="sm" color="muted">
            Already have an account?{' '}
            <LinkButton onClick={() => navigate('/login')} disabled={isBusy}>
              Login
            </LinkButton>
          </AtmText>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
