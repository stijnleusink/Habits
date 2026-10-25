import { z } from 'zod';
import { sha256 } from '@noble/hashes/sha2.js';
import { dataSchema, validateData, type AppData, type Mode } from './schema';
export const MAX_BACKUP_BYTES=25*1024*1024;
const envelopeSchema=z.object({format:z.literal('habits-backup'),schemaVersion:z.literal(1),appVersion:z.string().max(30),mode:z.enum(['live','test']),exportedAt:z.iso.datetime(),checksum:z.string().regex(/^[a-f0-9]{64}$/),data:dataSchema}).strict();
export type Backup=z.infer<typeof envelopeSchema>;
export function canonical(value:unknown):string {if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';const obj=value as Record<string,unknown>;return '{'+Object.keys(obj).sort().map(k=>JSON.stringify(k)+':'+canonical(obj[k])).join(',')+'}';}
export async function checksum(value:unknown):Promise<string>{const bytes=new TextEncoder().encode(canonical(value));const hash=crypto.subtle?new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)):sha256(bytes);return [...hash].map(x=>x.toString(16).padStart(2,'0')).join('');}
function signedFields(b:Omit<Backup,'checksum'>){return {format:b.format,schemaVersion:b.schemaVersion,appVersion:b.appVersion,mode:b.mode,exportedAt:b.exportedAt,data:b.data};}
export async function exportBackup(data:AppData,mode:Mode):Promise<string>{const fields=signedFields({format:'habits-backup',schemaVersion:1,appVersion:'1.0.0',mode,exportedAt:new Date().toISOString(),data:validateData(data)});const result=JSON.stringify({...fields,checksum:await checksum(fields)},null,2);if(new TextEncoder().encode(result).byteLength>MAX_BACKUP_BYTES)throw new Error('Deze back-up is groter dan de veilige limiet van 25 MB. Exporteer via een aangepaste versie met een hogere geteste limiet.');return result;}
export async function parseBackup(text:string,mode:Mode):Promise<Backup>{
 if(new TextEncoder().encode(text).byteLength>MAX_BACKUP_BYTES)throw new Error('Dit bestand is te groot. De limiet is 25 MB.');
 let raw:unknown;try{raw=JSON.parse(text);}catch{throw new Error('Dit bestand bevat geen geldige JSON. Je gegevens zijn niet gewijzigd.');}
 const p=envelopeSchema.safeParse(raw);if(!p.success)throw new Error('Ongeldig of niet-ondersteund back-upbestand. Controleer het formaat, de versie en de inhoud. Je gegevens zijn niet gewijzigd.');
 const b=p.data;if(b.mode!==mode)throw new Error(mode==='live'?'Dit is een testback-up. Open de testmodus om deze te herstellen.':'Deze back-up bevat echte gegevens. De testmodus accepteert alleen testback-ups.');
 if(await checksum(signedFields(b))!==b.checksum)throw new Error('De controlecode klopt niet. Dit bestand is beschadigd of aangepast. Je gegevens zijn niet gewijzigd.');return b;
}
export function backupDue(last:string|null,now=new Date()):boolean {return !last||!Number.isFinite(Date.parse(last))||now.getTime()-Date.parse(last)>7*24*60*60*1000;}
export function downloadBackup(text:string,mode:Mode){const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Habits-${mode==='test'?'TEST-':''}${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
