
// WebGL
var gl;

// Constant dimension values
var circleRadius =  0.08;
const MAX_CANVAS = 1.0;
const MIN_CANVAS = -1.0;
const MID = 0.0;
var RIVER_WIDTH_MAX = 0.5;
var RIVER_WIDTH_MIN = 0.1;

// Colors
const TRANSPARENCY = vec4(0, 0, 0, 0);
const HOUSE_COLOR = vec4(237,125,49, 255);
const ROOF_COLOR = vec4(197,90,17, 255);
const SMALL_ROOF_COLOR = vec4(0,0,0,255);
const TREE_RED_COLOR_D = vec4(255, 0, 0, 255);
const TREE_GREEN_COLOR_L = vec4(84,130,53, 255);
const RIVER_COLOR = vec4(1, 130, 135, 255);
const WAVE_COLOR = vec4(20,190,151, 255);
const ROCK_COLOR = vec4(165,165,165, 255);


// Global variables
var riverWidth =  Math.random() * (+RIVER_WIDTH_MAX - +RIVER_WIDTH_MIN) + +RIVER_WIDTH_MIN ;
var rightSideMax =  (MID - (riverWidth / 2) - circleRadius);
var rightSideMin = (MIN_CANVAS + circleRadius);
var leftSideMax = (MAX_CANVAS - circleRadius) ;
var leftSideMin = (MID + (riverWidth / 2) + circleRadius) ;
var yMax = MAX_CANVAS - circleRadius ;
var yMin = MIN_CANVAS + circleRadius ;
var selectAppleAngle = 0;
var drawnCirclesX=[]; // all circles that are drawn
var drawnCirclesY=[]; // all circles that are drawn
var drawnCirclesX2=[]; // all circles that are drawn
var drawnCirclesY2=[]; // all circles that are drawn
var entityNumber= 20;  // Number of all entities default to 20
var numberOfApples = 5; // number of apples.

// Init function, draw empty place
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) alert("WebGL isn't available");
    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    // Configure WebGL
    gl.viewport(0, (- canvas.width + canvas.height) / 2, canvas.width, canvas.width);
    gl.clearColor(0.541, 0.737, 0.357, 1.0);
    gl.enable(gl.BLEND);
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    generateListener(program);
    render(program);
};

// render function to generate our shapes on canvas

function render(program) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawRiver(program);
   for(var i = 0; i < entityNumber - 1; i++) {
        drawPlaces(program);
    }

}

function generateListener(program){
    var numInput = document.getElementById("EntityNumber");
    var radiusInput = document.getElementById("RadiusInput");
    var generate = document.getElementById("Generate");

    generate.addEventListener("click", function (event) {
        entityNumber = parseInt(numInput.value );
        circleRadius = parseFloat(radiusInput.value );
        render(program);
    });

}

/**
 * Function to draw river.
 * Random river width is generated above. Then it takes that value, places the river in the middle of canvas.
 * draws it as a rectangle with giving left top point and right bottom points since we want a regular rectangle.
 * Also generates wave effect on river.
 * */
function drawRiver(program) {
    /** Coordinates of river
     * Left side =  x = mid - river width/2   y = top = 1  and x same y bottom
     * Right side =  x = mid + river width/2   y = top = 1  and x same y bottom
     * River width = randomly generated between river width max and min from constant
     * **/
    var riverX1 = MID - riverWidth/2;
    var riverY1 = MAX_CANVAS;
    var riverX2 = riverX1 + riverWidth;
    var riverY2 = MIN_CANVAS ;
    var leftTop ;
    var rightBottom;
    drawRectangle(program, vec2(riverX1, riverY1), vec2(riverX2 , riverY2), RIVER_COLOR);

    // River stripes
    for(var i = 1; i < 50 ; i++) {
        if( (i%3) === 0 ){
            leftTop = vec2(MID - (2*(riverWidth/10)), MAX_CANVAS - (((2*i)-1)*0.02) );
            rightBottom = vec2(MID - riverWidth/10 , (MAX_CANVAS- (2*i*0.02)));
        }
        else if (i%3 === 1 ) {
            leftTop = vec2(MID - riverWidth/20 , MAX_CANVAS - (((2*i)-1)*0.02));
            rightBottom = vec2(MID + riverWidth/20 , (MAX_CANVAS- (2*i*0.02)));}
        else {
            leftTop = vec2(MID + riverWidth/10, MAX_CANVAS - (((2*i)-1)*0.02) );
            rightBottom = vec2(MID +  (2*(riverWidth/10)) , (MAX_CANVAS- (2*i*0.02)));
        }

        drawRectangle(program, leftTop, rightBottom, WAVE_COLOR);
    }
}


/**
 * Draws map of village. First generates right part
 * then generates left part.
 *
 * */
function drawPlaces(program) {

    var circleX, circleY, circleX2, circleY2;
    var checker;
    var selectPlaceType;
    // right places
    do {
        selectPlaceType = Math.round(Math.random() * (+3 - +1) + +1);
        circleX = Math.random() * (+rightSideMax - +rightSideMin) + +rightSideMin;
        circleY = Math.random() * (+yMax - +yMin) + +yMin;
        checker = checkOverlap(drawnCirclesX,drawnCirclesY,circleX,circleY);
    }while(!checker);
    if( selectPlaceType === 1 ){ // draw house
        var coordinates1 = selectHouseCoordinates( circleX , circleY , circleRadius );
        drawHouse( program,  coordinates1 );
    }
    else if( selectPlaceType === 2 )  // draw tree
    {
        drawTree(program,circleX,circleY,circleRadius);
    }
    else if( selectPlaceType === 3){
        // draw rock
        var coordinates2 = selectRockCoordinates( circleX , circleY , circleRadius );
        drawRock(program, coordinates2 );
    }
    //left places
    do {
        selectPlaceType = Math.round(Math.random() * (+3 - +1) + +1);
        circleX2 = Math.random() * (+leftSideMax - +leftSideMin) + +leftSideMin;
        circleY2 = Math.random() * (+yMax- +yMin) + +yMin;
        checker = checkOverlap(drawnCirclesX2, drawnCirclesY2, circleX2, circleY2,selectPlaceType);
    }while(!checker);

   if( selectPlaceType === 1 ){ // draw house
        var coordinates3 = selectHouseCoordinates( circleX2 , circleY2 , circleRadius );
        drawHouse( program, coordinates3 );
    }
    else if( selectPlaceType === 2 )  // draw tree
    {
        drawTree(program,circleX2,circleY2,circleRadius);
    }
    else if( selectPlaceType === 3){ // draw rock
        var coordinates4 = selectRockCoordinates( circleX2 , circleY2 , circleRadius );
        drawRock(program, coordinates4 );
    }
}
/****
* Check overlap simply checks if our selected points close to each other
* or their distance is long enough to draw them.
* */
function checkOverlap ( circleArrayX , circleArrayY , x , y ,placeType)
{
    var control  = false;
    var flag = true;
        if(circleArrayX.length >= 0 ){
            for(var n = 0 ; n <= circleArrayX.length-1 ; n++ ){
                var otherX =  circleArrayX[n] ;
                var otherY = circleArrayY[n];
                var distance = dist(otherX, otherY , x, y);
                if( distance <=  (2*circleRadius) ){
                    flag = false;
                    break;
                }
            }
            if(flag)
            {
                control = true;
                circleArrayY.push(y);
                circleArrayX.push(x);
            }
        }
        else
        {
            control = true;
            circleArrayY.push(y);
            circleArrayX.push(x);
        }
    return control ;
}

/**
 Poison point select function
 selects point according to poison distribution
 written by using tutorial https://www.youtube.com/watch?v=flQgnCUxHlw

 Not finished.
 */
var r = circleRadius ;
var k = 30;
var gridRight = [];
var gridLeft = [];
var activeRight = [];
var activeLeft = [];
var w = r / Math.sqrt(2);

function poisonPointSelect()
{
    //set up
    var widthRight = (Math.abs(rightSideMin) - Math.abs(rightSideMax) )*100 ; // since it is negative
    var height = (yMax - yMin)*100 ;
    var widthLeft = (Math.abs(leftSideMax) -  Math.abs(leftSideMin))*100 ;

    var colsRight = Math.floor(widthRight/w);
    var colsLeft = Math.floor(widthLeft/w )  ;
    var rows = Math.floor(height/r) ;

    //step0
    for(var i = 0 ; i < colsRight*rows ; i++ )
    {
        gridRight[i]=-1;
    }

    for(var i = 0 ; i < colsLeft*rows ; i++ )
    {
        gridLeft[i]=-1;
    }

    //step1

    var x1 = Math.random()* Math.random() * (+rightSideMax - +rightSideMin) + +rightSideMin ;
    var x2 = Math.random()* (+leftSideMax - +leftSideMin) + +leftSideMin;
    var y1 = Math.random()* (+yMax - +yMin) + +yMin;
    var y2 = Math.random()* (+yMax - +yMin) + +yMin;
    var i1 = Math.floor((x1*100)/w ) ;
    var i2 = Math.floor((x2*100)/w ) ;
    var j1 = Math.floor((y1*100)/w ) ;
    var j2 = Math.floor((y2*100)/w );

    gridRight[i1 + (j1*colsRight)] = {x1,y1};
    gridLeft[i2 + (j2*colsRight)]  = {x2,y2};
    activeLeft.push({x2,y2}) ;
    activeRight.push({x1,y1}) ;

}

/**
 * Draw a tree function. Also calls generate apples function. Number of apples can change.
 * */
function drawTree(program, circleX , circleY ,  radius )
{
   // numberOfApples = document.getElementById("AppleNumber");
    var circleProperty  = vec2(  circleX , circleY );
    drawCircle(program, circleProperty , radius , TREE_GREEN_COLOR_L);
    generateApples(program, circleX,circleY, radius , numberOfApples );
}

/**
 * Draws red apples.
 * */
function generateApples(program, circleX,circleY, radius, numberOfApples){

    for(var i = 0 ; i < numberOfApples ; i++)
    {
        var appleCoordinates = selectAppleCoordinate(circleX,circleY,radius);
        var vector = vec2(appleCoordinates.appleX,appleCoordinates.appleY);
        drawCircle(program, vector , appleCoordinates.appleRadius1 , TREE_RED_COLOR_D );
    }
}

function selectAppleCoordinate(x,y,radius){
    var appleX, appleY;
    var appleRadius1 = radius/ 2 ;
        selectAppleAngle = +90 * (Math.random() * (+3 - +0) + +0);
        appleX = x + (appleRadius1 * Math.cos(selectAppleAngle * Math.PI / 180));
        appleY = y + (appleRadius1 * Math.sin(selectAppleAngle * Math.PI / 180));

    appleRadius1 = appleRadius1/4;
    return { appleX ,appleY, appleRadius1};

}

function drawHouse(program, coordinates)
{
    drawRotatedRectangle(program, coordinates, HOUSE_COLOR);
    generateRoof(program, coordinates, ROOF_COLOR, SMALL_ROOF_COLOR) ;
}

function drawRock(program, coordinates){
    drawRotatedRectangle(program, coordinates, ROCK_COLOR);
}

/**
* Rotates a point around a point with given angle
* cx, cy   is the point we want to rotate
* x , y is our center point
* angle is also given to this function
taken from :  https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
 * */
function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) - (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) + (sin * (x - cx)) + cy;
    return [nx, ny];
}

/**
* Wants to select house coordinates
* Takes center point generated, selects a
* point on it then rotates is with 90 degree to generate
* coordinates, returns coordinates
* */
function selectHouseCoordinates(x,y,radius)
{
    var houseCoordinates = [];

    var angle = 90;
    var angleFirst =  45*( Math.random() * (+2 - +0) + +0 ) ;
    var xValueOnCircle = x + (radius * Math.cos(angleFirst * Math.PI / 180));
    var yValueOnCircle = y + (radius * Math.sin(angleFirst * Math.PI / 180));
    houseCoordinates.push(xValueOnCircle);
    houseCoordinates.push(yValueOnCircle);

    // select 2nd point
    var newArray = rotate(x,y,xValueOnCircle,yValueOnCircle,angle);
    var newX = newArray[0];
    var newY = newArray[1];
    houseCoordinates.push(newX);
    houseCoordinates.push(newY);

    // select 3rd point
    newArray = rotate(x,y,newX,newY,angle);
    newX = newArray[0];
    newY = newArray[1];
    houseCoordinates.push(newX);
    houseCoordinates.push(newY);

    // select 4th point

    newArray = rotate(x,y,newX,newY,angle);
    newX = newArray[0];
    newY = newArray[1];
    houseCoordinates.push(newX);
    houseCoordinates.push(newY);
    return houseCoordinates;
}

/**
* Function to generate roof, takes house coordinates,
* to generate darker half, finds mid point of two verticies and then generates
* darker half of roof.
* To generate chimmney, it takes quarter points of darker half then generates
* black chimney
* */
function generateRoof(program, coordinates, roof_color, smaller_roof_color){
    var roofRectangle =[];

    //x,y 1
    var coordx1 = coordinates[0] ;
    var coordy1 = coordinates[1] ;

    //x,y 2
    var coordx2 = coordinates[2] ;
    var coordy2 = coordinates[3] ;

    //x,y 3
    var coordx3 = coordinates[4] ;
    var coordy3 = coordinates[5] ;

    //x,y 4
    var coordx4 = coordinates[6] ;
    var coordy4 = coordinates[7] ;

    var roofX1, roofX2, roofY1, roofY2;

    if (coordx1 > coordx2)
        roofX1 = coordx1 - (Math.abs( Math.abs(coordx1) - Math.abs(coordx2) ) / 2 );
    else
        roofX1 = coordx2 - (Math.abs( Math.abs(coordx1) - Math.abs(coordx2) ) / 2 );

    if(coordy1 > coordy2)
        roofY1 = coordy1 - (Math.abs( Math.abs(coordy1) - Math.abs(coordy2) ) / 2 );
    else
        roofY1 = coordy2 - (Math.abs( Math.abs(coordy1) - Math.abs(coordy2) ) / 2 );

    if (coordx4 > coordx3)
        roofX2 = coordx4 - (Math.abs( Math.abs(coordx4) - Math.abs(coordx3) ) / 2 );
    else
        roofX2 = coordx3 - (Math.abs( Math.abs(coordx4) - Math.abs(coordx3) ) / 2 );

    if(coordy4 > coordy3)
        roofY2 = coordy4 - (Math.abs( Math.abs(coordy4) - Math.abs(coordy3) ) / 2 );
    else
        roofY2 = coordy3 - (Math.abs( Math.abs(coordy4) - Math.abs(coordy3) ) / 2 );

    roofRectangle.push(roofX1);
    roofRectangle.push(roofY1);

    roofRectangle.push(roofX2);
    roofRectangle.push(roofY2);

    roofRectangle.push(coordx4);
    roofRectangle.push(coordy4);

    roofRectangle.push(coordx1);
    roofRectangle.push(coordy1);

    drawRotatedRectangle(program, roofRectangle, roof_color ) ;

    var chimmneyRectangle = [];

    var chimX1, chimX2, chimY1, chimY2;

    if ( Math.abs(coordx1 ) > Math.abs(coordx4 ) )
        chimX1 = coordx1 - (Math.abs( Math.abs(coordx1) - Math.abs(coordx4) ) / 4);
    else
        chimX1 = coordx4 - (Math.abs( Math.abs(coordx1) - Math.abs(coordx4) ) / 4 );

    if( Math.abs(coordy1)  > Math.abs(coordy4)  )
        chimY1 = coordy1 - (Math.abs( Math.abs(coordy1) - Math.abs(coordy4) ) / 4 );
    else
        chimY1 = coordy4 - (Math.abs( Math.abs(coordy1) - Math.abs(coordy4) ) / 4 );

    if (Math.abs(coordx4) > Math.abs(roofX2))
        chimX2 = coordx4 - (Math.abs( Math.abs(coordx4) - Math.abs(roofX2) ) / 4 );
    else
        chimX2 = roofX2 - (Math.abs( Math.abs(coordx4) - Math.abs(roofX2) ) / 4 );

    if(Math.abs(coordy4) > Math.abs(roofY2))
        chimY2 = coordy4 - (Math.abs( Math.abs(coordy4) - Math.abs(roofY2) ) / 4 );
    else
        chimY2 = roofY2 - (Math.abs( Math.abs(coordy4) - Math.abs(roofY2) ) / 4 );


    chimmneyRectangle.push(chimX1);
    chimmneyRectangle.push(chimY1);

    chimmneyRectangle.push(chimX2);
    chimmneyRectangle.push(chimY2);

    chimmneyRectangle.push(coordx4);
    chimmneyRectangle.push(coordy4);

    chimmneyRectangle.push(coordx1);
    chimmneyRectangle.push(coordy1);


  //  drawRotatedRectangle(program, chimmneyRectangle, smaller_roof_color) ;


}

/**
* Function to generate rock's coordinates,
*
* same as house coordinates, takes center point and radius.
*
* Selects a random point on circle then rotates it around the center with a random
* angle generated in function. Therefore, we get a non same version rocks.
*
* */
function selectRockCoordinates(x,y,radius)
{
    var rockCoordinates = [];
    var angle1 = 55;
    var angleFirst1 = 15*( Math.random() * (+4 - +0) + +0 ) ;
    var xValueOnCircle1 = x + (radius * Math.cos(angleFirst1 * Math.PI / 180));
    var yValueOnCircle1 = y + (radius * Math.sin(angleFirst1 * Math.PI / 180));
    rockCoordinates.push(xValueOnCircle1);
    rockCoordinates.push(yValueOnCircle1);

    // select 2nd point
    var newArray1 = rotate(x,y,xValueOnCircle1,yValueOnCircle1,angle1);
    var newX1 = newArray1[0];
    var newY1 = newArray1[1];

    rockCoordinates.push(newX1);
    rockCoordinates.push(newY1);

    // select 3rd point

    newArray1 = rotate(x,y,newX1,newY1,angle1);
    newX1 = newArray1[0];
    newY1 = newArray1[1];
    rockCoordinates.push(newX1);
    rockCoordinates.push(newY1);

    // select 4th point

    newArray1 = rotate(x,y,newX1,newY1,angle1);
    newX1 = newArray1[0];
    newY1 = newArray1[1];
    rockCoordinates.push(newX1);
    rockCoordinates.push(newY1);

    console.log(rockCoordinates);
    return rockCoordinates;
}

/**
 Generic circle draw function
 */
function drawCircle(program, center, radius, color1) {
    var polyCount = 32;
    var vertices = [];
    var colors = [];
    var i;

    vertices.push(vec2(center[0], center[1]));
    for(i = 0; i < polyCount + 1; i++) {
        var x = radius * Math.cos(i * 2 * Math.PI / polyCount) + center[0];
        var y = radius * Math.sin(i * 2 * Math.PI / polyCount) + center[1];
        vertices.push(vec2(x, y));
    }

    colors.push(vec4(color1));
    for(i = 0; i < polyCount + 1; i++) {
        colors.push(vec4(color1));
    }

    processBuffers(program, colors, vertices);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, polyCount + 2);
}

/**
 Generic rectangle draw function - proper rectangle
 */
function drawRectangle(program, pos1, pos2, color) {
    // Vertices of rectangle
    var vertices = [
        vec2(pos1[0], pos2[1]),
        vec2(pos1[0], pos1[1]),
        vec2(pos2[0], pos1[1]),
        vec2(pos2[0], pos2[1] )
    ];
    // Color of rectangle
    var colors = [ color,  color,  color, color ];

    processBuffers(program, colors, vertices);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

/**
 Same generic rectangle draw function with given all points as rotated.
 */
function drawRotatedRectangle(program, rectanglePoints, color) {
    // Vertices of rectangle
    var vertices = [
        vec2(rectanglePoints[0], rectanglePoints[1]),
        vec2(rectanglePoints[2], rectanglePoints[3]),
        vec2(rectanglePoints[4], rectanglePoints[5]),
        vec2(rectanglePoints[6], rectanglePoints[7])
    ];
    // Color of rectangle
    var colors = [ color,  color,  color, color ];

    processBuffers(program, colors, vertices);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
/**
 Color and Vertex buffers */
function processBuffers(program, colors, vertices) {
    // Load the color data into the GPU
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // Associate out vertex color variables with our color buffer
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Load the vertex data into the GPU
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

/***
 Function to calculate distance between two points
 */
function dist(x1,y1,x2,y2){

    var dx = Math.abs(Math.abs(x1) - Math.abs(x2));
    var dy = Math.abs(Math.abs(y1) - Math.abs(y2));

    var result = Math.sqrt( ((dx*dx) + (dy*dy)) ) ;
    return result;

}

