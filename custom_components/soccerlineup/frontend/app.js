"use strict";

/* Formations. The ones written out by hand below keep their hand-tuned
   layouts. Everything else is built from its name by buildFormation(), so
   adding a new one is a single line further down: addFormation("4-3-1"). */
var FORMATIONS = {
  "3-3-2": {n:9, pos:[
    {k:"GK",z:"G",imp:0.70,x:160,y:352},
    {k:"LB",z:"D",imp:0.45,x:62,y:272},{k:"CB",z:"D",imp:0.80,x:160,y:286},{k:"RB",z:"D",imp:0.45,x:258,y:272},
    {k:"LM",z:"M",imp:0.58,x:62,y:178},{k:"CM",z:"M",imp:0.90,x:160,y:190},{k:"RM",z:"M",imp:0.58,x:258,y:178},
    {k:"LF",z:"F",imp:0.78,x:108,y:78},{k:"RF",z:"F",imp:0.78,x:212,y:78}
  ]},
  "4-1-3": {n:9, pos:[
    {k:"GK",z:"G",imp:0.70,x:160,y:356},
    {k:"SW",z:"D",imp:0.82,x:160,y:312},
    {k:"LB",z:"D",imp:0.52,x:52,y:266},{k:"RB",z:"D",imp:0.52,x:268,y:266},
    {k:"STP",z:"D",imp:0.80,x:160,y:244},
    {k:"CM",z:"M",imp:0.92,x:160,y:176},
    {k:"LF",z:"F",imp:0.72,x:56,y:80},{k:"ST",z:"F",imp:0.90,x:160,y:64},{k:"RF",z:"F",imp:0.72,x:264,y:80}
  ]},
  /* the same diamond back four as 4-1-3, then two midfielders and two forwards */
  "4-2-2": {n:9, pos:[
    {k:"GK",z:"G",imp:0.70,x:160,y:356},
    {k:"SW",z:"D",imp:0.82,x:160,y:312},
    {k:"LB",z:"D",imp:0.52,x:52,y:266},{k:"RB",z:"D",imp:0.52,x:268,y:266},
    {k:"STP",z:"D",imp:0.80,x:160,y:244},
    {k:"LM",z:"M",imp:0.80,x:96,y:168},{k:"RM",z:"M",imp:0.80,x:224,y:168},
    {k:"LF",z:"F",imp:0.80,x:108,y:76},{k:"RF",z:"F",imp:0.80,x:212,y:76}
  ]},
  "3-2-3": {n:9, pos:[
    {k:"GK",z:"G",imp:0.70,x:160,y:352},
    {k:"LB",z:"D",imp:0.45,x:62,y:276},{k:"CB",z:"D",imp:0.80,x:160,y:290},{k:"RB",z:"D",imp:0.45,x:258,y:276},
    {k:"CM-D",z:"MD",imp:0.84,x:110,y:196},{k:"CM-A",z:"MA",imp:0.84,x:210,y:184},
    {k:"LW",z:"F",imp:0.55,x:58,y:84},{k:"ST",z:"F",imp:0.90,x:160,y:68},{k:"RW",z:"F",imp:0.55,x:262,y:84}
  ]},
  "2-3-3": {n:9, pos:[
    {k:"GK",z:"G",imp:0.70,x:160,y:352},
    {k:"LB",z:"D",imp:0.62,x:106,y:282},{k:"RB",z:"D",imp:0.62,x:214,y:282},
    {k:"LM",z:"M",imp:0.55,x:58,y:190},{k:"CM",z:"M",imp:0.88,x:160,y:196},{k:"RM",z:"M",imp:0.55,x:262,y:190},
    {k:"LW",z:"F",imp:0.55,x:58,y:84},{k:"ST",z:"F",imp:0.90,x:160,y:68},{k:"RW",z:"F",imp:0.55,x:262,y:84}
  ]},
  "3-1-3-1": {n:9, pos:[
    {k:"GK",z:"G",imp:0.70,x:160,y:352},
    {k:"LB",z:"D",imp:0.45,x:62,y:278},{k:"CB",z:"D",imp:0.80,x:160,y:292},{k:"RB",z:"D",imp:0.45,x:258,y:278},
    {k:"DM",z:"MD",imp:0.85,x:160,y:216},
    {k:"LM",z:"M",imp:0.55,x:62,y:150},{k:"CM-A",z:"MA",imp:0.80,x:160,y:146},{k:"RM",z:"M",imp:0.55,x:258,y:150},
    {k:"ST",z:"F",imp:0.90,x:160,y:62}
  ]},
  "2-3-2": {n:8, pos:[
    {k:"GK",z:"G",imp:0.70,x:160,y:352},
    {k:"LB",z:"D",imp:0.62,x:106,y:282},{k:"RB",z:"D",imp:0.62,x:214,y:282},
    {k:"LM",z:"M",imp:0.55,x:58,y:190},{k:"CM",z:"M",imp:0.88,x:160,y:196},{k:"RM",z:"M",imp:0.55,x:262,y:190},
    {k:"LF",z:"F",imp:0.80,x:108,y:78},{k:"RF",z:"F",imp:0.80,x:212,y:78}
  ]},
  "3-2-1": {n:7, pos:[
    {k:"GK",z:"G",imp:0.70,x:160,y:352},
    {k:"LB",z:"D",imp:0.50,x:62,y:278},{k:"CB",z:"D",imp:0.80,x:160,y:292},{k:"RB",z:"D",imp:0.50,x:258,y:278},
    {k:"LM",z:"M",imp:0.70,x:108,y:184},{k:"RM",z:"M",imp:0.70,x:212,y:184},
    {k:"ST",z:"F",imp:0.90,x:160,y:76}
  ]}
};

/* ---------- formations built from their name ----------
   A name such as "3-3-1" lists the outfield lines from the back; the keeper
   is added automatically. Two lines are defense and forwards, three add a
   midfield, four split the midfield into a defensive and an attacking line.
   Each line can hold 1 to 4 players. For every line size, LINE_SLOTS gives
   the position names and how much each spot matters to auto-fill (imp). */
var LINE_SLOTS={
  D: {1:[["CB",0.85]], 2:[["LB",0.62],["RB",0.62]], 3:[["LB",0.45],["CB",0.80],["RB",0.45]],
      4:[["LB",0.52],["LCB",0.78],["RCB",0.78],["RB",0.52]],
      5:[["LWB",0.50],["LCB",0.75],["CB",0.85],["RCB",0.75],["RWB",0.50]]},
  MD:{1:[["DM",0.85]], 2:[["LDM",0.78],["RDM",0.78]], 3:[["LDM",0.55],["DM",0.85],["RDM",0.55]],
      4:[["LWB",0.50],["LDM",0.75],["RDM",0.75],["RWB",0.50]],
      5:[["LWB",0.50],["LDM",0.70],["DM",0.82],["RDM",0.70],["RWB",0.50]]},
  M: {1:[["CM",0.90]], 2:[["LM",0.70],["RM",0.70]], 3:[["LM",0.58],["CM",0.90],["RM",0.58]],
      4:[["LM",0.52],["LCM",0.80],["RCM",0.80],["RM",0.52]],
      5:[["LM",0.55],["LCM",0.78],["CM",0.90],["RCM",0.78],["RM",0.55]]},
  MA:{1:[["AM",0.82]], 2:[["LAM",0.70],["RAM",0.70]], 3:[["LAM",0.55],["AM",0.80],["RAM",0.55]],
      4:[["LAM",0.50],["LCAM",0.75],["RCAM",0.75],["RAM",0.50]],
      5:[["LAM",0.50],["LCAM",0.70],["AM",0.82],["RCAM",0.70],["RAM",0.50]]},
  F: {1:[["ST",0.90]], 2:[["LF",0.80],["RF",0.80]], 3:[["LW",0.55],["ST",0.90],["RW",0.55]],
      4:[["LW",0.52],["LS",0.80],["RS",0.80],["RW",0.52]],
      5:[["LW",0.52],["LS",0.75],["ST",0.90],["RS",0.75],["RW",0.52]]}
};
var LINE_X={1:[160], 2:[106,214], 3:[62,160,258], 4:[50,112,208,270], 5:[48,104,160,216,272]};
var LINE_ZONES={2:["D","F"], 3:["D","M","F"], 4:["D","MD","MA","F"]};
function buildFormation(name){
  var lines=String(name).split("-").map(Number), zones=LINE_ZONES[lines.length],
      pos=[{k:"GK",z:"G",imp:0.70,x:160,y:352}], n=1, li, j;
  if(!zones){ throw new Error("Formation "+name+" needs 2 to 4 lines"); }
  for(li=0;li<lines.length;li++){
    var count=lines[li], slots=LINE_SLOTS[zones[li]][count];
    if(!slots){ throw new Error("Formation "+name+" can have 1 to 5 players in a line"); }
    /* back line near the box, front line near halfway, the rest evenly between */
    var y=284-li*(212/(lines.length-1));
    for(j=0;j<count;j++){
      var outer=(j===0 || j===count-1), dy=0;
      if(count===3 && outer){ dy=-12; }        /* wide players sit a little higher */
      if(count===4){ dy=outer?-18:18; }        /* stagger a flat four so printed name plates do not overlap */
      if(count===5){ dy=(j%2===0)?-18:18; }    /* and a five as a zigzag */
      pos.push({k:slots[j][0], z:zones[li], imp:slots[j][1], x:LINE_X[count][j], y:Math.round(y+dy)});
    }
    n+=count;
  }
  return {n:n, pos:pos};
}
function addFormation(name){ FORMATIONS[name]=buildFormation(name); }

/* 9v9 */
addFormation("3-4-1");
addFormation("4-3-1");
/* 8v8 */
addFormation("3-3-1");
addFormation("3-2-2");
/* 7v7 */
addFormation("2-3-1");
addFormation("2-1-2-1");
/* 11v11 (U13 and older) */
addFormation("4-4-2");
addFormation("4-3-3");
addFormation("4-2-3-1");
addFormation("4-1-4-1");
addFormation("4-5-1");
addFormation("3-5-2");
addFormation("3-4-3");
addFormation("5-3-2");

var ZONES=[
  {v:"G", label:"Goalie"},
  {v:"D", label:"Defense"},
  {v:"MD",label:"Mid - defensive"},
  {v:"M", label:"Mid - either"},
  {v:"MA",label:"Mid - attacking"},
  {v:"F", label:"Forward"},
  {v:"",  label:"Any"}
];
var ADJ={
  "G": {"G":1,   "D":0.35,"MD":0.10,"M":0.05,"MA":0.00,"F":0.00},
  "D": {"G":0.35,"D":1,   "MD":0.70,"M":0.45,"MA":0.20,"F":0.10},
  "MD":{"G":0.10,"D":0.70,"MD":1,   "M":0.85,"MA":0.50,"F":0.20},
  "M": {"G":0.05,"D":0.45,"MD":0.85,"M":1,   "MA":0.85,"F":0.45},
  "MA":{"G":0.00,"D":0.20,"MD":0.50,"M":0.85,"MA":1,   "F":0.70},
  "F": {"G":0.00,"D":0.10,"MD":0.20,"M":0.45,"MA":0.70,"F":1}
};

var DEFAULT_ROSTER = [];

var KEY = "panthers.rotation.v5";
var S = null;
var ui = {tab:"plan", q:0, selSlot:-1, selPlayer:0, editId:0};

/* ---------- Home Assistant mode ----------
   Opened from the Soccer Lineup item in Home Assistant's sidebar, the app
   keeps the season on the Home Assistant server instead of only in this
   browser. The computer and the phone then see the same season, live, and
   Home Assistant's own backups include it. This device still keeps a copy,
   so a dropped connection loses nothing: changes made meanwhile are sent
   when the connection comes back.
   Opened any other way (a web address or a file), the app works as before
   and nothing below runs. */
var HA = detectHomeAssistant();
var HA_CACHE = KEY + ".ha";
var sync = {
  rev:0,             /* the server version this device's season is based on */
  pending:false,     /* changes here the server doesn't have yet */
  inFlight:false, again:false, timer:0,
  lastJson:null,     /* the season as the server has it, to skip saves that change nothing */
  clientId:"c"+Math.random().toString(36).slice(2,10),
  status:"", savedAt:null, savedBy:null, unsub:null, resolving:false
};
function detectHomeAssistant(){
  try{
    if(!/[?&]ha=1(&|$)/.test(location.search)){ return null; }
    if(window.parent && window.parent!==window && window.parent.soccerLineupBridge){
      return window.parent.soccerLineupBridge;
    }
  }catch(e){}
  return null;
}
var undoStack = [];
var suppressUndo = false;

function todayISO(){
  var d=new Date(), y=d.getFullYear(), m=String(d.getMonth()+1), day=String(d.getDate());
  if(m.length<2){ m="0"+m; }
  if(day.length<2){ day="0"+day; }
  return y+"-"+m+"-"+day;
}

function copyRoster(roster){
  return roster.map(function(p){
    var tier=(p.tier===undefined || p.tier===null)?0:Number(p.tier);
    return {id:p.id,name:p.name,num:p.num||"",tier:tier,p1:p.p1||"",p2:p.p2||"",gkOrder:p.gkOrder||0};
  });
}

function freshState(){
  var st={
    schemaVersion:7,
    cfg:{team:"Team", quarters:4, minutes:15, onField:9, formation:"3-3-2", autoBackup:true, keeperPlan:"halves"},
    roster:copyRoster(DEFAULT_ROSTER), nextId:1, nextGameId:1,
    current:null, games:[]
  };
  undoStack=[];
  S=st;
  st.current=newGame();
  return st;
}
function blankRow(n){ var a=[],j; n=n||S.cfg.onField; for(j=0;j<n;j++){ a.push(0); } return a; }
function blankPlan(nq,n){ var q=[],i; nq=nq||S.cfg.quarters; for(i=0;i<nq;i++){ q.push(blankRow(n)); } return q; }
function newGame(){
  return {
    id:0, date:todayISO(), opp:"",
    nq:S.cfg.quarters, qlen:S.cfg.minutes,
    formation:S.cfg.formation, onField:S.cfg.onField,
    formations:defaultFormations(S.cfg.quarters,S.cfg.formation),
    plan:blankPlan(),
    goals:{}, oppGoals:null, out:{}, left:{}
  };
}

/* the game currently being edited: a saved one, or the one in progress */
function G(){
  if(ui.editId){
    var i;
    for(i=0;i<S.games.length;i++){ if(S.games[i].id===ui.editId){ return S.games[i]; } }
    ui.editId=0;
  }
  return S.current;
}
function lastQ(){ return G().nq-1; }
function isLastQ(){ return ui.q===lastQ(); }
function curRow(){ return G().plan[ui.q]; }
function rowAt(g,q){ return g.plan[q]; }
/* the game's default formation - the fallback for a quarter with no choice of its own */
function gForm(g){ return FORMATIONS[g.formation]||FORMATIONS["3-3-2"]; }
/* formations that put this many players on the field */
function formationsFor(n){
  return Object.keys(FORMATIONS).filter(function(k){ return FORMATIONS[k].n===n; });
}
function fieldSizes(){
  var sizes=[], k;
  for(k in FORMATIONS){
    if(Object.prototype.hasOwnProperty.call(FORMATIONS,k) && sizes.indexOf(FORMATIONS[k].n)<0){ sizes.push(FORMATIONS[k].n); }
  }
  return sizes.sort(function(a,b){ return b-a; });
}
/* name of the formation quarter q of game g is played in. Every formation in
   a game must put the same number on the field, so anything that does not
   fit falls back to the game default, then to the first fitting formation. */
function qFormName(g,q){
  var name=(g.formations && g.formations[q]) ? g.formations[q] : g.formation;
  if(FORMATIONS[name] && FORMATIONS[name].n===g.onField){ return name; }
  if(FORMATIONS[g.formation] && FORMATIONS[g.formation].n===g.onField){ return g.formation; }
  var fits=formationsFor(g.onField);
  return fits.length?fits[0]:"3-3-2";
}
function qForm(g,q){ return FORMATIONS[qFormName(g,q)]; }
function defaultFormations(nq, name){
  var a=[], i;
  for(i=0;i<nq;i++){ a.push(name); }
  return a;
}

function normalizeRoster(roster){
  var i, p, used={};
  for(i=0;i<roster.length;i++){
    p=roster[i];
    if(p.tier===undefined || p.tier===null){ p.tier=2; }
    p.tier=Number(p.tier)||0;
    if(p.p1===undefined){ p.p1=""; }
    if(p.p2===undefined){ p.p2=""; }
    if(p.num===undefined){ p.num=""; }
    p.gkOrder=Number(p.gkOrder)||0;
    if(p.gkOrder<1 || p.gkOrder>2 || used[p.gkOrder] || !canKeep(p)){ p.gkOrder=0; }
    else { used[p.gkOrder]=true; }
  }
  /* Older saves only had a GK badge. Preserve that intent, then fall back to
     the first and second goalkeeper-eligible players in roster order. */
  for(var rank=1;rank<=2;rank++){
    if(used[rank]){ continue; }
    var pick=null;
    for(i=0;i<roster.length;i++){
      if(canKeep(roster[i]) && !roster[i].gkOrder && roster[i].gk){ pick=roster[i]; break; }
    }
    if(!pick){
      for(i=0;i<roster.length;i++){
        if(canKeep(roster[i]) && !roster[i].gkOrder){ pick=roster[i]; break; }
      }
    }
    if(pick){ pick.gkOrder=rank; used[rank]=true; }
  }
  return roster;
}

function foldLegacyQ4(g){
  /* older saves kept two alternative last-quarter lineups; keep the one that
     was actually recorded as played and drop the other */
  if(g && g.altQ4){
    var last=g.nq-1, used=(g.scen==="blowout")?g.altQ4.blowout:g.altQ4.close;
    if(used && used.length && g.plan && g.plan[last]){
      var anyUsed=used.filter(function(x){return x>0;}).length;
      var anyPlan=g.plan[last].filter(function(x){return x>0;}).length;
      if(anyUsed && !anyPlan){ g.plan[last]=used.slice(); }
    }
    delete g.altQ4;
  }
  if(g){ delete g.scen; }
  return g;
}
function normalizeGame(g, saved){
  if(!g.goals){ g.goals={}; }
  if(g.oppGoals===undefined || g.oppGoals===null || g.oppGoals===""){
    g.oppGoals=null;
  }else{
    g.oppGoals=Math.max(0,Math.floor(Number(g.oppGoals)||0));
  }
  if(!g.out){ g.out={}; }
  if(!g.left){ g.left={}; }
  if(g.notes===undefined || g.notes===null){ g.notes=""; }
  /* A saved game dated after today with no score yet was planned ahead and
     hasn't been played: it doesn't count toward the season until it is. */
  if(saved && g.planned===undefined){
    g.planned=!!(g.date && g.date>todayISO() && g.oppGoals===null && teamGoals(g)===0);
  }
  /* older saves had one formation for the whole game */
  if(!g.onField){ g.onField=gForm(g).n; }
  if(!FORMATIONS[g.formation] || FORMATIONS[g.formation].n!==g.onField){
    var fits=formationsFor(g.onField);
    if(fits.length){ g.formation=fits[0]; }
  }
  if(!Array.isArray(g.formations)){ g.formations=[]; }
  var qi;
  for(qi=0;qi<g.nq;qi++){ g.formations[qi]=qFormName(g,qi); }
  g.formations.length=g.nq;
  if(saved){
    if(!g.rosterSnapshot){ g.rosterSnapshot=copyRoster(S.roster); }
    normalizeRoster(g.rosterSnapshot);
  }
  return g;
}

function normalizeState(st){
  if(!st || !st.cfg || !Array.isArray(st.roster)){ throw new Error("bad state"); }
  S=st;
  S.schemaVersion=7;
  normalizeRoster(S.roster);
  if(S.cfg.autoBackup===undefined){ S.cfg.autoBackup=true; }
  if(["halves","turns","middle"].indexOf(S.cfg.keeperPlan)<0){ S.cfg.keeperPlan="halves"; }
  if(!formationsFor(S.cfg.onField).length){ S.cfg.onField=9; }
  if(!FORMATIONS[S.cfg.formation] || FORMATIONS[S.cfg.formation].n!==S.cfg.onField){
    S.cfg.formation=formationsFor(S.cfg.onField)[0];
  }
  if(!Array.isArray(S.games)){ S.games=[]; }
  var i, maxId=0;
  for(i=0;i<S.games.length;i++){
    normalizeGame(S.games[i],true);
    if(S.games[i].id>maxId){ maxId=S.games[i].id; }
  }
  if(!S.nextGameId || S.nextGameId<=maxId){ S.nextGameId=maxId+1; }
  if(!S.nextId){
    var maxPlayer=0;
    for(i=0;i<S.roster.length;i++){ if(S.roster[i].id>maxPlayer){ maxPlayer=S.roster[i].id; } }
    S.nextId=maxPlayer+1;
  }
  if(!S.current){ S.current=newGame(); }
  normalizeGame(S.current,false);
  return S;
}

function load(){
  var raw=null;
  if(HA){ haLoadCache(); return; }
  try{ raw=localStorage.getItem(KEY); }catch(e){ raw=null; }
  if(raw){
    try{ normalizeState(JSON.parse(raw)); }
    catch(e){ S=null; }
  }
  if(!S){ freshState(); }
}
function save(){
  if(HA){ sync.pending=true; haWriteCache(); haSchedulePush(); return; }
  try{ localStorage.setItem(KEY, JSON.stringify(S)); }
  catch(e){
    var b=document.getElementById("brandSub");
    if(b){ b.textContent="not saving"; }
  }
}

function copyValue(v){ return JSON.parse(JSON.stringify(v)); }
function rememberGameChange(label){
  if(suppressUndo){ return; }
  var g=G();
  undoStack.push({
    game:g,label:label,
    plan:copyValue(g.plan),formations:copyValue(g.formations||[]),
    out:copyValue(g.out||{}),left:copyValue(g.left||{}),goals:copyValue(g.goals||{}),notes:(g.notes||""),
    q:ui.q
  });
  if(undoStack.length>20){ undoStack.shift(); }
}
function latestUndoIndex(g){
  var i;
  for(i=undoStack.length-1;i>=0;i--){ if(undoStack[i].game===g){ return i; } }
  return -1;
}
function discardUndoForGame(g){
  undoStack=undoStack.filter(function(x){ return x.game!==g; });
}
function undoLastChange(){
  var g=G(), i=latestUndoIndex(g);
  if(i<0){ return; }
  var u=undoStack.splice(i,1)[0];
  g.plan=copyValue(u.plan);
  if(u.formations && u.formations.length){ g.formations=copyValue(u.formations); }
  g.out=copyValue(u.out);
  g.left=copyValue(u.left||{});
  g.notes=(u.notes===undefined)?"":u.notes;
  g.goals=copyValue(u.goals);
  ui.q=Math.min(u.q,g.nq-1);
  ui.selSlot=-1; ui.selPlayer=0;
  save(); render();
}
function renderUndoButtons(){
  var buttons=document.querySelectorAll(".undoBtn"), i=latestUndoIndex(G()), j;
  for(j=0;j<buttons.length;j++){
    buttons[j].disabled=i<0;
    buttons[j].title=i<0?"Nothing to undo":"Undo "+undoStack[i].label;
  }
}

/* What a game's periods are called: two halves, three periods, or four quarters. */
function periodWords(n){
  if(n===2){ return {one:"Half", many:"Halves", low:"half", lows:"halves", s:"H"}; }
  if(n===3){ return {one:"Period", many:"Periods", low:"period", lows:"periods", s:"P"}; }
  return {one:"Quarter", many:"Quarters", low:"quarter", lows:"quarters", s:"Q"};
}
function PW(g){ return periodWords((g||G()).nq); }
/* for season-wide text: the team's usual format */
function seasonWords(){ return periodWords(S.cfg.quarters); }

function gameRoster(g){ return g && g.rosterSnapshot ? g.rosterSnapshot : S.roster; }
function P(id,g){
  var roster=gameRoster(g), i;
  for(i=0;i<roster.length;i++){ if(roster[i].id===id){ return roster[i]; } }
  return null;
}
function nameOf(id,g){ var p=P(id,g); return p?p.name:"\u2014"; }
function esc(t){ return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function targetQtrs(){ var g=G(), n=presentRoster(g).length; return n?(g.onField*g.nq)/n:0; }

function gameQtrs(g, scen){
  var m={}, i, q, roster=gameRoster(g);
  for(i=0;i<roster.length;i++){ m[roster[i].id]=0; }
  for(q=0;q<g.nq;q++){
    var r=rowAt(g,q,scen);
    for(i=0;i<r.length;i++){ if(r[i] && m[r[i]]!==undefined){ m[r[i]]+=1; } }
  }
  return m;
}
function isOut(g, playerId){ return !!(g.out && g.out[playerId]); }
function presentRoster(g){
  return gameRoster(g).filter(function(p){ return !isOut(g,p.id); });
}
/* A player who left partway through (hurt, picked up early) is unavailable
   from that quarter on: those quarters count as neither played nor sat. */
function leftFrom(g, playerId){
  return (g.left && g.left[playerId]!==undefined && g.left[playerId]!==null) ? Number(g.left[playerId]) : -1;
}
function availableIn(g, playerId, q){
  if(isOut(g,playerId)){ return false; }
  var from=leftFrom(g,playerId);
  return from<0 || q<from;
}
function presentInQ(g, q){
  return gameRoster(g).filter(function(p){ return availableIn(g,p.id,q); });
}
function availableQuarters(g, playerId){
  var n=0, q;
  for(q=0;q<g.nq;q++){ if(availableIn(g,playerId,q)){ n++; } }
  return n;
}
/* Saved games that count toward the season: planned ones don't until played. */
function playedGames(){
  return S.games.filter(function(g){ return !g.planned; });
}
function markLeft(){
  var g=G(), who=Number(document.getElementById("leftWho").value), from=Number(document.getElementById("leftFrom").value), q, i;
  if(!who || !(from>0)){ return; }
  rememberGameChange("left the game");
  if(!g.left){ g.left={}; }
  g.left[who]=from;
  /* off every lineup from that quarter on */
  for(q=from;q<g.plan.length;q++){
    for(i=0;i<g.plan[q].length;i++){ if(g.plan[q][i]===who){ g.plan[q][i]=0; } }
  }
  save(); render();
}
function clearLeft(playerId){
  var g=G();
  rememberGameChange("back in the game");
  if(g.left){ delete g.left[playerId]; }
  save(); render();
}
function toggleOut(playerId){
  var g=G(), i, q;
  rememberGameChange(g.out && g.out[playerId]?"attendance change":"mark player absent");
  if(!g.out){ g.out={}; }
  if(g.out[playerId]){
    delete g.out[playerId];
  }else{
    g.out[playerId]=true;
    if(g.left){ delete g.left[playerId]; }
    /* pull her out of every lineup in this game */
    for(q=0;q<g.plan.length;q++){
      for(i=0;i<g.plan[q].length;i++){ if(g.plan[q][i]===playerId){ g.plan[q][i]=0; } }
    }
    if(g.goals){ delete g.goals[playerId]; }
  }
  save(); render();
}

function goalsOf(g, playerId, q){
  if(!g.goals){ g.goals={}; }
  var a=g.goals[playerId];
  if(!a){ return 0; }
  return a[q]||0;
}
function gameGoals(g, playerId){
  if(!g.goals){ return 0; }
  var a=g.goals[playerId], t=0, i;
  if(!a){ return 0; }
  for(i=0;i<a.length;i++){ t+=a[i]||0; }
  return t;
}
function teamGoals(g){
  var t=0, ids=Object.keys(g.goals||{}), i;
  for(i=0;i<ids.length;i++){ t+=gameGoals(g,ids[i]); }
  return t;
}
function gameResult(g){
  if(g.oppGoals===null || g.oppGoals===undefined){ return ""; }
  var gf=teamGoals(g), ga=Number(g.oppGoals)||0;
  return gf>ga?"W":(gf<ga?"L":"T");
}
function seasonRecord(){
  var r={wins:0,losses:0,ties:0,unknown:0}, i, result, games=playedGames();
  for(i=0;i<games.length;i++){
    result=gameResult(games[i]);
    if(result==="W"){ r.wins+=1; }
    else if(result==="L"){ r.losses+=1; }
    else if(result==="T"){ r.ties+=1; }
    else { r.unknown+=1; }
  }
  return r;
}
function setOpponentGoals(value){
  var g=G();
  if(value==="" || value===null || value===undefined){ g.oppGoals=null; }
  else {
    g.oppGoals=Math.max(0,Math.floor(Number(value)||0));
    if(g.planned){ g.planned=false; }   /* a score means it was played */
  }
  save(); render();
}
function bumpGoal(playerId, q, delta){
  var g=G(), i;
  if(!g.goals){ g.goals={}; }
  if(!g.goals[playerId]){
    g.goals[playerId]=[];
    for(i=0;i<g.nq;i++){ g.goals[playerId].push(0); }
  }
  while(g.goals[playerId].length<g.nq){ g.goals[playerId].push(0); }
  var v=(g.goals[playerId][q]||0)+delta;
  if(v<0){ v=0; }
  g.goals[playerId][q]=v;
  save(); render();
}

function seasonPlayers(){
  var out=S.roster.slice(), seen={}, i, j;
  for(i=0;i<out.length;i++){ seen[out[i].id]=true; }
  for(i=0;i<S.games.length;i++){
    var roster=gameRoster(S.games[i]);
    for(j=0;j<roster.length;j++){
      if(!seen[roster[j].id]){ out.push(roster[j]); seen[roster[j].id]=true; }
    }
  }
  return out;
}

function seasonTotals(){
  var t={}, i, j, players=seasonPlayers();
  for(i=0;i<players.length;i++){
    t[players[i].id]={qtrs:0,satQ:0,mins:0,games:0,goals:0,availQ:0,missed:0};
  }
  var games=playedGames();
  for(i=0;i<games.length;i++){
    var g=games[i], qt=gameQtrs(g), roster=gameRoster(g);
    for(j=0;j<roster.length;j++){
      var id=roster[j].id;
      if(!t[id]){ t[id]={qtrs:0,satQ:0,mins:0,games:0,goals:0,availQ:0,missed:0}; }
      if(isOut(g,id)){ t[id].missed+=1; continue; }   /* missed games count for nothing */
      /* quarters after leaving the game count for nothing either */
      var qp=qt[id]||0, avail=availableQuarters(g,id);
      t[id].qtrs+=qp;
      t[id].satQ+=Math.max(0,avail-qp);
      t[id].availQ+=avail;
      t[id].mins+=qp*g.qlen;
      t[id].games+=1;
      t[id].goals+=gameGoals(g,id);
    }
  }
  /* sitRate is the fair comparator: share of AVAILABLE quarters spent sitting.
     A player who missed a game is neither owed time nor penalised for it. */
  for(i=0;i<players.length;i++){
    var r=t[players[i].id];
    r.sitRate = r.availQ>0 ? (r.satQ/r.availQ) : 0;
    r.playRate = r.availQ>0 ? (r.qtrs/r.availQ) : 0;
  }
  return t;
}

function showTab(t){
  ui.tab=t;
  ["plan","season","setup"].forEach(function(k){
    document.getElementById(k).hidden=(k!==t);
    document.getElementById("tab-"+k).setAttribute("aria-selected", k===t?"true":"false");
  });
  render();
}
function setGameField(f,v){ G()[f]=v; save(); render(); }
/* which last-quarter lineup was actually used - this is what season totals count */
function canKeep(player){
  if(!player){ return false; }
  return player.p1==="G" || player.p2==="G";
}
function keepers(){
  return presentInQ(G(), ui.q).filter(canKeep).sort(function(a,b){
    var ao=a.gkOrder||99, bo=b.gkOrder||99;
    return ao-bo;
  });
}
function primaryKeeper(){
  var k=keepers();
  return k.length?k[0]:null;
}
function backupKeeper(){
  var k=keepers();
  return k.length>1?k[1]:null;
}
function effectiveTier(player){ return player && player.tier ? player.tier : 2; }
function fitScore(player, slot){
  if(!player){ return -1e9; }
  var z=slot.z, s=0;
  if(z==="G"){
    /* hard rule, not a preference: non-keepers are never eligible */
    if(!canKeep(player)){ return -1e9; }
    s += (player.p1==="G") ? 140 : 105;
    /* among eligible keepers, prefer the stronger one */
    if(player.tier===1){ s+=12; } else if(player.tier===3){ s-=6; }
    return s;
  }
  /* outfield: "Any" is a genuine wildcard, but never covers goal */
  var f1 = player.p1 ? (ADJ[player.p1]?(ADJ[player.p1][z]||0):0) : 0.5;
  var f2 = player.p2 ? (ADJ[player.p2]?(ADJ[player.p2][z]||0):0) : 0;
  var fit = Math.max(f1, f2*0.72);
  if(!player.p1 && !player.p2){ fit=0.5; }
  s += fit*100;
  if(player.p1==="G" && !player.p2){ s-=8; }
  if(player.tier===1){ s += 42*slot.imp; }
  else if(player.tier===3){ s += 34*(1-slot.imp); }
  else { s += 14*slot.imp + 8*(1-slot.imp); }
  return s;
}

/* Position history is used only after two player/slot pairings receive the
   same tactical fit score. It adds variety without putting a worse fit ahead
   of a better one. Close-game planning follows positions that were actually
   played; planning follows the saved plans so that alternate
   Q4 sheets rotate even when the close lineup was ultimately used. */
function seasonPositionHistory(){
  var out={}, gi, q, i, games=playedGames();
  for(gi=0;gi<games.length;gi++){
    var old=games[gi];
    for(q=0;q<old.nq;q++){
      var form=qForm(old,q), row=rowAt(old,q)||[];
      for(i=0;i<row.length && i<form.pos.length;i++){
        if(!row[i]){ continue; }
        if(!out[row[i]]){ out[row[i]]={}; }
        var key=form.pos[i].k;
        out[row[i]][key]=(out[row[i]][key]||0)+1;
      }
    }
  }
  return out;
}
/* Lines (defense, midfield, forward) each player has played in this game;
   goal isn't counted, so a keeper can still play two lines in the field. */
function currentLineHistory(skipQ){
  var out={}, g=G(), form, q, i, z;
  for(q=0;q<g.nq;q++){
    if(q===skipQ){ continue; }
    form=qForm(g,q);
    var row=g.plan[q]||[];
    for(i=0;i<row.length && i<form.pos.length;i++){
      z=form.pos[i].z;
      if(!row[i] || z==="G"){ continue; }
      if(!out[row[i]]){ out[row[i]]={}; }
      out[row[i]][lineGroup(z)]=(out[row[i]][lineGroup(z)]||0)+1;
    }
  }
  return out;
}
function countKeys(o){
  var n=0, k;
  for(k in o){ if(Object.prototype.hasOwnProperty.call(o,k) && o[k]>0){ n++; } }
  return n;
}
function currentPositionHistory(skipQ){
  var out={}, g=G(), form, q, i;
  for(q=0;q<g.nq;q++){
    if(q===skipQ){ continue; }
    form=qForm(g,q);
    var row=g.plan[q]||[];
    for(i=0;i<row.length && i<form.pos.length;i++){
      if(!row[i]){ continue; }
      if(!out[row[i]]){ out[row[i]]={}; }
      var key=form.pos[i].k;
      out[row[i]][key]=(out[row[i]][key]||0)+1;
    }
  }
  return out;
}

/* Final equalities rotate predictably by game and quarter. This is deliberately
   deterministic: pressing auto-fill again on the same game gives the same
   answer, while a future game does not always favor the first alphabetic name. */
function rotationRank(player, slotIndex){
  var list=presentRoster(G()).slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
  if(!list.length){ return 0; }
  var ix=0, i;
  for(i=0;i<list.length;i++){ if(list[i].id===player.id){ ix=i; break; } }
  var shift=(S.games.length+ui.q+slotIndex)%list.length;
  return (ix-shift+list.length)%list.length;
}

function lineGroup(zone){
  if(zone==="D"){ return "D"; }
  if(zone==="F"){ return "F"; }
  return "M";
}

/* Score the tier balance within defense, midfield and forward units. The
   preferred three-player patterns have an average tier of Middle: either
   Strong/Middle/Developing or three Middle players. An all-Developing unit
   receives the largest penalty, but positional fit still matters. */
function lineBalancePenalty(ids, slots, form, tierById){
  var groups={}, i, key, tiers, sum, allDeveloping, allStrong, penalty=0;
  for(i=0;i<ids.length;i++){
    key=lineGroup(form.pos[slots[i]].z);
    if(!groups[key]){ groups[key]=[]; }
    groups[key].push(tierById[ids[i]]||2);
  }
  for(key in groups){
    if(!Object.prototype.hasOwnProperty.call(groups,key)){ continue; }
    tiers=groups[key];
    if(tiers.length<2){ continue; }
    sum=tiers.reduce(function(a,b){ return a+b; },0);
    allDeveloping=tiers.every(function(t){ return t===3; });
    allStrong=tiers.every(function(t){ return t===1; });
    if(allDeveloping){ penalty+=1000; }
    if(allStrong){ penalty+=50; }
    penalty+=Math.abs(sum-(2*tiers.length))*10;
  }
  return penalty;
}

/* With nine or fewer players on the field there are at most eight outfield
   slots, so checking every arrangement is small enough to do instantly. This
   lets the app judge the completed defense/midfield/forward units instead of
   making a greedy choice that can accidentally build an all-Developing line. */
function fillOutfieldBalanced(avail, outSlots, form, g, seasonPos, currentPos){
  if(avail.length!==outSlots.length || avail.length>8){ return null; }
  var used=[], chosen=[], best=null, bestScore=-1e9, bestCurrent=1e9,
      bestSeason=1e9, bestRotate=1e9, metrics=[], tierById={}, d, i;

  /* Cache every candidate/slot value once. The search evaluates thousands of
     complete arrangements, so recalculating names, history and fit inside
     every branch would make Auto-fill noticeably slow on a phone. */
  for(i=0;i<avail.length;i++){
    var cachedPlayer=P(avail[i],g);
    tierById[avail[i]]=effectiveTier(cachedPlayer);
  }
  for(d=0;d<outSlots.length;d++){
    metrics[d]=[];
    var cachedSlot=form.pos[outSlots[d]];
    for(i=0;i<avail.length;i++){
      var cachedId=avail[i], cp=P(cachedId,g);
      metrics[d][i]={
        tactical:fitScore(cp,cachedSlot)+cachedSlot.imp*6,
        current:currentPos[cachedId]?(currentPos[cachedId][cachedSlot.k]||0):0,
        season:seasonPos[cachedId]?(seasonPos[cachedId][cachedSlot.k]||0):0,
        rotate:rotationRank(cp,outSlots[d])
      };
    }
  }

  function search(depth, tactical, currentUse, seasonUse, rotateUse){
    var i, id, metric;
    if(depth===outSlots.length){
      var adjusted=tactical-lineBalancePenalty(chosen,outSlots,form,tierById);
      var better=adjusted>bestScore+0.000001 ||
        (Math.abs(adjusted-bestScore)<=0.000001 &&
          (currentUse<bestCurrent ||
           (currentUse===bestCurrent &&
             (seasonUse<bestSeason ||
              (seasonUse===bestSeason && rotateUse<bestRotate)))));
      if(better){
        bestScore=adjusted; bestCurrent=currentUse; bestSeason=seasonUse;
        bestRotate=rotateUse; best=chosen.slice();
      }
      return;
    }
    for(i=0;i<avail.length;i++){
      if(used[i]){ continue; }
      id=avail[i]; metric=metrics[depth][i];
      used[i]=true; chosen.push(id);
      search(depth+1,
        tactical+metric.tactical,
        currentUse+metric.current,
        seasonUse+metric.season,
        rotateUse+metric.rotate);
      chosen.pop(); used[i]=false;
    }
  }

  search(0,0,0,0,0);
  return best;
}

function fillRowSmart(availIds, preferredKeeperId, balanceUnits){
  var g=G(), f=qForm(g,ui.q), row=blankRow(g.onField), avail=availIds.slice(), i, k;
  var seasonPos=seasonPositionHistory(), currentPos=currentPositionHistory(ui.q), currentLines=currentLineHistory(ui.q);
  var slots=[];
  for(i=0;i<f.pos.length && i<g.onField;i++){ slots.push(i); }

  /* Assign by best global pairing rather than slot-by-slot, so a strong
     midfielder isn't consumed by a high-impact defensive slot before the
     midfield slot is ever considered. Goal is resolved first because its
     eligibility is a hard rule, not a preference. */
  slots.sort(function(a,b){
    var pa=f.pos[a], pb=f.pos[b];
    if(pa.z==="G" && pb.z!=="G"){ return -1; }
    if(pb.z==="G" && pa.z!=="G"){ return 1; }
    return 0;
  });
  var gkSlots=slots.filter(function(x){ return f.pos[x].z==="G"; });
  var outSlots=slots.filter(function(x){ return f.pos[x].z!=="G"; });

  for(k=0;k<gkSlots.length;k++){
    var gs=gkSlots[k], bestG=0, bestGS=-1e8;
    for(i=0;i<avail.length;i++){
      var sg=fitScore(P(avail[i],g), f.pos[gs]);
      if(avail[i]===preferredKeeperId){ sg+=1000; }
      if(sg>bestGS){ bestGS=sg; bestG=avail[i]; }
    }
    if(bestG && bestGS>-1e8){
      row[gs]=bestG;
      avail.splice(avail.indexOf(bestG),1);
    }
  }

  function applyRotationRepair(row){
    /* Greedy and balanced filling both leave the most constrained players for
       the last open slots, which can force a third line (defense, midfield,
       forward) on someone. Swap pairs of outfielders where that removes a
       third line without creating one, and without materially worsening
       positional fit. */
    function distinctFor(pid, slotZone){
      var played=currentLines[pid]||{}, line=lineGroup(slotZone);
      return countKeys(played)+((played[line]>0)?0:1);
    }
    var pass, a, b, ia, ib;
    for(pass=0; pass<4; pass++){
      var changed=false;
      for(ia=0; ia<outSlots.length; ia++){
        a=row[outSlots[ia]];
        if(!a){ continue; }
        if(distinctFor(a, f.pos[outSlots[ia]].z)<=2){ continue; }
        for(ib=0; ib<outSlots.length; ib++){
          if(ia===ib){ continue; }
          b=row[outSlots[ib]];
          if(!b){ continue; }
          var dNow=distinctFor(a,f.pos[outSlots[ia]].z)+distinctFor(b,f.pos[outSlots[ib]].z);
          var dSwap=distinctFor(a,f.pos[outSlots[ib]].z)+distinctFor(b,f.pos[outSlots[ia]].z);
          if(dSwap>=dNow){ continue; }
          var fitNow=fitScore(P(a,g),f.pos[outSlots[ia]])+fitScore(P(b,g),f.pos[outSlots[ib]]);
          var fitSwap=fitScore(P(a,g),f.pos[outSlots[ib]])+fitScore(P(b,g),f.pos[outSlots[ia]]);
          if(fitSwap < fitNow-45){ continue; }
          row[outSlots[ia]]=b; row[outSlots[ib]]=a;
          changed=true;
          break;
        }
      }
      if(!changed){ break; }
    }
    return row;
  }

  var open=outSlots.slice();
  if(balanceUnits){
    var balanced=fillOutfieldBalanced(avail,open,f,g,seasonPos,currentPos);
    if(balanced){
      for(i=0;i<open.length;i++){ row[open[i]]=balanced[i]; }
      applyRotationRepair(row);
      return row;
    }
  }
  while(open.length && avail.length){
    var bSlot=-1, bId=0, bScore=-1e9, bCurrent=1e9, bSeason=1e9, bRotate=1e9, si, ai;
    for(si=0;si<open.length;si++){
      for(ai=0;ai<avail.length;ai++){
        var candidate=P(avail[ai],g), slot=f.pos[open[si]];
        var sc=fitScore(candidate, slot);
        /* weight by slot impact so the important slots win their first pick */
        sc = sc + slot.imp*6;
        var currentUse=currentPos[candidate.id]?(currentPos[candidate.id][slot.k]||0):0;
        var seasonUse=seasonPos[candidate.id]?(seasonPos[candidate.id][slot.k]||0):0;
        var rotate=rotationRank(candidate,open[si]);

        /* Rec soccer: give everyone a second spot across a game, but keep
           each player to two lines (defense, midfield, forward). Left back
           then right back is one line; goal isn't counted. A third line in
           one afternoon is churn, not development. */
        var played=currentPos[candidate.id]||{}, lines=currentLines[candidate.id]||{};
        var spots=countKeys(played), lineCount=countKeys(lines);
        if(!(played[slot.k]>0) && spots===1){
          sc += 16;               /* second spot: encouraged */
        }
        if(!(lines[lineGroup(slot.z)]>0) && lineCount>=2){
          sc -= 600;              /* third line in one game: avoid */
        }

        /* Strong players also get stretched across the SEASON: a bonus for a
           slot they have played less, which moves them into their secondary
           position and sometimes outside both. */
        if(effectiveTier(candidate)===1){
          sc += Math.max(0, 26 - (seasonUse*9));
        }
        var better=sc>bScore+0.000001 ||
          (Math.abs(sc-bScore)<=0.000001 &&
            (currentUse<bCurrent ||
             (currentUse===bCurrent &&
               (seasonUse<bSeason || (seasonUse===bSeason && rotate<bRotate)))));
        if(better){
          bScore=sc; bCurrent=currentUse; bSeason=seasonUse; bRotate=rotate;
          bSlot=si; bId=avail[ai];
        }
      }
    }
    if(bSlot<0 || !bId){ break; }
    row[open[bSlot]]=bId;
    avail.splice(avail.indexOf(bId),1);
    open.splice(bSlot,1);
  }

  applyRotationRepair(row);
  return row;
}

/* how useful a player is to this formation at all - used only to break
   ties when several players are equally owed a rest */
function rosterValue(player){
  var g=G(), f=qForm(g,ui.q), best=-1e9, i;
  for(i=0;i<f.pos.length && i<g.onField;i++){
    if(f.pos[i].z==="G"){ continue; }
    var sc=fitScore(player, f.pos[i]);
    if(sc>best){ best=sc; }
  }
  return best;
}

function seasonQuarterSits(q){
  var out={}, gi, i, games=playedGames();
  for(gi=0;gi<games.length;gi++){
    var old=games[gi], roster=gameRoster(old);
    if(q>=old.nq){ continue; }
    var row=rowAt(old,q);
    for(i=0;i<roster.length;i++){
      if(!availableIn(old,roster[i].id,q)){ continue; }
      if(row.indexOf(roster[i].id)<0){ out[roster[i].id]=(out[roster[i].id]||0)+1; }
    }
  }
  return out;
}

function ensureTierCoverage(sitting, protectedKeeperId, q){
  var g=G(), form=qForm(g,q), groups={}, i, p;
  for(i=0;i<form.pos.length && i<g.onField;i++){
    if(form.pos[i].z!=="G"){ groups[lineGroup(form.pos[i].z)]=true; }
  }
  var unitCount=Object.keys(groups).length;
  var pool=presentInQ(g,q).filter(function(x){ return x.id!==protectedKeeperId; });
  var possible=pool.filter(function(x){ return effectiveTier(x)<3; }).length;
  var needed=Math.min(unitCount,possible), carry=seasonTotals(), here=sitsElsewhere(q);

  function fieldNonDeveloping(){
    var n=0, j;
    for(j=0;j<pool.length;j++){
      if(sitting.indexOf(pool[j].id)<0 && effectiveTier(pool[j])<3){ n++; }
    }
    return n;
  }

  while(fieldNonDeveloping()<needed){
    var returners=pool.filter(function(x){
      return effectiveTier(x)<3 && sitting.indexOf(x.id)>=0;
    }).sort(function(a,b){
      var ar=carry[a.id]?carry[a.id].sitRate:0, br=carry[b.id]?carry[b.id].sitRate:0;
      return br-ar || (here[b.id]||0)-(here[a.id]||0) || a.name.localeCompare(b.name);
    });
    var newSitters=pool.filter(function(x){
      return effectiveTier(x)===3 && sitting.indexOf(x.id)<0;
    }).sort(function(a,b){
      var ar=carry[a.id]?carry[a.id].sitRate:0, br=carry[b.id]?carry[b.id].sitRate:0;
      return ar-br || (here[a.id]||0)-(here[b.id]||0) || a.name.localeCompare(b.name);
    });
    if(!returners.length || !newSitters.length){ break; }
    i=sitting.indexOf(returners[0].id);
    sitting[i]=newSitters[0].id;
  }
  return sitting;
}

function sitsElsewhere(skipQ){
  var g=G(), m={}, i, q, pres=presentRoster(g);
  for(i=0;i<pres.length;i++){ m[pres[i].id]=0; }
  for(q=0;q<g.nq;q++){
    if(q===skipQ){ continue; }
    var r=rowAt(g,q);
    if(!r.filter(function(x){return x>0;}).length){ continue; }
    for(i=0;i<pres.length;i++){
      if(availableIn(g,pres[i].id,q) && r.indexOf(pres[i].id)<0){ m[pres[i].id]+=1; }
    }
  }
  return m;
}
/* Who sits this quarter.
   mode "strong"  - field the strongest available tier mix for Q1
   mode "mixed"   - let current-game and season fairness choose the bench;
                    unit balancing is handled during position assignment. */
function chooseSitters(q, perQ, mode, protectedKeeperId){
  var carry=seasonTotals(), here=sitsElsewhere(q), qHistory=seasonQuarterSits(q);
  function fairness(a,b){
    /* fewest sits already banked this game, then smallest share of AVAILABLE
       quarters spent sitting - so missed games neither help nor hurt */
    var d=here[a.id]-here[b.id];
    if(d!==0){ return d; }
    var ca=carry[a.id]?carry[a.id].sitRate:0, cb=carry[b.id]?carry[b.id].sitRate:0;
    if(ca!==cb){ return ca-cb; }
    /* When total sitting is tied, rotate which quarter supplies the rest. */
    var qd=(qHistory[a.id]||0)-(qHistory[b.id]||0);
    if(qd!==0){ return qd; }
    return rosterValue(a)-rosterValue(b);
  }
  /* Select the bench from the outfield pool. The keeper assigned to this
     quarter is protected before tier proportions are calculated, rather than
     selecting her to sit and then replacing her with an arbitrary player. */
  var pool=presentInQ(G(), q).filter(function(p){ return p.id!==protectedKeeperId; });

  if(mode==="strongest"){
    /* The close-game last quarter is the best available eleven, full stop.
       Tier first, then raw positional value - fairness only breaks exact
       ties. The balanced middle quarters repay the difference. */
    pool.sort(function(a,b){
      return effectiveTier(b)-effectiveTier(a) ||
             rosterValue(a)-rosterValue(b) ||
             fairness(a,b);
    });
    return pool.slice(0,perQ).map(function(p){return p.id;});
  }

  if(mode==="developing"){
    /* Fairness leads, tier only tilts: among
       players with a similar claim to a rest, the stronger sits first. This
       keeps the quarter developmental while letting season totals self-correct
       regardless of how lopsided the games are. */
    pool.sort(function(a,b){
      var d=here[a.id]-here[b.id];
      if(d!==0){ return d; }
      var ca=carry[a.id]?carry[a.id].sitRate:0, cb=carry[b.id]?carry[b.id].sitRate:0;
      /* a meaningful season gap outranks the tilt; a small one does not */
      if(Math.abs(ca-cb)>0.04){ return ca-cb; }
      if(effectiveTier(a)!==effectiveTier(b)){ return effectiveTier(a)-effectiveTier(b); }
      var qd=(qHistory[a.id]||0)-(qHistory[b.id]||0);
      if(qd!==0){ return qd; }
      return a.name.localeCompare(b.name);
    });
    return pool.slice(0,perQ).map(function(p){return p.id;});
  }

  if(mode==="strong"){
    /* Q1 is strong but NOT maximal. Strong players are protected, and the
       bench is then chosen by fairness across everyone else. Because the
       close-finish quarter already sits the developing players, their sit
       rate is higher, so fairness naturally puts middles on the Q1 bench -
       which is what keeps season totals from drifting apart. */
    var protectedStrong=pool.filter(function(p){ return effectiveTier(p)===1; });
    var rest=pool.filter(function(p){ return effectiveTier(p)!==1; }).sort(fairness);
    var out=rest.slice(0,perQ).map(function(p){return p.id;});
    /* tiny rosters: if protecting every strong player leaves too few to sit,
       fall back to the fairest strong players */
    var pi=0, ps=protectedStrong.slice().sort(fairness);
    while(out.length<perQ && pi<ps.length){ out.push(ps[pi++].id); }
    return out;
  }

  /* After Q1, fairness leads. ensureTierCoverage() makes the smallest needed
     adjustment if that fair bench would leave a whole unit Developing. */
  pool.sort(fairness);
  return pool.slice(0,perQ).map(function(p){return p.id;});
}

/* Of the two keepers, the one who has kept goal in the first quarter of
   fewer played games this season; GK 1 when it's even. */
function firstHalfKeeper(pk, bk){
  if(!pk || !bk){ return pk; }
  var starts={}, games=playedGames(), current=G(), i, j, g, f, id;
  for(i=0;i<games.length;i++){
    g=games[i];
    if(g===current || !g.plan[0]){ continue; }
    f=qForm(g,0);
    for(j=0;j<f.pos.length;j++){
      id=g.plan[0][j];
      if(f.pos[j].z==="G" && id){ starts[id]=(starts[id]||0)+1; }
    }
  }
  return (starts[bk.id]||0) < (starts[pk.id]||0) ? bk : pk;
}
/* Setup: fill in the match format for an age group. Leagues differ, so these
   are starting points (U.S. Soccer's age formats; game lengths from one
   state's recreational rules) and every number stays editable. */
var AGE_PRESETS={
  u10:{n:7, p:4, m:12},
  u12:{n:9, p:2, m:30},
  u13:{n:11, p:2, m:35}
};
function applyAgePreset(v){
  var p=AGE_PRESETS[v], g=S.current;
  if(!p){ render(); return; }
  var placed=g.plan.some(function(r){ return r.some(function(x){ return x>0; }); });
  if(placed && (p.n!==g.onField || p.p!==g.nq) &&
     !confirm("This changes the number of players on the field or of periods, which clears the game you're planning. Go ahead?")){
    render(); return;
  }
  S.cfg.minutes=p.m; S.cfg.quarters=p.p;
  setFieldSize(String(p.n));
  g=S.current;
  if(g.nq!==p.p){
    discardUndoForGame(g);
    g.nq=p.p;
    g.plan=blankPlan(g.nq,g.onField);
    g.formations=defaultFormations(g.nq,g.formation);
    if(g.goals){ g.goals={}; }
  }
  g.qlen=p.m;
  ui.q=0; ui.selSlot=-1; ui.selPlayer=0;
  save(); render();
}
function setKeeperPlan(v){
  S.cfg.keeperPlan=(["halves","turns","middle"].indexOf(v)>=0)?v:"halves";
  save(); render();
}

function autoFillQuarter(){
  var g=G(), q=ui.q, F=g.onField, pres=presentInQ(g,q), perQ=pres.length-F;
  rememberGameChange("auto-fill "+PW(g).s+(q+1));
  if(perQ<0){ perQ=0; }

  /* Q1 opens strong. Every other quarter, Q4 included, uses the same fair
     selection - if the game is tight you change it by hand on the day. */
  var sitMode = (q===0) ? "strong" : "mixed";

  var pk=primaryKeeper(), bk=backupKeeper(), wantedKeeper;
  if(S.cfg.keeperPlan==="middle"){
    /* GK 1 starts and finishes; GK 2 takes the middle quarters */
    wantedKeeper=(q===0 || isLastQ()) ? pk : (bk||pk);
  }else{
    /* one keeper each half, switching at halftime: GK 1 takes the first half,
       or with "turns", whoever has started fewer games this season */
    var first=(S.cfg.keeperPlan==="turns") ? firstHalfKeeper(pk,bk) : pk;
    var second=(first===pk)?(bk||pk):pk;
    wantedKeeper=(q < g.nq/2) ? first : second;
  }
  var sitting=chooseSitters(q, perQ, sitMode, wantedKeeper?wantedKeeper.id:0);
  sitting=ensureTierCoverage(sitting,wantedKeeper?wantedKeeper.id:0,q);

  /* Goal must be covered, and the primary keeper takes the strong quarters. */
  var carry2=seasonTotals(), here2=sitsElsewhere(q);
  var ranked=pres.slice().sort(function(a,b){
    var d=here2[a.id]-here2[b.id];
    if(d!==0){ return d; }
    var ca=carry2[a.id]?carry2[a.id].sitRate:0, cb=carry2[b.id]?carry2[b.id].sitRate:0;
    if(ca!==cb){ return ca-cb; }
    return rosterValue(a)-rosterValue(b);
  });
  function seatOnField(playerId){
    if(!playerId){ return; }
    if(sitting.indexOf(playerId)<0){ return; }
    sitting.splice(sitting.indexOf(playerId),1);
    var ri;
    for(ri=0;ri<ranked.length;ri++){
      var cand=ranked[ri];
      if(cand.id===playerId){ continue; }
      if(sitting.indexOf(cand.id)>=0){ continue; }
      if(canKeep(cand)){ continue; }
      sitting.push(cand.id);
      return;
    }
    for(ri=0;ri<ranked.length;ri++){
      if(ranked[ri].id!==playerId && sitting.indexOf(ranked[ri].id)<0){
        sitting.push(ranked[ri].id); return;
      }
    }
  }

  if(wantedKeeper){
    seatOnField(wantedKeeper.id);
  }

  var avail=pres.filter(function(p){ return sitting.indexOf(p.id)<0; }).map(function(p){return p.id;});
  g.plan[q]=fillRowSmart(avail,wantedKeeper?wantedKeeper.id:0,true);
  save(); render();
}

function autoFillAll(){
  var g=G(), q, sq=ui.q;
  rememberGameChange("auto-fill whole game");
  suppressUndo=true;
  try{
    g.plan=blankPlan(g.nq,g.onField);
    /* Q1 first (it has the fixed strength rule), then the rest in order. */
    ui.q=0; autoFillQuarter();
    for(q=1;q<g.nq;q++){ ui.q=q; autoFillQuarter(); }
  }finally{
    suppressUndo=false;
  }
  ui.q=sq;
  save(); render();
}

function togglePrev(){
  ui.showPrev = (ui.showPrev===false);
  render();
}
function clearQuarter(){
  var g=G();
  rememberGameChange("clear "+PW(g).s+(ui.q+1));
  g.plan[ui.q]=blankRow(g.onField);
  ui.selSlot=-1; ui.selPlayer=0;
  save(); render();
}
function clearPlan(){
  if(!confirm("Clear every "+PW().low+" of this game?")){ return; }
  var g=G();
  rememberGameChange("clear whole game");
  g.plan=blankPlan(g.nq,g.onField);
  ui.selSlot=-1; ui.selPlayer=0;
  save(); render();
}
/* Setup: how many players are on the field. Every quarter of a game must put
   the same number on the field, so changing this restarts the game plan. */
function setFieldSize(v){
  var n=Number(v), fits=formationsFor(n);
  if(!fits.length){ render(); return; }
  if(n!==S.cfg.onField){
    S.cfg.onField=n;
    if(!FORMATIONS[S.cfg.formation] || FORMATIONS[S.cfg.formation].n!==n){ S.cfg.formation=fits[0]; }
    var g=S.current;
    discardUndoForGame(g);
    g.onField=n; g.formation=S.cfg.formation;
    g.formations=defaultFormations(g.nq,g.formation);
    g.plan=blankPlan(g.nq,g.onField);
    ui.selSlot=-1; ui.selPlayer=0;
  }
  save(); render();
}
/* Setup: the formation every new game starts with. Quarters of the game being
   planned that have nobody placed yet pick it up too; filled quarters keep
   what they have. */
function setDefaultFormation(v){
  if(!FORMATIONS[v] || FORMATIONS[v].n!==S.cfg.onField){ render(); return; }
  S.cfg.formation=v;
  var g=S.current, q;
  if(g.onField===S.cfg.onField){
    g.formation=v;
    for(q=0;q<g.nq;q++){
      if(!g.plan[q].filter(function(x){ return x>0; }).length){ g.formations[q]=v; }
    }
  }
  save(); render();
}
/* Move the players already placed in a quarter onto the most similar slots of
   another formation: the keeper stays in goal, defenders stay in defense, and
   so on. Nobody is sent to the bench, so quarters played are unchanged. */
function remapRow(row, fromForm, toForm, g){
  var out=blankRow(g.onField), pairs=[], placed={}, taken={}, i, j;
  for(i=0;i<row.length && i<fromForm.pos.length;i++){
    if(!row[i]){ continue; }
    var pl=P(row[i],g), oz=fromForm.pos[i].z;
    for(j=0;j<toForm.pos.length && j<g.onField;j++){
      var nz=toForm.pos[j].z;
      var sim=(ADJ[oz] && ADJ[oz][nz]!==undefined) ? ADJ[oz][nz] : (oz===nz?1:0);
      pairs.push({from:i,to:j,sim:sim,
        sameKey:(fromForm.pos[i].k===toForm.pos[j].k)?1:0,
        fit:fitScore(pl,toForm.pos[j])});
    }
  }
  pairs.sort(function(a,b){
    return b.sim-a.sim || b.sameKey-a.sameKey || b.fit-a.fit || a.from-b.from || a.to-b.to;
  });
  for(i=0;i<pairs.length;i++){
    if(placed[pairs[i].from] || taken[pairs[i].to]){ continue; }
    out[pairs[i].to]=row[pairs[i].from];
    placed[pairs[i].from]=true; taken[pairs[i].to]=true;
  }
  /* safety net: anyone still unplaced takes the first open slot */
  for(i=0;i<row.length;i++){
    if(!row[i] || placed[i]){ continue; }
    for(j=0;j<out.length;j++){ if(!out[j]){ out[j]=row[i]; placed[i]=true; break; } }
  }
  return out;
}
/* Plan: the formation for the quarter being viewed, or for every quarter */
function setQuarterFormation(v, allQuarters){
  var g=G(), to=FORMATIONS[v], q, any=false;
  if(!to || to.n!==g.onField){ render(); return; }
  if(!g.formations){ g.formations=defaultFormations(g.nq,g.formation); }
  for(q=0;q<g.nq;q++){
    if((allQuarters || q===ui.q) && qFormName(g,q)!==v){ any=true; }
  }
  if(!any){ render(); return; }
  rememberGameChange(allQuarters?"formation change, all "+PW(g).lows:"formation change "+PW(g).s+(ui.q+1));
  for(q=0;q<g.nq;q++){
    if(!allQuarters && q!==ui.q){ continue; }
    if(qFormName(g,q)===v){ continue; }
    g.plan[q]=remapRow(g.plan[q],qForm(g,q),to,g);
    g.formations[q]=v;
  }
  ui.selSlot=-1; ui.selPlayer=0;
  save(); render();
}
function useFormationForAllQuarters(){
  setQuarterFormation(qFormName(G(),ui.q), true);
}

/* ---------- place / swap ---------- */
function placeIn(slot,id){
  var row=curRow(), j;
  rememberGameChange("player placement");
  for(j=0;j<row.length;j++){ if(row[j]===id){ row[j]=0; } }
  row[slot]=id; save();
}
function tapSlot(i){
  if(ui.selPlayer){ placeIn(i,ui.selPlayer); ui.selPlayer=0; ui.selSlot=-1; }
  else if(ui.selSlot===i){ ui.selSlot=-1; }
  else if(ui.selSlot>=0){
    var row=curRow(), a=row[ui.selSlot], b=row[i];
    rememberGameChange("player swap");
    row[ui.selSlot]=b; row[i]=a; ui.selSlot=-1; save();
  }else{ ui.selSlot=i; }
  render();
}
function tapBench(id){
  if(!id){ return; }
  if(ui.selSlot>=0){ placeIn(ui.selSlot,id); ui.selSlot=-1; ui.selPlayer=0; }
  else { ui.selPlayer=(ui.selPlayer===id)?0:id; }
  render();
}

/* ---------- drag ---------- */
var drag={active:false,id:0,fromSlot:-1,moved:false,hot:-1};
var ghost=null;
function ghostEl(){ if(!ghost){ ghost=document.getElementById("ghost"); } return ghost; }
function startDrag(ev,id,fromSlot){
  if(ev.button!==undefined && ev.button!==0){ return; }
  drag.active=true; drag.id=id;
  drag.fromSlot=(fromSlot===undefined?-1:fromSlot);
  drag.moved=false; drag.hot=-1;
  var g=ghostEl();
  g.textContent=id?nameOf(id,G()):"";
  g.style.left=ev.clientX+"px"; g.style.top=ev.clientY+"px";
  document.addEventListener("pointermove",onDragMove,{passive:false});
  document.addEventListener("pointerup",onDragEnd);
  document.addEventListener("pointercancel",onDragEnd);
}
function onDragMove(ev){
  if(!drag.active){ return; }
  if(!drag.moved){
    if(!drag.id){ return; }
    drag.moved=true; ghostEl().style.display="block";
  }
  ev.preventDefault();
  var g=ghostEl();
  g.style.left=ev.clientX+"px"; g.style.top=ev.clientY+"px";
  var el=document.elementFromPoint(ev.clientX,ev.clientY), slot=-1;
  while(el && el!==document.body){
    if(el.getAttribute && el.getAttribute("data-slot")!==null){
      slot=Number(el.getAttribute("data-slot")); break;
    }
    el=el.parentNode;
  }
  if(slot!==drag.hot){ drag.hot=slot; highlightHot(); }
}
function highlightHot(){
  var boxes=document.querySelectorAll("#pitchSvg .slotbox"), i;
  for(i=0;i<boxes.length;i++){
    if(Number(boxes[i].getAttribute("data-slot"))===drag.hot){ boxes[i].classList.add("hot"); }
    else { boxes[i].classList.remove("hot"); }
  }
}
function onDragEnd(){
  document.removeEventListener("pointermove",onDragMove);
  document.removeEventListener("pointerup",onDragEnd);
  document.removeEventListener("pointercancel",onDragEnd);
  ghostEl().style.display="none";
  if(!drag.active){ return; }
  var wasMoved=drag.moved, target=drag.hot, id=drag.id, from=drag.fromSlot;
  drag.active=false; drag.moved=false; drag.hot=-1;
  if(!wasMoved){
    if(from>=0){ tapSlot(from); } else { tapBench(id); }
    return;
  }
  if(target>=0 && target!==from){
    var row=curRow();
    if(from>=0){
      rememberGameChange("player move");
      var other=row[target]; row[target]=id; row[from]=other; save();
    }
    else { placeIn(target,id); }
  }else if(target<0 && from>=0){
    rememberGameChange("remove player from lineup");
    curRow()[from]=0; save();
  }
  ui.selSlot=-1; ui.selPlayer=0;
  render();
}

/* ---------- archive / edit ---------- */
function archiveGame(){
  if(ui.editId){
    save();
    if(HA){ alert("Changes saved."); return; }
    if(S.cfg.autoBackup && usesShareSheet()){ showBackupToast("Changes saved. Save a backup copy?"); return; }
    if(S.cfg.autoBackup){ exportData(); }
    alert("Changes saved."+(S.cfg.autoBackup?" A backup file was downloaded too.":""));
    return;
  }
  var g=S.current, qt=gameQtrs(g), total=0, i, roster=gameRoster(g);
  for(i=0;i<roster.length;i++){ total+=qt[roster[i].id]||0; }
  if(total===0){ alert("Nothing planned yet."); return; }
  var future=!!(g.date && g.date>todayISO() && g.oppGoals===null && teamGoals(g)===0);
  if(future){
    if(!confirm("This game is on "+g.date+", after today. Save it as a planned game?\n\nA planned game doesn't count toward season totals until you mark it played (or enter the opponent's score).")){ return; }
  }else if(g.oppGoals===null && !confirm("No opponent score has been entered. Save this game without a result? You can add the score later by reopening the game.")){ return; }
  g.planned=future;
  g.id=S.nextGameId++;
  g.rosterSnapshot=copyRoster(S.roster);
  S.games.push(g);
  S.current=newGame();
  ui.q=0;
  save();
  if(!HA){
    if(S.cfg.autoBackup){
      if(usesShareSheet()){ showBackupToast("Game saved. Save a backup copy?"); }
      else { exportData(); }
    }
    askForPersistentStorage();
  }
  showTab("season");
}
function setPlayed(id, played){
  var i;
  for(i=0;i<S.games.length;i++){
    if(S.games[i].id===id){ S.games[i].planned=!played; }
  }
  save(); render();
}
function editGame(id){
  ui.editId=id; ui.q=0;

  showTab("plan");
  window.scrollTo(0,0);
}
function stopEditing(){
  ui.editId=0; ui.q=0;
  save(); render();
}
function delGame(i){
  if(!confirm("Delete this game?")){ return; }
  discardUndoForGame(S.games[i]);
  if(S.games[i].id===ui.editId){ ui.editId=0; }
  S.games.splice(i,1); save(); render();
}
function resetSeason(){
  if(!confirm("Delete every saved game? The roster stays.")){ return; }
  S.games=[]; undoStack=[]; ui.editId=0; save(); render();
}

/* ---------- roster / cfg ---------- */
function addPlayer(){
  var nm=document.getElementById("newName").value.trim();
  if(!nm){ return; }
  var nu=document.getElementById("newNum").value.trim();
  S.roster.push({id:S.nextId++,name:nm,num:nu,tier:0,p1:"",p2:"",gkOrder:0});
  document.getElementById("newName").value="";
  document.getElementById("newNum").value="";
  save(); render();
}
function delPlayer(id){
  if(!confirm("Remove "+nameOf(id)+" from the active roster? This removes them from the current game's lineups and goals. Saved games and season history will stay intact.")){ return; }
  discardUndoForGame(S.current);
  S.roster=S.roster.filter(function(p){return p.id!==id;});
  var g=S.current, q, j;
  for(q=0;q<g.plan.length;q++){
    for(j=0;j<g.plan[q].length;j++){ if(g.plan[q][j]===id){ g.plan[q][j]=0; } }
  }
  if(g.goals){ delete g.goals[id]; }
  if(g.out){ delete g.out[id]; }
  save(); render();
}
function editPlayer(id,field,val){
  var p=P(id); if(!p){ return; }
  if(field==="gkOrder"){
    var rank=Number(val)||0, i;
    if(rank){
      for(i=0;i<S.roster.length;i++){
        if(S.roster[i].id!==id && S.roster[i].gkOrder===rank){ S.roster[i].gkOrder=0; }
      }
    }
    p.gkOrder=rank;
  }else if(field==="tier"){ p.tier=Number(val); }
  else { p[field]=val; }
  if((field==="p1" || field==="p2") && !canKeep(p)){ p.gkOrder=0; }
  save(); render();
}
function saveCfg(){
  S.cfg.team=document.getElementById("cfgTeam").value.trim()||"Team";
  S.cfg.quarters=Math.max(2,Math.min(4,Number(document.getElementById("cfgQ").value)||4));
  S.cfg.minutes=Math.max(5,Math.min(45,Number(document.getElementById("cfgMin").value)||15));
  var g=S.current;
  if(g.nq!==S.cfg.quarters){
    discardUndoForGame(g);
    g.nq=S.cfg.quarters;
    g.plan=blankPlan(g.nq,g.onField);
    g.formations=defaultFormations(g.nq,g.formation);
  }
  g.qlen=S.cfg.minutes;
  if(ui.q>lastQ()){ ui.q=lastQ(); }
  save(); render();
}
function backupFileName(){
  var team=(S.cfg.team||"Team").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  return (team||"Team")+"-SoccerLineup-backup-"+todayISO()+".json";
}
function backupText(stamp){
  var backup=JSON.parse(JSON.stringify(S));
  backup.lastBackupAt=stamp;
  backup.backupInfo={app:"SoccerLineup",formatVersion:1,exportedAt:stamp};
  return JSON.stringify(backup,null,2);
}
/* Phones and tablets save backups through the share sheet (Save to Files,
   AirDrop, Mail, Messages): iPhone Safari may block a download that a page
   starts. Computers download as usual. Returns the file to share, or null
   to download instead. */
function shareableBackup(text){
  try{
    if(!navigator.share || !navigator.canShare || !window.File){ return null; }
    if(!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches)){ return null; }
    var types=["application/json","text/plain"], i, file;
    for(i=0;i<types.length;i++){
      file=new File([text], backupFileName(), {type:types[i]});
      if(navigator.canShare({files:[file]})){ return file; }
    }
  }catch(e){}
  return null;
}
function usesShareSheet(){ return !!shareableBackup("{}"); }
function exportData(){
  var stamp=new Date().toISOString(), text=backupText(stamp), file=shareableBackup(text);
  if(file){
    navigator.share({files:[file], title:file.name}).then(function(){
      hideBackupToast();
      backupSaved(stamp);
    }, function(err){
      if(err && err.name==="AbortError"){ return; }   /* closed the share sheet */
      /* usually: the phone wants a fresh tap before sharing */
      showBackupToast("Tap Save backup to keep a copy.");
    });
    return;
  }
  var blob=new Blob([text],{type:"application/json"});
  var a=document.createElement("a"), url=URL.createObjectURL(blob);
  a.href=url;
  a.download=backupFileName();
  document.body.appendChild(a);
  a.click();
  /* some browsers start the download after click() returns, so release the
     file a little later rather than immediately */
  setTimeout(function(){ URL.revokeObjectURL(url); if(a.parentNode){ a.parentNode.removeChild(a); } },4000);
  backupSaved(stamp);
}
function backupSaved(stamp){
  S.lastBackupAt=stamp;
  save();
  renderBackupStatus();
}
/* After saving a game on a phone: a button to save the backup, since the
   share sheet has to open from a tap. */
function showBackupToast(message){
  var t=document.getElementById("backupToast");
  if(!t){ return; }
  document.getElementById("backupToastText").textContent=message;
  t.hidden=false;
}
function hideBackupToast(){
  var t=document.getElementById("backupToast");
  if(t){ t.hidden=true; }
}
function setAutoBackup(on){
  S.cfg.autoBackup=!!on;
  save(); render();
}
function renderBackupStatus(){
  var el=document.getElementById("backupStatus"), box=document.getElementById("cfgAutoBackup");
  if(box){ box.checked=!!S.cfg.autoBackup; }
  var phone=usesShareSheet(), btn=document.getElementById("backupBtn"), lbl=document.getElementById("autoBackupText");
  if(btn){ btn.textContent=phone?"Save backup":"Download backup"; }
  if(lbl){ lbl.textContent=phone?" Offer to save a backup every time I save a game":" Download a backup every time I save a game"; }
  if(!el){ return; }
  if(HA){ haRenderBackupStatus(el); return; }
  var when=S.lastBackupAt?new Date(S.lastBackupAt):null, stale=false, text;
  if(when && !isNaN(when.getTime())){
    var days=Math.floor((Date.now()-when.getTime())/86400000);
    text="Last backup from this browser: "+when.toLocaleDateString()+" at "+
         when.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"})+".";
    stale=days>=14 && S.games.length>0;
    if(stale){ text+=" That was "+days+" days ago, so download a fresh one."; }
  }else{
    text="No backup has been downloaded from this browser yet.";
    stale=S.games.length>0;
  }
  el.textContent=text;
  el.className=stale?"warn":"hint";
}
/* Ask the browser not to clear this app's data when space runs low. Most
   browsers decide silently; Firefox may ask once. Asked after a game is
   saved, so the question comes when there is something worth keeping. */
function askForPersistentStorage(){
  try{
    if(!navigator.storage || !navigator.storage.persist || !navigator.storage.persisted){ return; }
    navigator.storage.persisted().then(function(already){
      if(!already){ return navigator.storage.persist(); }
    }).catch(function(){});
  }catch(e){}
}
function importData(ev){
  var f=ev.target.files[0]; if(!f){ return; }
  if(!confirm(HA ?
      "Restore this backup? It will replace the season on Home Assistant for every device. The current season is kept under Earlier versions." :
      "Restore this backup? It will replace the team, roster, current lineup, and saved games currently stored in this browser.")){
    ev.target.value="";
    return;
  }
  var r=new FileReader();
  r.onload=function(){
    try{
      var d=JSON.parse(r.result);
      if(!d.roster||!d.cfg){ throw new Error("bad"); }
      normalizeState(d);
      undoStack=[];
      ui.editId=0; ui.q=0;
      if(HA){ sync.checkpoint="import"; }
      save(); render();
      alert("Backup restored successfully: "+S.cfg.team+", "+S.roster.length+" players, "+S.games.length+" saved game"+(S.games.length===1?"":"s")+".");
    }catch(e){ alert("That file isn't a backup from this tool."); }
  };
  r.readAsText(f);
  ev.target.value="";
}

/* ---------- render ---------- */
function render(){
  document.getElementById("brandTop").textContent=S.cfg.team;
  document.getElementById("brandSub").textContent=S.cfg.onField+"v"+S.cfg.onField+" \u00b7 "+S.roster.length+" players";
  haRenderChrome();
  renderPlan(); renderSeason(); renderSetup(); renderPrint();
  renderUndoButtons(); renderBackupStatus();
}

function numOf(id,g){ var p=id?P(id,g):null; return (p && p.num) ? String(p.num) : ""; }

function pitchSVG(g,row,interactive,q){
  if(q===undefined){ q=0; }
  var f=qForm(g,q), i, s="";
  s+='<svg viewBox="0 0 320 400" xmlns="http://www.w3.org/2000/svg">';
  s+='<rect x="0" y="0" width="320" height="400" fill="'+(interactive?"#EDF4EF":"#ffffff")+'"/>';
  s+='<g fill="none" stroke="'+(interactive?"#B9CDC0":"#777")+'" stroke-width="2">';
  s+='<rect x="8" y="6" width="304" height="388"/>';
  s+='<line x1="8" y1="6" x2="312" y2="6"/>';
  s+='<circle cx="160" cy="6" r="52"/>';
  s+='<rect x="72" y="316" width="176" height="78"/>';
  s+='<rect x="116" y="360" width="88" height="34"/>';
  s+='<path d="M116 316 A 46 46 0 0 0 204 316"/>';
  s+='</g>';
  for(i=0;i<f.pos.length && i<g.onField;i++){
    var p=f.pos[i], id=row[i]||0, pl=id?P(id,g):null;
    if(interactive){
      var cls="slotbox"+(id?"":" empty")+(ui.selSlot===i?" sel":"")+
              (pl&&pl.tier===1?" tier1":"")+(pl&&pl.tier===3?" tier3":"");
      s+='<g class="slot">';
      s+='<rect class="'+cls+'" data-slot="'+i+'" x="'+(p.x-34)+'" y="'+(p.y-16)+
         '" width="68" height="32" rx="6" onpointerdown="startDrag(event,'+id+','+i+')"/>';
      s+='<text class="slotpos" x="'+p.x+'" y="'+(p.y-3)+'">'+p.k+'</text>';
      var inum=numOf(id,g);
      s+='<text class="slotname" x="'+p.x+'" y="'+(p.y+11)+'">'+
         (inum?'<tspan class="slotnum">'+esc(inum)+'</tspan> ':'')+
         esc(id?nameOf(id,g):"\u2014")+'</text>';
      s+='</g>';
    }else{
      /* name plate plus a goal box on the right, marked by hand during the game */
      var bw=17, pw=78, px0=p.x-(pw/2)-(bw/2);
      s+='<rect x="'+px0+'" y="'+(p.y-17)+'" width="'+pw+'" height="34" rx="3" fill="#fff" stroke="#000" stroke-width="1.4"/>';
      s+='<text x="'+(px0+pw/2)+'" y="'+(p.y-4)+'" text-anchor="middle" font-size="8.5" font-weight="700" fill="#555" font-family="Helvetica,Arial">'+p.k+'</text>';
      var pnum=numOf(id,g);
      s+='<text x="'+(px0+pw/2)+'" y="'+(p.y+11)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#000" font-family="Helvetica,Arial">'+
         (pnum?'<tspan font-size="10" fill="#555">'+esc(pnum)+'</tspan> ':'')+
         esc(id?nameOf(id,g):"\u2014")+'</text>';
      s+='<rect x="'+(px0+pw)+'" y="'+(p.y-17)+'" width="'+bw+'" height="34" fill="#fff" stroke="#000" stroke-width="1.4"/>';
      var gv2 = id ? goalsOf(g, id, q) : 0;
      s+='<text x="'+(px0+pw+bw/2)+'" y="'+(p.y+6)+'" text-anchor="middle" font-size="13" font-weight="800" fill="#000" font-family="Helvetica,Arial">'+(gv2?gv2:'')+'</text>';
    }
  }
  s+='</svg>';
  return s;
}

function chipHTML(p){
  var gkLabel=canKeep(p)?(p.gkOrder?"GK"+p.gkOrder:"GK"):"";
  return '<button class="chip'+(ui.selPlayer===p.id?" sel":"")+(p.tier===1?" t1":(p.tier===3?" t3":""))+
         '" onpointerdown="startDrag(event,'+p.id+')">'+
         (p.num?'<span class="n">'+esc(p.num)+'</span>':'')+esc(p.name)+
         (gkLabel?'<span class="gkmark">'+gkLabel+'</span>':'')+'</button>';
}

function renderPlan(){
  var g=G(), rosterNow=gameRoster(g), Q=g.nq, i, q, h="";

  var banner=document.getElementById("editBanner");
  if(ui.editId){
    banner.hidden=false;
    banner.innerHTML='<span>Editing '+(g.planned?'a planned game (not counted in the season yet)':'saved game')+': '+(esc(g.opp)||"no opponent")+' on '+esc(g.date)+
      '. Changes save as you go.</span>'+
      (g.planned?'<button class="btn sm green" onclick="setPlayed('+g.id+',true)">Mark played</button>':'')+
      '<button class="btn sm quiet" onclick="stopEditing()">Back to next game</button>';
  }else{ banner.hidden=true; banner.innerHTML=""; }

  document.getElementById("fOpp").value=g.opp||"";
  document.getElementById("fDate").value=g.date||"";
  var notesEl=document.getElementById("fNotes");
  if(notesEl && document.activeElement!==notesEl){ notesEl.value=g.notes||""; }
  renderOpponentNotes(g);
  document.getElementById("fOppGoals").value=(g.oppGoals===null || g.oppGoals===undefined)?"":g.oppGoals;
  document.getElementById("doneEditBtn").hidden=!ui.editId;
  document.getElementById("archiveBtn").textContent=
    ui.editId ? "Save changes" : "Save game to season";
  document.getElementById("saveHint").textContent=
    ui.editId ? (g.planned ? "This is a planned game: it counts toward season totals once you mark it played or enter the opponent's score."
                           : "This game is already in the season. Edits count toward season totals immediately.")
              : "Saving files this game in the season and starts a fresh one. You can reopen and edit it any time. A game dated after today is saved as planned.";
  var presNow=presentRoster(g);
  var outCount=rosterNow.length-presNow.length;
  var leftNames=presNow.filter(function(p){ return leftFrom(g,p.id)>=0; }).map(function(p){ return p.name+" from "+PW(g).s+(leftFrom(g,p.id)+1); });
  document.getElementById("gameStatus").textContent=
    presNow.length+" available"+(outCount?" ("+outCount+" out)":"")+(leftNames.length?", left the game: "+leftNames.join(", "):"")+", "+g.onField+" on \u2014 "+
    Math.max(0,presNow.length-g.onField)+" sit each "+PW(g).low+". Equal share is "+
    (presNow.length?((g.onField*g.nq)/presNow.length).toFixed(2):"0")+" "+PW(g).lows+".";

  var ah="", ai2;
  var alpha=rosterNow.slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
  for(ai2=0;ai2<alpha.length;ai2++){
    var ap=alpha[ai2];
    ah+='<button class="chip'+(isOut(g,ap.id)?" out":"")+'" onclick="toggleOut('+ap.id+')">'+
        esc(ap.name)+'</button>';
  }
  document.getElementById("availChips").innerHTML=ah;

  /* left the game partway through */
  var lw='<option value="">Who?</option>', lf='', lc='', li;
  for(li=0;li<alpha.length;li++){
    if(isOut(g,alpha[li].id)){ continue; }
    if(leftFrom(g,alpha[li].id)>=0){
      lc+='<button class="chip out" onclick="clearLeft('+alpha[li].id+')" title="Back in the game">'+
          esc(alpha[li].name)+' &middot; left from '+PW(g).s+(leftFrom(g,alpha[li].id)+1)+' &times;</button>';
    }else{
      lw+='<option value="'+alpha[li].id+'">'+esc(alpha[li].name)+'</option>';
    }
  }
  for(li=1;li<Q;li++){ lf+='<option value="'+li+'">from '+PW(g).s+(li+1)+'</option>'; }
  document.getElementById("leftWho").innerHTML=lw;
  document.getElementById("leftFrom").innerHTML=lf;
  document.getElementById("leftChips").innerHTML=lc;

  h="";
  for(i=0;i<Q;i++){
    h+='<button role="tab" aria-selected="'+(ui.q===i?"true":"false")+
       '" onclick="ui.q='+i+';ui.selSlot=-1;ui.selPlayer=0;render()">'+PW(g).s+(i+1)+
       '<span class="qf">'+qFormName(g,i)+'</span></button>';
  }
  document.getElementById("qtabs").innerHTML=h;

  document.getElementById("pitchTitle").textContent=PW(g).one+" "+(ui.q+1);
  document.getElementById("allFormBtn").textContent="All "+PW(g).lows;
  document.getElementById("allFormBtn").title="Use this "+PW(g).low+"'s formation for every "+PW(g).low;
  document.getElementById("playedTitle").textContent=PW(g).many+" played";

  var fits=formationsFor(g.onField), fh="", fi, mixed=false;
  for(fi=0;fi<fits.length;fi++){
    fh+='<option value="'+fits[fi]+'"'+(fits[fi]===qFormName(g,ui.q)?" selected":"")+'>'+fits[fi]+'</option>';
  }
  document.getElementById("qFormation").innerHTML=fh;
  for(q=0;q<Q;q++){ if(qFormName(g,q)!==qFormName(g,ui.q)){ mixed=true; } }
  document.getElementById("allFormBtn").hidden=!mixed;

  document.getElementById("pitchSvg").outerHTML=
    pitchSVG(g,curRow(),true,ui.q).replace('<svg ','<svg class="pitch" id="pitchSvg" ');

  var row=curRow();
  var bench=presentInQ(g,ui.q).filter(function(p){ return row.indexOf(p.id)<0; });
  document.getElementById("benchHdr").textContent="Sitting ("+bench.length+")";

  bench.sort(function(a,b){ return a.name.localeCompare(b.name); });
  var strip="", left="", right="", half=Math.ceil(bench.length/2);
  for(i=0;i<bench.length;i++){
    var c=chipHTML(bench[i]);
    strip+=c;
    if(i<half){ left+=c; } else { right+=c; }
  }
  document.getElementById("benchStrip").innerHTML=strip||'<span class="hint">Everyone is on the field.</span>';
  document.getElementById("benchLeft").innerHTML=left;
  document.getElementById("benchRight").innerHTML=right;

  var warn=[];
  for(q=0;q<Q;q++){
    var checks=[["",g.plan[q]]];
    checks.forEach(function(c){
      var r=c[1], seen={}, j;
      for(j=0;j<r.length;j++){
        if(!r[j]){ continue; }
        if(seen[r[j]]){ warn.push(PW(g).s+(q+1)+(c[0]?" "+c[0]:"")+": "+nameOf(r[j],g)+" twice."); }
        seen[r[j]]=1;
      }
      var filled=r.filter(function(x){return x>0;}).length;
      if(filled>0 && filled<g.onField){
        warn.push(PW(g).s+(q+1)+(c[0]?" "+c[0]:"")+": "+filled+" of "+g.onField+" filled.");
      }
      var ff=qForm(g,q), gi2;
      for(gi2=0;gi2<ff.pos.length && gi2<g.onField;gi2++){
        if(ff.pos[gi2].z==="G" && filled>0 && !r[gi2]){
          warn.push(PW(g).s+(q+1)+(c[0]?" "+c[0]:"")+": no goalkeeper \u2014 set Goalie as a position in Setup.");
        }
      }
    });
  }
  document.getElementById("planWarn").textContent=warn.join("  ");

  /* reference copy of the previous period - screen only, never printed */
  var prevWrap=document.getElementById("prevWrap");
  if(ui.q>0){
    prevWrap.hidden=false;
    var showPrev=(ui.showPrev!==false);
    document.getElementById("prevBody").style.display=showPrev?"":"none";
    document.getElementById("prevToggle").textContent=showPrev?"Hide":"Show";
    document.getElementById("prevTitle").textContent="For reference: "+PW(g).one+" "+ui.q+" ("+qFormName(g,ui.q-1)+")";
    if(showPrev){
      var prevRow=g.plan[ui.q-1]||[], nowRow=curRow(), pfPrev=qForm(g,ui.q-1), pfNow=qForm(g,ui.q), pi;
      document.getElementById("prevPitch").innerHTML=pitchSVG(g,prevRow,false,ui.q-1);
      var cameOn=[], cameOff=[], stayed=[];
      for(pi=0;pi<S.roster.length;pi++){
        var rp=S.roster[pi];
        if(isOut(g,rp.id)){ continue; }
        var wasOn=prevRow.indexOf(rp.id)>=0, isOn=nowRow.indexOf(rp.id)>=0;
        if(isOn && !wasOn){ cameOn.push(rp.name); }
        else if(!isOn && wasOn){ cameOff.push(rp.name); }
        else if(isOn && wasOn){
          var oldK=pfPrev.pos[prevRow.indexOf(rp.id)], newK=pfNow.pos[nowRow.indexOf(rp.id)];
          if(oldK && newK && oldK.k!==newK.k){ stayed.push(rp.name+" "+oldK.k+"\u2192"+newK.k); }
        }
      }
      var ch="";
      ch+='<div><b>Coming on</b>'+(cameOn.length?'<span class="on">'+esc(cameOn.join(", "))+'</span>':'<span class="same">nobody yet</span>')+'</div>';
      ch+='<div style="margin-top:8px"><b>Coming off</b>'+(cameOff.length?'<span class="off">'+esc(cameOff.join(", "))+'</span>':'<span class="same">nobody yet</span>')+'</div>';
      if(qFormName(g,ui.q-1)!==qFormName(g,ui.q)){
        /* a new shape renames nearly every spot, so a list of moves is noise */
        ch+='<div style="margin-top:8px"><b>Formation change</b><span class="same">'+
            esc(qFormName(g,ui.q-1)+" \u2192 "+qFormName(g,ui.q))+'</span></div>';
      }else if(stayed.length){
        ch+='<div style="margin-top:8px"><b>Moved position</b><span class="same">'+esc(stayed.join(", "))+'</span></div>';
      }
      document.getElementById("prevChanges").innerHTML=ch;
    }
  }else{
    prevWrap.hidden=true;
  }

  /* goal entry for the quarter being viewed */
  document.getElementById("goalQLabel").textContent=
    "\u2014 "+PW(g).low+" "+(ui.q+1);
  var onNow=curRow();
  var gsorted=presentRoster(g).slice().sort(function(a,b){
    return a.name.localeCompare(b.name);
  });
  var gh='<table><thead><tr><th>Player</th><th class="num">'+PW(g).s+(ui.q+1)+'</th><th></th><th class="num">Game</th></tr></thead><tbody>';
  for(i=0;i<gsorted.length;i++){
    var gp=gsorted[i], gq=goalsOf(g,gp.id,ui.q), gt=gameGoals(g,gp.id);
    var onField=onNow.indexOf(gp.id)>=0;
    gh+='<tr><td'+(onField?'':' style="color:var(--ink-soft)"')+'>'+esc(gp.name)+
        (onField?'':' <span class="hint" style="margin:0">(sitting)</span>')+'</td>'+
        '<td class="num" style="font-weight:800">'+gq+'</td>'+
        '<td style="white-space:nowrap"><button class="btn sm quiet" onclick="bumpGoal('+gp.id+','+ui.q+',-1)">\u2212</button> '+
        '<button class="btn sm green" onclick="bumpGoal('+gp.id+','+ui.q+',1)">+</button></td>'+
        '<td class="num">'+gt+'</td></tr>';
  }
  gh+='</tbody></table>';
  document.getElementById("goalEntry").innerHTML=gh;
  var resultNow=gameResult(g);
  document.getElementById("goalTotalLine").textContent=
    "Score: "+S.cfg.team+" "+teamGoals(g)+" — "+(g.opp||"Opponent")+" "+
    (g.oppGoals===null?"not entered":g.oppGoals)+(resultNow?" ("+resultNow+")":"")+
    ". Tap + on the "+PW(g).low+" tab you are viewing.";

  var carry=seasonTotals(), tq=targetQtrs();
  var qc=gameQtrs(g);
  var rows=presentRoster(g).map(function(p){
    return {p:p, plays:qc[p.id]||0, avail:availableQuarters(g,p.id), seasonSatQ:carry[p.id]?carry[p.id].satQ:0};
  }).sort(function(a,b){ return a.plays-b.plays || b.seasonSatQ-a.seasonSatQ; });

  h='<table><thead><tr><th style="text-align:center">Player</th>'+
    '<th class="num" style="text-align:center">'+PW(g).many+'<br>playing</th>'+
    '<th class="num" style="text-align:center">'+PW(g).many+'<br>sitting</th>'+
    '<th class="num" style="text-align:center">Sat<br>this season</th></tr></thead><tbody>';
  for(i=0;i<rows.length;i++){
    var cls=rows[i].plays<tq-0.5?"short":(rows[i].plays>tq+0.5?"over":"");
    if(rows[i].avail<Q){ cls=""; }   /* left the game: not short of time */
    h+='<tr class="'+cls+'"><td>'+esc(rows[i].p.name)+(rows[i].avail<Q?' <span class="hint" style="margin:0">(left from '+PW(g).s+(rows[i].avail+1)+')</span>':'')+
       '</td><td class="num" style="text-align:center">'+rows[i].plays+
       '</td><td class="num" style="text-align:center">'+Math.max(0,rows[i].avail-rows[i].plays)+
       '</td><td class="num" style="text-align:center">'+rows[i].seasonSatQ+'</td></tr>';
  }
  h+='</tbody></table>';
  h+='<p class="hint">'+PW(g).many+' for the lineups as they stand now. Change a '+PW(g).low+' and these update.</p>';
  document.getElementById("planSits").innerHTML=h;
}

/* Notes written in earlier games against the same opponent */
function renderOpponentNotes(g){
  var box=document.getElementById("oppNotes"), name=(g.opp||"").trim().toLowerCase(), list=[], i, o;
  if(!box){ return; }
  for(i=0;i<S.games.length;i++){
    o=S.games[i];
    if(o===g || !name || (o.opp||"").trim().toLowerCase()!==name || !(o.notes||"").trim()){ continue; }
    list.push(o);
  }
  list.sort(function(x,y){ return (y.date||"").localeCompare(x.date||""); });
  if(!list.length){ box.hidden=true; box.innerHTML=""; return; }
  var h='<h3 style="margin-top:12px">From earlier games against '+esc(g.opp.trim())+'</h3>';
  for(i=0;i<list.length;i++){
    h+='<div class="oppnote"><b>'+esc(list[i].date||"")+'</b> '+esc(list[i].notes.trim()).replace(/\n/g,"<br>")+'</div>';
  }
  box.innerHTML=h; box.hidden=false;
}

/* Where each player has played this season, by line, and whether their
   primary and secondary positions in Setup cover it. */
function lineOfZone(z){ return z==="G" ? "GK" : (z==="D" ? "DEF" : (z==="F" ? "FWD" : "MID")); }
function positionStats(){
  var stats={}, games=playedGames(), gi, q, i, g, f, row, id, line, k;
  var players=seasonPlayers();
  for(i=0;i<players.length;i++){
    stats[players[i].id]={GK:0,DEF:0,MID:0,FWD:0, goals:{GK:0,DEF:0,MID:0,FWD:0}};
  }
  for(gi=0;gi<games.length;gi++){
    g=games[gi];
    for(q=0;q<g.nq;q++){
      f=qForm(g,q); row=g.plan[q]||[];
      for(i=0;i<row.length && i<f.pos.length;i++){
        id=row[i];
        if(!id || !stats[id]){ continue; }
        line=lineOfZone(f.pos[i].z);
        stats[id][line]++;
        stats[id].goals[line]+=goalsOf(g,id,q);
      }
    }
  }
  for(k in stats){
    if(Object.prototype.hasOwnProperty.call(stats,k)){ stats[k].note=positionNote(P(Number(k)), stats[k]); }
  }
  return stats;
}
function positionNote(p, st){
  if(!p){ return ""; }
  var notes=[], covered={}, outfield=st.DEF+st.MID+st.FWD, names={DEF:"defense",MID:"midfield",FWD:"forward"}, line;
  if(!p.p1 && !p.p2){ return ""; }
  [p.p1,p.p2].forEach(function(z){ if(z){ covered[lineOfZone(z)]=true; } });
  if(p.p1 && p.p1===p.p2){ notes.push("secondary is the same as primary"); }
  if(outfield>=6){
    ["DEF","MID","FWD"].forEach(function(l){
      if(!covered[l] && st[l]/outfield>=0.3){ notes.push("plays "+names[l]+" often ("+st[l]+" of "+outfield+" field "+seasonWords().lows+"), which isn't in the settings"); }
    });
  }
  return notes.join("; ");
}
function renderPositionStats(){
  var box=document.getElementById("positionStats");
  if(!box){ return; }
  var st=positionStats(), players=S.roster.slice().sort(function(x,y){ return x.name.localeCompare(y.name); }), i, p, s, h;
  var zl={G:"Goalie",D:"Defense",MD:"Mid - def",M:"Mid",MA:"Mid - att",F:"Forward","":"Any"};
  function goalText(gl){
    var parts=[], l;
    for(l in gl){ if(Object.prototype.hasOwnProperty.call(gl,l) && gl[l]){ parts.push(gl[l]+" "+l.toLowerCase()); } }
    return parts.join(", ");
  }
  h='<div class="scrollx"><table><thead><tr><th>Player</th><th class="num">GK</th><th class="num">DEF</th><th class="num">MID</th><th class="num">FWD</th>'+
    '<th>Goals from</th><th>Set as</th></tr></thead><tbody>';
  for(i=0;i<players.length;i++){
    p=players[i]; s=st[p.id]||{GK:0,DEF:0,MID:0,FWD:0,goals:{},note:""};
    h+='<tr><td>'+esc(p.name)+(s.note?'<div class="posnote">'+esc(s.note)+'</div>':'')+'</td>'+
       '<td class="num">'+(s.GK||"")+'</td><td class="num">'+(s.DEF||"")+'</td><td class="num">'+(s.MID||"")+'</td><td class="num">'+(s.FWD||"")+'</td>'+
       '<td>'+esc(goalText(s.goals))+'</td><td>'+esc(zl[p.p1||""]+" / "+zl[p.p2||""])+'</td></tr>';
  }
  h+='</tbody></table></div><p class="hint">'+seasonWords().many+' at each line in played games, with goals scored from each. A note appears when a player often plays a line that neither of their positions in Setup covers.</p>';
  box.innerHTML=h;
}

function renderSeason(){
  var t=seasonTotals(), record=seasonRecord(), i, h="";
  var plannedCount=S.games.length-playedGames().length;
  document.getElementById("seasonMeta").textContent=
    "Record: "+record.wins+"-"+record.losses+"-"+record.ties+" (W-L-T). "+
    S.games.length+" game"+(S.games.length===1?"":"s")+" saved"+
    (plannedCount?", "+plannedCount+" of them planned and not counted yet":"")+". "+
    (record.unknown?record.unknown+" saved game"+(record.unknown===1?" has":"s have")+" no opponent score and "+(record.unknown===1?"is":"are")+" excluded from the record. ":"")+
    "Sorted by smallest share of available "+seasonWords().lows+" played \u2014 missed games are excluded from the comparison.";
  var active={}, currentIndex;
  for(currentIndex=0;currentIndex<S.roster.length;currentIndex++){ active[S.roster[currentIndex].id]=true; }
  var rows=seasonPlayers().map(function(p){
    var r=t[p.id]||{qtrs:0,satQ:0,mins:0,games:0,goals:0,availQ:0,missed:0,playRate:0};
    return {p:p,qtrs:r.qtrs,satQ:r.satQ,mins:r.mins,games:r.games,goals:r.goals,
            availQ:r.availQ,missed:r.missed,playRate:r.playRate,active:!!active[p.id]};
  }).sort(function(a,b){ return a.playRate-b.playRate || a.qtrs-b.qtrs || a.p.name.localeCompare(b.p.name); });

  /* compare play RATE, not raw quarters, so a missed game is not a deficit */
  var avgRate=0, nR=0;
  for(i=0;i<rows.length;i++){ if(rows[i].availQ>0){ avgRate+=rows[i].playRate; nR++; } }
  avgRate=nR?avgRate/nR:0;

  h='<table><thead><tr><th>Player</th><th class="num">Games</th><th class="num">Played</th><th class="num">Sat</th><th class="num">Missed</th><th class="num">vs avg</th><th class="num">Goals</th><th class="num">Mins</th></tr></thead><tbody>';
  for(i=0;i<rows.length;i++){
    /* expressed in quarters over this player's OWN available games */
    var d=(rows[i].playRate-avgRate)*(rows[i].availQ||0), cls="";
    if(d<-1){ cls="short"; } else if(d>1){ cls="over"; }
    h+='<tr class="'+cls+'"><td>'+esc(rows[i].p.name)+(rows[i].active?'':' <span class="hint" style="margin:0">(former)</span>')+'</td><td class="num">'+rows[i].games+
       '</td><td class="num">'+rows[i].qtrs+'</td><td class="num">'+rows[i].satQ+
       '</td><td class="num">'+(rows[i].missed||"")+
       '</td><td class="num">'+(d>=0?"+":"")+d.toFixed(1)+
       '</td><td class="num" style="font-weight:800">'+rows[i].goals+
       '</td><td class="num">'+rows[i].mins+'</td></tr>';
  }
  h+='</tbody></table>';
  document.getElementById("seasonTable").innerHTML=h;

  if(!S.games.length){
    h='<p class="hint">No games saved yet.</p>';
  }else{
    h='<table><thead><tr><th>Date</th><th>Opponent</th><th>Result</th><th class="num">GF</th><th class="num">GA</th><th></th><th></th></tr></thead><tbody>';
    for(i=0;i<S.games.length;i++){
      var g=S.games[i], result=gameResult(g), resultHTML="\u2014";
      if(result){ resultHTML='<span class="tag '+(result==="W"?"ok":(result==="L"?"over":"short"))+'">'+result+'</span>'; }
      if(g.planned){ resultHTML='<span class="tag planned">Planned</span> <button class="btn sm" onclick="setPlayed('+g.id+',true)">Mark played</button>'; }
      h+='<tr><td>'+esc(g.date)+'</td><td>'+esc(g.opp||"\u2014")+'</td><td>'+resultHTML+'</td>'+
         '<td class="num">'+teamGoals(g)+'</td><td class="num">'+(g.oppGoals===null?"\u2014":g.oppGoals)+'</td>'+
         '<td><button class="btn sm" onclick="editGame('+g.id+')">Open</button></td>'+
         '<td><button class="btn quiet sm" onclick="delGame('+i+')">Delete</button></td></tr>';
    }
    h+='</tbody></table>';
    h+='<p class="hint">Open a game to check it against what actually happened, adjust the lineups, and reprint.</p>';
  }
  document.getElementById("gameList").innerHTML=h;
  renderPositionStats();
}

function renderSetup(){
  document.getElementById("cfgTeam").value=S.cfg.team;
  document.getElementById("cfgQ").value=S.cfg.quarters;
  document.getElementById("cfgMin").value=S.cfg.minutes;
  document.getElementById("cfgKeeper").value=S.cfg.keeperPlan||"halves";
  document.getElementById("cfgAge").value="";

  var sizes=fieldSizes(), keys=formationsFor(S.cfg.onField), h="", i;
  for(i=0;i<sizes.length;i++){
    h+='<option value="'+sizes[i]+'"'+(sizes[i]===S.cfg.onField?" selected":"")+'>'+
       sizes[i]+'v'+sizes[i]+'</option>';
  }
  document.getElementById("cfgSize").innerHTML=h;
  h="";
  for(i=0;i<keys.length;i++){
    h+='<option value="'+keys[i]+'"'+(keys[i]===S.cfg.formation?" selected":"")+'>'+keys[i]+'</option>';
  }
  document.getElementById("cfgFormation").innerHTML=h;

  function zoneSel(p, field){
    var s='<select onchange="editPlayer('+p.id+',\''+field+'\',this.value)" style="min-height:38px;padding:6px">', z;
    for(z=0;z<ZONES.length;z++){
      s+='<option value="'+ZONES[z].v+'"'+(p[field]===ZONES[z].v?" selected":"")+'>'+ZONES[z].label+'</option>';
    }
    return s+'</select>';
  }

  function keeperSel(p){
    var disabled=canKeep(p)?'':' disabled';
    return '<select onchange="editPlayer('+p.id+',\'gkOrder\',this.value)" style="min-height:38px;padding:6px"'+disabled+'>'+
      '<option value="0"'+(!p.gkOrder?' selected':'')+'>\u2014</option>'+
      '<option value="1"'+(p.gkOrder===1?' selected':'')+'>GK 1</option>'+
      '<option value="2"'+(p.gkOrder===2?' selected':'')+'>GK 2</option></select>';
  }

  h='<table><thead><tr><th>Name</th><th>#</th><th>Primary</th><th>Secondary</th><th>Keeper</th><th>Tier</th><th></th></tr></thead><tbody>';
  var alphaRoster=S.roster.slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
  for(i=0;i<alphaRoster.length;i++){
    var p=alphaRoster[i];
    h+='<tr><td><input value="'+esc(p.name)+'" onchange="editPlayer('+p.id+',\'name\',this.value)" style="width:100%;min-width:78px"></td>'+
       '<td><input value="'+esc(p.num)+'" onchange="editPlayer('+p.id+',\'num\',this.value)" style="width:48px"></td>'+
       '<td>'+zoneSel(p,"p1")+'</td><td>'+zoneSel(p,"p2")+'</td><td>'+keeperSel(p)+'</td>'+
       '<td><select onchange="editPlayer('+p.id+',\'tier\',this.value)" style="min-height:38px;padding:6px">'+
         '<option value="0"'+(!p.tier?" selected":"")+'>Not set</option>'+
         '<option value="1"'+(p.tier===1?" selected":"")+'>Strong</option>'+
         '<option value="2"'+(p.tier===2?" selected":"")+'>Middle</option>'+
         '<option value="3"'+(p.tier===3?" selected":"")+'>Developing</option>'+
       '</select></td>'+
       '<td><button class="btn quiet sm" onclick="delPlayer('+p.id+')">Remove</button></td></tr>';
  }
  h+='</tbody></table>';
  document.getElementById("rosterList").innerHTML=h;
}

function renderPrint(){
  var g=G(), rosterNow=gameRoster(g), Q=g.nq, q, h="";

  function pageHead(q){
    return '<div class="psheet-head"><h1>'+esc(S.cfg.team)+' vs '+(esc(g.opp)||"__________")+'</h1>'+
      '<div class="sub">'+esc(g.date||"")+' &middot; '+qFormName(g,q)+' &middot; '+Q+'&times;'+g.qlen+' min'+
      (rosterNow.length-presentRoster(g).length ?
        ' &middot; OUT: '+esc(rosterNow.filter(function(p){return isOut(g,p.id);}).map(function(p){return p.name;}).join(", "))
        : '')+
      (rosterNow.some(function(p){ return leftFrom(g,p.id)>=0; }) ?
        ' &middot; LEFT: '+esc(rosterNow.filter(function(p){ return leftFrom(g,p.id)>=0; }).map(function(p){ return p.name+" ("+PW(g).s+(leftFrom(g,p.id)+1)+")"; }).join(", "))
        : '')+'</div></div>';
  }

  function notesBlock(){
    var t=(g.notes||"").trim();
    if(t){
      return '<div class="pnotes"><b>Notes:</b> '+esc(t).replace(/\n/g,"<br>")+'</div>';
    }
    return '<div class="pnotes pnotes-blank"><b>Notes:</b><div class="pline"></div><div class="pline"></div></div>';
  }

  function sitDock(){
    var totals=gameQtrs(g), d='', i;
    var summaryRoster=gameRoster(g).slice().sort(function(a,b){
      var sa=availableQuarters(g,a.id)-(totals[a.id]||0), sb=availableQuarters(g,b.id)-(totals[b.id]||0);
      return sa-sb || a.name.localeCompare(b.name);
    });
    d+='<aside class="psummary"><h5>'+PW(g).many+' sitting</h5><table class="psummary-table"><thead><tr><th>Player</th><th class="num">Sits</th></tr></thead><tbody>';
    for(i=0;i<summaryRoster.length;i++){
      var player=summaryRoster[i];
      d+='<tr><td>'+esc(player.name)+'</td>';
      if(isOut(g,player.id)){ d+='<td class="outmark">OUT</td>'; }
      else if(leftFrom(g,player.id)>=0){ d+='<td class="num">'+Math.max(0,availableQuarters(g,player.id)-(totals[player.id]||0))+' &middot; left '+PW(g).s+(leftFrom(g,player.id)+1)+'</td>'; }
      else { d+='<td class="num">'+(Q-(totals[player.id]||0))+'</td>'; }
      d+='</tr>';
    }
    d+='</tbody></table><div class="psummary-note">Fewest sits first. Use this if you need to change the lineup on the day. Players marked OUT are excluded.</div></aside>';
    return d;
  }

  for(q=0;q<Q;q++){
    h+='<section class="print-page">'+pageHead(q)+'<div class="pquarter-title">'+PW(g).s+(q+1)+'</div>'+
       '<div class="ppage-body"><div class="pmain pfield-single">'+pitchSVG(g,g.plan[q],false,q)+
       '<div class="psit"><b>Sitting this '+PW(g).low+':</b> '+
       esc(presentInQ(g,q).filter(function(p){return g.plan[q].indexOf(p.id)<0;}).map(function(p){return p.name;}).join(", ")||"\u2014")+
       '</div><div class="psit"><b>'+PW(g).s+(q+1)+' goals:</b> ____</div></div>'+
       '<div class="pside">'+sitDock()+notesBlock()+'</div></div></section>';
  }

  document.getElementById("printSheet").innerHTML=h;
}

/* ---------- offline app ----------
   sw.js keeps a copy of the app on the device so it opens with no signal.
   It only runs when the app is served from a web address (GitHub Pages),
   not when index.html is opened straight from a folder. */
function setupOffline(){
  if(HA){ return; }   /* Home Assistant serves the app; there is nothing to keep offline */
  if(!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)){ return; }
  navigator.serviceWorker.addEventListener("message",function(ev){
    if(ev.data && ev.data.type==="updated"){
      var t=document.getElementById("updateToast");
      if(t){ t.hidden=false; }
    }
  });
  window.addEventListener("load",function(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
    /* ask whether this page is the newest version (see sw.js) */
    navigator.serviceWorker.ready.then(function(){
      var helper=navigator.serviceWorker.controller;
      if(!helper){ return; }
      var sc=document.querySelector('script[src^="app.js"]'), ln=document.querySelector('link[href^="styles.css"]');
      helper.postMessage({type:"check", script:sc?sc.getAttribute("src"):"", style:ln?ln.getAttribute("href"):""});
    }).catch(function(){});
  });
}

/* ---------- Home Assistant: keeping the season on the server ---------- */
function haConn(){ return (HA && HA.hass) ? HA.hass.connection : null; }

function haLoadCache(){
  var raw=null, c=null;
  try{ raw=localStorage.getItem(HA_CACHE); }catch(e){ raw=null; }
  if(raw){
    try{
      c=JSON.parse(raw);
      normalizeState(c.state);
      sync.rev=Number(c.rev)||0;
      sync.pending=!!c.pending;
      sync.lastJson=sync.pending?null:JSON.stringify(S);
    }catch(e){ S=null; }
  }
  if(!S){ freshState(); sync.rev=0; sync.pending=false; sync.lastJson=null; }
}
function haWriteCache(){
  try{ localStorage.setItem(HA_CACHE, JSON.stringify({state:S, rev:sync.rev, pending:sync.pending})); }
  catch(e){}
}
function haSchedulePush(delay){
  if(sync.timer){ clearTimeout(sync.timer); }
  sync.timer=setTimeout(haPush, delay===undefined?400:delay);
}
function haPush(force){
  sync.timer=0;
  var conn=haConn();
  if(!conn){ haSetStatus("offline"); return; }
  if(sync.inFlight){ sync.again=true; return; }
  var json=JSON.stringify(S);
  if(json===sync.lastJson && !force){
    sync.pending=false; haWriteCache(); haSetStatus("saved"); return;
  }
  var msg={type:"soccerlineup/save", data:JSON.parse(json), base_rev:sync.rev, client_id:sync.clientId};
  if(force){ msg.force=true; msg.checkpoint="kept this device"; }
  else if(sync.checkpoint){ msg.checkpoint=sync.checkpoint; }
  sync.checkpoint=null;
  sync.inFlight=true;
  haSetStatus("saving");
  conn.sendMessagePromise(msg).then(function(res){
    sync.inFlight=false;
    sync.rev=res.rev; sync.lastJson=json; sync.savedAt=res.saved_at; sync.savedBy=null;
    sync.pending=(JSON.stringify(S)!==json);
    haWriteCache();
    if(sync.pending || sync.again){ sync.again=false; haSchedulePush(0); }
    else { haSetStatus("saved"); }
    if(sync.skipped){
      /* another change arrived during this save (a restore, say): fetch the latest */
      sync.skipped=false;
      conn.sendMessagePromise({type:"soccerlineup/get"}).then(function(latest){ haOnServer(latest); }, function(){});
    }
  }, function(err){
    sync.inFlight=false;
    if(err && err.code==="conflict"){ haConflict(); return; }
    /* sent again when the connection comes back, or with the next change */
    haSetStatus("offline");
  });
}

/* the server sends the latest version on connecting and after every change */
function haOnServer(ev){
  if(!ev){ return; }
  if(ev.client_id && ev.client_id===sync.clientId){
    if(ev.rev>sync.rev){ sync.rev=ev.rev; }
    return;
  }
  if(sync.inFlight || sync.resolving){ sync.skipped=true; return; }   /* the save under way decides; looked at again after */
  if(!ev.data){
    /* nothing on the server yet: this device's season becomes the first version */
    sync.rev=0; sync.lastJson=null; sync.pending=true; haWriteCache(); haSchedulePush(0);
    return;
  }
  if(ev.rev===sync.rev){
    if(sync.pending){ haSchedulePush(0); } else { haSetStatus("saved", ev); }
    return;
  }
  if(sync.pending){ haConflict(ev); return; }
  haApplyRemote(ev);
}

function haApplyRemote(ev){
  var keepQ=ui.q;
  normalizeState(JSON.parse(JSON.stringify(ev.data)));
  undoStack=[];
  ui.selSlot=-1; ui.selPlayer=0;
  ui.q=Math.min(keepQ, G().nq-1);
  if(ui.q<0){ ui.q=0; }
  sync.rev=ev.rev; sync.pending=false; sync.lastJson=JSON.stringify(S);
  haWriteCache();
  haSetStatus("saved", ev);
  ui.haHistory=null;
  render();
}

/* Both this device and another one changed the season since this one last
   heard from the server. Ask which to keep; the other is kept in history. */
function haConflict(ev){
  var conn=haConn();
  if(!conn || sync.resolving){ return; }
  sync.resolving=true;
  var got=ev ? Promise.resolve(ev) : conn.sendMessagePromise({type:"soccerlineup/get"});
  got.then(function(server){
    var who=server.saved_by?" by "+server.saved_by:"", when=server.saved_at?" on "+haWhen(server.saved_at):"";
    var keepMine=confirm("This season was also changed on another device"+who+when+" while this one was offline.\n\n"+
      "OK: keep this device's version.\nCancel: use the other version.\n\n"+
      "Either way, the version you don't keep stays under Season, Earlier versions.");
    sync.resolving=false;
    if(keepMine){
      sync.rev=server.rev;
      haPush(true);
    }else{
      /* this device's version goes into history, the other one is used */
      conn.sendMessagePromise({type:"soccerlineup/keep_version", data:JSON.parse(JSON.stringify(S))})
        .then(function(){}, function(){})
        .then(function(){ haApplyRemote(server); });
    }
  }, function(){ sync.resolving=false; haSetStatus("offline"); });
}

function haOnReady(){ haSetStatus(sync.pending?"saving":"saved"); if(sync.pending){ haSchedulePush(0); } }
function haOnDisconnect(){ haSetStatus("offline"); }

function haStart(){
  var conn=haConn();
  if(!conn){ setTimeout(haStart, 300); return; }
  haSetStatus("connecting");
  conn.subscribeMessage(haOnServer, {type:"soccerlineup/subscribe"}).then(function(unsub){
    sync.unsub=unsub;
  }, function(){ haSetStatus("offline"); });
  conn.addEventListener("ready", haOnReady);
  conn.addEventListener("disconnected", haOnDisconnect);
  var stopChrome=HA.onChange(haRenderChrome);
  window.addEventListener("pagehide", function(){
    try{
      /* the connection may already be closing; a refused unsubscribe is fine */
      var done=sync.unsub ? sync.unsub() : null;
      if(done && done.then){ done.then(function(){}, function(){}); }
    }catch(e){}
    try{ conn.removeEventListener("ready", haOnReady); conn.removeEventListener("disconnected", haOnDisconnect); }catch(e){}
    stopChrome();
  });
}

function haWhen(iso){
  var d=new Date(iso);
  if(isNaN(d.getTime())){ return ""; }
  return d.toLocaleDateString()+" at "+d.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"});
}
function haSetStatus(status, ev){
  sync.status=status;
  if(ev && ev.saved_at){ sync.savedAt=ev.saved_at; sync.savedBy=ev.saved_by||null; }
  haRenderChrome();
  var el=document.getElementById("backupStatus");
  if(el && ui.tab==="season"){ haRenderBackupStatus(el); }
}
function haRenderChrome(){
  if(!HA){ return; }
  var menu=document.getElementById("haMenu"), st=document.getElementById("syncState");
  if(menu){ menu.hidden=!HA.narrow; }
  if(!st){ return; }
  var text={connecting:"Connecting\u2026", saving:"Saving\u2026", saved:"Saved on Home Assistant",
            offline:sync.pending?"Offline \u2014 changes will be sent":"Offline"}[sync.status]||"";
  st.hidden=!text;
  st.textContent=text;
  st.className="sub sync"+(sync.status==="offline"?" offline":"");
}
function haToggleMenu(){ if(HA){ HA.toggleMenu(); } }

function haRenderBackupStatus(el){
  var row=document.getElementById("autoBackupRow"), hist=document.getElementById("haHistory");
  if(row){ row.hidden=true; }
  if(hist){ hist.hidden=false; }
  var text="This season is kept on your Home Assistant server, so every device signed in there sees the same lineups, and Home Assistant's backups include it.";
  if(sync.savedAt){ text+=" Last change: "+haWhen(sync.savedAt)+(sync.savedBy?" by "+sync.savedBy:"")+"."; }
  if(sync.status==="offline"){ text+=sync.pending?" Not connected right now: changes made here will be sent when the connection is back.":" Not connected right now."; }
  el.textContent=text;
  el.className=(sync.status==="offline" && sync.pending)?"warn":"hint";
  haRenderHistory();
}
function haShowHistory(){
  var conn=haConn();
  if(!conn){ return; }
  conn.sendMessagePromise({type:"soccerlineup/history"}).then(function(res){
    ui.haHistory=res.versions||[];
    haRenderHistory();
  }, function(){ ui.haHistory=[]; haRenderHistory(); });
}
function haRenderHistory(){
  var box=document.getElementById("haHistoryList"), btn=document.getElementById("haHistoryBtn");
  if(!box){ return; }
  if(!ui.haHistory){ box.innerHTML=""; if(btn){ btn.hidden=false; } return; }
  if(btn){ btn.hidden=true; }
  if(!ui.haHistory.length){ box.innerHTML='<p class="hint">No earlier versions yet.</p>'; return; }
  var reasons={"kept this device":"replaced by another device's version","before restore":"before a restore",
               "import":"before a backup file was restored","not kept":"a device's changes that weren't kept"};
  var h="", i, v;
  for(i=0;i<ui.haHistory.length;i++){
    v=ui.haHistory[i];
    h+='<div class="histrow"><span class="when"><b>'+esc(haWhen(v.saved_at)||"Unknown time")+'</b>'+
       (v.saved_by?' &middot; '+esc(v.saved_by):'')+' &middot; '+v.games+' saved game'+(v.games===1?'':'s')+
       (reasons[v.reason]?' <span class="hint" style="margin:0">('+reasons[v.reason]+')</span>':'')+'</span>'+
       '<button class="btn sm" onclick="haRestore(\''+esc(v.id)+'\')">Restore</button></div>';
  }
  h+='<p class="hint">A version is kept at most every 15 minutes, whenever a game is saved to the season, and whenever one version replaces another.</p>';
  box.innerHTML=h;
}
function haRestore(versionId){
  var conn=haConn(), v=null, i;
  if(!conn){ return; }
  for(i=0;i<(ui.haHistory||[]).length;i++){ if(ui.haHistory[i].id===versionId){ v=ui.haHistory[i]; } }
  if(!confirm("Restore the version from "+(v?haWhen(v.saved_at):"earlier")+"?\n\nIt replaces the season on every device. The current season is kept as an earlier version.")){ return; }
  if(sync.timer){ clearTimeout(sync.timer); sync.timer=0; }
  sync.pending=false;
  conn.sendMessagePromise({type:"soccerlineup/restore", version:versionId}).then(function(){
    ui.haHistory=null;
  }, function(err){ alert((err && err.message) || "That version could not be restored."); });
}

load();
render();
setupOffline();
if(HA){ haStart(); }
