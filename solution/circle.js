var gl;
var number_of_subdivisions = 4;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // --- Generate points.
    // Generate first square.
    var vertices = [];
    var left_corner = vec2(-1,0);
    vertices.push(left_corner);
    var radius = 1 / (number_of_subdivisions+1);
    var center = add(left_corner, vec2(radius, 0));
    vertices.push(add(center, vec2(0,radius)));
    vertices.push(add(center, vec2(radius,0)));
    vertices.push(add(center, vec2(0,-radius)));
    // Generate subsequent squares.
    var old_square = vertices;
    for (var i = 0; i < number_of_subdivisions; i++) {
	var new_square = subdivide_square(old_square);
	vertices = vertices.concat(new_square);
	old_square = new_square;
    }
    
    // --- Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // --- Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // --- Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,flatten(vertices), gl.STATIC_DRAW );
    
    // --- Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function subdivide_square(square) {
    /* The subdivided square is the old square translated and with edge
       midpoints added.
    */
    //  Compute infomration of translaton and of the new circle.
    var r = 1 / (number_of_subdivisions+1);  // radius
    var t = vec2(2*r, 0);  // translation
    var C = add(square[square.length/2], vec2(r,0));  // center
    // Add translated points and edge midpoints from square to new_square.
    var new_square = [];
    var i;
    for (i = 0; i < square.length; i++) {
	// P and Q are translated adjancent vertices from square. X is their
	// midpoint.
	var P = add(square[i], t);
	var j = (i+1)%square.length
	var Q = add(square[j], t);
	var X = mix(P, Q, 0.5);
	new_square.push(P);
	// The projected point is at the end of \vec{CX} at length r.
	// Method: https://math.stackexchange.com/a/175906/146558
	var CX = subtract(X, C);  // unit vector.
	X = add(C,scale(r,normalize(CX)));
	new_square.push(X);
    }
    return new_square;
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    var start_index = 0;
    var num_points = 4;
    for (var i = 0; i <= number_of_subdivisions; i++) {
	gl.drawArrays( gl.LINE_LOOP, start_index, num_points );
	start_index += num_points;
	num_points *= 2;
    }
}
