/* Trophy Hunt — prototype. Plain JS, data in localStorage. */
(function(){
const CFG = window.TH_CONFIG;
const PUBLIC = !!window.TH_PUBLIC_VIEW;
const KEY = "th_trophies_v1";
const $ = (s,el=document)=>el.querySelector(s);
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtDate = d => { if(!d) return ""; const [y,m,dd]=d.split("-").map(Number); return new Date(y,m-1,dd).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}); };
const trophyUrl = id => CFG.BASE_URL.replace(/\/$/,"") + "/t.html?id=" + encodeURIComponent(id);

const FISH = `<svg viewBox="0 0 32 32" fill="none" stroke="#c79a4b" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M3 16c4-6.5 12-8.5 19-3.5l6-4.5v16l-6-4.5C15 24.5 7 22.5 3 16z"/><path d="M13 11.5c1.5 3 1.5 6 0 9"/><circle cx="8" cy="14.6" r="1.4" fill="#c79a4b" stroke="none"/></svg>`;
const CAM = `<svg viewBox="0 0 32 32" fill="none" stroke="#c79a4b" stroke-width="1.8" stroke-linejoin="round"><rect x="7" y="5" width="18" height="23" rx="3"/><circle cx="16" cy="14" r="4.5"/><circle cx="16" cy="14" r="1.5" fill="#c79a4b" stroke="none"/><path d="M11 23h3M18 23h3"/><path d="M4 10v10M28 10v10" stroke-linecap="round"/></svg>`;
const ICON_PATH = { hunt:"M16 27v-7M16 20c-3-1-5-4-5-8M11 12 8 6M11 12l-4 1M9.5 9 6 8M16 20c3-1 5-4 5-8M21 12l3-6M21 12l4 1M22.5 9 26 8", fish:"M3 16c4-6.5 12-8.5 19-3.5l6-4.5v16l-6-4.5C15 24.5 7 22.5 3 16z" };
const sparks = n => Array.from({length:n},(_,i)=>`<i style="left:${(i*37+11)%100}%;top:${(i*53+7)%90}%;animation-delay:${((i*0.37)%2.6).toFixed(2)}s"></i>`).join("");
const kindOf = t => t && t.kind==="fish" ? "fish" : "hunt";
const ANTLER = `<svg viewBox="0 0 32 32" fill="none" stroke="#c79a4b" stroke-width="1.8" stroke-linecap="round"><path d="M16 27v-7M16 20c-3-1-5-4-5-8M11 12 8 6M11 12l-4 1M9.5 9 6 8M16 20c3-1 5-4 5-8M21 12l3-6M21 12l4 1M22.5 9 26 8"/><circle cx="16" cy="22" r="2.2" fill="#c79a4b" stroke="none"/></svg>`;

/* ---------- sample data (clearly labeled) ---------- */
const SAMPLES = [
 { id:"sample-elk", sample:true, v:3, aiCover:true, heroPos:"62% 40%", badge:"Monster Bull", hunter:"Sample Hunter", species:"Rocky Mountain Elk", title:"“Big Thunder” 8×8 Monster Bull",
   date:"2025-10-24", area:"Blue Mountains backcountry, Columbia County, WA (sample)", weapon:"Compound bow — 70 lb (sample)",
   party:"Sample Hunter, Dad, and Uncle Ray (sample names)", score:"431 ⅞ gross (sample)", distance:"34 yards",
   photos:["photos/bigbull-hero.jpg","photos/bigbull-1.jpg","photos/bigbull-2.jpg","photos/bigbull-3.jpg"],
   story:`SAMPLE STORY — this is placeholder text to show how a real story will look.\n\nWe'd been chasing one bull for three seasons. Uncle Ray called him "Big Thunder" because you didn't hear his bugle so much as feel it in your chest. Trail cams showed a rack so wide it didn't look real.\n\nLast week of the late rut we hiked in by headlamp, eight miles up the ridge. At first light he screamed from the dark timber below us, close enough that Dad grabbed my arm. Ray cow-called once. The whole hillside went quiet.\n\nThen the brush started breaking. Eight points on each side, ivory tips glowing in the sunrise, steam pouring off his back. He stepped out at 34 yards and stopped broadside like he owned the mountain.\n\nI don't remember drawing. I remember the shaking, Dad hugging me, and Ray saying "boys, that's the bull of a lifetime." 431 ⅞ inches. Took us two days to pack him out, and every step was worth it.`
 },
 { id:"sample-blacktail", sample:true, v:2, aiCover:true, heroPos:"60% 40%", badge:"Giant Buck", hunter:"Sample Hunter", species:"Columbian Blacktail Deer", title:"“Old Mossback” Giant 5×5 Blacktail",
   date:"2025-10-18", area:"Doty Hills timber near Pe Ell, Lewis County, WA (sample)", weapon:"Rifle — .270 Win (sample)",
   party:"Sample Hunter (solo)", score:"171 ⅜ gross (sample)", distance:"62 yards",
   photos:["photos/bigbuck-hero.jpg","photos/deer-1.jpg","photos/deer-2.jpg","photos/deer-3.jpg"],
   story:`SAMPLE STORY — this is placeholder text to show how a real story will look.\n\nBlacktail are the ghosts of the Northwest, and this one was the king ghost. Four years of trail cam pictures, always at 2 a.m., always that same heavy, chocolate-colored rack. We called him "Old Mossback" because he looked like he grew out of the timber.\n\nOpening weekend the rain came in sideways. I sat a mossy old-growth bench above a fern draw from dark until noon and never saw a hair. Then the wind switched, and a branch snapped below me.\n\nHe ghosted out of the ferns at 62 yards — five long points a side, beams as thick as my wrist, the biggest blacktail I've ever seen alive. One shot from the .270 and the woods went silent.\n\nI just sat down in the moss next to him and shook. 171 ⅜ inches. Bucks like that come once in a lifetime, and around here, they don't come at all.`
 },
 ,
 { id:"sample-steelhead", sample:true, v:2, aiCover:true, heroFit:"wide", kind:"fish", hunter:"Sample Angler", species:"Winter Steelhead", title:"Skagit River Chrome Buck",
   date:"2026-01-17", area:"Skagit River near Rockport, WA (sample)", weight:"14 lb 6 oz", length:"34 in", lure:"Pink rubber worm under a float (sample)",
   party:"Sample Angler and Grandpa (sample names)",
   photos:["photos/steelhead-hero.jpg","photos/fish-1.jpg","photos/fish-3.jpg","photos/fish-2.jpg"],
   story:`SAMPLE STORY — this is placeholder text to show how a real story will look.\n\nWe put the drift boat in at first light with ice on the oarlocks. Grandpa said the river was "just right" — that green color he's been chasing for fifty winters.\n\nThird drift through the tailout the float went down hard. She ran straight downstream and jumped twice, bright as a new dime, and for ten minutes all I could hear was the reel and Grandpa laughing.\n\nWe got one quick photo and she swam back strong. I'll never forget that fish.`
 }
];
const CAM_SAMPLES = [
 { id:"cam-s1", sample:true, species:"Blacktail Buck", sex:"Buck", points:"4×4", camera:"Creek Crossing Cam", location:"Lower creek crossing, north fence line (sample)", date:"2025-11-08", time:"19:16", photos:["photos/cam-1.jpg"], notes:"SAMPLE — Same 4-point we saw in October. Moving after dark during the rut; wide left side. Worth sitting the crossing at last light." },
 { id:"cam-s2", sample:true, species:"Coyote", sex:"", points:"", camera:"Creek Crossing Cam", location:"Lower creek crossing, north fence line (sample)", date:"2025-11-02", time:"09:42", photos:["photos/cam-5.jpg"], notes:"SAMPLE — Coyote working the crossing mid-morning." },
 { id:"cam-s3", sample:true, species:"Elk", sex:"Cow", points:"", camera:"Ridge Saddle Cam", location:"Saddle between the two clear-cuts (sample)", date:"2025-10-29", time:"07:05", photos:["photos/cam-2.jpg"], notes:"SAMPLE — Cow elk at first light. Bulls usually follow a day or two behind." },
 { id:"cam-s4", sample:true, species:"Black Bear", sex:"", points:"", camera:"Ridge Saddle Cam", location:"Saddle between the two clear-cuts (sample)", date:"2025-06-07", time:"05:50", photos:["photos/cam-3.jpg"], notes:"SAMPLE — Big boar, early morning. Hitting the saddle every few days in June." }
];
const CREDITS = "Sample cover photos of the hunter with the bull elk, the hunter with the blacktail buck, and the angler with the steelhead are AI-generated illustrations, not real people or animals. Other sample photos via Wikimedia Commons: Grand Teton NPS and Yellowstone National Park (public domain), Charles J. Sharp (CC BY-SA 4.0), Randalsson (CC BY-SA 4.0), Kirk Heims / USACE (public domain), U.S. Forest Service PNW (public domain), Philip Cohen (CC BY-SA 4.0), Joseph Dixon (public domain), Lianguanlun (CC BY 4.0), Ryan Hagerty / USFWS, Doug Wilson (NARA), BLM Oregon & Washington, U.S. Fish and Wildlife Service (all public domain). Sample photos are stand-ins, not the events described.";

const CAMKEY = "th_cams_v1", SEEDKEY = "th_seeded_v1";
function seeded(){ try{ return JSON.parse(localStorage.getItem(SEEDKEY)||"null"); }catch(e){ return null; } }
function seed(){ // add each sample once (even for people who used the first version); deleted samples stay deleted
  let s = seeded();
  if(!s){ s = []; const old = localStorage.getItem(KEY); if(old!==null){ try{ JSON.parse(old).forEach(t=>t.sample&&s.push(t.id)); }catch(e){} s.push("sample-elk","sample-blacktail"); } }
  let tl=[]; try{ tl=JSON.parse(localStorage.getItem(KEY)||"[]"); }catch(e){}
  let cl=[]; try{ cl=JSON.parse(localStorage.getItem(CAMKEY)||"[]"); }catch(e){}
  SAMPLES.forEach(x=>{ const i=tl.findIndex(t=>t.id===x.id&&t.sample); if(i>=0&&(tl[i].v||1)<(x.v||1)) tl[i]=x; }); // swap in updated sample (e.g. the bigger elk)
  SAMPLES.forEach(x=>{ if(!s.includes(x.id)){ if(!tl.some(t=>t.id===x.id)) tl.push(x); s.push(x.id); } });
  CAM_SAMPLES.forEach(x=>{ if(!s.includes(x.id)){ if(!cl.some(t=>t.id===x.id)) cl.push(x); s.push(x.id); } });
  try{ localStorage.setItem(KEY,JSON.stringify(tl)); localStorage.setItem(CAMKEY,JSON.stringify(cl)); localStorage.setItem(SEEDKEY,JSON.stringify(s)); }catch(e){}
}
seed();
function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||"[]"); }catch(e){ return []; } }
function loadCams(){ try{ return JSON.parse(localStorage.getItem(CAMKEY)||"[]"); }catch(e){ return []; } }
function saveCams(list){
  try{ localStorage.setItem(CAMKEY, JSON.stringify(list)); return true; }
  catch(e){ toast("Phone storage is full — try fewer or smaller photos."); return false; }
}
const getCam = id => loadCams().find(c=>c.id===id);
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
  if(h[0]==="add") return renderForm(null, h[1]==="fish"?"fish":"hunt");
  if(h[0]==="edit") return renderForm(h[1]);
  if(h[0]==="addcam") return renderCamForm();
  if(h[0]==="editcam") return renderCamForm(h[1]);
  if(h[0]==="c") return renderCam(h[1]);
  if(h[0]==="hunt"||h[0]==="fish"||h[0]==="cams"){ setTab(h[0]); return renderList(); }
  if(h[0]==="t") return renderTrophy(h[1]);
  if(h[0]==="sticker") return renderSticker(h[1]);
  renderList();
}
window.addEventListener("hashchange",route);
const topbar = (back) => `<div class="topbar">${back?`<button class="iconbtn back" onclick="${back}">‹ Back</button>`:""}<div class="brand">${ANTLER}Trophy Hunt</div><div class="spacer"></div></div>`;

/* ---------- 1) list ---------- */
const getTab = () => { const v=localStorage.getItem("th_tab"); return ["hunt","fish","cams"].includes(v)?v:"hunt"; };
const setTab = v => { try{ localStorage.setItem("th_tab",v); }catch(e){} };
const tabsBar = tab => `<div class="tabs seg">${[["hunt","🦌 Hunting"],["fish","🐟 Fishing"],["cams","📷 Trail Cam"]].map(([k,l])=>`<button data-tab="${k}" class="${tab===k?"on":""}" onclick="location.hash='#/${k}'">${l}</button>`).join("")}</div>`;
function renderList(){
  const tab = getTab();
  if(tab==="cams") return renderCamList();
  const fish = tab==="fish";
  const list = load().filter(t=>kindOf(t)===tab).sort((a,b)=>(b.date||"").localeCompare(a.date||""));
  root().innerHTML = topbar() + `
   <div class="vegas-hero ${fish?"fish":""}"><div class="sparks">${sparks(14)}</div>
     <div class="vh-eyebrow">★ ${fish?"Hall of Fame Catches":"Hall of Fame Mounts"} ★</div>
     <h1 class="shine">${fish?"Every Monster Fish Deserves a Legend.":"Every Mount Has a Legend."}</h1>
     <p>${fish?"Snap it. Tell the story. Stick a QR by the mount — anyone who scans it relives the fight.":"Snap it. Tell the story. Stick a QR by the mount — anyone who scans it relives the hunt."}</p>
     <div class="vh-steps"><span>📸 Snap</span><span>🎙 Tell it</span><span>▦ Scan &amp; brag</span></div></div>
   ${tabsBar(tab)}
   <div class="list">${list.length? list.map(t=>`
     <div class="tcard" onclick="location.hash='#/t/${esc(t.id)}'">
       ${t.sample?'<div class="sample-tag">Sample</div>':""}${t.badge?`<div class="badge-hot">🏆 ${esc(t.badge)}</div>`:""}
       <div class="img" style="background-image:url('${esc(t.photos?.[0]||"")}')${t.heroPos?";background-position:"+esc(t.heroPos):""}"></div>
       <div class="meta"><h3>${esc(t.title||t.species)}</h3><div class="sub">${esc(fmtDate(t.date))} · ${esc((t.area||"").replace(" (sample)",""))}</div></div>
       <div class="foot"><span class="chip">${esc(t.species)}</span>${fish?(t.weight?`<span class="chip gold">${esc(t.weight)}</span>`:""):(t.score?`<span class="chip gold">${esc(t.score.replace(" (sample)",""))}</span>`:"")}<span class="spacer" style="flex:1"></span>
         <button class="iconbtn" onclick="event.stopPropagation();location.hash='#/sticker/${esc(t.id)}'">▦ Sticker</button></div>
     </div>`).join("") : `<div class="empty">No ${fish?"fish":"hunting trophies"} yet. Tap “${fish?"Add a Fish":"Add a Trophy"}” to make your first page.</div>`}
   </div>
   <div class="fab"><button class="btn block shimmer" onclick="location.hash='#/add/${tab}'">＋ ${fish?"Add a Fish":"Add a Trophy"}</button></div>`;
}

/* ---------- 2) add / edit ---------- */
let draftPhotos = [];
function renderForm(id, startKind){
  const t = id ? getT(id) : null;
  let kind = t ? kindOf(t) : (startKind||"hunt");
  draftPhotos = t ? t.photos.slice() : [];
  const v = k => esc(t?.[k]||"");
  const polish = CFG.FEATURES.POLISH_STORY ? `<button type="button" class="btn ghost" id="polishBtn" ${CFG.FEATURES.POLISH_STORY_LIVE?"":"disabled"}>✨ Polish my story ${CFG.FEATURES.POLISH_STORY_LIVE?"":'<span class="soon">coming soon</span>'}</button>`:"";
  root().innerHTML = topbar("history.back()") + `
  <div class="hero-intro"><h1>${t?"Edit Trophy":"Add a Trophy"}</h1><p>Fill in what you know — you can always come back and add more.</p></div>
  <form class="form" id="f">
    <div class="section"><h2>What kind?</h2>
      <div class="seg kindseg"><button type="button" data-k="hunt">🦌 Hunting</button><button type="button" data-k="fish">🐟 Fishing</button></div>
    </div>
    <div class="section"><h2>Photos</h2>
      <div class="photos" id="photos"></div>
      <input type="file" id="file" accept="image/*" multiple hidden>
      <div class="hint">The first photo is the big cover photo. Tap ✕ to remove one.</div>
    </div>
    <fieldset class="kindset" data-k="hunt">
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
    </fieldset>
    <fieldset class="kindset" data-k="fish">
    <div class="section"><h2>The Fish</h2>
      <div class="field"><label>Species</label>
        <input name="species" list="fishspecies" placeholder="e.g. Winter Steelhead" value="${v("species")}" required>
        <datalist id="fishspecies">${["Chinook (King) Salmon","Coho (Silver) Salmon","Sockeye Salmon","Pink Salmon","Chum Salmon","Winter Steelhead","Summer Steelhead","Rainbow Trout","Cutthroat Trout","Brown Trout","Brook Trout","Lake Trout","Largemouth Bass","Smallmouth Bass","Striped Bass","Pacific Halibut","White Sturgeon","Walleye","Northern Pike","Muskie","Lingcod","Rockfish","Catfish","Crappie","Bluegill","Yellow Perch","Kokanee"].map(s=>`<option>${s}</option>`).join("")}</datalist></div>
      <div class="field"><label>Name it (shown as the title)</label><input name="title" placeholder="e.g. Skagit River Chrome Buck" value="${v("title")}"></div>
      <div class="row2">
        <div class="field"><label>Weight</label><input name="weight" placeholder="e.g. 14 lb 6 oz" value="${v("weight")}"></div>
        <div class="field"><label>Length</label><input name="length" placeholder="e.g. 34 in" value="${v("length")}"></div>
      </div>
    </div>
    <div class="section"><h2>The Trip</h2>
      <div class="row2">
        <div class="field"><label>Date</label><input type="date" name="date" value="${v("date")}"></div>
        <div class="field"><label>Angler</label><input name="hunter" placeholder="Your name" value="${v("hunter")}"></div>
      </div>
      <div class="field"><label>Water / location</label><input name="area" placeholder="e.g. Skagit River near Rockport, WA" value="${v("area")}"></div>
      <div class="field"><label>Lure or bait</label><input name="lure" placeholder="e.g. Pink worm under a float" value="${v("lure")}"></div>
      <div class="field"><label>Who was there</label><input name="party" placeholder="e.g. Grandpa" value="${v("party")}"></div>
    </div>
    </fieldset>
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
  const setKind = k => { kind=k;
    document.querySelectorAll(".kindseg button").forEach(b=>b.classList.toggle("on",b.dataset.k===k));
    document.querySelectorAll(".kindset").forEach(fs=>{ const on=fs.dataset.k===k; fs.disabled=!on; fs.hidden=!on; });
    $("#story").placeholder = k==="fish" ? "Where were you fishing? How did the fish hit? Who was with you?" : "How did the day start? What happened? Who was with you?";
  };
  document.querySelectorAll(".kindseg button").forEach(b=>b.onclick=()=>setKind(b.dataset.k));
  setKind(kind);
  $("#file").onchange = e => addFiles([...e.target.files]);
  $("#f").onsubmit = e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    const list = load();
    const base = t||{id:"t"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
    const other = kind==="fish" ? ["score","distance","weapon"] : ["weight","length","lure"];
    other.forEach(k=>delete base[k]);
    const rec = Object.assign(base, fd, {photos:draftPhotos, kind});
    if(!rec.title) rec.title = rec.species;
    const i = list.findIndex(x=>x.id===rec.id); if(i>=0) list[i]=rec; else list.push(rec);
    if(save(list)){ stopMic(); setTab(kind); location.hash="#/t/"+rec.id; }
  };
  if(t) $("#delBtn").onclick = () => { if(confirm("Delete this trophy page?")){ save(load().filter(x=>x.id!==t.id)); location.hash="#/"+kind; } };
  setupMic();
  const pb=$("#polishBtn"); if(pb) pb.onclick=()=>toast("AI story polishing is coming soon.");
}
function videoStill(file){ // grab a frame from a trail cam video clip
  return new Promise(res=>{ const v=document.createElement("video"); v.muted=true; v.playsInline=true; v.preload="auto";
    const u=URL.createObjectURL(file); let done=false; const fin=d=>{ if(done) return; done=true; URL.revokeObjectURL(u); res(d); };
    v.onloadedmetadata=()=>{ try{ v.currentTime=Math.min(1,(v.duration||2)/2); }catch(e){ fin(null); } };
    v.onseeked=()=>{ const M=1400,s=Math.min(1,M/Math.max(v.videoWidth,v.videoHeight)); const c=document.createElement("canvas");
      c.width=Math.round(v.videoWidth*s); c.height=Math.round(v.videoHeight*s); c.getContext("2d").drawImage(v,0,0,c.width,c.height); fin(c.toDataURL("image/jpeg",.8)); };
    v.onerror=()=>fin(null); setTimeout(()=>fin(null),8000); v.src=u; });
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
async function addFiles(files){ for(const f of files){ const d = (f.type||"").startsWith("video/") ? await videoStill(f) : await shrink(f); if(d) draftPhotos.push(d); else toast("Couldn't read "+(f.name||"that file")+"."); } drawPhotos(); }

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
  if(!t && isPublic && getCam(id)) return renderCam(id, true);
  if(!t){ root().innerHTML = topbar(isPublic?"":"location.hash='#/'") + `<div class="empty"><h2 class="serif">Trophy not found</h2><p>This trophy page isn't available on this device yet.<br>(Prototype: pages are only saved on the phone that made them.)</p></div>`; return; }
  const clean = s => esc((s||"").replace(/ \(sample[^)]*\)/g,""));
  const fish = kindOf(t)==="fish", ICON = fish?FISH:ANTLER;
  const stats = (fish
    ? [["Species",t.species],["Angler",t.hunter],["Date",fmtDate(t.date)],["Water",t.area],["Weight",t.weight],["Length",t.length],["Lure / bait",t.lure],["Fishing party",t.party]]
    : [["Species",t.species],["Hunter",t.hunter],["Date",fmtDate(t.date)],["Area",t.area],["Weapon",t.weapon],["Shot",t.distance],["Score",t.score],["Hunting party",t.party]]).filter(s=>s[1]);
  const paras = (t.story||"").split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("");
  const gal = (t.photos||[]).slice(1);
  root().innerHTML = (isPublic?"":topbar("location.hash='#/"+(fish?"fish":"hunt")+"'")) + `
    <div class="tp-hero${t.heroFit==="wide"?" wide":(t.heroPos?" tall":"")}" style="background-image:url('${esc(t.photos?.[0]||"")}')${t.heroPos?";background-position:"+esc(t.heroPos):""}">
      <div class="sparks">${sparks(10)}</div>
      <div class="t"><div class="eyebrow">${esc(t.species)}</div><h1 class="shine">${esc(t.title||t.species)}</h1><div class="sub">${esc(fmtDate(t.date))}${t.hunter?(fish?" · Caught by ":" · Taken by ")+clean(t.hunter):""}</div>
        ${(fish?t.weight:t.score)?`<div class="medal">★ ${clean(fish?t.weight:t.score)} ★</div>`:""}</div>
    </div>
    ${t.sample?`<div class="sample-banner"><b>SAMPLE PAGE</b> — names, story and details are made up to show the layout. ${t.aiCover?`The cover is an AI-generated illustration and the other photos are free-license stand-ins — not a real ${fish?"catch":"hunt"}.`:`Photos are free-license stand-ins, not this ${fish?"catch":"hunt"}.`}</div>`:""}
    <div class="rule">The Record</div>
    <div class="stats">${stats.map(s=>`<div class="stat"><span>${s[0]}</span><span>${esc(s[1])}</span></div>`).join("")}</div>
    ${paras?`<div class="rule">The Story</div><div class="story">${paras}</div>`:""}
    ${gal.length?`<div class="rule">${fish?"From the Water":"From the Hunt"}</div><div class="gallery">${gal.map(p=>`<div style="background-image:url('${esc(p)}')" data-src="${esc(p)}"></div>`).join("")}</div>`:""}
    ${isPublic?"":`<div class="tp-actions"><button class="btn" onclick="location.hash='#/sticker/${esc(t.id)}'">▦ Make Sticker</button><button class="btn ghost" onclick="location.hash='#/edit/${esc(t.id)}'">✎ Edit</button></div>`}
    ${t.sample?`<div class="credits">${CREDITS}</div>`:""}
    <div class="tp-foot">${ICON.replace("<svg","<svg width='22' height='22' style='vertical-align:middle'")} &nbsp;Trophy Hunt</div>`;
  document.querySelectorAll(".gallery div").forEach(d=>d.onclick=()=>{ const lb=document.createElement("div"); lb.className="lightbox"; lb.innerHTML=`<img src="${d.dataset.src}">`; lb.onclick=()=>lb.remove(); document.body.appendChild(lb); });
  document.title = (t.title||t.species)+" — Trophy Hunt";
}

/* ---------- 5) trail cam ---------- */
const fmtTime = s => { if(!s) return ""; const [h,m]=s.split(":").map(Number); return new Date(2000,0,1,h,m).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}); };
const camSort = (a,b)=>((b.date||"")+(b.time||"")).localeCompare((a.date||"")+(a.time||""));
const camTitle = c => [c.points, c.species].filter(Boolean).join(" ");
function camCard(c){
  return `<div class="ccard" onclick="location.hash='#/c/${esc(c.id)}'">
    <div class="cimg" style="background-image:url('${esc(c.photos?.[0]||"")}')">${c.sample?'<div class="sample-tag">Sample</div>':""}</div>
    <div class="cmeta"><h3>${esc(camTitle(c)||"Unknown animal")}</h3>
      <div class="sub">${esc(fmtDate(c.date))}${c.time?" · "+esc(fmtTime(c.time)):""}</div>
      <div class="sub">📷 ${esc(c.camera||"No camera set")}</div></div></div>`;
}
function renderCamList(){
  const by = localStorage.getItem("th_cam_group")==="date" ? "date" : "camera";
  const list = loadCams().sort(camSort);
  let body;
  if(!list.length) body = `<div class="empty">No trail cam photos yet. Tap “Add Trail Cam Photo” to log your first one.</div>`;
  else if(by==="camera"){
    const groups = {}; list.forEach(c=>{ const k=c.camera||"No camera set"; (groups[k]=groups[k]||[]).push(c); });
    body = Object.keys(groups).sort().map(k=>{ const g=groups[k], loc=(g[0].location||"").replace(" (sample)","");
      const species = [...new Set(g.map(c=>c.species).filter(Boolean))].join(", ");
      return `<div class="camgroup"><div class="camhead"><div><h2>📷 ${esc(k)}</h2>${loc?`<div class="sub">${esc(loc)}</div>`:""}</div><span class="chip">${g.length} photo${g.length>1?"s":""}</span></div>
        ${species?`<div class="camspecies">Seen: ${esc(species)}</div>`:""}
        <div class="clist">${g.map(camCard).join("")}</div></div>`; }).join("");
  } else body = `<div class="clist" style="margin:0 16px">${list.map(camCard).join("")}</div>`;
  root().innerHTML = topbar() + `
   <div class="hero-intro"><h1>Trail Cam</h1><p>Keep track of what's walking past your cameras — bucks, bulls, and everything else. These aren't trophies, just sightings.</p></div>
   ${tabsBar("cams")}
   <div class="groupbar"><span>Group by</span><div class="seg small"><button data-g="camera" class="${by==="camera"?"on":""}">Camera</button><button data-g="date" class="${by==="date"?"on":""}">Newest</button></div></div>
   ${body}
   <div class="fab"><button class="btn block shimmer" onclick="location.hash='#/addcam'">＋ Add Trail Cam Photo</button></div>`;
  document.querySelectorAll(".groupbar button").forEach(b=>b.onclick=()=>{ try{ localStorage.setItem("th_cam_group",b.dataset.g); }catch(e){} renderCamList(); });
}
function renderCamForm(id){
  const c = id ? getCam(id) : null;
  draftPhotos = c ? c.photos.slice() : [];
  const v = k => esc(c?.[k]||"");
  const cams = [...new Set(loadCams().map(x=>x.camera).filter(Boolean))];
  const last = loadCams().sort(camSort)[0];
  const now = new Date(), today = now.toISOString().slice(0,10);
  root().innerHTML = topbar("history.back()") + `
  <div class="hero-intro"><h1>${c?"Edit Sighting":"Add Trail Cam Photo"}</h1><p>Add photos or a video clip from the camera card. We'll grab a still from videos.</p></div>
  <form class="form" id="cf">
    <div class="section"><h2>Photos / video</h2>
      <div class="photos" id="photos"></div>
      <input type="file" id="file" accept="image/*,video/*" multiple hidden>
      <div class="hint">The first one is the cover. Tap ✕ to remove one.</div>
    </div>
    <div class="section"><h2>The Animal</h2>
      <div class="field"><label>Species</label>
        <input name="species" list="camspecies" placeholder="e.g. Whitetail Buck" value="${v("species")}" required>
        <datalist id="camspecies">${["Whitetail Buck","Whitetail Doe","Blacktail Buck","Blacktail Doe","Mule Deer Buck","Mule Deer Doe","Elk","Black Bear","Cougar","Coyote","Bobcat","Turkey","Moose","Wild Hog"].map(s=>`<option>${s}</option>`).join("")}</datalist></div>
      <div class="row2">
        <div class="field"><label>Buck / bull?</label><select name="sex">${["","Buck","Doe","Bull","Cow","Boar","Sow","Unknown"].map(s=>`<option ${c?.sex===s?"selected":""} value="${s}">${s||"—"}</option>`).join("")}</select></div>
        <div class="field"><label>Points</label><input name="points" placeholder="e.g. 4×4 or 8 pt" value="${v("points")}"></div>
      </div>
      <div class="field"><label>Nickname (optional)</label><input name="nickname" placeholder="e.g. Wide Left" value="${v("nickname")}"></div>
    </div>
    <div class="section"><h2>The Camera</h2>
      <div class="field"><label>Camera name</label><input name="camera" list="camnames" placeholder="e.g. Creek Crossing Cam" value="${c?v("camera"):esc(last?.camera||"")}" required>
        <datalist id="camnames">${cams.map(s=>`<option>${esc(s)}</option>`).join("")}</datalist></div>
      <div class="field"><label>Camera location</label><input name="location" placeholder="e.g. North fence line by the creek" value="${v("location")}"></div>
      <div class="row2">
        <div class="field"><label>Date</label><input type="date" name="date" value="${c?v("date"):today}"></div>
        <div class="field"><label>Time</label><input type="time" name="time" value="${v("time")}"></div>
      </div>
    </div>
    <div class="section"><h2>Notes</h2>
      <textarea name="notes" id="story" style="min-height:110px" placeholder="Which way was it heading? Weather, wind, anything you noticed.">${v("notes")}</textarea>
      <div class="storybar"><button type="button" class="btn leather mic" id="micBtn">🎙 Say it out loud</button></div>
      <div class="hint" id="micHint"></div>
    </div>
    <button class="btn block" type="submit">Save Sighting</button>
    ${c?`<button type="button" class="btn ghost block" id="delBtn">Delete this sighting</button>`:""}
  </form>`;
  drawPhotos();
  $("#file").onchange = e => addFiles([...e.target.files]);
  $("#cf").onsubmit = e => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target).entries());
    const list = loadCams();
    const rec = Object.assign(c||{id:"c"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}, fd, {photos:draftPhotos});
    const i = list.findIndex(x=>x.id===rec.id); if(i>=0) list[i]=rec; else list.push(rec);
    if(saveCams(list)){ stopMic(); setTab("cams"); location.hash="#/c/"+rec.id; }
  };
  if(c) $("#delBtn").onclick = () => { if(confirm("Delete this sighting?")){ saveCams(loadCams().filter(x=>x.id!==c.id)); location.hash="#/cams"; } };
  setupMic();
}
function renderCam(id, isPublic){
  const c = getCam(id);
  if(!c){ root().innerHTML = topbar(isPublic?"":"location.hash='#/cams'") + `<div class="empty"><h2 class="serif">Sighting not found</h2><p>This page isn't available on this device yet.</p></div>`; return; }
  const clean = s => (s||"").replace(/ \(sample[^)]*\)/g,"");
  const stats = [["Species",c.species],["Buck / bull?",c.sex],["Points",c.points],["Nickname",c.nickname],["Camera",c.camera],["Camera location",clean(c.location)],["Date",fmtDate(c.date)],["Time",fmtTime(c.time)]].filter(s=>s[1]);
  const same = loadCams().filter(x=>x.id!==c.id && x.camera===c.camera).sort(camSort).slice(0,6);
  const gal = (c.photos||[]).slice(1);
  root().innerHTML = (isPublic?"":topbar("location.hash='#/cams'")) + `
    <div class="tp-hero cam" style="background-image:url('${esc(c.photos?.[0]||"")}')">
      <div class="t"><div class="eyebrow">📷 ${esc(c.camera||"Trail Cam")}</div><h1>${esc(c.nickname?`“${c.nickname}”`:(camTitle(c)||"Trail cam sighting"))}</h1><div class="sub">${esc(fmtDate(c.date))}${c.time?" · "+esc(fmtTime(c.time)):""}</div></div>
    </div>
    ${c.sample?`<div class="sample-banner"><b>SAMPLE</b> — details are made up to show the layout. Photos are public-domain trail camera shots (USFWS / BLM).</div>`:""}
    <div class="rule">The Sighting</div>
    <div class="stats">${stats.map(s=>`<div class="stat"><span>${s[0]}</span><span>${esc(s[1])}</span></div>`).join("")}</div>
    ${c.notes?`<div class="rule">Notes</div><div class="story notes"><p>${esc(c.notes).replace(/\n/g,"<br>")}</p></div>`:""}
    ${gal.length?`<div class="rule">More Photos</div><div class="gallery">${gal.map(p=>`<div style="background-image:url('${esc(p)}')" data-src="${esc(p)}"></div>`).join("")}</div>`:""}
    ${!isPublic&&same.length?`<div class="rule">Also on this camera</div><div class="clist" style="margin:0 16px">${same.map(camCard).join("")}</div>`:""}
    ${isPublic?"":`<div class="tp-actions"><button class="btn ghost" onclick="location.hash='#/editcam/${esc(c.id)}'">✎ Edit</button><button class="btn ghost" onclick="location.hash='#/sticker/${esc(c.id)}'">▦ QR Sticker (optional)</button></div>`}
    <div class="tp-foot">${CAM.replace("<svg","<svg width='22' height='22' style='vertical-align:middle'")} &nbsp;Trophy Hunt · Trail Cam</div>`;
  document.querySelectorAll(".gallery div").forEach(d=>d.onclick=()=>{ const lb=document.createElement("div"); lb.className="lightbox"; lb.innerHTML=`<img src="${d.dataset.src}">`; lb.onclick=()=>lb.remove(); document.body.appendChild(lb); });
  document.title = (camTitle(c)||"Trail cam")+" — Trophy Hunt";
}

/* ---------- 4) sticker ---------- */
let stickerShape = "round";
function renderSticker(id){
  let t=getT(id);
  if(!t){ const c=getCam(id); if(c) t={id:c.id, kind:"cam", title:[c.points,c.species].filter(Boolean).join(" "), species:c.species, date:c.date}; }
  if(!t) return renderTrophy(id);
  const url = trophyUrl(t.id);
  root().innerHTML = topbar("history.back()") + `
   <div class="hero-intro"><h1>QR Sticker</h1><p>${t.kind==="cam"?"Optional for trail cam photos — handy for a wall of pictures or the camera itself.":"Print it on sticker paper and put it by the mount. Anyone who scans it sees this trophy's page."}</p></div>
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
function drawIcon(ctx,kind,cx,cy,size,color){
  ctx.save(); ctx.translate(cx-size/2,cy-size/2); ctx.scale(size/32,size/32); ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineCap="round"; ctx.lineJoin="round";
  if(kind==="fish"){ ctx.fill(new Path2D(ICON_PATH.fish)); ctx.strokeStyle="#0e2427"; ctx.lineWidth=1.4; ctx.stroke(new Path2D("M13 11.5c1.5 3 1.5 6 0 9")); ctx.fillStyle="#0e2427"; ctx.beginPath(); ctx.arc(8,14.6,1.4,0,Math.PI*2); ctx.fill(); }
  else if(kind==="cam"){ ctx.lineWidth=2; ctx.stroke(new Path2D("M7 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z")); ctx.beginPath(); ctx.arc(16,14,4.5,0,Math.PI*2); ctx.stroke(); }
  else { ctx.lineWidth=2.2; ctx.stroke(new Path2D(ICON_PATH.hunt)); ctx.beginPath(); ctx.arc(16,22,2.2,0,Math.PI*2); ctx.fill(); }
  ctx.restore();
}
function water(ctx,w,h){ // river-green background for fishing stickers
  const g=ctx.createRadialGradient(w*.4,h*.35,10,w/2,h/2,Math.max(w,h)*.75); g.addColorStop(0,"#25585c"); g.addColorStop(1,"#0b1d20"); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle="rgba(190,230,225,.07)"; ctx.lineWidth=3;
  for(let y=40;y<h;y+=46){ ctx.beginPath(); for(let x=0;x<=w;x+=20) ctx.lineTo(x,y+Math.sin(x/38+y)*6); ctx.stroke(); }
}
function drawSticker(cv,t,url,shape){
  const kind = t.kind==="fish"?"fish":(t.kind==="cam"?"cam":"hunt"), bg = kind==="fish"?water:leather;
  const m=qrMatrix(url), serif='"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
  const name=(t.title||t.species).toUpperCase(), date=fmtDate(t.date);
  if(shape==="round"){
    const S=1000; cv.width=cv.height=S; const ctx=cv.getContext("2d"); ctx.clearRect(0,0,S,S);
    ctx.save(); ctx.beginPath(); ctx.arc(S/2,S/2,S/2-4,0,Math.PI*2); ctx.clip(); bg(ctx,S,S); ctx.restore();
    ctx.strokeStyle="#c79a4b"; ctx.lineWidth=14; ctx.beginPath(); ctx.arc(S/2,S/2,S/2-26,0,Math.PI*2); ctx.stroke();
    ctx.lineWidth=3; ctx.setLineDash([14,10]); ctx.beginPath(); ctx.arc(S/2,S/2,S/2-52,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="#e2bd72"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.font=`700 64px ${serif}`; arcText(ctx,"TROPHY  HUNT",S/2,S/2,S/2-100,-Math.PI/2,true);
    let fs=46; ctx.font=`700 ${fs}px ${serif}`; while(ctx.measureText(name).width>S*.95 && fs>28){fs-=2;ctx.font=`700 ${fs}px ${serif}`;}
    ctx.fillStyle="#f4ecdc"; arcText(ctx,name,S/2,S/2,S/2-100,Math.PI/2,false);
    const q=440; drawQR(ctx,m,(S-q)/2,(S-q)/2-6,q);
    ctx.fillStyle="#e9dcc3"; ctx.font=`italic 36px ${serif}`; ctx.fillText(date,S/2,S/2+q/2+48);
    ctx.fillStyle="#c79a4b"; ctx.font=`600 26px ${serif}`; ctx.fillText("◆  SCAN FOR THE STORY  ◆",S/2,S/2-q/2-34);
    drawIcon(ctx,kind,S/2,S/2-q/2-88,kind==="fish"?118:72,"#e2bd72");
  } else {
    const W=1400,H=760; cv.width=W; cv.height=H; const ctx=cv.getContext("2d"); ctx.clearRect(0,0,W,H);
    ctx.save(); roundRect(ctx,4,4,W-8,H-8,60); ctx.clip(); bg(ctx,W,H); ctx.restore();
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
    drawIcon(ctx,kind,1200,600,kind==="fish"?130:84,"#e2bd72");
  }
}

route();
})();
