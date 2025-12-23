import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

interface BrandLogoProps {
  width?: number;
  height?: number;
  color?: string; // Main color override
}

const BrandLogo: React.FC<BrandLogoProps> = ({ width = 120, height = 120, color }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="moonGradient" x1="20" y1="20" x2="80" y2="80">
          <Stop offset="0" stopColor="#FFDDA8" stopOpacity="1" />
          <Stop offset="1" stopColor="#FFC670" stopOpacity="0.8" />
        </LinearGradient>
        <LinearGradient id="waveGradient" x1="0" y1="50" x2="100" y2="50">
          <Stop offset="0" stopColor="#A594F9" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#6C5DD3" stopOpacity="0.9" />
        </LinearGradient>
      </Defs>

      {/* Crescent Moon */}
      {/* Circle center 50,50 r 40 */}
      {/* Path approximation for crescent: Outer circle minus Inner offset circle */}
      <Path
        d="M 50 10 
           A 40 40 0 1 1 50 90
           A 40 40 0 1 1 50 10
           Z"
        fill="none" // Just reference size
      />
      {/* Actual Crescent Shape */}
      <Path
        d="M 70 20
           A 35 35 0 1 0 70 80
           A 28 28 0 1 1 70 20
           Z"
        fill="url(#moonGradient)"
        transform="rotate(-15, 50, 50)"
      />

      {/* Dream Wave / Mist flowing across */}
      <Path
        d="M 10 65
           Q 30 55, 50 65
           T 90 65"
        stroke="url(#waveGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
       <Path
        d="M 15 75
           Q 35 65, 55 75
           T 85 75"
        stroke="url(#waveGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      
      {/* Stars/Sparkles */}
      <Circle cx="80" cy="30" r="2" fill="#FFFFFF" opacity="0.8" />
      <Circle cx="20" cy="80" r="1.5" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="85" cy="40" r="1" fill="#FFFFFF" opacity="0.5" />

    </Svg>
  );
};

export default BrandLogo;
