/**
 * Página local para o Matheus aprovar ou rejeitar os rascunhos do scout (ADR 0014).
 *
 * Aprovar = preenche pricing/open_source se estiverem em TODO e muda status para active.
 * Rejeitar = apaga o ficheiro e acrescenta a URL a scouting/rejected.json.
 * Só corre em localhost. Nenhum agente usa isto: as decisões são cliques/teclas do Matheus.
 *
 * Uso: pnpm tsx scripts/scout/review.ts  →  http://localhost:4747
 */
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

import { parseDocument } from 'yaml';

const ROOT = path.resolve(import.meta.dirname, '../..');
const RES = path.join(ROOT, 'data/resources');
const REJECTED = path.join(ROOT, 'scouting/rejected.json');
const PORT = 4747;
const SLUG = /^[a-z0-9-]+$/;

type Draft = {
  slug: string;
  name: string;
  url: string;
  repo?: string;
  area: string;
  category: string;
  tags: string[];
  pricing: string;
  open_source: boolean | string;
  license?: string;
  description: { pt: string; en: string };
  notes?: string;
};

function drafts(): Draft[] {
  return readdirSync(RES)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => ({
      slug: f.slice(0, -5),
      ...(parseDocument(readFileSync(path.join(RES, f), 'utf8')).toJS() as Omit<Draft, 'slug'> & { status: string }),
    }))
    .filter((d) => (d as unknown as { status: string }).status === 'draft' && d.notes?.startsWith('Rascunho do scout'))
    .sort(
      (a, b) => a.area.localeCompare(b.area) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
    );
}

function approve(slug: string, pricing?: string, openSource?: boolean, pt?: string, en?: string) {
  const file = path.join(RES, `${slug}.yaml`);
  const doc = parseDocument(readFileSync(file, 'utf8'));
  if (pricing) doc.set('pricing', pricing);
  if (typeof openSource === 'boolean') doc.set('open_source', openSource);
  if (pt) doc.setIn(['description', 'pt'], pt);
  if (en) doc.setIn(['description', 'en'], en);
  if (doc.get('pricing') === 'TODO' || doc.get('open_source') === 'TODO')
    throw new Error('falta pricing ou open_source');
  doc.set('status', 'active');
  const notes = String(doc.get('notes') ?? '').replace(/^Rascunho do scout/, 'Scout, aprovado pelo Matheus');
  doc.set('notes', notes);
  writeFileSync(file, doc.toString({ lineWidth: 0 }));
}

function reject(slug: string, reason: string) {
  const file = path.join(RES, `${slug}.yaml`);
  const d = parseDocument(readFileSync(file, 'utf8')).toJS() as { name: string; url: string };
  const list = JSON.parse(readFileSync(REJECTED, 'utf8')) as unknown[];
  list.push({ key: d.url, name: d.name, decision: 'out', reason: reason || 'rejeitado na revisão pelo Matheus' });
  writeFileSync(REJECTED, JSON.stringify(list, null, 2) + '\n');
  unlinkSync(file);
}

const PAGE = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Revisão do scout</title>
<style>
:root{color-scheme:dark;--bg:#0b0b0c;--fg:#ededed;--mute:#8a8a8f;--line:#26262a;--acc:#4b7bff}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px}
header{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:16px;color:var(--mute);font:13px ui-monospace,monospace}
select,input,textarea,button{background:#141416;color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:6px 8px;font:inherit}
textarea{width:100%;box-sizing:border-box;min-height:56px}
.card{border:1px solid var(--line);border-radius:8px;padding:20px}
h1{font-size:22px;margin:0 0 4px;font-weight:500} a{color:var(--acc)}
.meta{color:var(--mute);font:13px ui-monospace,monospace;margin:8px 0 16px}
label{display:block;color:var(--mute);font-size:13px;margin:12px 0 4px}
.row{display:flex;gap:12px;flex-wrap:wrap}
.keys{color:var(--mute);font:12px ui-monospace,monospace;margin-top:16px}
kbd{border:1px solid var(--line);border-radius:4px;padding:0 4px}
.err{color:#ff6b6b;min-height:20px;margin-top:8px}
</style></head><body><main>
<header><span id="count"></span><select id="filter"></select></header>
<div class="card" id="card"></div>
<div class="err" id="err"></div>
<p class="keys"><kbd>a</kbd> aprovar · <kbd>r</kbd> rejeitar · <kbd>s</kbd> saltar · <kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd>/<kbd>4</kbd> free/freemium/paid/pwyw · <kbd>o</kbd> open source sim/não</p>
</main><script>
let all=[],list=[],i=0;
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function load(){all=await (await fetch('/api/drafts')).json();const cats=[...new Set(all.map(d=>d.area+' / '+d.category))];
$('#filter').innerHTML='<option value="">todas ('+all.length+')</option>'+cats.map(c=>'<option>'+c+'</option>').join('');apply()}
function apply(){const f=$('#filter').value;list=f?all.filter(d=>d.area+' / '+d.category===f):all;i=Math.min(i,list.length-1);render()}
function render(){$('#count').textContent=list.length?(i+1)+' / '+list.length:'nada por rever';const d=list[i];if(!d){$('#card').innerHTML='';return}
$('#card').innerHTML='<h1>'+esc(d.name)+'</h1><a href="'+esc(d.url)+'" target="_blank" rel="noopener">'+esc(d.url)+'</a>'+
'<div class="meta">'+esc(d.area)+' / '+esc(d.category)+' · '+esc(d.tags.join(', '))+(d.license?' · '+esc(d.license):'')+'<br>'+esc(d.notes)+'</div>'+
'<label>pt</label><textarea id="pt">'+esc(d.description.pt)+'</textarea><label>en</label><textarea id="en">'+esc(d.description.en)+'</textarea>'+
'<div class="row"><div><label>pricing</label><select id="pricing">'+['TODO','free','freemium','paid','pay-what-you-want'].map(p=>'<option'+(p===d.pricing?' selected':'')+'>'+p+'</option>').join('')+'</select></div>'+
'<div><label>open_source</label><select id="os">'+['TODO','true','false'].map(p=>'<option'+(String(d.open_source)===p?' selected':'')+'>'+p+'</option>').join('')+'</select></div>'+
'<div style="flex:1"><label>motivo (se rejeitar)</label><input id="reason" style="width:100%;box-sizing:border-box"></div></div>';$('#err').textContent=''}
async function act(kind){const d=list[i];if(!d)return;const body={slug:d.slug,kind,pricing:$('#pricing').value,open_source:$('#os').value,pt:$('#pt').value,en:$('#en').value,reason:$('#reason').value};
const r=await fetch('/api/act',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
if(!r.ok){$('#err').textContent=await r.text();return}all=all.filter(x=>x.slug!==d.slug);apply()}
document.addEventListener('keydown',e=>{if(['TEXTAREA','INPUT'].includes(document.activeElement.tagName))return;
const k=e.key;if(k==='a')act('approve');else if(k==='r')act('reject');else if(k==='s'){i=(i+1)%Math.max(list.length,1);render()}
else if('1234'.includes(k)&&k.length===1)$('#pricing').value=['free','freemium','paid','pay-what-you-want'][+k-1];
else if(k==='o'){const s=$('#os');s.value=s.value==='true'?'false':'true'}});
$('#filter').onchange=()=>{i=0;apply()};load();
</script></body></html>`;

createServer((req, res) => {
  const send = (code: number, body: string, type = 'text/plain; charset=utf-8') => {
    res.writeHead(code, { 'content-type': type });
    res.end(body);
  };
  if (req.method === 'GET' && req.url === '/') return send(200, PAGE, 'text/html; charset=utf-8');
  if (req.method === 'GET' && req.url === '/api/drafts') return send(200, JSON.stringify(drafts()), 'application/json');
  if (req.method === 'POST' && req.url === '/api/act') {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        const b = JSON.parse(raw) as {
          slug: string;
          kind: string;
          pricing: string;
          open_source: string;
          pt: string;
          en: string;
          reason: string;
        };
        if (!SLUG.test(b.slug)) throw new Error('slug inválido');
        if (b.kind === 'approve') {
          approve(
            b.slug,
            b.pricing !== 'TODO' ? b.pricing : undefined,
            b.open_source === 'TODO' ? undefined : b.open_source === 'true',
            b.pt?.trim(),
            b.en?.trim(),
          );
        } else if (b.kind === 'reject') reject(b.slug, b.reason?.trim());
        else throw new Error('ação desconhecida');
        send(200, 'ok');
      } catch (e) {
        send(400, (e as Error).message);
      }
    });
    return;
  }
  send(404, 'não encontrado');
}).listen(PORT, '127.0.0.1', () => console.log(`Revisão do scout: http://localhost:${PORT}`));
