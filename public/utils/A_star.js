import { PriorityQueue } from './heap.js';

function heuristic(goal, current) {
  return Math.abs(goal.x - current.x) + Math.abs(goal.y - current.y); // Manhattan distance
}

function identical_point(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}

function hash(p) {
  return `${p.x},${p.y}`;
}

function reconstruct_path(came_from, end, start) {
  const path = [];
  let current = end;

  while (!identical_point(current, start)) {
    path.push(current);
    const parent = came_from.get(hash(current));
    if (!parent) break; // fail-safe
    current = parent;
  }

  path.push(start);
  return path.reverse();
}

export function A_star(start, goal, grid) {
  const open_list = new PriorityQueue();
  const came_from = new Map();
  const g_score = new Map();

  const start_hash = hash(start);
  g_score.set(start_hash, 0);
  start.f = heuristic(goal, start);
  open_list.enqueue(start, start.f);

  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [-1, -1], [-1, 1], [1, -1], 
  ];

  while (!open_list.isEmpty()) {
    const current = open_list.dequeue();
    if (!current) break;

    if (identical_point(current, goal)) {
      return reconstruct_path(came_from, current, start);
    }

    for (const [dx, dy] of directions) {
      const nx = current.x + dx;
      const ny = current.y + dy;

      // Check bounds
      if (nx < 0 || ny < 0 || nx >= grid.length || ny >= grid[0].length) continue;
      if (grid[nx][ny]?.obstacle) {
        continue;
      }
      const neighbor = grid[nx][ny];
      if (!neighbor) continue; // null = obstacle
      const current_g = g_score.get(hash(current));
      if (current_g === undefined) continue; // skip if invalid

      const tentative_g = current_g + 1;
      
      const neighbor_hash = hash(neighbor);
      const neighbor_g = g_score.get(neighbor_hash);

      if (neighbor_g === undefined || tentative_g < neighbor_g) {
        came_from.set(neighbor_hash, current);
        g_score.set(neighbor_hash, tentative_g);
        neighbor.f = tentative_g + heuristic(goal, neighbor);
        open_list.enqueue(neighbor, neighbor.f);
      }
    }
  }
 
  return null; // No path found
}