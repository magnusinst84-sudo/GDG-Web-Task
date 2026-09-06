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

import { hexToRgba } from "@/lib/utils";

const PopupComp = ({ isOpen, onClose, PopupData, accentColor }) => {
  const hasAccent = Boolean(accentColor);
  const borderTopStyle = hasAccent
    ? { borderTop: `3px solid ${accentColor}` }
    : {};
  const glowStyle = hasAccent
    ? {
        background: `radial-gradient(ellipse at 50% 0%, ${hexToRgba(
          accentColor,
          0.2
        )} 0%, rgba(24,24,27,0) 70%)`,
      }
    : {};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white relative overflow-hidden"
        style={borderTopStyle}
      >
        {hasAccent && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={glowStyle}
          />
        )}
        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              {hasAccent && (
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: accentColor }}
                />
              )}
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
              className={
                hasAccent
                  ? "font-medium px-6 text-white border transition-colors"
                  : "bg-white text-black hover:bg-zinc-200 font-medium px-6"
              }
              style={
                hasAccent
                  ? {
                      backgroundColor: hexToRgba(accentColor, 0.15),
                      borderColor: hexToRgba(accentColor, 0.5),
                    }
                  : {}
              }
            >
              Got it
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupComp;

