import type {Command,World} from '../engine/core';
import type {Lesson} from './data';
export interface Maze {seed:number;columns:number;rows:number;cellSize:number;world:World;path:{x:number;y:number}[];solution:Command[]}
export function generateMaze(seed:number,columns=7,rows=5):Maze{
 if(!Number.isInteger(columns)||!Number.isInteger(rows)||columns<2||columns>7||rows<2||rows>5)throw Error('Invalid maze size.');
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 const size=72,ox=(600-columns*size)/2,oy=(440-rows*size)/2;
 const cells=Array.from({length:columns*rows},()=>({walls:[true,true,true,true],seen:false}));
 const directions=[[0,-1],[1,0],[0,1],[-1,0]];
 const startIndex=0,startHeading=0;
 const stack=[startIndex];cells[startIndex].seen=true;
 while(stack.length){const current=stack.at(-1)!,x=current%columns,y=Math.floor(current/columns);const neighbors=directions.map(([dx,dy],dir)=>({x:x+dx,y:y+dy,dir})).filter(n=>n.x>=0&&n.x<columns&&n.y>=0&&n.y<rows&&!cells[n.y*columns+n.x].seen);if(!neighbors.length){stack.pop();continue}const next=neighbors[Math.floor(random()*neighbors.length)],index=next.y*columns+next.x;cells[current].walls[next.dir]=false;cells[index].walls[(next.dir+2)%4]=false;cells[index].seen=true;stack.push(index)}
 const obstacles:World['obstacles']=[];const thickness=6;
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const walls=cells[y*columns+x].walls,px=ox+x*size,py=oy+y*size;if(walls[0])obstacles.push({x:px-thickness/2,y:py-thickness/2,w:size+thickness,h:thickness});if(walls[3])obstacles.push({x:px-thickness/2,y:py-thickness/2,w:thickness,h:size+thickness});if(x===columns-1&&walls[1])obstacles.push({x:px+size-thickness/2,y:py-thickness/2,w:thickness,h:size+thickness});if(y===rows-1&&walls[2])obstacles.push({x:px-thickness/2,y:py+size-thickness/2,w:size+thickness,h:thickness})}
 const previous=new Map<number,number>([[startIndex,-1]]),distances=new Map<number,number>([[startIndex,0]]),queue=[startIndex];while(queue.length){const current=queue.shift()!;for(let dir=0;dir<4;dir++){if(cells[current].walls[dir])continue;const [dx,dy]=directions[dir],next=current+dx+dy*columns;if(!previous.has(next)){previous.set(next,current);distances.set(next,distances.get(current)!+1);queue.push(next)}}}
 const goalIndex=columns*rows-1;
 const indices:number[]=[];for(let cursor=goalIndex;cursor!==-1;cursor=previous.get(cursor)!)indices.unshift(cursor);
 const path=indices.map(index=>({x:ox+(index%columns+.5)*size,y:oy+(Math.floor(index/columns)+.5)*size}));
 const solution:Command[]=[];let heading=startHeading;for(let i=1;i<path.length;i++){const angle=(Math.atan2(path[i].y-path[i-1].y,path[i].x-path[i-1].x)*180/Math.PI+360)%360;const turn=((angle-heading+540)%360)-180;if(turn)solution.push({type:'turn',value:turn});solution.push({type:'move',value:size});heading=angle}solution.push({type:'brake'},{type:'halt'});
 return {seed:seed>>>0,columns,rows,cellSize:size,world:{start:{...path[0],heading:startHeading},goal:path.at(-1)!,obstacles},path,solution};
}
export function practiceLesson(maze:Maze):Lesson{return {id:5,title:'Free Practice',subtitle:'A new maze. Your own algorithm.',description:'Navigate a randomly generated maze from the blue robot to the green goal. Every maze has a valid route.',duration:'Your pace',tag:'Open exploration',color:'green',objectives:['Plan a route through a connected maze.','Experiment with continuous movement, sensors, and stopping.'],steps:['Each corridor section is 72 units. Start by inspecting the maze.','Use turns and distances, or combine continuous movement with sensor conditions.','Reach the green goal without hitting a wall. Generate another maze to try again.'],concepts:['Navigation','Sensors','Continuous movement'],thinking:['Problem Solving','Evaluation'],stem:'Robotics · Path planning',reflection:'How would your algorithm change for another maze?',hint:'Continuous forward starts the motor and continues through wait and condition blocks. Stop movement brakes the robot; stop program ends execution. Turns and distance moves take over motor control. Use 72-unit movements between cell centers.',world:maze.world,starter:[{type:'speed',value:80},{type:'drive'},{type:'until',condition:{op:'LT',a:{op:'sensor'},b:30},body:[{type:'wait',value:0.05}]},{type:'brake'}],required:[],solution:maze.solution}}
export function readMazeSeed():number{try{const saved=localStorage.getItem('smartcar-maze-seed');if(saved!==null&&/^\d+$/.test(saved))return Number(saved)>>>0}catch{}return Date.now()>>>0}
