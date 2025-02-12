const MAZE_SIZE = 25;
let maze = [];
let targetPos = {x: 1, y: 1};
let exitPos = {x: MAZE_SIZE-2, y: MAZE_SIZE-2};
let showSolution = false;

function generateNewMaze() {
    maze = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(1));
    carvePath(1, 1);
    exitPos = findFarthestPoint(1, 1);
    targetPos = {x: 1, y: 1};
    showSolution = false;
    renderMaze();
    document.getElementById('victory').style.display = 'none';
}

function carvePath(x, y) {
    const directions = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random() - 0.5);
    maze[y][x] = 0;

    for(let [dx, dy] of directions) {
        const nx = x + dx*2;
        const ny = y + dy*2;
        if(nx > 0 && nx < MAZE_SIZE-1 && ny > 0 && ny < MAZE_SIZE-1 && maze[ny][nx] === 1) {
            maze[y + dy][x + dx] = 0;
            carvePath(nx, ny);
        }
    }
}

function findFarthestPoint(startX, startY) {
    let visited = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(false));
    let queue = [[startX, startY, 0]];
    let maxDist = 0;
    let farthest = {x: startX, y: startY};

    while(queue.length > 0) {
        const [x, y, dist] = queue.shift();
        
        if(dist > maxDist) {
            maxDist = dist;
            farthest = {x, y};
        }

        for(let [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if(nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && 
               maze[ny][nx] === 0 && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([nx, ny, dist + 1]);
            }
        }
    }
    return farthest;
}

function toggleSolution() {
    showSolution = !showSolution;
    renderMaze();
}

function findSolutionPath() {
    let visited = Array(MAZE_SIZE).fill().map(() => Array(MAZE_SIZE).fill(false));
    let queue = [[targetPos.x, targetPos.y, []]];
    
    while(queue.length > 0) {
        const [x, y, path] = queue.shift();
        
        if(x === exitPos.x && y === exitPos.y) {
            return path.concat([[x, y]]);
        }

        for(let [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if(nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && 
               !visited[ny][nx] && maze[ny][nx] === 0) {
                visited[ny][nx] = true;
                queue.push([nx, ny, [...path, [x, y]]]);
            }
        }
    }
    return [];
}

function renderMaze() {
    const grid = document.getElementById('grid');
    grid.style.gridTemplateColumns = `repeat(${MAZE_SIZE}, 1fr)`;
    grid.innerHTML = '';
    
    const solutionPath = findSolutionPath();
    let hintCells = [];
    
    if(showSolution && solutionPath.length > 0) {
        const currentIndex = solutionPath.findIndex(([x,y]) => 
            x === targetPos.x && y === targetPos.y
        );
        
        if(currentIndex !== -1) {
            hintCells = solutionPath
                .slice(currentIndex + 1, currentIndex + 5)
                .filter(Boolean);
        }
    }

    for(let y = 0; y < MAZE_SIZE; y++) {
        for(let x = 0; x < MAZE_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if(maze[y][x] === 1) {
                cell.classList.add('wall');
            } else {
                const isHint = hintCells.some(([hx, hy]) => hx === x && hy === y);
                if(isHint) cell.classList.add('hint');
                if(x === exitPos.x && y === exitPos.y) cell.classList.add('exit');
                if(x === targetPos.x && y === targetPos.y) cell.classList.add('target');
            }
            
            grid.appendChild(cell);
        }
    }
}

function move(dx, dy) {
    const newX = targetPos.x + dx;
    const newY = targetPos.y + dy;
    
    if(newX >= 0 && newX < MAZE_SIZE && 
       newY >= 0 && newY < MAZE_SIZE &&
       maze[newY][newX] === 0) {
        targetPos = {x: newX, y: newY};
        renderMaze();
        if(targetPos.x === exitPos.x && targetPos.y === exitPos.y) {
            document.getElementById('victory').style.display = 'flex';
        }
    }
}

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', e => {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    
    if(Math.abs(dx) > 15 || Math.abs(dy) > 15) {
        const direction = Math.abs(dx) > Math.abs(dy) 
            ? (dx > 0 ? 1 : -1)
            : (dy > 0 ? 1 : -1);
        
        Math.abs(dx) > Math.abs(dy) ? move(direction, 0) : move(0, direction);
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
}, {passive: false});

document.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp': move(0, -1); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
    }
});

generateNewMaze();