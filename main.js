 // Import A_star algorithm
import { A_star } from './utils/A_star.js';
    
// Error handling for module loading
// Initialize app flag
window.appInitialized = false;

try {
   
    // Canvas setup
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    
    // Grid configuration
    const CELL_SIZE = 32;
    let grid = [];
    let startPoint = null;
    let endPoint = null;
    let isDrawingWalls = false;
    let isSettingStart = false;
    let isSettingEnd = false;
    let animationFrameId = null;
    
    // Initialize grid and canvas
    function init() {
        // Ensure canvas exists
        if (!canvas) {
            throw new Error("Canvas element not found");
        }
        
        // Set canvas dimensions
        canvas.width = Math.max(window.innerWidth - 40, 800);
        canvas.height = Math.max(window.innerHeight - 40, 600);
        
        // Create grid structure
        const rows = Math.floor(canvas.height / CELL_SIZE);
        const cols = Math.floor(canvas.width / CELL_SIZE);
        
        grid = Array(cols).fill(null).map((_, x) => 
            Array(rows).fill(null).map((_, y) => ({
                x, y, f: 0, obstacle: false
            }))
        );
        
        drawGrid();
        setupEventListeners();
    }
    
    // Draw the grid and path
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw cells
        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[0].length; y++) {
                const cell = grid[x][y];
                if (!cell) continue;
                
                // Draw walls
                if (cell.obstacle) {
                    ctx.fillStyle = "#333";
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
                
                // Draw start point
                if (startPoint && x === startPoint.x && y === startPoint.y) {
                    ctx.fillStyle = "#2ecc71";
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
                
                // Draw end point
                if (endPoint && x === endPoint.x && y === endPoint.y) {
                    ctx.fillStyle = "#e74c3c";
                    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                }
            }
        }
        
        // Draw grid lines
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= canvas.width; x += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += CELL_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // Visualize path step by step
    function visualizePath(path, index = 0) {
        if (index >= path.length) return;
        
        const point = path[index];
        ctx.fillStyle = "rgba(52, 152, 219, 0.5)";
        ctx.fillRect(point.x * CELL_SIZE, point.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        // Draw grid lines over the cell
        ctx.strokeStyle = "#ccc";
        ctx.strokeRect(point.x * CELL_SIZE, point.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        animationFrameId = requestAnimationFrame(() => {
            visualizePath(path, index + 1);
        });
    }
    
    // Calculate and draw path
    function calculateAndDrawPath() {
        if (!startPoint || !endPoint) return;
        
        // Cancel any ongoing visualization
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        try {
            const path = A_star(startPoint, endPoint, grid);
            
            if (path) {
                drawGrid(); // Redraw grid to clear previous path
                visualizePath(path);
                document.getElementById('status').textContent = "Path found!";
            } else {
                document.getElementById('status').textContent = "No path found!";
                console.log("No path found!");
            }
        } catch (error) {
            console.error("Pathfinding error:", error);
            document.getElementById('status').textContent = "Error in pathfinding";
        }
    }
    
    // Get cell coordinates from mouse position
    function getCellCoordinates(x, y) {
        return {
            x: Math.floor(x / CELL_SIZE),
            y: Math.floor(y / CELL_SIZE)
        };
    }
    
    // Event listeners
    function setupEventListeners() {
        // Set start point
        document.getElementById("setStart").addEventListener("click", () => {
            isSettingStart = true;
            isSettingEnd = false;
            isDrawingWalls = false;
            document.getElementById('status').textContent = "Click on grid to set start point";
        });
        
        // Set end point
        document.getElementById("setEnd").addEventListener("click", () => {
            isSettingEnd = true;
            isSettingStart = false;
            isDrawingWalls = false;
            document.getElementById('status').textContent = "Click on grid to set end point";
        });
        
        // Toggle wall drawing
        document.getElementById("drawWalls").addEventListener("click", () => {
            isDrawingWalls = true;
            isSettingStart = false;
            isSettingEnd = false;
            document.getElementById('status').textContent = "Click and drag to draw walls";
        });
        
        // Clear walls
        document.getElementById("clearWalls").addEventListener("click", () => {
            for (let x = 0; x < grid.length; x++) {
                for (let y = 0; y < grid[0].length; y++) {
                    if (grid[x][y]) {
                        grid[x][y].obstacle = false;
                    }
                }
            }
            drawGrid();
            calculateAndDrawPath();
            document.getElementById('status').textContent = "Walls cleared";
        });
        
        // Canvas mouse events
        canvas.addEventListener("mousedown", (e) => {
            const rect = canvas.getBoundingClientRect();
            const { x, y } = getCellCoordinates(e.clientX - rect.left, e.clientY - rect.top);
            
            if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length) return;
            
            if (isSettingStart) {
                startPoint = grid[x][y];
                isSettingStart = false;
                document.getElementById('status').textContent = "Start point set";
            } else if (isSettingEnd) {
                endPoint = grid[x][y];
                isSettingEnd = false;
                document.getElementById('status').textContent = "End point set";
            } else if (isDrawingWalls) {
                if (grid[x][y]) {
                    grid[x][y].obstacle = !grid[x][y].obstacle;
                }
            }
            
            drawGrid();
            calculateAndDrawPath();
        });
        
        canvas.addEventListener("mousemove", (e) => {
            if (!isDrawingWalls) return;
            
            const rect = canvas.getBoundingClientRect();
            const { x, y } = getCellCoordinates(e.clientX - rect.left, e.clientY - rect.top);
            
            if (x < 0 || y < 0 || x >= grid.length || y >= grid[0].length) return;
            if (!grid[x][y]) return;
            
            if (e.buttons === 1) { // Only if left mouse button is pressed
                grid[x][y].obstacle = true;
                drawGrid();
                calculateAndDrawPath();
            }
        });
        
        window.addEventListener("resize", () => {
            init();
            document.getElementById('status').textContent = "Window resized - grid reset";
        });
    }
    
    // Initialize the application
    init();
    window.appInitialized = true;

} catch (error) {
    console.error("Application initialization failed:", error);
    document.getElementById('status').textContent = `Error: ${error.message}`;
    document.getElementById('status').style.backgroundColor = '#ffebee';
    document.getElementById('status').style.color = '#c62828';
    
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
}