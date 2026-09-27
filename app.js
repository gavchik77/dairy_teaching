const TARGET = { cp:11, me:87, minNdf:30, maxDmi:12 };
const silage = { name:"Poor-quality silage", cp:8, me:9, dm:20, ndf:55, price:0 };

const supplements = {
  groundnut:{ name:"Groundnut meal/cake", cp:53, me:13.2, dm:90, ndf:22, price:313 },
  barley:{ name:"Rolled barley", cp:12, me:13, dm:86, ndf:14, price:270 },
  crunch:{ name:"GAIN Weanling Crunch 18%", cp:18, me:13, dm:87, ndf:20, price:530 }
};

let selected = "groundnut";
const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove("hidden");
const hide = id => $(id).classList.add("hidden");
const num = id => parseFloat($(id).value);
const close = (a,b,tol) => Number.isFinite(a) && Math.abs(a-b) <= tol;

function expected(){
  const s = supplements[selected];

  // Step 1: protein proportions
  const suppFrac = (TARGET.cp - silage.cp) / (s.cp - silage.cp);
  const silFrac = 1 - suppFrac;

  // Step 2: teacher-requested method:
  // divide total daily ME requirement by the Step 1 fractions,
  // then convert each MJ allocation to kg DM using that feed's ME density.
  const silMEreq = silFrac * TARGET.me;
  const suppMEreq = suppFrac * TARGET.me;
  const silDM = silMEreq / silage.me;
  const suppDM = suppMEreq / s.me;
  const totalDM = silDM + suppDM;

  const silFresh = silDM / (silage.dm/100);
  const suppFresh = suppDM / (s.dm/100);

  // Step 3: NDF from actual DM amounts eaten
  const silNDFkg = silDM * (silage.ndf/100);
  const suppNDFkg = suppDM * (s.ndf/100);
  const totalNDFkg = silNDFkg + suppNDFkg;
  const ndfPct = totalNDFkg / totalDM * 100;

  // Step 4 cost from fresh supplement amount
  const cost = suppFresh * (s.price/1000);

  return {
    s, suppFrac, silFrac,
    silMEreq, suppMEreq,
    silDM, suppDM, totalDM,
    silFresh, suppFresh,
    silNDFkg, suppNDFkg, totalNDFkg, ndfPct,
    cost
  };
}

function setFeedback(id,type,text){
  const el=$(id);
  el.className=`feedback ${type}`;
  el.textContent=text;
}

function markField(inputId, feedbackId, ok, correctText="Correct"){
  const input=$(inputId), fb=$(feedbackId);
  input.classList.remove("good","bad");
  fb.className="field-feedback";
  if(!input.value){
    fb.textContent="";
    return;
  }
  input.classList.add(ok?"good":"bad");
  fb.classList.add(ok?"good":"bad");
  fb.textContent=ok?`✓ ${correctText}`:"Check this value";
}

function clearFields(){
  [
    "silagePct","suppPct","silageDM","suppDM","silageFresh","suppFresh",
    "silageNDFkg","suppNDFkg","dietNDFpct","ndfLimitLow","ndfLimitHigh","actualNDFbw","suppCost","priceCheck"
  ].forEach(id=>$(id).value="");

  document.querySelectorAll("input").forEach(i=>i.classList.remove("good","bad"));
  document.querySelectorAll(".field-feedback").forEach(f=>{
    f.textContent=""; f.className="field-feedback";
  });

  ["step2","step3","step4","step5","finalCard","asFedSection"].forEach(hide);

  setFeedback("proteinFeedback","neutral","The two proportions must add to 100% and give an 11% CP blend.");
  setFeedback("dmFeedback","neutral","Calculate both DM amounts. The app checks them as soon as you enter them.");
  setFeedback("freshFeedback","neutral","Convert DM to fresh weight using each feed's DM percentage.");
  setFeedback("ndfFeedback","neutral","The ration must contain at least 30% NDF.");
  setFeedback("intakeFeedback","neutral","Check the NDF intake against body weight before moving to cost.");
  setFeedback("costFeedback","neutral","Use the fresh supplement amount from Step 2.");
}

function updateLabels(){
  const e=expected(), s=e.s;
  $("feedDescription").innerHTML =
    `You are testing <strong>${s.name}</strong>: ${s.cp}% CP, ${s.me} MJ ME/kg DM, ${s.dm}% DM, ${s.ndf}% NDF, €${s.price}/t fresh.`;

  $("proteinEquation").textContent =
    `${silage.cp}(1 − x) + ${s.cp}x = ${TARGET.cp}, where x = proportion of ${s.name}`;
  $("suppPctLabel").firstChild.textContent = `${s.name} proportion (%) `;
  $("suppMEtitle").textContent = `${s.name} ME required`;
  $("suppDMLabel").firstChild.textContent = `${s.name} DM eaten (kg/day) `;
  $("suppFreshLabel").firstChild.textContent = `Fresh ${s.name} offered (kg/day) `;
  $("suppNDFLabel").firstChild.textContent = `${s.name} NDF (kg/day) `;
  $("suppCostLabel").firstChild.textContent = `${s.name} cost (€/head/day) `;

  $("dmFormula").innerHTML =
    `Silage DM = silage ME required ÷ ${silage.me} MJ/kg DM<br>`+
    `${s.name} DM = supplement ME required ÷ ${s.me} MJ/kg DM`;

  $("freshFormula").innerHTML =
    `Fresh silage = silage DM ÷ ${silage.dm/100}<br>`+
    `Fresh ${s.name} = supplement DM ÷ ${s.dm/100}`;

  $("ndfFormula").innerHTML =
    `Silage NDF kg = silage DM × ${silage.ndf/100}<br>`+
    `${s.name} NDF kg = supplement DM × ${s.ndf/100}<br>`+
    `Diet NDF % = total NDF kg ÷ total DM kg × 100`;

  $("costFormula").innerHTML =
    `${s.name} cost/day = fresh kg/day × €${(s.price/1000).toFixed(3)}/kg`;
}

function updateLiveME(){
  const e=expected();
  $("silageMErequired").textContent=`${e.silMEreq.toFixed(2)} MJ/day`;
  $("suppMErequired").textContent=`${e.suppMEreq.toFixed(2)} MJ/day`;
  $("silageMEworking").textContent=`${(e.silFrac*100).toFixed(2)}% × 87`;
  $("suppMEworking").textContent=`${(e.suppFrac*100).toFixed(2)}% × 87`;
}

function validateProtein(){
  const e=expected();
  const a=num("silagePct"), b=num("suppPct");

  markField("silagePct","silagePctFeedback",close(a,e.silFrac*100,.08));
  markField("suppPct","suppPctFeedback",close(b,e.suppFrac*100,.08));

  if(!Number.isFinite(a)||!Number.isFinite(b)) return false;

  const ok = close(a,e.silFrac*100,.08) &&
             close(b,e.suppFrac*100,.08) &&
             close(a+b,100,.10);

  if(ok){
    setFeedback("proteinFeedback","pass",
      `Correct: ${e.silFrac*100|0}% is not the key point—the precise balance is ${(e.silFrac*100).toFixed(2)}% silage and ${(e.suppFrac*100).toFixed(2)}% ${e.s.name}. Step 2 is now unlocked.`);
    updateLiveME();
    show("step2");
  }else{
    setFeedback("proteinFeedback","fail",
      "Not yet. Check the 11% CP balance and make sure the two proportions add to 100%.");
  }
  return ok;
}

function validateDM(){
  const e=expected();
  const a=num("silageDM"), b=num("suppDM");

  markField("silageDM","silageDMFeedback",close(a,e.silDM,.03));
  markField("suppDM","suppDMFeedback",close(b,e.suppDM,.03));

  if(!Number.isFinite(a)||!Number.isFinite(b)){
    $("totalDMI").textContent="—"; $("dmiVerdict").textContent="—";
    return false;
  }

  // Live total from what student entered
  const studentTotal=a+b;
  $("totalDMI").textContent=`${studentTotal.toFixed(2)} kg/day`;
  $("dmiVerdict").textContent=studentTotal<=TARGET.maxDmi?"Within maximum":"Above maximum";

  const ok=close(a,e.silDM,.03)&&close(b,e.suppDM,.03);
  if(ok){
    setFeedback("dmFeedback","pass",
      `Correct. Total DMI = ${e.totalDM.toFixed(2)} kg DM/day, which is ${e.totalDM<=12?"below":"above"} the 12 kg maximum. Now convert DM to fresh/as-fed amounts.`);
    show("asFedSection");
  }else{
    setFeedback("dmFeedback","fail",
      "Use the ME allocated to each feed above and divide by that feed's ME (MJ/kg DM).");
    hide("asFedSection"); hide("step3"); hide("step4"); hide("step5"); hide("finalCard");
  }
  return ok;
}

function validateFresh(){
  const e=expected();
  const a=num("silageFresh"), b=num("suppFresh");

  markField("silageFresh","silageFreshFeedback",close(a,e.silFresh,.06));
  markField("suppFresh","suppFreshFeedback",close(b,e.suppFresh,.04));

  if(!Number.isFinite(a)||!Number.isFinite(b)) return false;

  const ok=close(a,e.silFresh,.06)&&close(b,e.suppFresh,.04);
  if(ok){
    setFeedback("freshFeedback","pass",
      `Correct. The animal receives approximately ${e.silFresh.toFixed(2)} kg fresh silage and ${e.suppFresh.toFixed(2)} kg fresh ${e.s.name} per day.`);
    show("step3");
  }else{
    setFeedback("freshFeedback","fail",
      `Remember: fresh weight = DM ÷ DM fraction. Silage is 20% DM; ${e.s.name} is ${e.s.dm}% DM.`);
    hide("step3"); hide("step4"); hide("step5"); hide("finalCard");
  }
  return ok;
}

function validateNDF(){
  const e=expected();
  const a=num("silageNDFkg"), b=num("suppNDFkg"), c=num("dietNDFpct");

  markField("silageNDFkg","silageNDFFeedback",close(a,e.silNDFkg,.03));
  markField("suppNDFkg","suppNDFFeedback",close(b,e.suppNDFkg,.03));
  markField("dietNDFpct","dietNDFFeedback",close(c,e.ndfPct,.10));

  if(!Number.isFinite(a)||!Number.isFinite(b)||!Number.isFinite(c)) return false;

  const ok=close(a,e.silNDFkg,.03)&&close(b,e.suppNDFkg,.03)&&close(c,e.ndfPct,.10);
  if(ok){
    const pass=e.ndfPct>=TARGET.minNdf;
    setFeedback("ndfFeedback",pass?"pass":"warn",
      `Correct. Diet NDF = ${e.ndfPct.toFixed(2)}%. ${pass?"It passes the 30% concentration minimum. Now check whether total NDF intake may physically limit voluntary intake.":"It fails the 30% concentration minimum. Continue to the intake check to see the second fibre constraint."}`);
    updateIntakeDisplay();
    show("step4");
  }else{
    setFeedback("ndfFeedback","fail",
      "Calculate NDF kg from each actual DM amount, add them, then divide by total DM and multiply by 100.");
    hide("step4"); hide("step5"); hide("finalCard");
  }
  return ok;
}


function updateIntakeDisplay(){
  const e=expected();
  $("intakeSilageDM").textContent=`${e.silDM.toFixed(2)} kg DM/day`;
  $("intakeTotalNDF").textContent=`${e.totalNDFkg.toFixed(2)} kg/day`;

  const pctBW=e.totalNDFkg/400*100;
  const silageWithin=e.silDM<=11;
  const ndfWithinUpper=pctBW<=1.2;

  if(silageWithin && ndfWithinUpper){
    $("intakeVerdict").textContent="Within teaching benchmarks";
  }else if(!silageWithin && !ndfWithinUpper){
    $("intakeVerdict").textContent="Likely physical-intake concern";
  }else{
    $("intakeVerdict").textContent="Check rumen-fill risk";
  }
}

function validateIntake(){
  const e=expected();
  const low=400*0.011;
  const high=400*0.012;
  const actual=e.totalNDFkg/400*100;

  const a=num("ndfLimitLow"), b=num("ndfLimitHigh"), c=num("actualNDFbw");

  markField("ndfLimitLow","ndfLimitLowFeedback",close(a,low,.03));
  markField("ndfLimitHigh","ndfLimitHighFeedback",close(b,high,.03));
  markField("actualNDFbw","actualNDFbwFeedback",close(c,actual,.03));

  if(!Number.isFinite(a)||!Number.isFinite(b)||!Number.isFinite(c)) return false;

  const ok=close(a,low,.03)&&close(b,high,.03)&&close(c,actual,.03);
  if(ok){
    const silageWithin=e.silDM<=11;
    const belowLow=actual<1.1;
    const withinBand=actual>=1.1 && actual<=1.2;
    const aboveHigh=actual>1.2;

    let msg="";
    let type="pass";

    if(aboveHigh){
      type="warn";
      msg=`Correct. The ration supplies ${e.totalNDFkg.toFixed(2)} kg NDF/day = ${actual.toFixed(2)}% of BW, above the 1.2% reference. Silage DM itself is ${e.silDM.toFixed(2)} kg/day ${silageWithin?"and is within":"and exceeds"} the 10–11 kg low-quality-silage benchmark. This suggests a possible rumen-fill / voluntary-intake limitation.`;
    }else if(withinBand){
      type="warn";
      msg=`Correct. NDF intake is ${actual.toFixed(2)}% of BW, within the 1.1–1.2% reference range. Silage DM is ${e.silDM.toFixed(2)} kg/day. Intake may be close to the physical-fill limit, so interpret the ration cautiously.`;
    }else{
      type="pass";
      msg=`Correct. NDF intake is ${actual.toFixed(2)}% of BW, below the 1.1% reference, and silage DM is ${e.silDM.toFixed(2)} kg/day. This does not indicate an NDF-fill limitation from these teaching benchmarks.`;
    }

    setFeedback("intakeFeedback",type,msg);
    show("step5");
  }else{
    setFeedback("intakeFeedback","fail",
      "Calculate 1.1% and 1.2% of 400 kg, then express the ration's total NDF intake as a percentage of live weight.");
    hide("step5"); hide("finalCard");
  }
  return ok;
}

function validateCost(){
  const e=expected();
  const a=num("suppCost"), b=num("priceCheck");

  markField("suppCost","suppCostFeedback",close(a,e.cost,.025));
  markField("priceCheck","priceFeedback",close(b,e.s.price,.5));

  if(!Number.isFinite(a)||!Number.isFinite(b)) return false;

  const ok=close(a,e.cost,.025)&&close(b,e.s.price,.5);
  if(ok){
    setFeedback("costFeedback","pass",
      `Correct. Purchased supplement cost is about €${e.cost.toFixed(2)}/head/day.`);
    renderFinal();
    show("finalCard");
  }else{
    setFeedback("costFeedback","fail",
      `Use the fresh supplement quantity from Step 2 and €${(e.s.price/1000).toFixed(3)} per kg fresh.`);
    hide("finalCard");
  }
  return ok;
}

function renderFinal(){
  const e=expected();
  const ndfPass=e.ndfPct>=TARGET.minNdf;
  $("finalTitle").textContent=`${e.s.name} ration`;
  $("finalSummary").innerHTML=`
    <div class="summary-grid">
      <div><span>Silage ME share</span><strong>${e.silMEreq.toFixed(2)} MJ</strong></div>
      <div><span>Supplement ME share</span><strong>${e.suppMEreq.toFixed(2)} MJ</strong></div>
      <div><span>Total DMI</span><strong>${e.totalDM.toFixed(2)} kg</strong></div>
      <div><span>Diet NDF</span><strong>${e.ndfPct.toFixed(2)}%</strong></div>
      <div><span>Fresh silage</span><strong>${e.silFresh.toFixed(2)} kg</strong></div>
      <div><span>Fresh supplement</span><strong>${e.suppFresh.toFixed(2)} kg</strong></div>
      <div><span>Supplement cost</span><strong>€${e.cost.toFixed(2)}/day</strong></div>
      <div><span>NDF concentration</span><strong>${ndfPass?"PASS":"FAIL"}</strong></div>
      <div><span>NDF intake</span><strong>${(e.totalNDFkg/400*100).toFixed(2)}% BW</strong></div>
    </div>
    <p><strong>Calculation order used:</strong> protein proportions → divide the 87 MJ requirement between feeds → convert each ME share to kg DM → convert DM to fresh feed offered → NDF concentration check → voluntary-intake / NDF-fill check → cost.</p>`;
}

// Question 1
document.querySelectorAll("[data-first]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-first]").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");

    if(btn.dataset.first==="protein"){
      setFeedback("firstFeedback","pass","Correct. First determine the silage/supplement proportions required to reach 11% CP.");
      show("chooseFeedCard"); show("step1");
      updateLabels();
    }else{
      const msg={
        cost:"Cost is checked last, after the ration has passed the nutrient calculations.",
        ndf:"NDF is checked after you have calculated the actual amount of each feed eaten.",
        me:"The 87 MJ requirement is divided between the feeds only after the protein proportions are established."
      };
      setFeedback("firstFeedback","fail",msg[btn.dataset.first]);
    }
  });
});

// Feed tabs
document.querySelectorAll("[data-feed]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selected=btn.dataset.feed;
    document.querySelectorAll("[data-feed]").forEach(b=>b.classList.toggle("active",b===btn));
    clearFields();
    updateLabels();
  });
});

// Live validation — no check buttons
["silagePct","suppPct"].forEach(id=>$(id).addEventListener("input",validateProtein));
["silageDM","suppDM"].forEach(id=>$(id).addEventListener("input",validateDM));
["silageFresh","suppFresh"].forEach(id=>$(id).addEventListener("input",validateFresh));
["silageNDFkg","suppNDFkg","dietNDFpct"].forEach(id=>$(id).addEventListener("input",validateNDF));
["ndfLimitLow","ndfLimitHigh","actualNDFbw"].forEach(id=>$(id).addEventListener("input",validateIntake));
["suppCost","priceCheck"].forEach(id=>$(id).addEventListener("input",validateCost));

$("anotherFeed").addEventListener("click",()=>{
  clearFields(); updateLabels();
  $("chooseFeedCard").scrollIntoView({behavior:"smooth",block:"start"});
});
$("restart").addEventListener("click",()=>location.reload());
