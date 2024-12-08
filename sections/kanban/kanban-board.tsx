'use client';

import { Fragment, useEffect, useState } from 'react';
import NewSectionDialog from './new-section-dialog';
import EditShopDetails from './edit-shop-details';
import shopImg from '@/public/shopimg.avif';
import axios from 'axios';
import { AddNewMenuItem } from '@/components/add_new_item';
import Image from 'next/image';
import { UpdateMenuItem } from '@/components/update_menu_item';
import { DeleteItem } from '@/components/delete_menu_item';
import demoImg from '@/public/demoimg.png';
import { set } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader, LoaderSm } from '@/components/ui/loader';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ShopData {
  name: string;
  description: string;
  image_url: string;
  email: string;
  contact_number: string;
  full_name: string;
  account_title: string;
  payment_method: string;
  payment_details: string;
}

interface MenuItem {
  item_id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
}

export function AllShops({ shopExists }: { shopExists: boolean }) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [error, setError] = useState<string>('');
  const [shopId, setShopId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchShopData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please login.');
        setLoading(false);
        return;
      }

      try {
        const shopsResponse = await axios.get(`${API_URL}/api/ownerShops`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const shops = shopsResponse.data.shops;

        if (shops.length > 0) {
          const shopId = shops[0].id;
          setShopId(shopId);

          const shopDetailsResponse = await axios.get(
            `${API_URL}/api/shop/${shopId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          setIsOpen(shopDetailsResponse.data.is_open);
          setShopData({
            name: shopDetailsResponse.data.name,
            description: shopDetailsResponse.data.description,
            image_url: shopDetailsResponse.data.image_url || shopImg.src,
            email: shopDetailsResponse.data.contact.email,
            contact_number: shopDetailsResponse.data.contact.contact_number,
            full_name: shopDetailsResponse.data.contact.full_name,
            account_title: shopDetailsResponse.data.contact.account_title,
            payment_method: shopDetailsResponse.data.contact.payment_method,
            payment_details: shopDetailsResponse.data.contact.payment_details
          });

          const menuItemsResponse = await axios.get(
            `${API_URL}/api/shop/${shopId}/getAllMenuItems`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          setMenuItems(menuItemsResponse.data.items);
        } else {
          setError('No shops found for this owner.');
        }
      } catch (error) {
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [isMounted]);

  const setImage = (image_url: string) => {
    return image_url || demoImg.src;
  };

  const handleToggleShopStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      await axios.put(
        `${API_URL}/api/shop/${shopId}/toggle-status`,
        { is_open: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setIsOpen(!isOpen);
      toast({
        title: 'Success',
        description: `Shop is now ${!isOpen ? 'open' : 'closed'} for orders`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update shop status',
        variant: 'destructive'
      });
    }
  };

  if (!isMounted) return null;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="h-full p-2 sm:p-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {shopExists ? (
        <div className="h-full">
          <div
            key={shopId}
            className="flex h-full flex-col rounded-lg border-border p-3 sm:p-6"
          >
            {/* Shop Header */}
            {!shopData ? (
              <LoaderSm />
            ) : (
              <>
                <div className="mb-4 flex flex-col gap-6 sm:mb-6 sm:flex-row">
                  {/* Shop Image */}
                  <div className="relative h-48 w-full overflow-hidden rounded-lg border sm:w-48">
                    <Image
                      src={shopData.image_url || shopImg.src}
                      alt={shopData.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* Shop Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                          {shopData.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {shopData.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {shopData.contact_number}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={isOpen}
                            onCheckedChange={handleToggleShopStatus}
                          />
                          <span className="text-sm font-medium">
                            {isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <EditShopDetails shopId={shopId} shopData={shopData} />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                      {shopData.description}
                    </p>
                  </div>
                </div>

                {/* Contact & Payment Information */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Contact Information
                    </h3>
                    <div className="space-y-2 rounded-lg border p-2 sm:p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="font-medium">Full Name:</span>
                        <span>{shopData.full_name}</span>
                        <span className="font-medium">Email:</span>
                        <span>{shopData.email}</span>
                        <span className="font-medium">Phone:</span>
                        <span>{shopData.contact_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Payment Information
                    </h3>
                    <div className="space-y-2 rounded-lg border p-2 sm:p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="font-medium">Account Title:</span>
                        <span>{shopData.account_title}</span>
                        <span className="font-medium">Payment Method:</span>
                        <span>{shopData.payment_method}</span>
                        <span className="font-medium">Account Details:</span>
                        <span>{shopData.payment_details}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Menu Items */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold sm:text-lg">
                  Menu Items
                </h3>
                <AddNewMenuItem shopId={shopId} />
              </div>

              {menuItems === null ? (
                <LoaderSm />
              ) : menuItems.length === 0 ? (
                <div className="rounded-lg border border-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No items available in the menu.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {menuItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg border border-border p-2 sm:gap-4 sm:p-3"
                    >
                      <Image
                        src={setImage(item.image_url)}
                        alt={item.name}
                        width={60}
                        height={60}
                        className="rounded-md object-cover sm:h-20 sm:w-20"
                      />
                      <div className="flex flex-1 items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium sm:text-base">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground sm:text-sm">
                            {item.description}
                          </p>
                          <p className="text-xs font-medium text-primary sm:text-sm">
                            Rs. {item.price}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          <UpdateMenuItem shopId={shopId} menuItem={item} />
                          <DeleteItem shopId={shopId} itemId={item.item_id} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <NewSectionDialog />
        </div>
      )}
    </div>
  );
}
