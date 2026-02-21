import React from 'react';

export default function ProductTemplates({ type, color, printLocation, designPosition, designSize, rotation, designImage }) {
  // Define print areas for different locations
  const printAreas = {
    'tshirt': {
      'front-center': { x: 150, y: 180, width: 120, height: 140 },
      'front-left': { x: 100, y: 120, width: 50, height: 50 },
      'back-center': { x: 150, y: 180, width: 120, height: 140 },
      'sleeve': { x: 220, y: 120, width: 40, height: 60 }
    },
    'polo': {
      'front-center': { x: 150, y: 200, width: 100, height: 120 },
      'front-left': { x: 100, y: 140, width: 45, height: 45 },
      'back-center': { x: 150, y: 200, width: 100, height: 120 },
      'sleeve': { x: 220, y: 140, width: 35, height: 55 }
    },
    'hoodie': {
      'front-center': { x: 150, y: 200, width: 130, height: 150 },
      'front-left': { x: 95, y: 150, width: 50, height: 50 },
      'back-center': { x: 150, y: 200, width: 130, height: 150 },
      'sleeve': { x: 230, y: 140, width: 40, height: 65 }
    },
    'hat': {
      'front-center': { x: 150, y: 100, width: 80, height: 40 },
      'side': { x: 230, y: 100, width: 50, height: 30 },
      'back': { x: 150, y: 100, width: 60, height: 30 }
    }
  };

  const printArea = printAreas[type]?.[printLocation] || printAreas['tshirt']['front-center'];
  
  // Adjust color for visibility
  const adjustedColor = color === '#ffffff' ? '#f5f5f5' : color;
  const strokeColor = color === '#000000' ? '#333' : '#ccc';

  return (
    <svg viewBox="0 0 300 400" className="w-full h-auto" style={{ maxHeight: '500px' }}>
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {type === 'tshirt' && (
        <g filter="url(#shadow)">
          {/* T-Shirt body */}
          <path 
            d="M150 40 C175 40 190 30 210 20 L240 60 L205 85 L205 300 C205 315 193 327 178 327 L122 327 C107 327 95 315 95 300 L95 85 L60 60 L90 20 C110 30 125 40 150 40 Z" 
            fill={adjustedColor} 
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Collar */}
          <ellipse cx="150" cy="45" rx="15" ry="8" fill={adjustedColor} stroke={strokeColor} strokeWidth="2"/>
          {/* Print area indicator (invisible in production) */}
          <rect 
            x={printArea.x - printArea.width/2} 
            y={printArea.y - printArea.height/2} 
            width={printArea.width} 
            height={printArea.height} 
            fill="none" 
            stroke="rgba(59, 130, 246, 0.3)" 
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </g>
      )}

      {type === 'polo' && (
        <g filter="url(#shadow)">
          {/* Polo body */}
          <path 
            d="M150 50 C175 50 190 40 210 30 L240 70 L205 95 L205 310 C205 325 193 337 178 337 L122 337 C107 337 95 325 95 310 L95 95 L60 70 L90 30 C110 40 125 50 150 50 Z" 
            fill={adjustedColor} 
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Collar with placket */}
          <path d="M140 50 L140 120 L160 120 L160 50" fill="none" stroke={strokeColor} strokeWidth="2"/>
          <path d="M130 50 L150 35 L170 50" fill="none" stroke={strokeColor} strokeWidth="2"/>
          <circle cx="150" cy="70" r="2" fill={strokeColor}/>
          <circle cx="150" cy="90" r="2" fill={strokeColor}/>
          <circle cx="150" cy="110" r="2" fill={strokeColor}/>
          {/* Print area */}
          <rect 
            x={printArea.x - printArea.width/2} 
            y={printArea.y - printArea.height/2} 
            width={printArea.width} 
            height={printArea.height} 
            fill="none" 
            stroke="rgba(59, 130, 246, 0.3)" 
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </g>
      )}

      {type === 'hoodie' && (
        <g filter="url(#shadow)">
          {/* Hoodie body */}
          <path 
            d="M150 60 C175 60 190 50 210 40 L245 80 L210 105 L210 320 C210 335 198 347 183 347 L117 347 C102 347 90 335 90 320 L90 105 L55 80 L90 40 C110 50 125 60 150 60 Z" 
            fill={adjustedColor} 
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Hood */}
          <path 
            d="M120 60 Q150 20 180 60" 
            fill={adjustedColor} 
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Drawstrings */}
          <line x1="140" y1="60" x2="135" y2="90" stroke={strokeColor} strokeWidth="2"/>
          <line x1="160" y1="60" x2="165" y2="90" stroke={strokeColor} strokeWidth="2"/>
          {/* Pocket */}
          <path 
            d="M110 200 L110 240 Q150 250 190 240 L190 200" 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="2"
          />
          {/* Print area */}
          <rect 
            x={printArea.x - printArea.width/2} 
            y={printArea.y - printArea.height/2} 
            width={printArea.width} 
            height={printArea.height} 
            fill="none" 
            stroke="rgba(59, 130, 246, 0.3)" 
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </g>
      )}

      {type === 'hat' && (
        <g filter="url(#shadow)">
          {/* Hat crown */}
          <ellipse 
            cx="150" 
            cy="100" 
            rx="80" 
            ry="50" 
            fill={adjustedColor} 
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Hat brim */}
          <ellipse 
            cx="150" 
            cy="140" 
            rx="120" 
            ry="20" 
            fill={adjustedColor} 
            stroke={strokeColor}
            strokeWidth="2"
          />
          {/* Panels */}
          <path d="M110 80 Q150 50 190 80" fill="none" stroke={strokeColor} strokeWidth="1"/>
          <path d="M130 75 Q150 55 170 75" fill="none" stroke={strokeColor} strokeWidth="1"/>
          {/* Button on top */}
          <circle cx="150" cy="55" r="5" fill={strokeColor}/>
          {/* Print area */}
          <rect 
            x={printArea.x - printArea.width/2} 
            y={printArea.y - printArea.height/2} 
            width={printArea.width} 
            height={printArea.height} 
            fill="none" 
            stroke="rgba(59, 130, 246, 0.3)" 
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </g>
      )}

      {/* Design overlay */}
      {designImage && (
        <image
          href={designImage}
          x={printArea.x - (printArea.width * designSize) / 2}
          y={printArea.y - (printArea.height * designSize) / 2}
          width={printArea.width * designSize}
          height={printArea.height * designSize}
          transform={`rotate(${rotation} ${printArea.x} ${printArea.y})`}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </svg>
  );
}
