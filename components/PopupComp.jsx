"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PopupComp = ({ isOpen, onClose, PopupData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {PopupData?.header}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            {PopupData?.description}
          </DialogDescription>
        </DialogHeader>

        {PopupData?.message && PopupData.message.length > 0 && (
          <ul className="my-4 space-y-2 text-sm text-zinc-300 list-disc list-inside bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
            {PopupData.message.map((msg, index) => (
              <li key={index} className="leading-relaxed">
                {msg}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end mt-4">
          <Button
            type="button"
            onClick={onClose}
            className="bg-white text-black hover:bg-zinc-200 font-medium px-6"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupComp;

