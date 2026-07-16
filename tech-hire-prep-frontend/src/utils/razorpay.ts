declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => {
      open: () => void;
    };
  }
}

export const loadRazorpayScript = async (): Promise<boolean> => {
  if (window.Razorpay) return true;

  return await new Promise<boolean>((resolve) => {
    const existing = document.getElementById('razorpay-checkout-script');
    if (existing) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = async (options: {
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => Promise<void>;
  onDismiss?: () => void;
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Razorpay SDK could not be loaded.');
  }

  const checkout = new window.Razorpay({
    key: (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ?? '',
    order_id: options.orderId,
    amount: options.amount,
    currency: options.currency,
    name: options.name,
    description: options.description,

    method: {
      upi: true,
    },

    config: {
      display: {
        blocks: {
          upi: {
            name: "Pay via UPI",
            instruments: [
              {
                method: "upi",
              },
            ],
          },
        },
      },
    },

    handler: options.onSuccess,

    modal: {
      ondismiss: options.onDismiss,
    },

    prefill: options.prefill,

    theme: {
      color: '#0f172a',
    },
  });

  checkout.open();
};
