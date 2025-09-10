import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  reservationUrl: string;
}

const ReservationModal = ({ isOpen, onClose, title = "Fazer Reserva", reservationUrl }: ReservationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0">
        <DialogHeader className="p-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 h-[calc(95vh-80px)]">
          <iframe
            src={reservationUrl}
            className="w-full h-full border-0"
            title={title}
            allow="payment; geolocation"
            sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-popups"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;