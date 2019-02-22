
var gl;  // WebGL context.
var CANVAS_WIDTH;  // canvas width.
var height = 0.5;  // height of each bar, from 0 to 1.

window.onload = function init()
{
    // Set up WebGL.
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Compute geometry and attributes.
    var vertices = [];
    var colors = [];
    CANVAS_WIDTH = canvas.width;
    var vtx, clr;
    [vtx, clr] = get_graybars()
    vertices = vertices.concat(vtx);
    colors = colors.concat(clr);
    [vtx, clr] = get_colorbars()
    vertices = vertices.concat(vtx);
    colors = colors.concat(clr);
    
    // Load coordinates into the GPU
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER,flatten(vertices), gl.STATIC_DRAW );
    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Load colors into the GPU
    gl.bindBuffer( gl.ARRAY_BUFFER, gl.createBuffer() );
    gl.bufferData( gl.ARRAY_BUFFER,flatten(colors), gl.STATIC_DRAW );
    // Associate our shader variables with our data buffer
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    render();
};

function get_graybars() {
    /* Compute gray bars - compute bar enpoints and assign the same gray to each
     * enpoint of a bar.
     */
    // Clip coordinate limits.
    var left = vec2(-1, 0);
    var right = vec2(1, 0);
    // Color limits.
    var white = vec3(1,1,1);
    var black = vec3(0,0,0);
    // Translation vector between bar endpoints.
    var t = vec2(0, height);
    // Get clip coordinates of pixels along the width of the canvas, compute the
    // corresponding gray and bar endpoint, and assign the same gray to the
    // endpoints of each bar.
    var vertices = [], grays = [];
    var pt, gray;
    for (var i = 0; i < CANVAS_WIDTH; i++) {
	pt = map_point(0, CANVAS_WIDTH, left, right, i);
	vertices = vertices.concat([pt, add(pt, t)])
	gray = map_point(0, CANVAS_WIDTH, black, white, i);
	grays = grays.concat([gray, gray]);
    }
    return [vertices, grays];
}

function get_colorbars() {
    /* Compute gray bars - compute bar enpoints and assign the same gray to each
     * enpoint of a bar.
     */
    // Clip coordinate limits.
    var left = vec2(-1, 0);
    var right = vec2(1, 0);
    // Color limits.
    var red = vec3(1,0,0);
    var green = vec3(0,1,0);
    var blue = vec3(0,0,1);
    // Translation vector between bar endpoints.
    var t = vec2(0, -height);
    // Get clip coordinates of pixels along the width of the canvas, compute the
    // corresponding color and bar endpoint, and assign the same color to the
    // endpoints of each bar.
    var vertices = [], colors = [];
    var pt, color;
    var threshold = CANVAS_WIDTH / 2;
    for (var i = 0; i < CANVAS_WIDTH; i++) {
	pt = map_point(0, CANVAS_WIDTH, left, right, i);
	vertices = vertices.concat([pt, add(pt, t)]);
	if (i < threshold) {
	    color = map_point(0, threshold, red, green, i);
	}
	else {
	    color = map_point(threshold, CANVAS_WIDTH, green, blue, i);
	}
	colors = colors.concat([color, color]);
    }
    return [vertices, colors];
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINES, 0, 4*CANVAS_WIDTH );
}

