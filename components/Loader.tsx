"use client";

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-black">
      <div className="relative flex items-center justify-center">
        
        {/* Rotating dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-10"
            style={{
              animation: "spin 2.5s linear infinite",
              animationDelay: `${i * 0.15}s`,
              transform: `rotate(${i * 60}deg)`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: "#22c55e",
                boxShadow: "0 0 10px #22c55e, 0 0 20px #22c55e",
              }}
            />
          </div>
        ))}

        {/* Center Glow */}
        <div
          className="w-6 h-6 rounded-full animate-pulse"
          style={{
            backgroundColor: "#22c55e",
            filter: "blur(6px)",
            opacity: 0.7,
          }}
        />

        {/* Optional Text */}
        <p className="absolute -bottom-12 text-green-400 text-sm tracking-widest animate-pulse">
          LOADING...
        </p>

      </div>
    </div>
  );
}