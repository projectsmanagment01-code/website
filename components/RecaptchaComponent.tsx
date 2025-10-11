"use client";

import React, { useCallback, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaComponentProps {
  siteKey: string;
  onVerify: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

export const RecaptchaComponent: React.FC<RecaptchaComponentProps> = ({
  siteKey,
  onVerify,
  onExpired,
  onError,
  theme = 'light',
  size = 'normal',
  className = '',
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = useCallback((token: string | null) => {
    onVerify(token);
  }, [onVerify]);

  const handleExpired = useCallback(() => {
    onVerify(null);
    if (onExpired) {
      onExpired();
    }
  }, [onVerify, onExpired]);

  const handleError = useCallback(() => {
    onVerify(null);
    if (onError) {
      onError();
    }
  }, [onVerify, onError]);

  const reset = useCallback(() => {
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, []);

  if (!siteKey) {
    return null;
  }

  return (
    React.createElement('div', { className },
      React.createElement(ReCAPTCHA, {
        ref: recaptchaRef,
        sitekey: siteKey,
        onChange: handleChange,
        onExpired: handleExpired,
        onError: handleError,
        theme: theme,
        size: size,
      })
    )
  );
};

export default RecaptchaComponent;