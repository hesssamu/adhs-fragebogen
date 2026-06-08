import { JSDOM } from "jsdom";
import fs from "fs";

const html = fs.readFileSync("index.html", "utf8");
const dom = new JSDOM(html, { runScripts:"dangerously", pretendToBeVisual:true, url:"https://x/?r=test" });
const { window } = dom;
const doc = window.document;
const $ = (s)=>doc.querySelector(s);
const ok=(c,m)=>{ if(!c){console.error("FAIL:",m);process.exit(1);} else console.log("ok:",m); };

// jsdom doesn't fetch <script src>; inject the vendored UMD manually to prove IT works
const lib = fs.readFileSync("vendor/jspdf.umd.min.js","utf8");
const s = doc.createElement("script"); s.textContent = lib; doc.head.appendChild(s);

setTimeout(async ()=>{
  ok(window.jspdf && window.jspdf.jsPDF, "vendored jsPDF exposes window.jspdf.jsPDF");

  // capture the network submit instead of sending
  let captured=null;
  window.fetch = (u,opts)=>{ captured={u,body:opts.body}; return Promise.resolve(); };

  // run the flow: intro -> 46 answers -> part2 -> review -> send
  $("#start").click();
  let count=0;
  await new Promise((res)=>{
    (function step(){
      if(count>=46){ setTimeout(res,300); return; }
      if($("#cont")){ $("#cont").click(); setTimeout(step,50); return; }
      const b=doc.querySelectorAll(".optbtn");
      if(b.length===4){ b[count%4].click(); count++; }
      setTimeout(step,200);
    })();
  });
  ok($("#send"), "reached review");
  $("#send").click();
  await new Promise(r=>setTimeout(r,200));

  ok(captured, "fetch was called (submit fired, no PDF error)");
  ok(/formsubmit\.co\/.+@/.test(captured.u), "posts to formsubmit endpoint");
  // inspect FormData
  const fd = captured.body;
  const subj = fd.get("_subject");
  const who  = fd.get("Ausgefüllt von");
  const att  = fd.get("attachment");
  ok(subj && subj.includes("TEST"), "subject marks TEST: "+subj);
  ok(who && who.includes("TEST"), "respondent field = "+who);
  ok(att && typeof att.size==="number" && att.size>2000, "PDF attachment present, size="+(att&&att.size));
  ok(att && att.name && att.name.endsWith(".pdf"), "attachment filename: "+(att&&att.name));

  // also confirm no error message is shown
  const err = $("#sendErr");
  ok(!err || err.style.display!=="block", "no error shown on submit");

  console.log("\nVENDORED PDF END-TO-END: PASS");
  process.exit(0);
}, 80);
