import { z } from 'zod';
import { validDate, localDate } from './dates';
const day = z.string().refine(validDate,'Ongeldige kalenderdatum (1900–2200).');
const id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
const text = z.string().max(300);
const amount = z.number().finite().min(0).max(1e9);
const positive = amount.refine(n=>n>0,'Gebruik een getal groter dan nul.');
const instant = z.iso.datetime();
export const scheduleSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('daily')}).strict(),
 z.object({type:z.literal('weekdays'),days:z.array(z.number().int().min(0).max(6)).min(1).max(7).refine(a=>new Set(a).size===a.length)}).strict(),
 z.object({type:z.literal('dates'),dates:z.array(day).min(1).max(10000).refine(a=>new Set(a).size===a.length)}).strict()
]);
export const versionSchema=z.object({effectiveFrom:day,name:text.min(1),icon:text.max(20),category:text.min(1),type:z.enum(['check','count','amount','time']),target:positive,unit:text.max(30),step:positive,start:day,end:day.nullable(),schedule:scheduleSchema,status:z.enum(['active','paused','archived'])}).strict().refine(v=>!v.end||v.end>=v.start,'Einddatum ligt voor startdatum.').refine(v=>v.type!=='check'||(v.target===1&&v.step===1),'Een afvinkgewoonte heeft doel en stapgrootte 1.');
export const habitSchema=z.object({id,versions:z.array(versionSchema).min(1).max(10000)}).strict().refine(h=>h.versions.every((v,i)=>i===0||v.effectiveFrom>h.versions[i-1].effectiveFrom),'Versies moeten unieke, oplopende ingangsdatums hebben.');
export const goalSchema=z.object({id,name:text.min(1),description:z.string().max(5000),category:text,kind:z.enum(['week','month','long']),start:day,end:day.nullable(),target:positive,unit:text.max(30),progress:amount,habitId:id.nullable(),metric:z.enum(['completions','amount']),completedAt:day.nullable(),archived:z.boolean()}).strict().refine(g=>!g.end||g.end>=g.start,'Einddatum ligt voor startdatum.');
export const dataSchema=z.object({
 schemaVersion:z.literal(1),
 habits:z.array(habitSchema).max(20000),
 entries:z.array(z.object({habitId:id,date:day,value:amount,paused:z.boolean(),note:z.string().max(10000)}).strict()).max(500000),
 reflections:z.array(z.object({date:day,mood:z.number().int().min(1).max(5).nullable(),energy:z.number().int().min(1).max(5).nullable(),note:z.string().max(20000),good:z.string().max(10000),better:z.string().max(10000),grateful:z.string().max(10000)}).strict()).max(110000),
 goals:z.array(goalSchema).max(20000),
 rewards:z.array(z.object({id,name:text.min(1),description:z.string().max(5000),cost:z.number().int().positive().max(1e9)}).strict()).max(20000),
 redemptions:z.array(z.object({id,rewardId:id,cost:z.number().int().positive().max(1e9),redeemedAt:instant}).strict()).max(20000),
 settings:z.object({name:text.max(80),theme:z.enum(['dark','light','auto']),accent:z.enum(['blue','violet','teal']),backupReminders:z.boolean(),defaultUnit:text.max(30),defaultStep:positive,categories:z.array(text.min(1)).min(1).max(1000)}).strict()
}).strict().superRefine((d,ctx)=>{
 const check=(values:string[],name:string)=>{if(new Set(values).size!==values.length)ctx.addIssue({code:'custom',message:`Dubbele ${name}.`});};
 check(d.habits.map(x=>x.id),'gewoonte-ID');check(d.entries.map(x=>x.habitId+':'+x.date),'dagregistratie');check(d.reflections.map(x=>x.date),'dagboekdatum');check(d.goals.map(x=>x.id),'doel-ID');check(d.rewards.map(x=>x.id),'beloning-ID');check(d.redemptions.map(x=>x.id),'inwisseling-ID');check(d.redemptions.map(x=>x.rewardId),'inwisseling voor één beloning');
 const habits=new Set(d.habits.map(h=>h.id)),rewards=new Set(d.rewards.map(r=>r.id));
 if(d.entries.some(e=>!habits.has(e.habitId))||d.goals.some(g=>g.habitId&&!habits.has(g.habitId))||d.redemptions.some(r=>!rewards.has(r.rewardId)))ctx.addIssue({code:'custom',message:'Verwijzing naar ontbrekende gewoonte of beloning.'});
});
export type AppData=z.infer<typeof dataSchema>;
export type Habit=AppData['habits'][number];
export type HabitVersion=z.infer<typeof versionSchema>;
export type HabitEntry=AppData['entries'][number];
export type Goal=z.infer<typeof goalSchema>;
export type Reflection=AppData['reflections'][number];
export type Mode='live'|'test';
export const uid=()=>{if(typeof crypto.randomUUID==='function')return crypto.randomUUID();const a=crypto.getRandomValues(new Uint8Array(16));a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;const h=[...a].map(x=>x.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;};
export function emptyData():AppData {return {schemaVersion:1,habits:[],entries:[],reflections:[],goals:[],rewards:[],redemptions:[],settings:{name:'',theme:'dark',accent:'blue',backupReminders:true,defaultUnit:'liter',defaultStep:0.25,categories:['Sport','Gezondheid','Voeding','Studie','Productiviteit','Persoonlijk','Overig']}};}
export function defaultVersion(date=localDate()):HabitVersion {return {effectiveFrom:date,name:'',icon:'✓',category:'Persoonlijk',type:'check',target:1,step:1,unit:'keer',start:date,end:null,schedule:{type:'daily'},status:'active'};}
export function validateData(value:unknown):AppData {const p=dataSchema.safeParse(value);if(!p.success)throw new Error('Ongeldige gegevens: '+p.error.issues.slice(0,3).map(e=>`${e.path.join('.')}: ${e.message}`).join(' '));return p.data;}
