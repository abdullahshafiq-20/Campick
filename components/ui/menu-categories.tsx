'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface MenuCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  shopId: string;
}

interface MenuItem {
  category: string;
}

export function MenuCategories({
  selectedCategory,
  onSelectCategory,
  shopId
}: MenuCategoriesProps) {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/shop/${shopId}/getAllMenuItems`
        );
        console.log('Categories response:', response.data);

        if (response.data.items && Array.isArray(response.data.items)) {
          const uniqueCategories = Array.from(
            new Set<string>(
              response.data.items.map(
                (item: MenuItem) => item.category as string
              )
            )
          );
          setCategories(['All', ...uniqueCategories]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories(['All']);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [shopId]);

  if (loading) {
    return (
      <div className="py-4">
        <div className="flex animate-pulse space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-4">
      <div className="flex space-x-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => onSelectCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
