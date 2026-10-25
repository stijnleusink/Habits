import {createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {Repository,type RecordState} from './database/repository';
import {localDate} from './lib/dates';
import {demoData} from './lib/demo';
import type {AppData,Mode} from './lib/schema';
type Toast={message:string;error:boolean}|null;
interface Context {data:AppData;revision:number;repo:Repository;mode:Mode;today:string;busy:boolean;notify:(m:string,error?:boolean)=>void;mutate:(f:(d:AppData)=>void,reason?:string)=>Promise<boolean>;replace:(d:AppData,revision:number,reason?:string)=>Promise<boolean>;switchMode:()=>void;reload:()=>Promise<void>}
const Ctx=createContext<Context|null>(null);
export function useApp(){const ctx=useContext(Ctx);if(!ctx)throw new Error('App niet geladen');return ctx;}
export function AppProvider({children}:{children:ReactNode}){
 const [mode,setMode]=useState<Mode>('live'),[state,setState]=useState<RecordState|null>(null),[today,setToday]=useState(localDate),[pending,setPending]=useState(0),[toast,setToast]=useState<Toast>(null),[loadError,setLoadError]=useState('');
 const repo=useMemo(()=>new Repository(mode),[mode]);
 const notify=useCallback((message:string,error=false)=>setToast({message,error}),[]);
 const adopt=useCallback((next:RecordState)=>setState(old=>!old||next.revision>=old.revision?next:old),[]);
 const reload=useCallback(async()=>{adopt(await repo.read());},[repo,adopt]);
 useEffect(()=>{let alive=true;setState(null);setLoadError('');repo.read().then(async s=>{const initial=mode==='test'&&s.revision===0?await repo.replace(demoData(),s.revision,'Start testmodus'):s;if(alive)setState(initial);}).catch(e=>{if(alive)setLoadError(String(e));});const refresh=()=>{setToday(localDate());repo.read().then(s=>{if(alive)adopt(s);}).catch(e=>notify('Opslag kon niet worden gelezen: '+String(e),true));};const tick=setInterval(()=>setToday(localDate()),30000);window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',refresh);const bc=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('habits-'+mode):null;if(bc)bc.onmessage=refresh;return()=>{alive=false;clearInterval(tick);bc?.close();window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);void repo.close();};},[repo,mode,adopt,notify]);
 useEffect(()=>{if(!toast||toast.error)return;const t=setTimeout(()=>setToast(null),5500);return()=>clearTimeout(t);},[toast]);
 useEffect(()=>{if(!state)return;const media=matchMedia('(prefers-color-scheme: dark)');const apply=()=>{document.documentElement.dataset.theme=state.data.settings.theme==='auto'?(media.matches?'dark':'light'):state.data.settings.theme;document.documentElement.dataset.accent=state.data.settings.accent;};apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);},[state?.data.settings.theme,state?.data.settings.accent]);
 const transact=async(work:()=>Promise<RecordState>)=>{setPending(n=>n+1);setToday(localDate());try{const s=await work();adopt(s);if(typeof BroadcastChannel!=='undefined'){const bc=new BroadcastChannel('habits-'+mode);bc.postMessage('changed');bc.close();}return true;}catch(e){notify('Niet opgeslagen. '+(e instanceof Error?e.message:String(e)),true);return false;}finally{setPending(n=>n-1);}};
 const switchMode=()=>{if(pending)return;setState(null);setToast(null);setMode(m=>m==='live'?'test':'live');};
 return <>{loadError?<main className="startup"><h1>Je gegevens zijn niet geladen</h1><p>{loadError}</p><p>Wis geen websitegegevens. Sluit andere Habits-tabbladen en probeer opnieuw.</p><button onClick={()=>location.reload()}>Opnieuw proberen</button></main>:!state?<main className="startup"><div className="brandmark">✓</div><h1>Habits</h1><p>Je voortgang laden…</p></main>:<Ctx.Provider value={{data:state.data,revision:state.revision,repo,mode,today,busy:pending>0,notify,mutate:(f,r)=>transact(()=>repo.mutate(f,r)),replace:(d,r,why)=>transact(()=>repo.replace(d,r,why)),switchMode,reload}}>{children}</Ctx.Provider>}{toast&&<div className={'toast '+(toast.error?'error':'')} role={toast.error?'alert':'status'}><span>{toast.message}</span><button aria-label="Melding sluiten" onClick={()=>setToast(null)}>×</button></div>}</>;
}
