import type {Command} from '../engine/core';
/** Right-hand wall following for every connected perfect maze from our generator.
 * Uses only current front/right sensor values and the goal condition; no map/path/seed.
 */
export function universalMazeProgram():Command[]{return [
 {type:'speed',value:220},
 {type:'until',condition:{op:'goal'},body:[
  {type:'if',condition:{op:'GT',a:{op:'sensor_right'},b:40},body:[{type:'turn',value:90},{type:'move',value:72}],otherwise:[
   {type:'if',condition:{op:'GT',a:{op:'sensor'},b:40},body:[{type:'move',value:72}],otherwise:[{type:'turn',value:-90}]}
  ]}
 ]},
 {type:'brake'},
 {type:'halt'}
]}
