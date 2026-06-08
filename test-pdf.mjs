import { jsPDF } from "jspdf";
import fs from "fs";

const Q1 = [
 "Achtet bei (Schul-)Arbeit nicht ausreichend auf Details.",
 "Wenn er/sie sitzt, zappelt er/sie mit Händen oder Füßen.",
 "Macht Flüchtigkeitsfehler bei der Arbeit.",
 "Rutscht auf dem Stuhl hin und her und dreht sich.",
 "Kann die Aufmerksamkeit schlecht bei Tätigkeiten halten.",
 "Steht schnell vom Stuhl auf in Situationen, in denen erwartet wird, ordentlich sitzen zu bleiben.",
 "Hört schlecht zu, wenn andere ihm/ihr etwas sagen.",
 "Fühlt sich unruhig.","Langweilt sich schnell.",
 "Hat Schwierigkeiten, Anweisungen zu befolgen.",
 "Beginnt mit Aufgaben oder Arbeit, bringt sie aber nicht zu Ende.",
 "Kann sich in der Freizeit nur schwer entspannen.",
 "Sucht im Urlaub oder in der Freizeit eine Umgebung mit viel Betrieb und Lärm.",
 "Kann Tätigkeiten oder Aufgaben schwer organisieren.",
 "Ist ständig 'in Bewegung', wie 'von einem Motor angetrieben'.",
 "Versucht Tätigkeiten zu vermeiden, bei denen man sich längere Zeit konzentrieren muss.",
 "Redet ununterbrochen.",
 "Verliert Dinge, die für Aufgaben oder Tätigkeiten benötigt werden.",
 "Antwortet, bevor Fragen zu Ende gestellt sind.","Ist schnell abgelenkt.",
 "Findet es schwierig, zu warten, bis er/sie an der Reihe ist.",
 "Ist bei alltäglichen Tätigkeiten vergesslich.",
 "Unterbricht andere oder fällt ihnen ins Wort."
];
const Q2 = [
 "Achtete bei Schularbeiten nicht ausreichend auf Details.","Zappelte mit Händen oder Füßen.",
 "Machte Flüchtigkeitsfehler bei Schularbeiten.","Rutschte auf dem Stuhl hin und her und drehte sich.",
 "Konnte die Aufmerksamkeit schlecht bei Tätigkeiten halten.",
 "Stand schnell vom Stuhl auf in Situationen, in denen erwartet wurde, ordentlich sitzen zu bleiben.",
 "Hörte schlecht zu, wenn andere etwas sagten.","Fühlte sich unruhig.","Langweilte sich schnell.",
 "Hatte Schwierigkeiten, Anweisungen zu befolgen.",
 "Begann mit Aufgaben oder Arbeit, brachte sie aber nicht zu Ende.","Konnte sich nur schwer entspannen.",
 "Hatte Schwierigkeiten, ruhig zu spielen.","Konnte Tätigkeiten oder Aufgaben schwer organisieren.",
 "War ständig 'in Bewegung', wie 'von einem Motor angetrieben'.",
 "Versuchte Tätigkeiten zu vermeiden, bei denen man sich längere Zeit konzentrieren musste.",
 "Redete ununterbrochen.","Verlor Dinge, die für Aufgaben oder Tätigkeiten benötigt wurden.",
 "Antwortete, bevor Fragen zu Ende gestellt waren.","War schnell abgelenkt.",
 "Fand es schwierig, zu warten, bis er/sie an der Reihe war.",
 "War bei alltäglichen Tätigkeiten vergesslich.","Unterbrach andere oder fiel ihnen ins Wort."
];

// sample answers
const answers = {};
Q1.forEach((_,i)=> answers["1_"+i] = i%4);
Q2.forEach((_,i)=> answers["2_"+i] = (i+2)%4);
const meta = {name:"Samuel Hess", dob:"1995-03-12", pid:"", date:"2026-06-06"};
const deDate = iso => { const p=(iso||"").split("-"); return p.length===3? p[2]+"."+p[1]+"."+p[0] : iso; };

const doc = new jsPDF({unit:"mm", format:"a4"});
const L=14, R=196, scaleX=[173,181,189,197];
function header(){
  let y=16;
  doc.setFont("helvetica","bold"); doc.setFontSize(12);
  doc.text("Fragebogen zu Aufmerksamkeitsproblemen und Hyperaktivität", L, y); y+=5.2;
  doc.text("für Erwachsenenalter und Kindheit - für Eltern / Angehörige", L, y); y+=5;
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5);
  doc.text("J.J.S. Kooij and J.K. Buitelaar, © 1997", L, y); y+=6.5;
  doc.setFontSize(9.5);
  doc.text("Name: "+(meta.name||"")+"    Geburtsdatum: "+deDate(meta.dob)+"    Patientennr.: "+(meta.pid||"-")+"    Datum: "+deDate(meta.date), L, y);
  y+=5; doc.setFont("helvetica","bold"); doc.text("Ausgefüllt von: Mutter", L, y); doc.setFont("helvetica","normal");
  return y+6;
}
function legend(y, intro){
  doc.setFont("helvetica","normal"); doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(intro, R-L);
  doc.text(lines, L, y); y += lines.length*3.8 + 1.5;
  doc.setFont("helvetica","bold");
  doc.text("0 = nie oder selten    1 = manchmal    2 = oft    3 = sehr oft", L, y);
  doc.setFont("helvetica","normal"); return y+5;
}
function section(y, arr, sec){
  doc.setFontSize(9);
  for(let i=0;i<arr.length;i++){
    const wrapped = doc.splitTextToSize((i+1)+". "+arr[i], 150);
    doc.setFont("helvetica","normal"); doc.text(wrapped, L, y);
    const sel = answers[sec+"_"+i];
    for(let v=0;v<4;v++){
      if(v===sel){ doc.setFont("helvetica","bold"); doc.circle(scaleX[v], y-1.1, 2.3); }
      else doc.setFont("helvetica","normal");
      doc.text(String(v), scaleX[v]-1, y);
    }
    y += wrapped.length*4.0 + 2.0;
  }
  return y;
}
let y=header();
y=legend(y,"Kreisen Sie bitte die Zahl ein, die das Verhalten der betreffenden Person in den letzten sechs Monaten am besten beschreibt. Geben Sie jeweils nur einen Wert an (0, 1, 2 oder 3).");
section(y,Q1,"1");
doc.addPage(); y=header();
y=legend(y,"Die folgenden Fragen beziehen sich auf dieselben Merkmale, diesmal aber in der Kindheit. Kreisen Sie bitte die Zahl ein, die das Verhalten der betreffenden Person als Kind (0-12 Jahre) am besten beschreibt.");
section(y,Q2,"2");
fs.writeFileSync("/tmp/test-fragebogen.pdf", Buffer.from(doc.output("arraybuffer")));
console.log("wrote /tmp/test-fragebogen.pdf");
