var gl;
var recursion_depth = 10;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Generate points.
    var corners = [vec2(-1,-1), vec2(1,-1), vec2(0,1)];
    var vertices = sierpinski_triangle(corners, recursion_depth);

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function sierpinski_triangle(corners, depth) {
    // No subdivision for depth of 0 - return the received points.
    if (depth == 0) {
	return corners;
    }
    // Divide the triangle into 4 triangles and recurse for each.
    var vertices = []
    var mid01 = mix(corners[0], corners[1], .5);
    var mid02 = mix(corners[0], corners[2], .5);
    var mid12 = mix(corners[1], corners[2], .5);
    var triangle = [corners[0], mid01, mid02];
    depth -= 1;
    vertices = vertices.concat(sierpinski_triangle(triangle, depth));
    triangle = [corners[2], mid02, mid12];
    vertices = vertices.concat(sierpinski_triangle(triangle, depth));
    triangle = [corners[1], mid01, mid12];
    vertices = vertices.concat(sierpinski_triangle(triangle, depth));
    return vertices;
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, Math.pow(3, recursion_depth+1) );
}

