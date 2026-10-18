import { Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, CheckCircle2, Check } from 'lucide-react';

export interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  {
    step: 1,
    title: 'Giỏ hàng',
    description: 'Kiểm tra món nước',
    icon: ShoppingBag,
    link: '/cart',
  },
  {
    step: 2,
    title: 'Thanh toán',
    description: 'Địa chỉ & phương thức',
    icon: CreditCard,
    link: '/checkout',
  },
  {
    step: 3,
    title: 'Hoàn tất',
    description: 'Xác nhận & giao hàng',
    icon: CheckCircle2,
    link: '#',
  },
] as const;

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="w-full py-4 sm:py-6">
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative flex items-center justify-between">
          {/* Connecting Background Line */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-stone-200 z-0" />

          {/* Active Progress Line */}
          <div
            className="absolute top-5 left-8 h-0.5 bg-primary transition-all duration-500 z-0"
            style={{
              width:
                currentStep === 1
                  ? '0%'
                  : currentStep === 2
                  ? '50%'
                  : 'calc(100% - 4rem)',
            }}
          />

          {STEPS.map((s) => {
            const isCompleted = s.step < currentStep;
            const isCurrent = s.step === currentStep;
            const Icon = s.icon;

            const stepNode = (
              <div className="relative z-10 flex flex-col items-center group">
                {/* Circle Icon Indicator */}
                <div
                  className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center transition-all duration-300 font-bold text-xs sm:text-sm ${
                    isCompleted
                      ? 'bg-primary text-white shadow-xs'
                      : isCurrent
                      ? 'bg-primary text-white ring-4 ring-primary/20 shadow-md'
                      : 'bg-white border-2 border-stone-200 text-stone-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>

                {/* Text Info */}
                <div className="text-center mt-2">
                  <span
                    className={`block text-xs sm:text-sm font-bold transition-colors ${
                      isCurrent
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-stone-800'
                        : 'text-stone-400'
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="hidden sm:block text-[11px] text-muted-foreground mt-0.5">
                    {s.description}
                  </span>
                </div>
              </div>
            );

            // Allow clicking to go back to completed step 1 (Cart)
            if (isCompleted && s.step === 1) {
              return (
                <Link
                  key={s.step}
                  to="/cart"
                  className="hover:opacity-80 transition-opacity"
                  title="Quay lại giỏ hàng"
                >
                  {stepNode}
                </Link>
              );
            }

            return <div key={s.step}>{stepNode}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
