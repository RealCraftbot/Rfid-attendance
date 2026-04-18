'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-200 w-full -z-10" />
        
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? 'var(--color-brand-green)'
                    : isCurrent
                    ? 'var(--color-brand-blue)'
                    : '#fff',
                  borderColor: isCompleted
                    ? 'var(--color-brand-green)'
                    : isCurrent
                    ? 'var(--color-brand-blue)'
                    : '#e5e7eb',
                }}
                className={`w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 ${
                  isCompleted || isCurrent ? 'shadow-lg' : 'shadow-sm'
                }`}
                style={{
                  boxShadow: isCurrent
                    ? '0 0 20px rgba(1, 67, 223, 0.3)'
                    : isCompleted
                    ? '0 0 15px rgba(63, 242, 156, 0.3)'
                    : undefined,
                }}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-brand-navy" />
                ) : (
                  <span
                    className={`text-sm font-bold ${
                      isCurrent ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    {step.id}
                  </span>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-16 w-32 text-center"
              >
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? 'text-brand-blue' : 'text-zinc-600'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5 hidden sm:block">
                  {step.description}
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}