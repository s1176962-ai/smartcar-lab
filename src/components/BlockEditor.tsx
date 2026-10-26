import {useEffect,useRef} from 'react';
import * as Blockly from 'blockly';
import {useLanguage} from '../i18n';
import {theme,localizedToolbox,configureLanguage,variableToolbox,loadStarter} from '../blocks/config';
import type {Command} from '../engine/core';
interface Props {lessonId:number;starter:Command[];onReady:(workspace:Blockly.WorkspaceSvg)=>void;onChange:()=>void;advanced?:boolean}
export default function BlockEditor({lessonId,starter,onReady,onChange,advanced=false}:Props){
 const {language}=useLanguage();
 const container=useRef<HTMLDivElement>(null);
 const current=useRef<Blockly.WorkspaceSvg|null>(null);
 const callbacks=useRef({onReady,onChange});callbacks.current={onReady,onChange};
 const advancedRef=useRef(advanced);advancedRef.current=advanced;
 useEffect(()=>{
  configureLanguage(language);
  const workspace=Blockly.inject(container.current!,{
   toolbox:localizedToolbox(language,advancedRef.current),theme,renderer:'zelos',
   grid:{spacing:24,length:2,colour:'#dce3ef',snap:true},
   zoom:{controls:true,wheel:true,startScale:container.current!.clientWidth<500?.65:.85,maxScale:1.6,minScale:.4},
   trashcan:true,move:{scrollbars:true,drag:true,wheel:true},sounds:false,
  });
  current.current=workspace;
  workspace.registerToolboxCategoryCallback('VARIABLE',variableToolbox);
  try{const saved=localStorage.getItem('smartcar-program-'+lessonId);if(saved)Blockly.serialization.workspaces.load(JSON.parse(saved),workspace);else loadStarter(workspace,starter)}catch{loadStarter(workspace,starter)}
  let saveTimer:ReturnType<typeof setTimeout>|undefined;
  const persist=()=>{try{localStorage.setItem('smartcar-program-'+lessonId,JSON.stringify(Blockly.serialization.workspaces.save(workspace)))}catch{/* Explicit Save reports storage failures. */}};
  const listener=(event:Blockly.Events.Abstract)=>{
   if(event.isUiEvent||event.type===Blockly.Events.FINISHED_LOADING)return;
   callbacks.current.onChange();
   clearTimeout(saveTimer);saveTimer=setTimeout(persist,150);
  };
  workspace.addChangeListener(listener);
  callbacks.current.onReady(workspace);
  const observer=new ResizeObserver(()=>Blockly.svgResize(workspace));observer.observe(container.current!);
  return()=>{observer.disconnect();clearTimeout(saveTimer);persist();workspace.removeChangeListener(listener);current.current=null;workspace.dispose()};
 },[lessonId,language]);
 // Changing available categories preserves the program, undo history, zoom and execution.
 useEffect(()=>{current.current?.updateToolbox(localizedToolbox(language,advanced))},[advanced,language]);
 return <div className="block-editor" ref={container}/>;
}
