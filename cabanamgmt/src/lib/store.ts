import { create } from "zustand";

type BookingState = {
  bookingId?: string;
  consent?: { fullName: string; email: string; phone: string };
  idv?: { status: "pending"|"passed"|"failed"; ref?: string };
  deposit?: { status: "pending"|"paid"|"refunded"|"forfeited"; intentId?: string };
  screening?: { status: "pending"|"clear"|"consider"|"adverse"; ref?: string };
  interview?: { status: "pending"|"scheduled"|"completed"|"failed"; slot?: string };
  contracts?: { ndaSigned: boolean; termsSigned: boolean };
  reset: () => void;
  set: (p: Partial<BookingState>) => void;
};

export const useBooking = create<BookingState>((set) => ({
  reset: () => set({ bookingId: undefined, consent: undefined, idv: undefined, deposit: undefined, screening: undefined, interview: undefined, contracts: undefined }),
  set: (p) => set(p),
}));
