import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient("https://xnqpmdzwaufdfpfzixsv.supabase.co","sb_publishable_FNF96yB43BWnvJc6MpHMcQ_W1qeeNdD");

let name="", coin=10;
let chars=[], deck=[];

const types=["火","水","草","光","闇"];

function start(){
  name=document.getElementById("name").value;
  document.getElementById("game").style.display="block";
  update();
}

// ===== ガチャ（運営キャラ）
async function gacha(){
  let {data}=await supabase.from("characters").select("*");

  let r=data[Math.floor(Math.random()*data.length)];
  chars.push({...r, hp:r.hp});

  update();
}

// ===== 表示
function typeClass(t){
  return {火:"fire",水:"water",草:"grass",光:"light",闇:"dark"}[t];
}

function update(){
  document.getElementById("coin").innerText="コイン:"+coin;

  let c=document.getElementById("chars");
  c.innerHTML="";

  chars.forEach(x=>{
    let d=document.createElement("div");
    d.className="card "+typeClass(x.type);
    d.innerHTML=`${"★".repeat(x.star)}<br>${x.name}`;
    d.onclick=()=>select(x);
    c.appendChild(d);
  });

  let d=document.getElementById("deck");
  d.innerHTML="";
  deck.forEach(x=>{
    let el=document.createElement("div");
    el.className="card";
    el.innerText=x.name;
    d.appendChild(el);
  });
}

// ===== デッキ
function select(c){
  if(deck.length>=3) return;
  deck.push(JSON.parse(JSON.stringify(c)));
  update();
}

// ===== PvP（混合） =====
async function getEnemy(){

  // ① ユーザー取得
  let users=await supabase.from("users").select("*");

  // ② 運営キャラ取得
  let chars=await supabase.from("characters").select("*");

  let team=[];

  for(let i=0;i<3;i++){
    if(Math.random()<0.5 && users.data.length>0){
      let u=users.data[Math.floor(Math.random()*users.data.length)];
      if(u.deck) team.push(...JSON.parse(u.deck).slice(0,1));
    }else{
      team.push(chars.data[Math.floor(Math.random()*chars.data.length)]);
    }
  }

  return team;
}

// ===== ダメージ
function typeBonus(a,b){
 if(a==="火"&&b==="草") return 1.2;
 if(a==="草"&&b==="水") return 1.2;
 if(a==="水"&&b==="火") return 1.2;
 if(a==="光"&&b==="闇") return 1.3;
 if(a==="闇"&&b==="光") return 1.3;
 return 1;
}

function dmg(a,b){
 return (a.atk/(a.atk+b.def))*900*typeBonus(a.type,b.type);
}

function fight(a,b){
 while(a.hp>0&&b.hp>0){
   if(Math.random()<(a.spd/(a.spd+b.spd))){
     b.hp-=dmg(a,b); if(b.hp<=0) return true;
     a.hp-=dmg(b,a);
   }else{
     a.hp-=dmg(b,a); if(a.hp<=0) return false;
     b.hp-=dmg(a,b);
   }
 }
}

// ===== バトル =====
async function battle(){
  if(deck.length!==3) return alert("3体選べ");

  // 自分保存（PvP用）
  await supabase.from("users").insert([{name, deck:JSON.stringify(deck)}]);

  let enemy=await getEnemy();

  let p=0,e=0;
  let player=JSON.parse(JSON.stringify(deck));

  while(p<3&&e<3){
    if(fight(player[p],enemy[e])) e++;
    else p++;
  }

  document.getElementById("log").innerText =
    p<3?"勝利":"敗北";
}
