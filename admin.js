import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient("YOUR_URL","YOUR_KEY");

// 簡易ロック
if(prompt("おまんちょす")!=="admin"){
  document.body.innerHTML="アクセス拒否";
}

async function add(){

  let data={
    name: name.value,
    img: img.value,
    atk:+atk.value,
    def:+def.value,
    spd:+spd.value,
    type:type.value,
    star:+star.value,
    hp:3000 + def.value*0.3
  };

  await supabase.from("characters").insert([data]);

  alert("追加完了");
}
