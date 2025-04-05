export default function DonationAlert({
  accentColor,
  backgroundColor,
  borderStyle,
  customMessage,
  fontFamily,
  fontSize,
  primaryColor,
  showAmount,
  showDonorName,
  donation,
  name,
}: {
  accentColor: string;
  backgroundColor: string;
  borderStyle: string; // none, solid, gradient
  customMessage: string;
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  showAmount: boolean;
  showDonorName: boolean;
  donation?: number;
  name?: string;
}) {
  const getBorderStyle = () => {
    if (borderStyle === "none") return "";
    if (borderStyle === "solid") return `border-4 border-${accentColor}`;
    if (borderStyle === "gradient")
      return `border-4 border-gradient-to-r from-${accentColor}-500 to-purple-500`;

    return "";
  };

  return (
    <div className="w-full h-60 overflow-hidden">
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 m-8 rounded-lg backdrop-blur-sm shadow-2xl transition-all duration-800 ${getBorderStyle()}`}
        style={{
          backgroundColor: backgroundColor,
          color: primaryColor,
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
        }}
      >
        <div className="relative z-10">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-gray-900/80 border-2 border-gray-700">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L19.5 7V17L12 22L4.5 17V7L12 2Z"
                stroke={accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22V16"
                stroke={accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.5 7L12 12"
                stroke={accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.5 7L12 12"
                stroke={accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-6">
          {showDonorName && (
            <div className="font-bold text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
                {name ? name : "John Doe"}
              </span>
            </div>
          )}

          {showAmount && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <span style={{ color: accentColor }}>donated</span>
              <span className="font-mono font-bold">
                {donation ? donation : 10000}
              </span>
            </div>
          )}

          <div className="mt-2 opacity-80">{customMessage}</div>
        </div>

        {/* Particle effect background */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="particles-container">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="particle absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: i % 2 === 0 ? accentColor : primaryColor,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                  animation: `float ${Math.random() * 5 + 5}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
