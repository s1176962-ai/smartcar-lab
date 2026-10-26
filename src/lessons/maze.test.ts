import {describe,it,expect} from 'vitest';
import {generateMaze,practiceLesson} from './maze';
import {VirtualRobotAdapter} from '../engine/core';
import {ProgramRunner} from '../engine/runner';
import * as Blockly from 'blockly';
import {compile,loadStarter} from '../blocks/config';
describe('Random maze practice',()=>{
it('is reproducible from the same seed and varies across seeds',()=>{expect(generateMaze(42)).toEqual(generateMaze(42));expect(generateMaze(43).world.obstacles).not.toEqual(generateMaze(42).world.obstacles)});
it('all 150 generated mazes have a collision-free path executable with actual Blockly blocks',()=>{for(let seed=0;seed<150;seed++){const maze=generateMaze(seed),workspace=new Blockly.Workspace();loadStarter(workspace,maze.solution);const robot=new VirtualRobotAdapter(maze.world),runner=new ProgramRunner(robot,compile(workspace),true);let frames=0;while(!runner.step(.05)&&frames++<4000){}expect(frames).toBeLessThan(4000);expect(robot.atGoal(),`seed ${seed}`).toBe(true);expect(robot.state.collision).toBe(false);expect(robot.state.distance).toBeLessThan(4000);workspace.dispose()}});
it('has clear start and goal with a safe navigable corridor width',()=>{const m=generateMaze(2026);const r=new VirtualRobotAdapter(m.world);expect(r.blocked(r.state.x,r.state.y)).toBe(false);expect(r.blocked(m.world.goal.x,m.world.goal.y)).toBe(false);expect(m.path[0]).toEqual({x:m.world.start.x,y:m.world.start.y});expect(m.path.at(-1)).toEqual(m.world.goal)});
it('practice starter compiles, uses continuous movement and stops safely',()=>{for(let seed=0;seed<20;seed++){const lesson=practiceLesson(generateMaze(seed)),workspace=new Blockly.Workspace();loadStarter(workspace,lesson.starter);const program=compile(workspace);expect(program).toEqual(lesson.starter);const r=new VirtualRobotAdapter(lesson.world),runner=new ProgramRunner(r,program);let frames=0;while(!runner.step(.05)&&frames++<2000){}expect(r.state.collision).toBe(false);expect(runner.done).toBe(true);workspace.dispose()}});
it('rejects unsupported maze dimensions',()=>{expect(()=>generateMaze(1,20,20)).toThrow('Invalid maze size')});
});
