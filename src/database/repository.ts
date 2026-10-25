import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { emptyData, validateData, uid, type AppData, type Mode } from '../lib/schema';
import { localDate } from '../lib/dates';
import { reconcileGoals } from '../lib/actions';
export interface RecordState {data:AppData;revision:number}
export interface RecoveryPoint {id:string;createdAt:string;reason:string;data:AppData}
export interface BackupMetadata {lastExternalAt:string|null;lastOfferedAt:string|null}
interface HabitsDB extends DBSchema {
 current:{key:string;value:RecordState};
 recovery:{key:string;value:RecoveryPoint};
 meta:{key:string;value:BackupMetadata};
}
export const databaseName=(mode:Mode)=>mode==='test'?'habits-test-v1':'habits-live-v1';
export class Repository {
 private db:Promise<IDBPDatabase<HabitsDB>>;
 constructor(readonly mode:Mode,readonly name=databaseName(mode)) {
  this.db=openDB<HabitsDB>(name,1,{upgrade(db,oldVersion){if(oldVersion<1){db.createObjectStore('current');db.createObjectStore('recovery',{keyPath:'id'});db.createObjectStore('meta');}},blocked(){window.dispatchEvent(new Event('habits-db-blocked'));},blocking(_a,_b,event){(event.target as IDBDatabase).close();}});
 }
 async read():Promise<RecordState>{const db=await this.db;const tx=db.transaction('current','readwrite');try{let state=await tx.store.get('state');if(!state){state={data:emptyData(),revision:0};await tx.store.put(state,'state');}await tx.done;return {...state,data:validateData(state.data)};}catch(e){try{tx.abort();}catch{}await tx.done.catch(()=>{});throw e;}}
 async mutate(fn:(d:AppData)=>void,reason?:string):Promise<RecordState>{return this.write(fn,reason);}
 async replace(data:AppData,expectedRevision:number,reason='Vóór herstellen'):Promise<RecordState>{const parsed=validateData(data);return this.write(()=>{},reason,parsed,expectedRevision);}
 private async write(fn:(d:AppData)=>void,reason?:string,replacement?:AppData,expectedRevision?:number):Promise<RecordState>{
  const db=await this.db;const tx=db.transaction(['current','recovery'],'readwrite');
  try {
   const old=await tx.objectStore('current').get('state')??{data:emptyData(),revision:0};
   if(expectedRevision!==undefined&&old.revision!==expectedRevision)throw new Error('Je gegevens zijn intussen gewijzigd. Open het herstelbestand opnieuw en controleer de nieuwe bevestiging.');
   const data=replacement?structuredClone(replacement):structuredClone(old.data);fn(data);if(!replacement)reconcileGoals(data);const parsed=validateData(data);
   const now=new Date().toISOString(),dailyId='daily-'+localDate(),recoveries=tx.objectStore('recovery');
   if(reason||!await recoveries.get(dailyId)){await recoveries.put({id:reason?uid():dailyId,createdAt:now,reason:reason??'Dagelijks herstelpunt',data:old.data});const all=(await recoveries.getAll()).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));for(const p of all.slice(0,Math.max(0,all.length-10)))await recoveries.delete(p.id);}
   const result={data:parsed,revision:old.revision+1};await tx.objectStore('current').put(result,'state');await tx.done;return result;
  } catch(error){try{tx.abort();}catch{/* A failed transaction is already aborted. */}await tx.done.catch(()=>{});throw error;}
 }
 async points(){return (await (await this.db).getAll('recovery')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
 async metadata():Promise<BackupMetadata>{return await (await this.db).get('meta','backup')??{lastExternalAt:null,lastOfferedAt:null};}
 async markBackup(confirmed:boolean){const db=await this.db,tx=db.transaction('meta','readwrite'),old=await tx.store.get('backup')??{lastExternalAt:null,lastOfferedAt:null};const now=new Date().toISOString();try{await tx.store.put({...old,lastOfferedAt:now,...(confirmed?{lastExternalAt:now}:{})},'backup');await tx.done;}catch(e){try{tx.abort();}catch{}await tx.done.catch(()=>{});throw e;}}
 async reset(expectedRevision:number){const db=await this.db,tx=db.transaction(['current','recovery','meta'],'readwrite');try{const old=await tx.objectStore('current').get('state');if((old?.revision??0)!==expectedRevision)throw new Error('Je gegevens zijn intussen gewijzigd. Bevestig reset opnieuw.');await tx.objectStore('recovery').clear();await tx.objectStore('meta').clear();await tx.objectStore('current').put({data:emptyData(),revision:expectedRevision+1},'state');await tx.done;}catch(e){try{tx.abort();}catch{}await tx.done.catch(()=>{});throw e;}}
 async close(){(await this.db).close();}
}
