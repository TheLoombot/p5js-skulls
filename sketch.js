let skullBaseColor;
let skullFeatureColor;
const grayShades = [
  '#f7f7f7', // lightest
  '#cccccc',
  '#a0a0a0',
  '#787878',
  '#505050',
  '#222222'  // darkest
];

// Base skull dimensions
const BASE_CRANIUM_W = 180;
const BASE_CRANIUM_H = 180;
const BASE_JAW_W = 110;
const BASE_JAW_H = 70;

let craniumW, craniumH, jawW, jawH;
let teethCount, teethLineW;
let outlineWidth; // Add variable for random outline width

// Eye randomization variables
let leftEyeW, leftEyeH, rightEyeW, rightEyeH;
let leftEyeOverlap, rightEyeOverlap;
let leftEyeX, rightEyeX, eyeY;
let eyesFaceUp; // true for up, false for down
let eyesMismatched; // true if one up, one down

// Only tooth gaps feature
let toothGapIndices = [];

// Sliders
let jawHeightSlider, craniumWidthSlider, craniumHeightSlider, teethSlider;

function setup() {
  let canvas = createCanvas(900, 620); // Increased height for a taller canvas
  canvas.parent('sketch-holder');
  window.randomizeSkull = randomizeSkullsGrid;

  // Attach event listeners for HTML sliders
  document.getElementById('jaw-height-slider').addEventListener('input', randomizeSkullsGrid);
  document.getElementById('cranium-width-slider').addEventListener('input', randomizeSkullsGrid);
  document.getElementById('cranium-height-slider').addEventListener('input', randomizeSkullsGrid);
  document.getElementById('teeth-slider').addEventListener('input', randomizeSkullsGrid);

  randomizeSkullsGrid();
}

function randomizeSkullsGrid() {
  background(255);
  let cols = 3;
  let rows = 2;
  let skullW = 350;
  let skullH = 350;
  let xMargin = (width - cols * skullW) / (cols + 1);
  let yMargin = (height - rows * skullH) / (rows + 1);
  let gridTop = (height - (rows * skullH + (rows - 1) * yMargin)) / 2 + 30; // move grid down by 30px
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let cx = xMargin + skullW / 2 + col * (skullW + xMargin);
      let cy = gridTop + skullH / 2 + row * (skullH + yMargin);
      drawRandomSkull(cx, cy, skullW, skullH);
    }
  }
}

function drawRandomSkull(centerX, centerY, skullW, skullH) {
  // Pick two distinct colors for base and features
  skullBaseColor = random(grayShades);
  let featureChoices = grayShades.filter(c => c !== skullBaseColor);
  skullFeatureColor = random(featureChoices);
  // Randomize outline width
  outlineWidth = random(5, 15);
  // Randomize overall skull size
  let scaleH = random(0.8, 1.2);
  let scaleW = random(0.8, 1.2);

  // Read slider values directly from DOM
  let jawHeightRatio = parseFloat(document.getElementById('jaw-height-slider').value);
  let craniumWidthRatio = parseFloat(document.getElementById('cranium-width-slider').value);
  let craniumHeightRatio = parseFloat(document.getElementById('cranium-height-slider').value);
  let teethSliderValue = parseFloat(document.getElementById('teeth-slider').value);

  craniumH = skullH * craniumHeightRatio * scaleH;
  craniumW = skullW * craniumWidthRatio * scaleW;
  jawH = skullH * jawHeightRatio * scaleH;
  jawW = (skullW * 0.31 * scaleW) * random(0.8, 1.2);

  // Teeth count logic: interpolate range based on slider
  let t = (teethSliderValue - 6) / (16 - 6); // normalize 0-1
  let minTeeth = lerp(4, 6, t);
  let maxTeeth = lerp(6, 9, t);
  teethCount = floor(random(minTeeth, maxTeeth + 1));
  teethLineW = random(0.65, 0.85) * jawW;
  // Randomize eyes
  let baseEyeW = 40 * random(0.9, 1.1);  // base width of 45 pixels with ±10% variation
  let baseEyeH = 35 * random(0.9, 1.1);  // base height of 35 pixels with ±10% variation
  leftEyeW = baseEyeW * random(0.95, 1.05);
  leftEyeH = baseEyeH * random(0.95, 1.05);
  rightEyeW = baseEyeW * random(0.95, 1.05);
  rightEyeH = baseEyeH * random(0.95, 1.05);
  leftEyeOverlap = leftEyeH * random(0.38, 0.52);
  rightEyeOverlap = rightEyeH * random(0.38, 0.52);
  let eyeXSpread = craniumW * random(0.20, 0.24);
  leftEyeX = centerX - eyeXSpread;
  rightEyeX = centerX + eyeXSpread;
  eyeY = centerY - 50 + random(-5, 10); // small vertical jitter
  eyesFaceUp = random([true, false]);
  eyesMismatched = random(1) < 0.05; 
  // Randomize tooth gaps (per-tooth, extremely rare)
  toothGapIndices = [];
  let nCols = teethCount;
  let nRows = 2;
  for (let row = 0; row < nRows; row++) {
    for (let col = 1; col <= nCols; col++) {
      if (random(1) < 0.01) { // 1 in 100 chance per tooth
        toothGapIndices.push(`${row},${col}`);
      }
    }
  }
  // Randomize crack parameters
  let showCrack = random(1) < 0.2; 
  let crackParams = null;
  let crackParams2 = null;
  if (showCrack) {
    // First crack
    crackParams = generateCrack(centerX, centerY, craniumW, craniumH);
    // 1% chance for a second crack (10x rarer)
    if (random(1) < 0.01) {
      crackParams2 = generateCrack(centerX, centerY, craniumW, craniumH);
    }
  }
  drawAbstractSkull(centerX, centerY, crackParams, crackParams2);
}

function generateCrack(centerX, centerY, craniumW, craniumH) {
  let startAngle = random(-PI * 0.95, -PI * 0.05); // -171° to -9° (upper half)
  let rX = craniumW / 2;
  let rY = craniumH / 2;
  // Calculate the normal to the ellipse at the start angle (perpendicular to perimeter)
  let nx = cos(startAngle) / rX;
  let ny = sin(startAngle) / rY;
  let normLen = sqrt(nx*nx + ny*ny);
  nx /= normLen;
  ny /= normLen;
  // Start slightly outside the perimeter
  let offset = 8;
  let startX = centerX + (rX * cos(startAngle)) + nx * offset;
  let startY = centerY - 40 + (rY * sin(startAngle)) + ny * offset;
  let nSegs = floor(random(1, 3));
  let segs = [];
  let prevX = startX;
  let prevY = startY;
  // Initial angle is along the normal, pointing inward
  let angle = atan2(ny, nx) + PI; // inward
  angle += random(-PI/12, PI/12); // small random deviation
  for (let i = 0; i < nSegs; i++) {
    let len = random(10, 20);
    if (i > 0) angle += random(-PI/12, PI/12); // much smaller deviation between segments
    let nextX = prevX + len * cos(angle);
    let nextY = prevY + len * sin(angle);
    segs.push({x1: prevX, y1: prevY, x2: nextX, y2: nextY});
    prevX = nextX;
    prevY = nextY;
  }
  return segs;
}

function drawAbstractSkull(centerX = width/2, centerY = height/2, crackParams = null, crackParams2 = null) {
  noStroke();
  // Pick outline color (different from base and feature colors)
  let outlineChoices = grayShades.filter(c => c !== skullBaseColor && c !== skullFeatureColor);
  let outlineColor = random(outlineChoices);
  
  // Draw outline ellipses (slightly larger and behind)
  fill(outlineColor);
  ellipse(centerX, centerY - 40, craniumW + outlineWidth, craniumH + outlineWidth); // Cranium outline
  // Jaw outline: random ellipse or rect
  let useRectJaw = random([true, false]);
  if (useRectJaw) {
    rectMode(CENTER);
    rect(centerX, centerY + 40, jawW + outlineWidth, jawH + outlineWidth, 16);
    rectMode(CORNER);
  } else {
    ellipse(centerX, centerY + 40, jawW + outlineWidth, jawH + outlineWidth); // Jaw outline ellipse
  }
  
  // Original skull shapes
  fill(skullBaseColor);
  ellipse(centerX, centerY - 40, craniumW, craniumH);
  if (useRectJaw) {
    rectMode(CENTER);
    rect(centerX, centerY + 40, jawW, jawH, 12);
    rectMode(CORNER);
  } else {
    ellipse(centerX, centerY + 40, jawW, jawH);
  }
  drawEyes(centerX, centerY);
  drawNose(centerX, centerY);
  drawTeeth(centerX, centerY);
  if (crackParams) drawCraniumCrack(crackParams);
  if (crackParams2) drawCraniumCrack(crackParams2);
}

function drawEyes(centerX, centerY) {
  // Use randomized parameters
  // Determine overlap direction for each eye
  let leftSign, rightSign;
  let leftYOffset = 0;
  let rightYOffset = 0;
  if (eyesMismatched) {
    leftSign = 1;
    rightSign = -1;
  } else {
    let overlapSign = eyesFaceUp ? 1 : -1;
    leftSign = overlapSign;
    rightSign = overlapSign;
  }
  if (leftSign === -1) leftYOffset = -5;
  if (rightSign === -1) rightYOffset = -5;
  // Vertical offset for overlap ellipse (increases crescent size)
  let overlapYOffsetL = leftSign * leftEyeH * random(0.20, 0.30);
  let overlapYOffsetR = rightSign * rightEyeH * random(0.20, 0.30);
  // Overlap ellipse shape factors
  let overlapWFactorL = random(1.25, 1.4);
  let overlapHFactorL = random(0.55, 0.7);
  let overlapWFactorR = random(1.25, 1.4);
  let overlapHFactorR = random(0.55, 0.7);
  // Left eye
  fill(skullFeatureColor);
  ellipse(leftEyeX, eyeY + leftYOffset, leftEyeW, leftEyeH);
  fill(skullBaseColor);
  if (leftSign === 1) {
    // Overlap is above: draw bottom half arc
    arc(
      leftEyeX,
      eyeY + leftYOffset + leftSign * leftEyeOverlap + overlapYOffsetL,
      leftEyeW * overlapWFactorL,
      leftEyeH * overlapHFactorL,
      PI, TWO_PI
    );
  } else {
    // Overlap is below: draw top half arc
    arc(
      leftEyeX,
      eyeY + leftYOffset + leftSign * leftEyeOverlap + overlapYOffsetL,
      leftEyeW * overlapWFactorL,
      leftEyeH * overlapHFactorL,
      0, PI
    );
  }
  // Right eye
  fill(skullFeatureColor);
  ellipse(rightEyeX, eyeY + rightYOffset, rightEyeW, rightEyeH);
  fill(skullBaseColor);
  if (rightSign === 1) {
    // Overlap is above: draw bottom half arc
    arc(
      rightEyeX,
      eyeY + rightYOffset + rightSign * rightEyeOverlap + overlapYOffsetR,
      rightEyeW * overlapWFactorR,
      rightEyeH * overlapHFactorR,
      PI, TWO_PI
    );
  } else {
    // Overlap is below: draw top half arc
    arc(
      rightEyeX,
      eyeY + rightYOffset + rightSign * rightEyeOverlap + overlapYOffsetR,
      rightEyeW * overlapWFactorR,
      rightEyeH * overlapHFactorR,
      0, PI
    );
  }
}

function drawNose(centerX, centerY) {
  // 1 in 24 chance to omit the nose
  if (random(1) < 1/24) return;
  // Calculate nose dimensions relative to skull size
  let noseWidth = craniumW * random(0.12, 0.16);  // 12-16% of cranium width
  let noseHeight = noseWidth * random(1.1, 1.3);  // 10-30% taller than wide
  let noseY = eyeY + random(40, 60);  // Position below eyes
  
  // Draw triangle (pointing up)
  fill(skullFeatureColor);
  noStroke();
  triangle(
    centerX, noseY - noseHeight,  // top point
    centerX - noseWidth/2, noseY,  // bottom left
    centerX + noseWidth/2, noseY   // bottom right
  );
  
  // Draw overlapping arc
  fill(skullBaseColor);
  noStroke();
  let arcYOffset = 20 * random(0.2, 0.9); // 3-8% of nose height lower
  arc(centerX, noseY + 2, noseWidth + 5, noseWidth + arcYOffset, PI, TWO_PI);
}

function drawTeeth(centerX, centerY) {
  // Teeth grid parameters
  let cx = centerX;
  let cy = centerY + 50; // moved teeth down by 10 pixels
  let lineW = teethLineW;
  let lineH = jawH * 0.32; // vertical lines height, fits inside jaw
  let y = cy; // horizontal line y
  let x1 = cx - lineW/2;
  let x2 = cx + lineW/2;
  // Grid parameters
  let nCols = teethCount;
  let nRows = 2; // You can increase for more rows of teeth
  if (nCols > 1) {
    let toothSpacing = lineW / (nCols + 1);
    let rectW = toothSpacing * 0.9; // small gap between rects
    let vTop = y - lineH/2;
    for (let row = 0; row < nRows; row++) {
      // Add extra vertical spacing between rows
      let rowSpacing = random(0,3); // pixels of extra space between rows
      let rectY = vTop + row * (lineH / nRows) + row * rowSpacing;
      for (let col = 1; col <= nCols; col++) {
        // Gaps are now per-tooth (row, col)
        let toothKey = `${row},${col}`;
        if (toothGapIndices.includes(toothKey)) continue;
        let tx = x1 + col * toothSpacing;
        let skew = 0;
        if (random(1) < 1/3) {
          skew = random(-0.18, 0.18); // small skew in radians
        }
        // Vary the height of each tooth slightly
        let rectH = (lineH / nRows * 0.9) * random(0.85, 1.15);
        push();
        translate(tx, rectY + rectH/2);
        rotate(skew);
        fill(skullBaseColor);
        noStroke();
        rect(-rectW/2, -rectH/2, rectW, rectH, 1);
        stroke(skullFeatureColor);
        strokeWeight(1);
        beginShape(LINES);
        if (row === 0) {
          // Top row: omit upper edge
          // Left edge
          vertex(-rectW/2, -rectH/2); vertex(-rectW/2, rectH/2);
          // Bottom edge
          vertex(-rectW/2, rectH/2); vertex(rectW/2, rectH/2);
          // Right edge
          vertex(rectW/2, rectH/2); vertex(rectW/2, -rectH/2);
        } else {
          // Bottom row: omit lower edge
          // Left edge
          vertex(-rectW/2, -rectH/2); vertex(-rectW/2, rectH/2);
          // Top edge
          vertex(-rectW/2, -rectH/2); vertex(rectW/2, -rectH/2);
          // Right edge
          vertex(rectW/2, -rectH/2); vertex(rectW/2, rectH/2);
        }
        endShape();
        pop();
      }
    }
  }
  noStroke();
}

function drawCraniumCrack(segs) {
  let wStart = 6;
  let wEnd = 2;
  let n = segs.length;
  let widths = [];
  // Calculate widths for each segment: start with wStart, end with wEnd, interpolate
  for (let i = 0; i <= n; i++) {
    widths.push(lerp(wStart, wEnd, i / n));
  }
  for (let i = 0; i < segs.length; i++) {
    let s = segs[i];
    let w1 = widths[i];
    let w2 = widths[i + 1];
    // Direction of the segment
    let dx = s.x2 - s.x1;
    let dy = s.y2 - s.y1;
    let len = sqrt(dx*dx + dy*dy);
    let nx = -dy / len;
    let ny = dx / len;
    // Start and end points for the triangle
    let x1a = s.x1 + nx * w1/2;
    let y1a = s.y1 + ny * w1/2;
    let x1b = s.x1 - nx * w1/2;
    let y1b = s.y1 - ny * w1/2;
    let x2a = s.x2 + nx * w2/2;
    let y2a = s.y2 + ny * w2/2;
    let x2b = s.x2 - nx * w2/2;
    let y2b = s.y2 - ny * w2/2;
    fill(255);
    noStroke();
    beginShape();
    vertex(x1a, y1a);
    vertex(x1b, y1b);
    vertex(x2b, y2b);
    vertex(x2a, y2a);
    endShape(CLOSE);
  }
}

function draw() {
  // No continuous drawing needed for static skull
}

function changeColor() {
  // Placeholder for future use
}

function clearCanvas() {
  background(255);
  // Do not call randomizeSkullsGrid here
} 