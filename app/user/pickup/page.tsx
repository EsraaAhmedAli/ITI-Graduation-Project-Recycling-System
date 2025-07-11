'use client';

import { useState } from 'react';
import Step from './Step';
import Connector from './Connector';
import AddressForm from './AddressForm';
import Review from './ReviewForm';

export default function BookingPage() {
  const [step, setStep] = useState(1);

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <main className="flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8 text-primary">
        Book your appointment
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
        <Step number={1} label="Address" active={step === 1} />
        <Connector />
        <Step number={2} label="Review" active={step === 2} />
      </div>

      <div className="w-full max-w-md">
        {step === 1&& <AddressForm onNext={goNext}  />}
        {step === 2 && <Review onBack={goBack} />}
      </div>
    </main>
  );
}
