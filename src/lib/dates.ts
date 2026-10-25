export function localDate(date = new Date()): string { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function parseDate(day:string):Date { const [y,m,d]=day.split('-').map(Number); const date=new Date(0); date.setFullYear(y,m-1,d);date.setHours(12,0,0,0); return date; }
export function validDate(day:string):boolean {return /^\d{4}-\d{2}-\d{2}$/.test(day) && day>='1900-01-01' && day<='2200-12-31' && localDate(parseDate(day))===day;}
export function addDays(day:string,n:number):string {const d=parseDate(day);d.setDate(d.getDate()+n);return localDate(d);}
export function datesBetween(start:string,end:string):string[] {const out:string[]=[]; for(let day=start;day<=end;day=addDays(day,1))out.push(day);return out;}
export function weekStart(day:string):string {const n=parseDate(day).getDay();return addDays(day,-((n+6)%7));}
export function monthStart(day:string):string {return day.slice(0,7)+'-01';}
export function monthEnd(day:string):string {const d=parseDate(monthStart(day));d.setMonth(d.getMonth()+1);d.setDate(0);return localDate(d);}
export function shiftMonth(day:string,n:number):string {const d=parseDate(monthStart(day));d.setMonth(d.getMonth()+n);return localDate(d);}
export function dateLabel(day:string,short=false):string {return parseDate(day).toLocaleDateString('nl-NL',short?{day:'numeric',month:'short'}:{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
