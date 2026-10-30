const $=s=>document.querySelector(s);
const KEY='vicky_gemini_key';
const MODELS=["gemini-flash-lite-latest","gemini-3.8-flash","gemini-flash-latest"];
const DAILY_MAX=10,COOLDOWN_MIN=0; // அரை மணி இடைவெளி வேண்டுமெனில் 30
const SYSTEM=`You are Vicky AI (விக்கி ஏஐ), a friendly assistant for English and Tamil. Reply in the language the user writes (Tamil script, English or Tanglish). Keep answers short, clear and truthful. If you are not sure, say so instead of guessing, and never invent facts, numbers or links. Use markdown only when it helps. If the user asks for something illegal or harmful, politely decline in one or two sentences and, if possible, offer a safe, legal alternative. When the user sends a screenshot, say exactly what you see and give numbered steps telling where to tap.`;
const FONTS={serif:"'Noto Serif Tamil',Georgia,serif",sans:"system-ui,-apple-system,'Noto Sans Tamil',Roboto,sans-serif",round:"'Nunito','Noto Sans Tamil',system-ui,sans-serif",mono:"ui-monospace,Menlo,monospace"};
const TOOLS=[
 ['smile','Cartoon image','Cartoon illustration, vibrant colours, clean bold outlines. '],
 ['grid','Pixel art','Pixel art, crisp pixels, limited palette, retro game style. '],
 ['box','3D avatar','High-quality 3D rendered character, Pixar/Roblox style, soft studio lighting. '],
 ['image','AI image',''],
 ['video','Video generator',null]
];
const P={
menu:'<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
mic:'<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>',
send:'<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
speaker:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
file:'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
video:'<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
grid:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
box:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>'
};
const ic=(n,s)=>'<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+P[n]+'</svg>';
const icons=r=>(r||document).querySelectorAll('[data-ic]').forEach(e=>{e.innerHTML=ic(e.dataset.ic,e.dataset.sz||22)});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const md=t=>window.marked?marked.parse(t):esc(t).replace(/\n/g,'<br>');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const mk=(cls,html)=>{const d=document.createElement('div');d.className=cls;if(html)d.innerHTML=html;return d};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const plain=t=>t.replace(/```[\s\S]*?```/g,' ').replace(/[#*_`>~|\[\]]/g,' ').replace(/\s+/g,' ').trim();

/* ---------- state ---------- */
let S;try{S=JSON.parse(localStorage.getItem('vicky_set'))}catch(e){}
S=Object.assign({font:'serif',size:16,ac:'#5b4df0',dark:false,wide:false,hd:false,auto:false,name:'Guest'},S||{});
let db;try{db=JSON.parse(localStorage.getItem('vicky_data'))}catch(e){}
if(!db||!db.chats)db={chats:[]};
db.cur=null;db.view='chat';
const save=()=>{try{localStorage.setItem('vicky_data',JSON.stringify(db,(k,v)=>(k==='img'||k==='imgs'||k==='atts'||(k==='gen'&&typeof v==='string'&&/^(data|blob):/.test(v)))?undefined:v))}catch(e){}};
function applySet(){
  const r=document.documentElement;
  r.style.setProperty('--ff',FONTS[S.font]||FONTS.serif);r.style.setProperty('--fs',S.size+'px');r.style.setProperty('--ac',S.ac);
  r.classList.toggle('dark',S.dark);r.classList.toggle('wide',S.wide);
  $('#pname').textContent=S.name;$('#ava').textContent=(S.name||'V')[0].toUpperCase();
  try{localStorage.setItem('vicky_set',JSON.stringify(S))}catch(e){}
}
const main=$('#main'),chat=$('#chat'),input=$('#input'),sendBtn=$('#sendBtn');
let pending=[],busy=false,mode=null;
const curChat=()=>db.chats.find(c=>c.id===db.cur);
function scroll(f){if(f||main.scrollHeight-main.scrollTop-main.clientHeight<220)main.scrollTop=main.scrollHeight}
function autosize(){input.style.height='auto';input.style.height=Math.min(input.scrollHeight,160)+'px'}
function ensureChat(t){let c=curChat();if(!c){c={id:uid(),title:(t||'Photo').slice(0,40),msgs:[]};db.chats.unshift(c);db.cur=c.id}db.view='chat';return c}

/* ---------- helpers: copy / share / download / speak ---------- */
function copyText(t){(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()})}
function dlText(t){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/plain;charset=utf-8'}));a.download='vicky-ai.txt';document.body.appendChild(a);a.click();a.remove()}
async function dlImage(u,name){try{const b=await (await fetch(u)).blob();const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name||'vicky-ai.png';document.body.appendChild(a);a.click();a.remove()}catch(e){window.open(u,'_blank')}}
function shareText(t){if(navigator.share)navigator.share({text:t}).catch(()=>{});else{copyText(t);alert('Copy ஆகிவிட்டது')}}
async function shareFile(u){try{const b=await (await fetch(u)).blob();const f=new File([b],'vicky.'+(b.type.split('/')[1]||'png'),{type:b.type});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(e){}alert('முதலில் Download செய்து பகிரவும்')}
let spBtn=null;
function speak(text,btn){
  const s=window.speechSynthesis;if(!s)return;
  const same=btn&&spBtn===btn&&s.speaking;s.cancel();if(spBtn)spBtn.classList.remove('on');spBtn=null;if(same)return;
  const p=plain(text),u=new SpeechSynthesisUtterance(p);u.lang=/[\u0B80-\u0BFF]/.test(p)?'ta-IN':'en-US';
  u.onend=u.onerror=()=>{if(btn)btn.classList.remove('on')};
  if(btn){btn.classList.add('on');spBtn=btn}
  s.speak(u);
}
function say(text){return new Promise(res=>{const s=window.speechSynthesis;if(!s){res();return}s.cancel();const p=plain(text),u=new SpeechSynthesisUtterance(p);u.lang=/[\u0B80-\u0BFF]/.test(p)?'ta-IN':'en-US';u.onend=u.onerror=()=>res();s.speak(u)})}

/* ---------- messages ---------- */
function hold(el,fn){let t;const s=()=>{t=setTimeout(fn,500)},c=()=>clearTimeout(t);el.addEventListener('touchstart',s,{passive:true});['touchend','touchmove','touchcancel'].forEach(e=>el.addEventListener(e,c));el.addEventListener('contextmenu',e=>{e.preventDefault();fn()})}
function actBtn(n,l,f){const b=document.createElement('button');b.className='ib';b.title=l;b.setAttribute('aria-label',l);b.innerHTML=ic(n,18);b.onclick=()=>f(b);return b}
function addUser(m,i){
  const w=mk('msg user','<div class="ubub"></div>'),b=w.firstChild;
  b.textContent=(m.nimg&&!(m.imgs&&m.imgs.length)?'['+m.nimg+' attachment] ':'')+m.t;
  (m.imgs||[]).forEach(u=>{const im=new Image();im.src=u;im.className='thumb';b.appendChild(im)});
  hold(w,()=>openSheet('user',m,i));chat.appendChild(w);
}
function addAI(m,i){
  const w=mk('msg ai','<div class="abody"></div><div class="acts"></div>'),body=w.firstChild,acts=w.lastChild;
  const o={dots(){body.innerHTML='<span class="dots"><span></span><span></span><span></span></span>'},set(t){body.innerHTML=md(t);scroll()}};
  if(m.loading)o.dots();
  else if(m.gen){body.innerHTML='<img class="gen" src="'+esc(m.gen)+'" alt="">';acts.append(actBtn('download','Download',()=>dlImage(m.gen)),actBtn('share','Share',()=>shareFile(m.gen)))}
  else{body.innerHTML=md(m.t);if(!m.err)acts.append(actBtn('speaker','Speak',b=>speak(m.t,b)),actBtn('copy','Copy',()=>copyText(m.t)),actBtn('download','Download',()=>dlText(m.t)),actBtn('share','Share',()=>shareText(m.t)))}
  if(!m.loading)hold(body,()=>openSheet('ai',m,i));
  chat.appendChild(w);scroll(true);return o;
}
function showSheet(){$('#sheet').style.display='block';$('#scrim').style.display='block'}
function closeAll(){$('#sheet').style.display='none';$('#plusPop').style.display='none';$('#drawer').classList.remove('open');$('#scrim').style.display='none'}
function openSheet(kind,m,i){
  const s=$('#sheet'),o=[];
  if(kind==='user')o.push(['edit','Edit',()=>editMsg(i)]);
  if(m.t){o.push(['copy','Copy',()=>copyText(m.t)],['share','Share',()=>shareText(m.t)]);if(kind==='ai'&&!m.err)o.push(['speaker','Speak',()=>speak(m.t,null)],['download','Download',()=>dlText(m.t)])}
  s.innerHTML='';o.forEach(([ik,l,f])=>{const b=document.createElement('button');b.className='o';b.innerHTML=ic(ik,20)+'<span>'+l+'</span>';b.onclick=()=>{closeAll();f()};s.append(b)});
  showSheet();
}
function editMsg(i){const c=curChat();input.value=c.msgs[i].t;c.msgs.splice(i);save();render();autosize();input.focus()}
function render(){
  const c=curChat(),has=c&&c.msgs.length;
  $('#vpage').style.display=db.view==='video'?'block':'none';
  $('#welcome').style.display=(db.view==='chat'&&!has)?'flex':'none';
  chat.style.display=(db.view==='chat'&&has)?'block':'none';
  $('#ttl').textContent=db.view==='video'?'Video':'Vicky AI';
  chat.innerHTML='';
  if(db.view==='chat'&&has)c.msgs.forEach((m,i)=>m.r==='user'?addUser(m,i):addAI(m,i));
  scroll(true);
}

/* ---------- drawer ---------- */
function item(label,icon,go,del,badge){
  const d=mk('it'),b=document.createElement('button');b.className='lab';
  b.innerHTML=(icon?'<span style="color:var(--mute);display:flex">'+ic(icon,20)+'</span>':'')+'<span class="t"></span>'+(badge?'<span class="badge">'+badge+'</span>':'');
  b.querySelector('.t').textContent=label;b.onclick=go;d.append(b);
  if(del){const x=document.createElement('button');x.className='ib';x.innerHTML=ic('trash',16);x.onclick=e=>{e.stopPropagation();del()};d.append(x)}
  return d;
}
function renderTools(){const T=$('#tools');T.innerHTML='';TOOLS.forEach(([i,l,pre])=>T.append(item(l,i,()=>{closeAll();if(pre===null){db.view='video';render();return}db.view='chat';setMode({name:l,prefix:pre});render();input.focus()},null,pre===null?'Beta':'')))}
function renderList(){const L=$('#chatList');L.innerHTML='';db.chats.slice(0,60).forEach(c=>L.append(item(c.title,null,()=>{db.cur=c.id;db.view='chat';closeAll();render()},()=>{if(confirm('இந்த chat-ஐ நீக்கவா?')){db.chats=db.chats.filter(x=>x.id!==c.id);if(db.cur===c.id)db.cur=null;save();render();renderList()}})))}
function newChat(){db.cur=null;db.view='chat';setMode(null);closeAll();render()}
function setMode(m){mode=m;const t=$('#modeTag');t.style.display=m?'block':'none';t.innerHTML=m?esc(m.name)+' — விவரிக்கவும் அல்லது photo சேர்க்கவும் &nbsp;<a href="#" id="mx" style="color:var(--mute)">✕</a>':'';if(m)$('#mx').onclick=e=>{e.preventDefault();setMode(null)};input.placeholder=m?'What should I create?':'Ask anything'}

/* ---------- settings ---------- */
function openSettings(){
  closeAll();const s=$('#sheet');
  s.innerHTML=`<h3>Settings</h3><div class="set">
  <label>Name</label><input type="text" id="sName">
  <label>Font</label><select id="sFont"><option value="serif">Serif (default)</option><option value="sans">Simple</option><option value="round">Rounded</option><option value="mono">Mono</option></select>
  <label>Text size</label><input type="range" id="sSize" min="14" max="22">
  <label>Colour</label><div class="sw" id="sSw"></div>
  <label>Theme</label><select id="sTheme"><option value="0">Light</option><option value="1">Dark</option></select>
  <label>Layout</label><select id="sWide"><option value="0">Phone</option><option value="1">Wide (desktop)</option></select>
  <label>Image quality</label><select id="sHd"><option value="0">Standard</option><option value="1">HD (uses more credits)</option></select>
  <label>Read replies aloud</label><select id="sAuto"><option value="0">Off</option><option value="1">On</option></select>
  <label>Gemini API key</label><input type="password" id="sKey" placeholder="Paste key">
  <label>Account</label><div style="padding:0 6px"><button class="btn g" id="sAcc">Switch account</button></div>
  <div style="display:flex;gap:8px;margin:18px 6px 4px"><button class="btn" id="sSave">Save</button><button class="btn g" id="sClr">Clear chats</button></div></div>`;
  $('#sName').value=S.name;$('#sFont').value=S.font;$('#sSize').value=S.size;$('#sTheme').value=S.dark?'1':'0';$('#sWide').value=S.wide?'1':'0';$('#sHd').value=S.hd?'1':'0';$('#sAuto').value=S.auto?'1':'0';$('#sKey').value=localStorage.getItem(KEY)||'';
  let col=S.ac;const sw=$('#sSw');
  ['#5b4df0','#2563eb','#0d9488','#16a34a','#ea580c','#db2777','#111827'].forEach(c=>{const d=document.createElement('span');d.style.background=c;if(c===col)d.className='on';d.onclick=()=>{col=c;[...sw.children].forEach(x=>x.className='');d.className='on'};sw.append(d)});
  $('#sSave').onclick=()=>{S={...S,name:$('#sName').value.trim()||'Guest',font:$('#sFont').value,size:+$('#sSize').value,ac:col,dark:$('#sTheme').value==='1',wide:$('#sWide').value==='1',hd:$('#sHd').value==='1',auto:$('#sAuto').value==='1'};const k=$('#sKey').value.trim();if(k)localStorage.setItem(KEY,k);applySet();closeAll()};
  $('#sClr').onclick=()=>{if(confirm('எல்லா chats-ஐயும் நீக்கவா?')){db.chats=[];db.cur=null;save();render();renderList();closeAll()}};
  $('#sAcc').onclick=async()=>{try{await puter.auth.signOut();await puter.auth.signIn();const u=await puter.auth.getUser();if(u&&u.username){S.name=u.username;applySet()}}catch(e){alert('Sign in முடியவில்லை')}};
  showSheet();
}

/* ---------- Gemini chat ---------- */
function nowLine(){const d=new Date();return 'Today is '+d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'. Your training knowledge may be outdated and the real date is later than your training data. Never tell the user it is an earlier year, and never say a version number or date from the user is impossible. For latest versions, news or prices: use search if available, otherwise say you cannot verify it and tell what you last knew.\n\n'}
let useSearch=true;
async function stream(model,key,sys,contents,onChunk){
  const url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':streamGenerateContent?alt=sse';
  const body={systemInstruction:{parts:[{text:sys}]},contents};
  if(useSearch)body.tools=[{google_search:{}}];
  const go=()=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body)});
  let r=await go();
  if(!r.ok&&useSearch&&[400,403,429].includes(r.status)){useSearch=false;delete body.tools;r=await go()}
  if(!r.ok){let m='';try{m=(await r.json()).error.message}catch(e){}const e=new Error(m||'HTTP '+r.status);e.status=r.status;throw e}
  const rd=r.body.getReader(),dec=new TextDecoder();let buf='',full='';
  for(;;){
    const {done,value}=await rd.read();if(done)break;
    buf+=dec.decode(value,{stream:true});const ls=buf.split('\n');buf=ls.pop();
    for(const l of ls){
      if(!l.startsWith('data:'))continue;const j=l.slice(5).trim();if(!j)continue;
      try{const d=JSON.parse(j);const ps=(d.candidates&&d.candidates[0]&&d.candidates[0].content&&d.candidates[0].content.parts)||[];for(const p of ps)if(p.text&&!p.thought){full+=p.text;onChunk(full)}}catch(e){}
    }
  }
  return full;
}
function hist(c){
  const out=[],ms=c.msgs.filter(m=>!m.err&&!m.gen).slice(-24);
  ms.forEach((m,i)=>{
    const role=m.r==='user'?'user':'model',last=i===ms.length-1,parts=[];
    if(last&&m.atts)m.atts.forEach(a=>parts.push(a.data?{inlineData:{mimeType:a.mimeType,data:a.data}}:{text:a.text}));
    parts.push({text:m.t+(m.nimg&&!(last&&m.atts)?' [attachment sent]':'')});
    const pv=out[out.length-1];
    if(pv&&pv.role===role)pv.parts.push(...parts);else out.push({role,parts});
  });
  while(out.length&&out[0].role!=='user')out.shift();
  return out;
}
async function gen(c,extra,onChunk){
  const key=localStorage.getItem(KEY),sys=nowLine()+SYSTEM+(extra||''),contents=hist(c);
  let reply='',bad=false;
  outer:for(const m of MODELS){for(let a=0;a<3;a++){
    try{reply=await stream(m,key,sys,contents,onChunk||(()=>{}));if(reply)break outer;throw new Error('empty')}
    catch(e){if(e.status===401||e.status===403||/api key/i.test(e.message)){bad=true;break outer}if(e.status===404)break;await sleep(1500*(a+1))}
  }}
  return {reply,bad};
}
async function chatReply(c){
  const o=addAI({loading:true});
  const {reply,bad}=await gen(c,'',t=>o.set(t));
  if(reply){c.msgs.push({r:'ai',t:reply});if(S.auto)say(reply)}
  else c.msgs.push({r:'ai',err:true,t:bad?'API key சரியாக இல்லை. Settings-ல் சரிபார்க்கவும்.':'Vicky AI இப்போது கொஞ்சம் busy. சில நொடிகள் கழித்து மீண்டும் அனுப்புங்கள்.'});
}

/* ---------- images ---------- */
function quota(){let q;try{q=JSON.parse(localStorage.getItem('vicky_imgq'))}catch(e){}const d=new Date().toDateString();return(q&&q.d===d)?q:{d,n:0,t:0}}
function quotaCheck(){const q=quota();if(q.n>=DAILY_MAX)return 'இன்றைய '+DAILY_MAX+' படங்கள் முடிந்துவிட்டன. நாளை மீண்டும் முயற்சிக்கவும்.';const w=q.t+COOLDOWN_MIN*60000-Date.now();return(q.t&&w>0)?'அடுத்த படத்துக்கு இன்னும் '+Math.ceil(w/60000)+' நிமிடம் காத்திருக்கவும்.':''}
function quotaUse(){const q=quota();q.n++;q.t=Date.now();try{localStorage.setItem('vicky_imgq',JSON.stringify(q))}catch(e){}}
async function puterImage(prompt,att,hd){
  const models=hd?['gemini-3-pro-image-preview','gemini-2.5-flash-image-preview']:['gemini-2.5-flash-image-preview','gemini-3-pro-image-preview'];
  let last='';
  for(const model of models){
    try{
      const opt={model,provider:'gemini'};
      if(att){opt.input_image=att.data;opt.input_image_mime_type=att.mimeType}
      const el=await puter.ai.txt2img(prompt,opt),s=el&&el.src;
      if(!s)throw new Error('no image');
      return URL.createObjectURL(await (await fetch(s)).blob());
    }catch(e){last=(e&&(e.message||(e.error&&e.error.message)))||JSON.stringify(e)||'failed';if(/auth|cancel|sign/i.test(last))break}
  }
  throw new Error(last);
}
async function toEnglish(text){  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+MODELS[0]+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':localStorage.getItem(KEY)},body:JSON.stringify({contents:[{role:'user',parts:[{text:'Rewrite as one detailed English image prompt. Output only the prompt:\n'+text}]}]})});
  const d=await r.json();return d.candidates[0].content.parts.map(p=>p.text||'').join('').trim();
}
async function makeImage(c,prompt,atts){
  const bl=quotaCheck();if(bl){c.msgs.push({r:'ai',err:true,t:bl});return}
  addAI({loading:true});
  const att=atts.find(a=>a.data&&a.mimeType.startsWith('image/'));
  const full=(mode?mode.prefix:'')+(att?'Edit the attached photo as requested. Keep the same face, hairstyle, skin tone and outfit recognisable. Request: ':'')+prompt+'. Sharp, clean, high resolution, no pixelation.';
  let src='',err='';
  if(window.puter){try{src=await puterImage(full,att,S.hd)}catch(e){err=(e&&e.message)||String(e)}}else err='Puter load ஆகவில்லை';
  if(src){quotaUse();c.msgs.push({r:'ai',t:'[படம்] '+prompt,gen:src});setMode(null);return}
  c.msgs.push({r:'ai',err:true,t:'Puter மூலம் முடியவில்லை ('+err.slice(0,80)+'). இலவச மாற்று முறை முயற்சிக்கப்படுகிறது.'});
  let p=full;try{p=await toEnglish(full)}catch(e){}
  const url='https://image.pollinations.ai/prompt/'+encodeURIComponent(p.slice(0,700))+'?width=768&height=768&nologo=true&seed='+Math.floor(Math.random()*1e6);
  const ok=await new Promise(res=>{const im=new Image();im.onload=()=>res(true);im.onerror=()=>res(false);im.src=url;setTimeout(()=>res(false),90000)});
  c.msgs.push(ok?{r:'ai',t:'[படம்] '+prompt,gen:url}:{r:'ai',err:true,t:'படம் உருவாக்க முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.'});
  if(ok)setMode(null);
}

/* ---------- video ---------- */
$('#vGo').onclick=async()=>{
  const p=$('#vPrompt').value.trim(),out=$('#vOut');if(!p)return;
  if(!window.puter){out.textContent='Puter load ஆகவில்லை. Page-ஐ refresh செய்யவும்.';return}
  out.innerHTML='<span class="dots"><span></span><span></span><span></span></span> வீடியோ உருவாகிறது... (1-3 நிமிடம் ஆகலாம்)';
  try{
    const v=await (($('#vTest').checked)?puter.ai.txt2vid(p,true):puter.ai.txt2vid(p,{model:$('#vModel').value}));
    out.innerHTML='';v.controls=true;v.style.maxWidth='100%';v.style.borderRadius='14px';out.append(v);
    const b=document.createElement('button');b.className='btn g';b.style.marginTop='10px';b.textContent='Download';b.onclick=()=>dlImage(v.src,'vicky-video.mp4');out.append(b);
  }catch(e){out.textContent='முடியவில்லை: '+((e&&(e.message||(e.error&&e.error.message)))||JSON.stringify(e)).slice(0,200)}
};
/* ---------- attachments ---------- */
const fileIn=document.createElement('input');fileIn.type='file';fileIn.style.display='none';document.body.appendChild(fileIn);
const readURL=f=>new Promise(r=>{const d=new FileReader();d.onload=()=>r(d.result);d.readAsDataURL(f)});
async function readImg(f){
  const u=await readURL(f);
  return new Promise(r=>{const im=new Image();im.onload=()=>{const s=Math.min(1,1280/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);const x=cv.toDataURL('image/jpeg',.82);r({mimeType:'image/jpeg',data:x.split(',')[1],preview:x})};im.src=u});
}
async function addFiles(fs){
  for(const f of fs){
    if(pending.length>=4)break;
    if(f.type.startsWith('image/'))pending.push(await readImg(f));
    else if(f.type==='application/pdf'){const u=await readURL(f);pending.push({mimeType:'application/pdf',data:u.split(',')[1],name:f.name})}
    else pending.push({text:'['+f.name+']\n'+(await f.text()).slice(0,20000),name:f.name});
  }
  showPreview();
}
function showPreview(){
  const p=$('#preview');p.innerHTML='';p.style.display=pending.length?'flex':'none';
  pending.forEach((a,i)=>{const d=mk('pv');d.innerHTML=a.preview?'<img src="'+a.preview+'">':'<div style="padding:18px 12px;background:var(--soft);border-radius:10px;font-size:.8em">'+esc(a.name||'file')+'</div>';const x=document.createElement('button');x.textContent='×';x.onclick=()=>{pending.splice(i,1);showPreview()};d.append(x);p.append(d)});
}
function pick(acc,cam,multi){fileIn.accept=acc;fileIn.multiple=multi;if(cam)fileIn.setAttribute('capture','environment');else fileIn.removeAttribute('capture');fileIn.click()}
fileIn.onchange=()=>{addFiles([...fileIn.files]);fileIn.value=''};
$('#plusBtn').onclick=()=>{
  const pop=$('#plusPop');pop.innerHTML='';
  [['image','Photos',()=>pick('image/*',false,true)],['camera','Camera',()=>pick('image/*',true,false)],['file','Files (PDF / text)',()=>pick('application/pdf,text/*,.md,.csv,.json',false,true)],['smile','Create image',()=>{setMode({name:'AI image',prefix:''});input.focus()}]]
  .forEach(([i,l,f])=>{const b=document.createElement('button');b.innerHTML=ic(i,20)+'<span>'+l+'</span>';b.onclick=()=>{closeAll();f()};pop.append(b)});
  const r=$('#plusBtn').getBoundingClientRect();pop.style.left=Math.max(8,r.left)+'px';pop.style.bottom=(innerHeight-r.top+8)+'px';pop.style.display='block';$('#scrim').style.display='block';
};

/* ---------- send ---------- */
async function send(){
  if(busy)return;
  const text=input.value.trim();
  if(!text&&!pending.length)return;
  if(!localStorage.getItem(KEY)&&!mode){openSettings();return}
  if(recog){recog.onresult=null;recog.onend=null;try{recog.abort()}catch(e){}micOff()}
  busy=true;sendBtn.disabled=true;
  const c=ensureChat(text);
  const atts=pending.filter(a=>a.data||a.text);pending=[];showPreview();
  const um={r:'user',t:text||'இந்த screenshot-ல் என்ன பிரச்சினை? நான் எங்கே என்ன செய்ய வேண்டும்?',imgs:atts.map(a=>a.preview).filter(Boolean),nimg:atts.length,atts};
  c.msgs.push(um);input.value='';autosize();save();render();renderList();
  try{if(mode)await makeImage(c,um.t,atts);else await chatReply(c)}catch(e){}
  save();render();renderList();busy=false;sendBtn.disabled=false;
}
sendBtn.onclick=send;
input.addEventListener('input',autosize);
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!matchMedia('(pointer:coarse)').matches){e.preventDefault();send()}});
  /* ---------- mic (speech to text) ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let recog=null,rec=false;
function micOff(){rec=false;$('#micBtn').style.color=''}
$('#micBtn').onclick=()=>{
  if(!SR){alert('Chrome-ல் மட்டுமே voice வசதி');return}
  if(rec){recog.stop();return}
  recog=new SR();recog.lang='ta-IN';recog.interimResults=true;recog.continuous=true;
  const base=input.value;
  recog.onstart=()=>{rec=true;$('#micBtn').style.color='#ef4444'};
  recog.onresult=e=>{let f='',t='';for(let i=0;i<e.results.length;i++){if(e.results[i].isFinal)f+=e.results[i][0].transcript;else t+=e.results[i][0].transcript}input.value=(base?base+' ':'')+f+t;autosize()};
  recog.onend=micOff;recog.onerror=micOff;recog.start();
};

/* ---------- live voice ---------- */
let liveOn=false,lr=null;
const orb=(c,t)=>{$('#orb').className=c;$('#liveTxt').textContent=t||''};
function liveListen(){
  if(!liveOn)return;orb('listen','Listening...');
  let txt='';lr=new SR();lr.lang='ta-IN';lr.interimResults=true;lr.continuous=false;
  lr.onresult=e=>{txt='';for(let i=0;i<e.results.length;i++)txt+=e.results[i][0].transcript;$('#liveTxt').textContent=txt};
  lr.onend=()=>{if(!liveOn)return;if(txt.trim())liveAsk(txt.trim());else setTimeout(liveListen,300)};
  lr.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){liveOn=false;$('#live').style.display='none';alert('Mic permission கொடுக்கவும்')}};
  try{lr.start()}catch(e){}
}
async function liveAsk(text){
  orb('think','Thinking...');
  const c=ensureChat(text);c.msgs.push({r:'user',t:text});
  const {reply}=await gen(c,'\nThis is a live voice call: answer in at most 3 short sentences.');
  if(!liveOn)return;
  const out=reply||'மன்னிக்கவும், இப்போது பதில் சொல்ல முடியவில்லை.';
  c.msgs.push({r:'ai',t:out});save();
  orb('speak',out);await say(out);liveListen();
}
$('#liveBtn').onclick=()=>{
  if(!SR){alert('Chrome-ல் மட்டுமே live voice');return}
  if(!localStorage.getItem(KEY)){openSettings();return}
  liveOn=true;$('#live').style.display='flex';liveListen();
};
$('#liveEnd').onclick=()=>{liveOn=false;try{lr.abort()}catch(e){}try{speechSynthesis.cancel()}catch(e){}$('#live').style.display='none';render();renderList()};

/* ---------- wiring ---------- */
$('#menuBtn').onclick=()=>{$('#drawer').classList.add('open');$('#scrim').style.display='block'};
$('#scrim').onclick=closeAll;
$('#newBtn').onclick=newChat;
$('#profBtn').onclick=openSettings;
[['Python கற்றுக்கொடு',()=>{input.value='Python-ஐ ஆரம்பத்திலிருந்து எளிமையாகக் கற்றுக்கொடு';input.focus();autosize()}],
 ['ஒரு படம் உருவாக்கு',()=>{setMode({name:'AI image',prefix:''});input.focus()}],
 ['படிக்க உதவு',()=>{input.value='நான் படிக்கும் பாடத்தை எளிமையாகப் புரிய வை: ';input.focus();autosize()}],
 ['Photo-வை 3D ஆக்கு',()=>{setMode({name:'3D avatar',prefix:TOOLS[2][2]});pick('image/*',false,false)}]
].forEach(([t,f])=>{const b=document.createElement('button');b.className='sug';b.textContent=t;b.onclick=f;$('#sugs').append(b)});
window.addEventListener('error',e=>{const b=document.createElement('div');b.style.cssText='position:fixed;top:0;left:0;right:0;background:#fee2e2;color:#991b1b;padding:8px;font-size:12px;z-index:99';b.textContent='Error: '+e.message;document.body.appendChild(b)});
icons();applySet();renderTools();renderList();render();
