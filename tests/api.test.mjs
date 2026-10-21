import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {once} from 'node:events';
test('authenticated API saves, dispenses and closes hospital follow-up',async()=>{
const dir=mkdtempSync(join(tmpdir(),'medcap-test-'));const password=randomBytes(20).toString('hex');const port=18000+Math.floor(Math.random()*10000);const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,ADMIN_PASSWORD:password,PORT:String(port),DB_PATH:join(dir,'test.sqlite')},stdio:['ignore','pipe','pipe']});
try{await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Server failed to start')}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Server timeout')),10000).unref())]);
const base='http://127.0.0.1:'+port;let cookie='';const req=async(path,data)=>{const r=await fetch(base+'/api/'+path,{method:data?'POST':'GET',headers:{'Content-Type':'application/json',cookie},...(data?{body:JSON.stringify(data)}:{})});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,data:await r.json()};};
assert.equal((await req('state')).status,401);assert.equal((await req('login',{password})).status,200);
assert.equal((await req('patients',{name:'Integration Test',kind:'Faculty',identifier:'TEST-ID',phone:'+910000000000'})).status,200);
assert.equal((await req('medicines',{name:'Test medicine',stock:12,threshold:5})).status,200);
let state=(await req('state')).data;assert.equal(state.patients.length,1);assert.equal((await req('visits',{patientId:state.patients[0].id,diagnosis:'Test',doctor:'Test Clinician',referral:'Hospital review',due:'2000-01-01T12:00:00Z',prescriptions:[{medicineId:state.medicines[0].id,quantity:8}]})).status,200);
state=(await req('state')).data;const id=state.visits[0].id;assert.equal(state.notifications.length,1);assert.equal((await req('dispense',{id})).status,200);assert.equal((await req('dispense',{id})).status,400);assert.equal((await req('state')).data.medicines[0].stock,4);
assert.equal((await req('complete',{id})).status,200);assert.equal((await req('state')).data.notifications[0].status,'cancelled');assert.equal((await req('ai-review',{id})).status,400);
assert.equal((await req('logout',{})).status,200);assert.equal((await req('state')).status,401);
}finally{child.kill();await once(child,'exit');rmSync(dir,{recursive:true,force:true});}
});
