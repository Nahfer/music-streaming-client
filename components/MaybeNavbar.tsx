"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function MaybeNavbar() {
  const pathname = usePathname() || '/';

  // Hide navbar for the auth pages only
  const hideFor = ['/login', '/signup'];
  const shouldHide = hideFor.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (shouldHide) return null;
  return <Navbar />;
}
