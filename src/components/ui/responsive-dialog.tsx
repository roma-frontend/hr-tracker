'use client';

import * as React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface ResponsiveDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ResponsiveDialog({ children, open, onOpenChange }: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {children}
    </Drawer>
  );
}

function ResponsiveDialogTrigger({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogTrigger>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? (
    <DialogTrigger {...props}>{children}</DialogTrigger>
  ) : (
    <DrawerTrigger {...props}>{children}</DrawerTrigger>
  );
}

function ResponsiveDialogContent({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogContent>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  if (isDesktop) {
    return (
      <DialogContent className={className} {...props}>
        {children}
      </DialogContent>
    );
  }
  return (
    <DrawerContent className={className}>
      <div className="overflow-y-auto px-4 pb-4">{children}</div>
    </DrawerContent>
  );
}

function ResponsiveDialogHeader({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? (
    <DialogHeader {...props}>{children}</DialogHeader>
  ) : (
    <DrawerHeader {...props}>{children}</DrawerHeader>
  );
}

function ResponsiveDialogFooter({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? (
    <DialogFooter {...props}>{children}</DialogFooter>
  ) : (
    <DrawerFooter {...props}>{children}</DrawerFooter>
  );
}

function ResponsiveDialogTitle({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogTitle>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? (
    <DialogTitle {...props}>{children}</DialogTitle>
  ) : (
    <DrawerTitle {...props}>{children}</DrawerTitle>
  );
}

function ResponsiveDialogDescription({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogDescription>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? (
    <DialogDescription {...props}>{children}</DialogDescription>
  ) : (
    <DrawerDescription {...props}>{children}</DrawerDescription>
  );
}

function ResponsiveDialogClose({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogClose>) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? (
    <DialogClose {...props}>{children}</DialogClose>
  ) : (
    <DrawerClose {...props}>{children}</DrawerClose>
  );
}

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogClose,
};
