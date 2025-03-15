import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";

// Define the props interface for the ResponsiveModal component
interface ResponsiveModalProps {
  children: React.ReactNode; // Content to be displayed inside the modal
  open: boolean; // Controls whether the modal is open or closed
  title: string; // Title of the modal
  onOpenChange: (open: boolean) => void; // Callback function when the modal open state changes
}

// ResponsiveModal - Displays a modal that adapts to mobile and desktop views
export const ResponsiveModal = ({
  children,
  open,
  title,
  onOpenChange,
}: ResponsiveModalProps) => {
  const isMobile = useIsMobile(); // Checks if the user is on a mobile device

  // Uses a Drawer component on mobile devices
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  // Uses a Dialog component on larger screens
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
