const TARGET = {cp:11, me:87, minNdf:30, maxDmi:12};
const silage = {name:"Poor silage", cp:8, me:9, dm:20, ndf:55, price:0};

const options = {
  groundnut:{name:"Groundnut meal/cake",cp:53,me:13.2,dm:90,price:313},
  barley:{name:"Rolled barley",cp:12,me:13,dm:86,price:270},
  crunch:{name:"GAIN Weanling Crunch 18%",cp:18,me:13,dm:87,price:530}
};

let selected = "groundnut";
let unlocked = {first:false, protein:false, me:false, ndf:false, cost:false};

const $ = id => document.getElementById(id);
const close = (a,b,tol=0.03) => Math.abs(a-b) <= tol;
const n = id => parseFloat($(id).value);
const show = id => $(id).classList.remove("hidden");
const hide = id => $(id).classList.add("hidden");

function solution(optKey=selected){
  const s = options[optKey];
  const suppFrac = (TARGET.cp - silage.cp)/(s.cp - silage.cp);
  const silFrac = 1 - suppFrac;
  const silME = silFrac * silage.me;
  const suppME = suppFrac * s.me;
  const dietME = silME + suppME;
  const dmi = TARGET.me / dietME;
  const silDM = dmi * silFrac;
  const suppDM = dmi * suppFrac;
  const silFresh = silDM / (silage.dm/100);
  const suppFresh = suppDM / (s.dm/100);
  const ndfPct = silFrac * silage.ndf;
  const cost = suppFresh * (s.price/1000);
  return {s,suppFrac,silFrac,silME,suppME,dietME,dmi,silDM,suppDM,silFresh,suppFresh,ndfPct,cost};
}

function setFeedback(id,type,text){
  const el=$(id);
  el.className=`feedback ${type}`;
  el.textContent=text;
}

function resetInputs(){
  ["suppPct","silagePct","silageMEcontrib","suppMEcontrib","dietME","dmiNeeded",
   "dietNDF","silageDMkg","suppDMkg","suppFreshKg","suppCost","silageFreshKg"].forEach(id=>$(id).value="");
  $("dmiPass").value="";
  $("ndfPass").value="";
  ["proteinHint","meHint","ndfHint","costHint"].forEach(hide);
  ["step2","step3","step4","resultCard"].forEach(hide);
  setFeedback("proteinFeedback","neutral","Enter your calculation.");
  setFeedback("meFeedback","neutral","Complete all energy fields.");
  setFeedback("ndfFeedback","neutral","Do not calculate cost until this check is complete.");
  setFeedback("costFeedback","neutral","Finish the conversion and cost calculation.");
  unlocked.protein=unlocked.me=unlocked.ndf=unlocked.cost=false;
}

function updateOption(){
  const s = options[selected];
  const sol = solution();
  $("optionIntro").innerHTML =
    `You are testing <strong>${s.name}</strong> with the 8% CP silage. Your first job is to determine how much of each feed is needed to make an <strong>11% CP diet on a DM basis</strong>.`;
  $("proteinFormula").textContent =
    `${silage.cp}(1 − x) + ${s.cp}x = ${TARGET.cp}`;
  $("suppMELabel").firstChild.textContent = `ME contribution from ${s.name} (MJ/kg diet DM) `;
  $("suppDMlabel").firstChild.textContent = `${s.name} DM (kg/day) `;
  $("suppFreshLabel").firstChild.textContent = `${s.name} fresh weight (kg/day) `;
  $("suppCostLabel").firstChild.textContent = `${s.name} cost (€/head/day) `;
  resetInputs();
}

document.querySelectorAll("#firstChoices button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll("#firstChoices button").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    if(btn.dataset.choice==="protein"){
      unlocked.first=true;
      setFeedback("firstFeedback","pass",
        "Correct. First balance the diet to the required 11% CP on a dry-matter basis. Do not start with cost.");
      show("optionCard"); show("step1");
      updateOption();
      window.setTimeout(()=>$("optionCard").scrollIntoView({behavior:"smooth",block:"start"}),150);
    }else{
      const messages={
        cost:"Cost comes last. A cheap ration is irrelevant if it fails protein, energy or fibre constraints.",
        me:"ME is checked after you know the feed proportions needed to meet the protein target.",
        ndf:"NDF is essential, but first establish the feed proportions needed to reach 11% CP; then test whether that blend is acceptable for fibre."
      };
      setFeedback("firstFeedback","fail",messages[btn.dataset.choice]);
    }
  });
});

document.querySelectorAll(".opt").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selected=btn.dataset.option;
    document.querySelectorAll(".opt").forEach(b=>b.classList.toggle("active",b===btn));
    updateOption();
  });
});

$("checkProtein").addEventListener("click",()=>{
  const sol=solution();
  const a=n("suppPct"), b=n("silagePct");
  if(!Number.isFinite(a)||!Number.isFinite(b)){
    setFeedback("proteinFeedback","fail","Enter both percentages.");
    return;
  }
  const ok=close(a,sol.suppFrac*100,0.08)&&close(b,sol.silFrac*100,0.08)&&close(a+b,100,0.1);
  if(ok){
    unlocked.protein=true;
    setFeedback("proteinFeedback","pass",
      `Correct. ${sol.s.name}: ${(sol.suppFrac*100).toFixed(2)}% of diet DM; silage: ${(sol.silFrac*100).toFixed(2)}%. Now calculate the energy density of that blend.`);
    show("step2");
    $("step2").scrollIntoView({behavior:"smooth",block:"start"});
  }else{
    setFeedback("proteinFeedback","fail",
      "Not yet. Solve the two-feed protein equation on a DM basis. Your two percentages must also add to 100%.");
  }
});

$("hintProtein").addEventListener("click",()=>{
  const s=options[selected];
  $("proteinHint").innerHTML =
    `Rearrange <strong>${silage.cp}(1−x)+${s.cp}x=${TARGET.cp}</strong>. You can also use Pearson square: the supplement fraction is (${TARGET.cp}−${silage.cp}) ÷ (${s.cp}−${silage.cp}).`;
  show("proteinHint");
});

$("checkME").addEventListener("click",()=>{
  const sol=solution();
  const vals=["silageMEcontrib","suppMEcontrib","dietME","dmiNeeded"].map(n);
  if(vals.some(v=>!Number.isFinite(v))||!$("dmiPass").value){
    setFeedback("meFeedback","fail","Complete every field, including the 12 kg DMI check.");
    return;
  }
  const ok =
    close(vals[0],sol.silME,0.05) &&
    close(vals[1],sol.suppME,0.05) &&
    close(vals[2],sol.dietME,0.05) &&
    close(vals[3],sol.dmi,0.05) &&
    $("dmiPass").value === (sol.dmi<=TARGET.maxDmi?"yes":"no");
  if(ok){
    unlocked.me=true;
    setFeedback("meFeedback","pass",
      `Correct. The blend contains ${sol.dietME.toFixed(2)} MJ ME/kg DM, so ${sol.dmi.toFixed(2)} kg DM/day supplies about 87 MJ. This is ${sol.dmi<=12?"within":"above"} the 12 kg maximum.`);
    show("step3");
    $("step3").scrollIntoView({behavior:"smooth",block:"start"});
  }else{
    setFeedback("meFeedback","fail","Check each contribution: feed proportion × feed ME. Then add them and calculate 87 ÷ diet ME.");
  }
});

$("hintME").addEventListener("click",()=>{
  const sol=solution();
  $("meHint").innerHTML =
    `Use your Step 1 fractions, not fresh weights. Silage contribution = silage fraction × 9. Supplement contribution = supplement fraction × ${sol.s.me}. Then DMI = 87 ÷ total diet ME.`;
  show("meHint");
});

$("checkNDF").addEventListener("click",()=>{
  const sol=solution();
  const v=n("dietNDF");
  if(!Number.isFinite(v)||!$("ndfPass").value){
    setFeedback("ndfFeedback","fail","Enter the diet NDF and decide whether it passes 30%.");
    return;
  }
  const expectedPass=sol.ndfPct>=TARGET.minNdf;
  const ok=close(v,sol.ndfPct,0.08)&&$("ndfPass").value===(expectedPass?"yes":"no");
  if(ok){
    unlocked.ndf=true;
    setFeedback("ndfFeedback", expectedPass?"pass":"warn",
      `${expectedPass?"Correct.":"Correct calculation."} Conservative diet NDF = ${sol.ndfPct.toFixed(2)}%. ${expectedPass?"It passes the 30% minimum, so you may proceed to cost.":"It fails the 30% minimum. The ration is not acceptable under this exercise, but continue to cost to see why cheapest must never be judged before nutrient checks."}`);
    show("step4");
    $("step4").scrollIntoView({behavior:"smooth",block:"start"});
  }else{
    setFeedback("ndfFeedback","fail","Recheck: silage fraction × 55%. Then compare the result with 30%.");
  }
});

$("hintNDF").addEventListener("click",()=>{
  $("ndfHint").textContent="Use the silage fraction from Step 1. Example: 0.70 × 55 = 38.5% NDF.";
  show("ndfHint");
});

$("checkCost").addEventListener("click",()=>{
  const sol=solution();
  const vals=["silageDMkg","suppDMkg","suppFreshKg","suppCost","silageFreshKg"].map(n);
  if(vals.some(v=>!Number.isFinite(v))){
    setFeedback("costFeedback","fail","Complete all conversion and cost fields.");
    return;
  }
  const ok=
    close(vals[0],sol.silDM,0.05)&&
    close(vals[1],sol.suppDM,0.05)&&
    close(vals[2],sol.suppFresh,0.05)&&
    close(vals[3],sol.cost,0.03)&&
    close(vals[4],sol.silFresh,0.08);
  if(ok){
    unlocked.cost=true;
    setFeedback("costFeedback","pass","Correct. You have completed the calculation in the right order.");
    renderResult();
    show("resultCard");
    $("resultCard").scrollIntoView({behavior:"smooth",block:"start"});
  }else{
    setFeedback("costFeedback","fail","Check DM allocation first, then divide by DM fraction to get fresh weight, then multiply supplement fresh kg by €/kg.");
  }
});

$("hintCost").addEventListener("click",()=>{
  const s=options[selected];
  $("costHint").innerHTML =
    `Silage DM = total DMI × silage fraction. Supplement DM = total DMI × supplement fraction. Fresh supplement = supplement DM ÷ ${(s.dm/100).toFixed(2)}. Cost = fresh supplement kg × €${(s.price/1000).toFixed(3)}/kg.`;
  show("costHint");
});

function renderResult(){
  const sol=solution();
  const passesNdf=sol.ndfPct>=TARGET.minNdf;
  $("resultTitle").textContent = `${sol.s.name}: worked result`;
  $("workedResult").innerHTML = `
    <div class="metric-grid">
      <div class="metric"><span>Diet DM</span><strong>${sol.dmi.toFixed(2)} kg/day</strong></div>
      <div class="metric"><span>Diet CP</span><strong>11.00%</strong></div>
      <div class="metric"><span>ME</span><strong>87.0 MJ/day</strong></div>
      <div class="metric"><span>Conservative NDF</span><strong>${sol.ndfPct.toFixed(2)}%</strong></div>
    </div>
    <div class="worked">
      <p><strong>Protein balance:</strong> ${(sol.silFrac*100).toFixed(2)}% silage DM + ${(sol.suppFrac*100).toFixed(2)}% ${sol.s.name} DM.</p>
      <p><strong>Fresh feeding amounts:</strong> ${sol.silFresh.toFixed(2)} kg silage + ${sol.suppFresh.toFixed(2)} kg ${sol.s.name}/head/day.</p>
      <p><strong>Purchased supplement cost:</strong> €${sol.cost.toFixed(2)}/head/day.</p>
      <p><strong>NDF verdict:</strong> ${passesNdf ? "PASS" : "FAIL"} against the 30% minimum using the conservative check.</p>
    </div>
    <p><strong>Teaching conclusion:</strong> ${passesNdf
      ? "This option passes the CP, ME, DMI and conservative NDF checks. Only now is its cost meaningful for comparison."
      : "This option can be mathematically balanced for CP and ME, but it fails the conservative NDF check. Therefore a low or attractive cost would not make it an acceptable answer."}</p>`;
}

$("tryAnother").addEventListener("click",()=>{
  show("optionCard"); show("step1");
  resetInputs();
  $("optionCard").scrollIntoView({behavior:"smooth",block:"start"});
});

$("resetAll").addEventListener("click",()=>location.reload());
