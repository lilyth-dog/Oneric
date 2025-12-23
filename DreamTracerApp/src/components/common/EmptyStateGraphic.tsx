import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface EmptyStateGraphicProps {
  width?: number;
  height?: number;
}

const EmptyStateGraphic: React.FC<EmptyStateGraphicProps> = ({ width = 200, height = 200 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 200" fill="none">
      <Defs>
        <LinearGradient id="cloudGradient" x1="50" y1="0" x2="150" y2="200">
          <Stop offset="0" stopColor="#A594F9" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#6C5DD3" stopOpacity="0.1" />
        </LinearGradient>
      </Defs>

      {/* Sleeping Cloud / Empty Bubble */}
      <Path
        d="M 60 100
           Q 40 80, 60 60
           Q 80 40, 110 50
           Q 140 30, 160 60
           Q 180 80, 160 100
           Q 180 120, 150 130
           Q 120 140, 90 130
           Q 60 140, 40 120
           Q 30 110, 60 100 Z"
        fill="url(#cloudGradient)"
        stroke="#EAE8F0"
        strokeWidth="1"
        strokeOpacity="0.3"
        strokeDasharray="5, 5"
      />

      {/* Zzz marks */}
      <Path
        d="M 120 40 L 130 40 L 120 50 L 130 50"
        stroke="#FFDDA8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <Path
        d="M 140 25 L 146 25 L 140 31 L 146 31"
        stroke="#FFDDA8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* Stars */}
      <Circle cx="50" cy="50" r="2" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="160" cy="110" r="1.5" fill="#FFFFFF" opacity="0.4" />
      <Circle cx="100" cy="150" r="3" fill="#FFFFFF" opacity="0.2" />

    </Svg>
  );
};

export default EmptyStateGraphic;
