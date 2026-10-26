import {describe,it,expect} from 'vitest';
import {VirtualRobotAdapter,type Command} from './core';
import {ProgramRunner} from './runner';
const world={start:{x:100,y:200,heading:0},goal:{x:500,y:200},obstacles:[]};
function finish(runner:ProgramRunner){let frames=0;while(!runner.step(.05)&&frames++<10000){}return frames}
describe('Animated program runner and motor blocks',()=>{
it('continues moving during waits then brakes',()=>{const r=new VirtualRobotAdapter(world),runner=new ProgramRunner(r,[{type:'drive'},{type:'wait',value:1},{type:'brake'},{type:'wait',value:1}]);finish(runner);expect(r.state.x).toBeGreaterThan(190);expect(r.state.x).toBeLessThan(230);expect(runner.done).toBe(true)});
it('brake stops the motor but allows following commands',()=>{const r=new VirtualRobotAdapter(world),runner=new ProgramRunner(r,[{type:'drive'},{type:'brake'},{type:'turn',value:90},{type:'move',value:50}]);finish(runner);expect(r.state.y).toBeCloseTo(250);expect(r.state.x).toBeLessThan(110)});
it('stop program exits a nested forever and never executes later blocks',()=>{const r=new VirtualRobotAdapter(world),runner=new ProgramRunner(r,[{type:'forever',body:[{type:'halt'},{type:'move',value:100}]}]);finish(runner);expect(r.state.x).toBe(100);expect(runner.done).toBe(true)});
it('reads changing sensor values while the motor is running',()=>{const r=new VirtualRobotAdapter({...world,obstacles:[{x:300,y:150,w:20,h:100}]}),program:Command[]=[{type:'drive'},{type:'until',condition:{op:'LT',a:{op:'sensor'},b:40},body:[{type:'wait',value:.05}]},{type:'brake'}];const runner=new ProgramRunner(r,program);finish(runner);expect(r.state.x).toBeGreaterThan(240);expect(r.state.x).toBeLessThan(280);expect(r.state.collision).toBe(false)});
it('explicit stop interrupts continuous movement immediately',()=>{const r=new VirtualRobotAdapter(world),runner=new ProgramRunner(r,[{type:'drive'}]);runner.step(.05);runner.stop();const x=r.state.x;runner.step(.05);expect(r.state.x).toBe(x)});
it('automatically stops at the practice goal even with a running motor',()=>{const r=new VirtualRobotAdapter(world),runner=new ProgramRunner(r,[{type:'drive'}],true);finish(runner);expect(r.atGoal()).toBe(true);expect(r.state.x).toBeLessThan(510)});
it('preserves collision protection during continuous movement',()=>{const r=new VirtualRobotAdapter(world),runner=new ProgramRunner(r,[{type:'drive'}]);expect(()=>finish(runner)).toThrow('Collision');expect(r.state.collision).toBe(true)});
it('enforces a time limit for long running programs',()=>{const r=new VirtualRobotAdapter(world),runner=new ProgramRunner(r,[{type:'repeat',value:1000,body:[{type:'wait',value:1}]}]);expect(()=>finish(runner)).toThrow('Time limit')});
});
