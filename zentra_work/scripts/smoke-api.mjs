const base=(process.env.E2E_API_BASE_URL||'http://localhost:5000/api/v1').replace(/\/$/,'');
const tenant=process.env.E2E_TENANT_SLUG||'zentra-bank';
const email=process.env.E2E_EMAIL;
const password=process.env.E2E_PASSWORD;
if(!email||!password){console.error('Missing E2E_EMAIL or E2E_PASSWORD.');process.exit(2)}
let token='';
async function request(path,options={}){const headers={'Content-Type':'application/json','X-Tenant-Slug':tenant,...options.headers};if(token)headers.Authorization=`Bearer ${token}`;const r=await fetch(`${base}${path}`,{...options,headers});const body=await r.json().catch(()=>null);if(!r.ok||!body?.success)throw new Error(`${options.method||'GET'} ${path}: ${r.status} ${body?.message||'failed'}`);return body.data}
const checks=[];
async function check(name,fn){try{await fn();checks.push([name,'PASS'])}catch(e){checks.push([name,'FAIL']);console.error(e.message);throw e}}
await check('tenant',()=>request('/tenants/current'));
await check('login',async()=>{const s=await request('/auth/login',{method:'POST',body:JSON.stringify({email,password})});token=s.accessToken});
await check('me',()=>request('/auth/me'));
await check('accounts',()=>request('/accounts/me'));
await check('transactions',()=>request('/transactions/me?limit=5'));
await check('beneficiaries',()=>request('/beneficiaries/me'));
await check('notifications',()=>request('/notifications/me?limit=5'));
await check('demo banks',()=>request('/demo-banks'));
console.table(checks);
