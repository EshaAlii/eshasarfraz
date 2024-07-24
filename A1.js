// Grab the canvas from HTML doc
const canvas = document.getElementById('canvas');

// Get the WebGL context from the canvas
const gl = canvas.getContext('webgl');

// If we don't have a GL context
if (!gl) {

    // WebGL is not supported
    alert('WebGL not supported');
}

// Define the vertices for the triangle
// Define the vertices for the star
// Define the vertices for the hexagon
const vertices = new Float32Array([
    // Center point
    0.0, 0.0, 0.0,
    
    // Top-right point
    0.4, 0.25, 0.0,
    
    // Right point
    0.4, -0.25, 0.0,
    
    // Bottom-right point
    0.0, -0.5, 0.0,
    
    // Bottom-left point
    -0.4, -0.25, 0.0,
    
    // Top-left point
    -0.4, 0.25, 0.0,
    
    // Top point
    0.0, 0.5, 0.0,

    // Repeat the top-right point to close the shape
    0.4, 0.25, 0.0,
]);

// Create a buffer and put the vertices in it
const buffer = gl.createBuffer(); //  Create a new buffer object
gl.bindBuffer(gl.ARRAY_BUFFER, buffer); // Bind the buffer object to the target (ARRAY_BUFFER)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); // Pass the vertex data (vertices) to the buffer object

// Define the vertex shader
const vsSource = `
    attribute vec3 a_position; // Declare an attribute character for the vertex position 
    uniform float uTimeVert; // Define a uniform variable for the time

    // Main function of the vertex shader
    void main(){

        // Define a 3x3 rotation matrix around the Y-axis
        mat3 matrixY;

        // column order
        matrixY[0] = vec3(cos(uTimeVert), 0.0, sin(uTimeVert)); // first column
        matrixY[1] = vec3(0.0, 1.0, 0.0); // second column
        matrixY[2] = vec3(-sin(uTimeVert), 0.0, cos(uTimeVert)); // third column

        // Define a translation vector that changes over time
        vec3 translation = vec3(0.5*sin(uTimeVert), 0.5*cos(uTimeVert), 0);

        //vec3 transformedP = a_position;

        // Apply rotation matrix + translation to the vertex position
        vec3 transformedP = matrixY * a_position + translation;

        // Set the final position of the vertex
        gl_Position = vec4(transformedP, 1.0);
    }
`;

// Define the fragment shader
// gl_FragCoord.x and gl_FragCoord.y give the pixel coordinates
// gl_FragCoord.z is the depth value, and gl_FragCoord.w is 1.0/w where w is the clip-space w-coordinate
const fsSource = `
    
    // Set the percision for the float variable 
    precision mediump float; 

    // Declare a uniform variable for the time
    uniform float uTimeFrag; 

    // Declare a uniform variable for the screen resolution
    uniform vec2 screenSize;

    // Main function of the fragment shader
    void main() {

        // Normalize the pixel x and y coordinates
        float pixelCordX = gl_FragCoord.x/screenSize.x;
        float pixelCordY = gl_FragCoord.y/screenSize.y;

        // Create a vector for the normalized pixel coordinates 
        vec2 cord = vec2(pixelCordX, pixelCordY);

        // Calculate the red color component based on time
        float colorR = abs(sin(uTimeFrag * 2.0));

        // Calculate the green and blue color components based on the transformed x and y coordinates respectively
        float colorG = abs(sin(uTimeFrag  + 2.0));
        float colorB = abs(sin(uTimeFrag + 4.0));

        // Set the final color of the fragment
        gl_FragColor = vec4(colorR, colorG, colorB, 1.0); 
    }
`;

// Create and compile the vertex shader

// Create a shader object of type VERTEX SHADER
const vertexShader = gl.createShader(gl.VERTEX_SHADER);

// Attach the shader source code (vsSource) to the shader object
gl.shaderSource(vertexShader, vsSource);

// Compile the shader source code into binary code
gl.compileShader(vertexShader);

// If the shader compilation failed...
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){

    // Record the error message
    const errorMsg = gl.getShaderInfoLog(vertexShader);

    // Log the error message to the console
    console.error("Shader compilation failed: " + errorMsg);
}

// Create and compile the fragment shader

// Create a shader object of type FRAGMENT SHADER
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

// Attach the shader source (fsSource) to the shader object
gl.shaderSource(fragmentShader, fsSource);

// Compile the shader source code into binary code
gl.compileShader(fragmentShader);

// If the shader compilation failed...
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {

    // Record the error message
    const errorMsg = gl.getShaderInfoLog(fragmentShader);

    // Log the error message to the console
    console.error("Shader compilation failed: " + errorMsg);
}

// Create the shader program
const program = gl.createProgram(); // Create a new program object 
gl.attachShader(program, vertexShader); // Attach the vertex shader to the program
gl.attachShader(program, fragmentShader); // Attach the fragment shader to the program
gl.linkProgram(program); // Link the shaders to a complete program

// Use the program
gl.useProgram(program);

// Get the location of the attribute
const positionLocation = gl.getAttribLocation(program, "a_position"); // Get location of attribute variable a_position
const uTimeVLocation = gl.getUniformLocation(program, "uTimeVert"); // Get location of uniform variable uTimeVert
const uTimeFLocation = gl.getUniformLocation(program, "uTimeFrag"); // Get location of uniform variable uTimeFrag 
const screenSizeLocation = gl.getUniformLocation(program, "screenSize"); // Get location of uniform variable screenSize

// Assuming 'canvas' is your WebGL canvas
const screenWidth = canvas.width; // Get canvas width
const screenHeight = canvas.height; // Get canvas height

// Enable the attribute array for a_position
gl.enableVertexAttribArray(positionLocation);

// Tell the attribute how to get data out of the buffer
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0); // Define how to pull the vertex data from the buffer (3 components per vertex)

// Function to update time uniform
function render(){
    const currentTime = performance.now() * 0.001; // current time in seconds

    // Set the time uniform
    gl.uniform1f(uTimeVLocation, currentTime); // Update vertex shader time
    gl.uniform1f(uTimeFLocation, currentTime); // Update fragment shader time
    gl.uniform2f(screenSizeLocation, screenWidth, screenHeight); // Set screen size

    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set the color to black
    gl.clear(gl.COLOR_BUFFER_BIT); // Clear the canvas

    // Draw the triangles + vertices
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length/3); // Use triangle fan instead of triangles to draw triangles from the center point to each pair of adjacent outer points.

    // Loop the render function to animate + request the next frame
    requestAnimationFrame(render);
}

// Start the rendering loop
render();