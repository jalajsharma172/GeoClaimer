// Test script to verify the new area calculation formula
// Formula: Area = (distance * 2 * r) + (π * r²)
// Where r = 10 meters (radius), distance = path length

function calculateClaimedArea(pathLength, radius = 10) {
  // Area = (distance * 2 * r) + (π * r²)
  const rectangularArea = pathLength * 2 * radius; // Path corridor area
  const circularArea = Math.PI * radius * radius; // End caps area
  return rectangularArea + circularArea;
}

// Test cases
console.log("=== Area Calculation Test Results ===");

// Test 1: 100m path with 10m radius
const path1 = 100; // 100 meters
const area1 = calculateClaimedArea(path1);
console.log(`Path length: ${path1}m`);
console.log(`Claimed area: ${Math.round(area1)} m²`);
console.log(`Breakdown: Corridor (${path1 * 2 * 10}) + End caps (${Math.round(Math.PI * 10 * 10)}) = ${Math.round(area1)}`);
console.log("");

// Test 2: 500m path with 10m radius  
const path2 = 500; // 500 meters
const area2 = calculateClaimedArea(path2);
console.log(`Path length: ${path2}m`);
console.log(`Claimed area: ${Math.round(area2)} m²`);
console.log(`Breakdown: Corridor (${path2 * 2 * 10}) + End caps (${Math.round(Math.PI * 10 * 10)}) = ${Math.round(area2)}`);
console.log("");

// Test 3: 1km path with 10m radius
const path3 = 1000; // 1000 meters
const area3 = calculateClaimedArea(path3);
console.log(`Path length: ${path3}m`);
console.log(`Claimed area: ${Math.round(area3)} m²`);
console.log(`Breakdown: Corridor (${path3 * 2 * 10}) + End caps (${Math.round(Math.PI * 10 * 10)}) = ${Math.round(area3)}`);
console.log("");

console.log("=== Formula Verification ===");
console.log("Formula: Area = (distance * 2 * r) + (π * r²)");
console.log("Where:");
console.log("- distance = path length in meters");
console.log("- r = 10 meters (path radius)");
console.log("- π * r² = circular end caps area ≈ 314 m²");
console.log("- distance * 2 * r = rectangular corridor area");