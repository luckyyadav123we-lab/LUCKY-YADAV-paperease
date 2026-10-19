import React from 'react';
import { useApp } from '../context/AppContext';
import { UserTier } from '../types';
import { X, Check, Sparkles, Zap, Shield, Building2 } from 'lucide-react';

export const PricingModal: React.FC = () => {
  const { pricingModalOpen, setPricingModalOpen, user, switchTier } = useApp();

  if (!pricingModalOpen) return null;

  const plans: {
    id: UserTier;
    name: string;
    audience: string;
    price: string;
    cadence: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    buttonText: string;
  }[] = [
    {
      id: 'free',
      name: 'Free Starter',
      audience: 'For students & casual users',
      price: '$0',
      cadence: 'forever free',
      description: 'Essential document and image tools with zero account requirement.',
      features: [
        '10 conversions per day',
        'Max file size: 25 MB',
        'Standard PDF Merge & Split',
        'PNG, JPG, WEBP conversions',
        'Local client-side privacy',
        'Standard processing queue',
      ],
      buttonText: user.tier === 'free' ? 'Current Plan' : 'Downgrade to Free',
    },
    {
      id: 'pro',
      name: 'Professional',
      audience: 'For freelancers & professionals',
      price: '$9',
      cadence: 'per month',
      description: 'Unlimited conversions, high-DPI outputs, and neural OCR scanning.',
      isPopular: true,
      features: [
        'Unlimited daily operations',
        'Max file size: 500 MB',
        'Batch multi-file conversion',
        'Full Word DOCX & PPTX export',
        'Neural Tesseract OCR engine',
        'High-ratio compression profile',
        'No watermarks or queues',
      ],
      buttonText: user.tier === 'pro' ? 'Current Plan' : 'Select Pro Plan',
    },
    {
      id: 'business',
      name: 'Business Team',
      audience: 'For offices & scaling organizations',
      price: '$29',
      cadence: 'per month',
      description: 'Maximum processing power, shared quotas, and team collaboration controls.',
      features: [
        'Unlimited operations & batch jobs',
        'Max file size: 2,048 MB (2 GB)',
        'Priority parallel processing pipeline',
        'Shared team usage dashboard',
        'Custom watermark brand presets',
        'Dedicated SLA & 24/7 priority support',
      ],
      buttonText: user.tier === 'business' ? 'Current Plan' : 'Select Business',
    },
  ];

  const handleSelectPlan = (tier: UserTier) => {
    switchTier(tier);
    setPricingModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Choose the Right PaperEase Plan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent pricing with no surprise limits. Instant activation with full cancellation flexibility.
            </p>
          </div>
          <button
            onClick={() => setPricingModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = user.tier === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col justify-between border transition-all ${
                  plan.isPopular
                    ? 'border-blue-500 shadow-md ring-1 ring-blue-500/30 bg-blue-50/10'
                    : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div>
                  {plan.isPopular && (
                    <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.audience}</p>

                  <div className="mt-4 mb-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/{plan.cadence}</span>
                  </div>

                  <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : plan.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Guarantee Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>30-Day Money-Back Guarantee · Cancel anytime in one click</span>
          </div>
          <div className="font-mono text-[11px]">Secure 256-bit TLS encrypted checkout</div>
        </div>
      </div>
    </div>
  );
};
