function escapeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function previewPage(contract, catalog) {
  const config = {
    locale: catalog.locale,
    appName: contract.appName,
    mcpPath: contract.mcpPath,
    openTool: contract.tools.open.name,
    pendingTool: contract.tools.pending.name,
    evaluateTool: contract.tools.evaluate.name,
    resetPath: `/preview/${catalog.locale}/reset`,
    ...catalog.preview
  };

  return `<!doctype html>
<html lang="${catalog.locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${contract.appName} – Local host preview</title>
  <style>
    :root{font-family:Inter,system-ui,sans-serif;color:#17233f;background:#f3f6fb}*{box-sizing:border-box}body{margin:0;padding:28px}.shell{max-width:850px;margin:auto}.head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:16px}.tag{font-size:.78rem;font-weight:750;letter-spacing:.08em;text-transform:uppercase;color:#286eb7}h1{margin:5px 0 0;font-size:1.5rem}.actions{display:flex;gap:8px;align-items:center}.badge{border-radius:999px;background:#e5f7f0;color:#13785e;padding:7px 11px;font-size:.82rem;font-weight:700}.reset{border:1px solid #cbd6e7;border-radius:999px;background:#fff;color:#43516b;padding:7px 11px;font:inherit;font-size:.82rem;cursor:pointer}iframe{display:block;width:100%;min-height:510px;border:0;border-radius:22px;background:transparent}.trace{margin-top:14px;border:1px solid #dbe3f0;border-radius:14px;background:#fff;padding:13px 15px;color:#59677f;font-size:.84rem}.trace strong{color:#17233f}.trace ol{margin:8px 0 0;padding-left:20px}.trace li{margin:4px 0}@media(max-width:600px){body{padding:12px}.head{display:block}.actions{margin-top:10px}.badge{display:inline-block}}
  </style>
</head>
<body>
  <main class="shell">
    <header class="head"><div><div class="tag">MCP Apps host simulation</div><h1>${contract.appName}</h1></div><div class="actions"><span class="badge">local · no model API</span><button class="reset" id="reset" type="button"></button></div></header>
    <iframe id="app" title="${contract.appName}" src="/preview/${catalog.locale}/widget"></iframe>
    <section class="trace"><strong>${catalog.locale === "de" ? "Simulierter Provider-Ablauf" : "Simulated provider flow"}</strong><ol id="events"></ol></section>
  </main>
  <script>
    const config=${escapeJson(config)};
    const frame=document.querySelector('#app');
    const events=document.querySelector('#events');
    const reset=document.querySelector('#reset');reset.textContent=config.resetLabel;
    let rpcId=0;
    const addEvent=(text)=>{const li=document.createElement('li');li.textContent=text;events.appendChild(li)};
    const send=(message)=>frame.contentWindow.postMessage(message,'*');
    const respond=(id,result,error)=>send({jsonrpc:'2.0',id,...(error?{error}:{result})});
    async function callMcp(method,params={}){
      const response=await fetch(config.mcpPath,{method:'POST',headers:{'content-type':'application/json','accept':'application/json, text/event-stream','x-skillpilot-demo-locale':config.locale},body:JSON.stringify({jsonrpc:'2.0',id:++rpcId,method,params})});
      const payload=await response.json();
      if(payload.error)throw new Error(payload.error.message||'MCP request failed');
      return payload.result;
    }
    async function notifyToolResult(result){send({jsonrpc:'2.0',method:'ui/notifications/tool-result',params:result})}
    function equivalentAnswer(answer){return /(?:x\\s*=\\s*7(?:\\D|$)|(?:^|\\D)7(?:\\D|$))/.test(answer.replace(',', '.').toLowerCase())}
    async function simulateEvaluation(){
      addEvent(config.locale==='de'?'Modell lädt die gespeicherte Lösung.':'Model loads the stored answer.');
      const pending=await callMcp('tools/call',{name:config.pendingTool,arguments:{}});
      const correct=equivalentAnswer(pending.structuredContent.learnerAnswer);
      addEvent(config.locale==='de'?'Modell bewertet fachlich, nicht per Wortlautvergleich.':'Model evaluates subject matter, not wording equality.');
      const evaluated=await callMcp('tools/call',{name:config.evaluateTool,arguments:{score:correct?2:1,feedback:correct?config.correctFeedback:config.partialFeedback}});
      await notifyToolResult(evaluated);
    }
    window.addEventListener('message',async(event)=>{
      if(event.source!==frame.contentWindow)return;
      const message=event.data;if(!message||message.jsonrpc!=='2.0')return;
      try{
        if(message.method==='ui/initialize'){
          respond(message.id,{protocolVersion:'2026-01-26',hostInfo:{name:'skillpilot-local-host',version:'0.1.0'},hostCapabilities:{serverTools:{},updateModelContext:{text:{}},message:{text:{}}},hostContext:{locale:config.locale,platform:'web',theme:'light'}});return;
        }
        if(message.method==='tools/call'){
          addEvent(config.locale==='de'?'Widget ruft eine App-only-Funktion direkt auf.':'Widget calls an app-only tool directly.');
          const result=await callMcp('tools/call',message.params);respond(message.id,result);return;
        }
        if(message.method==='ui/update-model-context'){
          addEvent(config.locale==='de'?'Nur eine semantische Zusammenfassung geht an den Modellkontext.':'Only a semantic summary enters model context.');respond(message.id,{});return;
        }
        if(message.method==='ui/message'){
          if(message.id===undefined){addEvent('Invalid ui/message notification ignored; a request ID is required.');return}
          addEvent(config.locale==='de'?'Das Widget bittet sichtbar und natürlich um Bewertung.':'The widget visibly asks for evaluation in natural language.');await simulateEvaluation();respond(message.id,{});return;
        }
      }catch(error){if(message.id!==undefined)respond(message.id,null,{code:-32000,message:error.message});else addEvent(error.message)}
    });
    frame.addEventListener('load',async()=>{
      const opened=await callMcp('tools/call',{name:config.openTool,arguments:{learning_request:config.initialRequest}});
      addEvent(config.locale==='de'?'Lernabsicht wurde ohne technische Kennung geöffnet.':'Learning intent opened without a technical identifier.');
      await notifyToolResult(opened);
    });
    reset.addEventListener('click',async()=>{await fetch(config.resetPath,{method:'POST'});location.reload()});
  </script>
</body>
</html>`;
}
