import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import CartItems from './cart';

const CheckoutSidebar = () => {
  const [cartState, setCartState] = useState(false);
  const [items, setItems] = useState([]);

  const router = useRouter();

  useEffect(() => {
    // Sync cart state from localStorage
    const savedState = JSON.parse(
      localStorage.getItem('cartSidebarState') || 'false'
    );
    setCartState(savedState);

    // Sync cart items from localStorage
    const savedItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    setItems(savedItems);

    const updateItems = () => {
      const updatedItems = JSON.parse(
        localStorage.getItem('cartItems') || '[]'
      );
      setItems(updatedItems);
    };

    const handleCartToggle = () => {
      const state = JSON.parse(
        localStorage.getItem('cartSidebarState') || 'false'
      );
      setCartState(state);
    };

    window.addEventListener('cartUpdated', updateItems);
    window.addEventListener('cartToggle', handleCartToggle);

    return () => {
      window.removeEventListener('cartUpdated', updateItems);
      window.removeEventListener('cartToggle', handleCartToggle);
    };
  }, []);

  const closeHandler = () => {
    localStorage.setItem('cartSidebarState', JSON.stringify(false));
    setCartState(false);
    window.dispatchEvent(new CustomEvent('cartToggle'));
  };

  const emptyHandler = () => {
    setItems([]);
    localStorage.setItem('cartItems', JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: 0 }));
    closeHandler();
  };

  const gotoCheckout = () => {
    closeHandler();
    router.push('/checkout');
  };

  return (
    <>
      {cartState && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeHandler}
        ></div>
      )}

      <div
        className={`fixed right-0 top-0 z-50 h-full w-80 transform bg-white shadow-lg transition-transform lg:w-96 ${
          cartState ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Cart</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={closeHandler}
          >
            ✖
          </button>
        </div>

        <div className="checkout-sidebar-scrollable max-h-[calc(100vh-6rem)] p-4">
          {items.length > 0 ? (
            <>
              <div className="mt-6 flex flex-col gap-4">
                <CartItems items={items} />

                <Button variant="default" onClick={gotoCheckout}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" onClick={emptyHandler}>
                  🗑️ Empty Cart
                </Button>
              </div>
            </>
          ) : (
            <h5 className="text-center text-gray-500">No items in cart</h5>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutSidebar;
