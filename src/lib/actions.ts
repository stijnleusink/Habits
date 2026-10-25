import { localDate } from './dates';
import { goalValue, invalidate, round, scheduled, versionAt, wallet } from './engine';
import { uid, type AppData, type HabitEntry, type HabitVersion } from './schema';
export function setEntry(d:AppData,habitId:string,date:string,patch:Partial<Pick<HabitEntry,'value'|'paused'|'note'>>,today=localDate()) {
 if(date>today)throw new Error('Toekomstige dagen kun je nog niet invullen.');
 const habit=d.habits.find(h=>h.id===habitId),v=habit&&versionAt(habit,date);
 if(!v||!scheduled(v,date))throw new Error('Deze gewoonte is op die datum niet gepland.');
 let e=d.entries.find(e=>e.habitId===habitId&&e.date===date);if(!e){e={habitId,date,value:0,paused:false,note:''};d.entries.push(e);}Object.assign(e,patch);if(!Number.isFinite(e.value)||e.value<0||e.value>1e9)throw new Error('Voer een geldige, niet-negatieve hoeveelheid in.');e.value=round(e.value);invalidate(d);
}
export function changeValue(d:AppData,id:string,date:string,delta:number,today=localDate()){const e=d.entries.find(e=>e.habitId===id&&e.date===date);setEntry(d,id,date,{value:Math.max(0,round((e?.value??0)+delta))},today);}
export function saveVersion(d:AppData,id:string|null,v:HabitVersion){if(!id){d.habits.push({id:uid(),versions:[v]});return;}const h=d.habits.find(h=>h.id===id);if(!h)throw new Error('Gewoonte niet gevonden.');h.versions=h.versions.filter(old=>old.effectiveFrom!==v.effectiveFrom).concat(v).sort((a,b)=>a.effectiveFrom.localeCompare(b.effectiveFrom));invalidate(d);}
export function deleteHabit(d:AppData,id:string){if(d.goals.some(g=>g.habitId===id))throw new Error('Deze gewoonte is aan een doel gekoppeld. Ontkoppel het doel eerst of archiveer de gewoonte.');d.habits=d.habits.filter(h=>h.id!==id);d.entries=d.entries.filter(e=>e.habitId!==id);invalidate(d);}
export function reconcileGoals(d:AppData,today=localDate()){invalidate(d);for(const g of d.goals){const complete=goalValue(d,g,today)>=g.target;if(!complete)g.completedAt=null;else if(g.habitId){const dates=[...new Set(d.entries.filter(e=>e.habitId===g.habitId&&e.date>=g.start&&e.date<=today&&(!g.end||e.date<=g.end)).map(e=>e.date))].sort();g.completedAt=dates.find(date=>goalValue(d,g,date)>=g.target)??today;}else g.completedAt??=today;}}
export function redeem(d:AppData,rewardId:string,today=localDate()){const r=d.rewards.find(r=>r.id===rewardId);if(!r)throw new Error('Beloning niet gevonden.');if(d.redemptions.some(x=>x.rewardId===rewardId))throw new Error('Deze beloning is al ingewisseld.');if(wallet(d,today).available<r.cost)throw new Error('Je hebt nog niet genoeg besteedbare punten.');d.redemptions.push({id:uid(),rewardId,cost:r.cost,redeemedAt:new Date().toISOString()});}
