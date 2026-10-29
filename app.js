const $ = (id) => document.getElementById(id);
const todayText = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"});
$("today").textContent = todayText;

const seedBooks = [
 {id:1,title:"Atomic Habits",author:"James Clear",isbn:"9780735211292",category:"Self-help",total:5,available:3},
 {id:2,title:"The Alchemist",author:"Paulo Coelho",isbn:"9780061122415",category:"Fiction",total:4,available:2},
 {id:3,title:"Clean Code",author:"Robert C. Martin",isbn:"9780132350884",category:"Technology",total:3,available:2},
 {id:4,title:"Wings of Fire",author:"A. P. J. Abdul Kalam",isbn:"9788173711466",category:"Biography",total:6,available:5},
 {id:5,title:"Rich Dad Poor Dad",author:"Robert Kiyosaki",isbn:"9781612680194",category:"Finance",total:4,available:4},
 {id:6,title:"Introduction to Algorithms",author:"Cormen et al.",isbn:"9780262046305",category:"Technology",total:2,available:1}
];
const seedMembers = [
 {id:1,name:"Aarav Sharma",email:"aarav@example.com",phone:"9876543210",joined:"2026-09-04"},
 {id:2,name:"Priya Patel",email:"priya@example.com",phone:"9876501234",joined:"2026-09-12"},
 {id:3,name:"Rahul Verma",email:"rahul@example.com",phone:"9123456780",joined:"2026-10-02"}
];
const seedTransactions = [
 {id:1,bookId:1,memberId:1,issueDate:"2026-10-18",dueDate:"2026-11-01",status:"issued"},
 {id:2,bookId:2,memberId:2,issueDate:"2026-10-20",dueDate:"2026-11-03",status:"issued"},
 {id:3,bookId:4,memberId:3,issueDate:"2026-10-08",dueDate:"2026-10-22",status:"returned"}
];
function load(key,seed){try{const x=localStorage.getItem("libradesk_"+key);return x?JSON.parse(x):seed}catch{return seed}}
let books=load("books",seedBooks), members=load("members",seedMembers), transactions=load("transactions",seedTransactions);
let modalType="", editingId=null, toastTimer;
function save(){localStorage.setItem("libradesk_books",JSON.stringify(books));localStorage.setItem("libradesk_members",JSON.stringify(members));localStorage.setItem("libradesk_transactions",JSON.stringify(transactions));}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function book(id){return books.find(b=>b.id===Number(id))}
function member(id){return members.find(m=>m.id===Number(id))}
function dateFmt(d){if(!d)return "—";return new Date(d+"T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}
function initials(name){return name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase()}
function cover(i){return "c"+((i%4)+1)}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2600)}
function emptyRow(cols,msg){return `<tr><td colspan="${cols}"><div class="empty">${msg}</div></td></tr>`}
function setView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===name+"-view"));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("page-title").textContent={dashboard:"Dashboard",books:"Books",members:"Members",transactions:"Issue & Return"}[name]||"Dashboard";renderAll()}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.goto)));
function renderDashboard(){
 const total=books.reduce((n,b)=>n+b.total,0), avail=books.reduce((n,b)=>n+b.available,0), active=transactions.filter(t=>t.status==="issued").length;
 $("stat-books").textContent=books.length;$("stat-available").textContent=avail;$("stat-loans").textContent=active;$("stat-members").textContent=members.length;
 $("snapshot-percent").textContent=(total?Math.round(avail/total*100):0)+"%";$("snapshot-bar").style.width=(total?avail/total*100:0)+"%";$("snapshot-available").textContent=`${avail} / ${total}`;
 const recent=[...transactions].sort((a,b)=>b.id-a.id).slice(0,4);
 $("recent-transactions").innerHTML=recent.length?`<div class="table-wrap"><table><thead><tr><th>Book / Member</th><th>Date</th><th>Status</th></tr></thead><tbody>${recent.map(t=>{let b=book(t.bookId),m=member(t.memberId);return `<tr><td><div class="book-cell"><div class="book-cover ${cover(t.bookId)}">▤</div><div><strong>${esc(b?.title||"Deleted book")}</strong><small>${esc(m?.name||"Deleted member")}</small></div></div></td><td>${dateFmt(t.issueDate)}</td><td><span class="pill ${t.status}">${t.status==="issued"?"Issued":"Returned"}</span></td></tr>`}).join("")}</tbody></table></div>`:emptyRow(3,"No transactions yet.");
 const newest=[...books].sort((a,b)=>b.id-a.id).slice(0,4);
 $("recent-books").innerHTML=newest.length?newest.map((b,i)=>`<div class="mini-book"><div class="book-cover ${cover(i)}">▤</div><div><strong>${esc(b.title)}</strong><small>${esc(b.author)}</small></div></div>`).join(""):`<div class="empty">No books added yet.</div>`;
}
function renderBooks(){
 const q=$("book-search").value.toLowerCase(), f=$("book-filter").value;
 const list=books.filter(b=>(`${b.title} ${b.author} ${b.isbn} ${b.category}`).toLowerCase().includes(q)&&(f==="all"||(f==="available"?b.available>0:b.available===0)));
 $("book-count").textContent=`${list.length} ${list.length===1?"book":"books"} shown`;
 $("books-table").innerHTML=list.length?list.map((b,i)=>`<tr><td><div class="book-cell"><div class="book-cover ${cover(i)}">▤</div><div><strong>${esc(b.title)}</strong><small>by ${esc(b.author)}</small></div></div></td><td>${esc(b.isbn||"—")}</td><td>${esc(b.category)}</td><td><strong>${b.available}</strong> / ${b.total}</td><td><span class="pill ${b.available>0?"available":"unavailable"}">${b.available>0?"Available":"Out of stock"}</span></td><td><div class="actions"><button class="small-btn" data-edit-book="${b.id}">Edit</button><button class="small-btn" data-delete-book="${b.id}">Delete</button></div></td></tr>`).join(""):emptyRow(6,"No books match your search.");
 document.querySelectorAll("[data-edit-book]").forEach(b=>b.onclick=()=>openBookForm(Number(b.dataset.editBook)));
 document.querySelectorAll("[data-delete-book]").forEach(b=>b.onclick=()=>deleteBook(Number(b.dataset.deleteBook)));
}
function renderMembers(){
 const q=$("member-search").value.toLowerCase();
 const list=members.filter(m=>(`${m.name} ${m.email} ${m.phone}`).toLowerCase().includes(q));
 $("members-table").innerHTML=list.length?list.map((m,i)=>`<tr><td><div class="member-cell"><div class="member-avatar ${i%2?"alt":""}">${initials(m.name)}</div><div><strong>${esc(m.name)}</strong><small>ID #${m.id}</small></div></div></td><td>${esc(m.email)}</td><td>${esc(m.phone)}</td><td>${dateFmt(m.joined)}</td><td>${transactions.filter(t=>t.memberId===m.id&&t.status==="issued").length}</td><td><div class="actions"><button class="small-btn" data-edit-member="${m.id}">Edit</button><button class="small-btn" data-delete-member="${m.id}">Delete</button></div></td></tr>`).join(""):emptyRow(6,"No members match your search.");
 document.querySelectorAll("[data-edit-member]").forEach(b=>b.onclick=()=>openMemberForm(Number(b.dataset.editMember)));
 document.querySelectorAll("[data-delete-member]").forEach(b=>b.onclick=()=>deleteMember(Number(b.dataset.deleteMember)));
}
function renderTransactions(){
 const q=$("transaction-search").value.toLowerCase();
 const list=[...transactions].sort((a,b)=>b.id-a.id).filter(t=>`${book(t.bookId)?.title||""} ${member(t.memberId)?.name||""} ${t.status}`.toLowerCase().includes(q));
 $("transactions-table").innerHTML=list.length?list.map(t=>{const b=book(t.bookId),m=member(t.memberId),overdue=t.status==="issued"&&t.dueDate<new Date().toISOString().slice(0,10);return `<tr><td><div class="book-cell"><div class="book-cover ${cover(t.bookId)}">▤</div><div><strong>${esc(b?.title||"Deleted book")}</strong><small>${esc(b?.author||"")}</small></div></div></td><td>${esc(m?.name||"Deleted member")}</td><td>${dateFmt(t.issueDate)}</td><td>${dateFmt(t.dueDate)}</td><td><span class="pill ${t.status==="returned"?"returned":overdue?"overdue":"issued"}">${t.status==="returned"?"Returned":overdue?"Overdue":"Issued"}</span></td><td>${t.status==="issued"?`<button class="small-btn" data-return="${t.id}">Return book</button>`:`<span style="color:#a0a8b4">Completed</span>`}</td></tr>`}).join(""):emptyRow(6,"No transactions found.");
 document.querySelectorAll("[data-return]").forEach(b=>b.onclick=()=>returnBook(Number(b.dataset.return)));
}
function renderAll(){renderDashboard();renderBooks();renderMembers();renderTransactions()}
const backdrop=$("modal-backdrop");
function field(name,label,type="text",value="",opts=[],full=false,required=true){return `<div class="field ${full?"full":""}"><label for="f-${name}">${label}</label>${type==="select"?`<select id="f-${name}" name="${name}" ${required?"required":""}>${opts.map(o=>`<option value="${esc(o.value)}" ${String(value)===String(o.value)?"selected":""}>${esc(o.label)}</option>`).join("")}</select>`:`<input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${required?"required":""} ${type==="number"?'min="0"':''}/>`}</div>`}
function openModal(type,title,fields,editId=null){modalType=type;editingId=editId;$("modal-title").textContent=title;$("modal-fields").innerHTML=fields;backdrop.hidden=false;setTimeout(()=>$("modal-fields").querySelector("input,select")?.focus(),50)}
function closeModal(){backdrop.hidden=true;$("modal-form").reset();modalType="";editingId=null}
$("close-modal").onclick=closeModal;$("cancel-modal").onclick=closeModal;backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeModal()});
function openBookForm(id=null){const b=id?book(id):{title:"",author:"",isbn:"",category:"Fiction",total:1,available:1};openModal("book",id?"Edit Book":"Add Book",field("title","Book title","text",b.title,[],true)+field("author","Author","text",b.author)+field("isbn","ISBN (optional)","text",b.isbn,[],false,false)+field("category","Category","select",b.category,[...["Fiction","Technology","Science","Self-help","Biography","History","Finance","Education","Other"].map(x=>({value:x,label:x}))])+field("total","Total copies","number",b.total),id)}
function openMemberForm(id=null){const m=id?member(id):{name:"",email:"",phone:"",joined:new Date().toISOString().slice(0,10)};openModal("member",id?"Edit Member":"Add Member",field("name","Full name","text",m.name,[],true)+field("email","Email address","email",m.email,[],true)+field("phone","Phone number","tel",m.phone,[],true)+field("joined","Join date","date",m.joined),id)}
function openIssueForm(){const eligible=books.filter(b=>b.available>0);if(!eligible.length){toast("No available copies to issue.");return}if(!members.length){toast("Add a member before issuing a book.");return}
 openModal("issue","Issue a Book",field("bookId","Select book","select",eligible[0].id,eligible.map(b=>({value:b.id,label:`${b.title} (${b.available} available)`})),true)+field("memberId","Select member","select",members[0].id,members.map(m=>({value:m.id,label:m.name})),true)+field("issueDate","Issue date","date",new Date().toISOString().slice(0,10))+field("dueDate","Due date","date",new Date(Date.now()+14*86400000).toISOString().slice(0,10)))}
$("modal-form").addEventListener("submit",e=>{
 e.preventDefault();const fd=new FormData(e.currentTarget),v=Object.fromEntries(fd.entries());
 if(modalType==="book"){
  const total=Number(v.total);if(!Number.isInteger(total)||total<0){toast("Copies must be zero or more.");return}
  if(editingId){const old=book(editingId),borrowed=old.total-old.available;if(total<borrowed){toast("Total copies cannot be fewer than copies currently issued.");return}Object.assign(old,{title:v.title.trim(),author:v.author.trim(),isbn:v.isbn.trim(),category:v.category,total,available:total-borrowed})}
  else books.unshift({id:Math.max(0,...books.map(x=>x.id))+1,title:v.title.trim(),author:v.author.trim(),isbn:v.isbn.trim(),category:v.category,total,available:total});
  toast(editingId?"Book updated.":"Book added.");
 }else if(modalType==="member"){
  if(editingId)Object.assign(member(editingId),{name:v.name.trim(),email:v.email.trim(),phone:v.phone.trim(),joined:v.joined});
  else members.unshift({id:Math.max(0,...members.map(x=>x.id))+1,name:v.name.trim(),email:v.email.trim(),phone:v.phone.trim(),joined:v.joined});
  toast(editingId?"Member updated.":"Member added.");
 }else if(modalType==="issue"){
  const b=book(v.bookId);if(!b||b.available<1){toast("This book is no longer available.");return}if(v.dueDate<v.issueDate){toast("Due date must be on or after issue date.");return}
  b.available--;transactions.unshift({id:Math.max(0,...transactions.map(x=>x.id))+1,bookId:Number(v.bookId),memberId:Number(v.memberId),issueDate:v.issueDate,dueDate:v.dueDate,status:"issued"});toast("Book issued successfully.");
 }
 save();closeModal();renderAll();
});
function deleteBook(id){if(transactions.some(t=>t.bookId===id&&t.status==="issued")){toast("Return this book before deleting it.");return}if(!confirm("Delete this book from the collection?"))return;books=books.filter(b=>b.id!==id);save();renderAll();toast("Book deleted.");}
function deleteMember(id){if(transactions.some(t=>t.memberId===id&&t.status==="issued")){toast("This member has an active loan.");return}if(!confirm("Delete this member?"))return;members=members.filter(m=>m.id!==id);save();renderAll();toast("Member deleted.");}
function returnBook(id){const t=transactions.find(x=>x.id===id);if(!t||t.status!=="issued")return;t.status="returned";const b=book(t.bookId);if(b)b.available=Math.min(b.total,b.available+1);save();renderAll();toast("Book returned successfully.");}
$("quick-add").onclick=$("add-book").onclick=()=>openBookForm();
$("add-member").onclick=()=>openMemberForm();$("issue-book").onclick=openIssueForm;
$("book-search").addEventListener("input",renderBooks);$("book-filter").addEventListener("change",renderBooks);$("member-search").addEventListener("input",renderMembers);$("transaction-search").addEventListener("input",renderTransactions);
renderAll();
