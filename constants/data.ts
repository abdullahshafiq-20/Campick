import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/shopdashboard',
    icon: 'dashboard',
    label: 'Dashboard'
  },
  {
    title: 'Orders',
    href: '/shopdashboard/orders',
    icon: 'product',
    label: 'Orders'
  },
  {
    title: 'Profile',
    href: '/shopdashboard/profile',
    icon: 'userPen',
    label: 'Profile'
  },
  {
    title: 'Shops',
    href: '/shopdashboard/shops',
    icon: 'kanban',
    label: 'Shops'
  },
  {
    title: 'Logout',
    href: '/',
    icon: 'login',
    label: 'Logout'
  }
];
