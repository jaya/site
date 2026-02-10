
const fs = require('fs');
const path = require('path');

const filePath = '/Users/ricardopareja/dev/jaya/src/components/home/map/MapCultureElement.astro';
const content = fs.readFileSync(filePath, 'utf8');

const pathRegex = /<path[^>]*d="([^"]+)"/g;
const polygonRegex = /<polygon[^>]*points="([^"]+)"/g;

let matches;
const paths = [];

// Extract paths
let index = 0;
while ((matches = pathRegex.exec(content)) !== null) {
  const d = matches[1];
  const mMatch = /M([\d\.]+),([\d\.]+)/.exec(d);
  if (mMatch) {
    paths.push({
      type: 'path',
      index: index++,
      length: d.length,
      x: parseFloat(mMatch[1]),
      y: parseFloat(mMatch[2]),
      original: d.substring(0, 50) + '...'
    });
  }
}

// Extract polygons
while ((matches = polygonRegex.exec(content)) !== null) { // Simple regex for the one polygon
  const points = matches[1].trim().split(/\s+/); // Split by whitespace
  // Points are x1 y1 x2 y2 ...
   if (points.length >= 2) {
     paths.push({
        type: 'polygon',
        index: index++,
        length: matches[1].length, // approximate perimeter
        x: parseFloat(points[0]), 
        y: parseFloat(points[1]),
        original: matches[1].substring(0, 50) + '...'
      });
   }
}


// Brazil States approximate data (Lat, Long)
// We need to normalize this to match 0-393 range.
// Lat: North (+5) to South (-34). Y: 0 to 393.
// Long: West (-74) to East (-34). X: 0 to 393.

const bounds = {
  minLat: -34, maxLat: 5.5,
  minLong: -74, maxLong: -34.5
};

// SVG Bounds (approx from viewbox)
const svgBounds = {
  minX: 0, maxX: 393,
  minY: 0, maxY: 393
};

function normalizeGeo(lat, long) {
  // Y is inverted (Top is high Lat)
  const y = (bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat) * (svgBounds.maxY - svgBounds.minY);
  const x = (long - bounds.minLong) / (bounds.maxLong - bounds.minLong) * (svgBounds.maxX - svgBounds.minX);
  return { x, y };
}

const states = [
  { id: 'AC', name: 'Acre', lat: -9.02, long: -70.81 },
  { id: 'AL', name: 'Alagoas', lat: -9.57, long: -36.78 },
  { id: 'AP', name: 'Amapá', lat: 0.90, long: -52.00 }, // centered
  { id: 'AM', name: 'Amazonas', lat: -3.41, long: -65.87 },
  { id: 'BA', name: 'Bahia', lat: -12.57, long: -41.70 },
  { id: 'CE', name: 'Ceará', lat: -5.49, long: -39.32 },
  { id: 'DF', name: 'Distrito Federal', lat: -15.79, long: -47.88 },
  { id: 'ES', name: 'Espírito Santo', lat: -19.18, long: -40.30 },
  { id: 'GO', name: 'Goiás', lat: -15.82, long: -49.83 },
  { id: 'MA', name: 'Maranhão', lat: -4.96, long: -45.27 },
  { id: 'MT', name: 'Mato Grosso', lat: -12.68, long: -56.92 },
  { id: 'MS', name: 'Mato Grosso do Sul', lat: -20.77, long: -54.78 },
  { id: 'MG', name: 'Minas Gerais', lat: -18.51, long: -44.55 },
  { id: 'PA', name: 'Pará', lat: -1.99, long: -54.93 },
  { id: 'PB', name: 'Paraíba', lat: -7.23, long: -36.78 },
  { id: 'PR', name: 'Paraná', lat: -25.25, long: -52.02 },
  { id: 'PE', name: 'Pernambuco', lat: -8.81, long: -36.95 },   // Adjusted center to avoid overlap with others
  { id: 'PI', name: 'Piauí', lat: -7.71, long: -42.72 },
  { id: 'RJ', name: 'Rio de Janeiro', lat: -22.90, long: -43.17 }, // approx
  { id: 'RN', name: 'Rio Grande do Norte', lat: -5.79, long: -36.95 },
  { id: 'RS', name: 'Rio Grande do Sul', lat: -30.03, long: -51.22 }, // approx
  { id: 'RO', name: 'Rondônia', lat: -11.50, long: -63.58 },
  { id: 'RR', name: 'Roraima', lat: 2.73, long: -62.07 }, // High north
  { id: 'SC', name: 'Santa Catarina', lat: -27.24, long: -50.21 },
  { id: 'SP', name: 'São Paulo', lat: -23.55, long: -46.63 },
  { id: 'SE', name: 'Sergipe', lat: -10.57, long: -37.38 },
  { id: 'TO', name: 'Tocantins', lat: -10.17, long: -48.33 }
];

console.log('--- PATH ANALYSIS ---');
// For each state, find the closest path Start Point
// Note: This is imperfect because "Start Point" M x,y isn't always the center.
// But we can filter by distance.

const assignedPaths = new Set();
const potentialMatches = [];

states.forEach(state => {
  const norm = normalizeGeo(state.lat, state.long);
  
  // Calculate distances to all paths
  const distances = paths.map(p => {
    const dist = Math.sqrt(Math.pow(p.x - norm.x, 2) + Math.pow(p.y - norm.y, 2));
    return { ...p, dist };
  });

  distances.sort((a, b) => a.dist - b.dist);
  
  // Take top 3 candidates
  potentialMatches.push({
    state: state.id,
    expected: `x:${norm.x.toFixed(0)}, y:${norm.y.toFixed(0)}`,
    candidates: distances.slice(0, 3).map(d => `${d.index} (d=${d.dist.toFixed(1)}, len=${d.length})`)
  });
});

console.log(JSON.stringify(potentialMatches, null, 2));
console.log('--- RAW PATHS ---');
console.log(JSON.stringify(paths, null, 2));
