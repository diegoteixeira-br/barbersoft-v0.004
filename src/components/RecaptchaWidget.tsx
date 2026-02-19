import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_SITE_KEY } from '@/hooks/useRecaptcha';
import React, { useCallback } from 'react';

interface RecaptchaWidgetProps {
  recaptchaRef: React.RefObject<ReCAPTCHA | null>;
  onChange?: (token: string | null) => void;
  onLoad?: () => void;
}

export function RecaptchaWidget({ recaptchaRef, onChange, onLoad }: RecaptchaWidgetProps) {
  const handleChange = useCallback((token: string | null) => {
    if (onLoad) onLoad();
    onChange?.(token);
  }, [onChange, onLoad]);

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={handleChange}
        theme="dark"
      />
    </div>
  );
}
