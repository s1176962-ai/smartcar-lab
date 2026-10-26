import {Interpreter,type Action,type Command,type RobotAdapter} from './core';
/** Frame-rate-independent execution with persistent motor commands. */
export class ProgramRunner{
 readonly engine:Interpreter;private iterator:Generator<Action>;private action?:Action;private remaining=0;private motor=false;private exhausted=false;elapsed=0;done=false;
 constructor(readonly robot:RobotAdapter,program:Command[],readonly autoGoal=false){this.engine=new Interpreter(robot);this.iterator=this.engine.run(program)}
 stop(){this.engine.stop();this.motor=false;this.done=true}
 step(dt:number):boolean{if(this.done)return true;if(!Number.isFinite(dt)||dt<0)throw Error('Invalid frame duration.');dt=Math.min(dt,.05);this.elapsed+=dt;if(this.elapsed>120){this.stop();throw Error('Time limit reached. Simplify your program or stop the motor.')}if(this.autoGoal&&this.robot.atGoal()){this.stop();return true}
 if(!this.action&&!this.exhausted){const next=this.iterator.next();if(next.done){this.exhausted=true}else{const a=next.value;if(a.type==='drive'){this.motor=true}else if(a.type==='brake'){this.motor=false}else if(a.type==='halt'){this.stop();return true}else if(a.type==='speed'){this.robot.state.speed=a.value}else{this.action=a;this.remaining=Math.abs(a.value);if(a.type==='move'||a.type==='turn')this.motor=false}}}
 if(this.motor)this.robot.move(this.robot.state.speed*dt);
 if(this.action){const a=this.action;const rate=a.type==='wait'?1:a.type==='turn'?140:this.robot.state.speed;const delta=Math.min(this.remaining,rate*dt);if(a.type==='move')this.robot.move(delta*Math.sign(a.value));if(a.type==='turn')this.robot.turn(delta*Math.sign(a.value));this.remaining-=delta;if(this.remaining<.00001)this.action=undefined}
 if(this.autoGoal&&this.robot.atGoal()){this.stop();return true}if(this.exhausted&&!this.motor&&!this.action){this.done=true;return true}return false;
 }
}
