// components/BarcodeScanner.tsx
import React, { useEffect, useRef } from "react";
import Quagga from "@ericblade/quagga2";

export default function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            facingMode: "environment", // Use back camera
          },
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"], // Add/remove as needed
        },
      },
      (err) => {
        if (err) {
          console.error("Quagga init failed:", err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((result) => {
      const code = result.codeResult.code;
      if (code) {
        onDetected(code);
        Quagga.stop();
      }
    });

    return () => {
      Quagga.offDetected();
      Quagga.stop();
    };
  }, [onDetected]);

  return (
    <div className="relative">
      <div ref={scannerRef} className="w-full h-64 bg-black rounded-lg overflow-hidden" />
      <button onClick={onClose} className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow">
        Fermer
      </button>
    </div>
  );
}
