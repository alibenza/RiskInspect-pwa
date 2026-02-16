import React,{useState}from'react';
import{useInspectionStore}from'../hooks/useInspectionStore';
import{generateAnalysisPrompt}from'../utils/aiAnalysis';
import jsPDF from'jspdf';
import'jspdf-autotable';
import{BrainCircuit,Sparkles,Loader2,AlertCircle,RefreshCw,FileDown,ShieldCheck}from'lucide-react';

const AIAnalysis=()=>{
const{responses,questionsConfig,selectedGaranties}=useInspectionStore();
const[analysis,setAnalysis]=useState("");
const[loading,setLoading]=useState(false);
const[error,setError]=useState(null);

const handleExport=()=>{
const doc=new jsPDF();
const date=new Date().toLocaleDateString();
doc.setFillColor(30,41,59);
doc.rect(0,0,210,40,'F');
doc.setTextColor(255,255,255);
doc.setFontSize(20);
doc.text("RAPPORT D'EXPERTISE",15,25);
let y=50;
if(analysis){
doc.setTextColor(79,70,229);
doc.text("ANALYSE IA",15,y);
y+=10;
doc.setTextColor(40,40,40);
doc.setFontSize(10);
const splitText=doc.splitTextToSize(analysis,180);
doc.text(splitText,15,y);
y+=(splitText.length*5)+10;
}
const rows=[];
questionsConfig.forEach(s=>{
rows.push([{content:s.title,colSpan:3,styles:{fillColor:[240,240,240],fontStyle:'bold'}}]);
s.questions.forEach(q=>{
const r=responses[q.id];
if(r&&r.value)rows.push([q.label,r.score||'-',r.value]);
});
});
doc.autoTable({startY:y,head:[['Point','Note','Détails']],body:rows});
doc.save("Rapport_Expertise.pdf");
};

const runAnalysis=async()=>{
if(Object.keys(responses).length===0){setError("Audit vide.");return;}
setLoading(true);setError(null);
try{
const r=await fetch("https://api.mistral.ai/v1/chat/completions",{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':'Bearer 3iLUdJmbLlNrXdjgUflUzZWx1HQUoxYx'},
body:JSON.stringify({model:"mistral-small-latest",messages:[{role:"system",content:"Expert IARD"},{role:"user",content:generateAnalysisPrompt(responses,questionsConfig,selectedGaranties)}],temperature:0.2})
});
const d=await r.json();
if(d.choices)setAnalysis(d.choices[0].message.content);
}catch(e){setError(e.message);}finally{setLoading(false);}};

return(
<div className="p-4 space-y-6 pb-24">
<div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
<div className="flex items-center space-x-3">
<BrainCircuit className="text-indigo-400"/>
<h2 className="text-xl font-bold uppercase">Analyse Expert</h2>
</div>
</div>
{error&&<div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2"><AlertCircle size={18}/>{error}</div>}
{!analysis&&!loading?(
<button onClick={runAnalysis} className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white flex flex-col items-center gap-3">
<Sparkles className="text-indigo-600" size={32}/>
<span className="font-bold">Générer l'analyse IA</span>
</button>
):loading?(
<div className="p-12 bg-white rounded-[2rem] text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32}/><p className="mt-4 font-bold">Analyse Mistral en cours...</p></div>
):(
<div className="space-y-4">
<div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
<div className="flex items-center gap-2 mb-4 text-green-600"><ShieldCheck size={20}/><span className="text-xs font-bold uppercase">Résultats</span></div>
<div className="text-sm text-slate-600 whitespace-pre-wrap">{analysis}</div>
</div>
<button onClick={handleExport} className="w-full py-4 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-100">
<FileDown size={20}/>Exporter PDF
</button>
<button onClick={()=>setAnalysis("")} className="w-full text-slate-400 text-xs font-bold uppercase">Recommencer</button>
</div>
)}
</div>
);};
export default AIAnalysis;
