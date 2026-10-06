const ROW_SIZE = 200;
const COLUMN_SIZE = 320;

const DISTANCE_CLOSE = 50;
const DISTANCE_MEDIUM = 150;
const DISTANCE_FAR = 300;

const NEAR_CLIP = 10;
const camera = {x: 0, y: 0, z: 0};
const MAX_RENDER_DISTANCE= 7050;
const PROJECTION_SCALE = 60; // scaled down from index.js's 300, proportional to
                              // this buffer being 1/5th the width (320 vs 1600)
let zoomLevel = 1.0; // This will be used to scale the camera's projection

//Track Segements

const TRACK_SEGMENT_SCALE = 8;
const TRACK_SEGMENT_LOCAL_HALF_DEPTH = 5;
const TRACK_SEGMENT_LENGTH = TRACK_SEGMENT_LOCAL_HALF_DEPTH * 2 * TRACK_SEGMENT_SCALE; // full world z-span of one segment, always 
const TRACK_START_Z = 20;// keeps the first segment's front face safely ahead of the camera
const TRACK_SEGMENT_COUNT = 8;
const TRACK_WALL_HEIGHT = 3; // local half-height of the trench walls

// Lane switching and road constants
const LANE_SWITCH_SPEED = 0.2;
const ROAD_HALF_WIDTH = 8;
const LANE_WIDTH = (ROAD_HALF_WIDTH * 2) / 3;
const LANE_X = [-LANE_WIDTH * TRACK_SEGMENT_SCALE, 0, LANE_WIDTH * TRACK_SEGMENT_SCALE]; // x-coordinates of the three lanes, in world units
let currentLane = 1; // start centered
let isPaused = false;
const GROUND_Y = -TRACK_WALL_HEIGHT * TRACK_SEGMENT_SCALE; // matches TrackSegment's floor height exactly, always in sync


// Obstacle Constants
const OBSTACLE_SCALE = 18;
const OBSTACLE_COUNT = 6;
const OBSTACLE_LOCAL_HALF_DEPTH = 0.5; 
const SWAT_RANGE = 40;    // how far ahead of the camera you can still swat an obstacle

// Cat Constants
const CAT_Y_OFFSET= 5;
const CAT_SCALE = 1;
const BOB_SPEED = 1;      // how fast the bob cycles — higher = faster bounce
const BOB_AMPLITUDE = 0.2;    // how far up/down it moves
let bobPhase = 0;
const CAT_FORWARD_OFFSET = 15; // always this far ahead of the camera, in front of view
const CAT_LANE_OFFSET = LANE_WIDTH / 2; // how far left of camera-center the cat sits
const FORWARD_SPEED = 1;     // world units the camera advances per frame — this is the "running"
const COLLISION_RANGE = OBSTACLE_LOCAL_HALF_DEPTH * OBSTACLE_SCALE; // it's basically reached you


// Canvas setup
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const PIXEL_SIZE = 5;
const BACKGROUND_COLOR = "#9bbc0f";
const ON_COLOR = "#0f380f";

const FONT = {
    'S': [ {x1:0,y1:4,x2:2,y2:4}, {x1:0,y1:4,x2:0,y2:2}, {x1:0,y1:2,x2:2,y2:2}, {x1:2,y1:2,x2:2,y2:0}, {x1:2,y1:0,x2:0,y2:0} ],
    'T': [ {x1:0,y1:4,x2:2,y2:4}, {x1:1,y1:4,x2:1,y2:0} ],
    'A': [ {x1:0,y1:0,x2:1,y2:4}, {x1:2,y1:0,x2:1,y2:4}, {x1:0,y1:2,x2:2,y2:2} ],
    'R': [ {x1:0,y1:0,x2:0,y2:4}, {x1:0,y1:4,x2:2,y2:4}, {x1:2,y1:4,x2:2,y2:2}, {x1:0,y1:2,x2:2,y2:2}, {x1:0,y1:2,x2:2,y2:0} ],
    'E': [ {x1:0,y1:0,x2:0,y2:4}, {x1:0,y1:4,x2:2,y2:4}, {x1:0,y1:2,x2:2,y2:2}, {x1:0,y1:0,x2:2,y2:0} ],
    'L': [ {x1:0,y1:0,x2:0,y2:4}, {x1:0,y1:0,x2:2,y2:0} ],
    'C': [ {x1:2,y1:4,x2:0,y2:4}, {x1:0,y1:4,x2:0,y2:0}, {x1:0,y1:0,x2:2,y2:0} ],
    'M': [ {x1:0,y1:0,x2:0,y2:4}, {x1:0,y1:4,x2:1,y2:2}, {x1:1,y1:2,x2:2,y2:4}, {x1:2,y1:4,x2:2,y2:0} ],
    'K': [ {x1:0,y1:0,x2:0,y2:4}, {x1:0,y1:2,x2:2,y2:4}, {x1:0,y1:2,x2:2,y2:0} ],
    'O': [ {x1:0,y1:0,x2:0,y2:4}, {x1:0,y1:4,x2:2,y2:4}, {x1:2,y1:4,x2:2,y2:0}, {x1:2,y1:0,x2:0,y2:0} ],
    'W': [ {x1:0,y1:4,x2:0,y2:0}, {x1:0,y1:0,x2:1,y2:2}, {x1:1,y1:2,x2:2,y2:0}, {x1:2,y1:0,x2:2,y2:4} ],
    'V': [ {x1:0,y1:4,x2:1,y2:0}, {x1:1,y1:0,x2:2,y2:4} ],
    'P': [ {x1:0,y1:0,x2:0,y2:4}, {x1:0,y1:4,x2:2,y2:4}, {x1:2,y1:4,x2:2,y2:2}, {x1:2,y1:2,x2:0,y2:2} ],
    'U': [ {x1:0,y1:4,x2:0,y2:0}, {x1:0,y1:0,x2:2,y2:0}, {x1:2,y1:0,x2:2,y2:4} ],
    'N': [ {x1:0,y1:0,x2:0,y2:4}, {x1:0,y1:4,x2:2,y2:0}, {x1:2,y1:0,x2:2,y2:4} ],
    'Z': [ {x1:0,y1:4,x2:2,y2:4}, {x1:2,y1:4,x2:0,y2:0}, {x1:0,y1:0,x2:2,y2:0} ],
    'I': [ {x1:0,y1:4,x2:2,y2:4}, {x1:1,y1:4,x2:1,y2:0}, {x1:0,y1:0,x2:2,y2:0} ],
    '=': [ {x1:0,y1:3,x2:2,y2:3}, {x1:0,y1:1,x2:2,y2:1} ],
    '-': [ {x1:0,y1:2,x2:2,y2:2} ],
    ' ': []
};
// This class will be used to draw on the 320x200 grid
// Via the 5 pixel by 5 pixel squares on the canvas.

class displayGrid{
    constructor(){
        this.displayMatrix = Array.from({ length: ROW_SIZE }, () =>
            Array.from({ length: COLUMN_SIZE }, () => ({color: BACKGROUND_COLOR, depth: Infinity}))
        );
        this.depthMatrix= Array.from({ length: ROW_SIZE }, () =>
            Array.from({ length: COLUMN_SIZE }, () => Infinity)
        );
    }

    colorPixel(x, y, color = ON_COLOR){
        if(x < 0 || x >= COLUMN_SIZE || y < 0 || y >= ROW_SIZE){
            return;
        }
        this.displayMatrix[ROW_SIZE-1 - y][x].color = color;
    }

    colorPixelDepth(x, y, depth, color = ON_COLOR){
        if(x < 0 || x >= COLUMN_SIZE || y < 0 || y >= ROW_SIZE) return;
        const row= ROW_SIZE - 1 - y;
        if(depth < this.depthMatrix[row][x]){
            this.depthMatrix[row][x] = depth;
            this.displayMatrix[row][x].color = color;
            this.displayMatrix[row][x].depth = depth;
        }
    }

    getPixelDepth(x, y){
        if(x < 0 || x >= COLUMN_SIZE || y < 0 || y >= ROW_SIZE){
            console.log("Pixel was outside of drawable range, way outside");
            return -99999;
        }
        const pixel = this.displayMatrix[ROW_SIZE-1 - y][x];
        // Get any possible pixel color or just make it mad far away
        if(pixel == null || pixel.depth == null){
            return -99999;
        }

        console.log(`got pixel depth: ${pixel.depth}`);
        return pixel.depth;
    }

    render(){
        for(let r = 0; r < ROW_SIZE; r++){
            for(let c = 0; c < COLUMN_SIZE; c++){
                ctx.fillStyle = this.displayMatrix[r][c].color;
                ctx.fillRect(c*PIXEL_SIZE, r*PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
        }
    }
}

function projectInstance(instance){
    let projectedVertices = [];
    for(let i = 0; i < instance.vertices.length; i++){
        let relativeCamVert = {
            x: (instance.x + instance.vertices[i].x * instance.scale) - camera.x,
            y: (instance.y + instance.vertices[i].y * instance.scale) - camera.y,
            z: (instance.z + instance.vertices[i].z * instance.scale) - camera.z,
        };
        if(relativeCamVert.z <= NEAR_CLIP){
            relativeCamVert.z= NEAR_CLIP; 
           
        }

        let newU = (relativeCamVert.x / relativeCamVert.z) * PROJECTION_SCALE * zoomLevel;
        let newV = (relativeCamVert.y / relativeCamVert.z) * PROJECTION_SCALE * zoomLevel;

        projectedVertices.push({
            u: newU + COLUMN_SIZE / 2,
            v: newV + ROW_SIZE / 2,
            depth: relativeCamVert.z,
        });
    }
    return projectedVertices;
}

function drawWireframe(projectedVertices, edges){
    for(let i = 0; i < edges.length; i++){
        let from = projectedVertices[edges[i][0]];
        let to = projectedVertices[edges[i][1]];
        if(!from || !to) continue; // skip edges touching an unprojectable vertex
        makePixelatedLine(Math.round(from.u), Math.round(from.v), Math.round(to.u), Math.round(to.v));
    }
}

class CatHead{
    // x, y, z coordinates of the bottom of the cat head
    constructor(x, y, z, scale=1){
    this.x = x;
    this.y = y;
    this.z = z;
    this.scale = scale;
    this.vertices = [];
    this.edges = [];
  }

  draw(){
    // Setup the Verticies and Edges
    this.vertices = [
    // Right Head Shape
    { x: 999, y: -999, z: this.z},  // 0 (Dummy bc forgot to index at 0)
    { x: 0, y: 0, z: this.z},  // 1
    { x: 5, y: 2, z: this.z},  // 2
    { x: 6, y: 4, z: this.z},  // 3
    { x: 7, y: 7, z: this.z},  // 4
    { x: 6, y: 10, z: this.z},  // 5
    // Right Ear
    { x: 5, y: 11, z: this.z},  // 6
    { x: 4, y: 12, z: this.z},  // 7
    { x: 6, y: 14, z: this.z},  // 8
    { x: 7, y: 16, z: this.z},  // 9
    // Right end of Head
    { x: 3, y: 13, z: this.z},  // 10
    { x: 0, y: 14, z: this.z},  // 11
    // Right Eye
    { x: 3, y: 8, z: this.z},  // 12
    { x: 2, y: 9, z: this.z},  // 13
    { x: 3, y: 10, z: this.z},  // 14
    { x: 4, y: 9, z: this.z},  // 15
    // Right Mouth
    { x: 0, y: 3, z: this.z},  // 16
    { x: 1, y: 4, z: this.z},  // 17
    { x: 2, y: 3, z: this.z},  // 18
    // Right Whisekrs
    { x: 4, y: 3, z: this.z},  // 19
    { x: 9, y: 1, z: this.z},  // 20
    { x: 4, y: 4, z: this.z},  // 21
    { x: 9, y: 3, z: this.z},  // 22
    { x: 4, y: 5, z: this.z},  // 23
    { x: 9, y: 6, z: this.z},  // 24

    // Left Cat Head
    { x: -0, y: 0, z: this.z},  // 24 + 1 (Actually did a rly cool workflow to automatically make the reflected verticies and the edges. To do so I used multiple cursors so starting again after 24 was best method)
    { x: -5, y: 2, z: this.z},  // 24 + 2
    { x: -6, y: 4, z: this.z},  // 24 + 3
    { x: -7, y: 7, z: this.z},  // 24 + 4
    { x: -6, y: 10, z: this.z},  // 24 + 5
    // Left Ear
    { x: -5, y: 11, z: this.z},  // 24 + 6
    { x: -4, y: 12, z: this.z},  // 24 + 7
    { x: -6, y: 14, z: this.z},  // 24 + 8
    { x: -7, y: 16, z: this.z},  // 24 + 9
    // Left end of Head
    { x: -3, y: 13, z: this.z},  // 24 + 10
    { x: -0, y: 14, z: this.z},  // 24 + 11
    // Left Eye
    { x: -3, y: 8, z: this.z},  // 24 + 12
    { x: -2, y: 9, z: this.z},  // 24 + 13
    { x: -3, y: 10, z: this.z},  // 24 + 14
    { x: -4, y: 9, z: this.z},  // 24 + 15
    // Left Mouth
    { x: -0, y: 3, z: this.z},  // 24 + 16
    { x: -1, y: 4, z: this.z},  // 24 + 17
    { x: -2, y: 3, z: this.z},  // 24 + 18
    // Left Whisekrs
    { x: -4, y: 3, z: this.z},  // 24 + 19
    { x: -9, y: 1, z: this.z},  // 24 + 20
    { x: -4, y: 4, z: this.z},  // 24 + 21
    { x: -9, y: 3, z: this.z},  // 24 + 22
    { x: -4, y: 5, z: this.z},  // 24 + 23
    { x: -9, y: 6, z: this.z},  // 24 + 24
  ];

    for(const v of this.vertices){
        v.x *= this.scale;
        v.y *= this.scale;
        v.z = 0;
    }

  this.edges = [
    // Right Head Shape
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    // Right Ear
    [5, 6],
    [6, 8],
    [7, 8],
    [5, 9],
    [9, 10],
    // Right End Of Head
    [10, 11],
    // Right Eye
    [12, 13],
    [13, 14],
    [14, 15],
    [15, 12],
    // Right Mouth
    [16, 17],
    [17, 18],
    // Right Whiskers
    [19, 20],
    [21, 22],
    [23, 24],

    // Left Head Shape
    [24 + 1, 24 + 2],
    [24 + 2, 24 + 3],
    [24 + 3, 24 + 4],
    [24 + 4, 24 + 5],
    // Left Ear
    [24 + 5, 24 + 6],
    [24 + 6, 24 + 8],
    [24 + 7, 24 + 8],
    [24 + 5, 24 + 9],
    [24 + 9, 24 + 10],
    // Left End Of Head
    [24 + 10, 24 + 11],
    // Left Eye
    [24 + 12, 24 + 13],
    [24 + 13, 24 + 14],
    [24 + 14, 24 + 15],
    [24 + 15, 24 + 12],
    // Left Mouth
    [24 + 16, 24 + 17],
    [24 + 17, 24 + 18],
    // Left Whiskers
    [24 + 19, 24 + 20],
    [24 + 21, 24 + 22],
    [24 + 23, 24 + 24],
         ];
      
        const projected = projectInstance(this);
        drawWireframe(projected, this.edges);
      }

};


class CatBody{
    constructor(x, y, z, scale = 1){
        this.x = x;
        this.y = y;
        this.z = z;
        this.scale = scale;
        this.vertices = [];
        this.edges = [];
    }

    draw(){
            // Back view — no face details (no eyes/whiskers/mouth), since the
    // camera is behind the cat.
    this.vertices = [
        // Ears + head top
        { x: -4, y: 14, z: 0 },  // 0: left ear tip
        { x: -6, y: 8, z: 0 },   // 1: left ear outer base
        { x: -2, y: 8, z: 0 },   // 2: left ear inner base
        { x: 0, y: 9, z: 0 },    // 3: head top center
        { x: 2, y: 8, z: 0 },    // 4: rig
        { x: 6, y: 8, z: 0 },    // 5: right ear outer base
        { x: 4, y: 14, z: 0 },   // 6: rig

        // Right side: cheek -> shoulder -
        { x: 6, y: 3, z: 0 },    // 7: right cheek
        { x: 5, y: 0, z: 0 },    // 8: rig
        { x: 5, y: -4, z: 0 },   // 9: right side
        { x: 4, y: -7, z: 0 },   // 10: ri

        // Tail (branches off the right hi
        { x: 4, y: -6, z: 0 },   // 11: tail base
        { x: 7, y: -3, z: 0 },   // 12: ta
        { x: 9, y: 1, z: 0 },    // 13: tail curve
        { x: 8, y: 5, z: 0 },    // 14: ta

        // Right leg
        { x: 3, y: -10, z: 0 },  // 15: right leg
        { x: 2, y: -11, z: 0 },  // 16: ri

        // Left leg
        { x: -3, y: -10, z: 0 }, // 17: left leg
        { x: -2, y: -11, z: 0 }, // 18: le

        // Left side: hip -> body -> shoul
        { x: -4, y: -7, z: 0 },  // 19: left hip
        { x: -5, y: -4, z: 0 },  // 20: le
        { x: -5, y: 0, z: 0 },   // 21: left shoulder
        { x: -6, y: 3, z: 0 },   // 22: le

        { x: 0, y: 4, z: 0 },    // 23: fier
    ];

    this.triangles= [
        { indices: [23,0,2], color: "#c78a4a" }, { indices: [23,2,3], color: "#c78a4a" },
        { indices: [23,3,4], color: "#c78a4a" }, { indices: [23,4,6], color: "#c78a4a" },
        { indices: [23,6,5], color: "#c78a4a" }, { indices: [23,5,7], color: "#c78a4a" },
        { indices: [23,7,8], color: "#c78a4a" }, { indices: [23,8,9], color: "#c78a4a" }, 
        { indices: [23,9,10], color: "#c78a4a" }, { indices: [23,10,19], color: "#c78a4a" },
        { indices: [23,19,20], color: "#c78a4a" }, { indices: [23,20,21], color: "#c78a4a" },
        { indices: [23,21,22], color: "#c78a4a" }, { indices: [23,22,1], color: "#c78a4a" },
        { indices: [23,1,0], color: "#c78a4a" },
    ]
    this.decorationEdges = [
        [10,11], [11,12], [12,13], [13,14],
        [10,15], [15,16],                   // right leg to paw
        [19,17], [17,18],
    ];

    drawTriangles(this);
    drawWireframe(projectInstance(this), this.decorationEdges);
    }
}

class Obstacle{
    // x, y, z = this instance's WORLD position (lane x, ground y, depth z)
    // scale   = this instance's scale factor
    constructor(x, y, z, scale = 1){
        this.x = x;
        this.y = y;
        this.z = z;
        this.scale = scale;
        this.destroyed= false;
        this.vertices = [];
        this.edges = [];
    }

    draw(){
  
        this.vertices = [
            { x: -1, y: -1, z: -0.5 }, // 0: front-bottom-left
            { x: 1, y: -1, z: -0.5 },  // 1: front-bottom-right
            { x: 1, y: 1, z: -0.5 },   // 2: front-top-right
            { x: -1, y: 1, z: -0.5 },  // 3: front-top-left
            { x: -1, y: -1, z: 0.5 },  // 4: back-bottom-left
            { x: 1, y: -1, z: 0.5 },   // 5: back-bottom-right
            { x: 1, y: 1, z: 0.5 },    // 6: back-top-right
            { x: -1, y: 1, z: 0.5 },   // 7: back-top-left
        ];

    

        this.edges = [
            [0,1], [1,2], [2,3], [3,0],
            [4,5], [5,6], [6,7], [7,4],
            [0,4], [1,5], [2,6], [3,7],
            [0,2], [1,3], // front face X-brace
            [4,6], [5,7], // back face X-brace
        ];

        this.triangles = [
            { indices: [0,1,2], color: "#b33939" }, { indices: [0,2,3], color: "#b33939" }, // front
            { indices: [5,4,7], color: "#1e3d59" }, { indices: [5,7,6], color: "#1e3d59" }, // back
            { indices: [4,0,3], color: "#2e8b57" }, { indices: [4,3,7], color: "#2e8b57" }, // left
            { indices: [1,5,6], color: "#c9a227" }, { indices: [1,6,2], color: "#c9a227" }, // right
            { indices: [3,2,6], color: "#cccccc" }, { indices: [3,6,7], color: "#cccccc" }, // top
            { indices: [4,5,1], color: "#444444" }, { indices: [4,1,0], color: "#444444" }, // bottom
        ]

        const projected = projectInstance(this);
        drawTriangles(this); 
    }
}

class TrackSegment{
    // x, y, z = this instance's WORLD position (lane-center x, ground y, depth z)
    // scale   = this instance's scale factor (bigger = longer/wider segment)
    constructor(x, y, z, scale = 1, showEndCap=false){
        this.x = x;
        this.y = y;
        this.z = z;
        this.scale = scale;
        this.showEndCap= showEndCap;
        this.vertices = [];
        this.edges = [];
    }

    draw(){
    this.vertices = [
        { x: -ROAD_HALF_WIDTH, y: -TRACK_WALL_HEIGHT, z: -5 }, // 0: front-bottom-left
        { x: ROAD_HALF_WIDTH, y: -TRACK_WALL_HEIGHT, z: -5 },  // 1: front-bottom-right
        { x: ROAD_HALF_WIDTH, y: TRACK_WALL_HEIGHT, z: -5 },   // 2: front-top-right
        { x: -ROAD_HALF_WIDTH, y: TRACK_WALL_HEIGHT, z: -5 },  // 3: front-top-left
        { x: -ROAD_HALF_WIDTH, y: -TRACK_WALL_HEIGHT, z: 5 },  // 4: back-bottom-left
        { x: ROAD_HALF_WIDTH, y: -TRACK_WALL_HEIGHT, z: 5 },   // 5: back-bottom-right
        { x: ROAD_HALF_WIDTH, y: TRACK_WALL_HEIGHT, z: 5 },    // 6: back-top-right
        { x: -ROAD_HALF_WIDTH, y: TRACK_WALL_HEIGHT, z: 5 },   // 7: back-top-left
        { x: -LANE_WIDTH / 2, y: -TRACK_WALL_HEIGHT, z: -5 }, // 8: front-left-divider
        { x: LANE_WIDTH / 2, y: -TRACK_WALL_HEIGHT, z: -5 },  // 9: front-right-divider
        { x: -LANE_WIDTH / 2, y: -TRACK_WALL_HEIGHT, z: 5 },  // 10: back-left-divider
        { x: LANE_WIDTH / 2, y: -TRACK_WALL_HEIGHT, z: 5 },   // 11: back-right-divider
    ];


    this.triangles = [
        { indices: [0,5,1], color: "#6b6b6b" }, { indices: [0,4,5], color: "#6b6b6b" }, // floor 
        { indices: [0,3,7], color: "#3a3a5e" }, { indices: [0,7,4], color: "#3a3a5e" }, // left wall
            { indices: [1,6,2], color: "#3a3a5e" }, { indices: [1,5,6], color: "#3a3a5e" }, // right wall 
    ];

    this.laneDividerEdges = [[8,10], [9,11]];

    const projected = projectInstance(this);
    drawTriangles(this);
    drawWireframe(projectInstance(this), this.laneDividerEdges);

    }
}

// CAMERON PORTING OVER DRAW CAPABILITIES
class Triangle{
    // Member varibles for 2d coordinates
    u1; u2; u3; v1; v2; v3;
    constructor(x1, y1, z1, x2, y2, z2, x3, y3, z3){
        // 3d Coordinates
        this.x1 = x1;
        this.y1 = y1;
        this.z1 = z1;
        this.x2 = x2;
        this.y2 = y2;
        this.z2 = z2;
        this.x3 = x3;
        this.y3 = y3;
        this.z3 = z3;
    }

    printVerticies(){
        console.log(`x1: ${parseInt(this.x1)}, y1: ${parseInt(this.y1)}, z1: ${parseInt(this.z1)}\nx2: ${parseInt(this.x2)}, y2: ${parseInt(this.y2)}, z2: ${parseInt(this.z2)}\nx3: ${parseInt(this.x3)}, y3: ${parseInt(this.y3)}, z3: ${parseInt(this.z3)}`);
    }

    // FULLY GPT GENERATED (Have been struggling with ordering so wanted to try to potentially avoid)
    makeClockwise() {
        // Signed 2D area / cross product of the projected triangle
        const cross =
            (this.u2 - this.u1) * (this.v3 - this.v1) -
            (this.v2 - this.v1) * (this.u3 - this.u1);

        // Positive = counter-clockwise
        // Negative = clockwise
        if (cross > 0) {
            // Swap vertex 2 and vertex 3
            [this.x2, this.x3] = [this.x3, this.x2];
            [this.y2, this.y3] = [this.y3, this.y2];
            [this.z2, this.z3] = [this.z3, this.z2];

            [this.u2, this.u3] = [this.u3, this.u2];
            [this.v2, this.v3] = [this.v3, this.v2];
        }
    }

    // https://jtsorlinis.github.io/rendering-tutorial/#:~:text=Area%20of%20a%20triangle%20(aka%20maths)
    // CLOCKWISE ONLY (Way to turn these into clockwise no matter what?)
    get2dArea(){
        return (((this.u2-this.u1)*(this.v3-this.v1))-((this.v2-this.v1)*(this.u3-this.u1))) / 2;
    }

    // Only works when coords are correctly clockwise
    getBarycentricCoordinates(u, v){
        // Step 1: Find the area of the whole triangle
        let wholeArea = Math.abs(this.get2dArea());

        // Find a p2 -> V -> p3 (Need to call general Triangle Area Formula bc using the verticies Coords)
        const aArea = getTriangleArea(this.u2, this.v2, u, v, this.u3, this.v3);

        // Find b p1 -> p3 -> V
        const bArea = getTriangleArea(this.u1, this.v1, this.u3, this.v3, u, v);

        // Find c P1 -> V -> p2
        const cArea = getTriangleArea(this.u1, this.v1, u, v, this.u2, this.v2);

        // Not gonna port this to a class sorreeee
        return {a: aArea/wholeArea, b: bArea/wholeArea, c: cArea/wholeArea};
    }

    translate3dCoordinates(printResults = false){
        // Translate 3d Coordinates to 2D relative to the camera, using the
        // same PROJECTION_SCALE/zoomLevel/screen-centering as projectInstance()
        // so triangles land in the same coordinate space as everything else.
        if(this.z1 - camera.z <= NEAR_CLIP || this.z2 - camera.z <= NEAR_CLIP || this.z3 - camera.z <= NEAR_CLIP)
            return false;

        this.u1 = (this.x1 - camera.x) / (this.z1 - camera.z) * PROJECTION_SCALE * zoomLevel + COLUMN_SIZE / 2;
        this.v1 = (this.y1 - camera.y) / (this.z1 - camera.z) * PROJECTION_SCALE * zoomLevel + ROW_SIZE / 2;
        this.u2 = (this.x2 - camera.x) / (this.z2 - camera.z) * PROJECTION_SCALE * zoomLevel + COLUMN_SIZE / 2;
        this.v2 = (this.y2 - camera.y) / (this.z2 - camera.z) * PROJECTION_SCALE * zoomLevel + ROW_SIZE / 2;
        this.u3 = (this.x3 - camera.x) / (this.z3 - camera.z) * PROJECTION_SCALE * zoomLevel + COLUMN_SIZE / 2;
        this.v3 = (this.y3 - camera.y) / (this.z3 - camera.z) * PROJECTION_SCALE * zoomLevel + ROW_SIZE / 2;

        if(printResults){
            console.log(`u1: ${this.u1}, v1: ${this.v1}\nu2: ${this.u2}, v2: ${this.v2}\nu3: ${this.u3}, v3: ${this.v3}`);
        }
        return true;
    }

    draw(color = "#0f380f"){
        // Translate the coordinates.
        let good3dCoordinates = this.translate3dCoordinates();

        if(!good3dCoordinates){
            // Skip drawing this son (Behind camera)
            return;
        }

        this.makeClockwise(); // Do this after translating the vectors

        // Setup the bounding box
        let uMin = Math.floor(Math.min(this.u1, this.u2, this.u3));
        let vMin = Math.floor(Math.min(this.v1, this.v2, this.v3));
        let uMax = Math.ceil(Math.max(this.u1, this.u2, this.u3));
        let vMax = Math.ceil(Math.max(this.v1, this.v2, this.v3));

        // Step 2: Start Itterating over the bounding box
        var barycentricHold = 0;
        for(let u = uMin; u <= uMax; u++){
            for(let v = vMin; v <= vMax; v++){
                barycentricHold = this.getBarycentricCoordinates(u, v);
                // Step 3: For each pixel, determine if it is in bounds with Barycentric Coordiantes
                if(barycentricHold.a < 0 || barycentricHold.b < 0 || barycentricHold.c < 0){
                    // (Skip) Do not draw pixels with a negative barycentric coord.
                }
                else{
                    // all positive, Draw :)
                    // We need to apply the depth as barycentric coordiantes to get a depth value.
                    // colorPixelDepth only draws over what's already there if this is closer.
                    // Depth has to be camera-relative (like projectInstance's depth), not
                    // absolute world z, or this loses every depth test against the track/cat.
                    let newDepth = barycentricHold.a * (this.z1 - camera.z) + barycentricHold.b * (this.z2 - camera.z) + barycentricHold.c * (this.z3 - camera.z);
                    display.colorPixelDepth(u, v, newDepth, color);
                }
            }
        }
    }

    // Translations should happen in the update part of game loop, so should apply to 3d
    scale(scalar){
        this.x1 *= scalar;
        this.y1 *= scalar;
        this.z1 *= scalar;
        this.x2 *= scalar;
        this.y2 *= scalar;
        this.z2 *= scalar;
        this.x3 *= scalar;
        this.y3 *= scalar;
        this.z3 *= scalar;
    }

    vectorScale(scalingVector){
        this.x1 *= scalingVector.x;
        this.y1 *= scalingVector.y;
        this.z1 *= scalingVector.z;
        this.x2 *= scalingVector.x;
        this.y2 *= scalingVector.y;
        this.z2 *= scalingVector.z;
        this.x3 *= scalingVector.x;
        this.y3 *= scalingVector.y;
        this.z3 *= scalingVector.z;
    }

    vectorTranslate(translationVector){
        this.x1 += translationVector.x;
        this.y1 += translationVector.y;
        this.z1 += translationVector.z;
        this.x2 += translationVector.x;
        this.y2 += translationVector.y;
        this.z2 += translationVector.z;
        this.x3 += translationVector.x;
        this.y3 += translationVector.y;
        this.z3 += translationVector.z;
    }

    rotateX(theta){
        // Calculate the weights for all of the rotations in the matrix
        let cos = Math.cos(theta * (Math.PI / 180));
        let sin = Math.sin(theta * (Math.PI / 180));
        // Also set up Y holds bc Y changes during calculation
        let yHold = -999;

        // Operations pre-calculated to app to vector. Apply to all vectors X does not change
        yHold = this.y1
        this.y1 = (this.y1 * cos) + (-1 * sin * this.z1);
        this.z1 = (yHold * sin) + (cos * this.z1);

        yHold = this.y2
        this.y2 = (this.y2 * cos) + (-1 * sin * this.z2);
        this.z2 = (yHold * sin) + (cos * this.z2);

        yHold = this.y3
        this.y3 = (this.y3 * cos) + (-1 * sin * this.z3);
        this.z3 = (yHold * sin) + (cos * this.z3);
    }
    rotateY(theta){
        // Calculate the weights for all of the rotations in the matrix
        let cos = Math.cos(theta * (Math.PI / 180));
        let sin = Math.sin(theta * (Math.PI / 180));
        // Also set up Y holds bc Y changes during calculation
        let xHold = -999;
        let zHold = -999; // One of these can be avoided but I lowk cant be bothered

        // Operations pre-calculated to app to vector. Apply to all vectors X does not change

        // V1
        xHold = this.x1;
        zHold = this.z1;
        this.x1 = (xHold * cos) + (zHold * sin);
        this.y1 = this.y1;
        this.z1 = (xHold * -1 * sin) + (zHold * cos);
        // V2
        xHold = this.x2;
        zHold = this.z2;
        this.x2 = (xHold * cos) + (zHold * sin);
        this.y2 = this.y2;
        this.z2 = (xHold * -1 * sin) + (zHold * cos);
        // V3
        xHold = this.x3;
        zHold = this.z3;
        this.x3 = (xHold * cos) + (zHold * sin);
        this.y3 = this.y3;
        this.z3 = (xHold * -1 * sin) + (zHold * cos);
    }

}

// A shape is any grouping of triangles
class Shape{
    constructor(triangles){
        this.triangles = triangles;
    }

    vectorTranslate(translationVector){
        // Apparently mapping is slower than itterating
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].vectorTranslate(translationVector);
        }
    }

    vectorScale(scalingVector){
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].vectorScale(scalingVector);
        }
    }

    // Theta (Degrees)
    // This is about the origin so it will not work (in a nice way) after any translation
    rotateX(theta){
        // Each Vector in each triangle should have the rotation applied
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].rotateX(theta);
        }
    }
    rotateY(theta){
        // Each Vector in each triangle should have the rotation applied
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].rotateY(theta);
        }
    }

    draw(){
        console.log(`Drawing Shape`);
        for(let i = 0; i < this.triangles.length; i++){
            let randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`; // Found online
            this.triangles[i].draw(randomColor);
        }
    }
}

class TrafficCone{
    // x, y, z = this cone's WORLD position (center of its base, ground height, depth)
    // edgeLength = this cone's scale factor
    constructor(x, y, z, edgeLength = 1){
        // Kept alongside the baked-world triangles below so game logic
        // (collisions, swatting, render culling) has a plain position to read,
        // the same way Obstacle exposed this.x/y/z.
        this.x = x;
        this.y = y;
        this.z = z;
        this.destroyed = false;

        this.triangles = [];
        // Setup the basic coordinates, centered on the origin (base bottom,
        // apex top) so passing a center position here lines it up like Obstacle did.
        let topCoordiante = {x: 0, y: .5, z: 0};
        let v1 = {x: -.5, y: -.5, z: -.5};
        let v2 = {x: -.5, y: -.5, z: .5};
        let v3 = {x: .5, y: -.5, z: .5};
        let v4 = {x: .5, y: -.5, z: -.5};

        // Now add all of these as triangles
        // Bottom (2 triangles for square)
        this.triangles.push(new Triangle(
            v1.x, v1.y, v1.z,
            v2.x, v2.y, v2.z,
            v3.x, v3.y, v3.z,
        ));
        this.triangles.push(new Triangle(
            v3.x, v3.y, v3.z,
            v4.x, v4.y, v4.z,
            v1.x, v1.y, v1.z,
        ));
        // Sides
        this.triangles.push(new Triangle(
            v1.x, v1.y, v1.z,
            topCoordiante.x, topCoordiante.y, topCoordiante.z,
            v2.x, v2.y, v2.z,
        ));
        this.triangles.push(new Triangle(
            v2.x, v2.y, v2.z,
            topCoordiante.x, topCoordiante.y, topCoordiante.z,
            v3.x, v3.y, v3.z,
        ));
        this.triangles.push(new Triangle(
            v3.x, v3.y, v3.z,
            topCoordiante.x, topCoordiante.y, topCoordiante.z,
            v4.x, v4.y, v4.z,
        ));
        this.triangles.push(new Triangle(
            v4.x, v4.y, v4.z,
            topCoordiante.x, topCoordiante.y, topCoordiante.z,
            v1.x, v1.y, v1.z,
        ));

        // Apply the constructor parameters (SCALE THEN TRANSLATE)
        // this.rotateX(90);
        this.vectorScale({x: edgeLength, y: edgeLength, z: edgeLength});
        this.vectorTranslate({x: x, y: y, z: z});
    }

    vectorTranslate(translationVector){
        // Apparently mapping is slower than itterating
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].vectorTranslate(translationVector);
        }
    }

    vectorScale(scalingVector){
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].vectorScale(scalingVector);
        }
    }

    // Theta (Degrees)
    // This is about the origin so it will not work (in a nice way) after any translation
    rotateX(theta){
        // Each Vector in each triangle should have the rotation applied
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].rotateX(theta);
        }
    }
    rotateY(theta){
        // Each Vector in each triangle should have the rotation applied
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].rotateY(theta);
        }
    }

    draw(){
        const colors = [
            "#ff8a00",
            "#ffa030",
            "#ffba67",
            "#ffd4a0",
            "#ffecd4"
        ];
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].draw(colors[i % colors.length]);
        }
    }
}

class CardboardBox{
    // x, y, z = this box's WORLD position (center of the box)
    // edgeLength = this box's scale factor
    constructor(x, y, z, edgeLength = 1){
        // Same plain position/state fields TrafficCone exposes, so game logic
        // (collisions, swatting, render culling) can treat either the same way.
        this.x = x;
        this.y = y;
        this.z = z;
        this.destroyed = false;

        this.triangles = [];
        // A cube, centered on the origin, so passing a center position here
        // lines it up the same way TrafficCone/Obstacle did.
        let v1 = {x: -.5, y: -.5, z: -.5}; // front-bottom-left
        let v2 = {x: .5, y: -.5, z: -.5};  // front-bottom-right
        let v3 = {x: .5, y: .5, z: -.5};   // front-top-right
        let v4 = {x: -.5, y: .5, z: -.5};  // front-top-left
        let v5 = {x: -.5, y: -.5, z: .5};  // back-bottom-left
        let v6 = {x: .5, y: -.5, z: .5};   // back-bottom-right
        let v7 = {x: .5, y: .5, z: .5};    // back-top-right
        let v8 = {x: -.5, y: .5, z: .5};   // back-top-left

        // Each face of the cube = 2 triangles (6 faces * 2 = 12 triangles)
        // Front
        this.triangles.push(new Triangle(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z));
        this.triangles.push(new Triangle(v3.x, v3.y, v3.z, v4.x, v4.y, v4.z, v1.x, v1.y, v1.z));
        // Back
        this.triangles.push(new Triangle(v6.x, v6.y, v6.z, v5.x, v5.y, v5.z, v8.x, v8.y, v8.z));
        this.triangles.push(new Triangle(v8.x, v8.y, v8.z, v7.x, v7.y, v7.z, v6.x, v6.y, v6.z));
        // Left
        this.triangles.push(new Triangle(v5.x, v5.y, v5.z, v1.x, v1.y, v1.z, v4.x, v4.y, v4.z));
        this.triangles.push(new Triangle(v4.x, v4.y, v4.z, v8.x, v8.y, v8.z, v5.x, v5.y, v5.z));
        // Right
        this.triangles.push(new Triangle(v2.x, v2.y, v2.z, v6.x, v6.y, v6.z, v7.x, v7.y, v7.z));
        this.triangles.push(new Triangle(v7.x, v7.y, v7.z, v3.x, v3.y, v3.z, v2.x, v2.y, v2.z));
        // Top
        this.triangles.push(new Triangle(v4.x, v4.y, v4.z, v3.x, v3.y, v3.z, v7.x, v7.y, v7.z));
        this.triangles.push(new Triangle(v7.x, v7.y, v7.z, v8.x, v8.y, v8.z, v4.x, v4.y, v4.z));
        // Bottom
        this.triangles.push(new Triangle(v5.x, v5.y, v5.z, v6.x, v6.y, v6.z, v2.x, v2.y, v2.z));
        this.triangles.push(new Triangle(v2.x, v2.y, v2.z, v1.x, v1.y, v1.z, v5.x, v5.y, v5.z));

        // Apply the constructor parameters (SCALE THEN TRANSLATE)
        this.vectorScale({x: edgeLength, y: edgeLength, z: edgeLength});
        this.vectorTranslate({x: x, y: y, z: z});
    }

    vectorTranslate(translationVector){
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].vectorTranslate(translationVector);
        }
    }

    vectorScale(scalingVector){
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].vectorScale(scalingVector);
        }
    }

    // Theta (Degrees)
    // This is about the origin so it will not work (in a nice way) after any translation
    rotateX(theta){
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].rotateX(theta);
        }
    }
    rotateY(theta){
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].rotateY(theta);
        }
    }

    draw(){
        // Two shades per face (cardboard box brown), same color for both
        // triangles of a face so it reads as one flat panel.
        const colors = [
            "#c8a06a", "#c8a06a", // front
            "#8f6b3f", "#8f6b3f", // back
            "#a97f4f", "#a97f4f", // left
            "#d4b07e", "#d4b07e", // right
            "#e0c397", "#e0c397", // top
            "#7a5a35", "#7a5a35", // bottom
        ];
        for(let i = 0; i < this.triangles.length; i++){
            this.triangles[i].draw(colors[i % colors.length]);
        }
    }
}


const GLYPH_ADVANCE = 4; // 3-wide glyph + 1 pixel gap, at scale 1

function drawChar(char, x, y, scale = 1){
    const glyph = FONT[char];
    if(!glyph) return; // unknown character, just skip it
    for(const seg of glyph){
        makePixelatedLine(
            Math.round(x + seg.x1 * scale), Math.round(y + seg.y1 * scale),
            Math.round(x + seg.x2 * scale), Math.round(y + seg.y2 * scale)
        );
    }
}

function drawText(str, x, y, scale = 1){
    const charWidth = GLYPH_ADVANCE * scale;
    for(let i = 0; i < str.length; i++){
        drawChar(str[i], x + i*charWidth, y, scale);
    }
}

function textWidth(str, scale = 1){
    return str.length * GLYPH_ADVANCE * scale - scale; // no trailing gap after the last char
}

function centeredX(str, scale = 1){
    return Math.round((COLUMN_SIZE - textWidth(str, scale)) / 2);
}

function drawCursor(x, y){
    makePixelatedLine(x, y+4, x+3, y+2);
    makePixelatedLine(x+3, y+2, x, y);
}

function drawRect(x1, y1, x2, y2){
    makePixelatedLine(x1, y1, x2, y1);
    makePixelatedLine(x2, y1, x2, y2);
    makePixelatedLine(x2, y2, x1, y2);
    makePixelatedLine(x1, y2, x1, y1);
}

function makePixelatedLine(x1, y1, x2, y2){
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (Math.abs(dx) >= Math.abs(dy)) {
        // horizontal-dominant (or 45°) — walk over x
        const slope = dx !== 0 ? dy / dx : 0;
        const xStart = Math.min(x1, x2);
        const xEnd = Math.max(x1, x2);

        for (let i = xStart; i <= xEnd; i++) {
            const y = y1 + slope * (i - x1);
            display.colorPixel(i, Math.round(y));
        }
    } else {
        // vertical-dominant — walk over y
        const slope = dy !== 0 ? dx / dy : 0;
        const yStart = Math.min(y1, y2);
        const yEnd = Math.max(y1, y2);
        
        for (let i = yStart; i <= yEnd; i++) {
            const x = x1 + slope * (i - y1);
            display.colorPixel(Math.round(x), i);
        }
    }
}
function drawTriangle(px1, py1, px2, py2, px3, py3){
    // Step 1: Get the bounding Box
    xMin = Math.min(px1, px2, px3);
    yMin = Math.min(py1, py2, py3);
    xMax = Math.max(px1, px2, px3);
    yMax = Math.max(py1, py2, py3);

    // Step 2: Start Itterating over the bounding box
    var barycentricHold = 0;
    const wholeArea = Math.abs(getTriangleArea(px1, py1, px2, py2, px3, py3));
    for(let x = xMin; x < xMax; x++){
        for(let y = yMin; y < yMax; y++){
            console.log(`Checking Triangle Bounding Box (${x}, ${y})`);

            barycentricHold = findBarycentricCoordinates(px1, py1, px2, py2, px3, py3, x, y, wholeArea);
            console.log(barycentricHold);
            // Step 3: For each pixel, determine if it is in bounds with Barycentric Coordiantes
            if(barycentricHold.a < 0 || barycentricHold.b < 0 || barycentricHold.c < 0){
                // (Skip) Do not draw pixels with a negative barycentric coord. 
            }
            else{
                // all positive, Draw
                display.colorPixel(x, y);
            }

        }
    }

}

function fillTriangle(p1,p2,p3,color){
    if(!p1 || !p2 || !p3) return;

    const uMin = Math.max(0, Math.floor(Math.min(p1.u, p2.u, p3.u)));
    const uMax= Math.min(COLUMN_SIZE - 1, Math.ceil(Math.max(p1.u, p2.u, p3.u)));
    const vMin= Math.max(0, Math.floor(Math.min(p1.v, p2.v, p3.v)));
    const vMax= Math.min(ROW_SIZE - 1, Math.ceil(Math.max(p1.v, p2.v, p3.v)));

    const wholeArea = Math.abs(getTriangleArea(p1.u, p1.v, p2.u, p2.v, p3.u, p3.v));

    if (wholeArea === 0) return; // 

    for(let x= uMin; x <= uMax; x++){
        for(let y= vMin; y <= vMax; y++){
            const aArea= getTriangleArea(p2.u, p2.v, x, y, p3.u, p3.v);
            const bArea= getTriangleArea(p1.u, p1.v, p3.u, p3.v, x, y);
            const cArea= getTriangleArea(p1.u, p1.v, x, y, p2.u, p2.v);
            
            const a= aArea/wholeArea, b= bArea/wholeArea, c= cArea/wholeArea;
            // barycentric coordinates are negative if the point is outside the triangle

            if(a < 0 || b < 0 || c < 0) continue; // outside triangle

            const depth= a*p1.depth + b*p2.depth + c*p3.depth;
            display.colorPixelDepth(x, y, depth, color);
        }
    }

}

function drawTriangles(instance){
    const projected = projectInstance(instance);
    for(const tri of instance.triangles){
        const p1 = projected[tri.indices[0]];
        const p2 = projected[tri.indices[1]];
        const p3 = projected[tri.indices[2]];
        fillTriangle(p1, p2, p3, tri.color);
    }
}


// https://jtsorlinis.github.io/rendering-tutorial/#:~:text=Area%20of%20a%20triangle%20(aka%20maths)
// CLOCKWISE ONLY (Way to turn these into clockwise no matter what?)
function getTriangleArea(px1, py1, px2, py2, px3, py3){
    return (((px2-px1)*(py3-py1))-((py2-py1)*(px3-px1))) / 2;
}

function clearDisplay(){
    for(let r = 0; r < ROW_SIZE; r++){
        display.displayMatrix[r] = Array.from({length: COLUMN_SIZE}, () => ({color: BACKGROUND_COLOR, depth: Infinity}));
        display.depthMatrix[r].fill(Infinity);
    }
}

// I want to make this global so that I can access anywhere easily. 
const display = new displayGrid();
const coloredSet = new Set(); // This may be needed for performance idk
const cat = new CatHead(0, 0, 0, CAT_SCALE); // cat defined. 
const catBody = new CatBody(0, 0, 0, CAT_SCALE); // cat body defined.
let gameState = "MENU"; // "MENU" | "CHARACTER_SELECT" | "PLAYING"

const trackSegments = [];
for(let i = 0; i < TRACK_SEGMENT_COUNT; i++){
    const segmentZ = TRACK_START_Z + TRACK_SEGMENT_LENGTH / 2 + i * TRACK_SEGMENT_LENGTH;
    const isLastSegment = i === TRACK_SEGMENT_COUNT - 1;
    trackSegments.push(new TrackSegment(0, 0, segmentZ, TRACK_SEGMENT_SCALE, isLastSegment));
}

const obstacles = [];
for(let i = 0; i < OBSTACLE_COUNT; i++){
    const lane = Math.floor(Math.random() * 3);
    const obstacleZ = TRACK_START_Z + 150 + i * 90 + Math.random() * 40;
    // TrafficCone/CardboardBox are centered on -0.5..0.5 (half-height = 0.5 * scale),
    // so the center needs to sit half a scale above the ground for the base to land on it.
    const obstacleY = GROUND_Y + OBSTACLE_SCALE / 2;
    // Alternate so half the obstacles are cones and half are boxes.
    const obstacle = i % 2 === 0
        ? new TrafficCone(LANE_X[lane], obstacleY, obstacleZ, OBSTACLE_SCALE)
        : new CardboardBox(LANE_X[lane], obstacleY, obstacleZ, OBSTACLE_SCALE);
    obstacle.lane = lane;
    obstacles.push(obstacle);
}

const menuOptions = [
    { label: "START", y: 145 },
    { label: "LEVEL ZERO", y: 130, href: "level0.html" },
    { label: "LEVEL ONE", y: 115, href: "level1.html" },
    { label: "LEVEL TWO", y: 100, href: "level2.html" },
];
let selectedOption = 0;

function handleMenuInput(key){
    if(key === "ArrowUp"){
        selectedOption = (selectedOption - 1 + menuOptions.length) % menuOptions.length;
        console.log(`Selected option: ${selectedOption}`);
    }
    else if(key === "ArrowDown"){
        selectedOption = (selectedOption + 1) % menuOptions.length;
        console.log(`Selected option: ${selectedOption}`);
    }
    else if(key === "Enter"){
        const chosen = menuOptions[selectedOption];
        console.log(`Chose: ${chosen.label}`);
        if(chosen.href){
            window.location.href = chosen.href;
            return;
        }
        if(chosen.label === "START"){
            gameState = "PLAYING";
        }
        else if(chosen.label === "SELECT CAT"){
            gameState = "CHARACTER_SELECT";
        }
        console.log(`gameState is now: ${gameState}`);
    }
}

function handleCharacterSelectInput(key){
    // We'll fill this in next step
    if(key === "Escape"){
        gameState = "MENU";
        console.log("Escaped back to menu");
    }
}

function handleGameInput(key){
    if(key === "Escape"){
        gameState = "MENU";
        console.log("Escaped back to menu");
    }
    else if(key === "="){ 
        zoomLevel += 0.1;
        console.log(`Zoom level: ${zoomLevel.toFixed(2)}`);
    }
    else if(key === "-"){
        zoomLevel = Math.max(0.1, zoomLevel - 0.1); // clamp so it can't hit 0/negative
        console.log(`Zoom level: ${zoomLevel.toFixed(2)}`);
    }
    else if(key === "ArrowLeft"){
    currentLane = Math.max(0, currentLane - 1);
    console.log(`Switching to lane ${currentLane}`);
    }
    else if(key === "ArrowRight"){
        currentLane = Math.min(LANE_X.length - 1, currentLane + 1);
        console.log(`Switching to lane ${currentLane}`);
    }
    else if(key === "p" || key === "P"){
    isPaused = !isPaused;
    console.log(isPaused ? "Paused" : "Resumed");
    } 
    else if(key==" "){
        for(const obstacle of obstacles){
            if(obstacle.destroyed) continue;
            if(obstacle.lane !== currentLane) continue;

            const distance = obstacle.z - camera.z;
            if(distance > 0 && distance < SWAT_RANGE){ // arbitrary "hit" range
                obstacle.destroyed = true;
                console.log(`Swatted an Obstacle at z=${obstacle.z.toFixed(2)} in lane ${obstacle.lane}`);
                break; // only destroy one obstacle per spacebar press
            }
    }  }
}

document.addEventListener("keydown", (e) => {
    if(gameState === "MENU"){
        handleMenuInput(e.key);
    }
    else if(gameState === "CHARACTER_SELECT"){
        handleCharacterSelectInput(e.key);
    }
    else if(gameState === "PLAYING"){
        handleGameInput(e.key);
    }

});

// Game logic should happen here

function checkCollisions(){
    for(const obstacle of obstacles){
        if(obstacle.destroyed) continue;
        if(obstacle.lane !== currentLane) continue;
        
        const distance = obstacle.z - camera.z;
        if(distance <= COLLISION_RANGE && distance >= 0){ 
            console.log(`Collision with obstacle at z=${obstacle.z.toFixed(2)} in lane ${obstacle.lane}`);
            resetGame();
            return; // exit after the collision
        }
 
    }
}

function resetGame(){
    console.log("Resetting game...");
    camera.x = 0;
    camera.y = 0;
    camera.z = 0;
    currentLane = 1; // reset to middle lane
    obstacles.forEach(obstacle => obstacle.destroyed = false);
    console.log("Collided! Resetting Game")
}
function update(){
    if(gameState === "MENU") updateMenu();
    else if(gameState === "CHARACTER_SELECT") updateCharacterSelect();
    else if(gameState === "PLAYING") updateGame();
}

function updateMenu(){}
function updateCharacterSelect(){}
function updateGame(){
    if(isPaused) return; // don't update game state if paused
    const targetX = LANE_X[currentLane];
    camera.x += (targetX - camera.x) * LANE_SWITCH_SPEED;
    camera.z += FORWARD_SPEED;
    bobPhase += BOB_SPEED;
    checkCollisions();
}

function draw(){
    clearDisplay();

    if(gameState === "MENU") drawMenu();
    else if(gameState === "CHARACTER_SELECT") drawCharacterSelect();
    else if(gameState === "PLAYING") drawGame();

    display.render();
}

function drawMenu(){
    // Title banner, drawn bigger than the rest of the menu text
    const TITLE_SCALE = 3;
    const title = "MARKO";
    const titleY = 172;
    const titleX = centeredX(title, TITLE_SCALE);
    drawText(title, titleX, titleY, TITLE_SCALE);
    makePixelatedLine(titleX - 5, titleY - 6, titleX + textWidth(title, TITLE_SCALE) + 5, titleY - 6);

    menuOptions.forEach((option, index) => {
        const optionX = centeredX(option.label);
        drawText(option.label, optionX, option.y);
        if(index === selectedOption){
            drawCursor(optionX - 6, option.y);
        }
    });

    // Controls / instructions: centered, sitting below the menu options
    // (highest y among them wins the "top" spot on screen).
    const controlLines = [
        "ARROWS MOVE",
        "SPACE SWAT",
        "P PAUSE",
        "= ZOOM IN",
        "- ZOOM OUT",
        "ESC MENU",
    ];
    const CONTROLS_TOP_Y = 80;
    const CONTROLS_LINE_PITCH = 11;
    let widestLine = 0;
    controlLines.forEach((line, index) => {
        const y = CONTROLS_TOP_Y - index * CONTROLS_LINE_PITCH;
        drawText(line, centeredX(line), y);
        widestLine = Math.max(widestLine, textWidth(line));
    });
    const panelPad = 5;
    const panelWidth = widestLine + panelPad * 2;
    const panelX1 = Math.round((COLUMN_SIZE - panelWidth) / 2);
    const panelY1 = CONTROLS_TOP_Y - (controlLines.length - 1) * CONTROLS_LINE_PITCH - panelPad;
    const panelY2 = CONTROLS_TOP_Y + 4 + panelPad;
    drawRect(panelX1, panelY1, panelX1 + panelWidth, panelY2);

    // Margo's face flanking both sides of the menu
    const FACE_SCALE = 1.5;
    cat.scale = FACE_SCALE;
    cat.z = 60;
    cat.y = -12;
    cat.x = -140; // left side
    cat.draw();
    cat.x = 140; // right side
    cat.draw();
}
function drawCharacterSelect(){}

function drawGame(){

    trackSegments.forEach(segment => {
        const distance= segment.z-camera.z;
        const segmentBackZ = segment.z + TRACK_SEGMENT_LENGTH / 2;
        if(distance > MAX_RENDER_DISTANCE) return;  // too far ahead — not worth drawing yet
        if(segmentBackZ < camera.z) return;          // fully behind you now — nothing left to show
        segment.draw();
    });

    obstacles.forEach(obstacle => {
        if(obstacle.destroyed) return;
        const distance = obstacle.z - camera.z;
        const obstacleBackZ = obstacle.z + OBSTACLE_LOCAL_HALF_DEPTH * OBSTACLE_SCALE;
        if(distance > MAX_RENDER_DISTANCE) return;  // too far ahead
        if(obstacleBackZ < camera.z) return;         // fully passed
        obstacle.draw();
    });

    cat.x = camera.x;
    cat.y = GROUND_Y + CAT_SCALE + CAT_Y_OFFSET; // slightly above the ground to avoid z-fighting with the track
    cat.z = camera.z + CAT_FORWARD_OFFSET;
    //cat.draw();

    const bobOffset = Math.sin(bobPhase) * BOB_AMPLITUDE;
    catBody.x = camera.x;
    catBody.y = GROUND_Y + CAT_SCALE + CAT_Y_OFFSET + bobOffset;
    catBody.z = camera.z + CAT_FORWARD_OFFSET;
    catBody.draw();
}

// I got this off github which is apparently the best way to run a game
function gameLoop(){
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function main(){
   
    gameLoop();

    //display.colorPixel(10, 10);
    //makePixelatedLine(0, 0, 319, 199);
    //drawTriangle(50, 50, 100, 100, 150, 50);
}

main();