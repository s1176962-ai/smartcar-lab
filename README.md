# SmartCar Lab

An interactive robotics learning application for secondary school students, built with React, TypeScript, Vite, Google Blockly and Canvas 2D. Runs locally without a server backend, cloud account or physical robot.

## Run locally

Install Node.js 20.19+ or 22.12+, then in this directory:

```sh
npm install
npm run dev
```

Open the local address printed by Vite (normally http://localhost:5173).

```sh
npm test
npm run build
```

pnpm is also supported: `pnpm install`, `pnpm dev`, `pnpm test`, `pnpm build`.

## Learning workflow

1. Open a lesson from the dashboard. All four lessons are available immediately.
2. Use **Your mission** to expand the complete instructions above the editor. Objectives, steps, completion criteria and hints remain in normal page flow with no clipped overlay. Close it to reclaim space.
3. Drag blocks from the Blockly categories and connect a single command stack. Number fields are editable. Use **Focus on code** for a full-width programming canvas.
4. Run, pause/resume, stop, or reset the robot. Programs execute one action at a time and sensors read the current simulated world.
5. Read the feedback and checklist. On success, use **Learn & reflect** to save a reflection.
6. Change **EN / 中文** in the top bar at any time. The dashboard, instructions, Blockly categories/blocks, simulation labels and feedback switch language. Changing language stops an active experiment while preserving the program. User-entered reflections are never translated.

The workspace auto-saves per lesson in LocalStorage. Save explicitly with the disk button. Export and load Blockly JSON with the download/upload buttons. Restoring starter blocks replaces that lesson's current program. Completed lessons, attempts, reflections and language preference are saved on the same browser and origin. Changing host/port or clearing browser storage changes the saved-data namespace. Storage failures are reported; export is the portable backup.

## Courses

- **Make the Robot Move:** sequencing and decomposition.
- **Draw a Square:** repetition, equal sides and right angles. The actual trail is checked geometrically, independently of whether a loop was used.
- **Obstacle Avoidance:** sensors and if/else decisions.
- **Autonomous Challenge:** combine loops, sensors, conditions and debugging.

The mission panel includes precise goal coordinates/tolerances and optional complete guided examples. Loading an example preserves a recoverable copy of your current workspace until you leave that lesson. Program structure is checked live; default comparison, if/else, repeat and repeat-until blocks include editable value/condition inputs. Control bodies are empty basic blocks, ready for the learner to add actions.

Starter programs are learning scaffolds; learners edit them to solve challenges. Lesson 2 includes a runnable square example to demonstrate loops. Hints offer routes, but assessment does not compare against a fixed program.

## Coordinates and execution

The world is 600 × 440 units with x increasing rightwards and y downwards. Heading 0° faces right; positive turns are clockwise. Each grid square is 40 units. The car has a conservative 13-unit collision radius; sensing raycasts forward up to 180 units. Movement advances in ≤1-unit increments to prevent tunneling. The displayed sensor fan is illustrative; the distance measurement is the center ray.

Limits: 10,000 interpreter steps, 1,000 iterations per loop, repeat counts 0–1,000, waits 0–30 seconds, movement/angle magnitude ≤10,000 and speed 10–300 units/s. Imported programs must be smaller than 1 MB. The interpreter never uses `eval` or `Function`.

## Architecture

- `src/App.tsx`: dashboard, learning workspace, runtime controls and persistence coordination.
- `src/components/BlockEditor.tsx`: Blockly lifecycle, JSON persistence, resize and locale handling.
- `src/blocks/config.ts`: custom robotics blocks, toolbox and Blockly → structured IR translation.
- `src/engine/core.ts`: UI-independent interpreter, typed IR and virtual robot adapter contract/implementation.
- `src/engine/assessment.ts`: geometric path evaluation, safety and required-concept assessment.
- `src/components/Simulator.tsx`: requestAnimationFrame Canvas rendering.
- `src/lessons/data.ts`: four lessons, worlds, objectives, activities, hints and reflection prompts.
- `src/i18n.tsx`: shared language state, bilingual presentation and message translations.
- `src/styles.css`: responsive dashboard and editor-first workspace layouts.

Blockly JSON save/load follows the [official serialization API](https://docs.blockly.com/guides/configure/serialization/). Blockly is Scratch-inspired here; this is not the official Scratch editor. Fonts use an optional Google Fonts stylesheet; system fonts work offline. No runtime network service is required by the robot, editor, courses or saved progress.

## Future hardware integration

`RobotAdapter` isolates robot state, movement, turning, sensing, reset and goal detection; `VirtualRobotAdapter` is the current implementation. `PhysicalRobotAdapter` reserves connection, disconnection and emergency-stop operations. No hardware communication is implemented.

A physical integration must add a device-specific asynchronous command queue, capability negotiation, unit calibration, sensor timestamps, acknowledgement/timeouts and a hardware emergency stop. Each mBot or micro:bit kit needs its own protocol adapter; do not assume shared transport or command syntax. The lesson data, Blockly-to-IR compiler and assessment concepts can remain, while the scheduler awaits device commands instead of animation frames. Physical localization and collision reporting need device-specific support.

## Validation

Automated tests cover forward/backward motion, rotations, nested loops, live sensor conditions, variable arithmetic, repeat-until, collision/boundary detection, geometric goals, program stopping, invalid input, execution budgets, reset, square validation, concept requirements and valid obstacle-course routes. Translation tests cover both languages and dynamic feedback. TypeScript checking runs as part of the production build.

Current scope: a 2D simulator with center-ray sensing, simple numeric variables and a rectangular static world. There is no hardware connection, authentication or cloud synchronization. Touch devices can view the responsive lessons; desktop pointer input is recommended for Blockly editing.

### Repairing incomplete blocks

New control/logic/math blocks include editable default inputs. The lightbulb toolbar button **Fill missing inputs / 补齐缺失输入** also repairs empty value/condition sockets in older saved programs without replacing connected blocks. Review the inserted values before running. It does not invent missing action sequences; use the task steps or optional guided example to plan the route.

## Free Practice and random mazes

Use **Free Practice / 自由练习** in the sidebar or the dashboard's maze card. A seeded randomized depth-first search carves a connected 7 × 5 maze. Each corridor section is 72 units; 6-unit walls leave enough clearance for the robot. The start and target are cell centers. The seed persists across reloads; **New maze** regenerates the world, stops execution and preserves your blocks for editing. Practice attempts are tracked separately from the four-course completion percentage.

The complete guided example is derived from the generated maze graph, translated into the same movement IR and actual Blockly blocks, and then executed normally. It never teleports the robot or marks success directly. Any collision-free student program can succeed. Practice automatically stops the robot within the goal region.

New blocks:

- **Keep moving forward / 一直前进** starts continuous forward motor movement. The motor keeps moving during waits and sensor checks. Follow with a condition/wait loop and a brake command to stop at a sensor threshold.
- **Stop movement / 停止移动** brakes the motor while allowing subsequent blocks to execute.
- **Stop program / 停止程序** ends all execution, including inside nested loops.
- **Forever / 一直重复** repeats its body, with the same execution/loop safeguards as other control blocks.
- **Move forward until / 一直前进直到** moves in one-unit increments while rechecking its connected Boolean condition.

Turns and finite-distance movement take over the motor and end continuous drive. A lone continuous-forward block keeps driving after the command stack ends; use the toolbar stop, a brake block, a goal, or sensor logic to stop safely. Collisions stop execution. The runner enforces a 120-second simulated runtime limit in addition to interpreter step/loop limits. Pausing freezes movement and the simulated execution clock.

`src/lessons/maze.ts` owns seeded maze generation and graph-derived reference routes. `src/engine/runner.ts` owns frame-independent action scheduling and persistent motor state. Tests execute Blockly routes in 150 generated mazes, verify safe practice starter behavior across 20 seeds, and cover motor waits, braking, sensor feedback, nested stop, interruption, goal stopping, collision and time limits.

### Universal solver

**Load universal solver / 载入迷宫通解** installs the same sensor-based right-hand wall-following program for every generated maze. Click Run afterwards. It never reads the world map, seed, BFS path or reference solution. At each cell center it tests the right sensor (>40 units), then the front sensor, and either turns right and advances 72 units, advances straight 72 units, or turns left to reconsider. It repeats until the goal sensor succeeds, then brakes and ends the program. Regenerating the maze preserves this program so it can be tested unchanged.

The guarantee applies to the connected perfect (loop-free passage graph) mazes created by this application. A right-hand traversal explores a finite tree and eventually visits the goal. It is not a guarantee for arbitrary imported labyrinths with loops, disconnected goals, moving obstacles, or different cell dimensions. Such worlds need a memory-based graph search strategy. The practice distance budget is 10,000 units, allowing exploratory wall-following routes; course challenges retain 4,000 units. The existing 120-second, 10,000-step and 1,000-iteration limits remain.

`src/lessons/universal.ts` contains the map-independent solver. Its tests compile a real Blockly workspace and run the identical resulting program on 1,000 seeds, checking collision-free goal arrival and assessment success. Additional tests verify directional sensing without changing heading.


### Basic toolbox and map controls

The default toolbox shows Movement, Control and Sensors. Repeat, repeat-until, if/else and forever are plain blocks with empty action slots, not preassembled programs. Existing editable condition/value defaults remain available. More blocks exposes Logic, Math, Variables and extra control blocks. Switching modes preserves Blockly history, zoom and the running program. The New maze button is next to the simulation title above the map; Reset simulation restarts the same map. The universal solver remains a separate explicit load action.
