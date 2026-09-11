const h = React.createElement;
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const STORE_KEY = 'financaPessoal_v1';
const PREFS_KEY = 'financaGroovy_prefs_v1';
const AUTH_KEY = 'financaGroovy_auth_v1';
const hashPw = (login, pw) => { const s = 'pr0sp|' + (login || '').toLowerCase() + '|' + pw; let a = 5381, b = 52711; for (let i = 0; i < s.length; i++) { a = ((a << 5) + a + s.charCodeAt(i)) >>> 0; b = ((b << 5) + b + s.charCodeAt(s.length - 1 - i)) >>> 0; } return a.toString(36) + b.toString(36); };

/* ===== formatação ===== */
const fmt = n => 'R$ ' + (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = n => { const v = Number(n) || 0; return Math.abs(v) >= 1000 ? 'R$ ' + (v / 1000).toFixed(1).replace('.', ',') + 'k' : fmt(v); };
const pct = n => (Math.round((Number(n) || 0) * 10) / 10).toLocaleString('pt-BR') + '%';
const todayISO = () => new Date().toISOString().slice(0, 10);
const isoBR = iso => { if (!iso) return '—'; const p = iso.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };
const mk = iso => (iso || '').slice(0, 7);
const addM = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setMonth(d.getMonth() + n); return d.toISOString().slice(0, 10); };
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTHS_S = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const mkLong = k => { const [y, m] = k.split('-'); return `${MONTHS[+m - 1]} de ${y}`; };

const PAY_METHODS = ['Pix', 'Débito', 'Dinheiro', 'Boleto', 'Cartão'];

const DEFAULT_CATS = [
  ['Moradia', '#E8557F'], ['Alimentação', '#F58A5E'], ['Mercado', '#E5AE49'], ['Transporte', '#8E5C86'],
  ['Saúde', '#4E9E76'], ['Beleza', '#EC7BA6'], ['Cuidados pessoais', '#C98BC0'], ['Educação', '#6E8DC4'],
  ['Lazer', '#F2A93B'], ['Assinaturas', '#A87BD1'], ['Compras', '#E0688C'], ['Presentes', '#F09BB5'],
  ['Família', '#69AF9A'], ['Pets', '#C9A05C'], ['Viagens', '#5FAFC4'], ['Impostos', '#9A7C88'],
  ['Dívidas', '#DE6C63'], ['Investimentos', '#3E9C7E'], ['Reserva', '#6FA8C9'], ['Salário', '#4E9E76'], ['Outros', '#A3899A']
].map(([name, color]) => ({ id: uid(), name, color }));
const catIdOf = (cats, n) => { const c = cats.find(x => x.name === n); return c ? c.id : ''; };

function emptyData() { return { accounts: [], cards: [], transactions: [], categories: DEFAULT_CATS.map(c => ({ ...c })), budgets: [], goals: [], investments: [], shopping: [], meta: { demo: false, monthlyBudget: 0 } }; }

function buildDemo() {
  const cats = DEFAULT_CATS.map(c => ({ ...c })); const C = n => catIdOf(cats, n);
  const accounts = [
    { id: uid(), name: 'Conta principal', type: 'banco', balance: 3200, color: '#E8557F' },
    { id: uid(), name: 'Carteira', type: 'dinheiro', balance: 150, color: '#F58A5E' }];
  const cards = [
    { id: uid(), name: 'Cartão Roxo', brand: 'Mastercard', limit: 5000, closeDay: 3, dueDay: 12, color: '#8E5C86', payAccount: accounts[0].id },
    { id: uid(), name: 'Cartão Rosa', brand: 'Visa', limit: 3000, closeDay: 20, dueDay: 28, color: '#E8557F', payAccount: accounts[0].id }];
  const n = new Date(), y = n.getFullYear(), m = n.getMonth();
  const d = (day, mo = 0) => new Date(y, m + mo, day).toISOString().slice(0, 10);
  const t = []; const add = o => t.push({ id: uid(), tags: [], notes: '', subcategory: '', ...o });
  add({ desc: 'Salário', value: 4800, type: 'receita', category: C('Salário'), account: accounts[0].id, date: d(5), dueDate: d(5), status: 'recebido', payMethod: 'Pix', recurring: 'mensal' });
  add({ desc: 'Aluguel', value: 1400, type: 'despesa', category: C('Moradia'), account: accounts[0].id, date: d(10), dueDate: d(10), status: 'pago', payMethod: 'Boleto', recurring: 'mensal' });
  add({ desc: 'Internet', value: 110, type: 'despesa', category: C('Moradia'), account: accounts[0].id, date: d(15), dueDate: d(15), status: 'pendente', payMethod: 'Pix', recurring: 'mensal' });
  add({ desc: 'Academia', value: 99, type: 'despesa', category: C('Saúde'), account: accounts[0].id, date: d(8), dueDate: d(8), status: 'pago', payMethod: 'Pix', recurring: 'mensal' });
  add({ desc: 'Mercado', value: 520, type: 'despesa', category: C('Mercado'), card: cards[0].id, date: d(6), dueDate: d(6), status: 'pendente', payMethod: 'Cartão' });
  add({ desc: 'Restaurante', value: 96, type: 'despesa', category: C('Alimentação'), card: cards[1].id, date: d(9), dueDate: d(9), status: 'pendente', payMethod: 'Cartão' });
  add({ desc: 'Uber', value: 42, type: 'despesa', category: C('Transporte'), account: accounts[0].id, date: d(11), dueDate: d(11), status: 'pago', payMethod: 'Pix' });
  add({ desc: 'Streaming', value: 55, type: 'despesa', category: C('Assinaturas'), card: cards[0].id, date: d(3), dueDate: d(3), status: 'pendente', payMethod: 'Cartão', recurring: 'mensal' });
  const g = uid();
  for (let i = 1; i <= 6; i++) add({ desc: 'Notebook', value: 350, type: 'despesa', category: C('Compras'), card: cards[0].id, date: d(2, i - 1), dueDate: d(2, i - 1), status: i === 1 ? 'pendente' : 'agendado', payMethod: 'Cartão', installmentGroup: g, installment: i, installments: 6 });
  add({ desc: 'Salário', value: 4800, type: 'receita', category: C('Salário'), account: accounts[0].id, date: d(5, -1), status: 'recebido', payMethod: 'Pix' });
  add({ desc: 'Aluguel', value: 1400, type: 'despesa', category: C('Moradia'), account: accounts[0].id, date: d(10, -1), status: 'pago', payMethod: 'Boleto' });
  add({ desc: 'Mercado', value: 610, type: 'despesa', category: C('Mercado'), card: cards[0].id, date: d(7, -1), status: 'pago', payMethod: 'Cartão' });
  const goals = [
    { id: uid(), name: 'Reserva de emergência', kind: 'Reserva', total: 15000, saved: 5200, date: d(1, 12), priority: 'alta', monthly: 700 },
    { id: uid(), name: 'Viagem', kind: 'Objetivo', total: 8000, saved: 1500, date: d(1, 9), priority: 'média', monthly: 600 }];
  return { accounts, cards, transactions: t, categories: cats, budgets: [], goals, meta: { demo: true, monthlyBudget: 0 } };
}

const SUBS = {
  dashboard: 'O que vence e o que falta pagar no período escolhido',
  lancamentos: 'O que pagar na 1ª e na 2ª quinzena',
  cartoes: 'Compras de cada fatura, mês a mês',
  investimentos: 'Onde seu dinheiro está guardado',
  compras: 'O que falta comprar — vocês dois veem a mesma lista',
  anual: 'Comparativo mês a mês por categoria',
  metas: 'Objetivos conjuntos e individuais',
  config: 'Cartões, contas, categorias, acesso e backup',
};

const NAV = [
  ['dashboard', 'Painel', 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z'],
  ['lancamentos', 'Lançamentos', 'M12 5v14M5 12h14'],
  ['cartoes', 'Cartões', 'M2 6h20v12H2zM2 10h20'],
  ['anual', 'Relatório anual', 'M4 20V4M4 20h16M8 17V9M13 17v-5M18 17V6'],
  ['metas', 'Metas', 'M12 21s7-5.2 7-10.6A7 7 0 005 10.4C5 15.8 12 21 12 21zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z'],
  ['investimentos', 'Investimentos', 'M4 19h16M7 16V10m5 6V5m5 11v-8'],
  ['compras', 'Lista de compras', 'M5 6h15l-1.4 9.4a2 2 0 01-2 1.6H8.4a2 2 0 01-2-1.6L5 6zm0 0L4.4 3H2m6 17.5a1 1 0 100 .01M16 20.5a1 1 0 100 .01'],
  ['config', 'Configurações', 'M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM3.5 12h2m13 0h2M12 3.5v2m0 13v2M5.9 5.9l1.4 1.4m9.4 9.4l1.4 1.4m0-12.2l-1.4 1.4M7.3 16.7l-1.4 1.4'],
];

/* ===== camada de nuvem (Supabase) ===== */
window.SB = (window.FINCONFIG && window.FINCONFIG.url && window.FINCONFIG.anonKey && window.supabase)
  ? window.supabase.createClient(window.FINCONFIG.url, window.FINCONFIG.anonKey)
  : null;

const COLLECTIONS = ['accounts', 'cards', 'transactions', 'categories', 'budgets', 'goals', 'investments', 'shopping'];

/* arredonda para centavos — evita "R$ 53,85" onde a soma das linhas dá 53,86 */
const c2 = n => Math.round((Number(n) || 0) * 100) / 100;

function normalizeDoc(d) {
  const out = Object.assign(emptyData(), (d && typeof d === 'object') ? d : {});
  COLLECTIONS.forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
  if (!out.categories.length) out.categories = DEFAULT_CATS.map(c => ({ ...c }));
  if (!out.meta || typeof out.meta !== 'object') out.meta = { demo: false, monthlyBudget: 0 };
  return out;
}

/* união por id — usada quando duas pessoas salvam ao mesmo tempo */
function mergeDocs(remote, mine) {
  const out = { ...remote, ...mine, meta: { ...(remote.meta || {}), ...(mine.meta || {}) } };
  COLLECTIONS.forEach(k => {
    const byId = new Map();
    (remote[k] || []).forEach(x => x && x.id && byId.set(x.id, x));
    (mine[k] || []).forEach(x => x && x.id && byId.set(x.id, x));
    out[k] = [...byId.values()];
  });
  return out;
}

/* backup antigo: os donos eram ids do navegador, aqui viram ids do Supabase */
function remapOwners(doc, users, myId) {
  const known = new Set((users || []).map(u => u.id));
  const keys = ['transactions', 'accounts', 'cards', 'goals'];
  const legacy = [];
  keys.forEach(k => (doc[k] || []).forEach(x => { if (x && x.owner && !known.has(x.owner) && legacy.indexOf(x.owner) < 0) legacy.push(x.owner); }));
  if (!legacy.length) return doc;
  const others = (users || []).filter(u => u.id !== myId).map(u => u.id);
  const map = {}; map[legacy[0]] = myId;
  legacy.slice(1).forEach((id, i) => { map[id] = others[i] || myId; });
  keys.forEach(k => { doc[k] = (doc[k] || []).map(x => (x && x.owner && map[x.owner]) ? { ...x, owner: map[x.owner] } : x); });
  return doc;
}

class Component extends React.Component {
  constructor(props) {
    super(props);
    let prefs;
    try { const r = localStorage.getItem(PREFS_KEY); prefs = r ? JSON.parse(r) : {}; } catch (e) { prefs = {}; }
    const data = emptyData();
    const auth = { users: [], currentId: null };
    if (!data.meta) data.meta = { demo: false, monthlyBudget: 0 };
    if (!data.goals) data.goals = [];
    const now = new Date();
    this.state = {
      data, view: 'dashboard', mobileNav: false,
      period: 'mes', from: now.toISOString().slice(0, 8) + '01', to: addM(now.toISOString().slice(0, 10), 3),
      auth, authForm: {}, authErr: '', authMsg: '', authBusy: false, booting: true, cloud: 'ok', rev: 0,
      hideValues: !!prefs.hideValues, motion: prefs.motion || 'full', fontSize: prefs.fontSize || 16,
      theme: prefs.theme || 'light',
      month: now.toISOString().slice(0, 7), year: now.getFullYear(),
      source: 'all', search: '', txType: 'all', quem: 'all',
      modal: null, form: {}, confirm: null, toast: null,
    };
    this._charts = {}; this._sig = '';
  }
  componentDidMount() {
    this.applyPrefs(); this.boot();
    // o layout decide entre celular e computador pela largura: refaz ao girar a tela
    this._onResize = () => { clearTimeout(this._rz); this._rz = setTimeout(() => this.forceUpdate(), 150); };
    window.addEventListener('resize', this._onResize);
  }
  componentWillUnmount() {
    clearTimeout(this._push); clearTimeout(this._rz); clearInterval(this._poll);
    if (this._onFocus) window.removeEventListener('focus', this._onFocus);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
  }
  componentDidUpdate() { this.applyPrefs(); this.syncCharts(); }
  garanteCSS() {
    if (document.getElementById('fin-tema')) return;
    const s = document.createElement('style');
    s.id = 'fin-tema';
    s.textContent = `
      :root{--surface:#fff;--surface-soft:rgba(255,255,255,.7);--track:var(--track);--track-strong:var(--track-strong);--line-dash:var(--line-dash)}
      :root[data-theme="dark"]{
        --bg:#14171C;--card:rgba(30,34,41,.82);--card-2:rgba(36,40,48,.96);--stroke:rgba(255,255,255,.10);
        --ink:#E6E8EC;--muted:#98A0AC;--pink:#6E747F;--pink-deep:#C6CBD3;--pink-soft:rgba(255,255,255,.07);
        --coral:#7E848E;--mustard:#B0A98F;--plum:#A9B0BB;
        --pos:#5FB98C;--pos-bg:rgba(95,185,140,.16);--neg:#E88178;--neg-bg:rgba(232,129,120,.16);
        --warn:#D6B173;--warn-bg:rgba(214,177,115,.16);--shadow:0 12px 32px rgba(0,0,0,.45);
        --surface:#1E222A;--surface-soft:rgba(255,255,255,.05);--track:rgba(255,255,255,.12);
        --track-strong:rgba(255,255,255,.24);--line-dash:rgba(255,255,255,.28);color-scheme:dark}
      :root[data-theme="dark"] #groovy-root{background:var(--bg)}
      :root[data-theme="dark"] ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.22)}
    `;
    document.head.appendChild(s);
  }
  applyPrefs() {
    this.garanteCSS();
    const r = document.documentElement;
    r.setAttribute('data-theme', this.state.theme === 'dark' ? 'dark' : 'light');
    r.setAttribute('data-motion', this.state.motion === 'reduced' ? 'reduced' : 'full');
    r.style.setProperty('--fs', this.state.fontSize + 'px');
    const a = this.props.accent;
    if (a) { r.style.setProperty('--pink', a); }
  }
  save(data, cb) {
    const D = this.state.data, me = this.me;
    const full = { ...D, ...data };
    if (me) ['transactions', 'accounts', 'cards', 'goals', 'investments'].forEach(k => {
      const hidden = (D[k] || []).filter(x => !this.mine(x));
      const shown = (data[k] || []).filter(x => !x._foreign).map(x => x.owner ? x : { ...x, owner: me.id });
      full[k] = [...shown, ...hidden];
    });
    this.setState({ data: full }, () => { this.queuePush(); cb && cb(); });
  }
  /* ===== usuários e acesso ===== */
  get me() { const a = this.state.auth; return a.users.find(u => u.id === a.currentId) || null; }
  otherUser() { const a = this.state.auth; return a.users.find(u => u.id !== a.currentId) || null; }
  saveAuth(auth, cb) { this.setState({ auth }, () => { cb && cb(); }); }
  mine(x) { const me = this.me; if (!me) return true; if (x.split || x.shared) return true; return (x.owner || me.id) === me.id; }
  /* Uma conta pode ser minha, do parceiro (lançada por qualquer um dos dois) ou
     dividida 50/50. `owner` diz de quem ela é; `shared` deixa os dois enxergarem. */
  isForOther(t) { const me = this.me; return !!(me && t && t.owner && t.owner !== me.id && !t.split); }
  ownerName(t) { const o = (this.state.auth.users || []).find(u => u.id === t.owner); return (o && o.name) || this.partner(); }
  /* Quem pagou, como id de usuário. Lançamentos antigos guardavam 'eu'/'parceiro'
     em relação a quem lançou — aqui isso é convertido. */
  payerOf(t) {
    const me = this.me; if (!me) return '';
    if (t.card) {                                  // compra no cartão: quem paga a fatura é o dono do cartão
      const c = this.card(t.card);
      if (c) return this.cartaoMeu(c) ? me.id : ((this.otherUser() || {}).id || '');
    }
    if (t.payerId) return t.payerId;
    const criador = t.owner || me.id;
    const outro = criador === me.id ? ((this.otherUser() || {}).id || '') : me.id;
    return (t.payer || 'eu') === 'eu' ? criador : outro;
  }
  paidByMe(t) { const me = this.me; return !me || this.payerOf(t) === me.id; }
  /* ===== Supabase: sessão, dados e sincronização ===== */
  async boot() {
    if (!window.SB) return this.setState({ booting: false, authErr: 'Faltam as chaves do Supabase no arquivo config.js.' });
    window.SB.auth.onAuthStateChange((evt, s) => {
      if (evt === 'PASSWORD_RECOVERY') this.setState({ modal: { type: 'pw' }, form: {}, recovery: true });
    });
    let session = null;
    try { session = (await window.SB.auth.getSession()).data.session; } catch (e) {}
    if (!session) return this.setState({ booting: false });
    await this.afterLogin(session);
  }
  async afterLogin(session) {
    this.setState({ booting: true, authErr: '', authMsg: '' });
    const ok = await this.loadCloud(session);
    this.setState({ booting: false, authForm: {}, authBusy: false });
    if (ok) { this.setState({ view: 'dashboard' }); this.startPolling(); }
  }
  async loadCloud(session) {
    const myId = session.user.id, myMail = session.user.email || '';
    const mem = await window.SB.from('membros').select('user_id,nome,email');
    if (mem.error) { await window.SB.auth.signOut(); return this.setState({ authErr: 'Não consegui ler a lista de usuários: ' + mem.error.message }), false; }
    const users = (mem.data || []).map(m => ({ id: m.user_id, name: m.nome || (m.email || '').split('@')[0] || 'Você', login: m.email || '' }));
    if (!users.some(u => u.id === myId)) users.push({ id: myId, name: ((session.user.user_metadata || {}).nome) || myMail.split('@')[0] || 'Você', login: myMail });
    const row = await window.SB.from('cofre').select('rev,dados').eq('id', 'casa').maybeSingle();
    if (row.error) { await window.SB.auth.signOut(); return this.setState({ authErr: 'Não consegui abrir seus dados: ' + row.error.message }), false; }
    let data, rev;
    if (!row.data) {
      const ins = await window.SB.from('cofre').insert({ id: 'casa', dados: emptyData(), rev: 1, updated_by: myId }).select('rev,dados').single();
      if (ins.error) { await window.SB.auth.signOut(); return this.setState({ authErr: 'Não consegui criar seus dados: ' + ins.error.message }), false; }
      data = ins.data.dados; rev = ins.data.rev;
    } else { data = row.data.dados; rev = row.data.rev; }
    this.setState({ data: normalizeDoc(data), rev, cloud: 'ok', auth: { users, currentId: myId } });
    return true;
  }
  queuePush() {
    clearTimeout(this._push);
    this.setState({ cloud: 'saving' });
    this._push = setTimeout(() => { this._push = null; this.pushCloud(); }, 700);
  }
  async pushCloud() {
    const me = this.me; if (!me || !window.SB) return;
    const snap = this.state.data, rev = this.state.rev;
    const r = await window.SB.from('cofre')
      .update({ dados: snap, rev: rev + 1, updated_by: me.id, updated_at: new Date().toISOString() })
      .eq('id', 'casa').eq('rev', rev).select('rev').maybeSingle();
    if (r.error) { this.setState({ cloud: 'err' }); return this.toast('Não consegui salvar na nuvem', 'err'); }
    if (!r.data) return this.mergeRemote(snap);
    this.setState({ rev: r.data.rev, cloud: 'ok' });
  }
  async mergeRemote(mine) {
    const row = await window.SB.from('cofre').select('rev,dados').eq('id', 'casa').maybeSingle();
    if (row.error || !row.data) { this.setState({ cloud: 'err' }); return this.toast('Não consegui salvar — recarregue a página', 'err'); }
    const merged = mergeDocs(normalizeDoc(row.data.dados), mine);
    const r2 = await window.SB.from('cofre')
      .update({ dados: merged, rev: row.data.rev + 1, updated_by: this.me.id, updated_at: new Date().toISOString() })
      .eq('id', 'casa').eq('rev', row.data.rev).select('rev').maybeSingle();
    if (r2.error || !r2.data) { this.setState({ cloud: 'err' }); return this.toast('Alguém salvou ao mesmo tempo — recarregue a página', 'err'); }
    this.setState({ data: merged, rev: r2.data.rev, cloud: 'ok' });
    this.toast('Dados combinados com o outro dispositivo', 'warn');
  }
  startPolling() {
    const tick = async () => {
      if (!this.me || !window.SB || this._push || document.hidden) return;
      const r = await window.SB.from('cofre').select('rev,dados,updated_by').eq('id', 'casa').maybeSingle();
      if (r.error || !r.data || r.data.rev === this.state.rev) return;
      if (r.data.updated_by === this.me.id) return this.setState({ rev: r.data.rev });
      this.setState({ data: normalizeDoc(r.data.dados), rev: r.data.rev });
      const who = (this.state.auth.users.find(u => u.id === r.data.updated_by) || {}).name;
      this.toast(who ? 'Atualizado por ' + who.split(' ')[0] : 'Dados atualizados');
    };
    if (!this._poll) this._poll = setInterval(tick, 15000);
    if (!this._onFocus) { this._onFocus = () => tick(); window.addEventListener('focus', this._onFocus); }
  }
  /* ===== entrar, sair, senha ===== */
  async doLogin() {
    const f = this.state.authForm, email = (f.login || '').trim().toLowerCase();
    if (!email || !f.pass) return this.setState({ authErr: 'Preencha e-mail e senha.' });
    if (!window.SB) return this.setState({ authErr: 'Faltam as chaves do Supabase no arquivo config.js.' });
    this.setState({ authBusy: true, authErr: '', authMsg: '' });
    const { data, error } = await window.SB.auth.signInWithPassword({ email, password: f.pass });
    if (error) return this.setState({ authBusy: false, authErr: /Invalid login/i.test(error.message) ? 'E-mail ou senha incorretos.' : error.message });
    await this.afterLogin(data.session);
  }
  async sendReset() {
    const email = (this.state.authForm.login || '').trim().toLowerCase();
    if (!email) return this.setState({ authErr: 'Escreva seu e-mail primeiro.' });
    this.setState({ authBusy: true, authErr: '', authMsg: '' });
    const { error } = await window.SB.auth.resetPasswordForEmail(email, { redirectTo: window.location.href.split('#')[0] });
    this.setState({ authBusy: false, authErr: error ? error.message : '', authMsg: error ? '' : 'Enviei um link para ' + email + '. Abra o e-mail para criar uma senha nova.' });
  }
  async logout() {
    clearTimeout(this._push);
    try { await window.SB.auth.signOut(); } catch (e) {}
    this.setState({ auth: { users: [], currentId: null }, data: emptyData(), rev: 0, cloud: 'ok', authForm: {}, authErr: '', authMsg: '', mobileNav: false, modal: null, view: 'dashboard' });
  }
  async changePw() {
    const f = this.state.form;
    if ((f.pass || '').length < 8) return this.toast('A senha precisa ter 8 caracteres ou mais', 'err');
    if (f.pass !== f.pass2) return this.toast('As senhas não são iguais', 'err');
    const { error } = await window.SB.auth.updateUser({ password: f.pass });
    if (error) return this.toast(error.message, 'err');
    this.setState({ modal: null, recovery: false });
    this.toast('Senha alterada');
  }
  delUser(u) {
    const other = this.state.auth.users.find(x => x.id !== u.id);
    this.setState({ confirm: { danger: true, msg: `Apagar os lançamentos, cartões e metas que são só de ${u.name}? O que está marcado como dividido fica com quem sobrar. O acesso continua valendo — para tirar o acesso, remova a pessoa no painel do Supabase.`, onYes: () => {
      const D = this.state.data;
      const fix = arr => (arr || []).filter(x => x.owner !== u.id || x.split || x.shared).map(x => (x.owner === u.id && other) ? { ...x, owner: other.id } : x);
      const data = { ...D, transactions: fix(D.transactions), accounts: fix(D.accounts), cards: fix(D.cards), goals: fix(D.goals) };
      this.setState({ data, confirm: null, modal: null }, () => { this.queuePush(); this.toast('Dados apagados', 'warn'); });
    } } });
  }
  resetAll() {
    this.setState({ confirm: { danger: true, msg: 'Apagar TODOS os dados da nuvem, inclusive os da outra pessoa? Faça um backup antes — não tem como desfazer. Os acessos continuam valendo.', onYes: () => {
      this.setState({ data: emptyData(), confirm: null, modal: null }, () => { this.queuePush(); this.toast('Tudo apagado', 'warn'); });
    } } });
  }
  cloudChip() {
    const map = { saving: ['Salvando…', 'var(--warn)'], ok: ['Salvo na nuvem', 'var(--pos)'], err: ['Falha ao salvar', 'var(--neg)'] };
    const [txt, col] = map[this.state.cloud] || map.ok;
    const narrow = typeof window !== 'undefined' && window.innerWidth < 900;
    return h('span', { title: txt, style: { display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '.72rem', fontWeight: 700, color: col, whiteSpace: 'nowrap' } },
      h('span', { style: { width: '8px', height: '8px', borderRadius: '50%', background: col, flexShrink: 0 } }), narrow ? '' : txt);
  }
  savePrefs(patch) { this.setState(patch, () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify({ hideValues: this.state.hideValues, motion: this.state.motion, fontSize: this.state.fontSize, theme: this.state.theme })); } catch (e) {} }); }
  toast(msg, kind = 'ok') { this.setState({ toast: { msg, kind, id: uid() } }); clearTimeout(this._t); this._t = setTimeout(() => this.setState({ toast: null }), 2600); }
  m(v) { return this.state.hideValues ? '••••' : v; }

  get d() {
    const D = this.state.data;
    if (!this.me) return D;
    const f = arr => (arr || []).filter(x => this.mine(x));
    const txs = f(D.transactions);
    const need = new Set(txs.map(t => t.card).filter(Boolean));
    const cards = (D.cards || []).filter(c => this.mine(c) || need.has(c.id)).map(c => this.mine(c) ? c : { ...c, _foreign: true });
    return { ...D, transactions: txs, accounts: f(D.accounts), cards, goals: f(D.goals), investments: f(D.investments), shopping: D.shopping || [] };
  }
  cat(id) { return this.d.categories.find(c => c.id === id); }
  catName(id) { const c = this.cat(id); return c ? c.name : 'Sem categoria'; }
  catColor(id) { const c = this.cat(id); return c ? c.color : 'var(--muted)'; }
  card(id) { return this.d.cards.find(c => c.id === id); }
  acc(id) { return this.d.accounts.find(a => a.id === id); }
  isDone(t) { return t.status === 'pago' || t.status === 'recebido'; }
  partner() { const o = this.otherUser(); return (o && o.name) || (this.d.meta && this.d.meta.partnerName) || 'Parceiro(a)'; }
  // divisão de despesas com o parceiro
  /* Metade em centavos inteiros. Quando o total é ímpar em centavos, o centavo
     que sobra fica com quem lançou — os dois lados calculam igual, então as
     duas partes sempre somam exatamente o total. */
  metade(t) {
    const cent = Math.round((t.value || 0) * 100);
    const cima = Math.ceil(cent / 2);
    const me = this.me;
    const donoSouEu = !me || !t.owner || t.owner === me.id;
    return (donoSouEu ? cima : cent - cima) / 100;
  }
  outraMetade(t) { return (Math.round((t.value || 0) * 100) - Math.round(this.metade(t) * 100)) / 100; }
  /* Quanto desta conta é despesa minha: metade se dividida, nada se for do parceiro. */
  myShare(t) {
    if (t.isFatura) return c2(t.value);   // a fatura inteira sai da sua conta; a parte dele volta no acerto
    if (t.split) return this.metade(t);
    return this.isForOther(t) ? 0 : c2(t.value);
  }
  /* Quanto o parceiro me deve por causa desta conta. */
  credit(t) {
    if (t.isFatura) return c2(t.creditVal || 0);
    if (t.type !== 'despesa' || !this.paidByMe(t)) return 0;
    if (t.split) return this.outraMetade(t);
    return this.isForOther(t) ? c2(t.value) : 0;  // conta dele que eu paguei
  }
  /* Quanto eu devo ao parceiro por causa desta conta. */
  debt(t) {
    if (t.isFatura) return c2(t.debtVal || 0);
    if (t.type !== 'despesa' || this.paidByMe(t)) return 0;
    if (t.split) return this.outraMetade(t);
    return this.isForOther(t) ? 0 : c2(t.value);  // conta minha que ele pagou
  }
  settlement(month) {
    const items = this.monthItems(month);
    let receber = 0, pagar = 0;
    items.forEach(i => { receber += this.credit(i); pagar += this.debt(i); });
    receber = c2(receber); pagar = c2(pagar);
    return { receber, pagar, saldo: c2(receber - pagar) };
  }

  /* ===== derivações ===== */
  balances() {
    const b = {}; this.d.accounts.forEach(a => b[a.id] = a.balance || 0);
    this.d.transactions.forEach(t => {
      if (!t.account || !(t.account in b)) return;
      if (this.isForOther(t)) return;                       // conta do parceiro não mexe no meu saldo
      if (t.type === 'receita' && t.status === 'recebido') b[t.account] += t.value;
      // saiu do meu bolso o valor cheio que EU paguei (a parte dele volta no acerto)
      if (t.type === 'despesa' && t.status === 'pago' && this.paidByMe(t)) b[t.account] -= t.value;
    });
    return b;
  }
  totalBalance() { const b = this.balances(); return Object.values(b).reduce((s, v) => s + v, 0); }

  // faturas de cartão agregadas por cartão/mês
  /* Em qual fatura a compra cai. A fatura fecha no dia `closeDay`: compras
     até esse dia entram nela, depois disso vão para a seguinte. O vencimento
     é o dia `dueDay` — no mesmo mês do fechamento, ou no mês seguinte quando
     o cartão vence antes de fechar. Devolve a data ISO do vencimento. */
  /* Vencimento da fatura de um mês (YYYY-MM) deste cartão. */
  vencFatura(card, monthKey) {
    const due = Math.max(1, parseInt(card && card.dueDay) || 10);
    const [y, m] = monthKey.split('-').map(Number);
    const dd = Math.min(due, new Date(y, m, 0).getDate());
    return `${y}-${String(m).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }
  /* Em qual fatura a compra está: a escolhida no lançamento; se não houver,
     a sugerida pela data da compra. */
  faturaMesDe(t) {
    const c = this.card(t.card);
    if (t.faturaMes) return t.faturaMes;
    return c ? mk(this.faturaDue(c, t.dueDate || t.date)) : mk(t.dueDate || t.date);
  }
  faturaDue(card, iso) {
    const close = Math.max(1, parseInt(card && card.closeDay) || 1);
    const due = Math.max(1, parseInt(card && card.dueDay) || 10);
    const [y, m, d] = (iso || todayISO()).split('-').map(Number);
    let shift = 0;
    if (d > close) shift += 1;      // comprou depois de fechar → entra na próxima fatura
    if (due <= close) shift += 1;   // vence antes de fechar → paga no mês seguinte
    const ref = new Date(y, (m - 1) + shift, 1);
    const Y = ref.getFullYear(), M = ref.getMonth() + 1;
    const dd = Math.min(due, new Date(Y, M, 0).getDate());
    return `${Y}-${String(M).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }
  /* Último dia de compra que ainda entra na fatura que vence em `monthKey`. */
  faturaClose(card, monthKey) {
    const close = Math.max(1, parseInt(card && card.closeDay) || 1);
    const due = Math.max(1, parseInt(card && card.dueDay) || 10);
    const [y, m] = monthKey.split('-').map(Number);
    const ref = new Date(y, (m - 1) - (due <= close ? 1 : 0), 1);
    const Y = ref.getFullYear(), M = ref.getMonth() + 1;
    const dd = Math.min(close, new Date(Y, M, 0).getDate());
    return `${Y}-${String(M).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
  }
  /* Compras que compõem a fatura que vence no mês `monthKey`. */
  comprasDaFatura(card, monthKey) {
    return [...this.d.transactions, ...this.recCartao(monthKey)]
      .filter(t => t.card === card.id && t.type === 'despesa' && this.faturaMesDe(t) === monthKey)
      .sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date));
  }
  /* Cartão é meu quando não tem dono ou o dono sou eu — mesmo que esteja
     compartilhado para os dois enxergarem o limite. */
  cartaoMeu(c) { const me = this.me; return !!c && !c._foreign && (!c.owner || !me || c.owner === me.id); }
  meusCartoes() { return (this.d.cards || []).filter(c => this.cartaoMeu(c)); }
  /* O cartão do parceiro não é assunto meu: mostro só que foi no cartão dele. */
  origemLabel(t) {
    if (!t.card) return t.payMethod || '';
    const c = this.card(t.card);
    if (!c) return t.payMethod || '';
    return this.cartaoMeu(c) ? c.name : 'cartão de ' + this.partner().split(' ')[0];
  }
  realTx(i) { return (i && i._srcId) ? (this.d.transactions.find(t => t.id === i._srcId) || i) : i; }
  /* Compras no cartão do parceiro que me dizem respeito: entram como linha
     avulsa no mês em que a fatura dele vence — sem mostrar o cartão dele. */
  comprasNoCartaoDoOutro(month) {
    return this.d.transactions.filter(t => {
      if (!t.card || t.type !== 'despesa') return false;
      const c = this.card(t.card);
      return !!(c && !this.cartaoMeu(c) && this.faturaMesDe(t) === month);
    }).map(t => {
      const c = this.card(t.card);
      const venc = this.vencFatura(c, this.faturaMesDe(t));
      return { ...t, _srcId: t.id, _realDue: t.dueDate, _noCartaoDoOutro: true, dueDate: venc };
    });
  }
  /* Compras recorrentes no cartão: as repetições futuras precisam cair nas
     faturas dos próximos meses, senão a assinatura some depois do 1º mês. */
  recCartao(mesFatura) {
    const vistos = new Set(), out = [];
    [-2, -1, 0, 1].forEach(off => {
      this.recFor(mk(addM(mesFatura + '-01', off)), true).forEach(r => {
        if (r.card && !vistos.has(r.id)) { vistos.add(r.id); out.push(r); }
      });
    });
    return out;
  }
  faturas(extras) {
    const groups = {};
    [...this.d.transactions, ...(extras || [])].filter(t => t.type === 'despesa' && t.card).forEach(t => {
      const c = this.card(t.card); if (!c || !this.cartaoMeu(c)) return;
      const mes = this.faturaMesDe(t);
      const k = t.card + '|' + mes;
      (groups[k] = groups[k] || { card: c, key: mes, due: this.vencFatura(c, mes), txs: [] }).txs.push(t);
    });
    return Object.values(groups).map(g => {
      const due = g.due;
      const total = g.txs.reduce((a, t) => a + t.value, 0);
      const mine = g.txs.reduce((a, t) => a + this.myShare(t), 0);
      const cred = g.txs.reduce((a, t) => a + this.credit(t), 0);
      const deb = g.txs.reduce((a, t) => a + this.debt(t), 0);
      return { id: 'fat|' + g.card.id + '|' + g.key, isFatura: true, cardRef: g.card, monthKey: g.key, txIds: g.txs.map(t => t.id), count: g.txs.length, type: 'despesa', desc: 'Fatura ' + g.card.name, category: catIdOf(this.d.categories, 'Dívidas'), value: total, myValue: mine, creditVal: cred, debtVal: deb, split: mine !== total, date: due, dueDate: due, status: g.txs.every(t => t.status === 'pago') ? 'pago' : 'pendente', payMethod: 'Cartão' };
    });
  }
  // ocorrências futuras de recorrentes (virtuais), dentro de um mês alvo
  recFor(monthKeyTarget, comCartao) {
    const out = [];
    const step = { mensal: 1, anual: 12 };
    this.d.transactions.filter(t => t.recurring && !t.recSource && (comCartao ? !!t.card : !t.card)).forEach(src => {
      const anchor = src.dueDate || src.date;
      if (mk(anchor) >= monthKeyTarget) return;
      if (src.recurring === 'semanal') {
        for (let i = 1; i <= 260; i++) {
          const dt = new Date(anchor + 'T12:00:00'); dt.setDate(dt.getDate() + 7 * i);
          const iso = dt.toISOString().slice(0, 10);
          if (mk(iso) > monthKeyTarget) break;
          if (mk(iso) === monthKeyTarget && !this.recDone(src.id, monthKeyTarget, iso)) out.push(this.recVirt(src, iso));
        }
      } else {
        const s = step[src.recurring] || 1;
        for (let i = 1; i <= 130; i++) {
          const iso = addM(anchor, i * s);
          if (mk(iso) > monthKeyTarget) break;
          if (mk(iso) === monthKeyTarget && !this.recDone(src.id, monthKeyTarget)) out.push(this.recVirt(src, iso));
        }
      }
    });
    return out;
  }
  recDone(srcId, month, iso) { return this.d.transactions.some(t => t.recSource === srcId && (iso ? (t.dueDate || t.date) === iso : mk(t.dueDate || t.date) === month)); }
  recVirt(src, iso) {
    const v = { ...src, id: 'rec|' + src.id + '|' + iso, isRec: true, recSrcId: src.id, date: iso, dueDate: iso, payDate: '', status: src.type === 'receita' ? 'a receber' : 'pendente' };
    if (src.card && src.faturaMes) {
      const de = mk(src.dueDate || src.date), para = mk(iso);
      const meses = (+para.slice(0, 4) - +de.slice(0, 4)) * 12 + (+para.slice(5) - +de.slice(5));
      v.faturaMes = mk(addM(src.faturaMes + '-01', meses));
    }
    return v;
  }

  // período selecionado no painel
  monthKeysBetween(a, b) { const out = []; let k = mk(a); const end = mk(b); let g = 0; while (k <= end && g++ < 400) { out.push(k); k = mk(addM(k + '-01', 1)); } return out; }
  rangeItems(from, to) {
    const seen = new Set(), out = [];
    this.monthKeysBetween(from, to).forEach(k => this.monthItems(k).forEach(i => {
      const dt = i.dueDate || i.date;
      if (dt < from || dt > to || seen.has(i.id)) return;
      seen.add(i.id); out.push(i);
    }));
    return out.sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date));
  }
  periodRange() {
    const st = this.state;
    if (st.period === 'ano') return { from: st.year + '-01-01', to: st.year + '-12-31', label: 'Ano de ' + st.year };
    if (st.period === 'custom') {
      const from = st.from, to = st.to < st.from ? st.from : st.to;
      return { from, to, label: isoBR(from) + ' a ' + isoBR(to) };
    }
    const [y, m] = st.month.split('-');
    return { from: st.month + '-01', to: st.month + '-' + String(new Date(+y, +m, 0).getDate()), label: mkLong(st.month) };
  }
  // tudo que cai num mês (planejamento mensal)
  monthItems(month) {
    const real = this.d.transactions.filter(t => !t.card && mk(t.dueDate || t.date) === month);
    const fats = this.faturas(this.recCartao(month)).filter(f => mk(f.dueDate) === month);
    const outro = this.comprasNoCartaoDoOutro(month);
    const recs = this.recFor(month);
    return [...real, ...fats, ...outro, ...recs].sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date));
  }

  /* ===== ações ===== */
  openTx(mode, tx) {
    const base = { desc: '', value: 0, type: 'despesa', category: '', date: todayISO(), dueDate: '', payMethod: 'Pix', card: '', faturaMes: '', account: this.d.accounts[0] ? this.d.accounts[0].id : '', status: 'pendente', recurring: '', installments: '', installment: '', notes: '', tags: [], subcategory: '', quinzena: '', split: false, payer: 'eu', dono: 'me', payerId: (this.me || {}).id || '', more: false };
    const form = mode === 'edit' && tx
      ? { ...base, ...tx, tags: tx.tags || [], dueDate: tx._realDue || tx.dueDate, dono: tx.split ? 'split' : (this.isForOther(tx) ? 'other' : 'me'), payerId: this.payerOf(tx), more: true }
      : base;
    this.setState({ modal: { type: 'tx', mode }, form });
  }
  setF(p) { this.setState({ form: { ...this.state.form, ...p } }); }
  saveTx() {
    const f = this.state.form;
    if (!f.desc || !f.desc.trim()) return this.toast('Escreve uma descrição', 'err');
    if (!f.value || f.value <= 0) return this.toast('Coloca o valor', 'err');
    if (!f.date) return this.toast('Escolhe a data', 'err');
    const me = this.me, outro = this.otherUser();
    const clean = o => {
      const c = { ...o }; delete c.more;
      Object.keys(c).forEach(k => { if (k.charAt(0) === '_') delete c[k]; });
      if (c.payMethod !== 'Cartão') c.card = '';
      if (!c.dueDate) c.dueDate = c.date;
      // "de quem é" vira dono + visibilidade
      const dono = c.dono; delete c.dono;
      if (dono === 'other' && outro) { c.owner = outro.id; c.shared = true; c.split = false; }
      else if (dono === 'split') { c.split = true; c.shared = false; c.owner = o.owner || (me || {}).id; }
      else { c.split = false; c.shared = false; c.owner = (me || {}).id; }
      if (c.payMethod === 'Cartão' && c.card) {
        const cartao = this.card(c.card);
        if (!c.faturaMes && cartao) c.faturaMes = mk(this.faturaDue(cartao, c.dueDate || c.date));
      } else c.faturaMes = '';
      if (!c.payerId) c.payerId = (me || {}).id || '';
      delete c.payer;
      return c;
    };
    const data = { ...this.d, transactions: [...this.d.transactions] };
    if (this.state.modal.mode === 'edit') {
      const i = data.transactions.findIndex(t => t.id === f.id);
      data.transactions[i] = clean(f);
      this.save(data, () => this.toast('Atualizado'));
    } else {
      const n = parseInt(f.installments);
      if (n > 1 && f.payMethod === 'Cartão' && f.card) {
        const grp = uid(), per = Math.round((f.value / n) * 100) / 100;
        for (let i = 1; i <= n; i++) data.transactions.push(clean({ ...f, id: uid(), value: per, date: addM(f.date, i - 1), dueDate: addM(f.dueDate || f.date, i - 1), faturaMes: f.faturaMes ? mk(addM(f.faturaMes + '-01', i - 1)) : '', installment: i, installments: n, installmentGroup: grp, status: i === 1 ? f.status : 'agendado' }));
        this.save(data, () => this.toast(`${n} parcelas lançadas`));
      } else {
        data.transactions.push(clean({ ...f, id: uid() }));
        this.save(data, () => this.toast('Lançado!'));
      }
    }
    this.setState({ modal: null });
  }
  delTx(id) { this.setState({ confirm: { msg: 'Excluir este lançamento?', onYes: () => { this.save({ ...this.d, transactions: this.d.transactions.filter(t => t.id !== id) }, () => this.toast('Excluído', 'warn')); this.setState({ confirm: null }); } } }); }
  dupTx(t) { this.save({ ...this.d, transactions: [...this.d.transactions, { ...t, id: uid(), desc: t.desc + ' (cópia)', status: 'pendente' }] }, () => this.toast('Duplicado')); }

  toggleDone(item) {
    if (item.isFatura) {
      if (item.status === 'pago') { this.save({ ...this.d, transactions: this.d.transactions.map(x => item.txIds.includes(x.id) ? { ...x, status: 'pendente', payDate: '' } : x) }, () => this.toast('Fatura reaberta', 'warn')); }
      else {
        const conta = item.cardRef.payAccount || (this.d.accounts[0] || {}).id || '';
        this.save({ ...this.d, transactions: this.d.transactions.map(x => item.txIds.includes(x.id) ? { ...x, status: 'pago', account: conta, payDate: todayISO() } : x) }, () => this.toast('Fatura paga!'));
      }
      return;
    }
    const conta = item.account || (this.d.accounts[0] || {}).id || '';
    if (item.isRec) {
      const real = { ...item, id: uid(), recSource: item.recSrcId, recurring: '', status: item.type === 'receita' ? 'recebido' : 'pago', account: conta, payDate: todayISO() };
      delete real.isRec; delete real.recSrcId;
      this.save({ ...this.d, transactions: [...this.d.transactions, real] }, () => this.toast(item.type === 'receita' ? 'Recebido!' : 'Pago!'));
      return;
    }
    if (this.isDone(item)) { this.save({ ...this.d, transactions: this.d.transactions.map(x => x.id === item.id ? { ...x, status: 'pendente', payDate: '' } : x) }, () => this.toast('Reaberto', 'warn')); return; }
    this.save({ ...this.d, transactions: this.d.transactions.map(x => x.id === item.id ? { ...x, status: item.type === 'receita' ? 'recebido' : 'pago', account: conta, payDate: todayISO() } : x) },
      () => this.toast(item.type === 'receita' ? 'Recebido!' : 'Pago!'));
  }
  confirmPay() {
    const it = this.state.modal.payload, accId = this.state.form.account;
    let data;
    if (it.isFatura) data = { ...this.d, transactions: this.d.transactions.map(x => it.txIds.includes(x.id) ? { ...x, status: 'pago', account: accId, payDate: todayISO() } : x) };
    else if (it.isRec) { const real = { ...it, id: uid(), recSource: it.recSrcId, recurring: '', status: it.type === 'receita' ? 'recebido' : 'pago', account: accId, payDate: todayISO() }; delete real.isRec; delete real.recSrcId; data = { ...this.d, transactions: [...this.d.transactions, real] }; }
    else data = { ...this.d, transactions: this.d.transactions.map(x => x.id === it.id ? { ...x, status: it.type === 'receita' ? 'recebido' : 'pago', account: accId, payDate: todayISO() } : x) };
    this.save(data, () => this.toast(it.type === 'receita' ? 'Recebido!' : 'Pago!'));
    this.setState({ modal: null });
  }

  /* ===== estilos ===== */
  glass(x = {}) { return { background: 'var(--card)', border: '1px solid var(--stroke)', borderRadius: 'var(--r)', boxShadow: 'var(--shadow)', ...x }; }
  btn(k = 'primary', x = {}) {
    const b = { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid transparent', cursor: 'pointer', fontWeight: 700, fontSize: '.9rem', whiteSpace: 'nowrap', transition: 'transform .15s,background .2s,box-shadow .2s', fontFamily: 'inherit' };
    if (k === 'primary') return { ...b, background: 'var(--pink)', color: '#fff', ...x };
    if (k === 'ghost') return { ...b, background: 'var(--card-2)', color: 'var(--ink)', border: '1px solid var(--stroke)', ...x };
    if (k === 'soft') return { ...b, background: 'var(--pink-soft)', color: 'var(--pink-deep)', ...x };
    return { ...b, ...x };
  }
  // adesivo decorativo (não interativo)
  stkSrc(name) { return (typeof window !== 'undefined' && window.__STICKERS && window.__STICKERS[name]) || 'stickers/' + name + '.png'; }
  stk(name, st = {}) { return h('img', { key: 'stk' + name, src: this.stkSrc(name), alt: '', 'aria-hidden': 'true', draggable: false, style: { position: 'absolute', pointerEvents: 'none', userSelect: 'none', filter: 'drop-shadow(0 4px 10px rgba(60,66,76,.2))', ...st } }); }
  ico(d, s = 20, x = {}) { return h('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style: x }, h('path', { d })); }
  inp(x = {}) { return { padding: '10px 13px', borderRadius: '10px', border: '1px solid var(--stroke)', background: 'var(--card-2)', color: 'var(--ink)', outline: 'none', width: '100%', ...x }; }
  disp(x = {}) { return { fontFamily: 'inherit', fontWeight: 700, letterSpacing: '-.018em', ...x }; }

  /* ===== render ===== */
  /* ---------- METAS: conjuntas x individuais ---------- */
  metasFiltradas() {
    const gs = this.d.goals || [];
    const aba = this.state.metaAba || 'todas';
    if (!this.otherUser() || aba === 'todas') return gs;
    return aba === 'conjuntas' ? gs.filter(g => g.shared) : gs.filter(g => !g.shared);
  }

  /* ---------- INVESTIMENTOS ---------- */
  openInv(mode, x) {
    const base = { name: '', place: '', kind: 'Renda fixa', value: 0, date: todayISO(), notes: '', shared: false };
    this.setState({ modal: { type: 'inv', mode }, form: mode === 'edit' && x ? { ...base, ...x } : base });
  }
  saveInv() {
    const f = this.state.form;
    if (!f.name) return this.toast('Dá um nome ao investimento', 'err');
    if (!f.value || f.value <= 0) return this.toast('Informe o valor', 'err');
    const inv = [...(this.d.investments || [])];
    if (this.state.modal.mode === 'edit') { const i = inv.findIndex(x => x.id === f.id); inv[i] = { ...f }; }
    else inv.push({ ...f, id: uid() });
    this.save({ ...this.d, investments: inv }, () => this.toast('Investimento salvo'));
    this.setState({ modal: null });
  }
  delInv(id) {
    this.setState({ confirm: { danger: true, msg: 'Excluir este investimento?', onYes: () => {
      this.save({ ...this.d, investments: (this.d.investments || []).filter(x => x.id !== id) }, () => this.toast('Excluído', 'warn'));
      this.setState({ confirm: null });
    } } });
  }
  viewInvestimentos() {
    const inv = this.d.investments || [];
    const total = inv.reduce((a, x) => a + (x.value || 0), 0);
    const porTipo = {};
    inv.forEach(x => { porTipo[x.kind || 'Outro'] = (porTipo[x.kind || 'Outro'] || 0) + (x.value || 0); });
    const tipos = Object.entries(porTipo).sort((a, b) => b[1] - a[1]);
    const maior = tipos.length ? tipos[0][1] : 1;
    const cores = { 'Renda fixa': 'var(--pos)', 'Renda variável': 'var(--plum)', 'Cripto': 'var(--warn)', 'Fundo': 'var(--coral)', 'Poupança': 'var(--pink)', 'Previdência': 'var(--mustard)', 'Outro': 'var(--muted)' };
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' } },
        this.stat('Total investido', total, 'var(--pos)'),
        this.stat('Aplicações', inv.length, 'var(--plum)'),
        this.stat('Maior posição', inv.reduce((a, x) => Math.max(a, x.value || 0), 0), 'var(--pink-deep)')),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } },
        h('button', { onClick: () => this.openInv('add'), style: this.btn('primary') }, this.ico('M12 5v14M5 12h14', 17), 'Novo investimento')),
      tipos.length > 0 && h('div', { style: this.glass({ padding: '20px 22px' }) }, this.head('Por tipo'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '11px' } }, ...tipos.map(([k, v]) => h('div', { key: k },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.83rem', fontWeight: 600, marginBottom: '5px' } },
            h('span', null, k), h('span', { style: { fontWeight: 700 } }, this.m(fmt(v)))),
          h('div', { style: { height: '9px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' } },
            h('div', { style: { width: (v / maior) * 100 + '%', height: '100%', background: cores[k] || 'var(--pink)', borderRadius: '999px' } })))))),
      inv.length === 0
        ? this.empty('Nenhum investimento anotado', 'Use esta aba como caixinha: anote onde seu dinheiro está guardado — CDB, tesouro, ações, cripto, poupança — e acompanhe o total.', h('button', { onClick: () => this.openInv('add'), style: this.btn('primary') }, 'Anotar o primeiro'), 'ticket')
        : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '14px' } }, ...inv.slice().sort((a, b) => (b.value || 0) - (a.value || 0)).map(x =>
          h('div', { key: x.id, style: this.glass({ padding: '18px 20px', borderLeft: '4px solid ' + (cores[x.kind] || 'var(--pink)') }) },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' } },
              h('div', { style: { minWidth: 0 } },
                h('div', { style: this.disp({ fontSize: '1rem' }) }, x.name),
                h('div', { style: { fontSize: '.75rem', color: 'var(--muted)', marginTop: '2px' } }, [x.place, x.kind].filter(Boolean).join(' · '))),
              h('div', { style: { display: 'flex', flexShrink: 0 } },
                h('button', { title: 'Editar', onClick: () => this.openInv('edit', x), style: this.iconBtn() }, this.ico('M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z', 15)),
                h('button', { title: 'Excluir', onClick: () => this.delInv(x.id), style: this.iconBtn('var(--neg)') }, this.ico('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14', 15)))),
            h('div', { style: this.disp({ fontSize: '1.4rem', color: 'var(--pos)', marginTop: '12px' }) }, this.m(fmt(x.value))),
            h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' } },
              x.date && h('span', { style: { fontSize: '.72rem', color: 'var(--muted)' } }, 'atualizado em ' + isoBR(x.date)),
              x.shared && this.otherUser() && h('span', { style: { fontSize: '.69rem', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: 'rgba(142,92,134,.16)', color: 'var(--plum)' } }, 'conjunto')),
            x.notes && h('p', { style: { fontSize: '.78rem', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.5 } }, x.notes)))));
  }

  /* ---------- LISTA DE COMPRAS (sempre dos dois) ---------- */
  addCompra() {
    const nome = (this.state.compraNova || '').trim();
    if (!nome) return;
    const me = this.me || {};
    const item = { id: uid(), name: nome, done: false, by: me.id || '', byName: (me.name || '').split(' ')[0], at: todayISO() };
    this.setState({ compraNova: '' });
    this.save({ ...this.d, shopping: [...(this.d.shopping || []), item] });
  }
  toggleCompra(id) {
    this.save({ ...this.d, shopping: (this.d.shopping || []).map(x => x.id === id ? { ...x, done: !x.done } : x) });
  }
  delCompra(id) { this.save({ ...this.d, shopping: (this.d.shopping || []).filter(x => x.id !== id) }); }
  limparCompras() {
    this.setState({ confirm: { msg: 'Tirar da lista tudo que já foi comprado?', onYes: () => {
      this.save({ ...this.d, shopping: (this.d.shopping || []).filter(x => !x.done) }, () => this.toast('Lista limpa'));
      this.setState({ confirm: null });
    } } });
  }
  viewCompras() {
    const lista = this.d.shopping || [];
    const faltam = lista.filter(x => !x.done), feitos = lista.filter(x => x.done);
    const linha = x => h('div', { key: x.id, style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px' } },
      h('button', { onClick: () => this.toggleCompra(x.id), title: x.done ? 'Desmarcar' : 'Marcar como comprado', style: { width: '24px', height: '24px', flexShrink: 0, borderRadius: '8px', cursor: 'pointer', border: x.done ? 'none' : '2px solid var(--stroke)', background: x.done ? 'var(--pos)' : 'transparent', color: '#fff', display: 'grid', placeItems: 'center' } }, x.done && this.ico('M20 6L9 17l-5-5', 14)),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { fontSize: '.92rem', fontWeight: 600, textDecoration: x.done ? 'line-through' : 'none', color: x.done ? 'var(--muted)' : 'var(--ink)', textWrap: 'pretty' } }, x.name),
        x.byName && h('div', { style: { fontSize: '.7rem', color: 'var(--muted)' } }, 'anotado por ' + x.byName)),
      h('button', { title: 'Tirar da lista', onClick: () => this.delCompra(x.id), style: this.iconBtn('var(--neg)') }, this.ico('M18 6L6 18M6 6l12 12', 15)));
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('div', { style: this.glass({ padding: '18px 20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }) },
        h('input', { value: this.state.compraNova || '', onChange: e => this.setState({ compraNova: e.target.value }), onKeyDown: e => { if (e.key === 'Enter') this.addCompra(); }, placeholder: 'O que falta comprar?', style: this.inp({ flex: '1 1 220px' }) }),
        h('button', { onClick: () => this.addCompra(), style: this.btn('primary') }, this.ico('M12 5v14M5 12h14', 17), 'Adicionar')),
      this.otherUser() && h('div', { style: { padding: '11px 15px', borderRadius: '12px', background: 'var(--pink-soft)', color: 'var(--pink-deep)', fontSize: '.82rem' } },
        'Esta lista é a mesma para você e ' + this.partner().split(' ')[0] + ' — o que um anota, o outro vê.'),
      lista.length === 0
        ? this.empty('Lista vazia', 'Anote aqui o que falta comprar. Dá para ir marcando conforme compra, e os dois veem a mesma lista.', null, 'lollipop')
        : h('div', { style: { display: 'grid', gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1fr 1fr', gap: '16px', alignItems: 'start' } },
          h('div', { style: this.glass({ padding: '10px' }) },
            h('div', { style: { padding: '10px 12px 6px' } }, h('span', { style: this.disp({ fontSize: '.96rem', color: 'var(--warn)' }) }, `Falta comprar (${faltam.length})`)),
            faltam.length === 0 ? h('p', { style: { color: 'var(--muted)', fontSize: '.86rem', padding: '4px 12px 12px' } }, 'Nada pendente por aqui.') : h('div', null, ...faltam.map(linha))),
          h('div', { style: this.glass({ padding: '10px' }) },
            h('div', { style: { padding: '10px 12px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
              h('span', { style: this.disp({ fontSize: '.96rem', color: 'var(--pos)' }) }, `Já comprei (${feitos.length})`),
              feitos.length > 0 && h('button', { onClick: () => this.limparCompras(), style: this.btn('ghost', { fontSize: '.78rem', padding: '6px 12px' }) }, 'Limpar')),
            feitos.length === 0 ? h('p', { style: { color: 'var(--muted)', fontSize: '.86rem', padding: '4px 12px 12px' } }, 'Nada marcado ainda.') : h('div', null, ...feitos.map(linha)))));
  }

  /* ---------- EXPORTAR O ANO ---------- */
  dadosAnuais() {
    const y = this.state.year;
    const meses = Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`);
    const txY = this.d.transactions.filter(t => (t.dueDate || t.date).slice(0, 4) === String(y));
    const resumo = meses.map((k, i) => {
      const list = txY.filter(t => mk(t.dueDate || t.date) === k);
      const e = list.filter(t => t.type === 'receita').reduce((a, t) => a + this.myShare(t), 0);
      const s = list.filter(t => t.type === 'despesa').reduce((a, t) => a + this.myShare(t), 0);
      return { mes: MONTHS[i], e, s, r: e - s };
    });
    const cats = {};
    txY.filter(t => t.type === 'despesa').forEach(t => {
      const nome = this.catName(t.category) || 'Sem categoria';
      cats[nome] = cats[nome] || { total: 0, m: Array(12).fill(0) };
      cats[nome].total += this.myShare(t);
      cats[nome].m[+mk(t.dueDate || t.date).slice(5) - 1] += this.myShare(t);
    });
    const catRows = Object.entries(cats).sort((a, b) => b[1].total - a[1].total);
    const maiorDoMes = meses.map((k, i) => {
      let nome = '—', v = 0;
      catRows.forEach(([c, d]) => { if (d.m[i] > v) { v = d.m[i]; nome = c; } });
      return { mes: MONTHS[i], categoria: nome, valor: v };
    });
    return { y, meses, resumo, catRows, maiorDoMes, txY };
  }
  carregaXLSX() {
    if (window.XLSX) return Promise.resolve(true);
    if (this._xlsxProm) return this._xlsxProm;
    this._xlsxProm = new Promise(res => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      s.onload = () => res(true); s.onerror = () => res(false);
      document.head.appendChild(s);
    });
    return this._xlsxProm;
  }
  async exportAnualXLSX() {
    if (!window.XLSX) { this.toast('Preparando a planilha…'); const ok = await this.carregaXLSX(); if (!ok || !window.XLSX) return this.toast('Não consegui carregar o gerador de planilha', 'err'); }
    const { y, resumo, catRows, maiorDoMes, txY } = this.dadosAnuais();
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumo.map(r => ({ 'Mês': r.mes, 'Entradas': r.e, 'Saídas': r.s, 'Resultado': r.r }))), 'Resumo');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(catRows.map(([c, d]) => {
      const linha = { 'Categoria': c };
      MONTHS_S.forEach((m, i) => { linha[m] = d.m[i]; });
      linha['Total'] = d.total;
      return linha;
    })), 'Categorias');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(maiorDoMes.map(r => ({ 'Mês': r.mes, 'Categoria que mais gastou': r.categoria, 'Valor': r.valor }))), 'Destaques');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(txY.map(t => ({
      'Data': isoBR(t.date), 'Vencimento': isoBR(t.dueDate || t.date), 'Descrição': t.desc, 'Tipo': t.type,
      'Categoria': this.catName(t.category), 'Minha parte': this.myShare(t), 'Valor lançado': t.value,
      'Status': t.status, 'Forma': t.payMethod || '', 'Cartão': this.origemLabel(t), 'Dividida': t.split ? 'sim' : 'não',
    }))), 'Lançamentos');
    XLSX.writeFile(wb, `financas-${y}.xlsx`);
    this.toast('Planilha gerada');
  }
  exportAnualPDF() {
    const { y, resumo, catRows, maiorDoMes } = this.dadosAnuais();
    const money = v => 'R$ ' + (Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totE = resumo.reduce((a, r) => a + r.e, 0), totS = resumo.reduce((a, r) => a + r.s, 0);
    const esc = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const linhasResumo = resumo.map(r => `<tr><td>${esc(r.mes)}</td><td class="n">${money(r.e)}</td><td class="n">${money(r.s)}</td><td class="n ${r.r < 0 ? 'neg' : 'pos'}">${money(r.r)}</td></tr>`).join('');
    const linhasCat = catRows.map(([c, d]) => `<tr><td>${esc(c)}</td>${d.m.map(v => `<td class="n s">${v ? money(v) : '—'}</td>`).join('')}<td class="n b">${money(d.total)}</td></tr>`).join('');
    const linhasTop = maiorDoMes.filter(r => r.valor > 0).map(r => `<tr><td>${esc(r.mes)}</td><td>${esc(r.categoria)}</td><td class="n">${money(r.valor)}</td></tr>`).join('');
    const doc = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Financas ${y}</title><style>
      *{box-sizing:border-box} body{font:12px/1.5 system-ui,-apple-system,sans-serif;color:#23262c;margin:28px}
      h1{font-size:20px;margin:0 0 2px} h2{font-size:14px;margin:26px 0 8px}
      .sub{color:#6b7280;font-size:12px;margin-bottom:18px}
      .kpis{display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap}
      .kpi{border:1px solid #e5e7eb;border-radius:10px;padding:10px 14px;min-width:150px}
      .kpi span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#6b7280}
      .kpi b{font-size:16px}
      table{width:100%;border-collapse:collapse;margin-top:4px} th,td{border-bottom:1px solid #e5e7eb;padding:6px 8px;text-align:left}
      th{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280}
      td.n{text-align:right;font-variant-numeric:tabular-nums} td.s{font-size:10px} td.b{font-weight:700}
      .pos{color:#2f7d58} .neg{color:#c2413a}
      @page{size:A4 landscape;margin:12mm}
      </style></head><body>
      <h1>Finanças ${y}</h1><div class="sub">Valores já considerando apenas a sua parte nas contas divididas.</div>
      <div class="kpis"><div class="kpi"><span>Entradas no ano</span><b>${money(totE)}</b></div>
      <div class="kpi"><span>Saídas no ano</span><b>${money(totS)}</b></div>
      <div class="kpi"><span>Resultado</span><b class="${totE - totS < 0 ? 'neg' : 'pos'}">${money(totE - totS)}</b></div></div>
      <h2>Resumo mês a mês</h2><table><thead><tr><th>Mês</th><th class="n">Entradas</th><th class="n">Saídas</th><th class="n">Resultado</th></tr></thead><tbody>${linhasResumo}</tbody></table>
      <h2>Onde gastou mais em cada mês</h2><table><thead><tr><th>Mês</th><th>Categoria</th><th class="n">Valor</th></tr></thead><tbody>${linhasTop || '<tr><td colspan="3">Sem saídas no ano.</td></tr>'}</tbody></table>
      <h2>Categorias mês a mês</h2><table><thead><tr><th>Categoria</th>${MONTHS_S.map(m => `<th class="n">${m}</th>`).join('')}<th class="n">Total</th></tr></thead><tbody>${linhasCat || '<tr><td>Sem saídas no ano.</td></tr>'}</tbody></table>
      </body></html>`;
    const w = window.open('', '_blank');
    if (!w) return this.toast('Libere as janelas pop-up para gerar o PDF', 'err');
    w.document.write(doc); w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 350);
  }
  render() { return h('div', { id: 'groovy-root' }, this.renderApp()); }
  renderApp() {
    if (this.state.booting) return this.renderBoot();
    if (!this.me) return this.renderAuth();
    const narrow = typeof window !== 'undefined' && window.innerWidth < 900;
    return h('div', { style: { display: 'flex', minHeight: '100vh' } },
      this.renderNav(narrow),
      h('div', { style: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' } },
        this.renderTop(narrow),
        h('main', { key: this.state.view, style: { flex: 1, padding: 'clamp(14px,2.6vw,30px)', animation: 'rise .3s both' } }, this.renderView())),
      narrow && this.state.mobileNav && h('div', { onClick: () => this.setState({ mobileNav: false }), style: { position: 'fixed', inset: 0, background: 'rgba(70,30,50,.32)', zIndex: 40 } }),
      this.renderModal(), this.renderConfirm(), this.renderToast());
  }
  renderBoot() {
    return h('div', { style: { minHeight: '100vh', display: 'grid', placeItems: 'center', gap: '14px' } },
      h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' } },
        h('div', { style: { width: '38px', height: '38px', borderRadius: '50%', border: '3px solid var(--stroke)', borderTopColor: 'var(--pink)', animation: 'spin .8s linear infinite' } }),
        h('div', { style: { fontSize: '.85rem', color: 'var(--muted)', fontWeight: 600 } }, 'Carregando seus dados…')));
  }
  renderAuth() {
    const f = this.state.authForm, busy = this.state.authBusy;
    const set = p => this.setState({ authForm: { ...this.state.authForm, ...p }, authErr: '', authMsg: '' });
    const go = () => { if (!busy) this.doLogin(); };
    const inp = (label, key, type, auto) => h('label', { key: key, style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
      h('span', { style: { fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)' } }, label),
      h('input', { type: type || 'text', value: f[key] || '', autoComplete: auto || 'off', onChange: e => set({ [key]: e.target.value }), onKeyDown: e => { if (e.key === 'Enter') go(); }, style: this.inp() }));
    return h('div', { style: { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'clamp(18px,4vw,40px)' } },
      h('div', { style: this.glass({ width: 'min(420px,100%)', padding: 'clamp(22px,4vw,34px)', display: 'flex', flexDirection: 'column', gap: '15px' }) },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
          h('div', { style: { width: '44px', height: '44px', borderRadius: '15px', background: 'linear-gradient(135deg,var(--pink),var(--coral))', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 8px 18px rgba(70,76,86,.28)' } },
            h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }, h('path', { d: 'M4 20h3.4V11H4v9zm6.3 0h3.4V4h-3.4v16zm6.3 0H20v-6.5h-3.4V20z' }))),
          h('div', null,
            h('div', { style: this.disp({ fontSize: '1.4rem' }) }, 'Finanças pessoais'),
            h('div', { style: { fontSize: '.8rem', color: 'var(--muted)', fontWeight: 500 } }, 'entre para ver seus dados'))),
        inp('E-mail', 'login', 'email', 'username'),
        inp('Senha', 'pass', 'password', 'current-password'),
        this.state.authErr && h('div', { style: { padding: '11px 14px', borderRadius: '14px', background: 'rgba(222,108,99,.14)', color: 'var(--neg)', fontSize: '.83rem', fontWeight: 600 } }, this.state.authErr),
        this.state.authMsg && h('div', { style: { padding: '11px 14px', borderRadius: '14px', background: 'rgba(62,156,126,.14)', color: 'var(--pos)', fontSize: '.83rem', fontWeight: 600 } }, this.state.authMsg),
        h('button', { onClick: go, disabled: busy, style: this.btn('primary', { justifyContent: 'center', padding: '13px', opacity: busy ? .6 : 1 }) }, busy ? 'Entrando…' : 'Entrar'),
        h('button', { onClick: () => this.sendReset(), disabled: busy, style: this.btn('ghost', { justifyContent: 'center' }) }, 'Esqueci minha senha'),
        h('p', { style: { fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.55, textWrap: 'pretty' } }, 'Seus dados ficam na sua conta do Supabase, protegidos por senha, e aparecem em qualquer aparelho onde você entrar. Cada pessoa vê apenas os próprios lançamentos; o que for marcado como dividido aparece para as duas.')));
  }
  renderNav(narrow) {
    const open = this.state.mobileNav;
    return h('aside', { style: { width: '250px', flexShrink: 0, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--surface)', borderRight: '1px solid var(--stroke)', position: narrow ? 'fixed' : 'sticky', top: 0, height: '100vh', left: narrow ? (open ? 0 : '-270px') : 0, transition: 'left .28s', zIndex: 45 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '11px', padding: '2px 10px 20px', flexShrink: 0 } },
        h('div', { style: { width: '38px', height: '38px', borderRadius: '10px', background: 'var(--pink-deep)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 } },
          h('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'currentColor' }, h('path', { d: 'M4 20h3.4V11H4v9zm6.3 0h3.4V4h-3.4v16zm6.3 0H20v-6.5h-3.4V20z' }))),
        h('div', { style: { minWidth: 0 } }, h('div', { style: this.disp({ fontSize: '1.06rem', lineHeight: 1.1 }) }, 'Finanças pessoais'), h('div', { style: { fontSize: '.72rem', color: 'var(--muted)', fontWeight: 500, lineHeight: 1.25 } }, 'controle do mês, do ano e das metas'))),
      ...NAV.map(([id, label, path]) => {
        const on = this.state.view === id;
        return h('button', { key: id, onClick: () => this.setState({ view: id, mobileNav: false }), style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 13px', borderRadius: '10px', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', flexShrink: 0, background: on ? 'var(--pink-soft)' : 'transparent', color: on ? 'var(--pink-deep)' : 'var(--muted)', fontWeight: on ? 600 : 500, fontSize: '.875rem', boxShadow: 'none', transition: 'background .2s' } }, this.ico(path, 19), h('span', null, label));
      }),
      h('div', { style: { flex: 1 } }));
  }
  renderTop(narrow) {
    return h('header', { style: { position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', gap: '10px', padding: 'clamp(12px,2vw,18px) clamp(14px,2.6vw,30px)', background: 'var(--surface)', borderBottom: '1px solid var(--stroke)' } },
      narrow && h('button', { onClick: () => this.setState({ mobileNav: true }), style: this.btn('ghost', { padding: '10px' }) }, this.ico('M3 6h18M3 12h18M3 18h18', 20)),
      h('div', { style: { minWidth: 0 } },
        h('h1', { style: this.disp({ fontSize: 'clamp(1.05rem,2vw,1.3rem)', lineHeight: 1.2 }) }, (NAV.find(n => n[0] === this.state.view) || [])[1]),
        !narrow && h('p', { style: { fontSize: '.8rem', color: 'var(--muted)', marginTop: '2px' } }, SUBS[this.state.view] || '')),
      h('div', { style: { flex: 1 } }),
      this.cloudChip(),
      h('button', { title: 'Sair da conta de ' + this.me.name, onClick: () => this.logout(), style: this.btn('ghost', { padding: '6px 12px 6px 6px', gap: '8px' }) },
        h('span', { style: { width: '27px', height: '27px', borderRadius: '50%', background: 'var(--pink)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '.78rem', fontWeight: 700, flexShrink: 0 } }, (this.me.name || '?').slice(0, 1).toUpperCase()),
        narrow ? '' : this.me.name.split(' ')[0],
        this.ico('M15 12H3m0 0l4-4m-4 4l4 4M13 4h5a2 2 0 012 2v12a2 2 0 01-2 2h-5', 16)),
      h('button', { title: this.state.theme === 'dark' ? 'Modo claro' : 'Modo escuro', onClick: () => this.savePrefs({ theme: this.state.theme === 'dark' ? 'light' : 'dark' }), style: this.btn('ghost', { padding: '10px' }) },
        this.ico(this.state.theme === 'dark' ? 'M12 3v2m0 14v2M5.6 5.6l1.4 1.4m10 10l1.4 1.4M3 12h2m14 0h2M5.6 18.4l1.4-1.4m10-10l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z' : 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z', 19)),
      h('button', { title: this.state.hideValues ? 'Mostrar valores' : 'Esconder valores', onClick: () => this.savePrefs({ hideValues: !this.state.hideValues }), style: this.btn('ghost', { padding: '10px' }) },
        this.ico(this.state.hideValues ? 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z' : 'M3 3l18 18M10.6 10.6a3 3 0 004 4M9.9 5.1A9.4 9.4 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3 3.8M6.6 6.6A17 17 0 002 12s3.5 7 10 7c1 0 2-.1 2.9-.4', 19)),
      h('button', { onClick: () => this.openTx('add'), style: this.btn('primary') }, this.ico('M12 5v14M5 12h14', 18), narrow ? '' : 'Novo lançamento'));
  }
  renderView() {
    switch (this.state.view) {
      case 'dashboard': return this.viewDashboard();
      case 'lancamentos': return this.viewLancamentos();
      case 'cartoes': return this.viewCartoes();
      case 'mensal': return this.viewLancamentos();
      case 'investimentos': return this.viewInvestimentos();
      case 'compras': return this.viewCompras();
      case 'anual': return this.viewAnual();
      case 'metas': return this.viewMetas();
      case 'config': return this.viewConfig();
    }
  }
  head(t, sub) { return h('div', { style: { marginBottom: '14px' } }, h('h2', { style: this.disp({ fontSize: '1.12rem' }) }, t), sub && h('p', { style: { color: 'var(--muted)', fontSize: '.84rem', marginTop: '2px' } }, sub)); }
  empty(t, msg, action, sticker) {
    return h('div', { style: this.glass({ padding: '52px 26px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }) },
      h('div', { style: { width: '58px', height: '58px', borderRadius: '20px', background: 'var(--pink-soft)', color: 'var(--pink-deep)', display: 'grid', placeItems: 'center', marginBottom: '6px' } }, this.ico('M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z', 26)),
      h('h3', { style: this.disp({ fontSize: '1.05rem' }) }, t),
      h('p', { style: { color: 'var(--muted)', fontSize: '.88rem', maxWidth: '380px' } }, msg), action);
  }
  chip(label, on, onClick, color) {
    return h('button', { key: label, onClick, style: { padding: '7px 13px', borderRadius: '9px', border: on ? 'none' : '1px solid var(--stroke)', background: on ? (color || 'var(--pink)') : 'var(--card-2)', color: on ? '#fff' : 'var(--ink)', fontWeight: on ? 700 : 500, fontSize: '.83rem', cursor: 'pointer', transition: 'background .18s' } }, label);
  }

  /* ---------- 0. PAINEL ---------- */
  /* ---------- A QUEM PERTENCE A DESPESA ---------- */
  /* Cash (o que sai da conta) é uma coisa; gasto (a quem a despesa pertence)
     é outra. `myShare` responde a primeira; `parteDe` responde a segunda. */
  parteDe(t, quem) {
    const me = this.me || {}, outro = this.otherUser() || {};
    const id = quem === 'parceiro' ? outro.id : me.id;
    if (t.isFatura) {
      if (quem === 'casal') return c2(t.value);
      return quem === 'parceiro' ? c2(t.value - t.myValue) : c2(t.myValue);
    }
    if (quem === 'casal') return c2(t.value);
    if (t.split) {
      const cent = Math.round((t.value || 0) * 100), cima = Math.ceil(cent / 2);
      const dono = t.owner || me.id;
      return ((dono === id) ? cima : cent - cima) / 100;
    }
    const dono = t.owner || me.id;
    return dono === id ? c2(t.value) : 0;
  }
  /* Vale-benefício (Flash e afins): saldo da empresa, não é renda nem gasto.
     Marque a conta ou o cartão como benefício em Configurações. */
  ehBeneficio(t) {
    if (t.isRepasse) return false;
    if (t.isFatura) return !!(t.cardRef && t.cardRef.beneficio);
    if (t.card) { const c = this.card(t.card); if (c && c.beneficio) return true; }
    if (t.account) { const a = this.acc(t.account); if (a && a.beneficio) return true; }
    return false;
  }
  /* Lançamentos do período com as faturas abertas em compras, para saber
     de quem é cada real — e não só quanto o cartão cobrou. */
  itensDetalhados(from, to) {
    const vistos = new Set(), out = [];
    const guarda = (t, venc) => { if (!t || vistos.has(t.id)) return; vistos.add(t.id); out.push({ ...t, _venc: venc }); };
    this.monthKeysBetween(from, to).forEach(k => {
      this.d.transactions.filter(t => !t.card && mk(t.dueDate || t.date) === k).forEach(t => guarda(t, t.dueDate || t.date));
      this.recFor(k).forEach(r => guarda(r, r.dueDate || r.date));
      (this.d.cards || []).forEach(c => this.comprasDaFatura(c, k).forEach(t => guarda(t, this.vencFatura(c, k))));
    });
    return out.filter(x => x._venc >= from && x._venc <= to);
  }
  fechamento(from, to, quem) {
    const itens = this.itensDetalhados(from, to);
    const uteis = itens.filter(i => !this.ehBeneficio(i));
    const parte = i => this.parteDe(i, quem);
    const receitas = uteis.filter(i => i.type === 'receita').reduce((a, i) => a + parte(i), 0);
    const desp = uteis.filter(i => i.type === 'despesa');
    const baldes = [
      { k: 'fixas', label: 'Contas fixas (sua parte)', v: 0, cor: 'var(--pink)' },
      { k: 'cartoes', label: 'Cartões (sua parte)', v: 0, cor: 'var(--plum)' },
      { k: 'casal', label: 'Despesas do casal (sua parte)', v: 0, cor: 'var(--coral)' },
      { k: 'so', label: 'Só suas', v: 0, cor: 'var(--pink-deep)' },
    ];
    const põe = (k, v) => { const b = baldes.find(x => x.k === k); if (b) b.v = c2(b.v + v); };
    desp.forEach(i => {
      const v = parte(i); if (!v) return;
      if (i.card) põe('cartoes', v);
      else if (i.recurring || i.isRec || i.recSource) põe('fixas', v);
      else if (i.split) põe('casal', v);
      else põe('so', v);
    });
    const gastos = c2(baldes.reduce((a, b) => a + b.v, 0));
    let receber = 0, pagar = 0;
    if (quem !== 'casal') {
      const me = this.me || {}, outro = this.otherUser() || {};
      const eu = quem === 'parceiro' ? outro.id : me.id;
      const ele = quem === 'parceiro' ? me.id : outro.id;
      desp.forEach(i => {
        const pagou = this.payerOf(i);
        const minha = this.parteDe(i, quem);
        const dele = quem === 'parceiro' ? this.parteDe(i, 'eu') : this.parteDe(i, 'parceiro');
        if (pagou === eu && dele > 0) receber = c2(receber + dele);
        if (pagou === ele && minha > 0) pagar = c2(pagar + minha);
      });
    }
    const ben = itens.filter(i => this.ehBeneficio(i));
    const benGasto = ben.filter(i => i.type === 'despesa').reduce((a, i) => a + this.parteDe(i, quem), 0);
    const benEntrada = ben.filter(i => i.type === 'receita').reduce((a, i) => a + this.parteDe(i, quem), 0);
    return {
      receitas, gastos, baldes, receber, pagar, saldoAcerto: c2(receber - pagar),
      sobra: c2(receitas - gastos), comprometido: receitas > 0 ? (gastos / receitas) * 100 : 0,
      benGasto: c2(benGasto), benEntrada: c2(benEntrada), temBeneficio: ben.length > 0,
    };
  }
  renderFechamento(from, to, label) {
    const quem = this.state.visao || 'eu';
    const outro = this.otherUser();
    const f = this.fechamento(from, to, quem);
    const nome = quem === 'parceiro' ? (outro || {}).name || 'Parceiro' : quem === 'casal' ? 'vocês dois' : 'você';
    const primeiro = s => String(s || '').split(' ')[0];
    const linha = (rot, val, cor, forte) => h('div', { key: rot, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', padding: forte ? '10px 0 0' : '5px 0', borderTop: forte ? '1px solid var(--stroke)' : 'none', marginTop: forte ? '6px' : 0 } },
      h('span', { style: { fontSize: forte ? '.88rem' : '.84rem', fontWeight: forte ? 700 : 500, color: forte ? 'var(--ink)' : 'var(--muted)' } }, rot),
      h('span', { style: { fontSize: forte ? '.98rem' : '.88rem', fontWeight: 700, color: cor || 'var(--ink)', whiteSpace: 'nowrap' } }, this.m(fmt(val))));
    const bloco = (titulo, sub, filhos) => h('div', { style: this.glass({ padding: '18px 20px' }) },
      h('div', { style: { marginBottom: '10px' } },
        h('div', { style: this.disp({ fontSize: '.98rem' }) }, titulo),
        sub && h('div', { style: { fontSize: '.74rem', color: 'var(--muted)' } }, sub)),
      ...filhos);
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
      h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' } },
        h('span', { style: { fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)' } }, 'Fechamento de'),
        ...[['eu', 'Mim'], ['parceiro', primeiro((outro || {}).name) || 'Parceiro'], ['casal', 'Nós dois']]
          .filter(([v]) => v !== 'parceiro' || outro)
          .map(([v, l]) => this.chip(l, quem === v, () => this.setState({ visao: v }), 'var(--plum)'))),
      h('div', { style: { display: 'grid', gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1fr 1fr', gap: '14px', alignItems: 'start' } },
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        bloco('Receitas', label, [
          linha('O que entrou', f.receitas, 'var(--pos)', true),
          f.temBeneficio && f.benEntrada > 0 && h('div', { key: 'b', style: { fontSize: '.73rem', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.5 } }, `Benefícios fora da conta: ${this.m(fmt(f.benEntrada))} — saldo da empresa, não entra na renda.`),
        ]),
        bloco('Resultado', label, [
          linha('Entrou', f.receitas, 'var(--pos)'),
          linha('Gastou', f.gastos, 'var(--neg)'),
          h('div', { key: 'barra', style: { margin: '10px 0 4px' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', color: 'var(--muted)', fontWeight: 600, marginBottom: '5px' } },
              h('span', null, 'Renda comprometida'), h('span', { style: { fontWeight: 700, color: f.comprometido > 90 ? 'var(--neg)' : 'var(--ink)' } }, pct(Math.min(999, f.comprometido)))),
            h('div', { style: { height: '10px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' } },
              h('div', { style: { width: Math.min(100, f.comprometido) + '%', height: '100%', borderRadius: '999px', background: f.comprometido > 90 ? 'var(--neg)' : f.comprometido > 70 ? 'var(--warn)' : 'var(--pos)' } }))),
          linha('Sobrou livre', f.sobra, f.sobra >= 0 ? 'var(--pos)' : 'var(--neg)', true),
          f.saldoAcerto !== 0 && h('div', { key: 'ac', style: { fontSize: '.73rem', color: 'var(--muted)', marginTop: '6px' } }, `Com o acerto ${f.saldoAcerto > 0 ? 'a receber' : 'a pagar'}: ${this.m(fmt(f.sobra + f.saldoAcerto))}`),
          f.temBeneficio && f.benGasto > 0 && h('div', { key: 'bg', style: { fontSize: '.73rem', color: 'var(--muted)', marginTop: '6px' } }, `${this.m(fmt(f.benGasto))} pagos com benefício, fora desta conta.`),
        ])),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        bloco(quem === 'casal' ? 'Gastos do casal' : 'Gastos de ' + primeiro(nome), 'pela parte que pertence a cada um',
          [...f.baldes.map(b => linha(quem === 'casal' ? b.label.replace(' (sua parte)', '') : b.label, b.v, b.cor)),
            linha('Total gasto', f.gastos, 'var(--neg)', true)]),
        outro && quem !== 'casal' && bloco('Acerto entre vocês', 'quem pagou pelo outro neste período', [
          linha(primeiro((outro || {}).name) + ' tem a te pagar', f.receber, 'var(--pos)'),
          linha('Você tem a pagar', f.pagar, 'var(--neg)'),
          linha(f.saldoAcerto >= 0 ? 'Sobra pra você' : 'Você deve', Math.abs(f.saldoAcerto), f.saldoAcerto >= 0 ? 'var(--pos)' : 'var(--neg)', true),
        ]))),
      quem === 'casal' && outro && h('p', { style: { fontSize: '.73rem', color: 'var(--muted)', lineHeight: 1.5 } },
        'A visão do casal soma o que está visível para vocês dois: seus lançamentos, os divididos e os que são de ' + primeiro(outro.name) + ' marcados como tal. O que ele lançar como só dele continua privado.'));
  }
  viewDashboard() {
    const st = this.state, { from, to, label } = this.periodRange();
    const items = this.rangeItems(from, to).filter(i => !this.ehBeneficio(i) && !i.isRepasse);
    const today = todayISO();
    const sai = items.filter(i => i.type === 'despesa'), ent = items.filter(i => i.type === 'receita');
    const quem = this.state.visao || 'eu';
    const val = i => this.parteDe(i, quem);
    const totSai = sai.reduce((a, i) => a + val(i), 0);
    const pago = sai.filter(i => this.isDone(i)).reduce((a, i) => a + val(i), 0);
    const abertas = sai.filter(i => !this.isDone(i));
    const falta = abertas.reduce((a, i) => a + val(i), 0);
    const venc = abertas.filter(i => (i.dueDate || i.date) < today);
    const vencVal = venc.reduce((a, i) => a + val(i), 0);
    const totEnt = ent.reduce((a, i) => a + val(i), 0);
    const pct = totSai > 0 ? (pago / totSai) * 100 : 0;
    const acerto = { receber: 0, pagar: 0 };
    items.forEach(i => { acerto.receber += this.credit(i); acerto.pagar += this.debt(i); });

    // por categoria (só o que falta pagar)
    const byCat = {};
    abertas.forEach(i => { const k = i.category || 'sem'; byCat[k] = (byCat[k] || 0) + val(i); });
    const cats = Object.entries(byCat).map(([id, v]) => ({ id, v, name: id === 'sem' ? 'Sem categoria' : this.catName(id), color: id === 'sem' ? 'var(--muted)' : this.catColor(id) })).sort((a, b) => b.v - a.v);
    const maxCat = cats.length ? cats[0].v : 1;

    const seg = (id, txt) => h('button', { key: id, onClick: () => this.setState({ period: id }), style: { padding: '9px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.84rem', background: st.period === id ? 'var(--pink)' : 'transparent', color: st.period === id ? '#fff' : 'var(--muted)' } }, txt);
    const stepBtn = (txt, fn) => h('button', { onClick: fn, style: this.btn('ghost', { padding: '8px 13px' }) }, txt);
    const shiftM = n => { const [y, m] = st.month.split('-'); this.setState({ month: new Date(+y, +m - 1 + n, 1).toISOString().slice(0, 7) }); };

    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      // seletor de período
      h('div', { style: this.glass({ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '13px' }) },
        h('div', { style: { display: 'flex', gap: '6px', padding: '4px', borderRadius: '999px', background: 'var(--pink-soft)', alignSelf: 'flex-start', flexWrap: 'wrap' } },
          seg('mes', 'Mês'), seg('ano', 'Ano'), seg('custom', 'Período')),
        st.period === 'mes' && h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
          stepBtn('◀', () => shiftM(-1)),
          h('span', { style: this.disp({ fontSize: '1.05rem', minWidth: '190px', textAlign: 'center' }) }, mkLong(st.month)),
          stepBtn('▶', () => shiftM(1)),
          h('button', { onClick: () => this.setState({ month: todayISO().slice(0, 7) }), style: this.btn('soft', { fontSize: '.8rem' }) }, 'Mês atual')),
        st.period === 'ano' && h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
          stepBtn('◀', () => this.setState({ year: st.year - 1 })),
          h('span', { style: this.disp({ fontSize: '1.05rem', minWidth: '110px', textAlign: 'center' }) }, String(st.year)),
          stepBtn('▶', () => this.setState({ year: st.year + 1 }))),
        st.period === 'custom' && h('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' } },
          this.field('De', h('input', { type: 'date', value: st.from, onChange: e => this.setState({ from: e.target.value }), style: this.inp() })),
          this.field('Até', h('input', { type: 'date', value: st.to, onChange: e => this.setState({ to: e.target.value }), style: this.inp() })),
          h('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap' } },
            this.chip('Próximos 30 dias', false, () => this.setState({ from: today, to: addM(today, 1) })),
            this.chip('Próximos 3 meses', false, () => this.setState({ from: today, to: addM(today, 3) })),
            this.chip('Ano até hoje', false, () => this.setState({ from: today.slice(0, 4) + '-01-01', to: today }))))),
      // destaque: quanto falta pagar
      h('div', { style: this.glass({ padding: 'clamp(20px,3vw,28px)', display: 'flex', flexWrap: 'wrap', gap: '22px', alignItems: 'center' }) },
        h('div', { style: { flex: '1 1 240px', minWidth: 0 } },
          h('div', { style: { fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' } }, 'A pagar — ' + label),
          h('div', { style: this.disp({ fontSize: 'clamp(2rem,5vw,2.9rem)', color: falta > 0 ? 'var(--neg)' : 'var(--pos)', lineHeight: 1.05, marginTop: '4px' }) }, this.m(fmt(falta))),
          h('div', { style: { fontSize: '.85rem', color: 'var(--muted)', marginTop: '6px' } }, abertas.length + (abertas.length === 1 ? ' conta em aberto' : ' contas em aberto') + ' de ' + sai.length),
          venc.length > 0 && h('div', { style: { marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', background: 'var(--neg-bg)', color: 'var(--neg)', fontWeight: 700, fontSize: '.83rem' } }, venc.length + ' vencida' + (venc.length > 1 ? 's' : '') + ' • ' + this.m(fmt(vencVal)))),
        h('div', { style: { flex: '1 1 240px', minWidth: 0 } },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 700, marginBottom: '7px' } },
            h('span', null, 'Já pago no período'), h('span', { style: { color: 'var(--pos)' } }, this.m(fmt(pago)))),
          h('div', { style: { height: '12px', borderRadius: '999px', background: 'var(--pink-soft)', overflow: 'hidden' } },
            h('div', { style: { width: Math.min(100, pct) + '%', height: '100%', borderRadius: '999px', background: 'var(--pos)', transition: 'width .4s' } })),
          h('div', { style: { fontSize: '.78rem', color: 'var(--muted)', marginTop: '7px' } }, Math.round(pct) + '% das saídas previstas de ' + this.m(fmt(totSai))))),
      // números do período
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' } },
        this.stat('Entradas', totEnt, 'var(--pos)'),
        this.stat('Saídas', totSai, 'var(--neg)'),
        this.stat('Resultado', totEnt - totSai, totEnt - totSai >= 0 ? 'var(--pos)' : 'var(--neg)'),
        this.stat(acerto.receber - acerto.pagar >= 0 ? this.partner().split(' ')[0] + ' te deve' : 'Você deve a ' + this.partner().split(' ')[0], Math.abs(acerto.receber - acerto.pagar), acerto.receber - acerto.pagar >= 0 ? 'var(--pos)' : 'var(--neg)')),
      // fechamento no formato da planilha
      this.renderFechamento(from, to, label),
      // gráficos
      h('div', { style: { display: 'grid', gridTemplateColumns: window.innerWidth < 900 ? '1fr' : '1.2fr 1fr', gap: '16px', alignItems: 'start' } },
        h('div', { style: this.glass({ padding: '20px 22px' }) }, this.head('Entra e sai', 'últimos 6 meses — para cima entrou, para baixo saiu'),
          h('div', { style: { height: '260px' } }, h('canvas', { id: 'ch-fluxo' }))),
        h('div', { style: this.glass({ padding: '20px 22px' }) }, this.head('Para onde foi', label),
          cats.length === 0
            ? h('p', { style: { color: 'var(--muted)', fontSize: '.87rem' } }, 'Sem saídas no período.')
            : h('div', { style: { height: '260px' } }, h('canvas', { id: 'ch-categorias' })))),
      // categorias + próximas contas
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '16px', alignItems: 'start' } },
        h('div', { style: this.glass({ padding: '20px 22px' }) }, this.head('Falta pagar por categoria', label),
          cats.length === 0 ? h('p', { style: { color: 'var(--muted)', fontSize: '.87rem' } }, 'Nada em aberto neste período.')
            : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '11px' } }, ...cats.slice(0, 8).map(c => h('div', { key: c.id },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.83rem', fontWeight: 600, marginBottom: '5px' } },
                h('span', null, c.name), h('span', { style: { fontWeight: 700 } }, this.m(fmt(c.v)))),
              h('div', { style: { height: '9px', borderRadius: '999px', background: 'var(--pink-soft)', overflow: 'hidden' } },
                h('div', { style: { width: (c.v / maxCat) * 100 + '%', height: '100%', background: c.color, borderRadius: '999px' } })))))),
        h('div', { style: this.glass({ padding: '20px 22px' }) }, this.head('Próximas a vencer', abertas.length + ' em aberto'),
          abertas.length === 0 ? h('p', { style: { color: 'var(--muted)', fontSize: '.87rem' } }, 'Tudo pago por aqui.')
            : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '2px' } }, ...abertas.slice(0, 9).map(i => {
              const late = (i.dueDate || i.date) < today;
              return h('button', { key: i.id, onClick: () => this.setState({ view: 'mensal', month: mk(i.dueDate || i.date) }), style: { display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 10px', borderRadius: '14px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'var(--ink)', width: '100%' } },
                h('span', { style: { width: '42px', flexShrink: 0, fontSize: '.74rem', fontWeight: 700, color: late ? 'var(--neg)' : 'var(--muted)' } }, isoBR(i.dueDate || i.date).slice(0, 5)),
                h('span', { style: { flex: 1, minWidth: 0, fontSize: '.85rem', fontWeight: 600, textWrap: 'pretty' } }, i.desc,
                  i.isRec && h('span', { style: { color: 'var(--muted)', fontWeight: 400 } }, '  ↻'),
                  i.split && h('span', { style: { color: 'var(--plum)', fontSize: '.72rem', fontWeight: 700 } }, '  ÷')),
                h('span', { style: { fontWeight: 700, fontSize: '.85rem', color: late ? 'var(--neg)' : 'var(--ink)' } }, this.m(fmt(val(i)))));
            }), abertas.length > 9 && h('button', { onClick: () => this.setState({ view: 'mensal' }), style: this.btn('soft', { marginTop: '10px', fontSize: '.82rem', alignSelf: 'flex-start' }) }, 'Ver todas no planejamento')))));
  }
  /* ---------- 1. LANÇAMENTOS ---------- */
  viewLancamentos() {
    const modo = this.state.lancModo || 'quinzena';
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('div', { style: { display: 'flex', gap: '6px', padding: '4px', borderRadius: '999px', background: 'var(--pink-soft)', alignSelf: 'flex-start', flexWrap: 'wrap' } },
        ...[['quinzena', 'Por quinzena'], ['mes', 'Mês inteiro'], ['lista', 'Lista geral']].map(([v, l]) =>
          h('button', { key: v, onClick: () => this.setState({ lancModo: v }), style: { padding: '9px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '.84rem', background: modo === v ? 'var(--pink)' : 'transparent', color: modo === v ? '#fff' : 'var(--muted)' } }, l))),
      modo === 'quinzena' ? this.blocoQuinzenas() : modo === 'mes' ? this.blocoMes() : this.blocoLista());
  }
  /* Uma fatura por vez: escolhe o cartão, escolhe o mês, lança ali mesmo. */
  viewCartoes() {
    const cartoes = this.meusCartoes();
    if (!cartoes.length) return this.empty('Nenhum cartão', 'Cadastre seus cartões em Configurações para lançar as compras da fatura aqui.', h('button', { onClick: () => this.setState({ view: 'config' }), style: this.btn('primary') }, 'Ir para Configurações'), 'queen-card');
    const c = cartoes.find(x => x.id === this.state.cartaoSel) || cartoes[0];
    const month = this.state.month;
    const shift = n => { const [y, m] = month.split('-'); this.setState({ month: new Date(+y, +m - 1 + n, 1).toISOString().slice(0, 7) }); };
    const compras = this.comprasDaFatura(c, month);
    const total = compras.reduce((a, t) => a + (t.value || 0), 0);
    const minha = compras.reduce((a, t) => a + (t.split ? this.metade(t) : (this.isForOther(t) ? 0 : t.value)), 0);
    const paga = compras.length > 0 && compras.every(t => t.status === 'pago');
    const fecha = this.faturaClose(c, month), vence = this.vencFatura(c, month);
    const q = this.state.compraRapida || {};
    const setQ = p => this.setState({ compraRapida: { ...q, ...p } });
    const hoje = todayISO();
    const dataPadrao = this.faturaMesDe({ card: c.id, date: hoje, dueDate: hoje }) === month ? hoje : fecha;
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      cartoes.length > 1 && h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        ...cartoes.map(x => this.chip(x.name, x.id === c.id, () => this.setState({ cartaoSel: x.id }), x.color))),
      // cabeçalho da fatura
      h('div', { style: this.glass({ padding: '0', overflow: 'hidden' }) },
        h('div', { style: { padding: '20px 22px', background: `linear-gradient(135deg,${c.color},${c.color}cc)`, color: '#fff' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' } },
            h('button', { title: 'Mês anterior', onClick: () => shift(-1), style: { border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', display: 'grid', placeItems: 'center' } }, this.ico('M15 6l-6 6 6 6', 17)),
            h('div', { style: { minWidth: '150px', textAlign: 'center', flex: '1 1 auto' } },
              h('div', { style: this.disp({ fontSize: '1.1rem', textTransform: 'capitalize' }) }, mkLong(month)),
              h('div', { style: { fontSize: '.73rem', opacity: .9 } }, `${c.name} • fecha ${isoBR(fecha)} • vence ${isoBR(vence)}`)),
            h('button', { title: 'Próximo mês', onClick: () => shift(1), style: { border: 'none', background: 'rgba(255,255,255,.2)', color: '#fff', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', display: 'grid', placeItems: 'center' } }, this.ico('M9 6l6 6-6 6', 17))),
          h('div', { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginTop: '14px' } },
            h('div', null,
              h('div', { style: { fontSize: '.72rem', opacity: .88, textTransform: 'uppercase', letterSpacing: '.05em' } }, 'Total da fatura'),
              h('div', { style: this.disp({ fontSize: 'clamp(1.6rem,4vw,2.1rem)', lineHeight: 1.1 }) }, this.m(fmt(total))),
              minha !== total && h('div', { style: { fontSize: '.75rem', opacity: .92, marginTop: '2px' } }, 'sua parte ' + this.m(fmt(minha)))),
            h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
              compras.length > 0 && h('button', { onClick: () => this.pagarFatura(c, month, compras, paga), style: { display: 'inline-flex', alignItems: 'center', gap: '8px', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '.85rem', background: paga ? 'rgba(255,255,255,.22)' : '#fff', color: paga ? '#fff' : c.color } },
                this.ico(paga ? 'M9 14l-4-4m0 0l4-4' : 'M20 6L9 17l-5-5', 16), paga ? 'Reabrir fatura' : 'Marcar como paga'),
              h('button', { onClick: () => this.openImport(c), style: { display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,.55)', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '.85rem', background: 'rgba(255,255,255,.16)', color: '#fff' } },
                this.ico('M12 3v12m0 0l-4-4m4 4l4-4M5 21h14', 16), 'Importar PDF/CSV')))),
        // lançamento rápido dentro da fatura
        h('div', { style: { padding: '14px 18px', borderBottom: '1px solid var(--stroke)', display: 'flex', gap: '9px', flexWrap: 'wrap', alignItems: 'center' } },
          h('input', { value: q.desc || '', onChange: e => setQ({ desc: e.target.value }), onKeyDown: e => { if (e.key === 'Enter') this.addCompraCartao(c, month); }, placeholder: 'O que comprou?', style: this.inp({ flex: '2 1 180px' }) }),
          h('input', { inputMode: 'numeric', value: q.value ? q.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '', onChange: e => { const d = e.target.value.replace(/\D/g, ''); setQ({ value: d ? parseInt(d) / 100 : 0 }); }, onKeyDown: e => { if (e.key === 'Enter') this.addCompraCartao(c, month); }, placeholder: '0,00', style: this.inp({ flex: '0 1 120px' }) }),
          h('select', { value: q.category || '', onChange: e => setQ({ category: e.target.value }), style: this.inp({ flex: '1 1 140px' }) }, h('option', { value: '' }, 'Categoria…'), ...this.d.categories.map(x => h('option', { key: x.id, value: x.id }, x.name))),
          h('input', { title: 'Data da compra', type: 'date', value: q.date || dataPadrao, onChange: e => setQ({ date: e.target.value }), style: this.inp({ flex: '0 1 150px' }) }),
          this.otherUser() && this.chip('÷ dividir', !!q.split, () => setQ({ split: !q.split }), 'var(--plum)'),
          h('button', { onClick: () => this.addCompraCartao(c, month), style: this.btn('primary', { padding: '10px 14px' }) }, this.ico('M12 5v14M5 12h14', 17), 'Lançar')),
        compras.length === 0
          ? h('p', { style: { padding: '24px 20px', color: 'var(--muted)', fontSize: '.87rem', textAlign: 'center' } }, 'Nenhuma compra nesta fatura ainda. Lance acima ou importe o arquivo do banco.')
          : h('div', { style: { padding: '8px 10px' } }, ...compras.map(t => this.buyRow(t)))),
      // resumo dos outros cartões
      cartoes.length > 1 && h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '12px' } },
        ...cartoes.filter(x => x.id !== c.id).map(x => {
          const cs = this.comprasDaFatura(x, month);
          const tt = cs.reduce((a, t) => a + (t.value || 0), 0);
          return h('button', { key: x.id, onClick: () => this.setState({ cartaoSel: x.id }), style: this.glass({ padding: '14px 16px', borderLeft: '4px solid ' + x.color, cursor: 'pointer', textAlign: 'left', color: 'var(--ink)', border: '1px solid var(--stroke)' }) },
            h('div', { style: { fontWeight: 700, fontSize: '.9rem' } }, x.name),
            h('div', { style: { fontSize: '.72rem', color: 'var(--muted)' } }, `vence ${isoBR(this.vencFatura(x, month))} • ${cs.length} compra${cs.length === 1 ? '' : 's'}`),
            h('div', { style: this.disp({ fontSize: '1.1rem', marginTop: '4px' }) }, this.m(fmt(tt))));
        })));
  }
  addCompraCartao(card, month) {
    const q = this.state.compraRapida || {};
    if (!q.desc || !q.desc.trim()) return this.toast('Escreve o que comprou', 'err');
    if (!q.value || q.value <= 0) return this.toast('Coloca o valor', 'err');
    const me = this.me || {};
    const hoje = todayISO();
    const data = q.date || (this.faturaMesDe({ card: card.id, date: hoje, dueDate: hoje }) === month ? hoje : this.faturaClose(card, month));
    const tx = {
      id: uid(), desc: q.desc.trim(), value: q.value, type: 'despesa',
      category: q.category || '', card: card.id, faturaMes: month,
      date: data, dueDate: data, status: 'pendente', payMethod: 'Cartão',
      account: card.payAccount || '', owner: me.id, split: !!q.split,
      payerId: me.id, tags: [], notes: '', subcategory: '',
    };
    this.setState({ compraRapida: { date: data, category: q.category || '' } });
    this.save({ ...this.d, transactions: [...this.d.transactions, tx] }, () => this.toast('Lançado na fatura'));
  }
  pagarFatura(card, month, compras, paga) {
    const ids = compras.map(t => t.id);
    const conta = card.payAccount || (this.d.accounts[0] || {}).id || '';
    const trans = this.d.transactions.map(x => ids.includes(x.id)
      ? (paga ? { ...x, status: 'pendente', payDate: '' } : { ...x, status: 'pago', account: conta, payDate: todayISO() })
      : x);
    this.save({ ...this.d, transactions: trans }, () => this.toast(paga ? 'Fatura reaberta' : 'Fatura paga!', paga ? 'warn' : 'ok'));
  }
  /* Dias de pagamento (configuráveis). A 1ª quinzena é paga no primeiro dia,
     a 2ª no segundo. Cada conta cai numa delas pela data de vencimento, e
     você pode mover qualquer uma com um clique. */
  payDays() {
    const p = (this.d.meta && this.d.meta.payDays) || [10, 25];
    return [Math.max(1, parseInt(p[0]) || 10), Math.max(1, parseInt(p[1]) || 25)];
  }
  quinzenaDe(i) {
    const ov = (this.d.meta && this.d.meta.qOverride) || {};
    if (ov[i.id]) return ov[i.id];
    if (i.quinzena) return i.quinzena;
    const dia = parseInt(String(i.dueDate || i.date || '').slice(8), 10) || 1;
    return dia < this.payDays()[1] ? '1' : '2';
  }
  setQuinzena(i, q) {
    if (i.isFatura || i.isRec) {
      const meta = { ...(this.d.meta || {}), qOverride: { ...((this.d.meta || {}).qOverride || {}), [i.id]: q } };
      this.save({ ...this.d, meta }, () => this.toast(q === '1' ? 'Movido para a 1ª quinzena' : 'Movido para a 2ª quinzena'));
    } else {
      const alvo = i._srcId || i.id;
      this.save({ ...this.d, transactions: this.d.transactions.map(x => x.id === alvo ? { ...x, quinzena: q } : x) },
        () => this.toast(q === '1' ? 'Movido para a 1ª quinzena' : 'Movido para a 2ª quinzena'));
    }
  }
  /* O que você deve a ele naquele conjunto de contas, como uma linha só. */
  repasseDe(lista, chave) {
    const outro = this.otherUser(); if (!outro) return null;
    const compoem = lista.filter(i => !i.isRepasse && this.debt(i) > 0);
    const total = c2(compoem.reduce((a, i) => a + this.debt(i), 0));
    if (total <= 0) return null;
    const pagos = (this.d.meta && this.d.meta.repassePago) || {};
    return {
      id: 'repasse|' + chave, isRepasse: true, type: 'despesa',
      desc: 'Repasse para ' + outro.name.split(' ')[0],
      value: total, myValue: total, count: compoem.length, compoem,
      status: pagos[chave] ? 'pago' : 'pendente', payMethod: 'Pix', category: '',
      chaveRepasse: chave,
    };
  }
  marcaRepasse(item) {
    const chave = item.chaveRepasse;
    const pagos = { ...((this.d.meta || {}).repassePago || {}) };
    if (pagos[chave]) delete pagos[chave]; else pagos[chave] = todayISO();
    this.save({ ...this.d, meta: { ...(this.d.meta || {}), repassePago: pagos } },
      () => this.toast(pagos[chave] ? 'Repasse pago!' : 'Repasse reaberto', pagos[chave] ? 'ok' : 'warn'));
  }
  /* Contas que eu mesma pago; as que ele paga entram no repasse. */
  minhasDeSaida(lista) { return lista.filter(i => i.type === 'despesa' && this.paidByMe(i)); }
  blocoQuinzenas() {
    const month = this.state.month, today = todayISO();
    const [d1, d2] = this.payDays();
    const itens = this.monthItems(month);
    const shift = n => { const [y, m] = month.split('-'); this.setState({ month: new Date(+y, +m - 1 + n, 1).toISOString().slice(0, 7) }); };
    const ult = new Date(+month.slice(0, 4), +month.slice(5), 0).getDate();
    const painel = (q, dia, ate) => {
      const lista = itens.filter(i => this.quinzenaDe(i) === q);
      const ent = lista.filter(i => i.type === 'receita' && this.paidByMe(i));
      const rep = this.repasseDe(lista, month + '|' + q);
      const sai = this.minhasDeSaida(lista).sort((a, b) => (a.dueDate || a.date).localeCompare(b.dueDate || b.date));
      if (rep) { rep.dueDate = `${month}-${String(Math.min(dia, ult)).padStart(2, '0')}`; sai.push(rep); }
      const totEnt = ent.reduce((a, i) => a + this.myShare(i), 0);
      const totSai = sai.reduce((a, i) => a + this.myShare(i), 0);
      const pago = sai.filter(i => this.isDone(i)).reduce((a, i) => a + this.myShare(i), 0);
      const falta = totSai - pago;
      const receber = lista.reduce((a, i) => a + this.credit(i), 0);
      const dever = lista.reduce((a, i) => a + this.debt(i), 0);
      const pct = totSai > 0 ? Math.min(100, (pago / totSai) * 100) : 0;
      const atual = q === '1' ? (+today.slice(8) < d2) : (+today.slice(8) >= d2);
      const noMes = mk(today) === month;
      return h('div', { key: q, style: this.glass({ padding: '0', overflow: 'hidden', borderTop: `4px solid ${q === '1' ? 'var(--plum)' : 'var(--pink-deep)'}` }) },
        h('div', { style: { padding: '18px 20px 14px' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap' } },
            h('span', { style: this.disp({ fontSize: '1.05rem' }) }, q === '1' ? '1ª quinzena' : '2ª quinzena'),
            h('span', { style: { fontSize: '.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: 'var(--pink-soft)', color: 'var(--pink-deep)' } }, 'paga dia ' + dia),
            noMes && atual && h('span', { style: { fontSize: '.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: 'var(--pos-bg)', color: 'var(--pos)' } }, 'agora')),
          h('div', { style: { fontSize: '.74rem', color: 'var(--muted)', marginTop: '3px' } }, 'vencimentos ' + ate),
          h('div', { style: { display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap', marginTop: '12px' } },
            h('div', null,
              h('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' } }, 'Falta pagar'),
              h('div', { style: this.disp({ fontSize: '1.7rem', color: falta > 0 ? 'var(--neg)' : 'var(--pos)', lineHeight: 1.1 }) }, this.m(fmt(falta)))),
            h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginLeft: 'auto', textAlign: 'right' } },
              h('div', null, h('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700 } }, 'ENTRA'), h('div', { style: { fontWeight: 700, color: 'var(--pos)', fontSize: '.95rem' } }, this.m(fmt(totEnt)))),
              h('div', null, h('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700 } }, 'SAI'), h('div', { style: { fontWeight: 700, color: 'var(--neg)', fontSize: '.95rem' } }, this.m(fmt(totSai)))),
              h('div', null, h('div', { style: { fontSize: '.68rem', color: 'var(--muted)', fontWeight: 700 } }, 'SOBRA'), h('div', { style: { fontWeight: 700, color: totEnt - totSai >= 0 ? 'var(--pos)' : 'var(--neg)', fontSize: '.95rem' } }, this.m(fmt(totEnt - totSai)))))),
          h('div', { style: { height: '8px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden', marginTop: '12px' } },
            h('div', { style: { width: pct + '%', height: '100%', borderRadius: '999px', background: 'var(--pos)', transition: 'width .4s' } })),
          (receber > 0 || dever > 0) && h('div', { style: { marginTop: '10px', fontSize: '.76rem', color: 'var(--plum)', fontWeight: 700 } },
            [receber > 0 ? this.partner().split(' ')[0] + ' te deve ' + this.m(fmt(receber)) : '', dever > 0 ? 'você deve ' + this.m(fmt(dever)) : ''].filter(Boolean).join(' • '))),
        ent.length > 0 && h('div', { style: { padding: '4px 8px 8px', borderTop: '1px solid var(--stroke)' } },
          h('div', { style: { padding: '10px 10px 4px', fontSize: '.72rem', fontWeight: 700, color: 'var(--pos)', textTransform: 'uppercase', letterSpacing: '.05em' } }, 'Entradas'),
          ...ent.map(i => this.monthRow(i, today, q))),
        h('div', { style: { padding: '4px 8px 10px', borderTop: '1px solid var(--stroke)' } },
          h('div', { style: { padding: '10px 10px 4px', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' } }, `Contas (${sai.length})`),
          sai.length === 0
            ? h('p', { style: { color: 'var(--muted)', fontSize: '.85rem', padding: '4px 10px 8px' } }, 'Nada nesta quinzena.')
            : h('div', null, ...sai.map(i => this.monthRow(i, today, q)))));
    };
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('div', { style: this.glass({ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }) },
        h('button', { title: 'Mês anterior', onClick: () => shift(-1), style: this.btn('ghost', { padding: '9px 12px' }) }, this.ico('M15 6l-6 6 6 6', 18)),
        h('div', { style: { minWidth: '170px', textAlign: 'center' } }, h('div', { style: this.disp({ fontSize: '1.15rem', textTransform: 'capitalize' }) }, mkLong(month))),
        h('button', { title: 'Próximo mês', onClick: () => shift(1), style: this.btn('ghost', { padding: '9px 12px' }) }, this.ico('M9 6l6 6-6 6', 18)),
        h('div', { style: { flex: 1 } }),
        h('button', { onClick: () => this.setState({ month: todayISO().slice(0, 7) }), style: this.btn('soft', { fontSize: '.83rem' }) }, 'Mês atual')),
      h('div', { style: { display: 'grid', gridTemplateColumns: window.innerWidth < 1000 ? '1fr' : '1fr 1fr', gap: '16px', alignItems: 'start' } },
        painel('1', d1, `dia 1 ao ${d2 - 1}`),
        painel('2', d2, `dia ${d2} ao ${ult}`)));
  }
  blocoLista() {
    const s = this.state;
    let tx = this.d.transactions.slice();
    if (s.source === 'pix') tx = tx.filter(t => t.payMethod === 'Pix');
    else if (s.source === 'rec') tx = tx.filter(t => t.recurring);
    else if (s.source && s.source.startsWith('card:')) tx = tx.filter(t => t.card === s.source.slice(5));
    else if (s.source === 'outros') tx = tx.filter(t => !t.card && t.payMethod !== 'Pix' && !t.recurring);
    if (s.txType !== 'all') tx = tx.filter(t => t.type === s.txType);
    if (s.quem === 'me') tx = tx.filter(t => !t.split && !this.isForOther(t));
    else if (s.quem === 'other') tx = tx.filter(t => this.isForOther(t));
    else if (s.quem === 'split') tx = tx.filter(t => !!t.split);
    if (s.search.trim()) { const q = s.search.toLowerCase(); tx = tx.filter(t => (t.desc || '').toLowerCase().includes(q) || this.catName(t.category).toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q) || (t.tags || []).join(' ').toLowerCase().includes(q)); }
    tx.sort((a, b) => (b.dueDate || b.date).localeCompare(a.dueDate || a.date));
    const ent = tx.filter(t => t.type === 'receita').reduce((a, t) => a + this.myShare(t), 0);
    const sai = tx.filter(t => t.type === 'despesa').reduce((a, t) => a + this.myShare(t), 0);
    const activeCard = s.source.startsWith('card:') ? this.card(s.source.slice(5)) : null;

    const sources = [['all', 'Tudo'], ['pix', 'Pix'], ['rec', 'Recorrentes'], ...this.meusCartoes().map(c => ['card:' + c.id, c.name]), ['outros', 'Outros']];
    let lastMonth = '';
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      // atalhos rápidos
      h('div', { style: this.glass({ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }) },
        h('div', { style: { display: 'flex', gap: '9px', flexWrap: 'wrap', alignItems: 'center' } },
          h('span', { style: { fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)', marginRight: '2px' } }, 'Lançar rápido:'),
          h('button', { onClick: () => { this.openTx('add'); setTimeout(() => this.setF({ type: 'despesa', payMethod: 'Pix' }), 0); }, style: this.btn('soft', { padding: '8px 14px', fontSize: '.83rem' }) }, 'Saída no Pix'),
          h('button', { onClick: () => { this.openTx('add'); setTimeout(() => this.setF({ type: 'receita', payMethod: 'Pix', status: 'recebido' }), 0); }, style: this.btn('soft', { padding: '8px 14px', fontSize: '.83rem', background: 'var(--pos-bg)', color: 'var(--pos)' }) }, 'Entrada'),
          ...this.meusCartoes().map(c => h('button', { key: c.id, onClick: () => { this.openTx('add'); setTimeout(() => this.setF({ type: 'despesa', payMethod: 'Cartão', card: c.id }), 0); }, style: this.btn('ghost', { padding: '8px 14px', fontSize: '.83rem', borderColor: c.color, color: c.color }) }, c.name)),
          h('button', { onClick: () => { this.openTx('add'); setTimeout(() => this.setF({ type: 'despesa', recurring: 'mensal', more: true }), 0); }, style: this.btn('ghost', { padding: '8px 14px', fontSize: '.83rem' }) }, '↻ Recorrente')),
        h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          h('div', { style: { position: 'relative', flex: '1 1 220px' } },
            h('span', { style: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' } }, this.ico('M11 4a7 7 0 105 12 7 7 0 00-5-12zM21 21l-4-4', 17)),
            h('input', { value: s.search, onChange: e => this.setState({ search: e.target.value }), placeholder: 'Procurar lançamento…', style: this.inp({ paddingLeft: '40px' }) })),
          h('select', { value: s.txType, onChange: e => this.setState({ txType: e.target.value }), style: this.inp({ width: 'auto' }) }, h('option', { value: 'all' }, 'Entradas e saídas'), h('option', { value: 'receita' }, 'Só entradas'), h('option', { value: 'despesa' }, 'Só saídas')))),
      // filtros por origem
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, ...sources.map(([v, l]) => this.chip(l, s.source === v, () => this.setState({ source: v }), v.startsWith('card:') ? (this.card(v.slice(5)) || {}).color : null))),
      // filtro por dono
      this.otherUser() && h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
        h('span', { style: { fontSize: '.76rem', fontWeight: 700, color: 'var(--muted)' } }, 'De quem:'),
        ...[['all', 'Tudo'], ['me', 'Minhas'], ['other', 'De ' + this.partner()], ['split', 'Divididas']]
          .map(([v, l]) => this.chip(l, (s.quem || 'all') === v, () => this.setState({ quem: v }), 'var(--plum)'))),
      // resumo do cartão selecionado
      activeCard && this.cardStrip(activeCard),
      // totais
      h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
        h('div', { style: this.glass({ padding: '14px 18px', flex: '1 1 160px' }) }, h('div', { style: { fontSize: '.75rem', color: 'var(--muted)', fontWeight: 600 } }, 'Entradas'), h('div', { style: this.disp({ fontSize: '1.15rem', color: 'var(--pos)' }) }, this.m(fmt(ent)))),
        h('div', { style: this.glass({ padding: '14px 18px', flex: '1 1 160px' }) }, h('div', { style: { fontSize: '.75rem', color: 'var(--muted)', fontWeight: 600 } }, 'Saídas'), h('div', { style: this.disp({ fontSize: '1.15rem', color: 'var(--neg)' }) }, this.m(fmt(sai)))),
        h('div', { style: this.glass({ padding: '14px 18px', flex: '1 1 160px' }) }, h('div', { style: { fontSize: '.75rem', color: 'var(--muted)', fontWeight: 600 } }, `${tx.length} lançamento(s)`), h('div', { style: this.disp({ fontSize: '1.15rem', color: ent - sai >= 0 ? 'var(--pos)' : 'var(--neg)' }) }, this.m(fmt(ent - sai))))),
      tx.length === 0 ? this.empty('Nada por aqui ainda', 'Use os atalhos acima para lançar sua primeira movimentação — leva uns 5 segundos.', h('button', { onClick: () => this.openTx('add'), style: this.btn('primary') }, 'Lançar agora'), 'lollipop')
        : h('div', { style: this.glass({ padding: '10px' }) }, ...tx.map(t => {
          const mkey = mk(t.dueDate || t.date); let sep = null;
          if (mkey !== lastMonth) { lastMonth = mkey; sep = h('div', { key: 'h' + mkey, style: { padding: '12px 14px 6px', fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' } }, mkLong(mkey)); }
          return [sep, this.txRow(t)];
        })));
  }
  cardStrip(c) {
    const usado = this.d.transactions.filter(t => t.card === c.id && t.status !== 'pago').reduce((a, t) => a + t.value, 0);
    const p = c.limit > 0 ? (usado / c.limit) * 100 : 0;
    return h('div', { style: this.glass({ padding: '18px 20px', display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center', borderLeft: `4px solid ${c.color}` }) },
      h('div', { style: { flex: '1 1 200px' } },
        h('div', { style: this.disp({ fontSize: '1.02rem' }) }, c.name, h('span', { style: { fontWeight: 400, color: 'var(--muted)', fontSize: '.8rem' } }, '  ' + (c.brand || ''))),
        h('div', { style: { fontSize: '.78rem', color: 'var(--muted)' } }, `Fecha dia ${c.closeDay} • vence dia ${c.dueDay}`),
        h('div', { style: { height: '8px', borderRadius: '999px', background: 'var(--track)', marginTop: '8px', overflow: 'hidden' } }, h('div', { style: { width: Math.min(100, p) + '%', height: '100%', background: p > 85 ? 'var(--neg)' : c.color } })),
        h('div', { style: { fontSize: '.76rem', color: 'var(--muted)', marginTop: '5px' } }, `${this.m(fmt(usado))} em aberto de ${this.m(fmt(c.limit))} • ${pct(p)}`)),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('button', { onClick: () => this.openImport(c), style: this.btn('ghost', { fontSize: '.83rem' }) }, this.ico('M12 3v12m0 0l-4-4m4 4l4-4M5 21h14', 15), 'Importar fatura'),
        h('button', { onClick: () => { this.openTx('add'); setTimeout(() => this.setF({ type: 'despesa', payMethod: 'Cartão', card: c.id }), 0); }, style: this.btn('primary', { fontSize: '.83rem' }) }, this.ico('M12 5v14M5 12h14', 15), 'Lançar')));
  }
  txRow(t) {
    const rec = t.type === 'receita';
    const meu = this.myShare(t), partido = !!t.split || this.isForOther(t);
    const marca = t.split ? '÷ dividida' : (this.isForOther(t) ? 'de ' + this.ownerName(t) : '');
    const origem = this.origemLabel(t);
    const linha = [isoBR(t.dueDate || t.date), this.catName(t.category), origem].filter(Boolean).join(' · ');
    const acao = (title, path, onClick, color) => h('button', { title, onClick, style: this.iconBtn(color) }, this.ico(path, 15));
    return h('div', { key: t.id, style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 12px', borderRadius: '14px' } },
      h('div', { title: this.catName(t.category), style: { width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0, background: this.catColor(t.category) } }),
      h('div', { style: { flex: '1 1 140px', minWidth: 0 } },
        h('div', { style: { fontWeight: 600, fontSize: '.88rem', lineHeight: 1.3, textWrap: 'pretty' } }, t.desc,
          t.installments > 1 && h('span', { style: { fontWeight: 400, color: 'var(--muted)', fontSize: '.74rem' } }, `  ${t.installment}/${t.installments}`),
          t.recurring && h('span', { style: { color: 'var(--pink-deep)', fontWeight: 700, fontSize: '.72rem' } }, '  ↻')),
        h('div', { style: { fontSize: '.73rem', color: 'var(--muted)', marginTop: '1px', textWrap: 'pretty' } }, linha,
          marca && h('span', { style: { color: 'var(--plum)', fontWeight: 700 } }, '  · ' + marca))),
      this.isDone(t) && h('span', { title: rec ? 'recebido' : 'pago', style: { color: 'var(--pos)', flexShrink: 0, display: 'grid' } }, this.ico('M20 6L9 17l-5-5', 15)),
      this.valueCell(t, rec, false),
      h('div', { style: { display: 'flex', gap: '1px', opacity: .5, flexShrink: 0 } },
        acao('Editar', 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z', () => this.openTx('edit', t)),
        acao('Duplicar', 'M8 8h12v12H8zM4 16V4h12', () => this.dupTx(t)),
        acao('Excluir', 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14', () => this.delTx(t.id), 'var(--neg)')));
  }
  // edição rápida de valor (clique no valor)
  valueCell(item, positive, compact, cheio) {
    const ed = this.state.editVal;
    const w = compact ? '86px' : '96px';
    const fs = compact ? '.88rem' : '1rem';
    if (ed && ed.id === item.id) {
      return h('div', { style: { display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 } },
        h('input', { autoFocus: true, inputMode: 'numeric', value: ed.value ? ed.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '', onChange: e => { const dg = e.target.value.replace(/\D/g, ''); this.setState({ editVal: { ...ed, value: dg ? parseInt(dg) / 100 : 0 } }); }, onKeyDown: e => { if (e.key === 'Enter') this.commitEdit(); if (e.key === 'Escape') this.setState({ editVal: null }); }, style: this.inp({ width: '100px', padding: '6px 8px', fontSize: '.8rem', textAlign: 'right' }) }),
        h('button', { title: 'Salvar', onClick: () => this.commitEdit(), style: this.iconBtn('var(--pos)') }, this.ico('M20 6L9 17l-5-5', 15)),
        h('button', { title: 'Cancelar', onClick: () => this.setState({ editVal: null }), style: this.iconBtn() }, this.ico('M18 6L6 18M6 6l12 12', 15)));
    }
    // o valor exibido é sempre a SUA parte — o valor cheio só aparece ao editar
    const meu = cheio ? c2(item.value) : this.myShare(item);
    const partido = !cheio && (!!item.split || this.isForOther(item));
    const txt = (partido && meu === 0) ? '—' : (compact ? '' : (positive ? '+' : '−')) + this.m(fmt(meu));
    const col = (partido && meu === 0) ? 'var(--muted)' : compact && this.isDone(item) ? 'var(--muted)' : positive ? 'var(--pos)' : 'var(--ink)';
    const base = this.disp({ fontSize: fs, minWidth: w, textAlign: 'right', color: col });
    if (item.isFatura) return h('span', { title: 'Sua parte desta fatura', style: base }, txt);
    if (partido) return h('button', { title: 'Sua parte — clique para abrir o lançamento', onClick: () => this.openTx('edit', this.realTx(item)), style: { ...base, background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0' } }, txt);
    return h('button', { title: 'Clique para alterar o valor', onClick: () => this.setState({ editVal: { id: item.id, value: item.value, item } }), style: this.disp({ fontSize: fs, minWidth: w, textAlign: 'right', color: col, background: 'transparent', border: 'none', borderBottom: '1.5px dashed var(--line-dash)', cursor: 'pointer', padding: '2px 0' }) }, txt);
  }
  commitEdit() {
    const ed = this.state.editVal; if (!ed) return;
    const it = ed.item, v = ed.value;
    if (!v || v <= 0) { this.setState({ editVal: null }); return this.toast('Valor inválido', 'err'); }
    let data;
    if (it.isRec) {
      const real = { ...it, id: uid(), recSource: it.recSrcId, recurring: '', value: v };
      delete real.isRec; delete real.recSrcId;
      data = { ...this.d, transactions: [...this.d.transactions, real] };
    } else {
      data = { ...this.d, transactions: this.d.transactions.map(x => x.id === it.id ? { ...x, value: v } : x) };
    }
    this.save(data, () => this.toast('Valor atualizado'));
    this.setState({ editVal: null });
  }
  iconBtn(c = 'var(--muted)') { return { display: 'grid', placeItems: 'center', width: '32px', height: '32px', borderRadius: '10px', border: 'none', background: 'transparent', color: c, cursor: 'pointer' }; }

  /* ---------- 2. PLANEJAMENTO MENSAL ---------- */
  blocoMes() {
    const month = this.state.month;
    const items = this.monthItems(month);
    const ent = items.filter(i => i.type === 'receita' && this.paidByMe(i));
    const sai = this.minhasDeSaida(items);
    const rep = this.repasseDe(items, month + '|mes');
    if (rep) { rep.dueDate = month + '-' + String(Math.min(this.payDays()[1], new Date(+month.slice(0, 4), +month.slice(5), 0).getDate())).padStart(2, '0'); sai.push(rep); }
    const totEnt = ent.reduce((a, i) => a + this.myShare(i), 0);
    const totSai = sai.reduce((a, i) => a + this.myShare(i), 0);
    const pagoSai = sai.filter(i => this.isDone(i)).reduce((a, i) => a + this.myShare(i), 0);
    const acerto = this.settlement(month);
    const faltaSai = totSai - pagoSai;
    const today = todayISO();
    const shift = n => { const [y, m] = month.split('-'); const d = new Date(+y, +m - 1 + n, 1); this.setState({ month: d.toISOString().slice(0, 7) }); };
    const groups = [
      ['Vencidas', sai.filter(i => !this.isDone(i) && (i.dueDate || i.date) < today), 'var(--neg)'],
      ['A pagar', sai.filter(i => !this.isDone(i) && (i.dueDate || i.date) >= today), 'var(--warn)'],
      ['Já paguei', sai.filter(i => this.isDone(i)), 'var(--pos)'],
    ];
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('div', { style: this.glass({ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }) },
        h('button', { title: 'Mês anterior', onClick: () => shift(-1), style: this.btn('ghost', { padding: '9px 12px' }) }, this.ico('M15 6l-6 6 6 6', 18)),
        h('div', { style: { minWidth: '180px', textAlign: 'center' } }, h('div', { style: this.disp({ fontSize: '1.2rem', textTransform: 'capitalize' }) }, mkLong(month))),
        h('button', { title: 'Próximo mês', onClick: () => shift(1), style: this.btn('ghost', { padding: '9px 12px' }) }, this.ico('M9 6l6 6-6 6', 18)),
        h('div', { style: { flex: 1 } }),
        h('button', { onClick: () => this.setState({ month: todayISO().slice(0, 7) }), style: this.btn('soft', { fontSize: '.83rem' }) }, 'Mês atual')),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' } },
        this.stat('Entra no mês', totEnt, 'var(--pos)'),
        this.stat('Sai no mês', totSai, 'var(--neg)'),
        this.stat('Ainda falta pagar', faltaSai, 'var(--warn)'),
        this.stat('Sobra prevista', totEnt - totSai, totEnt - totSai >= 0 ? 'var(--pos)' : 'var(--neg)')),
      // progresso
      h('div', { style: this.glass({ padding: '18px 22px', position: 'relative' }) },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '9px', alignItems: 'baseline' } },
          h('span', { style: { fontWeight: 700, fontSize: '.9rem' } }, 'Contas do mês pagas'),
          h('span', { style: this.disp({ color: 'var(--pink-deep)' }) }, this.state.hideValues ? '••' : pct(totSai > 0 ? pagoSai / totSai * 100 : 0))),
        h('div', { style: { height: '13px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' } },
          h('div', { style: { width: (totSai > 0 ? Math.min(100, pagoSai / totSai * 100) : 0) + '%', height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,var(--pink),var(--coral))', transition: 'width .5s' } }))),
      // acerto com o parceiro
      (acerto.receber > 0 || acerto.pagar > 0) && h('div', { style: this.glass({ padding: '18px 22px', display: 'flex', gap: '18px', flexWrap: 'wrap', alignItems: 'center', borderLeft: '4px solid var(--plum)' }) },
        h('div', { style: { flex: '1 1 200px' } },
          h('div', { style: this.disp({ fontSize: '1rem' }) }, 'Acerto com ' + this.partner()),
          h('div', { style: { fontSize: '.78rem', color: 'var(--muted)' } }, 'o que vocês pagaram um pelo outro neste mês')),
        h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap' } },
          h('div', { style: { padding: '10px 16px', borderRadius: '16px', background: 'var(--pos-bg)' } },
            h('div', { style: { fontSize: '.72rem', color: 'var(--muted)', fontWeight: 700 } }, this.partner().split(' ')[0] + ' te deve'),
            h('div', { style: this.disp({ fontSize: '1.1rem', color: 'var(--pos)' }) }, this.m(fmt(acerto.receber)))),
          h('div', { style: { padding: '10px 16px', borderRadius: '16px', background: 'var(--neg-bg)' } },
            h('div', { style: { fontSize: '.72rem', color: 'var(--muted)', fontWeight: 700 } }, 'Você deve a ' + this.partner().split(' ')[0]),
            h('div', { style: this.disp({ fontSize: '1.1rem', color: 'var(--neg)' }) }, this.m(fmt(acerto.pagar)))),
          h('div', { style: { padding: '10px 16px', borderRadius: '16px', background: 'var(--pink-soft)' } },
            h('div', { style: { fontSize: '.72rem', color: 'var(--pink-deep)', fontWeight: 700 } }, 'No fim das contas'),
            h('div', { style: this.disp({ fontSize: '1rem', color: 'var(--pink-deep)' }) },
              acerto.saldo === 0 ? 'estão quites'
                : (acerto.saldo > 0 ? this.partner().split(' ')[0] + ' te deve ' : 'você deve ') + this.m(fmt(Math.abs(acerto.saldo))))))),
      items.length === 0 ? this.empty('Mês vazio', 'Nenhuma conta neste mês. Use "Novo lançamento" ou marque despesas como recorrentes.', h('button', { onClick: () => this.openTx('add'), style: this.btn('primary') }, 'Lançar agora'), 'wine')
        : h('div', { style: { display: 'grid', gridTemplateColumns: window.innerWidth < 1000 ? '1fr' : '1.55fr 1fr', gap: '16px', alignItems: 'start' } },
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
            ...groups.filter(([, l]) => l.length).map(([label, list, color]) =>
              h('div', { key: label, style: this.glass({ padding: '6px 8px 10px' }) },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 12px 8px' } },
                  h('span', { style: this.disp({ fontSize: '.96rem', color }) }, `${label} (${list.length})`),
                  h('span', { style: { fontWeight: 700, fontSize: '.88rem' } }, this.m(fmt(list.reduce((a, i) => a + this.myShare(i), 0))))),
                ...list.map(i => this.monthRow(i, today))))),
          h('div', { style: this.glass({ padding: '18px 20px' }) },
            this.head('Entradas do mês'),
            ent.length === 0 ? h('p', { style: { color: 'var(--muted)', fontSize: '.86rem' } }, 'Nenhuma entrada prevista.')
              : h('div', null, ...ent.map(i => this.monthRow(i, today))))));
  }
  // aba "Cartões de crédito" dentro do planejamento mensal
  mensalCartoes(month) {
    if (this.meusCartoes().length === 0) return this.empty('Nenhum cartão', 'Cadastre seus cartões em Configurações para lançar as compras da fatura aqui.', h('button', { onClick: () => this.setState({ view: 'config' }), style: this.btn('primary') }, 'Ir para Configurações'), 'queen-card');
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } }, ...this.meusCartoes().map(c => {
      const compras = this.comprasDaFatura(c, month);
      const total = compras.reduce((a, t) => a + t.value, 0);
      const minha = compras.reduce((a, t) => a + this.myShare(t), 0);
      return h('div', { key: c.id, style: this.glass({ padding: '0', overflow: 'hidden' }) },
        h('div', { style: { padding: '18px 22px', background: `linear-gradient(135deg,${c.color},${c.color}cc)`, color: '#fff', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' } },
          h('div', { style: { flex: '1 1 190px' } },
            h('div', { style: this.disp({ fontSize: '1.05rem' }) }, c.name),
            h('div', { style: { fontSize: '.75rem', opacity: .88 } }, `Fecha ${isoBR(this.faturaClose(c, month))} • vence ${isoBR(this.faturaDue(c, this.faturaClose(c, month)))}`)),
          h('div', { style: { textAlign: 'right' } },
            h('div', { style: { fontSize: '.72rem', opacity: .88 } }, 'Sua parte'),
            h('div', { style: this.disp({ fontSize: '1.4rem' }) }, this.m(fmt(minha))),
            minha !== total && h('div', { style: { fontSize: '.72rem', opacity: .8 } }, 'fatura inteira ' + this.m(fmt(total))))),
        h('div', { style: { padding: '14px 18px', display: 'flex', gap: '9px', flexWrap: 'wrap', borderBottom: compras.length ? '1px solid var(--stroke)' : 'none' } },
          h('button', { onClick: () => this.openCardBuy(c, month), style: this.btn('primary', { fontSize: '.83rem' }) }, this.ico('M12 5v14M5 12h14', 15), 'Lançar compra'),
          h('button', { onClick: () => this.openImport(c), style: this.btn('ghost', { fontSize: '.83rem' }) }, this.ico('M12 3v12m0 0l-4-4m4 4l4-4M5 21h14', 15), 'Importar PDF/CSV')),
        compras.length === 0 ? h('p', { style: { padding: '20px 22px', color: 'var(--muted)', fontSize: '.86rem' } }, 'Nenhuma compra nesta fatura ainda. Lance manualmente ou importe o arquivo do banco.')
          : h('div', { style: { padding: '8px 10px' } }, ...compras.map(t => this.buyRow(t))));
    }));
  }
  buyRow(t) {
    const split = !!t.split;
    return h('div', { key: t.id, style: { display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '14px', flexWrap: 'wrap' } },
      h('span', { style: { width: '34px', flexShrink: 0, fontSize: '.74rem', fontWeight: 700, color: 'var(--muted)', textAlign: 'center' } }, isoBR(t.dueDate || t.date).slice(0, 5)),
      h('div', { style: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: this.catColor(t.category) } }),
      h('div', { style: { flex: '1 1 150px', minWidth: 0 } },
        h('div', { style: { fontWeight: 600, fontSize: '.84rem', textWrap: 'pretty' } }, t.desc,
          t.installments > 1 && h('span', { style: { color: 'var(--muted)', fontWeight: 400, fontSize: '.73rem' } }, `  ${t.installment}/${t.installments}`)),
        split && h('div', { style: { fontSize: '.72rem', color: 'var(--plum)', fontWeight: 700 } }, `dividido • sua parte ${this.m(fmt(this.metade(t)))} • ${this.paidByMe(t) ? this.partner() + ' te deve' : 'você deve a ' + this.partner()}`),
        this.isForOther(t) && h('div', { style: { fontSize: '.72rem', color: 'var(--plum)', fontWeight: 700 } }, `conta de ${this.ownerName(t)}${this.credit(t) > 0 ? ' • ele(a) te deve ' + this.m(fmt(this.credit(t))) : ''}`)),
      h('button', { title: split ? 'Dividido — clique para desfazer' : `Dividir com ${this.partner()}`, onClick: () => this.toggleSplit(t), style: { padding: '5px 11px', borderRadius: '999px', border: split ? 'none' : '1px solid var(--stroke)', background: split ? 'var(--plum)' : 'transparent', color: split ? '#fff' : 'var(--muted)', fontWeight: 700, fontSize: '.72rem', cursor: 'pointer', flexShrink: 0 } }, '÷ 50%'),
      this.valueCell(t, false, true, true),
      h('button', { title: 'Editar', onClick: () => this.openTx('edit', t), style: this.iconBtn() }, this.ico('M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z', 14)),
      h('button', { title: 'Excluir', onClick: () => this.delTx(t.id), style: this.iconBtn('var(--neg)') }, this.ico('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14', 14)));
  }
  toggleSplit(t) {
    const data = { ...this.d, transactions: this.d.transactions.map(x => x.id === t.id ? { ...x, split: !x.split, payerId: this.payerOf(x) } : x) };
    this.save(data, () => this.toast(t.split ? 'Divisão removida' : 'Dividido 50/50'));
  }
  openCardBuy(c, month) {
    this.openTx('add');
    const hoje = todayISO(), fecha = this.faturaClose(c, month);
    // se hoje já cai nesta fatura, usa hoje; senão, o último dia que ainda entra nela
    const dia = mk(this.faturaDue(c, hoje)) === month ? hoje : fecha;
    setTimeout(() => this.setF({ type: 'despesa', payMethod: 'Cartão', card: c.id, faturaMes: month, date: dia, dueDate: dia, status: 'pendente', more: true }), 0);
  }
  stat(label, v, color) { return h('div', { style: this.glass({ padding: '14px 16px', borderLeft: '3px solid ' + (color || 'var(--pink)') }) }, h('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' } }, label), h('div', { style: this.disp({ fontSize: 'clamp(1.1rem,2vw,1.35rem)', color }) }, this.m(fmt(v)))); }
  monthRow(i, today, quinzena) {
    const done = this.isDone(i);
    const dd = dayDiff(today, i.dueDate || i.date);
    const late = !done && dd < 0;
    const isRec = i.type === 'receita';
    return h('div', { key: i.id, style: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '14px', opacity: done ? .6 : 1 } },
      h('button', { title: done ? 'Desmarcar' : 'Marcar como ' + (isRec ? 'recebido' : 'pago'), onClick: () => i.isRepasse ? this.marcaRepasse(i) : this.toggleDone(i), style: { width: '26px', height: '26px', flexShrink: 0, borderRadius: '9px', cursor: 'pointer', border: done ? 'none' : `2px solid ${late ? 'var(--neg)' : 'var(--stroke)'}`, background: done ? 'var(--pos)' : 'transparent', color: '#fff', display: 'grid', placeItems: 'center' } }, done && this.ico('M20 6L9 17l-5-5', 15)),
      h('span', { style: { width: '34px', flexShrink: 0, fontSize: '.74rem', fontWeight: 700, color: late ? 'var(--neg)' : 'var(--muted)', textAlign: 'center' } }, isoBR(i.dueDate || i.date).slice(0, 5)),
      h('div', { style: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: i.isFatura ? i.cardRef.color : this.catColor(i.category) } }),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { fontWeight: 600, fontSize: '.83rem', lineHeight: 1.3, textDecoration: done ? 'line-through' : 'none', textWrap: 'pretty' } },
          i.isFatura ? i.desc : i.desc,
          i.isFatura && h('span', { style: { color: 'var(--muted)', fontWeight: 400, fontSize: '.72rem' } }, `  ${i.count} compra${i.count > 1 ? 's' : ''} • fatura inteira`),
          i.isRepasse && h('span', { style: { color: 'var(--muted)', fontWeight: 400, fontSize: '.72rem' } }, `  ${i.count} conta${i.count > 1 ? 's' : ''} dele`),
          i.isRec && h('span', { style: { color: 'var(--pink-deep)', fontWeight: 700, fontSize: '.72rem' } }, '  ↻'),
          i.installments > 1 && h('span', { style: { color: 'var(--muted)', fontWeight: 400, fontSize: '.72rem' } }, `  ${i.installment}/${i.installments}`)),
        !i.isFatura && i.split && h('div', { style: { fontSize: '.71rem', color: 'var(--plum)', fontWeight: 700 } }, `÷ sua parte ${this.m(fmt(this.myShare(i)))}${this.credit(i) > 0 ? ' • a receber ' + this.m(fmt(this.credit(i))) : ''}${this.debt(i) > 0 ? ' • você deve ' + this.m(fmt(this.debt(i))) : ''}`),
        this.isForOther(i) && h('div', { style: { fontSize: '.71rem', color: 'var(--plum)', fontWeight: 700 } }, `conta de ${this.ownerName(i)}${this.credit(i) > 0 ? ' • ele(a) te deve ' + this.m(fmt(this.credit(i))) : ''}`),
        i.isFatura && (i.creditVal > 0 || i.debtVal > 0) && h('div', { style: { fontSize: '.71rem', color: 'var(--plum)', fontWeight: 700 } }, `sua parte ${this.m(fmt(i.myValue))}${i.creditVal > 0 ? ' • ' + this.partner().split(' ')[0] + ' te deve ' + this.m(fmt(i.creditVal)) : ''}`),
        !i.split && !this.isForOther(i) && this.debt(i) > 0 && h('div', { style: { fontSize: '.71rem', color: 'var(--plum)', fontWeight: 700 } }, `${this.partner()} pagou • você deve ${this.m(fmt(this.debt(i)))}`)),
      this.valueCell(i, isRec, true),
      quinzena && h('button', { title: quinzena === '1' ? 'Mover para a 2ª quinzena (dia ' + this.payDays()[1] + ')' : 'Mover para a 1ª quinzena (dia ' + this.payDays()[0] + ')', onClick: () => this.setQuinzena(i, quinzena === '1' ? '2' : '1'), style: { padding: '4px 9px', borderRadius: '999px', border: '1px solid var(--stroke)', background: 'transparent', color: 'var(--muted)', fontWeight: 700, fontSize: '.68rem', cursor: 'pointer', flexShrink: 0 } }, quinzena === '1' ? '→ 2ª' : '← 1ª'),
      i.isRepasse ? h('button', { title: 'Ver o que compõe este repasse', onClick: () => this.setState({ modal: { type: 'repasse', payload: i } }), style: this.iconBtn() }, this.ico('M12 8h.01M11 12h1v4h1M12 3a9 9 0 100 18 9 9 0 000-18z', 14)) :
      i.isFatura ? h('button', { title: 'Ver compras deste cartão', onClick: () => this.setState({ view: 'lancamentos', source: 'card:' + i.cardRef.id }), style: this.iconBtn() }, this.ico('M2 6h20v12H2zM2 10h20', 14))
        : i.isRec ? h('span', { style: { width: '32px' } })
          : h('button', { title: 'Editar', onClick: () => this.openTx('edit', i), style: this.iconBtn() }, this.ico('M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z', 14)));
  }

  /* ---------- 3. RELATÓRIO ANUAL ---------- */
  viewAnual() {
    const y = this.state.year;
    const months = Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`);
    const txY = this.d.transactions.filter(t => (t.dueDate || t.date).slice(0, 4) === String(y));
    const rowFor = k => {
      const list = txY.filter(t => mk(t.dueDate || t.date) === k);
      const e = list.filter(t => t.type === 'receita').reduce((a, t) => a + this.myShare(t), 0);
      const s = list.filter(t => t.type === 'despesa').reduce((a, t) => a + this.myShare(t), 0);
      return { e, s, r: e - s };
    };
    const rows = months.map(rowFor);
    const totE = rows.reduce((a, r) => a + r.e, 0), totS = rows.reduce((a, r) => a + r.s, 0);
    // matriz categoria × mês
    const catTotals = {};
    txY.filter(t => t.type === 'despesa').forEach(t => {
      catTotals[t.category] = catTotals[t.category] || { total: 0, m: Array(12).fill(0) };
      catTotals[t.category].total += this.myShare(t);
      catTotals[t.category].m[+mk(t.dueDate || t.date).slice(5) - 1] += this.myShare(t);
    });
    const catRows = Object.entries(catTotals).sort((a, b) => b[1].total - a[1].total);
    const maxCat = catRows.length ? catRows[0][1].total : 1;
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('div', { style: this.glass({ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }) },
        h('button', { onClick: () => this.setState({ year: y - 1 }), style: this.btn('ghost', { padding: '9px 12px' }) }, this.ico('M15 6l-6 6 6 6', 18)),
        h('div', { style: this.disp({ fontSize: '1.3rem', minWidth: '80px', textAlign: 'center' }) }, y),
        h('button', { onClick: () => this.setState({ year: y + 1 }), style: this.btn('ghost', { padding: '9px 12px' }) }, this.ico('M9 6l6 6-6 6', 18)),
        h('div', { style: { flex: 1 } }),
        h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
          h('button', { onClick: () => this.exportAnualPDF(), style: this.btn('ghost', { fontSize: '.83rem' }) }, this.ico('M6 2h9l5 5v15H6zM15 2v5h5M9 13h6M9 17h6', 15), 'PDF do ano'),
          h('button', { onClick: () => this.exportAnualXLSX(), style: this.btn('ghost', { fontSize: '.83rem' }) }, this.ico('M4 4h16v16H4zM4 9h16M10 9v11', 15), 'Excel do ano'),
          h('button', { onClick: () => this.exportCSV(), style: this.btn('ghost', { fontSize: '.83rem' }) }, this.ico('M12 3v12m0 0l-4-4m4 4l4-4M5 21h14', 15), 'CSV'))),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' } },
        this.stat('Entradas no ano', totE, 'var(--pos)'),
        this.stat('Saídas no ano', totS, 'var(--neg)'),
        this.stat('Resultado', totE - totS, totE - totS >= 0 ? 'var(--pos)' : 'var(--neg)'),
        this.stat('Média de saídas/mês', totS / 12, 'var(--plum)')),
      h('div', { style: this.glass({ padding: '20px 22px', position: 'relative' }) }, this.head('Entradas × Saídas', 'mês a mês'), h('div', { style: { height: '260px' } }, h('canvas', { id: 'ch-year' }))),
      // tabela mensal
      h('div', { style: this.glass({ padding: '20px 22px', overflowX: 'auto' }) }, this.head('Resumo mensal'),
        h('div', { style: { minWidth: '520px' } },
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr repeat(3,1fr)', gap: '8px', padding: '0 4px 9px', borderBottom: '1px solid var(--stroke)', fontSize: '.74rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' } },
            h('span', null, 'Mês'), h('span', { style: { textAlign: 'right' } }, 'Entradas'), h('span', { style: { textAlign: 'right' } }, 'Saídas'), h('span', { style: { textAlign: 'right' } }, 'Resultado')),
          ...months.map((k, i) => {
            const r = rows[i]; const cur = k === todayISO().slice(0, 7);
            if (!r.e && !r.s) return h('div', { key: k, style: { display: 'grid', gridTemplateColumns: '1fr repeat(3,1fr)', gap: '8px', padding: '9px 4px', borderBottom: '1px solid var(--stroke)', opacity: .4, fontSize: '.84rem' } }, h('span', null, MONTHS[i]), h('span', { style: { textAlign: 'right' } }, '—'), h('span', { style: { textAlign: 'right' } }, '—'), h('span', { style: { textAlign: 'right' } }, '—'));
            return h('div', { key: k, style: { display: 'grid', gridTemplateColumns: '1fr repeat(3,1fr)', gap: '8px', padding: '10px 4px', borderBottom: '1px solid var(--stroke)', fontSize: '.86rem', background: cur ? 'var(--pink-soft)' : 'transparent', borderRadius: cur ? '10px' : 0 } },
              h('span', { style: { fontWeight: cur ? 700 : 500 } }, MONTHS[i]),
              h('span', { style: { textAlign: 'right', color: 'var(--pos)' } }, this.m(fmtK(r.e))),
              h('span', { style: { textAlign: 'right', color: 'var(--neg)' } }, this.m(fmtK(r.s))),
              h('span', { style: { textAlign: 'right', fontWeight: 700, color: r.r >= 0 ? 'var(--pos)' : 'var(--neg)' } }, this.m(fmtK(r.r))));
          }),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr repeat(3,1fr)', gap: '8px', padding: '12px 4px 0', fontSize: '.9rem', fontWeight: 700 } },
            h('span', null, 'Total'), h('span', { style: { textAlign: 'right', color: 'var(--pos)' } }, this.m(fmtK(totE))), h('span', { style: { textAlign: 'right', color: 'var(--neg)' } }, this.m(fmtK(totS))), h('span', { style: { textAlign: 'right', color: totE - totS >= 0 ? 'var(--pos)' : 'var(--neg)' } }, this.m(fmtK(totE - totS)))))),
      // despesas por categoria no ano
      h('div', { style: this.glass({ padding: '20px 22px' }) }, this.head('Saídas por categoria', 'total do ano'),
        catRows.length === 0 ? h('p', { style: { color: 'var(--muted)', fontSize: '.87rem' } }, 'Sem saídas registradas neste ano.')
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '11px' } }, ...catRows.map(([cid, v]) =>
            h('div', { key: cid },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '.86rem', marginBottom: '5px' } },
                h('span', { style: { fontWeight: 600 } }, this.catName(cid)),
                h('span', null, this.m(fmt(v.total)), h('span', { style: { color: 'var(--muted)', fontSize: '.76rem' } }, '  ' + pct(totS ? v.total / totS * 100 : 0)))),
              h('div', { style: { height: '9px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' } },
                h('div', { style: { width: (v.total / maxCat * 100) + '%', height: '100%', background: this.catColor(cid) } })))))),
      // matriz categoria × mês
      catRows.length > 0 && h('div', { style: this.glass({ padding: '20px 22px', overflowX: 'auto' }) }, this.head('Categoria mês a mês'),
        h('div', { style: { minWidth: '760px' } },
          h('div', { style: { display: 'grid', gridTemplateColumns: '140px repeat(12,1fr)', gap: '4px', paddingBottom: '8px', borderBottom: '1px solid var(--stroke)', fontSize: '.68rem', fontWeight: 700, color: 'var(--muted)' } },
            h('span', null, ''), ...MONTHS_S.map(m => h('span', { key: m, style: { textAlign: 'center' } }, m))),
          ...catRows.map(([cid, v]) => h('div', { key: cid, style: { display: 'grid', gridTemplateColumns: '140px repeat(12,1fr)', gap: '4px', padding: '6px 0', borderBottom: '1px solid var(--stroke)', alignItems: 'center' } },
            h('span', { style: { fontSize: '.76rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' } }, h('span', { style: { width: '7px', height: '7px', borderRadius: '50%', background: this.catColor(cid), flexShrink: 0 } }), h('span', { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, this.catName(cid))),
            ...v.m.map((val, i) => h('span', { key: i, title: val ? fmt(val) : '', style: { textAlign: 'center', fontSize: '.68rem', padding: '4px 2px', borderRadius: '7px', fontWeight: val ? 700 : 400, color: val ? '#fff' : 'var(--muted)', background: val ? this.catColor(cid) + (val > maxCat / 12 ? 'ee' : '99') : 'transparent' } }, val ? this.m(Math.round(val / 100) / 10 + 'k').replace('0k', 'k') : '·')))))));
  }

  /* ---------- 4. METAS / INVESTIMENTOS ---------- */
  viewMetas() {
    const gs = this.metasFiltradas();
    const totalGuardado = gs.reduce((a, g) => a + (g.saved || 0), 0);
    const totalObjetivo = gs.reduce((a, g) => a + (g.total || 0), 0);
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px' } },
        this.stat('Total investido', totalGuardado, 'var(--pos)'),
        this.stat('Objetivo total', totalObjetivo, 'var(--plum)'),
        this.stat('Falta guardar', Math.max(0, totalObjetivo - totalGuardado), 'var(--pink-deep)')),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' } },
        this.otherUser()
          ? h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            ...[['todas', 'Todas'], ['conjuntas', 'Conjuntas'], ['minhas', 'Só minhas']].map(([v, l]) =>
              this.chip(l, (this.state.metaAba || 'todas') === v, () => this.setState({ metaAba: v }), 'var(--plum)')))
          : h('div'),
        h('button', { onClick: () => this.openGoal('add'), style: this.btn('primary') }, this.ico('M12 5v14M5 12h14', 17), 'Nova meta')),
      gs.length === 0 ? this.empty('Sem metas ainda', 'Cadastre onde você quer chegar: reserva de emergência, investimentos, uma viagem. Acompanhe o progresso mês a mês.', h('button', { onClick: () => this.openGoal('add'), style: this.btn('primary') }, 'Criar primeira meta'), 'ticket')
        : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: '16px' } }, ...gs.map(g => this.goalTile(g))));
  }
  goalTile(g) {
    const p = g.total > 0 ? (g.saved / g.total) * 100 : 0;
    const rest = Math.max(0, g.total - g.saved);
    const monthsLeft = g.date ? Math.max(0, Math.ceil(dayDiff(todayISO(), g.date) / 30)) : null;
    const perMonth = monthsLeft ? rest / monthsLeft : (g.monthly || 0);
    const prC = { alta: 'var(--neg)', 'média': 'var(--warn)', baixa: 'var(--pos)' }[g.priority] || 'var(--plum)';
    return h('div', { key: g.id, style: this.glass({ padding: '22px' }) },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' } },
        h('div', null,
          h('div', { style: this.disp({ fontSize: '1.06rem' }) }, g.name),
          h('div', { style: { display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' } },
            g.kind && h('span', { style: { fontSize: '.69rem', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: 'var(--pink-soft)', color: 'var(--pink-deep)' } }, g.kind),
            h('span', { style: { fontSize: '.69rem', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: prC + '22', color: prC } }, 'prioridade ' + (g.priority || '—')),
            g.shared && this.otherUser() && h('span', { style: { fontSize: '.69rem', fontWeight: 700, padding: '3px 9px', borderRadius: '999px', background: 'rgba(142,92,134,.16)', color: 'var(--plum)' } }, 'conjunta com ' + this.partner().split(' ')[0]))),
        h('div', { style: { display: 'flex' } },
          h('button', { onClick: () => this.openGoal('edit', g), style: this.iconBtn() }, this.ico('M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z', 15)),
          h('button', { onClick: () => this.delGoal(g.id), style: this.iconBtn('var(--neg)') }, this.ico('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14', 15)))),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '16px 0 8px' } },
        h('span', { style: this.disp({ fontSize: '1.35rem', color: 'var(--pos)' }) }, this.m(fmt(g.saved))),
        h('span', { style: { color: 'var(--muted)', fontSize: '.86rem' } }, 'de ' + this.m(fmt(g.total)))),
      h('div', { style: { height: '13px', borderRadius: '999px', background: 'var(--track)', overflow: 'hidden' } },
        h('div', { style: { width: Math.min(100, p) + '%', height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,var(--pink),var(--coral))', transition: 'width .5s' } })),
      h('div', { style: { textAlign: 'right', fontSize: '.8rem', fontWeight: 700, color: 'var(--pink-deep)', marginTop: '6px' } }, this.state.hideValues ? '••' : pct(p)),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginTop: '14px' } },
        this.mini('Falta', this.m(fmt(rest))),
        this.mini('Por mês', this.m(fmt(perMonth))),
        this.mini('Meses restantes', monthsLeft !== null ? monthsLeft : '—'),
        this.mini('Data alvo', g.date ? isoBR(g.date) : '—')),
      h('button', { onClick: () => this.setState({ modal: { type: 'aporte', payload: g }, form: { amount: 0 } }), style: this.btn('soft', { width: '100%', justifyContent: 'center', marginTop: '13px' }) }, this.ico('M12 5v14M5 12h14', 16), 'Registrar aporte'));
  }
  mini(l, v) { return h('div', { style: { background: 'var(--surface-soft)', border: '1px solid var(--stroke)', borderRadius: '14px', padding: '9px 12px' } }, h('div', { style: { fontSize: '.7rem', color: 'var(--muted)', fontWeight: 600 } }, l), h('div', { style: { fontWeight: 700, fontSize: '.88rem' } }, v)); }
  openGoal(mode, g) { this.setState({ modal: { type: 'goal', mode }, form: g ? { ...g } : { name: '', kind: 'Reserva', total: 0, saved: 0, date: '', priority: 'média', monthly: 0 } }); }
  saveGoal() {
    const f = this.state.form;
    if (!f.name) return this.toast('Dá um nome pra meta', 'err');
    if (!f.total || f.total <= 0) return this.toast('Informe o objetivo', 'err');
    const goals = [...(this.d.goals || [])];
    if (this.state.modal.mode === 'edit') { const i = goals.findIndex(g => g.id === f.id); goals[i] = { ...f }; } else goals.push({ ...f, id: uid() });
    this.save({ ...this.d, goals }, () => this.toast('Meta salva'));
    this.setState({ modal: null });
  }
  delGoal(id) { this.setState({ confirm: { msg: 'Excluir esta meta?', onYes: () => { this.save({ ...this.d, goals: this.d.goals.filter(g => g.id !== id) }, () => this.toast('Excluída', 'warn')); this.setState({ confirm: null }); } } }); }
  confirmAporte() { const g = this.state.modal.payload; this.save({ ...this.d, goals: this.d.goals.map(x => x.id === g.id ? { ...x, saved: (x.saved || 0) + (this.state.form.amount || 0) } : x) }, () => this.toast('Aporte registrado!')); this.setState({ modal: null }); }

  /* ---------- 5. CONFIGURAÇÕES ---------- */
  viewConfig() {
    const tog = (label, on, fn) => h('button', { onClick: fn, style: { display: 'flex', alignItems: 'center', gap: '11px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', padding: 0 } },
      h('div', { style: { width: '46px', height: '27px', borderRadius: '999px', background: on ? 'var(--pink)' : 'var(--track-strong)', position: 'relative', transition: 'background .2s' } },
        h('div', { style: { width: '21px', height: '21px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: on ? '22px' : '3px', transition: 'left .2s', boxShadow: '0 2px 5px rgba(0,0,0,.2)' } })),
      h('span', { style: { fontSize: '.9rem' } }, label));
    const me = this.me, other = this.otherUser();
    return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      // conta e acesso
      h('div', { style: this.glass({ padding: '22px' }) }, this.head('Conta e acesso', 'cada pessoa vê só os próprios lançamentos'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' } },
          h('div', { style: { width: '44px', height: '44px', borderRadius: '50%', background: 'var(--pink)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '1.05rem' } }, (me.name || '?').slice(0, 1).toUpperCase()),
          h('div', { style: { flex: 1, minWidth: '130px' } },
            h('div', { style: { fontWeight: 700 } }, me.name),
            h('div', { style: { fontSize: '.76rem', color: 'var(--muted)' } }, me.login)),
          h('button', { onClick: () => this.setState({ modal: { type: 'pw' }, form: {} }), style: this.btn('soft', { fontSize: '.83rem' }) }, 'Trocar senha'),
          h('button', { onClick: () => this.logout(), style: this.btn('ghost', { fontSize: '.83rem' }) }, 'Sair')),
        h('div', { style: { marginTop: '14px', padding: '13px 15px', borderRadius: '16px', background: 'var(--pink-soft)', color: 'var(--pink-deep)', fontSize: '.83rem', lineHeight: 1.5 } },
          other ? `Ao lançar uma despesa você escolhe de quem ela é: sua, de ${other.name} (aparece para os dois, mas não entra nas suas contas) ou dividida 50/50. Quem pagou o quê vai para o acerto.` : 'Para dividir despesas com outra pessoa, crie o segundo usuário no painel do Supabase (Authentication › Users) — ele aparece aqui sozinho. Depois, o que for marcado como dividido aparece para vocês dois.'),
        other && h('div', { style: { marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--stroke)', flexWrap: 'wrap' } },
          h('div', { style: { width: '34px', height: '34px', borderRadius: '50%', background: 'var(--pink-soft)', color: 'var(--pink-deep)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '.85rem' } }, (other.name || '?').slice(0, 1).toUpperCase()),
          h('div', { style: { flex: 1, minWidth: '120px' } },
            h('div', { style: { fontWeight: 600, fontSize: '.88rem' } }, other.name),
            h('div', { style: { fontSize: '.74rem', color: 'var(--muted)' } }, other.login + ' • segunda conta')),
          h('button', { onClick: () => this.delUser(other), style: this.btn('ghost', { fontSize: '.8rem', color: 'var(--neg)', borderColor: 'var(--stroke)' }) }, 'Apagar dados')),
        h('div', { style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--stroke)' } },
          h('button', { onClick: () => this.delUser(me), style: this.btn('ghost', { fontSize: '.8rem', color: 'var(--neg)' }) }, 'Apagar meus dados'),
          h('button', { onClick: () => this.resetAll(), style: this.btn('ghost', { fontSize: '.8rem', color: 'var(--neg)' }) }, 'Recomeçar do zero'))),
      // cartões
      h('div', { style: this.glass({ padding: '22px' }) },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' } },
          h('h2', { style: this.disp({ fontSize: '1.12rem' }) }, 'Cartões'),
          h('button', { onClick: () => this.openCard('add'), style: this.btn('soft', { fontSize: '.83rem' }) }, '+ Novo cartão')),
        this.d.cards.filter(c => !c._foreign).length === 0 ? h('p', { style: { color: 'var(--muted)', fontSize: '.87rem' } }, 'Nenhum cartão cadastrado.')
          : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '12px' } }, ...this.d.cards.filter(c => !c._foreign).map(c => {
            const usado = this.d.transactions.filter(t => t.card === c.id && t.status !== 'pago').reduce((a, t) => a + t.value, 0);
            return h('div', { key: c.id, style: { borderRadius: '20px', padding: '16px 18px', background: `linear-gradient(135deg,${c.color},${c.color}cc)`, color: '#fff' } },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
                h('div', null, h('div', { style: this.disp({ fontSize: '1rem' }) }, c.name), h('div', { style: { fontSize: '.74rem', opacity: .85 } }, `${c.brand || ''} • fecha ${c.closeDay} • vence ${c.dueDay}`)),
                h('div', { style: { display: 'flex' } },
                  h('button', { onClick: () => this.openCard('edit', c), style: this.iconBtn('#fff') }, this.ico('M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z', 14)),
                  h('button', { onClick: () => this.delCard(c.id), style: this.iconBtn('#fff') }, this.ico('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14', 14)))),
              h('div', { style: { marginTop: '14px', fontSize: '.72rem', opacity: .85 } }, 'Em aberto'),
              h('div', { style: this.disp({ fontSize: '1.3rem' }) }, this.m(fmt(usado))),
              h('button', { onClick: () => this.openImport(c), style: { marginTop: '12px', width: '100%', padding: '9px', borderRadius: '999px', border: '1px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.18)', color: '#fff', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' } }, 'Importar fatura (PDF/CSV)'));
          }))),
      // contas
      h('div', { style: this.glass({ padding: '22px' }) },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } },
          h('h2', { style: this.disp({ fontSize: '1.12rem' }) }, 'Contas'),
          h('button', { onClick: () => this.openAcc('add'), style: this.btn('soft', { fontSize: '.83rem' }) }, '+ Nova conta')),
        this.d.accounts.length === 0 ? h('p', { style: { color: 'var(--muted)', fontSize: '.87rem' } }, 'Nenhuma conta cadastrada.')
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, ...this.d.accounts.map(a => h('div', { key: a.id, style: { display: 'flex', alignItems: 'center', gap: '11px', padding: '11px 14px', borderRadius: '16px', background: 'var(--surface-soft)', border: '1px solid var(--stroke)' } },
            h('div', { style: { width: '12px', height: '12px', borderRadius: '5px', background: a.color } }),
            h('div', { style: { flex: 1 } }, h('div', { style: { fontWeight: 700, fontSize: '.9rem' } }, a.name), h('div', { style: { fontSize: '.74rem', color: 'var(--muted)', textTransform: 'capitalize' } }, a.type)),
            h('span', { style: { fontWeight: 700, fontSize: '.88rem' } }, this.m(fmt(this.balances()[a.id] || 0))),
            h('button', { onClick: () => this.openAcc('edit', a), style: this.iconBtn() }, this.ico('M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z', 14)),
            h('button', { onClick: () => this.delAcc(a.id), style: this.iconBtn('var(--neg)') }, this.ico('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14', 14)))))),
      // categorias
      h('div', { style: this.glass({ padding: '22px' }) },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } },
          h('h2', { style: this.disp({ fontSize: '1.12rem' }) }, 'Categorias'),
          h('button', { onClick: () => this.openCat('add'), style: this.btn('soft', { fontSize: '.83rem' }) }, '+ Nova')),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } }, ...this.d.categories.map(c => h('span', { key: c.id, style: { display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 12px', borderRadius: '999px', background: c.color + '20', color: c.color, fontSize: '.82rem', fontWeight: 700 } },
          c.name,
          h('button', { onClick: () => this.openCat('edit', c), style: { border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', opacity: .7 } }, '✎'),
          h('button', { onClick: () => this.delCat(c.id), style: { border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', opacity: .7 } }, '×'))))),
      // preferências
      h('div', { style: this.glass({ padding: '22px' }) }, this.head('Preferências'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
          !this.otherUser() && h('label', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
            h('span', { style: { fontSize: '.85rem', fontWeight: 600 } }, 'Com quem você divide as despesas'),
            h('input', { value: this.partner(), onChange: e => this.save({ ...this.d, meta: { ...this.d.meta, partnerName: e.target.value } }), placeholder: 'Parceiro(a)', style: this.inp({ maxWidth: '280px' }) })),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
            h('span', { style: { fontSize: '.9rem' } }, 'Recebem e pagam nos dias'),
            ...[0, 1].map(idx => h('input', { key: idx, type: 'number', min: 1, max: 31, value: this.payDays()[idx], onChange: e => {
              const p = this.payDays().slice(); p[idx] = Math.min(31, Math.max(1, +e.target.value || 1));
              this.save({ ...this.d, meta: { ...(this.d.meta || {}), payDays: p } });
            }, style: this.inp({ width: '78px' }) })),
            h('span', { style: { fontSize: '.78rem', color: 'var(--muted)' } }, 'usado para dividir as quinzenas')),
          tog('Modo escuro', this.state.theme === 'dark', () => this.savePrefs({ theme: this.state.theme === 'dark' ? 'light' : 'dark' })),
          tog('Esconder valores da tela', this.state.hideValues, () => this.savePrefs({ hideValues: !this.state.hideValues })),
          tog('Reduzir animações', this.state.motion === 'reduced', () => this.savePrefs({ motion: this.state.motion === 'reduced' ? 'full' : 'reduced' })),
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' } },
            h('span', { style: { fontSize: '.9rem' } }, 'Tamanho da fonte'),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
              h('button', { onClick: () => this.savePrefs({ fontSize: Math.max(13, this.state.fontSize - 1) }), style: this.btn('ghost', { padding: '7px 13px' }) }, 'A−'),
              h('span', { style: { minWidth: '48px', textAlign: 'center', fontWeight: 700 } }, this.state.fontSize + 'px'),
              h('button', { onClick: () => this.savePrefs({ fontSize: Math.min(20, this.state.fontSize + 1) }), style: this.btn('ghost', { padding: '7px 13px' }) }, 'A+'))))),
      // dados
      h('div', { style: this.glass({ padding: '22px' }) }, this.head('Seus dados', 'sincronizados na sua conta do Supabase'),
        h('div', { style: { padding: '13px 15px', borderRadius: '16px', background: 'var(--pink-soft)', color: 'var(--pink-deep)', fontSize: '.83rem', lineHeight: 1.5, marginBottom: '16px' } }, 'Tudo fica guardado na sua conta do Supabase e aparece em qualquer aparelho onde você entrar com sua senha. Para trazer dados da versão antiga (que ficava só no navegador), use "Restaurar backup" com o arquivo .json exportado de lá.'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' } },
          h('button', { onClick: () => this.exportJSON(), style: this.btn('primary') }, this.ico('M12 3v12m0 0l-4-4m4 4l4-4M5 21h14', 16), 'Fazer backup'),
          h('button', { onClick: () => this._fi && this._fi.click(), style: this.btn('ghost') }, this.ico('M12 21V9m0 0l-4 4m4-4l4 4M5 3h14', 16), 'Restaurar backup'),
          h('button', { onClick: () => this.exportCSV(), style: this.btn('ghost') }, this.ico('M4 4h16v16H4zM4 9h16', 16), 'Exportar CSV'),
          h('input', { type: 'file', accept: '.json', ref: el => this._fi = el, style: { display: 'none' }, onChange: e => this.importJSON(e) })),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--stroke)' } },
          h('button', { onClick: () => this.setState({ confirm: { msg: 'Carregar dados de demonstração? Os dados atuais serão substituídos.', onYes: () => { this.save(buildDemo(), () => this.toast('Demo carregada')); this.setState({ confirm: null }); } } }), style: this.btn('soft') }, 'Carregar demonstração'),
          h('button', { onClick: () => this.setState({ confirm: { danger: true, msg: 'Apagar TODOS os dados? Isso não pode ser desfeito — faça um backup antes.', onYes: () => { this.save(emptyData(), () => this.toast('Tudo apagado', 'warn')); this.setState({ confirm: null }); } } }), style: this.btn('ghost', { color: 'var(--neg)', borderColor: 'var(--neg)' }) }, 'Apagar tudo'))));
  }
  openCard(mode, c) { this.setState({ modal: { type: 'card', mode }, form: c ? { ...c } : { name: '', brand: '', limit: 0, closeDay: 1, dueDay: 10, color: '#E8557F', payAccount: (this.d.accounts[0] || {}).id || '' } }); }
  saveCard() { const f = this.state.form; if (!f.name) return this.toast('Nome do cartão', 'err'); const cards = [...this.d.cards]; if (this.state.modal.mode === 'edit') { const i = cards.findIndex(c => c.id === f.id); cards[i] = { ...f }; } else cards.push({ ...f, id: uid() }); this.save({ ...this.d, cards }, () => this.toast('Cartão salvo')); this.setState({ modal: null }); }
  delCard(id) { this.setState({ confirm: { msg: 'Excluir este cartão? Os lançamentos continuam salvos.', onYes: () => { this.save({ ...this.d, cards: this.d.cards.filter(c => c.id !== id) }, () => this.toast('Excluído', 'warn')); this.setState({ confirm: null }); } } }); }
  openAcc(mode, a) { this.setState({ modal: { type: 'acc', mode }, form: a ? { ...a } : { name: '', type: 'banco', balance: 0, color: '#E8557F' } }); }
  saveAcc() { const f = this.state.form; if (!f.name) return this.toast('Nome da conta', 'err'); const accounts = [...this.d.accounts]; if (this.state.modal.mode === 'edit') { const i = accounts.findIndex(a => a.id === f.id); accounts[i] = { ...f }; } else accounts.push({ ...f, id: uid() }); this.save({ ...this.d, accounts }, () => this.toast('Conta salva')); this.setState({ modal: null }); }
  delAcc(id) { this.setState({ confirm: { msg: 'Excluir esta conta?', onYes: () => { this.save({ ...this.d, accounts: this.d.accounts.filter(a => a.id !== id) }, () => this.toast('Excluída', 'warn')); this.setState({ confirm: null }); } } }); }
  openCat(mode, c) { this.setState({ modal: { type: 'cat', mode }, form: c ? { ...c } : { name: '', color: '#E8557F' } }); }
  saveCat() { const f = this.state.form; if (!f.name) return this.toast('Nome da categoria', 'err'); const categories = [...this.d.categories]; if (this.state.modal.mode === 'edit') { const i = categories.findIndex(c => c.id === f.id); categories[i] = { ...f }; } else categories.push({ ...f, id: uid() }); this.save({ ...this.d, categories }, () => this.toast('Categoria salva')); this.setState({ modal: null }); }
  delCat(id) { this.setState({ confirm: { msg: 'Excluir esta categoria?', onYes: () => { this.save({ ...this.d, categories: this.d.categories.filter(c => c.id !== id) }, () => this.toast('Excluída', 'warn')); this.setState({ confirm: null }); } } }); }

  /* ===== backup ===== */
  dl(name, content, type) { const b = new Blob([content], { type }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }
  exportJSON() { this.dl(`backup-financas-${todayISO()}.json`, JSON.stringify(this.d, null, 2), 'application/json'); this.toast('Backup criado'); }
  exportCSV() {
    const head = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Status', 'Vencimento', 'Conta', 'Cartão', 'Forma', 'Parcela', 'Recorrência', 'Observações'];
    const rows = this.d.transactions.map(t => [isoBR(t.date), t.desc, t.type, this.catName(t.category), String(t.value).replace('.', ','), t.status, isoBR(t.dueDate), (this.acc(t.account) || {}).name || '', (this.card(t.card) || {}).name || '', t.payMethod || '', t.installments > 1 ? `${t.installment}/${t.installments}` : '', t.recurring || '', (t.notes || '').replace(/;/g, ',')]);
    const csv = [head, ...rows].map(r => r.map(c => `"${String(c == null ? '' : c).replace(/"/g, '""')}"`).join(';')).join('\n');
    this.dl(`lancamentos-${todayISO()}.csv`, '\ufeff' + csv, 'text/csv'); this.toast('CSV exportado');
  }
  importJSON(e) {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (!o.transactions || !o.categories) throw 0; this.setState({ confirm: { msg: 'Restaurar este backup? Os dados atuais serão substituídos.', onYes: () => { if (!o.meta) o.meta = {}; if (!o.goals) o.goals = []; remapOwners(o, this.state.auth.users, this.me.id); this.save(normalizeDoc(o), () => this.toast('Backup restaurado')); this.setState({ confirm: null }); } } }); } catch (err) { this.toast('Arquivo inválido', 'err'); } };
    r.readAsText(file); e.target.value = '';
  }

  /* ===== importar fatura ===== */
  openImport(c) { this.setState({ modal: { type: 'import', payload: { card: c } }, form: { rows: [], parsing: false, fileName: '' } }); }
  parseBR(s) { if (!s) return NaN; let v = String(s).replace(/[R$\s]/g, '').replace(/[^\d.,-]/g, ''); if (v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.'); const n = parseFloat(v); return isNaN(n) ? NaN : n; }
  parseDate(s, fy) {
    if (!s) return '';
    let m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/); if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    m = s.match(/(\d{2})\/(\d{2})\/(\d{2})/); if (m) return `20${m[3]}-${m[2]}-${m[1]}`;
    m = s.match(/(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(/(\d{2})\/(\d{2})(?!\d)/); if (m) return `${fy || new Date().getFullYear()}-${m[2]}-${m[1]}`;
    const M = { jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06', jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12' };
    m = s.match(/(\d{1,2})\s*(?:de\s*)?([a-zç]{3})/i); if (m && M[m[2].toLowerCase()]) return `${fy || new Date().getFullYear()}-${M[m[2].toLowerCase()]}-${m[1].padStart(2, '0')}`;
    return '';
  }
  extract(lines) {
    const yr = new Date().getFullYear(); const out = [];
    const skip = /(total|subtotal|saldo|limite|pagamento\s+m[ií]nimo|vencimento|fechamento|fatura\s+anterior|encargos|juros\s+do|iof|multa)/i;
    lines.forEach(raw => {
      const line = raw.replace(/\s+/g, ' ').trim(); if (!line || line.length < 6) return;
      const vm = line.match(/-?\s*R?\$?\s*\d{1,3}(?:\.\d{3})*,\d{2}(?!\d)/g) || line.match(/-?\s*\d+\.\d{2}(?!\d)/g);
      if (!vm) return;
      const value = this.parseBR(vm[vm.length - 1]); if (isNaN(value) || value === 0) return;
      const dm = line.match(/\d{2}\/\d{2}(?:\/\d{2,4})?/) || line.match(/\d{1,2}\s*(?:de\s*)?[a-zç]{3}/i);
      const date = dm ? this.parseDate(dm[0], yr) : todayISO();
      let desc = line; if (dm) desc = desc.replace(dm[0], ' '); vm.forEach(v => desc = desc.replace(v, ' '));
      desc = desc.replace(/R?\$/g, '').replace(/\s+/g, ' ').replace(/^[;,\s]+|[;,\s]+$/g, '').trim();
      let inst = '', insts = '';
      const pm = desc.match(/(\d{1,2})\s*\/\s*(\d{1,2})/); if (pm) { inst = +pm[1]; insts = +pm[2]; }
      if (!desc || desc.length < 2) desc = 'Lançamento';
      if (skip.test(line) && !dm) return;
      out.push({ include: !skip.test(line), date, desc: desc.slice(0, 60), value: Math.abs(value), installment: inst, installments: insts, category: '' });
    });
    return out;
  }
  async onImportFile(e) {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    this.setF({ parsing: true, fileName: file.name, rows: [] });
    try {
      if (/\.csv$/i.test(file.name) || file.type === 'text/csv') {
        const text = await file.text(); const lines = text.split(/\r?\n/);
        const delim = (lines[0] || '').indexOf(';') > -1 ? ';' : ((lines[0] || '').indexOf('\t') > -1 ? '\t' : ',');
        const st = [];
        lines.forEach(l => {
          const cols = l.split(delim).map(s => s.trim().replace(/^"|"$/g, '')); if (cols.length < 2) return;
          const vc = cols.find(c => /-?\s*R?\$?\s*\d+[.,]\d{2}/.test(c)); const dc = cols.find(c => /\d{2}\/\d{2}|\d{4}-\d{2}-\d{2}/.test(c));
          if (!vc) return; const value = this.parseBR(vc); if (isNaN(value)) return;
          if (/descri|valor|data|hist[oó]rico/i.test(l) && st.length === 0) return;
          let desc = cols.filter(c => c !== vc && c !== dc && c.length > 1).sort((a, b) => b.length - a.length)[0] || 'Lançamento';
          st.push({ include: true, date: dc ? this.parseDate(dc) : todayISO(), desc: desc.replace(/^[;,\s]+|[;,\s]+$/g, '').slice(0, 60), value: Math.abs(value), installment: '', installments: '', category: '' });
        });
        this.setF({ rows: st.length ? st : this.extract(lines), parsing: false });
      } else if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
        if (!window.pdfjsLib) { this.setF({ parsing: false }); return this.toast('Leitor de PDF carregando, tenta de novo', 'err'); }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
        const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        const lines = [];
        for (let p = 1; p <= pdf.numPages; p++) {
          const content = await (await pdf.getPage(p)).getTextContent();
          const byY = {}; content.items.forEach(it => { const y = Math.round(it.transform[5]); (byY[y] = byY[y] || []).push([it.transform[4], it.str]); });
          Object.keys(byY).sort((a, b) => b - a).forEach(y => lines.push(byY[y].sort((a, b) => a[0] - b[0]).map(x => x[1]).join(' ')));
        }
        this.setF({ rows: this.extract(lines), parsing: false });
      } else { this.setF({ parsing: false }); this.toast('Use PDF ou CSV', 'err'); }
    } catch (err) { this.setF({ parsing: false }); this.toast('Não consegui ler o arquivo', 'err'); }
  }
  confirmImport() {
    const card = this.state.modal.payload.card;
    const rows = (this.state.form.rows || []).filter(r => r.include && r.value > 0);
    if (!rows.length) return this.toast('Nenhum item selecionado', 'err');
    const defCat = (this.d.categories[0] || {}).id || '';
    const add = rows.map(r => ({ id: uid(), desc: r.desc, value: r.value, type: 'despesa', category: r.category || defCat, date: r.date || todayISO(), dueDate: r.date || todayISO(), card: card.id, account: card.payAccount || '', payMethod: 'Cartão', status: 'pendente', installment: r.installment || '', installments: r.installments || '', split: !!r.split, payerId: (this.me || {}).id || '', tags: ['fatura'], notes: '', subcategory: '' }));
    this.save({ ...this.d, transactions: [...this.d.transactions, ...add] }, () => this.toast(`${add.length} lançamentos importados`));
    this.setState({ modal: null });
  }

  /* ===== CHARTS ===== */
  /* Dois gráficos no painel:
     1) colunas divergentes — entradas para cima, saídas para baixo (a posição
        já diz quem é quem, a cor só reforça);
     2) barras horizontais — para onde o dinheiro foi no período. */
  chartsPainel() {
    const css = getComputedStyle(document.documentElement);
    const tok = n => css.getPropertyValue(n).trim();
    const ink = tok('--ink'), muted = tok('--muted'), grade = tok('--track');
    Chart.defaults.font.family = 'Inter,system-ui,sans-serif';
    Chart.defaults.color = muted;
    const oculto = this.state.hideValues;
    const dinheiro = v => oculto ? '••••' : fmtK(Math.abs(v));

    const el1 = document.getElementById('ch-fluxo');
    if (el1) {
      const base = this.state.period === 'ano' ? this.state.year + '-12' : mk(this.state.month || todayISO());
      const meses = [];
      for (let i = 5; i >= 0; i--) meses.push(mk(addM(base + '-01', -i)));
      const quem = this.state.visao || 'eu';
      const doMes = k => this.monthItems(k).filter(i => !this.ehBeneficio(i));
      const ent = meses.map(k => doMes(k).filter(i => i.type === 'receita').reduce((a, i) => a + this.parteDe(i, quem), 0));
      const sai = meses.map(k => -doMes(k).filter(i => i.type === 'despesa').reduce((a, i) => a + this.parteDe(i, quem), 0));
      this._charts.fluxo = new Chart(el1, {
        type: 'bar',
        data: {
          labels: meses.map(k => MONTHS_S[+k.slice(5) - 1]),
          datasets: [
            { label: 'Entradas', data: ent, backgroundColor: tok('--pos'), borderRadius: 4, maxBarThickness: 26 },
            { label: 'Saídas', data: sai, backgroundColor: tok('--neg'), borderRadius: 4, maxBarThickness: 26 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: this.state.motion === 'reduced' ? false : { duration: 400 },
          plugins: {
            legend: { position: 'top', align: 'start', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: 'circle', color: ink, padding: 14 } },
            tooltip: { callbacks: { label: c => c.dataset.label + ': ' + (oculto ? '••••' : fmt(Math.abs(c.parsed.y))) } },
          },
          scales: {
            x: { grid: { display: false }, border: { color: grade } },
            y: { grid: { color: grade }, border: { display: false }, ticks: { maxTicksLimit: 6, callback: v => (v < 0 ? '−' : '') + dinheiro(v) } },
          },
        },
      });
    }

    const el2 = document.getElementById('ch-categorias');
    if (el2) {
      const { from, to } = this.periodRange();
      const porCat = {};
      const quem2 = this.state.visao || 'eu';
      this.rangeItems(from, to).filter(i => i.type === 'despesa' && !this.ehBeneficio(i)).forEach(i => {
        const k = i.category || 'sem';
        porCat[k] = (porCat[k] || 0) + this.parteDe(i, quem2);
      });
      let linhas = Object.entries(porCat)
        .map(([id, v]) => ({ nome: id === 'sem' ? 'Sem categoria' : this.catName(id), cor: id === 'sem' ? muted : this.catColor(id), v }))
        .filter(l => l.v > 0).sort((a, b) => b.v - a.v);
      if (linhas.length > 7) {
        const resto = linhas.slice(6).reduce((a, l) => a + l.v, 0);
        linhas = [...linhas.slice(0, 6), { nome: 'Outras', cor: muted, v: resto }];
      }
      this._charts.cat = new Chart(el2, {
        type: 'bar',
        data: { labels: linhas.map(l => l.nome), datasets: [{ data: linhas.map(l => l.v), backgroundColor: linhas.map(l => l.cor), borderRadius: 4, maxBarThickness: 22 }] },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          animation: this.state.motion === 'reduced' ? false : { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: c => oculto ? '••••' : fmt(c.parsed.x) } },
          },
          scales: {
            x: { grid: { color: grade }, border: { display: false }, ticks: { maxTicksLimit: 4, callback: v => dinheiro(v) } },
            y: { grid: { display: false }, border: { color: grade }, ticks: { color: ink, font: { weight: 600 }, crossAlign: 'far' } },
          },
        },
      });
    }
  }
  syncCharts() {
    if (!window.Chart) return;
    const st = this.state;
    const sig = [st.view, st.year, st.month, st.period, st.from, st.to, st.theme, st.hideValues, st.visao, this.d.transactions.length].join('|');
    // o canvas pode ainda não existir quando a tela troca: nesse caso, refaz
    const faltando = (st.view === 'dashboard' && document.getElementById('ch-fluxo') && !this._charts.fluxo)
      || (st.view === 'anual' && document.getElementById('ch-year') && !this._charts.y);
    if (sig === this._sig && !faltando) return;
    this._sig = sig;
    Object.values(this._charts).forEach(c => { try { c.destroy(); } catch (e) {} }); this._charts = {};
    if (st.view === 'dashboard') return this.chartsPainel();
    if (st.view !== 'anual') return;
    const el = document.getElementById('ch-year'); if (!el) return;
    const css = getComputedStyle(document.documentElement);
    Chart.defaults.font.family = "Inter,system-ui,sans-serif";
    Chart.defaults.color = css.getPropertyValue('--ink').trim();
    const y = this.state.year;
    const months = Array.from({ length: 12 }, (_, i) => `${y}-${String(i + 1).padStart(2, '0')}`);
    const ent = months.map(k => this.d.transactions.filter(t => mk(t.dueDate || t.date) === k && t.type === 'receita').reduce((a, t) => a + this.myShare(t), 0));
    const sai = months.map(k => this.d.transactions.filter(t => mk(t.dueDate || t.date) === k && t.type === 'despesa').reduce((a, t) => a + this.myShare(t), 0));
    this._charts.y = new Chart(el, {
      type: 'bar',
      data: { labels: MONTHS_S, datasets: [{ label: 'Entradas', data: ent, backgroundColor: css.getPropertyValue('--pos').trim(), borderRadius: 10, maxBarThickness: 26 }, { label: 'Saídas', data: sai, backgroundColor: css.getPropertyValue('--pink').trim(), borderRadius: 10, maxBarThickness: 26 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { weight: 700 } } }, tooltip: { enabled: !this.state.hideValues } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(150,70,100,.09)' }, ticks: { callback: v => 'R$' + (v / 1000) + 'k' } } } }
    });
  }

  /* ===== MODAIS ===== */
  field(label, node, opt) { return h('label', { style: { display: 'flex', flexDirection: 'column', gap: '6px', flex: (opt && opt.flex) || '1 1 auto' } }, h('span', { style: { fontSize: '.79rem', fontWeight: 700, color: 'var(--muted)' } }, label, opt && opt.req && h('span', { style: { color: 'var(--pink)' } }, ' *')), node); }
  money(v, on) { return h('input', { inputMode: 'numeric', value: v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '', onChange: e => { const d = e.target.value.replace(/\D/g, ''); on(d ? parseInt(d) / 100 : 0); }, placeholder: '0,00', style: this.inp() }); }
  colors(v, on) { const p = ['#E8557F', '#C93E68', '#F58A5E', '#E5AE49', '#8E5C86', '#A87BD1', '#4E9E76', '#5FAFC4', '#6E8DC4', '#EC7BA6', '#69AF9A', '#C9A05C']; return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } }, ...p.map(c => h('button', { key: c, onClick: () => on(c), style: { width: '32px', height: '32px', borderRadius: '11px', background: c, border: v === c ? '3px solid var(--ink)' : '2px solid transparent', cursor: 'pointer' } }))); }
  shell(title, body, footer, wide) {
    return h('div', { onClick: () => this.setState({ modal: null }), style: { position: 'fixed', inset: 0, background: 'rgba(24,28,34,.42)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' } },
      h('div', { onClick: e => e.stopPropagation(), style: this.glass({ width: wide ? 'min(640px,96vw)' : 'min(490px,96vw)', maxHeight: '92vh', overflow: 'auto', background: 'var(--surface)', animation: 'pop .2s both' }) },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--stroke)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 2 } },
          h('h2', { style: this.disp({ fontSize: '1.14rem' }) }, title),
          h('button', { onClick: () => this.setState({ modal: null }), style: this.iconBtn() }, this.ico('M18 6L6 18M6 6l12 12', 20))),
        h('div', { style: { padding: '22px 24px' } }, body),
        footer && h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--stroke)', position: 'sticky', bottom: 0, background: 'var(--surface)' } }, footer)));
  }
  beneficioField(f) {
    return h('button', { onClick: () => this.setF({ beneficio: !f.beneficio }), style: { display: 'flex', alignItems: 'center', gap: '11px', border: '1px solid var(--stroke)', background: f.beneficio ? 'var(--warn-bg)' : 'transparent', borderRadius: '18px', padding: '12px 15px', cursor: 'pointer', color: 'var(--ink)', textAlign: 'left' } },
      h('div', { style: { width: '46px', height: '27px', borderRadius: '999px', background: f.beneficio ? 'var(--warn)' : 'var(--track-strong)', position: 'relative', flexShrink: 0, transition: 'background .2s' } },
        h('div', { style: { width: '21px', height: '21px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: f.beneficio ? '22px' : '3px', transition: 'left .2s', boxShadow: '0 2px 5px rgba(0,0,0,.2)' } })),
      h('div', null,
        h('div', { style: { fontSize: '.88rem', fontWeight: 600 } }, 'É benefício da empresa (Flash, VR, VA…)'),
        h('div', { style: { fontSize: '.74rem', color: 'var(--muted)' } }, 'fica fora da sua renda e do seu resultado')));
  }
  sharedField(f, rotulo) {
    const o = this.otherUser(); if (!o) return null;
    return h('button', { onClick: () => this.setF({ shared: !f.shared }), style: { display: 'flex', alignItems: 'center', gap: '11px', border: '1px solid var(--stroke)', background: f.shared ? 'var(--pink-soft)' : 'transparent', borderRadius: '18px', padding: '12px 15px', cursor: 'pointer', color: 'var(--ink)', textAlign: 'left' } },
      h('div', { style: { width: '46px', height: '27px', borderRadius: '999px', background: f.shared ? 'var(--pink)' : 'var(--track-strong)', position: 'relative', flexShrink: 0, transition: 'background .2s' } },
        h('div', { style: { width: '21px', height: '21px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: f.shared ? '22px' : '3px', transition: 'left .2s', boxShadow: '0 2px 5px rgba(0,0,0,.2)' } })),
      h('span', { style: { fontSize: '.88rem', fontWeight: 600 } }, (rotulo || 'Visível também para ') + o.name.split(' ')[0]));
  }
  renderModal() {
    const M = this.state.modal; if (!M) return null;
    const f = this.state.form;
    const cancel = h('button', { onClick: () => this.setState({ modal: null }), style: this.btn('ghost') }, 'Cancelar');
    if (M.type === 'pw') return this.shell(this.state.recovery ? 'Criar uma senha nova' : 'Trocar senha',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        this.field('Nova senha', h('input', { type: 'password', value: f.pass || '', onChange: e => this.setF({ pass: e.target.value }), style: this.inp() })),
        this.field('Repita a nova senha', h('input', { type: 'password', value: f.pass2 || '', onChange: e => this.setF({ pass2: e.target.value }), style: this.inp() }))),
      [cancel, h('button', { onClick: () => this.changePw(), style: this.btn('primary') }, 'Salvar')]);
    if (M.type === 'repasse') {
      const it = M.payload;
      return this.shell(it.desc,
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
          h('p', { style: { fontSize: '.84rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '10px' } },
            'Contas que ' + this.partner().split(' ')[0] + ' pagou e nas quais você tem parte. Some numa linha só para você não pagar duas vezes.'),
          ...it.compoem.map(x => h('div', { key: x.id, style: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '9px 0', borderBottom: '1px solid var(--stroke)' } },
            h('div', { style: { minWidth: 0 } },
              h('div', { style: { fontWeight: 600, fontSize: '.88rem' } }, x.desc),
              h('div', { style: { fontSize: '.73rem', color: 'var(--muted)' } }, isoBR(x.dueDate || x.date) + (x.split ? ' • dividida' : '') + (this.origemLabel(x) ? ' • ' + this.origemLabel(x) : ''))),
            h('span', { style: { fontWeight: 700, whiteSpace: 'nowrap' } }, this.m(fmt(this.debt(x)))))),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontWeight: 700 } },
            h('span', null, 'Total a repassar'), h('span', { style: { color: 'var(--neg)' } }, this.m(fmt(it.value))))),
        [h('button', { onClick: () => this.setState({ modal: null }), style: this.btn('ghost') }, 'Fechar')]);
    }
    if (M.type === 'inv') return this.shell(M.mode === 'edit' ? 'Editar investimento' : 'Novo investimento',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
          this.field('No que está aplicado', h('input', { autoFocus: true, value: f.name || '', onChange: e => this.setF({ name: e.target.value }), placeholder: 'Ex: CDB 110% CDI', style: this.inp() }), { req: 1, flex: '2 1 200px' }),
          this.field('Quanto tem hoje', this.money(f.value, v => this.setF({ value: v })), { req: 1, flex: '1 1 140px' })),
        h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
          this.field('Onde', h('input', { value: f.place || '', onChange: e => this.setF({ place: e.target.value }), placeholder: 'Banco, corretora…', style: this.inp() })),
          this.field('Tipo', h('select', { value: f.kind || 'Renda fixa', onChange: e => this.setF({ kind: e.target.value }), style: this.inp() },
            ...['Renda fixa', 'Renda variável', 'Fundo', 'Cripto', 'Poupança', 'Previdência', 'Outro'].map(k => h('option', { key: k, value: k }, k))))),
        this.field('Atualizado em', h('input', { type: 'date', value: f.date || todayISO(), onChange: e => this.setF({ date: e.target.value }), style: this.inp() })),
        this.field('Observações', h('textarea', { value: f.notes || '', onChange: e => this.setF({ notes: e.target.value }), rows: 2, style: this.inp({ resize: 'vertical' }) })),
        this.sharedField(f, 'Investimento conjunto — aparece também para ')),
      [cancel, h('button', { onClick: () => this.saveInv(), style: this.btn('primary') }, 'Salvar')]);
    if (M.type === 'tx') return this.txModal(f, cancel);
    if (M.type === 'import') return this.importModal(f, cancel);
    if (M.type === 'pay') {
      const it = M.payload, isRec = it.type === 'receita';
      return this.shell(isRec ? 'Marcar como recebido' : 'Marcar como pago',
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
          h('p', { style: { color: 'var(--muted)', fontSize: '.9rem' } }, `${it.desc} — ${fmt(it.value)}${it.isFatura ? ` (${it.count} compras)` : ''}`),
          this.field(isRec ? 'Entrou em qual conta?' : 'Saiu de qual conta?', h('select', { value: f.account, onChange: e => this.setF({ account: e.target.value }), style: this.inp() }, h('option', { value: '' }, 'Selecione…'), ...this.d.accounts.map(a => h('option', { key: a.id, value: a.id }, a.name))))),
        [cancel, h('button', { onClick: () => this.confirmPay(), style: this.btn('primary') }, this.ico('M20 6L9 17l-5-5', 16), 'Confirmar')]);
    }
    if (M.type === 'goal') return this.shell(M.mode === 'edit' ? 'Editar meta' : 'Nova meta',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        this.field('Nome', h('input', { value: f.name, onChange: e => this.setF({ name: e.target.value }), placeholder: 'Reserva de emergência', style: this.inp() }), { req: 1 }),
        this.field('Tipo', h('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap' } }, ...['Reserva', 'Renda fixa', 'Ações', 'Cripto', 'Objetivo'].map(k => this.chip(k, f.kind === k, () => this.setF({ kind: k }))))),
        h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } }, this.field('Objetivo', this.money(f.total, v => this.setF({ total: v })), { req: 1 }), this.field('Já tenho', this.money(f.saved, v => this.setF({ saved: v })))),
        h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } }, this.field('Data alvo', h('input', { type: 'date', value: f.date, onChange: e => this.setF({ date: e.target.value }), style: this.inp() })), this.field('Prioridade', h('select', { value: f.priority, onChange: e => this.setF({ priority: e.target.value }), style: this.inp() }, ...['alta', 'média', 'baixa'].map(p => h('option', { key: p, value: p }, p))))),
        this.field('Aporte mensal planejado', this.money(f.monthly, v => this.setF({ monthly: v }))),
        this.sharedField(f, 'Meta conjunta — acompanhar junto com ')),
      [cancel, h('button', { onClick: () => this.saveGoal(), style: this.btn('primary') }, 'Salvar')]);
    if (M.type === 'aporte') return this.shell('Registrar aporte',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } }, h('p', { style: { color: 'var(--muted)', fontSize: '.9rem' } }, M.payload.name), this.field('Quanto você guardou?', this.money(f.amount, v => this.setF({ amount: v })))),
      [cancel, h('button', { onClick: () => this.confirmAporte(), style: this.btn('primary') }, 'Guardar')]);
    if (M.type === 'card') return this.shell(M.mode === 'edit' ? 'Editar cartão' : 'Novo cartão',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } }, this.field('Nome', h('input', { value: f.name, onChange: e => this.setF({ name: e.target.value }), style: this.inp() }), { req: 1 }), this.field('Bandeira', h('input', { value: f.brand, onChange: e => this.setF({ brand: e.target.value }), placeholder: 'Visa…', style: this.inp() }))),
        this.field('Limite', this.money(f.limit, v => this.setF({ limit: v }))),
        h('div', { style: { display: 'flex', gap: '12px' } }, this.field('Fecha dia', h('input', { type: 'number', min: 1, max: 31, value: f.closeDay, onChange: e => this.setF({ closeDay: +e.target.value }), style: this.inp() })), this.field('Vence dia', h('input', { type: 'number', min: 1, max: 31, value: f.dueDay, onChange: e => this.setF({ dueDay: +e.target.value }), style: this.inp() }))),
        this.field('Conta de pagamento', h('select', { value: f.payAccount, onChange: e => this.setF({ payAccount: e.target.value }), style: this.inp() }, h('option', { value: '' }, '—'), ...this.d.accounts.map(a => h('option', { key: a.id, value: a.id }, a.name)))),
        this.field('Cor', this.colors(f.color, c => this.setF({ color: c }))),
        this.otherUser() && this.field('De quem é este cartão?', h('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap' } },
          this.chip('Meu', !f.owner || f.owner === (this.me || {}).id, () => this.setF({ owner: (this.me || {}).id, shared: false }), 'var(--plum)'),
          this.chip('De ' + this.partner().split(' ')[0], f.owner === (this.otherUser() || {}).id, () => this.setF({ owner: (this.otherUser() || {}).id, shared: true }), 'var(--plum)'))),
        this.beneficioField(f),
        this.sharedField(f)),
      [cancel, h('button', { onClick: () => this.saveCard(), style: this.btn('primary') }, 'Salvar')]);
    if (M.type === 'acc') return this.shell(M.mode === 'edit' ? 'Editar conta' : 'Nova conta',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        this.field('Nome', h('input', { value: f.name, onChange: e => this.setF({ name: e.target.value }), style: this.inp() }), { req: 1 }),
        this.field('Tipo', h('select', { value: f.type, onChange: e => this.setF({ type: e.target.value }), style: this.inp() }, ...[['banco', 'Conta bancária'], ['dinheiro', 'Dinheiro / carteira'], ['investimento', 'Investimento']].map(([v, l]) => h('option', { key: v, value: v }, l)))),
        this.field('Saldo inicial', this.money(f.balance, v => this.setF({ balance: v }))),
        this.field('Cor', this.colors(f.color, c => this.setF({ color: c }))),
        this.beneficioField(f),
        this.sharedField(f)),
      [cancel, h('button', { onClick: () => this.saveAcc(), style: this.btn('primary') }, 'Salvar')]);
    if (M.type === 'cat') return this.shell(M.mode === 'edit' ? 'Editar categoria' : 'Nova categoria',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        this.field('Nome', h('input', { value: f.name, onChange: e => this.setF({ name: e.target.value }), style: this.inp() }), { req: 1 }),
        this.field('Cor', this.colors(f.color, c => this.setF({ color: c })))),
      [cancel, h('button', { onClick: () => this.saveCat(), style: this.btn('primary') }, 'Salvar')]);
    return null;
  }
  faturaSugerida(f) {
    const c = this.card(f.card);
    return c ? mk(this.faturaDue(c, f.dueDate || f.date || todayISO())) : mk(f.date || todayISO());
  }
  opcoesFatura(f) {
    const c = this.card(f.card); if (!c) return [];
    const base = f.faturaMes || this.faturaSugerida(f);
    const out = [];
    for (let i = -2; i <= 5; i++) {
      const k = mk(addM(base + '-01', i));
      out.push({ v: k, l: mkLong(k) + ' — vence ' + isoBR(this.vencFatura(c, k)) });
    }
    return out;
  }
  formPagouEu(f) { const eu = (this.me || {}).id || ''; return (f.payerId || eu) === eu; }
  resumoDivisao(f) {
    const pagouEu = this.formPagouEu(f), p = this.partner(), v = f.value || 0;
    if (f.dono === 'split') { const a = this.metade(f), b = this.outraMetade(f); return `Sua parte: ${fmt(a)} • ${pagouEu ? p + ' te deve ' + fmt(b) : 'você deve ' + fmt(b) + ' a ' + p}`; }
    if (f.dono === 'other') return `Não entra nas suas contas — é de ${p}` + (pagouEu ? ` • ${p} te deve ${fmt(v)}` : '');
    return pagouEu ? '' : `${p} pagou por você • você deve ${fmt(v)} a ${p}`;
  }
  txModal(f, cancel) {
    const isRec = f.type === 'receita';
    return this.shell(this.state.modal.mode === 'edit' ? 'Editar lançamento' : 'Novo lançamento',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        // tipo
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' } }, ...[['despesa', 'Saída', 'var(--neg)'], ['receita', 'Entrada', 'var(--pos)']].map(([v, l, c]) =>
          h('button', { key: v, onClick: () => this.setF({ type: v, status: v === 'receita' ? (f.status === 'pago' ? 'recebido' : 'a receber') : (f.status === 'recebido' ? 'pago' : 'pendente') }), style: { padding: '14px', borderRadius: '18px', border: f.type === v ? `2px solid ${c}` : '1px solid var(--stroke)', background: f.type === v ? c + '18' : 'var(--card-2)', color: f.type === v ? c : 'var(--ink)', fontWeight: 700, cursor: 'pointer', fontSize: '.95rem' } }, l))),
        // descrição + valor
        h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
          this.field('O que foi?', h('input', { autoFocus: true, value: f.desc, onChange: e => this.setF({ desc: e.target.value }), placeholder: 'Ex: mercado', style: this.inp() }), { req: 1, flex: '2 1 200px' }),
          this.field('Quanto?', this.money(f.value, v => this.setF({ value: v })), { req: 1, flex: '1 1 130px' })),
        // data + categoria
        h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
          this.field('Quando?', h('input', { type: 'date', value: f.date, onChange: e => this.setF({ date: e.target.value, dueDate: f.dueDate || e.target.value }), style: this.inp() }), { req: 1 }),
          this.field('Categoria', h('select', { value: f.category, onChange: e => this.setF({ category: e.target.value }), style: this.inp() }, h('option', { value: '' }, 'Escolher…'), ...this.d.categories.map(c => h('option', { key: c.id, value: c.id }, c.name))))),
        // forma de pagamento
        this.field('Como pagou?', h('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap' } }, ...PAY_METHODS.map(p => this.chip(p, f.payMethod === p, () => this.setF({ payMethod: p, card: p === 'Cartão' ? (f.card || (this.d.cards[0] || {}).id || '') : '' }))))),
        f.payMethod === 'Cartão' && h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
          this.field('Qual cartão?', h('select', { value: f.card, onChange: e => this.setF({ card: e.target.value }), style: this.inp() }, h('option', { value: '' }, 'Escolher…'), ...this.meusCartoes().map(c => h('option', { key: c.id, value: c.id }, c.name)))),
          this.field('Paga em qual quinzena?', h('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap' } },
            ...[['', 'Automática'], ['1', '1ª — dia ' + this.payDays()[0]], ['2', '2ª — dia ' + this.payDays()[1]]].map(([v, l]) =>
              this.chip(l, (f.quinzena || '') === v, () => this.setF({ quinzena: v }), 'var(--plum)'))), { flex: '1 1 100%' }),
          f.card && this.field('Em qual fatura?', h('select', { value: f.faturaMes || this.faturaSugerida(f), onChange: e => this.setF({ faturaMes: e.target.value }), style: this.inp() },
            ...this.opcoesFatura(f).map(o => h('option', { key: o.v, value: o.v }, o.l)))),
          this.state.modal.mode === 'add' && this.field('Parcelas', h('input', { type: 'number', min: 1, value: f.installments, onChange: e => this.setF({ installments: e.target.value }), placeholder: '1', style: this.inp() }))),
        // recorrência
        this.field('Se repete?', h('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap' } },
          this.chip('Não', !f.recurring, () => this.setF({ recurring: '' })),
          ...['mensal', 'semanal', 'anual'].map(r => this.chip('↻ ' + r, f.recurring === r, () => this.setF({ recurring: r }))))),
        // já pago
        h('button', { onClick: () => this.setF({ status: this.isDone(f) ? (isRec ? 'a receber' : 'pendente') : (isRec ? 'recebido' : 'pago') }), style: { display: 'flex', alignItems: 'center', gap: '11px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink)', padding: 0 } },
          h('div', { style: { width: '46px', height: '27px', borderRadius: '999px', background: this.isDone(f) ? 'var(--pos)' : 'var(--track-strong)', position: 'relative', transition: 'background .2s' } },
            h('div', { style: { width: '21px', height: '21px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: this.isDone(f) ? '22px' : '3px', transition: 'left .2s', boxShadow: '0 2px 5px rgba(0,0,0,.2)' } })),
          h('span', { style: { fontSize: '.9rem', fontWeight: 600 } }, isRec ? 'Já recebi' : 'Já paguei')),
        // de quem é a conta
        f.type === 'despesa' && this.otherUser() && h('div', { style: { padding: '13px 15px', borderRadius: '18px', background: (f.dono || 'me') !== 'me' ? 'rgba(142,92,134,.12)' : 'transparent', border: '1px solid var(--stroke)', display: 'flex', flexDirection: 'column', gap: '11px' } },
          h('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' } },
            h('span', { style: { fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)' } }, 'De quem é?'),
            this.chip('Minha', (f.dono || 'me') === 'me', () => this.setF({ dono: 'me' }), 'var(--plum)'),
            this.chip('De ' + this.partner(), f.dono === 'other', () => this.setF({ dono: 'other' }), 'var(--plum)'),
            this.chip('Dividida 50/50', f.dono === 'split', () => this.setF({ dono: 'split' }), 'var(--plum)')),
          h('div', { style: { display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' } },
            h('span', { style: { fontSize: '.78rem', fontWeight: 700, color: 'var(--muted)' } }, 'Quem pagou?'),
            this.chip('Eu paguei', this.formPagouEu(f), () => this.setF({ payerId: (this.me || {}).id || '' }), 'var(--plum)'),
            this.chip(this.partner() + ' pagou', !this.formPagouEu(f), () => this.setF({ payerId: (this.otherUser() || {}).id || '' }), 'var(--plum)')),
          f.value > 0 && this.resumoDivisao(f) && h('div', { style: { fontSize: '.79rem', color: 'var(--plum)', fontWeight: 700, lineHeight: 1.45 } }, this.resumoDivisao(f))),
        // mais detalhes
        h('button', { onClick: () => this.setF({ more: !f.more }), style: { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', color: 'var(--pink-deep)', cursor: 'pointer', fontWeight: 700, fontSize: '.86rem', padding: 0 } }, this.ico(f.more ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6', 16), f.more ? 'Menos detalhes' : 'Mais detalhes'),
        f.more && h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--stroke)', paddingTop: '14px' } },
          h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
            this.field('Vencimento', h('input', { type: 'date', value: f.dueDate, onChange: e => this.setF({ dueDate: e.target.value }), style: this.inp() })),
            this.field('Conta', h('select', { value: f.account, onChange: e => this.setF({ account: e.target.value }), style: this.inp() }, h('option', { value: '' }, '—'), ...this.d.accounts.map(a => h('option', { key: a.id, value: a.id }, a.name))))),
          this.field('Observações', h('textarea', { value: f.notes, onChange: e => this.setF({ notes: e.target.value }), rows: 2, style: this.inp({ resize: 'vertical' }) })),
          this.field('Tags', h('input', { value: (f.tags || []).join(', '), onChange: e => this.setF({ tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }), placeholder: 'essencial, casa', style: this.inp() })))),
      [cancel, h('button', { onClick: () => this.saveTx(), style: this.btn('primary') }, this.ico('M20 6L9 17l-5-5', 16), 'Salvar')], true);
  }
  importModal(f, cancel) {
    const card = this.state.modal.payload.card;
    const rows = f.rows || [];
    const sel = rows.filter(r => r.include);
    const setRow = (i, p) => this.setF({ rows: rows.map((r, j) => j === i ? { ...r, ...p } : r) });
    const fileInput = h('input', { type: 'file', accept: '.pdf,.csv,application/pdf,text/csv', ref: el => this._imp = el, style: { display: 'none' }, onChange: e => this.onImportFile(e) });
    return this.shell('Importar fatura — ' + card.name,
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        rows.length === 0 ? h('div', null,
          h('div', { onClick: () => !f.parsing && this._imp && this._imp.click(), style: { border: '2px dashed var(--stroke)', borderRadius: '20px', padding: '34px 20px', textAlign: 'center', cursor: f.parsing ? 'default' : 'pointer', background: 'var(--surface-soft)' } },
            f.parsing ? h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: 'var(--pink-deep)' } }, h('div', { style: { width: '28px', height: '28px', border: '3px solid var(--pink-soft)', borderTopColor: 'var(--pink)', borderRadius: '50%', animation: 'spin .8s linear infinite' } }), h('span', null, 'Lendo ' + f.fileName + '…'))
              : h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px' } }, h('div', { style: { color: 'var(--pink)' } }, this.ico('M12 3v12m0 0l-4-4m4 4l4-4M5 21h14', 34)), h('div', { style: { fontWeight: 700 } }, 'Escolher PDF ou CSV'), h('div', { style: { fontSize: '.82rem', color: 'var(--muted)' } }, 'da fatura deste cartão'))),
          fileInput,
          h('div', { style: { marginTop: '14px', padding: '12px 14px', borderRadius: '16px', background: 'var(--pink-soft)', color: 'var(--pink-deep)', fontSize: '.81rem', lineHeight: 1.5 } }, 'Leio os lançamentos e mostro pra você conferir antes de salvar. Cada banco formata diferente, então revise os valores. O arquivo não sai do seu dispositivo.'))
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' } },
              h('span', { style: { fontSize: '.84rem', color: 'var(--muted)' } }, `${rows.length} encontrados • `, h('strong', { style: { color: 'var(--ink)' } }, `${sel.length} selecionados = ${fmt(sel.reduce((a, r) => a + r.value, 0))}`)),
              h('button', { onClick: () => this.setF({ rows: rows.map(r => ({ ...r, split: !rows.every(x => x.split) })) }), style: this.btn('ghost', { padding: '7px 12px', fontSize: '.78rem' }) }, '÷ Dividir todos'),
              h('button', { onClick: () => this._imp && this._imp.click(), style: this.btn('ghost', { padding: '7px 12px', fontSize: '.78rem' }) }, 'Trocar arquivo'), fileInput),
            h('div', { style: { maxHeight: '46vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' } }, ...rows.map((r, i) =>
              h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '14px', background: r.include ? 'rgba(255,255,255,.75)' : 'transparent', opacity: r.include ? 1 : .5 } },
                h('input', { type: 'checkbox', checked: r.include, onChange: e => setRow(i, { include: e.target.checked }), style: { width: '17px', height: '17px', accentColor: 'var(--pink)', cursor: 'pointer', flexShrink: 0 } }),
                h('input', { type: 'date', value: r.date, onChange: e => setRow(i, { date: e.target.value }), style: this.inp({ width: '126px', padding: '6px 8px', fontSize: '.76rem', flexShrink: 0 }) }),
                h('input', { value: r.desc, onChange: e => setRow(i, { desc: e.target.value }), style: this.inp({ padding: '6px 8px', fontSize: '.76rem', flex: 1, minWidth: '80px' }) }),
                h('select', { value: r.category, onChange: e => setRow(i, { category: e.target.value }), style: this.inp({ width: '104px', padding: '6px 5px', fontSize: '.72rem', flexShrink: 0 }) }, h('option', { value: '' }, 'Categoria'), ...this.d.categories.map(c => h('option', { key: c.id, value: c.id }, c.name))),
                h('button', { title: `Dividir com ${this.partner()}`, onClick: () => setRow(i, { split: !r.split }), style: { padding: '5px 9px', borderRadius: '999px', border: r.split ? 'none' : '1px solid var(--stroke)', background: r.split ? 'var(--plum)' : 'transparent', color: r.split ? '#fff' : 'var(--muted)', fontWeight: 700, fontSize: '.7rem', cursor: 'pointer', flexShrink: 0 } }, '÷'),
                h('input', { inputMode: 'numeric', value: r.value ? r.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '', onChange: e => { const d = e.target.value.replace(/\D/g, ''); setRow(i, { value: d ? parseInt(d) / 100 : 0 }); }, style: this.inp({ width: '92px', padding: '6px 8px', fontSize: '.76rem', textAlign: 'right', flexShrink: 0 }) })))))),
      rows.length > 0 ? [cancel, h('button', { onClick: () => this.confirmImport(), style: this.btn('primary') }, `Importar ${sel.length}`)] : [cancel], true);
  }
  renderConfirm() {
    const c = this.state.confirm; if (!c) return null;
    return h('div', { onClick: () => this.setState({ confirm: null }), style: { position: 'fixed', inset: 0, background: 'rgba(24,28,34,.42)', zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' } },
      h('div', { onClick: e => e.stopPropagation(), style: this.glass({ width: 'min(400px,94vw)', padding: '28px', textAlign: 'center', background: 'var(--surface)', animation: 'pop .2s both' }) },
        h('div', { style: { width: '54px', height: '54px', margin: '0 auto 14px', borderRadius: '18px', background: c.danger ? 'var(--neg-bg)' : 'var(--warn-bg)', color: c.danger ? 'var(--neg)' : 'var(--warn)', display: 'grid', placeItems: 'center' } }, this.ico('M12 9v4m0 4h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z', 26)),
        h('p', { style: { fontSize: '.94rem', lineHeight: 1.5, marginBottom: '20px' } }, c.msg),
        h('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } },
          h('button', { onClick: () => this.setState({ confirm: null }), style: this.btn('ghost') }, 'Cancelar'),
          h('button', { onClick: c.onYes, style: this.btn('primary', c.danger ? { background: 'var(--neg)', boxShadow: '0 8px 20px rgba(222,108,99,.35)' } : {}) }, 'Confirmar'))));
  }
  renderToast() {
    const t = this.state.toast; if (!t) return null;
    const c = { ok: 'var(--pos)', warn: 'var(--warn)', err: 'var(--neg)' }[t.kind] || 'var(--pos)';
    return h('div', { key: t.id, style: { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, animation: 'pop .25s both' } },
      h('div', { style: this.glass({ padding: '13px 22px', display: 'flex', alignItems: 'center', gap: '11px', borderRadius: '999px', background: 'var(--surface)', borderLeft: `4px solid ${c}` }) },
        h('div', { style: { color: c } }, this.ico(t.kind === 'err' ? 'M12 9v4m0 4h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z' : 'M20 6L9 17l-5-5', 19)),
        h('span', { style: { fontWeight: 700, fontSize: '.89rem' } }, t.msg)));
  }
}

/* ===== montagem ===== */
(function () {
  const el = document.getElementById('root');
  const props = { accent: (window.FINCONFIG && window.FINCONFIG.accent) || '#6E747F' };
  const node = h(Component, props);
  if (ReactDOM.createRoot) ReactDOM.createRoot(el).render(node);
  else ReactDOM.render(node, el);
})();
