import {describe,it,expect} from 'vitest';
import * as Blockly from 'blockly';
import {universalMazeProgram} from './universal';
import {generateMaze,practiceLesson} from './maze';
import {compile,loadStarter} from '../blocks/config';
import {VirtualRobotAdapter} from '../engine/core';
import {ProgramRunner} from '../engine/runner';
import {assess} from '../engine/assessment';
describe('Universal maze wall follower',()=>{
it('uses exactly the same actual Blockly program for 1000 different maze seeds',()=>{const w=new Blockly.Workspace();loadStarter(w,universalMazeProgram());const program=compile(w);expect(program).toEqual(universalMazeProgram());for(let seed=0;seed<1000;seed++){const maze=generateMaze(seed),robot=new VirtualRobotAdapter(maze.world),runner=new ProgramRunner(robot,program);let frames=0;while(!runner.step(.05)&&frames++<2401){}expect(runner.done,`seed ${seed}`).toBe(true);expect(robot.atGoal(),`seed ${seed}`).toBe(true);expect(robot.state.collision,`seed ${seed}`).toBe(false);expect(assess(practiceLesson(maze),robot,program).success,`seed ${seed}`).toBe(true)}w.dispose()},15000);
it('sensor offsets are relative to the current heading without rotating the robot',()=>{const maze=generateMaze(70),robot=new VirtualRobotAdapter(maze.world);const before=robot.state.heading,right=robot.sense(90);expect(robot.state.heading).toBe(before);robot.turn(90);expect(robot.sense()).toBe(right)});
it('can be serialized and reloaded without maze-specific coordinates',()=>{const text=JSON.stringify(universalMazeProgram());expect(text).not.toContain('seed');expect(text).not.toContain('path');expect(text).not.toContain('obstacles');expect(text).toContain('sensor_right');expect(text).toContain('goal')});
});
