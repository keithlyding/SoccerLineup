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

/* ---------- playing short ---------- */
/* The coach's choice of spot to leave open in quarter q (or for the game) */
function leaveOpenKey(g, q){
  var lo=g.leaveOpen||{}, key=(lo[q]!==undefined && lo[q]!=="") ? lo[q] : lo.any, f=qForm(g,q), i;
  if(!key){ return null; }
  for(i=0;i<f.pos.length;i++){ if(f.pos[i].k===key && f.pos[i].z!=="G"){ return key; } }
  return null;
}
/* Which outfield slot indexes to leave open when `count` spots can't be filled */
function openSpotsFor(g, q, count){
  var f=qForm(g,q), slots=[], out=[], pref=leaveOpenKey(g,q), i, lineSize={};
  for(i=0;i<f.pos.length && i<g.onField;i++){
    if(f.pos[i].z==="G"){ continue; }
    slots.push(i);
    lineSize[lineGroup(f.pos[i].z)]=(lineSize[lineGroup(f.pos[i].z)]||0)+1;
  }
  var rank={F:0, M:1, D:2};
  while(out.length<count && out.length<slots.length){
    var best=-1, bestScore=1e9;
    for(i=0;i<slots.length;i++){
      var s=slots[i], p=f.pos[s], line=lineGroup(p.z);
      if(out.indexOf(s)>=0){ continue; }
      var score;
      if(pref && p.k===pref && out.length===0){ score=-1; }
      else{
        /* keep one in every line while that's possible */
        score=(lineSize[line]>1 ? 0 : 100)+rank[line]*10+p.imp;
      }
      if(score<bestScore){ bestScore=score; best=s; }
    }
    if(best<0){ break; }
    out.push(best);
    lineSize[lineGroup(f.pos[best].z)]--;
  }
  return out;
}
/* Plan: choose which spot stays open while playing short. The player in it
   moves to the spot that is open now; auto-fill keeps this choice for the
   rest of the game. */
function setOpenSpot(key){
  var g=G(), q=ui.q, f=qForm(g,q), row=g.plan[q], target=-1, empty=-1, i;
  if(!key){ return; }
  for(i=0;i<f.pos.length && i<g.onField;i++){
    if(f.pos[i].k===key){ target=i; }
  }
  for(i=0;i<f.pos.length && i<g.onField;i++){
    if(i!==target && f.pos[i].z!=="G" && !row[i]){ empty=i; break; }
  }
  rememberGameChange("leave "+key+" open");
  if(!g.leaveOpen){ g.leaveOpen={}; }
  g.leaveOpen[q]=key;
  g.leaveOpen.any=key;
  if(target>=0 && row[target] && empty>=0){ row[empty]=row[target]; row[target]=0; }
  ui.selSlot=-1; ui.selPlayer=0;
  save(); render();
}
function shortInfo(g, q){
  var f=qForm(g,q), row=g.plan[q]||[], open=[], i, by=g.onField-presentInQ(g,q).length;
  for(i=0;i<f.pos.length && i<g.onField;i++){ if(f.pos[i].z!=="G" && !row[i]){ open.push(f.pos[i].k); } }
  return {by:Math.max(0,by), open:open};
}

/* 9v9 */
addFormation("3-4-1");
addFormation("4-3-1");
/* 8v8 */
addFormation("3-3-1");
addFormation("3-2-2");
/* 7v7 */
addFormation("2-3-1");
addFormation("2-1-2-1");
/* 10v10 (a few leagues, e.g. some U14 rec) */
addFormation("4-3-2");
addFormation("3-4-2");
addFormation("4-4-1");
addFormation("3-3-3");
addFormation("4-2-3");
addFormation("4-1-3-1");
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
var ui = {tab:"plan", q:0, selSlot:-1, selPlayer:0, editId:0, season:0, subSel:null, ps:{}};

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
    schemaVersion:8,
    cfg:{team:"Team", quarters:4, minutes:15, onField:9, formation:"3-3-2", autoBackup:true, keeperPlan:"halves"},
    roster:copyRoster(DEFAULT_ROSTER), nextId:1, nextGameId:1, nextSeasonId:1,
    current:null, games:[], seasons:[]
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
    goals:{}, oppGoals:null, out:{}, left:{}, leaveOpen:{},
    clock:{q:-1, since:0, acc:0}, periodSecs:[], subs:[], subPlan:[], goalTimes:[], staged:[]
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
  if(!g.leaveOpen){ g.leaveOpen={}; }
  if(g.notes===undefined || g.notes===null){ g.notes=""; }
  if(!(Number(g.qlen)>0)){ g.qlen=S.cfg.minutes||15; }
  /* game clock and subs (see "game clock and substitutions") */
  if(!Array.isArray(g.subs)){ g.subs=[]; }
  if(!Array.isArray(g.subPlan)){ g.subPlan=[]; }
  if(!Array.isArray(g.goalTimes)){ g.goalTimes=[]; }
  if(!Array.isArray(g.periodSecs)){ g.periodSecs=[]; }
  g.subs=g.subs.filter(function(s){ return s && s.q<g.nq && (s.move ? !!s.id : !!s.on); });
  if(["","playoff","scrimmage"].indexOf(g.kind||"")<0){ g.kind=""; }
  if(!Array.isArray(g.staged)){ g.staged=[]; }
  g.staged=g.staged.filter(function(s){ return s && s.on; });
  g.subPlan=g.subPlan.filter(function(s){ return s && s.q<g.nq && s.off && s.on; });
  if(!g.clock || typeof g.clock.q!=="number" || g.clock.q>=g.nq){ g.clock={q:-1, since:0, acc:0}; }
  /* opponent goals by period: an array once recorded that way, else absent */
  if(Array.isArray(g.oppGoalsQ)){
    while(g.oppGoalsQ.length<g.nq){ g.oppGoalsQ.push(0); }
    g.oppGoalsQ.length=g.nq;
    g.oppGoals=g.oppGoalsQ.reduce(function(s,x){ return s+(Number(x)||0); },0);
  }else{ delete g.oppGoalsQ; }
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
  S.schemaVersion=8;
  normalizeRoster(S.roster);
  if(S.cfg.autoBackup===undefined){ S.cfg.autoBackup=true; }
  if(["halves","turns","middle","whole"].indexOf(S.cfg.keeperPlan)<0){ S.cfg.keeperPlan="halves"; }
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
  if(!Array.isArray(S.seasons)){ S.seasons=[]; }
  var maxSeason=0;
  S.seasons=S.seasons.filter(function(s){ return s && s.cfg && Array.isArray(s.roster) && Array.isArray(s.games); });
  S.seasons.forEach(function(s){ if(Number(s.id)>maxSeason){ maxSeason=Number(s.id); } });
  S.seasons.forEach(function(s){
    if(!(Number(s.id)>0)){ s.id=++maxSeason; }
    if(!s.name){ s.name="Season"; }
    normalizeRoster(s.roster);
    withSeason(s.id, function(){ s.games.forEach(function(g){ normalizeGame(g,true); }); });
  });
  if(!S.nextSeasonId || S.nextSeasonId<=maxSeason){ S.nextSeasonId=maxSeason+1; }
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
    subs:copyValue(g.subs||[]),subPlan:copyValue(g.subPlan||[]),goalTimes:copyValue(g.goalTimes||[]),staged:copyValue(g.staged||[]),
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
  if(u.subs){ g.subs=copyValue(u.subs); g.subPlan=copyValue(u.subPlan); g.goalTimes=copyValue(u.goalTimes); g.staged=copyValue(u.staged||[]); }
  ui.q=Math.min(u.q,g.nq-1);
  ui.subSel=null;
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

/* Periods each player plays in game g: a whole period for being on the
   field all of it, part of one for coming on or going off partway through.
   withPlanned counts planned subs that haven't happened yet (for planning);
   season totals count only the subs that did. */
function gameQtrs(g, withPlanned){
  var m={}, i, q, roster=gameRoster(g), id;
  for(i=0;i<roster.length;i++){ m[roster[i].id]=0; }
  for(q=0;q<g.nq;q++){
    var sec=periodSeconds(g,q,withPlanned===true), L=periodLen(g,q)||1;
    for(id in sec){ if(Object.prototype.hasOwnProperty.call(sec,id) && m[id]!==undefined){ m[id]+=sec[id]/L; } }
  }
  for(id in m){ if(Object.prototype.hasOwnProperty.call(m,id)){ m[id]=Math.round(m[id]*100)/100; } }
  return m;
}
/* seconds each player was on the field in game g */
function gameSeconds(g){
  var m={}, q, id, sec;
  for(q=0;q<g.nq;q++){
    sec=periodSeconds(g,q,false);
    for(id in sec){ if(Object.prototype.hasOwnProperty.call(sec,id)){ m[id]=(m[id]||0)+sec[id]; } }
  }
  return m;
}
/* 2 -> "2", 2.5 -> "2.5" */
function fmtQ(x){ return (Math.round(x*10)/10).toString(); }
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
/* League games (the default), playoff or tournament games, scrimmages */
var GAME_KINDS=[{v:"", label:"League"},{v:"playoff", label:"Playoff / tournament"},{v:"scrimmage", label:"Scrimmage"}];
function kindLabel(k){ var i; for(i=0;i<GAME_KINDS.length;i++){ if(GAME_KINDS[i].v===(k||"")){ return GAME_KINDS[i].label; } } return "League"; }
function setGameKind(v){ var g=G(); g.kind=(v==="playoff"||v==="scrimmage")?v:""; save(); render(); }
function fmtRec(r){ return r.wins+"-"+r.losses+"-"+r.ties; }
/* the record line: the full record (scrimmages left out), then playoffs
   and tournaments, then scrimmages when there are any */
function recordText(long){
  var all=seasonRecord(), po=seasonRecord("playoff"), sc=seasonRecord("scrimmage"), parts=[];
  parts.push((long?"Record: ":"")+fmtRec(all)+(long?" (W-L-T)":""));
  if(po.wins+po.losses+po.ties){ parts.push((long?"Playoffs and tournaments: ":"Playoffs ")+fmtRec(po)); }
  if(long && sc.wins+sc.losses+sc.ties){ parts.push("Scrimmages (not counted): "+fmtRec(sc)); }
  return parts.join(long?". ":" \u00b7 ");
}
function gameResult(g){
  if(g.oppGoals===null || g.oppGoals===undefined){ return ""; }
  var gf=teamGoals(g), ga=Number(g.oppGoals)||0;
  return gf>ga?"W":(gf<ga?"L":"T");
}
/* W-L-T over played games: every game but scrimmages, or only one kind */
function seasonRecord(kind){
  var r={wins:0,losses:0,ties:0,unknown:0}, i, result, games=playedGames().filter(function(g){
    return kind ? (g.kind||"")===kind : g.kind!=="scrimmage";
  });
  for(i=0;i<games.length;i++){
    result=gameResult(games[i]);
    if(result==="W"){ r.wins+=1; }
    else if(result==="L"){ r.losses+=1; }
    else if(result==="T"){ r.ties+=1; }
    else { r.unknown+=1; }
  }
  return r;
}
/* The opponent's goals in period q of game g, or null when only a total was kept. */
function oppGoalsIn(g, q){
  if(Array.isArray(g.oppGoalsQ)){ return Number(g.oppGoalsQ[q])||0; }
  /* a total of 0 is 0 in every period */
  return g.oppGoals===0 ? 0 : null;
}
function oppByPeriod(g){ return Array.isArray(g.oppGoalsQ) || g.oppGoals===0; }
function bumpOppGoal(q, delta){
  var g=G(), i;
  if(!Array.isArray(g.oppGoalsQ)){
    g.oppGoalsQ=[];
    for(i=0;i<g.nq;i++){ g.oppGoalsQ.push(0); }
  }
  if(delta>0 || g.oppGoalsQ[q]>0){ noteGoalTime(g, q, "opp", delta); }
  g.oppGoalsQ[q]=Math.max(0,(Number(g.oppGoalsQ[q])||0)+delta);
  g.oppGoals=g.oppGoalsQ.reduce(function(s,x){ return s+(Number(x)||0); },0);
  if(g.planned){ g.planned=false; }   /* a score means it was played */
  save(); render();
}
/* back to a single total for the opponent */
function clearOppByPeriod(){
  var g=G();
  delete g.oppGoalsQ;
  save(); render();
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
  if(v!==(g.goals[playerId][q]||0)){ noteGoalTime(g, q, playerId, delta); }
  g.goals[playerId][q]=v;
  save(); render();
}

/* ---------- game clock and substitutions ----------
   The clock times each period from its start; it keeps going while the
   phone is locked because it works from the start time. A period's lineup
   on the Plan tab is who starts it. Subs made during it are kept with the
   time they happened (seconds into the period), and planned subs are the
   coach's plan for it: "Sub now" makes one happen at the clock's time.
   Minutes played come from the starting lineups and the subs made. */
function clockNow(){ return Date.now(); }
function fmtClock(sec){
  var s=Math.max(0,Math.round(sec||0)), m=Math.floor(s/60), r=s%60;
  return m+":"+(r<10?"0":"")+r;
}
/* "7:30", "7.5" or "7" (minutes) -> seconds; null if it isn't a time */
function parseClock(text){
  var t=String(text===undefined||text===null?"":text).trim(), m;
  if(!t){ return null; }
  m=/^(\d{1,3}):(\d{1,2})$/.exec(t);
  if(m){ return Number(m[1])*60+Math.min(59,Number(m[2])); }
  if(/^\d+(\.\d+)?$/.test(t)){ return Math.round(Number(t)*60); }
  return null;
}
/* how long period q lasted: as the clock had it when it ended, else as planned */
function periodLen(g,q){
  var s=g.periodSecs && g.periodSecs[q];
  return (typeof s==="number") ? s : (Number(g.qlen)||15)*60;
}
function clockElapsed(g,q){
  var c=g.clock;
  if(c && c.q===q){ return Math.max(0,Math.floor(((c.acc||0)+(c.since?clockNow()-c.since:0))/1000)); }
  return (g.periodSecs && typeof g.periodSecs[q]==="number") ? g.periodSecs[q] : 0;
}
function clockRunning(g){ return !!(g && g.clock && g.clock.since); }
function clockStarted(g,q){ return !!((g.clock && g.clock.q===q) || (g.periodSecs && typeof g.periodSecs[q]==="number")); }
function clearGameClock(g){
  g.clock={q:-1, since:0, acc:0}; g.periodSecs=[]; g.subs=[]; g.subPlan=[]; g.goalTimes=[]; g.staged=[];
}
/* start period q's clock, resume it after a pause, or carry on after it ended */
function startClock(q){
  var g=G(), c=g.clock;
  if(c && c.q===q){
    if(!c.since){ c.since=clockNow(); }
  }else{
    if(c && c.q>=0){ endPeriodClock(g); }
    var done=(g.periodSecs && typeof g.periodSecs[q]==="number") ? g.periodSecs[q] : 0;
    if(g.periodSecs){ g.periodSecs[q]=null; }
    g.clock={q:q, since:clockNow(), acc:done*1000};
  }
  ui.q=q; ui.subSel=null;
  save(); render(); keepAwake(true);
}
function pauseClock(){
  var g=G(), c=g.clock;
  if(!c || !c.since){ return; }
  c.acc=(c.acc||0)+(clockNow()-c.since); c.since=0;
  save(); render(); keepAwake(false);
}
function endPeriodClock(g){
  var c=g.clock;
  if(!c || c.q<0){ return; }
  if(!g.periodSecs){ g.periodSecs=[]; }
  g.periodSecs[c.q]=clockElapsed(g,c.q);
  g.clock={q:-1, since:0, acc:0};
}
function endPeriod(){
  var g=G(); endPeriodClock(g); save(); render(); keepAwake(false);
}
/* fix how long a period ran (forgot to stop the clock) */
function setPeriodLength(q){
  var g=G(), v=prompt("How long did "+PW(g).one.toLowerCase()+" "+(q+1)+" run? (minutes, e.g. 15 or 14:30)", fmtClock(periodLen(g,q)));
  if(v===null){ return; }
  var t=parseClock(v);
  if(t===null || t<=0){ alert("That isn't a time."); return; }
  if(!g.periodSecs){ g.periodSecs=[]; }
  g.periodSecs[q]=t;
  save(); render();
}
function setGameLength(v){
  var g=G(), n=Math.round(Number(v));
  if(!(n>=1 && n<=60)){ render(); return; }
  g.qlen=n;
  save(); render();
}

function subsIn(g,q){
  return (g.subs||[]).filter(function(s){ return s.q===q; }).sort(function(a,b){ return a.t-b.t; });
}
function pendingPlanned(g,q){
  return (g.subPlan||[]).filter(function(s){ return s.q===q && !s.done; });
}
function subsFor(g,q,withPlanned){
  var list=subsIn(g,q);
  if(withPlanned){ list=list.concat(pendingPlanned(g,q)).sort(function(a,b){ return a.t-b.t; }); }
  return list;
}
/* One change during a period, applied to a lineup: a sub (s.on for s.off,
   same spot), a player put into an empty spot (no s.off; s.slot), or a
   position switch (s.move: s.id to spot s.slot, swapping with whoever is
   there). Returns the spot a player coming on took, else -1. */
function applySub(row, s){
  var k;
  if(s.move){
    k=row.indexOf(s.id);
    if(k<0 || !(s.slot>=0 && s.slot<row.length) || k===s.slot){ return -1; }
    row[k]=row[s.slot]; row[s.slot]=s.id;
    return -1;
  }
  if(!s.off){
    if(s.slot>=0 && s.slot<row.length && !row[s.slot] && row.indexOf(s.on)<0){ row[s.slot]=s.on; return s.slot; }
    return -1;
  }
  k=row.indexOf(s.off);
  if(k>=0 && row.indexOf(s.on)<0){ row[k]=s.on; return k; }
  return -1;
}
function subText(g, s){
  if(s.move){ return nameOf(s.id,g)+" moves to "+spotName(g,s.q,s.slot); }
  if(!s.off){ return nameOf(s.on,g)+" on ("+spotName(g,s.q,s.slot)+")"; }
  return nameOf(s.on,g)+" on for "+nameOf(s.off,g);
}
/* the period being viewed is being played: its clock is running or paused */
function isLive(g, q){ return !!(g && g.clock && g.clock.q===q); }
/* the lineup at second t of period q (after every sub when t is left out) */
function lineupAt(g,q,t,withPlanned){
  var row=(g.plan[q]||[]).slice(0,g.onField), list=subsFor(g,q,withPlanned), i;
  for(i=0;i<list.length;i++){
    if(t!==undefined && t!==null && list[i].t>t){ break; }
    applySub(row,list[i]);
  }
  return row;
}
/* seconds each player was on the field in period q, up to second upto */
function periodSeconds(g,q,withPlanned,upto){
  var L=periodLen(g,q), end=(upto===undefined||upto===null)?L:Math.min(upto,L);
  var row=(g.plan[q]||[]).slice(0,g.onField), sec={}, last=0, list=subsFor(g,q,withPlanned), i;
  function run(until){
    var to=Math.max(last,Math.min(until,end)), d=to-last;
    if(d>0){ row.forEach(function(id){ if(id){ sec[id]=(sec[id]||0)+d; } }); }
    last=to;
  }
  for(i=0;i<list.length;i++){ run(list[i].t); if(list[i].t<=end){ applySub(row,list[i]); } }
  run(end);
  return sec;
}
/* everyone on the field at some point in period q, with the spot they took */
function periodAppearances(g,q){
  var row=(g.plan[q]||[]).slice(0,g.onField), out=[], seen={}, list=subsIn(g,q), i, k;
  for(i=0;i<row.length;i++){ if(row[i] && !seen[row[i]]){ seen[row[i]]=1; out.push({id:row[i], slot:i}); } }
  for(i=0;i<list.length;i++){
    k=applySub(row,list[i]);
    if(k>=0 && !seen[list[i].on]){ seen[list[i].on]=1; out.push({id:list[i].on, slot:k}); }
  }
  return out;
}
function spotName(g,q,k){ var f=qForm(g,q); return (f.pos[k]||{}).k||""; }
/* when a sub or goal happened: the clock's time, or asked for if the
   period's clock hasn't been started */
function askWhen(g,q,what){
  if(clockStarted(g,q)){ return clockElapsed(g,q); }
  var v=prompt("When was "+what+"? Minutes into "+PW(g).one.toLowerCase()+" "+(q+1)+" (e.g. 7:30)", fmtClock(periodLen(g,q)/2));
  if(v===null){ return null; }
  var t=parseClock(v);
  if(t===null){ alert("That isn't a time."); return null; }
  return Math.min(t, periodLen(g,q));
}
function makeSub(off, on, t, slot){
  var g=G(), q=ui.q, now=lineupAt(g,q,t);
  if(off && now.indexOf(off)<0){ alert(nameOf(off,g)+" isn't on the field then."); return false; }
  if(!off && !(slot>=0 && slot<now.length && !now[slot])){ return false; }
  if(now.indexOf(on)>=0){ alert(nameOf(on,g)+" is already on the field."); return false; }
  if(!availableIn(g,on,q)){ alert(nameOf(on,g)+" isn't available."); return false; }
  rememberGameChange("sub");
  var s={q:q, t:t, off:off||0, on:on};
  if(!off){ s.slot=slot; }
  g.subs.push(s);
  /* the same change was planned: it's made now */
  (g.subPlan||[]).forEach(function(p){ if(!p.done && p.q===q && p.off===off && p.on===on){ p.done=true; } });
  ui.subSel=null;
  return true;
}
/* Live, on the pitch: a bench player dropped on a spot comes on there at
   the clock's time (for whoever was in it); a field player dropped on
   another spot switches positions. */
function liveSub(slot, id){
  var g=G(), q=ui.q, row=lineupAt(g,q);
  if(row.indexOf(id)>=0){ liveMove(id, slot); return; }
  if(makeSub(row[slot]||0, id, clockElapsed(g,q), slot)){ save(); }
}
/* ---------- subs made ready, then sent in together ----------
   While a period is live, tapping a player on the field lists the bench to
   choose who goes in (tapping a bench player lists the field to choose who
   comes out). Each pair waits as "ready"; "Send subs in" makes them all at
   once at the clock's time. */
function stagedMaps(g){
  var m={off:{}, on:{}, slot:{}};
  (g.staged||[]).forEach(function(s){ if(s.off){ m.off[s.off]=s; } else { m.slot[s.slot]=s; } m.on[s.on]=s; });
  return m;
}
function openPicker(p){ ui.pick=p; renderPicker(); }
function closePicker(){ ui.pick=null; renderPicker(); }
function stageSub(off, on, slot){
  var g=G();
  if(!g.staged){ g.staged=[]; }
  g.staged=g.staged.filter(function(s){ return !(off && s.off===off) && s.on!==on && !(!off && !s.off && s.slot===slot); });
  var s={off:off||0, on:on};
  if(!off){ s.slot=slot; }
  g.staged.push(s);
  ui.pick=null;
  save(); render();
}
function unstageSub(i){
  var g=G();
  g.staged.splice(i,1);
  ui.pick=null;
  save(); render();
}
function sendSubs(){
  var g=G(), q=ui.q, t=clockElapsed(g,q), list=(g.staged||[]).slice(), made=0, i;
  if(!list.length){ return; }
  rememberGameChange("subs sent in");
  suppressUndo=true;
  for(i=0;i<list.length;i++){
    var row=lineupAt(g,q,t), s=list[i];
    if(s.off ? row.indexOf(s.off)<0 : !!row[s.slot]){ continue; }
    if(row.indexOf(s.on)>=0 || !availableIn(g,s.on,q)){ continue; }
    var sub={q:q, t:t, off:s.off||0, on:s.on};
    if(!s.off){ sub.slot=s.slot; }
    g.subs.push(sub); made++;
    (g.subPlan||[]).forEach(function(p){ if(!p.done && p.q===q && p.off===s.off && p.on===s.on){ p.done=true; } });
  }
  suppressUndo=false;
  g.staged=[];
  ui.pick=null;
  save(); render();
  if(made<list.length){ alert((list.length-made)+" of the subs couldn\u2019t be made: the player coming out had already left the field or the player going in was already on."); }
}
/* the list that opens from a tap on the live pitch or the bench */
function renderPicker(){
  var box=document.getElementById("subPicker");
  if(!box){ return; }
  var g=G(), q=ui.q, p=ui.pick;
  if(!p || !isLive(g,q)){ box.hidden=true; box.innerHTML=""; return; }
  var row=lineupAt(g,q), f=qForm(g,q), m=stagedMaps(g), h="", i;
  if(p.on){
    h+='<h3>Who comes out for '+esc(nameOf(p.on,g))+'?</h3><div class="pickgrid">';
    for(i=0;i<row.length && i<f.pos.length;i++){
      if(row[i]){
        if(m.off[row[i]]){ continue; }
        h+='<button class="btn" onclick="stageSub('+row[i]+','+p.on+')"><span class="n">'+esc(f.pos[i].k)+'</span> '+esc(nameOf(row[i],g))+'</button>';
      }else if(!m.slot[i]){
        h+='<button class="btn" onclick="stageSub(0,'+p.on+','+i+')"><span class="n">'+esc(f.pos[i].k)+'</span> <i>open</i></button>';
      }
    }
  }else{
    var bench=presentInQ(g,q).filter(function(x){ return row.indexOf(x.id)<0 && !m.on[x.id]; }).sort(function(x,y){ return x.name.localeCompare(y.name); });
    h+='<h3>'+(p.off?'Who goes in for '+esc(nameOf(p.off,g))+' ('+esc(spotName(g,q,p.slot))+')?':'Who goes in at '+esc(spotName(g,q,p.slot))+'?')+'</h3><div class="pickgrid">';
    bench.forEach(function(x){
      h+='<button class="btn" onclick="stageSub('+(p.off||0)+','+x.id+','+p.slot+')">'+esc(x.name)+'</button>';
    });
    if(!bench.length){ h+='<span class="hint">Nobody left on the bench.</span>'; }
  }
  h+='</div><button class="btn quiet" onclick="closePicker()">Cancel</button>';
  box.innerHTML=h;
  box.hidden=false;
}
/* the subs that are ready, above the live pitch */
function renderStaged(g){
  var box=document.getElementById("stagedRow");
  if(!box){ return; }
  var live=isLive(g,ui.q), list=g.staged||[];
  if(!live || !list.length){ box.hidden=true; box.innerHTML=""; return; }
  var h='<div class="staged"><b>Ready:</b> ';
  h+=list.map(function(s,ix){
    return '<span class="stagedpair">'+esc(nameOf(s.on,g))+' '+(s.off?'for '+esc(nameOf(s.off,g))+' ('+esc(spotName(g,ui.q,lineupAt(g,ui.q).indexOf(s.off)))+')':'at '+esc(spotName(g,ui.q,s.slot)))+
           ' <button class="linkbtn" onclick="unstageSub('+ix+')" aria-label="Not this one">&times;</button></span>';
  }).join(" ");
  h+='</div><button class="btn green sendsubs" onclick="sendSubs()">Send '+(list.length===1?'sub':list.length+' subs')+' in</button>';
  box.innerHTML=h;
  box.hidden=false;
}

function liveMove(id, slot){
  var g=G(), q=ui.q, row=lineupAt(g,q), k=row.indexOf(id);
  if(k<0 || k===slot){ return; }
  rememberGameChange("position switch");
  g.subs.push({q:q, t:clockElapsed(g,q), move:true, id:id, slot:slot});
  save();
}
/* tap a player on the field and one on the bench (either order) to sub */
function tapLive(id, onField){
  var g=G(), sel=ui.subSel;
  if(sel && sel.id===id){ ui.subSel=null; renderLive(); return; }
  if(sel && sel.onField!==onField){
    var off=onField?id:sel.id, on=onField?sel.id:id;
    var t=askWhen(g,ui.q,nameOf(on,g)+" coming on for "+nameOf(off,g));
    if(t===null){ ui.subSel=null; renderLive(); return; }
    if(makeSub(off,on,t)){ save(); render(); }
    return;
  }
  ui.subSel={id:id, onField:onField};
  renderLive();
}
function removeSub(i){
  var g=G();
  rememberGameChange("remove sub");
  var s=g.subs[i];
  g.subs.splice(i,1);
  /* a planned sub that was made this way is planned again */
  (g.subPlan||[]).forEach(function(p){ if(p.done && p.q===s.q && p.off===s.off && p.on===s.on){ p.done=false; } });
  save(); render();
}
function setSubTime(i){
  var g=G(), s=g.subs[i];
  var v=prompt("When was this: "+subText(g,s)+"? (e.g. 7:30)", fmtClock(s.t));
  if(v===null){ return; }
  var t=parseClock(v);
  if(t===null){ alert("That isn't a time."); return; }
  rememberGameChange("sub time");
  s.t=Math.min(t,periodLen(g,s.q));
  save(); render();
}
/* goals scored while the clock runs keep the time */
function noteGoalTime(g, q, who, delta){
  if(!g.goalTimes){ g.goalTimes=[]; }
  if(delta>0){
    if(g.clock && g.clock.q===q){ g.goalTimes.push({q:q, t:clockElapsed(g,q), who:who}); }
    return;
  }
  var i;
  for(i=g.goalTimes.length-1;i>=0;i--){
    if(g.goalTimes[i].q===q && String(g.goalTimes[i].who)===String(who)){ g.goalTimes.splice(i,1); return; }
  }
}

/* ---------- planned subs ---------- */
function setPlanForm(field, v){ ui.ps=ui.ps||{}; ui.ps[field]=v; }
function addPlannedSub(){
  var g=G(), q=ui.q, ps=ui.ps||{}, t=parseClock(ps.t), off=Number(ps.off), on=Number(ps.on);
  if(t===null){ alert("Enter when, in minutes into the "+PW(g).low+" (e.g. 7:30)."); return; }
  if(!off || !on || off===on){ alert("Choose who comes off and who goes on."); return; }
  var row=lineupAt(g,q,t,true);
  if(row.indexOf(off)<0){ alert(nameOf(off,g)+" isn't planned to be on the field at "+fmtClock(t)+"."); return; }
  if(row.indexOf(on)>=0){ alert(nameOf(on,g)+" is already planned to be on the field at "+fmtClock(t)+"."); return; }
  if(!availableIn(g,on,q)){ alert(nameOf(on,g)+" isn't available."); return; }
  rememberGameChange("plan a sub");
  g.subPlan.push({q:q, t:Math.min(t,periodLen(g,q)), off:off, on:on, done:false});
  ui.ps={t:ps.t};
  save(); render();
}
function removePlannedSub(i){
  var g=G();
  rememberGameChange("remove planned sub");
  g.subPlan.splice(i,1);
  save(); render();
}
/* make a planned sub happen now (or at its planned time if the clock isn't running) */
function doPlannedSub(i){
  var g=G(), p=g.subPlan[i];
  if(!p){ return; }
  ui.q=p.q;
  var t=clockStarted(g,p.q) ? clockElapsed(g,p.q) : p.t;
  if(makeSub(p.off,p.on,t)){ p.done=true; save(); }
  render();
}
/* every planned sub that's due, made now in one go */
function doDueSubs(){
  var g=G(), q=ui.q, t=clockElapsed(g,q), list=pendingPlanned(g,q).filter(function(p){ return p.t<=t; }).sort(function(a,b){ return a.t-b.t; }), i;
  if(!list.length){ return; }
  rememberGameChange("subs");
  suppressUndo=true;
  for(i=0;i<list.length;i++){
    var row=lineupAt(g,q,t);
    if(row.indexOf(list[i].off)>=0 && row.indexOf(list[i].on)<0 && availableIn(g,list[i].on,q)){
      g.subs.push({q:q, t:t, off:list[i].off, on:list[i].on}); list[i].done=true;
    }
  }
  suppressUndo=false;
  ui.subSel=null;
  save(); render();
}
/* after a period played without the clock: the planned subs happened as planned */
function planToSubs(q){
  var g=G(), list=pendingPlanned(g,q).sort(function(a,b){ return a.t-b.t; }), made=0, i;
  rememberGameChange("planned subs made");
  suppressUndo=true;
  ui.q=q;
  for(i=0;i<list.length;i++){
    var row=lineupAt(g,q,list[i].t);
    if(row.indexOf(list[i].off)>=0 && row.indexOf(list[i].on)<0){
      g.subs.push({q:q, t:list[i].t, off:list[i].off, on:list[i].on});
      list[i].done=true; made++;
    }
  }
  suppressUndo=false;
  save(); render();
  if(made<list.length){ alert((list.length-made)+" planned sub"+(list.length-made===1?"":"s")+" couldn't be made: the player coming off wasn't on the field then."); }
}
/* sub times spread through a period: 15 minutes -> 7:30; 30 -> 10:00, 20:00 */
function defaultSubMarks(g){
  var L=(Number(g.qlen)||15)*60, n=Math.max(2,Math.ceil((Number(g.qlen)||15)/10)), out=[], i;
  for(i=1;i<n;i++){ out.push(Math.round((L*i/n)/30)*30); }
  return out;
}
function parseMarks(text){
  return String(text||"").split(/[,\s]+/).map(parseClock).filter(function(x){ return x!==null && x>0; })
    .sort(function(a,b){ return a-b; });
}
/* Plan subs for period q at the given times so playing time evens out: at
   each time, the players on the bench with the fewest minutes in the game
   come on for the outfield players with the most, where that gap is worth
   a change; among those, the bench player's fit for the spot decides. The
   keeper isn't changed. Replaces the period's planned subs not yet made. */
function suggestSubs(){
  var g=G(), q=ui.q, L=periodLen(g,q), f=qForm(g,q);
  var marks=parseMarks((ui.ps||{}).marks!==undefined ? ui.ps.marks : defaultSubMarks(g).map(fmtClock).join(", "))
    .filter(function(m){ return m<L && (!clockStarted(g,q) || m>clockElapsed(g,q)); });
  if(!marks.length){ alert("Enter one or more sub times within the "+PW(g).low+", e.g. 7:30."); return; }
  rememberGameChange("suggest subs");
  g.subPlan=g.subPlan.filter(function(s){ return !(s.q===q && !s.done); });
  var before={}, qq, id, sec, made=0;
  for(qq=0;qq<q;qq++){
    sec=periodSeconds(g,qq,true);
    for(id in sec){ if(Object.prototype.hasOwnProperty.call(sec,id)){ before[id]=(before[id]||0)+sec[id]; } }
  }
  var present=presentInQ(g,q).map(function(p){ return p.id; });
  marks.forEach(function(m, mi){
    var row=lineupAt(g,q,m,true), upto=periodSeconds(g,q,true,m), total={};
    present.forEach(function(pid){ total[pid]=(before[pid]||0)+(upto[pid]||0); });
    var segment=(mi+1<marks.length?marks[mi+1]:L)-m, minGap=Math.max(60,segment/2);
    var bench=present.filter(function(pid){ return row.indexOf(pid)<0; })
                     .sort(function(x,y){ return total[x]-total[y]; });
    var taken={};
    bench.forEach(function(b){
      var best=-1, bestScore=-1e9, k;
      for(k=0;k<row.length && k<f.pos.length;k++){
        var fid=row[k];
        if(!fid || taken[fid] || f.pos[k].z==="G"){ continue; }
        var gap=total[fid]-total[b];
        if(gap<minGap){ continue; }
        var score=gap/60+Math.max(0,fitScore(P(b,g),f.pos[k]))/25;
        if(score>bestScore){ bestScore=score; best=k; }
      }
      if(best<0){ return; }
      taken[row[best]]=true;
      g.subPlan.push({q:q, t:m, off:row[best], on:b, done:false});
      made++;
    });
  });
  save(); render();
  if(!made){ alert("No subs needed: playing time is already even enough at those times."); }
}

/* ---------- keeping the screen on while the clock runs ---------- */
var wakeLock=null;
function keepAwake(on){
  try{
    if(on && clockRunning(G()) && navigator.wakeLock && !wakeLock){
      navigator.wakeLock.request("screen").then(function(l){
        wakeLock=l;
        l.addEventListener("release",function(){ wakeLock=null; });
      }).catch(function(){});
    }else if(!on && wakeLock){
      wakeLock.release().catch(function(){});
      wakeLock=null;
    }
  }catch(e){}
}
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="visible" && S && clockRunning(G())){ keepAwake(true); render(); }
});
/* once a second while a clock runs: the time and which planned subs are due */
function tickClock(){
  if(!S){ return; }
  var g=G();
  if(!g || !clockRunning(g) || ui.tab!=="plan"){ return; }
  var q=g.clock.q, el=document.getElementById("clockTime");
  if(!el){ return; }
  var e=clockElapsed(g,q), L=(Number(g.qlen)||15)*60;
  el.textContent=fmtClock(e);
  el.classList.toggle("over", e>L);
  var pc=document.getElementById("pitchClock");
  if(pc){ pc.textContent=fmtClock(e); }
  var left=document.getElementById("clockLeft");
  if(left){ left.textContent=e>L ? fmtClock(e-L)+" over" : fmtClock(L-e)+" left"; }
  if(q!==ui.q){ return; }
  var due=[], rows=document.querySelectorAll("#plannedSubs [data-t]"), i;
  for(i=0;i<rows.length;i++){
    var isDue=e>=Number(rows[i].getAttribute("data-t"));
    rows[i].classList.toggle("due", isDue);
    if(isDue){ due.push(rows[i].getAttribute("data-what")); }
  }
  var d=document.getElementById("subDue");
  if(d){
    d.hidden=!due.length;
    document.getElementById("subDueText").textContent=due.length?(due.length===1?"Sub due: ":"Subs due: ")+due.join("; "):"";
    document.getElementById("subDueAll").hidden=!due.length;
    document.getElementById("subDueAll").textContent=due.length>1?"Make all "+due.length+" now":"Make it now";
  }
}
setInterval(tickClock, 1000);

/* the Clock and subs card on the Plan tab, for the period being viewed */
function renderLive(){
  var box=document.getElementById("clockCard"), subsBox=document.getElementById("subsCard");
  if(!box){ return; }
  var g=G(), q=ui.q, pw=PW(g), lbl=pw.s+(q+1), c=g.clock||{q:-1}, h="", i;
  var running=c.q===q && !!c.since, paused=c.q===q && !c.since, ended=!running && !paused && typeof (g.periodSecs||[])[q]==="number";
  var other=c.q>=0 && c.q!==q, e=clockElapsed(g,q), L=(Number(g.qlen)||15)*60;
  h+='<div class="row spread"><h2>Clock <span class="hint" style="margin:0">&mdash; '+pw.one+' '+(q+1)+'</span></h2>'+
     '<label class="field">Minutes per '+pw.low+'<input type="number" id="fQlen" min="1" max="60" inputmode="numeric" value="'+g.qlen+'" style="width:70px" onchange="setGameLength(this.value)"></label></div>';
  h+='<div class="clockrow"><span class="clocktime'+(e>L?' over':'')+'" id="'+(c.q===q?'clockTime':'clockStill')+'">'+fmtClock(e)+'</span>'+
     '<span class="hint" style="margin:0"'+(c.q===q?' id="clockLeft"':'')+'>'+(e>L?fmtClock(e-L)+' over':fmtClock(L-e)+' left')+'</span><span class="row">';
  if(running){
    h+='<button class="btn sm" onclick="pauseClock()">Pause</button><button class="btn sm quiet" onclick="endPeriod()">End '+lbl+'</button>';
  }else if(paused){
    h+='<button class="btn sm green" onclick="startClock('+q+')">Resume</button><button class="btn sm quiet" onclick="endPeriod()">End '+lbl+'</button>';
  }else if(ended){
    h+='<button class="btn sm quiet" onclick="setPeriodLength('+q+')">Ran '+fmtClock(periodLen(g,q))+' &middot; change</button>'+
       '<button class="btn sm quiet" onclick="startClock('+q+')">Resume</button>'+
       (q+1<g.nq?'<button class="btn sm green" onclick="startClock('+(q+1)+')">Start '+pw.s+(q+2)+'</button>':'');
  }else{
    h+='<button class="btn sm green" onclick="startClock('+q+')">Start '+lbl+'</button>';
  }
  h+='</span></div>';
  if(other){
    h+='<p class="hint">'+pw.s+(c.q+1)+'\u2019s clock is '+(c.since?'running':'paused')+' at <span id="clockTime">'+fmtClock(clockElapsed(g,c.q))+'</span>. '+
       '<button class="btn sm quiet" onclick="ui.q='+c.q+';render()">Go to '+pw.s+(c.q+1)+'</button></p>';
  }
  h+='<p class="warn" id="subDue" hidden><span id="subDueText"></span> <button class="btn sm green" id="subDueAll" onclick="doDueSubs()">Make it now</button></p>';
  box.innerHTML=h;
  h='<h2>Subs <span class="hint" style="margin:0">&mdash; '+pw.one+' '+(q+1)+'</span></h2>';

  /* log a sub after the fact (while live, subs are made on the pitch) */
  if(!running && !paused){
    var now=lineupAt(g,q), f=qForm(g,q), sel=ui.subSel;
    var bench=presentInQ(g,q).filter(function(p){ return now.indexOf(p.id)<0; }).sort(function(a,b){ return a.name.localeCompare(b.name); });
    h+='<details class="logsub"'+(sel?' open':'')+'><summary>Log a sub made without the clock</summary>'+
       '<h3 style="margin-top:8px">'+(subsIn(g,q).length?'On the field after the subs':'Starting lineup')+' <span class="hint" style="margin:0">&mdash; tap one here and one on the bench</span></h3><div class="chips livefield">';
    for(i=0;i<now.length && i<f.pos.length;i++){
      if(!now[i]){ continue; }
      h+='<button class="chip'+(sel&&sel.id===now[i]?' sel':'')+'" onclick="tapLive('+now[i]+',true)"><span class="n">'+esc(f.pos[i].k)+'</span>'+esc(nameOf(now[i],g))+'</button>';
    }
    h+='</div><h3 style="margin-top:6px">Bench</h3><div class="chips livebench">';
    bench.forEach(function(p){
      h+='<button class="chip'+(sel&&sel.id===p.id?' sel':'')+'" onclick="tapLive('+p.id+',false)">'+esc(p.name)+'</button>';
    });
    h+=(bench.length?'':'<span class="hint">Nobody on the bench.</span>')+'</div>';
    if(sel){ h+='<p class="hint" style="color:var(--pitch)">'+esc(nameOf(sel.id,g))+' chosen: now tap who '+(sel.onField?'comes on':'comes off')+'.</p>'; }
    h+='</details>';
  }else{
    h+='<p class="hint">While the clock runs, drag a player from the bench onto the field above to sub.</p>';
  }

  /* planned subs */
  var plan=(g.subPlan||[]).map(function(p,ix){ return {p:p, ix:ix}; }).filter(function(x){ return x.p.q===q; })
             .sort(function(a,b){ return a.p.t-b.p.t; });
  h+='<h3 style="margin-top:10px">Planned subs</h3><div id="plannedSubs">';
  if(!plan.length){ h+='<p class="hint">None planned for '+lbl+'.</p>'; }
  var prow=(g.plan[q]||[]).slice(0,g.onField), pending=pendingPlanned(g,q).length;
  plan.forEach(function(x){
    var p=x.p, k=lineupAt(g,q,p.t,true).indexOf(p.on), spot=k>=0?spotName(g,q,k):"";
    var what=nameOf(p.on,g)+' on for '+nameOf(p.off,g)+(spot?' ('+spot+')':'');
    h+='<div class="plansub'+(p.done?' done':'')+'"'+(p.done?'':' data-t="'+p.t+'" data-what="'+esc(what)+'"')+'>'+
       '<b>'+fmtClock(p.t)+'</b> <span>'+esc(what)+'</span>'+
       (p.done?' <span class="hint" style="margin:0">made</span>':' <button class="btn sm green" onclick="doPlannedSub('+x.ix+')">Sub now</button>')+
       ' <button class="btn sm quiet" onclick="removePlannedSub('+x.ix+')" aria-label="Remove this planned sub">&times;</button></div>';
  });
  h+='</div>';
  if(pending && !running && !paused){
    h+='<button class="btn sm quiet" onclick="planToSubs('+q+')">'+lbl+' was played as planned: make these subs</button>';
  }
  /* add one, or suggest */
  var ps=ui.ps||{}, opts=function(list, chosen){
    return list.map(function(p){ return '<option value="'+p.id+'"'+(String(chosen)===String(p.id)?' selected':'')+'>'+esc(p.name)+'</option>'; }).join("");
  };
  var everyone=presentInQ(g,q).slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
  var marksText=ps.marks!==undefined?ps.marks:defaultSubMarks(g).map(fmtClock).join(", ");
  h+='<div class="row planform" style="margin-top:8px">'+
     '<label class="field">At<input id="psTime" value="'+esc(ps.t||'')+'" placeholder="7:30" style="width:64px" oninput="setPlanForm(\'t\',this.value)"></label>'+
     '<label class="field">Off<select id="psOff" onchange="setPlanForm(\'off\',this.value)"><option value="">Who?</option>'+opts(everyone,ps.off)+'</select></label>'+
     '<label class="field">On<select id="psOn" onchange="setPlanForm(\'on\',this.value)"><option value="">Who?</option>'+opts(everyone,ps.on)+'</select></label>'+
     '<button class="btn sm" onclick="addPlannedSub()">Add</button></div>'+
     '<div class="row" style="margin-top:6px"><label class="field">Suggest subs at<input id="psMarks" value="'+esc(marksText)+'" style="width:120px" oninput="setPlanForm(\'marks\',this.value)"></label>'+
     '<button class="btn sm green" onclick="suggestSubs()">Suggest subs for '+lbl+'</button></div>'+
     '<p class="hint">Suggestions even out playing time across the game: players with the fewest minutes come on for those with the most, keeping the keeper. They replace '+lbl+'\u2019s planned subs that haven\u2019t been made.</p>';

  /* what happened: subs and goals with times */
  var events=[];
  (g.subs||[]).forEach(function(s,ix){
    if(s.q!==q){ return; }
    events.push({t:s.t, html:'<b>'+fmtClock(s.t)+'</b> <button class="linkbtn" onclick="setSubTime('+ix+')" title="Change the time">\u21c4</button> '+
      esc(subText(g,s))+' <button class="btn sm quiet" onclick="removeSub('+ix+')" aria-label="Remove this change">&times;</button>'});
  });
  (g.goalTimes||[]).forEach(function(x){
    if(x.q!==q){ return; }
    events.push({t:x.t, html:'<b>'+fmtClock(x.t)+'</b> \u26bd '+(x.who==="opp"?esc(g.opp||"Opponent"):esc(nameOf(Number(x.who),g)))});
  });
  events.sort(function(a,b){ return a.t-b.t; });
  h+='<h3 style="margin-top:10px">'+lbl+' so far</h3>'+(events.length?'<div class="timeline">'+events.map(function(x){ return '<div>'+x.html+'</div>'; }).join("")+'</div>':'<p class="hint">No subs made yet. Goals entered while the clock runs show here with their time.</p>');
  subsBox.innerHTML=h;
  tickClock();
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
    var g=games[i], qt=gameQtrs(g), secs=gameSeconds(g), roster=gameRoster(g);
    for(j=0;j<roster.length;j++){
      var id=roster[j].id;
      if(!t[id]){ t[id]={qtrs:0,satQ:0,mins:0,games:0,goals:0,availQ:0,missed:0}; }
      if(isOut(g,id)){ t[id].missed+=1; continue; }   /* missed games count for nothing */
      /* quarters after leaving the game count for nothing either */
      var qp=qt[id]||0, avail=availableQuarters(g,id);
      t[id].qtrs+=qp;
      t[id].satQ+=Math.max(0,avail-qp);
      t[id].availQ+=avail;
      t[id].mins+=(secs[id]||0)/60;
      t[id].games+=1;
      t[id].goals+=gameGoals(g,id);
    }
  }
  /* sitRate is the fair comparator: share of AVAILABLE quarters spent sitting.
     A player who missed a game is neither owed time nor penalised for it. */
  for(i=0;i<players.length;i++){
    var r=t[players[i].id];
    r.qtrs=Math.round(r.qtrs*10)/10;
    r.satQ=Math.round(r.satQ*10)/10;
    r.mins=Math.round(r.mins);
    r.sitRate = r.availQ>0 ? (r.satQ/r.availQ) : 0;
    r.playRate = r.availQ>0 ? (r.qtrs/r.availQ) : 0;
  }
  return t;
}

function showTab(t){
  ui.tab=t;
  ["plan","season","stats","setup"].forEach(function(k){
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

  /* Playing short: fewer players than outfield spots. Leave open the spot the
     coach chose (see setOpenSpot), otherwise drop from the front: a forward
     first, then a midfielder, then a defender, always keeping at least one
     player in every line, and the least important spot within a line. */
  var spare=outSlots.length-avail.length;
  if(spare>0){
    var dropped=openSpotsFor(g,ui.q,spare);
    outSlots=outSlots.filter(function(x){ return dropped.indexOf(x)<0; });
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
    clearGameClock(g);
  }
  g.qlen=p.m;
  ui.q=0; ui.selSlot=-1; ui.selPlayer=0;
  save(); render();
}
function setKeeperPlan(v){
  S.cfg.keeperPlan=(["halves","turns","middle","whole"].indexOf(v)>=0)?v:"halves";
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
  if(S.cfg.keeperPlan==="whole"){
    /* GK 1 the whole game; GK 2 only when GK 1 is out or has left the game
       (primaryKeeper is the first keeper available this quarter) */
    wantedKeeper=pk;
  }else if(S.cfg.keeperPlan==="middle"){
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
  if(isLive(G(),ui.q)){ liveSub(slot,id); return; }
  var row=curRow(), j;
  rememberGameChange("player placement");
  for(j=0;j<row.length;j++){ if(row[j]===id){ row[j]=0; } }
  row[slot]=id; save();
}
function tapSlot(i){
  if(isLive(G(),ui.q)){
    var lr=lineupAt(G(),ui.q);
    ui.selSlot=-1; ui.selPlayer=0;
    openPicker(lr[i] ? {off:lr[i], slot:i} : {slot:i});
    return;
  }
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
  if(isLive(G(),ui.q)){ ui.selSlot=-1; ui.selPlayer=0; openPicker({on:id}); return; }
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
  if(isLive(G(),ui.q)){
    if(target>=0 && target!==from){
      if(from>=0){ liveMove(id,target); } else { liveSub(target,id); }
    }
    ui.selSlot=-1; ui.selPlayer=0;
    render();
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
  endPeriodClock(g);
  keepAwake(false);
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
/* ---------- seasons ----------
   "Start a new season" puts the played games away in S.seasons together
   with the roster and setup as they were. Past seasons are kept for good
   and are read-only: Stats shows any of them with the same tables and
   trends as the current season. */
function findSeason(id){
  var i, list=(S && S.seasons)||[];
  for(i=0;i<list.length;i++){ if(list[i].id===id){ return list[i]; } }
  return null;
}
/* run fn with a past season's games, roster and setup in place of the
   current ones (for reading only) */
function withSeason(id, fn){
  var s=id?findSeason(id):null;
  if(!s){ return fn(); }
  var keep={games:S.games, roster:S.roster, cfg:S.cfg};
  S.games=s.games; S.roster=s.roster; S.cfg=s.cfg;
  try{ return fn(); }
  finally{ S.games=keep.games; S.roster=keep.roster; S.cfg=keep.cfg; }
}
function defaultSeasonName(games){
  var dates=games.map(function(g){ return g.date||""; }).filter(Boolean).sort();
  if(!dates.length){ return "Season "+todayISO().slice(0,4); }
  var m=Number(dates[0].slice(5,7)), y=dates[0].slice(0,4);
  return (m>=8?"Fall":(m>=6?"Summer":(m>=3?"Spring":"Winter")))+" "+y;
}
function makeSeason(name, games, cfg, roster){
  var dates=games.map(function(g){ return g.date||""; }).filter(Boolean).sort();
  return {id:S.nextSeasonId++, name:name, from:dates[0]||"", to:dates[dates.length-1]||"", endedAt:todayISO(),
          cfg:copyValue(cfg), roster:copyRoster(roster), games:copyValue(games)};
}
function startNewSeason(){
  var played=playedGames();
  if(!played.length){ alert("There are no played games to put away yet."); return; }
  var name=prompt("Starting a new season puts this season\u2019s "+played.length+" played game"+(played.length===1?"":"s")+
    " away, with the roster and setup as they are now. You can look back at it any time under Stats.\n\nName for the season that\u2019s ending:",
    defaultSeasonName(played));
  if(name===null){ return; }
  name=name.trim()||defaultSeasonName(played);
  if(!S.seasons){ S.seasons=[]; }
  if(!S.nextSeasonId){ S.nextSeasonId=1; }
  played.forEach(function(g){ endPeriodClock(g); if(!g.rosterSnapshot){ g.rosterSnapshot=copyRoster(S.roster); } });
  S.seasons.push(makeSeason(name, played, S.cfg, S.roster));
  /* planned games that haven't been played yet stay for the new season */
  S.games=S.games.filter(function(g){ return g.planned; });
  undoStack=[]; ui.editId=0; ui.q=0; ui.season=0; ui.trend={opp:"", off:{}};
  if(HA){ sync.checkpoint="new season"; }
  save();
  showTab("setup");
  alert(name+" is put away. See it any time on the Stats tab: choose it under Season.\n\n"+
        "Now get the roster ready for the new season: remove players who aren\u2019t coming back, add new ones, and check positions, tiers and goalkeepers.");
}
function pickSeason(v){
  ui.season=Number(v)||0;
  ui.trend={opp:"", off:{}};
  render();
}
function renameSeason(){
  var s=findSeason(ui.season);
  if(!s){ return; }
  var v=prompt("Name for this season:", s.name);
  if(v===null || !v.trim()){ return; }
  s.name=v.trim();
  save(); render();
}
function setSeasonCoach(){
  var s=findSeason(ui.season);
  if(!s){ return; }
  var v=prompt("Head coach for "+s.name+":", s.cfg.coach||"");
  if(v===null){ return; }
  s.cfg.coach=v.trim();
  save(); render();
}
/* Each season's record with its head coach, and each coach's record over
   every season: this season (once a game is played) and the past ones.
   Scrimmages don't count. */
function coachRecords(){
  var seasons=[], coaches={}, order=[];
  function add(id, name){
    withSeason(id, function(){
      var games=playedGames().filter(function(g){ return g.kind!=="scrimmage"; });
      if(!games.length){ return; }
      var all=seasonRecord(), po=seasonRecord("playoff"), gf=0, ga=0;
      games.forEach(function(g){ gf+=teamGoals(g); ga+=g.oppGoals||0; });
      var coach=(S.cfg.coach||"").trim(), key=coach.toLowerCase();
      seasons.push({name:name, coach:coach, rec:all, po:po, gf:gf, ga:ga});
      if(!coaches[key]){ coaches[key]={coach:coach, seasons:0, rec:{wins:0,losses:0,ties:0}, po:{wins:0,losses:0,ties:0}, gf:0, ga:0}; order.push(key); }
      var c=coaches[key];
      c.seasons++; c.gf+=gf; c.ga+=ga;
      ["wins","losses","ties"].forEach(function(k){ c.rec[k]+=all[k]; c.po[k]+=po[k]; });
    });
  }
  (S.seasons||[]).slice().sort(function(x,y){ return (x.from||"").localeCompare(y.from||"") || x.id-y.id; })
    .forEach(function(s){ add(s.id, s.name); });
  add(0, "This season");
  return {seasons:seasons, coaches:order.map(function(k){ return coaches[k]; })};
}
function renderCoachRecords(){
  var box=document.getElementById("coachRecords");
  if(!box){ return; }
  var r=coachRecords(), h="";
  if(!r.seasons.length){ box.innerHTML='<p class="hint">Records appear here once games are played.</p>'; return; }
  function po(x){ return (x.wins+x.losses+x.ties)?fmtRec(x):"\u2014"; }
  h+='<div class="scrollx"><table><thead><tr><th>Head coach</th><th class="num">Seasons</th><th class="num">Record</th><th class="num">Playoffs &amp; tournaments</th><th class="num">Scored</th><th class="num">Allowed</th></tr></thead><tbody>';
  r.coaches.forEach(function(c){
    h+='<tr><td>'+(c.coach?esc(c.coach):'<span class="hint" style="margin:0">Not set</span>')+'</td><td class="num">'+c.seasons+'</td><td class="num"><b>'+fmtRec(c.rec)+'</b></td><td class="num">'+po(c.po)+
       '</td><td class="num">'+c.gf+'</td><td class="num">'+c.ga+'</td></tr>';
  });
  h+='</tbody></table></div><h3 style="margin-top:10px">By season</h3><div class="scrollx"><table><thead><tr><th>Season</th><th>Head coach</th><th class="num">Record</th><th class="num">Playoffs &amp; tournaments</th></tr></thead><tbody>';
  r.seasons.forEach(function(s){
    h+='<tr><td>'+esc(s.name)+'</td><td>'+(s.coach?esc(s.coach):'<span class="hint" style="margin:0">Not set</span>')+'</td><td class="num">'+fmtRec(s.rec)+'</td><td class="num">'+po(s.po)+'</td></tr>';
  });
  h+='</tbody></table></div><p class="hint">Records are W-L-T; scrimmages don\u2019t count. The head coach is set in Setup and kept with each season; a past season\u2019s can be set with its Head coach button.</p>';
  box.innerHTML=h;
}
function deleteSeason(){
  var s=findSeason(ui.season);
  if(!s){ return; }
  if(!confirm("Delete "+s.name+" and its "+s.games.length+" game"+(s.games.length===1?"":"s")+" for good?\n\nDownload a backup first if you might want it later.")){ return; }
  S.seasons=S.seasons.filter(function(x){ return x!==s; });
  ui.season=0; ui.trend={opp:"", off:{}};
  save(); render();
}
/* add the seasons in a backup file (its current season and any it had put
   away) as past seasons, without changing anything else */
function importSeason(ev){
  var f=ev.target.files[0]; if(!f){ return; }
  var r=new FileReader();
  r.onload=function(){
    var keep=S, found=[], played=[], d=null, i;
    try{
      d=JSON.parse(r.result);
      if(!d || !d.roster || !d.cfg){ throw new Error("bad"); }
      normalizeState(d);
      played=playedGames().map(copyValue);
      for(i=0;i<d.seasons.length;i++){ found.push(copyValue(d.seasons[i])); }
    }catch(e){ S=keep; alert("That file isn\u2019t a backup from this tool."); return; }
    S=keep;
    var added=[];
    found.forEach(function(s){
      var copy=makeSeason(s.name, s.games, s.cfg, s.roster);
      copy.from=s.from||copy.from; copy.to=s.to||copy.to; copy.endedAt=s.endedAt||copy.endedAt;
      S.seasons.push(copy); added.push(copy.name);
    });
    if(played.length){
      var name=prompt("Name for the season in this backup ("+played.length+" played game"+(played.length===1?"":"s")+"):", defaultSeasonName(played));
      if(name!==null){
        var s=makeSeason(name.trim()||defaultSeasonName(played), played, d.cfg, d.roster);
        S.seasons.push(s); added.push(s.name); ui.season=s.id;
      }
    }
    if(!added.length){ alert("Nothing was added: that backup has no played games."); render(); return; }
    ui.trend={opp:"", off:{}};
    save(); render();
    alert("Added: "+added.join(", ")+".");
  };
  r.readAsText(f);
  ev.target.value="";
}
function zoneLabel(v){
  var i;
  for(i=0;i<ZONES.length;i++){ if(ZONES[i].v===v){ return ZONES[i].label; } }
  return v||"\u2014";
}
/* The Season card at the top of Stats: pick this season or a past one. A
   past one also gets its summary, players, roster and games here. */
function renderSeasonPick(){
  var sel=document.getElementById("seasonPick");
  if(!sel){ return; }
  if(ui.season && !findSeason(ui.season)){ ui.season=0; }
  var list=(S.seasons||[]).slice().sort(function(a,b){ return (b.to||"").localeCompare(a.to||"") || b.id-a.id; });
  var h='<option value="0">This season ('+playedGames().length+' game'+(playedGames().length===1?'':'s')+')</option>';
  list.forEach(function(s){
    var rec=withSeason(s.id, seasonRecord);
    h+='<option value="'+s.id+'"'+(s.id===ui.season?' selected':'')+'>'+esc(s.name)+' ('+rec.wins+'-'+rec.losses+'-'+rec.ties+')</option>';
  });
  sel.innerHTML=h;
  document.getElementById("seasonActions").hidden=!ui.season;
  var box=document.getElementById("pastSeason");
  if(!ui.season){ box.innerHTML=''; box.hidden=true; return; }
  box.hidden=false;
  box.innerHTML=withSeason(ui.season, function(){
    var s=findSeason(ui.season), rec=seasonRecord(), games=playedGames(), gf=0, ga=0, out="";
    games.forEach(function(g){ if(g.kind!=="scrimmage"){ gf+=teamGoals(g); ga+=g.oppGoals||0; } });
    out+='<p class="trendsum"><b>'+esc(s.name)+'</b>: '+esc(S.cfg.team)+(S.cfg.coach?' (head coach '+esc(S.cfg.coach)+')':'')+', '+S.cfg.onField+'v'+S.cfg.onField+', '+
         S.cfg.quarters+' &times; '+S.cfg.minutes+' min. '+(s.from?esc(s.from)+' to '+esc(s.to)+'. ':'')+
         esc(recordText(true))+'. Scored '+gf+', allowed '+ga+'.</p>';
    out+='<h3 style="margin-top:10px">Players</h3><div class="scrollx">'+seasonTableHTML()+'</div>';
    out+='<h3 style="margin-top:10px">Roster</h3><div class="scrollx"><table><thead><tr><th>Name</th><th>#</th><th>Primary</th><th>Secondary</th><th>Tier</th></tr></thead><tbody>';
    S.roster.slice().sort(function(a,b){ return a.name.localeCompare(b.name); }).forEach(function(p){
      out+='<tr><td>'+esc(p.name)+'</td><td>'+esc(p.num||"")+'</td><td>'+esc(zoneLabel(p.p1))+'</td><td>'+esc(zoneLabel(p.p2))+'</td><td>'+
           (["Not set","Strong","Middle","Developing"][p.tier||0])+'</td></tr>';
    });
    out+='</tbody></table></div>';
    out+='<h3 style="margin-top:10px">Games</h3><div class="scrollx"><table><thead><tr><th>Date</th><th>Opponent</th><th>Result</th><th class="num">GF</th><th class="num">GA</th><th>Notes</th></tr></thead><tbody>';
    games.slice().sort(function(a,b){ return (a.date||"").localeCompare(b.date||""); }).forEach(function(g){
      out+='<tr><td>'+esc(g.date||"")+'</td><td>'+esc(g.opp||"\u2014")+(g.kind?' <span class="tag kind">'+esc(kindLabel(g.kind))+'</span>':'')+'</td><td>'+(gameResult(g)||"\u2014")+'</td><td class="num">'+teamGoals(g)+'</td><td class="num">'+
           (g.oppGoals===null?"\u2014":g.oppGoals)+'</td><td class="gnote">'+esc(g.notes||"").replace(/\n/g,"<br>")+'</td></tr>';
    });
    out+='</tbody></table></div><p class="hint">Trends and Positions played below are for '+esc(s.name)+' too. Use the Trends section\u2019s "A closer look" to see each game\u2019s lineups.</p>';
    return out;
  });
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
  var oldMinutes=S.cfg.minutes;
  S.cfg.team=document.getElementById("cfgTeam").value.trim()||"Team";
  S.cfg.coach=document.getElementById("cfgCoach").value.trim();
  S.cfg.quarters=Math.max(2,Math.min(4,Number(document.getElementById("cfgQ").value)||4));
  S.cfg.minutes=Math.max(5,Math.min(45,Number(document.getElementById("cfgMin").value)||15));
  var g=S.current;
  if(g.nq!==S.cfg.quarters){
    discardUndoForGame(g);
    g.nq=S.cfg.quarters;
    g.plan=blankPlan(g.nq,g.onField);
    g.formations=defaultFormations(g.nq,g.formation);
    clearGameClock(g);
  }
  /* a length set for this game only stays */
  if(g.qlen===oldMinutes){ g.qlen=S.cfg.minutes; }
  if(ui.q>lastQ()){ ui.q=lastQ(); }
  save(); render();
}
/* withTime: add the time (downloads); "plain": no date (the one file
   that each backup replaces) */
function backupFileName(withTime){
  var team=(S.cfg.team||"Team").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-+|-+$/g,""), d=new Date(), t="";
  if(withTime==="plain"){ return (team||"Team")+"-SoccerLineup-backup.json"; }
  if(withTime){ t="-"+("0"+d.getHours()).slice(-2)+("0"+d.getMinutes()).slice(-2); }
  return (team||"Team")+"-SoccerLineup-backup-"+todayISO()+t+".json";
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
      file=new File([text], backupFileName(false), {type:types[i]});
      if(navigator.canShare({files:[file]})){ return file; }
    }
  }catch(e){}
  return null;
}
function usesShareSheet(){ return !!shareableBackup("{}"); }
/* ---------- saving a backup straight to a file ----------
   A download that replaces a file with the same name can stall at 100% on
   Windows (the finished file is checked, or another program or a sync
   folder holds the old one), and stalled downloads can lock up the browser.
   Where the browser lets a page write a file itself (Chrome and Edge on a
   computer, from an https:// address), "Save backup" asks where once and
   then writes that file directly each time, replacing it: no download.
   Elsewhere the backup downloads with the time in its name, so a download
   never has to replace an earlier one. */
var backupHandle=null, backupHandleLoaded=false;
function canSaveToFile(){
  try{ return typeof window.showSaveFilePicker==="function" && window.isSecureContext && !usesShareSheet(); }
  catch(e){ return false; }
}
/* the chosen file is remembered on this device (IndexedDB) */
function handleStore(write, value){
  return new Promise(function(resolve){
    try{
      var req=indexedDB.open("soccerlineup-files",1);
      req.onupgradeneeded=function(){ req.result.createObjectStore("handles"); };
      req.onerror=function(){ resolve(null); };
      req.onsuccess=function(){
        try{
          var db=req.result, tx=db.transaction("handles", write?"readwrite":"readonly"), st=tx.objectStore("handles");
          var r=write ? (value?st.put(value,"backup"):st.delete("backup")) : st.get("backup");
          r.onsuccess=function(){ resolve(write?null:(r.result||null)); };
          r.onerror=function(){ resolve(null); };
        }catch(e){ resolve(null); }
      };
    }catch(e){ resolve(null); }
  });
}
function loadBackupHandle(){
  if(backupHandleLoaded){ return Promise.resolve(backupHandle); }
  return handleStore(false).then(function(h){
    backupHandleLoaded=true;
    if(h && !backupHandle){ backupHandle=h; renderBackupStatus(); }
    return backupHandle;
  });
}
function pickBackupFile(){
  return window.showSaveFilePicker({
    suggestedName:backupFileName("plain"),
    types:[{description:"SoccerLineup backup", accept:{"application/json":[".json"]}}]
  });
}
function mayWrite(h){
  if(!h.queryPermission){ return Promise.resolve(true); }
  return h.queryPermission({mode:"readwrite"}).then(function(p){
    if(p==="granted"){ return true; }
    return h.requestPermission({mode:"readwrite"}).then(function(q){ return q==="granted"; });
  });
}
/* write the backup to the remembered file (or a newly chosen one) */
function saveBackupToFile(stamp, text, choose){
  var start=choose ? Promise.resolve(null) : loadBackupHandle();
  return start.then(function(h){
    if(!h){ return pickBackupFile(); }
    return mayWrite(h).then(function(ok){ return ok ? h : pickBackupFile(); });
  }).then(function(h){
    return h.createWritable().then(function(w){
      return w.write(text).then(function(){ return w.close(); });
    }).then(function(){
      backupHandle=h; backupHandleLoaded=true;
      handleStore(true, h);
      hideBackupToast();
      backupSaved(stamp);
    });
  }).catch(function(err){
    if(err && err.name==="AbortError"){ return; }   /* closed the Save dialog */
    downloadBackup(stamp, text);                       /* anything else: an ordinary download */
  });
}
function chooseBackupFile(){
  var stamp=new Date().toISOString();
  saveBackupToFile(stamp, backupText(stamp), true);
}
function downloadBackup(stamp, text){
  var blob=new Blob([text],{type:"application/json"});
  var a=document.createElement("a"), url=URL.createObjectURL(blob);
  a.href=url;
  a.download=backupFileName(true);
  document.body.appendChild(a);
  a.click();
  /* some browsers start the download after click() returns, so release the
     file a little later rather than immediately */
  setTimeout(function(){ URL.revokeObjectURL(url); if(a.parentNode){ a.parentNode.removeChild(a); } },4000);
  backupSaved(stamp);
}
function exportData(){
  var stamp=new Date().toISOString(), text=backupText(stamp), file=shareableBackup(text);
  if(!file && canSaveToFile()){ saveBackupToFile(stamp, text, false); return; }
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
  downloadBackup(stamp, text);
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
  var phone=usesShareSheet(), toFile=!phone && canSaveToFile(), btn=document.getElementById("backupBtn"), lbl=document.getElementById("autoBackupText");
  if(toFile && !backupHandleLoaded){ loadBackupHandle(); }
  if(btn){ btn.textContent=phone?"Save backup":(toFile?(backupHandle?"Save backup to "+backupHandle.name:"Save backup\u2026"):"Download backup"); }
  var other=document.getElementById("backupOtherBtn");
  if(other){ other.hidden=!(toFile && backupHandle); }
  var how=document.getElementById("backupHow");
  if(how){
    how.textContent=toFile ? (backupHandle ? "Each backup replaces "+backupHandle.name+" (in the folder you chose). The browser may ask once per visit to allow it." :
                                             "Choose where to keep the backup file once; after that each backup replaces it, with no download.") :
                    (phone ? "" : "Each download has the date and time in its name, so it never has to replace an earlier file.");
  }
  if(lbl){ lbl.textContent=phone?" Offer to save a backup every time I save a game":(toFile?" Save a backup every time I save a game":" Download a backup every time I save a game"); }
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
  var rec=seasonRecord();
  document.getElementById("brandSub").textContent=(rec.wins+rec.losses+rec.ties) ? recordText(false) :
    S.cfg.onField+"v"+S.cfg.onField+" \u00b7 "+S.roster.length+" players";
  document.getElementById("brandSub").title="Record (W-L-T), scrimmages not counted";
  haRenderChrome();
  renderPlan(); renderLive(); renderSeason(); renderSeasonPick(); renderCoachRecords(); renderSetup(); renderPrint();
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
      var stOff=(isLive(g,q) && ((id && stagedMaps(g).off[id]) || (!id && stagedMaps(g).slot[i])));
      var cls="slotbox"+(id?"":" empty")+(ui.selSlot===i?" sel":"")+(stOff?" staged":"")+
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
  var gkLabel=canKeep(p)?(p.gkOrder?"GK"+p.gkOrder:"GK"):"", g=G();
  var staged=isLive(g,ui.q) && stagedMaps(g).on[p.id];
  return '<button class="chip'+(ui.selPlayer===p.id?" sel":"")+(staged?" staged":"")+(p.tier===1?" t1":(p.tier===3?" t3":""))+
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
  document.getElementById("fKind").value=g.kind||"";
  document.getElementById("fDate").value=g.date||"";
  var notesEl=document.getElementById("fNotes");
  if(notesEl && document.activeElement!==notesEl){ notesEl.value=g.notes||""; }
  renderOpponentNotes(g);
  document.getElementById("fOppGoals").value=(g.oppGoals===null || g.oppGoals===undefined)?"":g.oppGoals;
  var byPeriod=Array.isArray(g.oppGoalsQ);
  document.getElementById("fOppGoals").readOnly=byPeriod;
  document.getElementById("fOppGoals").title=byPeriod?"The total of the "+PW(g).lows+" below":"";
  document.getElementById("oppQRow").innerHTML=
    '<span><b>'+esc(g.opp||"Opponent")+'</b> goals in '+PW(g).s+(ui.q+1)+':</span> '+
    '<button class="btn sm quiet" onclick="bumpOppGoal('+ui.q+',-1)" aria-label="One fewer opponent goal">\u2212</button> '+
    '<b class="oppq" id="oppQValue">'+(oppGoalsIn(g,ui.q)===null?"\u2014":oppGoalsIn(g,ui.q))+'</b> '+
    '<button class="btn sm" onclick="bumpOppGoal('+ui.q+',1)" aria-label="One more opponent goal">+</button>'+
    (byPeriod?' <button class="btn sm quiet" onclick="clearOppByPeriod()">Use a total instead</button>'
             :' <span class="hint" style="margin:0">Record them by '+PW(g).low+' to see when goals are allowed (Stats, Trends).</span>');
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
    (presNow.length?((g.onField*g.nq)/presNow.length).toFixed(2):"0")+" "+PW(g).lows+"."+
    (presNow.length<g.onField?" Playing "+(g.onField-presNow.length)+" short.":"");

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

  var live=isLive(g,ui.q);
  document.getElementById("pitchTitle").innerHTML=live ?
    esc(PW(g).one+" "+(ui.q+1))+' <span class="livetag">'+(g.clock.since?'LIVE':'PAUSED')+' <span id="pitchClock">'+fmtClock(clockElapsed(g,ui.q))+'</span></span>' :
    esc(PW(g).one+" "+(ui.q+1)+(subsIn(g,ui.q).length||pendingPlanned(g,ui.q).length?" \u2014 starting lineup":""));
  var liveHint=document.getElementById("liveHint");
  liveHint.hidden=!live;
  liveHint.textContent=live?"Tap a player to get a sub ready (or tap a bench player first), then Send subs in. Or drag a bench player onto a spot to sub right away; drag between spots to switch positions. Undo takes a change back.":"";
  renderStaged(g);
  renderPicker();
  /* the starting lineup and formation stay as they were while the period is played */
  ["qAutoBtn","qClearBtn","qFormation"].forEach(function(id){
    var el=document.getElementById(id);
    el.disabled=live;
    el.title=live?"Not while this "+PW(g).low+" is being played: end its clock first":"";
  });
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

  var sh=shortInfo(g,ui.q), shortRow=document.getElementById("shortRow");
  shortRow.hidden=!(sh.by>0);
  if(sh.by>0){
    var fq=qForm(g,ui.q), so=sh.open.length?'':'<option value="" selected>choose&hellip;</option>', si;
    for(si=0;si<fq.pos.length && si<g.onField;si++){
      if(fq.pos[si].z==="G"){ continue; }
      so+='<option value="'+fq.pos[si].k+'"'+(sh.open[0]===fq.pos[si].k?" selected":"")+'>'+fq.pos[si].k+'</option>';
    }
    document.getElementById("shortText").textContent="Playing "+sh.by+" short this "+PW(g).low+
      (sh.open.length?" ("+sh.open.join(", ")+" open).":".");
    document.getElementById("shortSpot").innerHTML=so;
  }

  var row=live?lineupAt(g,ui.q):curRow();
  document.getElementById("pitchSvg").outerHTML=
    pitchSVG(g,row,true,ui.q).replace('<svg ','<svg class="pitch'+(live?' live':'')+'" id="pitchSvg" ');

  var bench=presentInQ(g,ui.q).filter(function(p){ return row.indexOf(p.id)<0; });
  document.getElementById("benchHdr").textContent=live?"Bench ("+bench.length+") \u2014 drag onto the field to sub":"Sitting ("+bench.length+")";

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
      if(filled>0 && filled<g.onField && filled<presentInQ(g,q).length){
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
  if(ui.q>0 && !live){   /* the previous period's reference isn't shown while this one is live */
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
  var qc=gameQtrs(g,true);
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
       '</td><td class="num" style="text-align:center">'+fmtQ(rows[i].plays)+
       '</td><td class="num" style="text-align:center">'+fmtQ(Math.max(0,rows[i].avail-rows[i].plays))+
       '</td><td class="num" style="text-align:center">'+fmtQ(rows[i].seasonSatQ)+'</td></tr>';
  }
  h+='</tbody></table>';
  h+='<p class="hint">'+PW(g).many+' for the lineups as they stand now, counting subs made and planned (part of a '+PW(g).low+' for coming on or going off partway). Change a '+PW(g).low+' and these update.</p>';
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
      f=qForm(g,q);
      periodAppearances(g,q).forEach(function(ap){
        if(!stats[ap.id] || !f.pos[ap.slot]){ return; }
        line=lineOfZone(f.pos[ap.slot].z);
        stats[ap.id][line]++;
        stats[ap.id].goals[line]+=goalsOf(g,ap.id,q);
      });
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
function renderPositionStats(){ withSeason(ui.season, renderPositionStatsNow); }
function renderPositionStatsNow(){
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

/* ---------- trends ----------
   Offense and defense across played games, filtered by opponent and game:
   goals for and against by period, by formation, by goalkeeper, and while
   each player is on the field. Goals against by period need the opponent's
   goals recorded by period; games with only a total are left out of those
   figures (and the page says how many). */
function trendKinds(){
  ui.trend=ui.trend||{opp:"", off:{}};
  if(!ui.trend.kinds){ ui.trend.kinds={"":true, playoff:true, scrimmage:false}; }
  return ui.trend.kinds;
}
function setTrendKind(k, on){ trendKinds()[k]=!!on; renderTrends(); }
function trendGames(){
  var tf=ui.trend||{opp:"", off:{}}, opp=(tf.opp||"").toLowerCase(), kinds=trendKinds();
  return playedGames().filter(function(g){
    if(!kinds[g.kind||""]){ return false; }
    if(opp && (g.opp||"").trim().toLowerCase()!==opp){ return false; }
    return !tf.off[g.id];
  });
}
function setTrendOpp(v){ ui.trend=ui.trend||{opp:"", off:{}}; ui.trend.opp=v; renderTrends(); }
function setTrendGame(id, on){
  ui.trend=ui.trend||{opp:"", off:{}};
  if(on){ delete ui.trend.off[id]; } else { ui.trend.off[id]=true; }
  renderTrends();
}
function setTrendAll(on){
  ui.trend=ui.trend||{opp:"", off:{}};
  ui.trend.off={};
  if(!on){ withSeason(ui.season, function(){ playedGames().forEach(function(g){ ui.trend.off[g.id]=true; }); }); }
  renderTrends();
}
function teamGoalsIn(g, q){
  var t=0, ids=Object.keys(g.goals||{}), i;
  for(i=0;i<ids.length;i++){ t+=goalsOf(g,ids[i],q); }
  return t;
}
function computeTrends(games){
  var counts={}, nq=0, best=0, i, g, q, f, row, j, id, k;
  /* the period chart uses the most common format among these games */
  games.forEach(function(x){ counts[x.nq]=(counts[x.nq]||0)+1; });
  for(k in counts){ if(Object.prototype.hasOwnProperty.call(counts,k) && counts[k]>best){ best=counts[k]; nq=Number(k); } }
  var t={ games:games.length, nq:nq, gf:0, ga:0, gaGames:0, rec:{w:0,l:0,t:0},
          periods:[], periodGames:0, periodGaGames:0, forms:{}, keepers:{}, players:{} };
  for(q=0;q<nq;q++){ t.periods.push({gf:0, ga:0}); }
  for(i=0;i<games.length;i++){
    g=games[i];
    var r=gameResult(g), hasQ=oppByPeriod(g);
    if(g.kind==="scrimmage"){ r=""; }   /* scrimmages don't count in a record */
    if(r==="W"){ t.rec.w++; } else if(r==="L"){ t.rec.l++; } else if(r==="T"){ t.rec.t++; }
    t.gf+=teamGoals(g);
    if(g.oppGoals!==null && g.oppGoals!==undefined){ t.ga+=Number(g.oppGoals)||0; t.gaGames++; }
    if(g.nq===nq){
      t.periodGames++;
      if(hasQ){ t.periodGaGames++; }
    }
    for(q=0;q<g.nq;q++){
      var gfq=teamGoalsIn(g,q), gaq=oppGoalsIn(g,q);
      if(g.nq===nq){
        t.periods[q].gf+=gfq;
        if(gaq!==null){ t.periods[q].ga+=gaq; }
      }
      f=qForm(g,q);
      var fn=qFormName(g,q), apps=periodAppearances(g,q);
      var fs=t.forms[fn]=t.forms[fn]||{periods:0, gf:0, ga:0, gaPeriods:0};
      fs.periods++; fs.gf+=gfq;
      if(gaq!==null){ fs.ga+=gaq; fs.gaPeriods++; }
      for(j=0;j<apps.length;j++){
        id=apps[j].id;
        if(!f.pos[apps[j].slot]){ continue; }
        if(f.pos[apps[j].slot].z==="G"){
          var ks=t.keepers[id]=t.keepers[id]||{name:nameOf(id,g), periods:0, ga:0, gaPeriods:0};
          ks.periods++;
          if(gaq!==null){ ks.ga+=gaq; ks.gaPeriods++; }
        }
        var ps=t.players[id]=t.players[id]||{name:nameOf(id,g), periods:0, gf:0, ga:0, gaPeriods:0};
        ps.periods++; ps.gf+=gfq;
        if(gaq!==null){ ps.ga+=gaq; ps.gaPeriods++; }
      }
    }
  }
  return t;
}
function fmt1(x){ return (Math.round(x*10)/10).toFixed(1); }
/* Goals for and against per game in each period: grouped bars, one axis. */
function trendChart(t){
  var W=560, H=220, padL=34, padR=10, padT=14, padB=34, n=t.nq, pw=periodWords(n), i, s="";
  if(!n || !t.periodGames){ return ""; }
  var gfAvg=[], gaAvg=[], max=0;
  for(i=0;i<n;i++){
    gfAvg.push(t.periods[i].gf/t.periodGames);
    gaAvg.push(t.periodGaGames ? t.periods[i].ga/t.periodGaGames : null);
    max=Math.max(max, gfAvg[i], gaAvg[i]||0);
  }
  var top=Math.max(1, Math.ceil(max*2)/2), plotH=H-padT-padB, plotW=W-padL-padR;
  var y=function(v){ return padT+plotH-(v/top)*plotH; };
  var group=plotW/n, bw=Math.min(34,(group-18)/2), gap=2;
  s+='<svg class="trendchart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Goals scored and allowed per game in each '+pw.low+'">';
  /* recessive grid: halves of a goal */
  for(var v=0; v<=top+0.0001; v+=(top>3?1:0.5)){
    s+='<line class="grid" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+y(v)+'" y2="'+y(v)+'"/>'+
       '<text class="axis" x="'+(padL-6)+'" y="'+(y(v)+4)+'" text-anchor="end">'+(v%1?v.toFixed(1):v)+'</text>';
  }
  for(i=0;i<n;i++){
    var cx=padL+group*i+group/2, label=pw.s+(i+1);
    var bars=[{v:gfAvg[i], cls:"for", x:cx-bw-gap/2, what:"Scored"}, {v:gaAvg[i], cls:"against", x:cx+gap/2, what:"Allowed"}];
    bars.forEach(function(b){
      if(b.v===null){ return; }
      var h=Math.max(0, padT+plotH-y(b.v)), r=Math.min(4,h);
      /* rounded data end, square at the baseline */
      var x0=b.x, x1=b.x+bw, yb=padT+plotH, yt=yb-h;
      var d=h<=0 ? "" : 'M'+x0+','+yb+' L'+x0+','+(yt+r)+' Q'+x0+','+yt+' '+(x0+r)+','+yt+' L'+(x1-r)+','+yt+' Q'+x1+','+yt+' '+x1+','+(yt+r)+' L'+x1+','+yb+' Z';
      s+='<g class="bar '+b.cls+'" tabindex="0"><title>'+label+': '+b.what+' '+fmt1(b.v)+' per game</title>'+
         '<rect class="hit" x="'+(b.x-2)+'" y="'+padT+'" width="'+(bw+4)+'" height="'+plotH+'"/>'+
         (d?'<path d="'+d+'"/>':'')+
         '<text class="val" x="'+(b.x+bw/2)+'" y="'+(yt-4)+'" text-anchor="middle">'+fmt1(b.v)+'</text></g>';
    });
    s+='<text class="axis" x="'+cx+'" y="'+(H-padB+16)+'" text-anchor="middle">'+label+'</text>';
  }
  s+='<line class="baseline" x1="'+padL+'" x2="'+(W-padR)+'" y1="'+(padT+plotH)+'" y2="'+(padT+plotH)+'"/></svg>';
  return '<div class="legend"><span class="key for"></span>Scored <span class="key against"></span>Allowed'+
         '<span class="hint" style="margin:0 0 0 8px">per game, in each '+pw.low+'</span></div>'+s;
}
/* ---------- a closer look at one period ----------
   For the chosen period (say Q2) of the selected games: each game's
   formation, keeper, score and lineup by line, who sat, and how many also
   played the period before; then that period by formation, by keeper, and
   for each player on the field versus on the bench. */
function setTrendQ(q){ ui.trend=ui.trend||{opp:"", off:{}}; ui.trend.q=q; renderTrends(); }
/* the period with the most goals allowed (the first one on a tie) */
function worstPeriod(t){
  var most=-1, worst=0, i;
  if(!t.periodGaGames){ return 0; }
  for(i=0;i<t.nq;i++){ if(t.periods[i].ga>most){ most=t.periods[i].ga; worst=i; } }
  return worst;
}
function lineupByLine(g, q){
  var f=qForm(g,q), row=g.plan[q]||[], lines={G:[], D:[], M:[], F:[]}, j;
  for(j=0;j<f.pos.length && j<g.onField;j++){
    lines[f.pos[j].z==="G"?"G":lineGroup(f.pos[j].z)].push({k:f.pos[j].k, id:row[j]||0});
  }
  return lines;
}
function computeQuarterLook(games, q, nq){
  var L={q:q, games:[], gf:0, ga:0, gaGames:0, otherGf:0, otherPeriods:0, otherGa:0, otherGaPeriods:0,
         forms:{}, keepers:{}, players:{}, stayedMost:{n:0, ga:0}, freshMost:{n:0, ga:0}};
  function stat(){ return {n:0, gf:0, ga:0, gaN:0}; }
  function add(s, gf, ga){ s.n++; s.gf+=gf; if(ga!==null){ s.ga+=ga; s.gaN++; } }
  games.forEach(function(g){
    if(g.nq!==nq){ return; }
    var gfq=teamGoalsIn(g,q), gaq=oppGoalsIn(g,q), f=qForm(g,q), prev=q>0?lineupAt(g,q-1):null;
    var on={}, keeper=0, outfield=0, stayed=0, bench=[], i, j, id, apps=periodAppearances(g,q);
    for(i=0;i<g.nq;i++){
      if(i===q){ continue; }
      var o=oppGoalsIn(g,i);
      L.otherGf+=teamGoalsIn(g,i); L.otherPeriods++;
      if(o!==null){ L.otherGa+=o; L.otherGaPeriods++; }
    }
    L.gf+=gfq;
    if(gaq!==null){ L.ga+=gaq; L.gaGames++; }
    var fn=qFormName(g,q);
    add(L.forms[fn]=L.forms[fn]||stat(), gfq, gaq);
    for(j=0;j<apps.length;j++){
      id=apps[j].id;
      if(!f.pos[apps[j].slot]){ continue; }
      on[id]=f.pos[apps[j].slot].z==="G"?"G":lineGroup(f.pos[apps[j].slot].z);
      if(on[id]==="G"){ if(!keeper){ keeper=id; } continue; }
      if((g.plan[q]||[]).indexOf(id)<0){ continue; }   /* came on as a sub */
      outfield++;
      if(prev && prev.indexOf(id)>=0){ stayed++; }
    }
    if(keeper){
      var ks=L.keepers[keeper]=L.keepers[keeper]||stat();
      ks.name=nameOf(keeper,g);
      add(ks, gfq, gaq);
    }
    presentInQ(g,q).forEach(function(p){
      var ps=L.players[p.id]=L.players[p.id]||{name:p.name, on:stat(), off:stat(), lines:{G:0, D:0, M:0, F:0}};
      if(on[p.id]){ add(ps.on, gfq, gaq); ps.lines[on[p.id]]++; }
      else { add(ps.off, gfq, gaq); bench.push(p.name); }
    });
    if(prev && outfield && gaq!==null){
      var bucket=(stayed*2>outfield)?L.stayedMost:L.freshMost;
      bucket.n++; bucket.ga+=gaq;
    }
    L.games.push({g:g, form:fn, keeper:keeper?nameOf(keeper,g):"", gf:gfq, ga:gaq,
                  lines:lineupByLine(g,q), bench:bench, stayed:stayed, outfield:outfield, hasPrev:!!prev,
                  subs:subsIn(g,q).map(function(s){ return fmtClock(s.t)+' '+subText(g,s); })});
  });
  L.games.sort(function(x,y){ return (x.g.date||"").localeCompare(y.g.date||""); });
  return L;
}
function openGameAt(id, q){ editGame(id); ui.q=q; render(); }
function renderQuarterLook(games, t){
  if(!t.nq || !t.periodGames){ return ""; }
  var tf=ui.trend, q=(tf.q!==undefined && tf.q!==null && tf.q<t.nq) ? tf.q : worstPeriod(t);
  var pw=periodWords(t.nq), lbl=pw.s+(q+1), prevLbl=pw.s+q, L=computeQuarterLook(games,q,t.nq), h="", i;
  function rate(n,d){ return d?fmt1(n/d):"\u2014"; }
  h+='<h3 style="margin-top:14px">A closer look at one '+pw.low+'</h3>'+
     '<div class="qtabs qlookpick" role="tablist" aria-label="'+pw.one+' to look at">';
  for(i=0;i<t.nq;i++){
    h+='<button role="tab" aria-selected="'+(i===q)+'" onclick="setTrendQ('+i+')">'+pw.s+(i+1)+'</button>';
  }
  h+='</div>';
  h+='<p class="trendsum"><b>'+lbl+' in '+L.games.length+' game'+(L.games.length===1?'':'s')+'</b>: scored '+L.gf+' ('+rate(L.gf,L.games.length)+' a game)'+
     (L.gaGames?', allowed '+L.ga+' ('+rate(L.ga,L.gaGames)+' a game'+(L.gaGames<L.games.length?', from the '+L.gaGames+' recorded by '+pw.low:'')+')':', allowed: not recorded by '+pw.low+' yet')+
     '. The other '+pw.lows+': '+rate(L.otherGf,L.otherPeriods)+' scored'+
     (L.otherGaPeriods?', '+rate(L.otherGa,L.otherGaPeriods)+' allowed':'')+' a game each.</p>';

  /* game by game */
  h+='<h4>Game by game</h4><p class="hint">Starting lineups; subs during the '+pw.low+' are listed under them.</p><div class="qgames">';
  L.games.forEach(function(x){
    var names=function(list){
      return list.map(function(s){ return '<span class="qpos">'+esc(s.k)+'</span> '+(s.id?esc(nameOf(s.id,x.g)):'<i>open</i>'); }).join(', ');
    };
    h+='<div class="qgame"><div class="qhead"><b>'+esc(x.g.date||"")+' '+esc(x.g.opp||"")+'</b>'+
       '<span>'+esc(x.form)+'</span>'+
       (x.keeper?'<span>GK '+esc(x.keeper)+'</span>':'')+
       '<span>'+lbl+': us '+x.gf+', them '+(x.ga===null?'?':x.ga)+'</span>'+
       (x.hasPrev&&x.outfield?'<span>'+x.stayed+' of '+x.outfield+' also played '+prevLbl+'</span>':'')+
       (ui.season?'':'<button class="btn sm quiet" onclick="openGameAt('+x.g.id+','+q+')">Open</button>')+'</div>';
    [['D','Defense'],['M','Midfield'],['F','Forwards']].forEach(function(z){
      if(x.lines[z[0]].length){ h+='<div class="qline"><span class="qz">'+z[1]+'</span> '+names(x.lines[z[0]])+'</div>'; }
    });
    if(x.subs.length){ h+='<div class="qline"><span class="qz">Subs</span> '+esc(x.subs.join(", "))+'</div>'; }
    if(x.bench.length){ h+='<div class="qline"><span class="qz">Bench</span> '+esc(x.bench.join(", "))+'</div>'; }
    h+='</div>';
  });
  h+='</div>';
  if(L.stayedMost.n && L.freshMost.n){
    h+='<p class="hint">When most of the field also played '+prevLbl+', '+lbl+' allowed '+rate(L.stayedMost.ga,L.stayedMost.n)+' a game ('+L.stayedMost.n+
       ' game'+(L.stayedMost.n===1?'':'s')+'); with mostly fresh players, '+rate(L.freshMost.ga,L.freshMost.n)+' ('+L.freshMost.n+' game'+(L.freshMost.n===1?'':'s')+').</p>';
  }

  /* by formation and keeper, this period only */
  var fk=Object.keys(L.forms).sort(function(x,y){ return L.forms[y].n-L.forms[x].n || x.localeCompare(y); });
  h+='<h4>'+lbl+' by formation</h4><div class="scrollx"><table><thead><tr><th>Formation</th><th class="num">Games</th>'+
     '<th class="num">Scored</th><th class="num">Allowed</th><th class="num">Scored a game</th><th class="num">Allowed a game</th></tr></thead><tbody>';
  fk.forEach(function(k){
    var s=L.forms[k];
    h+='<tr><td>'+esc(k)+'</td><td class="num">'+s.n+'</td><td class="num">'+s.gf+'</td><td class="num">'+(s.gaN?s.ga:"\u2014")+'</td>'+
       '<td class="num">'+rate(s.gf,s.n)+'</td><td class="num">'+rate(s.ga,s.gaN)+'</td></tr>';
  });
  h+='</tbody></table></div>';
  var kk=Object.keys(L.keepers).sort(function(x,y){ return L.keepers[y].n-L.keepers[x].n; });
  if(kk.length){
    h+='<h4>'+lbl+' by goalkeeper</h4><div class="scrollx"><table><thead><tr><th>Keeper</th><th class="num">Games</th>'+
       '<th class="num">Allowed</th><th class="num">Allowed a game</th></tr></thead><tbody>';
    kk.forEach(function(k){
      var s=L.keepers[k];
      h+='<tr><td>'+esc(s.name)+'</td><td class="num">'+s.n+'</td><td class="num">'+(s.gaN?s.ga:"\u2014")+'</td><td class="num">'+rate(s.ga,s.gaN)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }

  /* each player: on the field or on the bench in this period */
  var pl=Object.keys(L.players).map(function(k){ return L.players[k]; });
  pl.forEach(function(p){
    p.diff=(p.on.gaN && p.off.gaN) ? p.on.ga/p.on.gaN - p.off.ga/p.off.gaN : null;
  });
  pl.sort(function(x,y){
    var a=x.diff===null?-1e9:x.diff, b=y.diff===null?-1e9:y.diff;
    return b-a || y.on.n-x.on.n || x.name.localeCompare(y.name);
  });
  h+='<h4>'+lbl+', each player: on the field or on the bench</h4><div class="scrollx"><table class="qplayers"><thead><tr><th>Player</th>'+
     '<th class="num">On</th><th class="num">Bench</th><th>Where</th>'+
     '<th class="num">Allowed a game, on</th><th class="num">Allowed a game, bench</th>'+
     '<th class="num">Scored a game, on</th><th class="num">Scored a game, bench</th></tr></thead><tbody>';
  pl.forEach(function(p){
    var where=[['G','GK'],['D','D'],['M','M'],['F','F']].filter(function(z){ return p.lines[z[0]]; })
              .map(function(z){ return z[1]+(p.lines[z[0]]>1?' \u00d7'+p.lines[z[0]]:''); }).join(', ');
    h+='<tr><td>'+esc(p.name)+'</td><td class="num">'+p.on.n+'</td><td class="num">'+p.off.n+'</td><td>'+(where||"\u2014")+'</td>'+
       '<td class="num">'+rate(p.on.ga,p.on.gaN)+'</td><td class="num">'+rate(p.off.ga,p.off.gaN)+'</td>'+
       '<td class="num">'+rate(p.on.gf,p.on.n)+'</td><td class="num">'+rate(p.off.gf,p.off.n)+'</td></tr>';
  });
  h+='</tbody></table></div><p class="hint">Only games where the player was there count. Sorted so the biggest gap between goals allowed with the player on '+
     'and on the bench comes first. With a handful of games one bad '+pw.low+' moves these a lot, and the other team, the score and who else was on the field all '+
     'matter too \u2014 use this to decide what to watch for, not to judge a player.</p>';
  return h;
}
function renderTrends(){ withSeason(ui.season, renderTrendsNow); }
function renderTrendsNow(){
  var box=document.getElementById("trends");
  if(!box){ return; }
  ui.trend=ui.trend||{opp:"", off:{}};
  var all=playedGames(), tf=ui.trend, h="", i, g, opps={}, oppList=[];
  if(!all.length){ box.innerHTML='<p class="hint">Save played games to see trends.</p>'; return; }
  all.forEach(function(x){ var o=(x.opp||"").trim(); if(o && !opps[o.toLowerCase()]){ opps[o.toLowerCase()]=o; oppList.push(o); } });
  oppList.sort(function(x,y){ return x.localeCompare(y); });
  /* filters, in one row above the figures */
  h+='<div class="row trendfilters"><label class="field">Opponent<select onchange="setTrendOpp(this.value)">'+
     '<option value="">All opponents</option>';
  for(i=0;i<oppList.length;i++){
    h+='<option value="'+esc(oppList[i])+'"'+(tf.opp.toLowerCase()===oppList[i].toLowerCase()?' selected':'')+'>'+esc(oppList[i])+'</option>';
  }
  var kinds=trendKinds(), present={};
  all.forEach(function(x){ present[x.kind||""]=true; });
  h+='</select></label>';
  if(present.playoff || present.scrimmage){
    GAME_KINDS.forEach(function(k){
      if(!present[k.v]){ return; }
      h+='<label class="gamepick'+(kinds[k.v]?'':' off')+'"><input type="checkbox"'+(kinds[k.v]?' checked':'')+' onchange="setTrendKind(\''+k.v+'\',this.checked)"> '+esc(k.label)+'</label>';
    });
  }
  h+='<span class="hint" style="margin:0">Games:</span>'+
     '<button class="btn sm quiet" onclick="setTrendAll(true)">All</button><button class="btn sm quiet" onclick="setTrendAll(false)">None</button></div>';
  h+='<div class="chips trendgames">';
  var list=all.filter(function(x){ return kinds[x.kind||""] && (!tf.opp || (x.opp||"").trim().toLowerCase()===tf.opp.toLowerCase()); })
              .sort(function(x,y){ return (x.date||"").localeCompare(y.date||""); });
  for(i=0;i<list.length;i++){
    g=list[i];
    h+='<label class="gamepick'+(tf.off[g.id]?' off':'')+'"><input type="checkbox"'+(tf.off[g.id]?'':' checked')+
       ' onchange="setTrendGame('+g.id+',this.checked)"> '+esc(g.date||"")+' '+esc(g.opp||"")+'</label>';
  }
  h+='</div>';
  var games=trendGames(), t=computeTrends(games), sw=seasonWords();
  if(!games.length){ box.innerHTML=h+'<p class="hint">No games selected.</p>'; return; }
  var pw=periodWords(t.nq);
  h+='<p class="trendsum"><b>'+t.games+' game'+(t.games===1?'':'s')+'</b>: '+t.rec.w+'-'+t.rec.l+'-'+t.rec.t+' (W-L-T). '+
     'Scored '+t.gf+' ('+fmt1(t.gf/t.games)+' a game)'+
     (t.gaGames?', allowed '+t.ga+' ('+fmt1(t.ga/t.gaGames)+' a game)':', allowed: no opponent scores entered')+'.</p>';
  h+=trendChart(t);
  if(t.periodGames && t.periodGaGames<t.periodGames){
    h+='<p class="hint">Goals allowed by '+pw.low+' come from '+t.periodGaGames+' of '+t.periodGames+
       ' games; the others only have the opponent\u2019s total. Record opponent goals by '+pw.low+' on the Plan tab.</p>';
  }
  if(t.periodGames<t.games){
    h+='<p class="hint">'+(t.games-t.periodGames)+' selected game'+(t.games-t.periodGames===1?' is':'s are')+' in a different format and '+(t.games-t.periodGames===1?'is':'are')+' left out of the chart.</p>';
  }
  function rate(n,d){ return d?fmt1(n/d):"\u2014"; }
  /* by formation */
  var fk=Object.keys(t.forms).sort(function(x,y){ return t.forms[y].periods-t.forms[x].periods || x.localeCompare(y); });
  h+='<h3 style="margin-top:14px">By formation</h3><div class="scrollx"><table><thead><tr><th>Formation</th><th class="num">'+sw.many+'</th>'+
     '<th class="num">Scored</th><th class="num">Allowed</th><th class="num">Scored per '+sw.low+'</th><th class="num">Allowed per '+sw.low+'</th></tr></thead><tbody>';
  fk.forEach(function(k){
    var f=t.forms[k];
    h+='<tr><td>'+esc(k)+'</td><td class="num">'+f.periods+'</td><td class="num">'+f.gf+'</td><td class="num">'+(f.gaPeriods?f.ga:"\u2014")+'</td>'+
       '<td class="num">'+rate(f.gf,f.periods)+'</td><td class="num">'+rate(f.ga,f.gaPeriods)+'</td></tr>';
  });
  h+='</tbody></table></div>';
  /* by goalkeeper */
  var kk=Object.keys(t.keepers).sort(function(x,y){ return t.keepers[y].periods-t.keepers[x].periods; });
  if(kk.length){
    h+='<h3 style="margin-top:14px">By goalkeeper</h3><div class="scrollx"><table><thead><tr><th>Keeper</th><th class="num">'+sw.many+' in goal</th>'+
       '<th class="num">Allowed</th><th class="num">Allowed per '+sw.low+'</th></tr></thead><tbody>';
    kk.forEach(function(k){
      var s=t.keepers[k];
      h+='<tr><td>'+esc(s.name)+'</td><td class="num">'+s.periods+'</td><td class="num">'+(s.gaPeriods?s.ga:"\u2014")+'</td><td class="num">'+rate(s.ga,s.gaPeriods)+'</td></tr>';
    });
    h+='</tbody></table></div>';
  }
  /* on the field */
  var pk=Object.keys(t.players).map(function(k){ return t.players[k]; });
  pk.forEach(function(p){
    p.net=(p.gaPeriods ? (p.gf/p.periods - p.ga/p.gaPeriods) : null);
  });
  pk.sort(function(x,y){
    var a=x.net===null?-1e9:x.net, b=y.net===null?-1e9:y.net;
    return b-a || (y.gf/y.periods)-(x.gf/x.periods) || x.name.localeCompare(y.name);
  });
  h+='<h3 style="margin-top:14px">While each player is on the field</h3><div class="scrollx"><table><thead><tr><th>Player</th><th class="num">'+sw.many+'</th>'+
     '<th class="num">Team scored</th><th class="num">Team allowed</th><th class="num">Scored per '+sw.low+'</th><th class="num">Allowed per '+sw.low+'</th></tr></thead><tbody>';
  pk.forEach(function(p){
    h+='<tr><td>'+esc(p.name)+'</td><td class="num">'+p.periods+'</td><td class="num">'+p.gf+'</td><td class="num">'+(p.gaPeriods?p.ga:"\u2014")+'</td>'+
       '<td class="num">'+rate(p.gf,p.periods)+'</td><td class="num">'+rate(p.ga,p.gaPeriods)+'</td></tr>';
  });
  h+='</tbody></table></div><p class="hint">Team goals while a player was on the field, sorted by scored minus allowed per '+sw.low+'. '+
     'A few games can swing these numbers a lot, so treat them as hints to look into, not verdicts.</p>';
  h+=renderQuarterLook(games, t);
  box.innerHTML=h;
}

function renderSeason(){
  var t=seasonTotals(), record=seasonRecord(), i, h="";
  var plannedCount=S.games.length-playedGames().length;
  document.getElementById("seasonMeta").textContent=
    recordText(true)+". "+
    S.games.length+" game"+(S.games.length===1?"":"s")+" saved"+
    (plannedCount?", "+plannedCount+" of them planned and not counted yet":"")+". "+
    (record.unknown?record.unknown+" saved game"+(record.unknown===1?" has":"s have")+" no opponent score and "+(record.unknown===1?"is":"are")+" excluded from the record. ":"")+
    "Sorted by smallest share of available "+seasonWords().lows+" played \u2014 missed games are excluded from the comparison.";
  document.getElementById("seasonTable").innerHTML=seasonTableHTML();
  renderGameList();
}
/* players' season totals, for whichever season is in place */
function seasonTableHTML(){
  var t=seasonTotals(), i, h="";
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
       '</td><td class="num">'+fmtQ(rows[i].qtrs)+'</td><td class="num">'+fmtQ(rows[i].satQ)+
       '</td><td class="num">'+(rows[i].missed||"")+
       '</td><td class="num">'+(d>=0?"+":"")+d.toFixed(1)+
       '</td><td class="num" style="font-weight:800">'+rows[i].goals+
       '</td><td class="num">'+rows[i].mins+'</td></tr>';
  }
  h+='</tbody></table>';
  return h;
}
function renderGameList(){
  var h="", i;
  if(!S.games.length){
    h='<p class="hint">No games saved yet.</p>';
  }else{
    h='<table><thead><tr><th>Date</th><th>Opponent</th><th>Result</th><th class="num">GF</th><th class="num">GA</th><th></th><th></th></tr></thead><tbody>';
    for(i=0;i<S.games.length;i++){
      var g=S.games[i], result=gameResult(g), resultHTML="\u2014";
      if(result){ resultHTML='<span class="tag '+(result==="W"?"ok":(result==="L"?"over":"short"))+'">'+result+'</span>'; }
      if(g.planned){ resultHTML='<span class="tag planned">Planned</span> <button class="btn sm" onclick="setPlayed('+g.id+',true)">Mark played</button>'; }
      h+='<tr><td>'+esc(g.date)+'</td><td>'+esc(g.opp||"\u2014")+(g.kind?' <span class="tag kind">'+esc(kindLabel(g.kind))+'</span>':'')+'</td><td>'+resultHTML+'</td>'+
         '<td class="num">'+teamGoals(g)+'</td><td class="num">'+(g.oppGoals===null?"\u2014":g.oppGoals)+'</td>'+
         '<td><button class="btn sm" onclick="editGame('+g.id+')">Open</button></td>'+
         '<td><button class="btn quiet sm" onclick="delGame('+i+')">Delete</button></td></tr>';
    }
    h+='</tbody></table>';
    h+='<p class="hint">Open a game to check it against what actually happened, adjust the lineups, and reprint.</p>';
  }
  document.getElementById("gameList").innerHTML=h;
  renderPositionStats();
  renderTrends();
}

function renderSetup(){
  document.getElementById("cfgTeam").value=S.cfg.team;
  document.getElementById("cfgCoach").value=S.cfg.coach||"";
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
      '<div class="sub">'+esc(g.date||"")+(g.kind?' &middot; '+esc(kindLabel(g.kind)):'')+' &middot; '+qFormName(g,q)+' &middot; '+Q+'&times;'+g.qlen+' min'+
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
    var totals=gameQtrs(g,true), d='', i;
    var summaryRoster=gameRoster(g).slice().sort(function(a,b){
      var sa=availableQuarters(g,a.id)-(totals[a.id]||0), sb=availableQuarters(g,b.id)-(totals[b.id]||0);
      return sa-sb || a.name.localeCompare(b.name);
    });
    d+='<aside class="psummary"><h5>'+PW(g).many+' sitting</h5><table class="psummary-table"><thead><tr><th>Player</th><th class="num">Sits</th></tr></thead><tbody>';
    for(i=0;i<summaryRoster.length;i++){
      var player=summaryRoster[i];
      d+='<tr><td>'+esc(player.name)+'</td>';
      if(isOut(g,player.id)){ d+='<td class="outmark">OUT</td>'; }
      else if(leftFrom(g,player.id)>=0){ d+='<td class="num">'+fmtQ(Math.max(0,availableQuarters(g,player.id)-(totals[player.id]||0)))+' &middot; left '+PW(g).s+(leftFrom(g,player.id)+1)+'</td>'; }
      else { d+='<td class="num">'+fmtQ(Q-(totals[player.id]||0))+'</td>'; }
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
       '</div>'+(shortInfo(g,q).by>0?'<div class="psit"><b>Playing '+shortInfo(g,q).by+' short:</b> '+esc(shortInfo(g,q).open.join(", ")||"\u2014")+' open</div>':'')+
       (subsFor(g,q,true).length?'<div class="psit"><b>Subs:</b> '+esc(subsFor(g,q,true).map(function(s){ return fmtClock(s.t)+' '+subText(g,s); }).join(", "))+'</div>':'')+
       '<div class="psit"><b>'+PW(g).s+(q+1)+' goals:</b> us ____ &nbsp; them ____</div></div>'+
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
  /* ask whether this page is the newest version (see sw.js) */
  function askHelper(again){
    var helper=navigator.serviceWorker.controller;
    if(!helper){ return; }
    var sc=document.querySelector('script[src^="app.js"]'), ln=document.querySelector('link[href^="styles.css"]');
    helper.postMessage({type:"check", again:!!again, script:sc?sc.getAttribute("src"):"", style:ln?ln.getAttribute("href"):""});
  }
  navigator.serviceWorker.addEventListener("message",function(ev){
    if(ev.data && ev.data.type==="updated"){
      var t=document.getElementById("updateToast");
      if(t){ t.hidden=false; }
    }
    /* the app's files changed: this page may or may not be the old one */
    if(ev.data && ev.data.type==="changed"){ askHelper(true); }
  });
  window.addEventListener("load",function(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
    navigator.serviceWorker.ready.then(function(){ askHelper(false); }).catch(function(){});
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
  if(sync.inFlight){
    sync.again=true;
    if(force){ sync.forceNext=true; }   /* don't lose "keep this device's version" behind another save */
    return;
  }
  force=force || sync.forceNext;
  sync.forceNext=false;
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
    sync.forceNext=false;   /* this device's version is saved */
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
    if(err && err.code==="conflict"){
      if(sync.forceNext){ haPush(); return; }   /* already decided: keep this device's version */
      if(!sync.pending){ return; }             /* already decided: the other version is in use */
      haConflict();
      return;
    }
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
  if(ev.rev<sync.rev){ return; }   /* older than what this device already has: a late arrival */
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
    if(keepMine){
      sync.resolving=false;
      sync.rev=server.rev;
      haPush(true);
    }else{
      /* this device's version goes into history, the other one is used; still
         deciding until then, so an update arriving meanwhile doesn't ask again */
      conn.sendMessagePromise({type:"soccerlineup/keep_version", data:JSON.parse(JSON.stringify(S))})
        .then(function(){}, function(){})
        .then(function(){ sync.resolving=false; haApplyRemote(server); });
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
               "import":"before a backup file was restored","not kept":"a device's changes that weren't kept",
               "new season":"before a new season was started"};
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
keepAwake(true);   /* a clock left running: keep the screen on (needs a tap on some phones) */
setupOffline();
if(HA){ haStart(); }
