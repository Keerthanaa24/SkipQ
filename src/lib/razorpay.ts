declare global {
    interface Window {
        Razorpay: any;
    }
}

const RAZORPAY_KEY_ID = 'rzp_test_ekuUcHA0UOfU6z';

export const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const openRazorpay = (
    amount: number,
    user: { name: string; email: string },
    onSuccess: () => void,
    onError?: (error: any) => void
) => {
    const options = {
        key: 'rzp_test_ekuUcHA0UOfU6z',
        amount: amount * 100, // in paise
        currency: 'INR',
        name: 'SkipQ Wallet',
        description: 'Add money to wallet',
        image: '/favicon.ico',
        handler: function (response: any) {
            console.log('Payment successful:', response);
            onSuccess();
        },
        prefill: {
            name: user.name,
            email: user.email,
        },
        theme: {
            color: '#2563eb',
        },
        modal: {
            ondismiss: function () {
                onError?.('Payment cancelled');
            }
        }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
};
