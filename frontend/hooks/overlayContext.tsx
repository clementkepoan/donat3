"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

export interface OverlayContextType {
  fontSize?: number;
  fontFamily?: string;
  primaryColor?: string;
  backgroundColor?: string;
  accentColor?: string;
  showDonorName?: boolean;
  showAmount?: boolean;
  customMessage?: string;
  borderStyle?: string;

  setFontSize?: (size: number) => void;
  setFontFamily?: (family: string) => void;
  setPrimaryColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setAccentColor?: (color: string) => void;
  setShowDonorName?: (show: boolean) => void;
  setShowAmount?: (show: boolean) => void;
  setCustomMessage?: (message: string) => void;
  setBorderStyle?: (style: string) => void;
}

const OverlayContext = createContext<OverlayContextType>({} as any);

export const OverlayProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [backgroundColor, setBackgroundColor] = useState(
    "rgba(17, 24, 39, 0.85)"
  );
  const [accentColor, setAccentColor] = useState("#10B981");
  const [showDonorName, setShowDonorName] = useState(true);
  const [showAmount, setShowAmount] = useState(true);
  const [customMessage, setCustomMessage] = useState(
    "Thanks for your donation!"
  );
  const [borderStyle, setBorderStyle] = useState("gradient");

  return (
    <OverlayContext.Provider
      value={{
        fontSize,
        fontFamily,
        primaryColor,
        backgroundColor,
        accentColor,
        showDonorName,
        showAmount,
        customMessage,
        borderStyle,

        setFontSize,
        setFontFamily,
        setPrimaryColor,
        setBackgroundColor,
        setAccentColor,
        setShowDonorName,
        setShowAmount,
        setCustomMessage,
        setBorderStyle,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};

export const useOverlay = (): OverlayContextType => {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
};
