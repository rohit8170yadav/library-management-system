const $ = (id) => document.getElementById(id);
const todayISO = () => new Date().toISOString().slice(0, 10);
const todayText = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"});
$("today").textContent = todayText;
const datePlusDays = (days) => { const d = new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); };
const seedMembers = [
  {id:1,name:"Aarav Sharma",email:"aarav@example.com",phone:"9876543210",joined:"2026-09-04",monthlyFee:500,paidThisCycle:500,expiryDate:datePlusDays(12)},
  {id:2,name:"Priya Patel",email:"priya@example.com",phone:"9876501234",joined:"2026-09-12",monthlyFee:500,paidThisCycle:250,expiryDate:datePlusDays(5)},
  {id:3,name:"Rahul Verma",email:"rahul@example.com",phone:"9123456780",joined:"2026-10-02",monthlyFee:500,paidThisCycle:0,expiryDate:datePlusDays(-4)}
];
const seedPayments = [
  {id:1,memberId:1,amount:500,date:todayISO(),note:"Monthly membership fee"},
  {id:2,memberId:2,amount:250,date:todayISO(),note:"Part payment"}
];
function load(key,seed){try{const x=localStorage.getItem("libradesk_"+key);return x?JSON.parse(x):seed}catch{return seed}}
let members=load("members",seedMembers).map((m,i)=>({...m,monthlyFee:Number(m.monthlyFee??500),paidThisCycle:Number(m.paidThisCycle??0),expiryDate:m.expiryDate||datePlusDays(30+i*3)})), payments=load("payments",seedPayments);
let modalType="", editingId=null, toastTimer;
function save(){localStorage.setItem("libradesk_members",JSON.stringify(members));localStorage.setItem("libradesk_payments",JSON.stringify(payments));}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function member(id){return members.find(m=>m.id===Number(id));}
function dateFmt(d){if(!d)return "—";return new Date(d+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});}
function money(n){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(n)||0);}
function initials(name="Member"){return name.trim().split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase();}
function due(m){return Math.max(0,Number(m.monthlyFee||0)-Number(m.paidThisCycle||0));}
function totalCollected(){return payments.reduce((n,p)=>n+Number(p.amount||0),0);}
function totalDues(){return members.reduce((n,m)=>n+due(m),0);}
function daysUntil(date){return Math.ceil((new Date(date+"T00:00:00")-new Date(todayISO()+"T00:00:00"))/86400000);}
function expiryMembers(){return members.filter(m=>m.expiryDate && daysUntil(m.expiryDate)<=30).sort((a,b)=>a.expiryDate.localeCompare(b.expiryDate));}
function statusFor(m){const d=daysUntil(m.expiryDate);if(d<0)return {text:"Expired",cls:"overdue"};if(d<=7)return {text:"Expiring soon",cls:"issued"};return {text:"Active",cls:"available"};}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2800);}
function emptyRow(cols,msg){return `<tr><td colspan="${cols}"><div class="empty">${msg}</div></td></tr>`;}
function setView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name+"-view"));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("page-title").textContent={dashboard:"Dashboard",members:"Members",fees:"Fee Records",reminders:"Fee Reminders"}[name]||"Dashboard";renderAll();}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.goto)));
function renderDashboard(){
 const collected=totalCollected(),dues=totalDues(),expiring=expiryMembers();
 $("stat-members").textContent=members.length;$("stat-collected").textContent=money(collected);$("stat-dues").textContent=money(dues);$("stat-expiring").textContent=expiring.length;
 $("fees-total-collected").textContent=money(collected);$("fees-total-dues").textContent=money(dues);
 const expected=members.reduce((n,m)=>n+Number(m.monthlyFee||0),0), paid=members.reduce((n,m)=>n+Math.min(Number(m.monthlyFee||0),Number(m.paidThisCycle||0)),0),pct=expected?Math.round(paid/expected*100):0;
 $("collection-percent").textContent=pct+"%";$("collection-bar").style.width=pct+"%";$("collection-label").textContent=`${money(paid)} / ${money(expected)}`;
 $("dashboard-reminders").innerHTML=expiring.length?`<div class="simple-list">${expiring.slice(0,5).map(m=>{const d=daysUntil(m.expiryDate);return `<div class="simple-row"><div class="member-cell"><div class="member-avatar">${initials(m.name)}</div><div><strong>${esc(m.name)}</strong><small>${d<0?`Expired ${Math.abs(d)} day(s) ago`:`Expires in ${d} day(s)`}</small></div></div><span class="pill ${d<0?"overdue":"issued"}">${money(due(m))} due</span></div>`}).join("")}</div>`:`<div class="empty">No memberships expiring in the next 30 days.</div>`;
 const recent=[...payments].sort((a,b)=>b.id-a.id).slice(0,5);
 $("recent-payments").innerHTML=recent.length?`<div class="table-wrap"><table><thead><tr><th>Member</th><th>Payment Date</th><th>Amount</th><th>Note</th></tr></thead><tbody>${recent.map(p=>`<tr><td>${esc(member(p.memberId)?.name||"Deleted member")}</td><td>${dateFmt(p.date)}</td><td><strong>${money(p.amount)}</strong></td><td>${esc(p.note||"Fee payment")}</td></tr>`).join("")}</tbody></table></div>`:emptyRow(4,"No payments recorded yet.");
}
function renderMembers(){
 const q=$("member-search").value.toLowerCase();const list=members.filter(m=>`${m.name} ${m.email} ${m.phone}`.toLowerCase().includes(q));
 $("members-table").innerHTML=list.length?list.map(m=>{const st=statusFor(m);return `<tr><td><div class="member-cell"><div class="member-avatar">${initials(m.name)}</div><div><strong>${esc(m.name)}</strong><small>${esc(m.email||"No email")} · ID #${m.id}</small></div></div></td><td>${esc(m.phone)}</td><td>${dateFmt(m.expiryDate)}</td><td>${money(m.monthlyFee)}</td><td>${money(m.paidThisCycle)}</td><td><strong class="due-amount">${money(due(m))}</strong></td><td><span class="pill ${st.cls}">${st.text}</span></td><td><div class="actions"><button class="small-btn" data-payment="${m.id}">Pay</button><button class="small-btn" data-edit-member="${m.id}">Edit</button><button class="small-btn" data-delete-member="${m.id}">Delete</button></div></td></tr>`}).join(""):emptyRow(8,"No members match your search.");
 document.querySelectorAll("[data-payment]").forEach(b=>b.onclick=()=>openPaymentForm(Number(b.dataset.payment)));
 document.querySelectorAll("[data-edit-member]").forEach(b=>b.onclick=()=>openMemberForm(Number(b.dataset.editMember)));
 document.querySelectorAll("[data-delete-member]").forEach(b=>b.onclick=()=>deleteMember(Number(b.dataset.deleteMember)));
}
function renderFees(){
 const q=$("fee-search").value.toLowerCase();const list=[...payments].sort((a,b)=>b.id-a.id).filter(p=>`${member(p.memberId)?.name||""} ${p.date} ${p.note||""}`.toLowerCase().includes(q));
 $("fees-table").innerHTML=list.length?list.map(p=>`<tr><td>${esc(member(p.memberId)?.name||"Deleted member")}</td><td><strong>${money(p.amount)}</strong></td><td>${dateFmt(p.date)}</td><td>${esc(p.note||"Fee payment")}</td></tr>`).join(""):emptyRow(4,"No payments found.");
}
function reminderMessage(m){const d=daysUntil(m.expiryDate);const expiryText=d<0?`expired on ${dateFmt(m.expiryDate)}`:`expires on ${dateFmt(m.expiryDate)}`;return `Hello ${m.name}, this is a reminder from the library that your membership ${expiryText}. Current fee due: ${money(due(m))}. Please renew your membership or contact the library. Thank you.`;}
function openWhatsApp(m){const phone=String(m.phone||"").replace(/\D/g,"");if(!phone){toast("Add a phone number for this member first.");return;}const normalized=phone.length===10?"91"+phone:phone;window.open(`https://wa.me/${normalized}?text=${encodeURIComponent(reminderMessage(m))}`,"_blank","noopener");}
function openSMS(m){const phone=String(m.phone||"").replace(/[^\d+]/g,"");if(!phone){toast("Add a phone number for this member first.");return;}window.location.href=`sms:${phone}?body=${encodeURIComponent(reminderMessage(m))}`;}
function renderReminders(){
 const q=$("reminder-search").value.toLowerCase();const list=expiryMembers().filter(m=>`${m.name} ${m.phone}`.toLowerCase().includes(q));
 $("reminders-table").innerHTML=list.length?list.map(m=>{const d=daysUntil(m.expiryDate);return `<tr><td><div class="member-cell"><div class="member-avatar">${initials(m.name)}</div><div><strong>${esc(m.name)}</strong><small>${esc(m.email||"")}</small></div></div></td><td>${esc(m.phone)}</td><td>${dateFmt(m.expiryDate)}</td><td><span class="pill ${d<0?"overdue":d<=7?"issued":"available"}">${d<0?`${Math.abs(d)} day(s) overdue`:`${d} day(s)`}</span></td><td><strong class="due-amount">${money(due(m))}</strong></td><td><div class="actions"><button class="small-btn" data-whatsapp="${m.id}">WhatsApp</button><button class="small-btn" data-sms="${m.id}">SMS</button></div></td></tr>`}).join(""):emptyRow(6,"No expiring memberships found. Add or update member expiry dates.");
 document.querySelectorAll("[data-whatsapp]").forEach(b=>b.onclick=()=>openWhatsApp(member(b.dataset.whatsapp)));
 document.querySelectorAll("[data-sms]").forEach(b=>b.onclick=()=>openSMS(member(b.dataset.sms)));
}
function renderAll(){renderDashboard();renderMembers();renderFees();renderReminders();}
const backdrop=$("modal-backdrop");
function field(name,label,type="text",value="",opts=[],full=false,required=true,attrs=""){return `<div class="field ${full?"full":""}"><label for="f-${name}">${label}</label>${type==="select"?`<select id="f-${name}" name="${name}" ${required?"required":""} ${attrs}>${opts.map(o=>`<option value="${esc(o.value)}" ${String(value)===String(o.value)?"selected":""}>${esc(o.label)}</option>`).join("")}</select>`:`<input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${required?"required":""} ${type==="number"?'min="0" step="0.01"':''} ${attrs}/>`}</div>`;}
function openModal(type,title,fields,editId=null){modalType=type;editingId=editId;$("modal-title").textContent=title;$("modal-fields").innerHTML=fields;backdrop.hidden=false;setTimeout(()=>$("modal-fields").querySelector("input,select")?.focus(),50);}
function closeModal(){backdrop.hidden=true;$("modal-form").reset();modalType="";editingId=null;}
$("close-modal").onclick=closeModal;$("cancel-modal").onclick=closeModal;backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal();});
function openMemberForm(id=null){const m=id?member(id):{name:"",email:"",phone:"",joined:todayISO(),monthlyFee:500,paidThisCycle:0,expiryDate:datePlusDays(30)};openModal("member",id?"Edit Member":"Add Member",field("name","Full name","text",m.name,[],true)+field("phone","Phone number (with country code if needed)","tel",m.phone)+field("email","Email address","email",m.email||"",[],false,false)+field("joined","Join date","date",m.joined)+field("monthlyFee","Monthly membership fee (₹)","number",m.monthlyFee)+field("paidThisCycle","Amount paid in current cycle (₹)","number",m.paidThisCycle)+field("expiryDate","Membership expiry date","date",m.expiryDate),id);}
function openPaymentForm(id=null){if(!members.length){toast("Add a member before recording a payment.");return;}const chosen=id?member(id):members[0];openModal("payment","Record Fee Payment",field("memberId","Member","select",chosen.id,members.map(m=>({value:m.id,label:`${m.name} — due ${money(due(m))}`})),true)+field("amount","Payment amount (₹)","number",due(chosen)||chosen.monthlyFee)+field("date","Payment date","date",todayISO())+field("note","Payment note","text","Monthly membership fee",[],true,false)+field("renew","Extend membership by one month?","select","yes",[{value:"yes",label:"Yes — renew membership"},{value:"no",label:"No — record payment only"}],true),null);}
$("modal-form").addEventListener("submit",e=>{
 e.preventDefault();const fd=new FormData(e.currentTarget),v=Object.fromEntries(fd.entries());
 if(modalType==="member"){
  const payload={name:v.name.trim(),phone:v.phone.trim(),email:(v.email||"").trim(),joined:v.joined,monthlyFee:Number(v.monthlyFee),paidThisCycle:Number(v.paidThisCycle),expiryDate:v.expiryDate};
  if(!payload.name||!payload.phone||!payload.expiryDate){toast("Name, phone and expiry date are required.");return;}
  if(editingId)Object.assign(member(editingId),payload);else members.unshift({id:Math.max(0,...members.map(x=>x.id))+1,...payload});
  toast(editingId?"Member updated.":"Member added.");
 }else if(modalType==="payment"){
  const m=member(v.memberId),amount=Number(v.amount);if(!m||!Number.isFinite(amount)||amount<=0){toast("Enter a payment amount greater than zero.");return;}
  if(v.renew==="yes"){
    const remaining=due(m);if(amount<remaining){toast(`Renewal needs at least ${money(remaining)} to clear this cycle's fee.`);return;}
    m.paidThisCycle=Math.max(0,Number(m.paidThisCycle||0)+amount-Number(m.monthlyFee||0));
    const baseDate=m.expiryDate&&m.expiryDate>todayISO()?new Date(m.expiryDate+"T00:00:00"):new Date(todayISO()+"T00:00:00");
    baseDate.setMonth(baseDate.getMonth()+1);m.expiryDate=baseDate.toISOString().slice(0,10);
  }else m.paidThisCycle=Number(m.paidThisCycle||0)+amount;
  payments.unshift({id:Math.max(0,...payments.map(x=>x.id))+1,memberId:m.id,amount,date:v.date||todayISO(),note:(v.note||"Fee payment").trim()});
  toast("Payment recorded successfully.");
 }
 save();closeModal();renderAll();
});
function deleteMember(id){if(!confirm("Delete this member? Their payment history will remain as a record."))return;members=members.filter(m=>m.id!==id);save();renderAll();toast("Member deleted.");}
$("quick-add").onclick=$("add-member").onclick=()=>openMemberForm();$("record-payment").onclick=()=>openPaymentForm();
$("member-search").addEventListener("input",renderMembers);$("fee-search").addEventListener("input",renderFees);$("reminder-search").addEventListener("input",renderReminders);$("refresh-reminders").onclick=()=>{renderReminders();toast("Expiry list refreshed.");};
renderAll();
