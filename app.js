/* Trophy Hunt — prototype. Plain JS, data in localStorage. */
(function(){
const CFG = window.TH_CONFIG;
const PUBLIC = !!window.TH_PUBLIC_VIEW;
const KEY = "th_trophies_v1";
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtDate = d => { if(!d) return ""; const [y,m,dd]=d.split("-").map(Number); return new Date(y,m-1,dd).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}); };
const trophyUrl = id => CFG.BASE_URL.replace(/\/$/,"") + "/t.html?id=" + encodeURIComponent(id);

const ANTLER = `<svg viewBox="0 0 32 32" fill="none" stroke="#c79a4b" stroke-width="1.8" stroke-linecap="round"><path d="M16 27v-7M16 20c-3-1-5-4-5-8M11 12 8 6M11 12l-4 1M9.5 9 6 8M16 20c3-1 5-4 5-8M21 12l3-6M21 12l4 1M22.5 9 26 8"/><circle cx="16" cy="22" r="2.2" fill="#c79a4b" stroke="none"/></svg>`;

/* ---------- sample data (clearly labeled) ---------- */
const SAMPLES = [
 { id:"sample-elk", sample:true, hunter:"Sample Hunter", species:"Roosevelt Elk", title:"6×6 Roosevelt Bull",
   date:"2025-11-08", area:"Capitol Forest foothills, Thurston County, WA (sample)", weapon:"Rifle — .300 Win Mag (sample)",
   party:"Sample Hunter, Dad, and Uncle Ray (sample names)", score:"312 ⅝ gross (sample)", distance:"240 yards",
   photos:["photos/elk-3.jpg","photos/elk-1.jpg","photos/elk-2.jpg","photos/elk-4.jpg"],
   story:`SAMPLE STORY — this is placeholder text to show how a real story will look.\n\nWe left the truck at 4:30 in the morning with the fog still sitting low in the timber. Dad had seen fresh rubs on the old logging spur the week before, so we glassed the clear-cut at first light and waited.\n\nAround 7:15 a bull bugled from the draw below us — late in the season, which caught all of us off guard. Uncle Ray cow-called twice, and twenty minutes later six points on each side stepped out at the edge of the cut.\n\nOne shot at 240 yards. The pack-out took until dark and every one of us was soaked to the bone, but that's the hunt we'll be telling about for the rest of our lives.`
 },
 { id:"sample-blacktail", sample:true, hunter:"Sample Hunter", species:"Columbian Blacktail Deer", title:"4-Point Blacktail Buck",
   date:"2025-10-18", area:"Skookumchuck River bottoms near Tenino, WA (sample)", weapon:"Compound bow (sample)",
   party:"Sample Hunter (solo)", score:"118 ⅜ (sample)", distance:"27 yards",
   photos:["photos/deer-1.jpg","photos/deer-2.jpg","photos/deer-3.jpg"],
   story:`SAMPLE STORY — this is placeholder text to show how a real story will look.\n\nBlacktail are the ghosts of the Northwest. Three seasons I'd hunted this buck off one trail camera picture and never laid eyes on him.\n\nOn a drizzly October afternoon I slipped into a ground blind above the river crossing. Just before last light he came down the trail, stopped broadside at 27 yards, and looked right through me.\n\nI don't remember drawing the bow. I just remember the shaking afterward, and the quiet walk out under the alders.`
 }
];
const CREDITS = "Sample photos via Wikimedia Commons: Charles J. Sharp (CC BY-SA 4.0), Randalsson (CC BY-SA 4.0), Kirk Heims / USACE (public domain), U.S. Forest Service PNW (public domain), Philip Cohen (CC BY-SA 4.0), Joseph Dixon (public domain), Lianguanlun (CC BY 4.0). Sample photos are stand-ins, not the hunts described.";

function load(){
  let raw = localStorage.getItem(KEY);
  if(raw===null){ save(SAMPLES); return SAMPLES.slice(); }
  try{ return JSON.parse(raw); }catch(e){ return []; }
}
function save(list){
  try{ localStorage.setItem(KEY, JSON.stringify(list)); return true; }
  catch(e){ toast("Phone storage is full — try fewer or smaller photos."); return false; }
}
const getT = id => load().find(t=>t.id===id);

function toast(msg){ const d=document.createElement("div"); d.className="toast"; d.textContent=msg; document.body.appendChild(d); setTimeout(()=>d.remove(),2600); }

/* ---------- router ---------- */
const root = () => $("#app");
function route(){
  if(PUBLIC){ const id=new URLSearchParams(location.search).get("id"); return renderTrophy(id,true); }
  const h = location.hash.replace(/^#\/?/,"").split("/");
  window.scrollTo(0,0);
  if(h[0]==="add") return renderForm();
  if(h[0]==="edit") return renderForm(h[1]);
  if(h[0]==="t") return renderTrophy(h[1]);
  if(h[0]==="sticker") return renderSticker(h[1]);
  renderList();
}
window.addEventListener("hashchange",route);
const topbar = (back) => `<div class="topbar">${back?`<button class="iconbtn back" onclick="${back}">‹ Back</button>`:""}<div class="brand">${ANTLER}Trophy Hunt</div><div class="spacer"></div></div>`;

/* ---------- 1) list ---------- */
function renderList(){
  const list = load().sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  root().innerHTML = topbar() + `
   <div class="hero-intro"><h1>My Trophies</h1><p>Every mount has a story. Make a page for it, print a sticker, and let anyone scan it to see the hunt.</p></div>
   <div class="list">${list.length? list.map(t=>`
     <div class="tcard" onclick="location.hash='#/t/${esc(t.id)}'">
       ${t.sample?'<div class="sample-tag">Sample</div>':""}
       <div class="img" style="background-image:url('${esc(t.photos?.[0]||"")}')"></div>
       <div class="meta"><h3>${esc(t.title||t.species)}</h3><div class="sub">${esc(fmtDate(t.date))} · ${esc((t.area||"").replace(" (sample)",""))}</div></div>
       <div class="foot"><span class="chip">${esc(t.species)}</span>${t.score?`<span class="chip">${esc(t.score.replace(" (sample)",""))}</span>`:""}<span class="spacer" style="flex:1"></span>
         <button class="iconbtn" onclick="event.stopPropagation();location.hash='#/sticker/${esc(t.id)}'">▦ Sticker</button></div>
     </div>`).join("") : `<div class="empty">No trophies yet. Tap “Add a Trophy” to make your first page.</div>`}
   </div>
   <div class="fab"><button class="btn block" onclick="location.hash='#/add'">＋ Add a Trophy</button></div>`;
}

/* ---------- 2) add / edit ---------- */
let draftPhotos = [];
function renderForm(id){
  const t = id ? getT(id) : null;
  draftPhotos = t ? t.photos.slice() : [];
  const v = k => esc(t?.[k]||"");
  const polish = CFG.FEATURES.POLISH_STORY ? `<button type="button" class="btn ghost" id="polishBtn" ${CFG.FEATURES.POLISH_STORY_LIVE?"":"disabled"}>✨ Polish my story ${CFG.FEATURES.POLISH_STORY_LIVE?"":'<span class="soon">coming soon</span>'}</button>`:"";
  root().innerHTML = topbar("history.back()") + `
  <div class="hero-intro"><h1>${t?"Edit Trophy":"Add a Trophy"}</h1><p>Fill in what you know — you can always come back and add more.</p></div>
  <form class="form" id="f">
    <div class="section"><h2>Photos</h2>
      <div class="photos" id="photos"></div>
      <input type="file" id="file" accept="image/*" multiple hidden>
      <div class="hint">The first photo is the big cover photo. Tap ✕ to remove one.</div>
    </div>
    <div class="section"><h2>The Animal</h2>
      <div class="field"><label>Species</label>
        <input name="species" list="species" placeholder="e.g. Roosevelt Elk" value="${v("species")}" required>
        <datalist id="species"><option>Roosevelt Elk</option><option>Rocky Mountain Elk</option><option>Columbian Blacktail Deer</option><option>Mule Deer</option><option>Whitetail Deer</option><option>Black Bear</option><option>Cougar</option><option>Mountain Goat</option><option>Bighorn Sheep</option><option>Moose</option><option>Pronghorn</option><option>Turkey</option></datalist></div>
      <div class="field"><label>Name it (shown as the title)</label><input name="title" placeholder="e.g. 6×6 Roosevelt Bull" value="${v("title")}"></div>
      <div class="row2">
        <div class="field"><label>Score / size</label><input name="score" placeholder="e.g. 312 gross" value="${v("score")}"></div>
        <div class="field"><label>Shot distance</label><input name="distance" placeholder="e.g. 240 yards" value="${v("distance")}"></div>
      </div>
    </div>
    <div class="section"><h2>The Hunt</h2>
      <div class="row2">
        <div class="field"><label>Date</label><input type="date" name="date" value="${v("date")}"></div>
        <div class="field"><label>Hunter</label><input name="hunter" placeholder="Your name" value="${v("hunter")}"></div>
      </div>
      <div class="field"><label>Location / area</label><input name="area" placeholder="e.g. Capitol Forest, WA" value="${v("area")}"></div>
      <div class="field"><label>Weapon</label><input name="weapon" placeholder="e.g. Rifle — .300 Win Mag" value="${v("weapon")}"></div>
      <div class="field"><label>Who was there</label><input name="party" placeholder="e.g. Dad and Uncle Ray" value="${v("party")}"></div>
    </div>
    <div class="section"><h2>The Story</h2>
      <textarea name="story" id="story" placeholder="How did the day start? What happened? Who was with you?">${v("story")}</textarea>
      <div class="storybar">
        <button type="button" class="btn leather mic" id="micBtn">🎙 Tell it out loud</button>
        ${polish}
      </div>
      <div class="hint" id="micHint"></div>
    </div>
    <button class="btn block" type="submit">Save Trophy Page</button>
    ${t?`<button type="button" class="btn ghost block" id="delBtn">Delete this trophy</button>`:""}
  </form>`;
  drawPhotos();
  $("#file").onchange = e => addFiles([...e.target.files]);
  $("#f").onsubmit = e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    const list = load();
    const rec = Object.assign(t||{id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}, fd, {photos:draftPhotos});
    if(!rec.title) rec.title = rec.species;
    const i = list.findIndex(x=>x.id===rec.id); if(i>=0) list[i]=rec; else list.push(rec);
    if(save(list)){ stopMic(); location.hash="#/t/"+rec.id; }
  };
  if(t) $("#delBtn").onclick = () => { if(confirm("Delete this trophy page?")){ save(load().filter(x=>x.id!==t.id)); location.hash="#/"; } };
  setupMic();
  const pb=$("#polishBtn"); if(pb) pb.onclick=()=>toast("AI story polishing is coming soon.");
}
function drawPhotos(){
  $("#photos").innerHTML = draftPhotos.map((p,i)=>`<div class="ph" style="background-image:url('${p}')">${i===0?'<span class="star">COVER</span>':""}<button type="button" class="x" data-i="${i}">✕</button></div>`).join("")
    + `<div class="addph" id="addph"><b>＋</b>Add photos</div>`;
  $("#addph").onclick = ()=>$("#file").click();
  document.querySelectorAll(".ph .x").forEach(b=>b.onclick=()=>{ draftPhotos.splice(+b.dataset.i,1); drawPhotos(); });
}
function shrink(file){ // resize to keep phone storage happy
  return new Promise(res=>{ const r=new FileReader(); r.onload=()=>{ const img=new Image(); img.onload=()=>{
    const M=1400, s=Math.min(1,M/Math.max(img.width,img.height)); const c=document.createElement("canvas");
    c.width=Math.round(img.width*s); c.height=Math.round(img.height*s); c.getContext("2d").drawImage(img,0,0,c.width,c.height);
    res(c.toDataURL("image/jpeg",.8)); }; img.onerror=()=>res(null); img.src=r.result; }; r.readAsDataURL(file); });
}
async function addFiles(files){ for(const f of files){ const d=await shrink(f); if(d) draftPhotos.push(d); } drawPhotos(); }

/* speech-to-text */
let rec=null, recOn=false;
function setupMic(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn=$("#micBtn"), hint=$("#micHint"), ta=$("#story");
  if(!SR){ btn.onclick=()=>{ hint.textContent="This browser can't do talk-to-type. Tip: tap the box and use the 🎤 on your phone's keyboard."; }; return; }
  btn.onclick = ()=>{
    if(recOn){ stopMic(); return; }
    rec = new SR(); rec.lang="en-US"; rec.continuous=true; rec.interimResults=true;
    const base = ta.value ? ta.value.replace(/\s*$/," ") : "";
    let finalText = "";
    rec.onresult = e => { let interim=""; for(let i=e.resultIndex;i<e.results.length;i++){ const r=e.results[i]; if(r.isFinal) finalText += r[0].transcript.trim()+". "; else interim += r[0].transcript; } ta.value = base + finalText + interim; };
    rec.onerror = e => { hint.textContent = e.error==="not-allowed" ? "Microphone is blocked — allow it in your browser settings." : "Mic stopped ("+e.error+")."; };
    rec.onend = ()=>{ recOn=false; btn.classList.remove("on"); btn.innerHTML="🎙 Tell it out loud"; };
    rec.start(); recOn=true; btn.classList.add("on"); btn.innerHTML="■ Stop listening"; hint.textContent="Listening… just tell the story like you would at camp.";
  };
}
function stopMic(){ try{ rec&&rec.stop(); }catch(e){} recOn=false; }

/* ---------- 3) trophy page ---------- */
function renderTrophy(id, isPublic){
  const t = getT(id);
  if(!t){ root().innerHTML = topbar(isPublic?"":"location.hash='#/'") + `<div class="empty"><h2 class="serif">Trophy not found</h2><p>This trophy page isn't available on this device yet.<br>(Prototype: pages are only saved on the phone that made them.)</p></div>`; return; }
  const clean = s => esc((s||"").replace(/ \(sample[^)]*\)/g,""));
  const stats = [["Species",t.species],["Hunter",t.hunter],["Date",fmtDate(t.date)],["Area",t.area],["Weapon",t.weapon],["Shot",t.distance],["Score",t.score],["Hunting party",t.party]].filter(s=>s[1]);
  const paras = (t.story||"").split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("");
  const gal = (t.photos||[]).slice(1);
  root().innerHTML = (isPublic?"":topbar("location.hash='#/'")) + `
    <div class="tp-hero" style="background-image:url('${esc(t.photos?.[0]||"")}')">
      <div class="t"><div class="eyebrow">${esc(t.species)}</div><h1>${esc(t.title||t.species)}</h1><div class="sub">${esc(fmtDate(t.date))}${t.hunter?" · Taken by "+clean(t.hunter):""}</div></div>
    </div>
    ${t.sample?`<div class="sample-banner"><b>SAMPLE PAGE</b> — names, story and details are made up to show the layout. Photos are free-license stand-ins, not this hunt.</div>`:""}
    <div class="rule">The Record</div>
    <div class="stats">${stats.map(s=>`<div class="stat"><span>${s[0]}</span><span>${esc(s[1])}</span></div>`).join("")}</div>
    ${paras?`<div class="rule">The Story</div><div class="story">${paras}</div>`:""}
    ${gal.length?`<div class="rule">From the Hunt</div><div class="gallery">${gal.map(p=>`<div style="background-image:url('${esc(p)}')" data-src="${esc(p)}"></div>`).join("")}</div>`:""}
    ${isPublic?"":`<div class="tp-actions"><button class="btn" onclick="location.hash='#/sticker/${esc(t.id)}'">▦ Make Sticker</button><button class="btn ghost" onclick="location.hash='#/edit/${esc(t.id)}'">✎ Edit</button></div>`}
    ${t.sample?`<div class="credits">${CREDITS}</div>`:""}
    <div class="tp-foot">${ANTLER.replace("<svg","<svg width='22' height='22' style='vertical-align:middle'")} &nbsp;Trophy Hunt</div>`;
  document.querySelectorAll(".gallery div").forEach(d=>d.onclick=()=>{ const lb=document.createElement("div"); lb.className="lightbox"; lb.innerHTML=`<img src="${d.dataset.src}">`; lb.onclick=()=>lb.remove(); document.body.appendChild(lb); });
  document.title = (t.title||t.species)+" — Trophy Hunt";
}

/* ---------- 4) sticker ---------- */
let stickerShape = "round";
function renderSticker(id){
  const t=getT(id); if(!t) return renderTrophy(id);
  const url = trophyUrl(t.id);
  root().innerHTML = topbar("history.back()") + `
   <div class="hero-intro"><h1>QR Sticker</h1><p>Print it on sticker paper and put it by the mount. Anyone who scans it sees this trophy's page.</p></div>
   <div class="sticker-wrap">
     <div class="seg"><button data-s="round">Round</button><button data-s="rect">Rectangle</button></div>
     <canvas id="stk"></canvas>
     <div class="urlbox">Scans to: ${esc(url)}</div>
     <div class="btnrow"><button class="btn" id="dl">⬇ Save PNG</button><button class="btn leather" id="pr">🖨 Print</button></div>
     <div class="hint" style="text-align:center">Prints about 2.5" round or 3.5" wide. Weatherproof vinyl sticker paper works best.</div>
   </div>`;
  const draw=()=>{ document.querySelectorAll(".seg button").forEach(b=>b.classList.toggle("on",b.dataset.s===stickerShape)); drawSticker($("#stk"),t,url,stickerShape); };
  document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{stickerShape=b.dataset.s;draw();});
  draw();
  $("#dl").onclick=()=>{ $("#stk").toBlob(blob=>{ const a=document.createElement("a"); a.download=`trophy-hunt-${(t.title||t.species).replace(/[^a-z0-9]+/gi,"-").toLowerCase()}-${stickerShape}.png`; a.href=URL.createObjectURL(blob); document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000); },"image/png"); };
  $("#pr").onclick=()=>{ let pa=$("#printArea"); if(!pa){pa=document.createElement("div");pa.id="printArea";document.body.appendChild(pa);} pa.className=stickerShape; pa.innerHTML=`<img src="${$("#stk").toDataURL("image/png")}">`; setTimeout(()=>window.print(),150); };
}
function qrMatrix(text){ const q=qrcode(0,"Q"); q.addData(text); q.make(); const n=q.getModuleCount(); return {n,dark:(r,c)=>q.isDark(r,c)}; }
function drawQR(ctx,m,x,y,size){
  ctx.fillStyle="#f4ecdc"; roundRect(ctx,x,y,size,size,size*.06); ctx.fill();
  const pad=size*.07, cell=(size-2*pad)/m.n; ctx.fillStyle="#1c130b";
  for(let r=0;r<m.n;r++)for(let c=0;c<m.n;c++) if(m.dark(r,c)) ctx.fillRect(Math.floor(x+pad+c*cell),Math.floor(y+pad+r*cell),Math.ceil(cell),Math.ceil(cell));
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function leather(ctx,w,h){
  const g=ctx.createRadialGradient(w*.4,h*.35,10,w/2,h/2,Math.max(w,h)*.75); g.addColorStop(0,"#5b3a22"); g.addColorStop(1,"#24170d"); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  // grain
  let s=7; const rnd=()=>((s=(s*9301+49297)%233280)/233280);
  for(let i=0;i<w*h/90;i++){ ctx.fillStyle=`rgba(${rnd()<.5?"0,0,0":"255,220,170"},${rnd()*.06})`; ctx.fillRect(rnd()*w,rnd()*h,1.6,1.6); }
}
function arcText(ctx,text,cx,cy,r,mid,top){
  const chars=[...text]; const widths=chars.map(ch=>ctx.measureText(ch).width); const total=widths.reduce((a,b)=>a+b,0);
  let ang = mid - (top?1:-1)*total/r/2;
  chars.forEach((ch,i)=>{ const a=ang+(top?1:-1)*widths[i]/r/2; ctx.save(); ctx.translate(cx+r*Math.cos(a),cy+r*Math.sin(a)); ctx.rotate(a+(top?Math.PI/2:-Math.PI/2)); ctx.fillText(ch,0,0); ctx.restore(); ang+=(top?1:-1)*widths[i]/r; });
}
function drawSticker(cv,t,url,shape){
  const m=qrMatrix(url), serif='"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
  const name=(t.title||t.species).toUpperCase(), date=fmtDate(t.date);
  if(shape==="round"){
    const S=1000; cv.width=cv.height=S; const ctx=cv.getContext("2d"); ctx.clearRect(0,0,S,S);
    ctx.save(); ctx.beginPath(); ctx.arc(S/2,S/2,S/2-4,0,Math.PI*2); ctx.clip(); leather(ctx,S,S); ctx.restore();
    ctx.strokeStyle="#c79a4b"; ctx.lineWidth=14; ctx.beginPath(); ctx.arc(S/2,S/2,S/2-26,0,Math.PI*2); ctx.stroke();
    ctx.lineWidth=3; ctx.setLineDash([14,10]); ctx.beginPath(); ctx.arc(S/2,S/2,S/2-52,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="#e2bd72"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.font=`700 64px ${serif}`; arcText(ctx,"TROPHY  HUNT",S/2,S/2,S/2-100,-Math.PI/2,true);
    let fs=46; ctx.font=`700 ${fs}px ${serif}`; while(ctx.measureText(name).width>S*.95 && fs>28){fs-=2;ctx.font=`700 ${fs}px ${serif}`;}
    ctx.fillStyle="#f4ecdc"; arcText(ctx,name,S/2,S/2,S/2-100,Math.PI/2,false);
    const q=440; drawQR(ctx,m,(S-q)/2,(S-q)/2-6,q);
    ctx.fillStyle="#e9dcc3"; ctx.font=`italic 36px ${serif}`; ctx.fillText(date,S/2,S/2+q/2+48);
    ctx.fillStyle="#c79a4b"; ctx.font=`600 26px ${serif}`; ctx.fillText("◆  SCAN FOR THE STORY  ◆",S/2,S/2-q/2-42);
  } else {
    const W=1400,H=760; cv.width=W; cv.height=H; const ctx=cv.getContext("2d"); ctx.clearRect(0,0,W,H);
    ctx.save(); roundRect(ctx,4,4,W-8,H-8,60); ctx.clip(); leather(ctx,W,H); ctx.restore();
    ctx.strokeStyle="#c79a4b"; ctx.lineWidth=12; roundRect(ctx,26,26,W-52,H-52,44); ctx.stroke();
    ctx.lineWidth=3; ctx.setLineDash([14,10]); roundRect(ctx,52,52,W-104,H-104,30); ctx.stroke(); ctx.setLineDash([]);
    const q=520; drawQR(ctx,m,100,(H-q)/2,q);
    const x=690; ctx.textAlign="left"; ctx.textBaseline="alphabetic";
    ctx.fillStyle="#e2bd72"; ctx.font=`700 78px ${serif}`; ctx.fillText("TROPHY HUNT",x,220);
    ctx.fillStyle="#c79a4b"; ctx.fillRect(x,250,560,4);
    ctx.fillStyle="#f4ecdc"; let fs=58; ctx.font=`700 ${fs}px ${serif}`;
    const words=name.split(" "); let lines=[""]; words.forEach(w=>{ const tryL=(lines[lines.length-1]+" "+w).trim(); if(ctx.measureText(tryL).width>580 && lines[lines.length-1]) lines.push(w); else lines[lines.length-1]=tryL; });
    lines.slice(0,2).forEach((l,i)=>ctx.fillText(l,x,340+i*70));
    ctx.fillStyle="#e9dcc3"; ctx.font=`italic 44px ${serif}`; ctx.fillText(date,x,340+Math.min(lines.length,2)*70+20);
    ctx.fillStyle="#c79a4b"; ctx.font=`600 30px ${serif}`; ctx.fillText("◆ SCAN FOR THE STORY",x,620);
  }
}

route();
})();
