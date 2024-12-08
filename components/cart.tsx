import React, { useEffect, useState } from 'react';
import demoProduct from '@/public/demoimg.png';
import Image from 'next/image';

interface CartItem {
  name: string;
  item_id: string;
  quantity: number;
  description: string;
  price: number;
  shop_name: string;
  shop_id: string;
  image_url: string;
}

interface CartItemsProps {
  items: CartItem[];
}

const CartItems: React.FC<CartItemsProps> = ({ items }) => {
  const [newItems, setNewItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    setNewItems(savedCart ? JSON.parse(savedCart) : items);
  }, [items]);

  const updateItemQuantity = (
    item: CartItem,
    action: 'add' | 'reduce',
    value: number
  ) => {
    const updatedItems = newItems
      .map((cartItem) => {
        if (cartItem.item_id === item.item_id) {
          const newQuantity =
            action === 'add'
              ? cartItem.quantity + value
              : cartItem.quantity - value;

          if (newQuantity <= 0) {
            return null;
          }

          return { ...cartItem, quantity: Math.max(newQuantity, 1) }; // Prevent quantity from going below 1
        }
        return cartItem;
      })
      .filter((cartItem) => cartItem !== null) as CartItem[]; // Ensure non-null items

    setNewItems(updatedItems); // Update the state with new items
    localStorage.setItem('cartItems', JSON.stringify(updatedItems)); // Save the updated cart in localStorage
  };

  const cartQuantity = (item: CartItem) => {
    return (
      <div className="flex justify-between">
        <button
          className="rounded-l-md bg-gray-800 p-2 pl-3 pr-3 text-white hover:bg-gray-700 "
          onClick={() => updateItemQuantity(item, 'reduce', 1)}
        >
          -
        </button>
        <input
          type="text"
          aria-label="Item quantity"
          className="w-full border border-gray-300 p-2 text-center "
          readOnly
          value={item.quantity}
        />
        <button
          className="rounded-r-md bg-gray-800 p-2 pl-3 pr-3 text-white hover:bg-gray-700"
          onClick={() => updateItemQuantity(item, 'add', 1)}
        >
          +
        </button>
      </div>
    );
  };

  const productVariants = (item: CartItem) => {
    return (
      <div className="mt-2">
        <p className="text-sm text-gray-700">
          <strong>Description:</strong> {item.description}
        </p>
      </div>
    );
  };

  const showimage = (image: string) => {
    return image || demoProduct.src;
  };

  const totalitems = () => {
    let total = 0;
    newItems.forEach((item) => {
      total += item.quantity;
    });
    return total;
  };

  const totalPrice = () => {
    let total = 0;
    newItems.forEach((item) => {
      total += item.price * item.quantity;
    });
    return total;
  };

  return (
    <>
      <ul className="space-y-4 border-b pb-4">
        {newItems.map((item, index) => (
          <li className="flex p-4" key={'cartItem-' + index}>
            <div className="w-1/4">
              <Image
                src={showimage(item.image_url)}
                alt={item.name}
                width={300}
                height={200}
                className="rounded-md"
              />
            </div>
            <div className="w-3/4 pl-4">
              <div className="flex items-center justify-between">
                <h6 className="font-semibold">{item.name}</h6>
                <div className="text-right">Rs. {item.price}</div>
              </div>
              <div className="mt-2 ">{cartQuantity(item)}</div>
              {productVariants(item)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <div className="flex justify-between text-lg font-semibold">
          <div>Total items:</div>
          <div>{totalitems()}</div>
        </div>

        <div className="mt-4 flex justify-between text-lg font-semibold">
          <div>Cart total:</div>
          <div>Rs. {totalPrice()}</div>
        </div>
      </div>
    </>
  );
};

export default CartItems;
