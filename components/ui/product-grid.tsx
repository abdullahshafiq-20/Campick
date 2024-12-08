import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Product {
  item_id: string;
  name: string;
  price: string;
  description: string;
  image_url?: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface ProductGridProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedCategory: string;
  shopId: string;
  removeFromCart: (productId: string) => void;
  isShopOpen: boolean;
}

interface MenuItem {
  item_id: string;
  shop_id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  price: string;
  created_at: string;
  updated_at: string;
}

export function ProductGrid({
  cartItems,
  setCartItems,
  selectedCategory,
  shopId,
  removeFromCart,
  isShopOpen
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/shop/${shopId}/getAllMenuItems`
        );
        console.log('Menu Items:', response.data);
        setProducts(response.data.items || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [shopId]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, [setCartItems]);

  const filteredProducts = Array.isArray(products)
    ? selectedCategory === 'All'
      ? products
      : products.filter((product) => product.category === selectedCategory)
    : [];

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.item_id === product.item_id
      );
      let newItems;

      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.item_id === product.item_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity: 1 }];
      }

      localStorage.setItem('cartItems', JSON.stringify(newItems));
      return newItems;
    });
  };

  const getItemQuantity = (productId: string) => {
    return cartItems.find((item) => item.item_id === productId)?.quantity || 0;
  };

  const handleProductClick = async (productId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/shop/${shopId}/getMenuItem/${productId}`
      );
      setSelectedProduct(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const getModalQuantityControls = (product: MenuItem) => {
    const quantity = getItemQuantity(product.item_id);

    if (quantity === 0) {
      return (
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
        >
          Add to Cart
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            removeFromCart(product.item_id);
          }}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredProducts.map((product) => {
          const quantity = getItemQuantity(product.item_id);

          return (
            <Card
              key={product.item_id}
              className={cn(
                'border shadow-sm transition-colors',
                isShopOpen ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              )}
              onClick={() => isShopOpen && handleProductClick(product.item_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold sm:text-base md:text-lg">
                      {product.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 sm:text-base">
                      Rs. {product.price}
                    </p>
                    <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                      {product.description}
                    </p>
                  </div>
                  <div className="relative h-24 w-24 flex-shrink-0 sm:h-28 sm:w-28 md:h-32 md:w-32">
                    <Image
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    {isShopOpen && (
                      <>
                        {quantity === 0 ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 sm:h-8 sm:w-8"
                          >
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        ) : (
                          <div
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shadow-lg sm:h-7 sm:w-7 sm:text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {quantity}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]" hideCloseButton>
          {selectedProduct && (
            <>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">
                  {selectedProduct.name}
                </DialogTitle>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <DialogDescription className="text-sm text-gray-500">
                {selectedProduct.description}
              </DialogDescription>

              <div className="mt-4">
                <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={selectedProduct.image_url || '/placeholder.svg'}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      Category
                    </h4>
                    <p>{selectedProduct.category}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      Description
                    </h4>
                    <p>{selectedProduct.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-500">
                      Price
                    </h4>
                    <p className="text-lg font-semibold">
                      Rs. {selectedProduct.price}
                    </p>
                  </div>

                  <div className="pt-2">
                    {getModalQuantityControls(selectedProduct)}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
