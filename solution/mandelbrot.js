
var gl;  // WebGL context.
var width, height;  // canvas dimensions.
var N = 100;  // Maximum escape time.

function check_escape(complex, n) {
    /* Return whether complex escapes till n. */
    var term = vec2(0,0);  // z_0
    for (var i = 1; i <= n; i++) {
	// Compute z_n. If its magnitude is greater than 2, complex escapes at n.
	term = vec2(term[0]*term[0] - term[1]*term[1], 2*term[0]*term[1]);
	term = add(term, complex);
	if (dot(term, term) > 4) {  // Sqaure magnitude.
	    return [true, i];
	}
    }
    return [false, -1];  // Did not escape.
}

function get_color(n) {
    /* Assign color to an escape time - Red to Green for small values,
     * i.e. early/old escapes; and Green to Blue for larger values, i.e. recent
     * escapes.
     */
    var threshold = N/4;  // N/2 for default, N/4 for modified.
    if (n < threshold) {  // early/old escapes.
	return map_point(0, threshold, vec3(1,0,0), vec3(0,1,0), n);
    }
    else {  // recent escapes.
	return map_point(threshold, N, vec3(0,1,0), vec3(0,0,1), n);
    }
}

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

    // Compute points and colors.
    var vertices = [];
    var colors = [];
    [width, height] = [canvas.width, canvas.height];
    // Get clip coordinates for each pixel value.
    var xval = {}
    for (var col = 0; col < width; col++) {
	xval[col] = map_point(0, width, -1, 1, col);
    }
    var yval = {}
    for (var row = 0; row < height; row++) {
	yval[row] = map_point(0, height, -1, 1, row);
    }
    // Store clip coordinate for each pixel, compute the correspodning complex
    // number and its escape time, and store the corresponding color.
    var vertex, complex;
    for (var col = 0; col < width; col++) {
	for (var row = 0; row < height; row++) {
	    vertex = vec2(xval[col], yval[row]);
	    vertices.push(vertex);
	    complex = scale(2, vertex);
	    [escapes, iter] = check_escape(complex, N);
	    if (escapes) {
	    	colors.push(get_color(iter));
	    }
	    else {
	    	colors.push(vec3(0,0,0));
	    }
	}
    }
    
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


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, width*height );
}

