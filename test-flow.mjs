import { JSDOM } from "jsdom";
import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");

function run(url, label, expectGreet){
  return new Promise((resolve)=>{
    const dom = new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url });
    const doc = dom.window.document;
    const $ = (s)=>doc.querySelector(s);
    const fail=(m)=>{ console.error("FAIL ["+label+"]:", m); process.exit(1); };
    const ok=(c,m)=>{ if(!c) fail(m); else console.log("ok ["+label+"]:", m); };

    setTimeout(()=>{
      if(url.includes("?r=")){
        ok(!$("[data-r]"), "per-person link skips picker");
        ok($("#start"), "intro shown directly");
        ok(doc.body.textContent.includes(expectGreet), "greeting: "+expectGreet);
      } else {
        ok($("[data-r='mutter']") && $("[data-r='vater']") && $("[data-r='schwester']"), "picker shows 3 options");
        ok(!$("#start"), "no intro until a person is picked");
        $("[data-r='mutter']").click();
        ok($("#start") && doc.body.textContent.includes("Liebe Mama"), "after pick -> personalized intro");
      }
      $("#start").click();
      ok($(".qtext") && $("#ptxt").textContent==="Frage 1 von 46", "starts at Frage 1");

      let count=0, sawP2=false;
      (function step(){
        if(count>=46){ setTimeout(review,300); return; }
        if($("#cont")){ sawP2=true; $("#cont").click(); setTimeout(step,60); return; }
        const b=doc.querySelectorAll(".optbtn");
        if(b.length===4){ b[count%4].click(); count++; }
        setTimeout(step,210);
      })();

      function review(){
        ok(sawP2, "part-2 interstitial shown");
        ok($("#send"), "review has Absenden");
        ok(doc.querySelectorAll(".revrow").length===46, "46 review rows");
        ok($(".sub")&&$(".sub").textContent.includes("beantwortet von"), "review shows respondent");
        console.log("PASS ["+label+"]\n");
        resolve();
      }
    },50);
  });
}

await run("https://x/?r=vater", "vater-link", "Lieber Papa");
await run("https://x/", "picker", null);
console.log("ALL FLOW CHECKS PASSED");
process.exit(0);
