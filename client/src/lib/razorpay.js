let loading;
export function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  loading ??= new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => {
      loading = undefined;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return loading;
}
