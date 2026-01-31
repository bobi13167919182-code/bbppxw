
import React, { useState } from 'react';
import { 
  Rocket, 
  ShieldAlert, 
  Layout, 
  Palette, 
  MessageSquare, 
  Share2, 
  CheckCircle2, 
  Loader2,
  Terminal,
  ChevronRight,
  Globe,
  Twitter,
  Send,
  Zap,
  Target,
  TrendingUp,
  ExternalLink,
  ChevronLeft,
  Flame,
  Music,
  Tv,
  Eye,
  Activity,
  Search,
  Wand2
} from 'lucide-react';
import { MemeProject, BrandKit, ContentPackage, GenerationStep } from './types';
import * as gemini from './services/geminiService';

const HOT_DATA: Record<string, any[]> = {
  weibo_hot: [
    { title: "好想来零食回应", score: "1047058", duration: "2小时12分", peak: "1" },
    { title: "生命树招商", score: "756254", duration: "1小时48分", peak: "2" },
    { title: "智能穿戴千亿级赛道爆发", score: "622633", duration: "2小时47分", peak: "3" },
    { title: "丈夫去世妻子不知情婆家领走70万", score: "363772", duration: "1小时13分", peak: "4" },
    { title: "袁娅维在美国唐人街偶遇周深", score: "319901", duration: "35分", peak: "5" },
    { title: "赵四葬礼", score: "317969", duration: "1小时35分", peak: "6" },
    { title: "普通人上镜能有多离谱", score: "308927", duration: "4小时9分", peak: "6" },
    { title: "黄金白银一跌再跌", score: "240554", duration: "2小时11分", peak: "8" },
    { title: "我使馆要求日方尽快破案", score: "146890", duration: "1小时19分", peak: "4" },
  ],
  douyin_hot: [
    { title: "春节档电影票房口碑双丰收", score: "9820123", duration: "5小时", peak: "1" },
    { title: "哈尔滨冰雪大世界闭园公告", score: "8234123", duration: "3小时20分", peak: "2" },
    { title: "全红婵陈芋汐再次夺冠", score: "7123992", duration: "12小时", peak: "1" },
    { title: "挑战全网最火科目三", score: "6123992", duration: "8小时", peak: "4" },
  ],
  kuaishou_hot: [
    { title: "乡村奥林匹克开幕盛况", score: "5423122", duration: "4小时", peak: "1" },
    { title: "东北大集的年味儿实录", score: "4233112", duration: "2小时", peak: "2" },
    { title: "老铁们的硬核手工发明", score: "3122334", duration: "1小时", peak: "3" },
    { title: "大集上的年货采购指南", score: "2822334", duration: "3小时", peak: "5" },
  ]
};

const App: React.FC = () => {
  const [step, setStep] = useState<GenerationStep>('INIT');
  const [activePlatform, setActivePlatform] = useState('weibo_hot');
  const [hotTab, setHotTab] = useState<'list' | 'monitor'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [project, setProject] = useState<MemeProject>({
    name: '',
    ticker: '',
    concept: '',
    targetAudience: 'DeGen Community',
    chain: 'Solana'
  });
  
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [content, setContent] = useState<ContentPackage | null>(null);
  const [logs, setLogs] = useState<string[]>(["[系统] 战壕助手已上线，准备处理您的原始创意..."]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleReset = () => {
    setStep('INIT');
    setBrandKit(null);
    setContent(null);
    setError(null);
    addLog("[系统] 返回首页。");
  };

  const handleStartBranding = async (targetProject?: MemeProject) => {
    const p = targetProject || project;
    if (!p.name || !p.ticker || !p.concept) {
      setError("请输入项目名称、代币符号 and 核心概念");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      addLog(`[系统] 正在为 "${p.name}" 注入品牌基因...`);
      const kit = await gemini.generateBrandStrategy(p);
      setBrandKit(kit);
      setStep('BRANDING');
      addLog("品牌演化完成。");
    } catch (err) { setError("AI 演化失败"); } finally { setLoading(false); }
  };

  const handleGenerateFromHotspot = async (topic: string) => {
    const suggestedName = topic.length > 8 ? topic.substring(0, 8) : topic;
    const hotspotProject: MemeProject = {
      name: suggestedName,
      ticker: 'HOT',
      concept: `以热搜话题 "${topic}" 为核心的 Meme 项目，追求病毒式传播和文化共鸣。`,
      targetAudience: '社交媒体用户 & Web3 玩家',
      chain: 'Solana'
    };
    
    setProject(hotspotProject);
    setStep('INIT'); 
    addLog(`[热搜引擎] 捕获爆点: ${topic}，正在启动一键生成流程...`);
    await handleStartBranding(hotspotProject);
  };

  const handleGenerateVisuals = async () => {
    if (!brandKit) return;
    setLoading(true);
    addLog("[系统] 正在渲染视觉资产矩阵...");
    try {
      const logo = await gemini.generateVisualAsset(`High quality mascot logo for ${project.name}, reflecting trend concept: ${project.concept}, style: ${brandKit.visualStyle}`);
      const banner = await gemini.generateVisualAsset(`Cinematic web banner for ${project.name}, style: ${brandKit.visualStyle}`, "16:9");
      setBrandKit(prev => prev ? { ...prev, logoUrl: logo, bannerUrl: banner } : null);
      setStep('VISUALS');
      addLog("视觉资产部署完毕。");
    } catch (err) { setError("视觉生成失败"); } finally { setLoading(false); }
  };

  const handleGenerateContent = async () => {
    if (!brandKit) return;
    setLoading(true);
    addLog("[系统] 正在生成全域营销文案...");
    try {
      const pkg = await gemini.generateMarketingContent(project, brandKit);
      setContent(pkg);
      setStep('CONTENT');
      addLog("全案文案已注入。");
    } catch (err) { setError("文案生成失败"); } finally { setLoading(false); }
  };

  const sidebarItems = [
    { id: 'weibo_hot', label: '微博热搜榜', icon: '🔴' },
    { id: 'douyin_hot', label: '抖音热搜榜', icon: '🎵' },
    { id: 'kuaishou_hot', label: '快手热搜榜', icon: '🟠' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4 cursor-pointer group select-none flex-shrink-0" onClick={handleReset}>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic group-hover:text-green-500 transition-all duration-300">
            战壕助手
          </h1>
        </div>

        {/* Center: Hotspot Tool Trigger */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center">
          <button 
            onClick={() => { setStep('HOTSPOT'); addLog("[系统] 开启热搜神器..."); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all group relative overflow-hidden ${step === 'HOTSPOT' ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'hover:bg-white/5 text-green-500'}`}
          >
            <TrendingUp className={`w-5 h-5 relative z-10`} />
            <span className="font-black tracking-[0.2em] text-sm relative z-10 uppercase">热搜神器</span>
          </button>
        </div>

        <div className="flex gap-4 items-center flex-shrink-0">
          <a 
            href="https://x.com/ZHZS_BSC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white hover:text-green-500 shadow-lg group flex items-center justify-center"
            title="Follow us on X"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <button className="bg-white text-black px-6 py-2.5 rounded-full text-xs font-black hover:bg-green-500 transition-colors uppercase">
            Connect Wallet
          </button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto min-h-[90vh]">
        {step !== 'HOTSPOT' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3 space-y-6 animate-in slide-in-from-left duration-500">
              <div className="glass rounded-2xl p-4 border border-white/5 h-[350px] flex flex-col">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2 text-gray-400">
                  <Terminal className="w-4 h-4 text-green-500" />
                  <span className="text-[10px] font-mono font-bold uppercase">Signal_Feed</span>
                </div>
                <div className="flex-1 font-mono text-[10px] space-y-2 overflow-y-auto scrollbar-hide">
                  {logs.map((log, i) => (
                    <div key={i} className={`${log.includes('[系统]') ? 'text-green-400' : 'text-gray-500'}`}>{log}</div>
                  ))}
                  {loading && <div className="animate-pulse text-green-500 italic">...RENDERING...</div>}
                </div>
              </div>
              
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-6">Meme Flow</h3>
                <div className="space-y-5">
                  {[
                    { s: 'INIT', label: '基础设定', icon: <Rocket className="w-4 h-4" /> },
                    { s: 'BRANDING', label: '品牌演化', icon: <Palette className="w-4 h-4" /> },
                    { s: 'VISUALS', label: '视觉资产', icon: <Layout className="w-4 h-4" /> },
                    { s: 'CONTENT', label: '全案文案', icon: <MessageSquare className="w-4 h-4" /> },
                    { s: 'DISTRIBUTION', label: '一键分发', icon: <Share2 className="w-4 h-4" /> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${
                        step === item.s ? 'bg-green-500 border-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 
                        ['BRANDING','VISUALS','CONTENT','DISTRIBUTION'].indexOf(step) >= i ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'border-white/10 text-gray-700'
                      }`}>
                        {item.icon}
                      </div>
                      <span className={`text-xs uppercase tracking-widest ${step === item.s ? 'text-white font-black' : 'text-gray-600'}`}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-9 space-y-8">
              {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3"><ShieldAlert />{error}</div>}
              
              {step === 'INIT' && (
                <section className="glass rounded-[2rem] p-10 border border-white/10 relative overflow-hidden shadow-2xl">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Zap className="text-green-500 w-6 h-6 fill-green-500" />
                      <span className="text-green-500 text-xs font-black font-mono tracking-[0.3em] uppercase">Meme Infra Core</span>
                    </div>
                    <h2 className="text-5xl font-black mb-6 tracking-tighter text-white leading-tight">自动化部署您的 <br/><span className="text-green-500 italic">Meme 阵地</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Project Name</label>
                        <input type="text" placeholder="e.g. TrenchCat" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-green-500 outline-none text-white font-bold" value={project.name} onChange={e => setProject({...project, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Ticker</label>
                        <input type="text" placeholder="e.g. TCX" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-green-500 outline-none text-white font-mono font-bold" value={project.ticker} onChange={e => setProject({...project, ticker: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Narrative</label>
                        <textarea placeholder="输入项目的叙事核心或文化背景..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:border-green-500 outline-none transition h-32 text-white resize-none" value={project.concept} onChange={e => setProject({...project, concept: e.target.value})} />
                      </div>
                    </div>
                    <button onClick={() => handleStartBranding()} disabled={loading} className="group w-full bg-green-500 hover:bg-green-400 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-xl shadow-xl shadow-green-500/20">
                      {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Rocket className="w-6 h-6" />}
                      启动 AI 演化
                    </button>
                  </div>
                </section>
              )}

              {brandKit && step !== 'INIT' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <section className="glass rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                     <div className="h-56 bg-zinc-900 relative">
                        {brandKit.bannerUrl && <img src={brandKit.bannerUrl} className="w-full h-full object-cover" alt="Banner" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                        <div className="absolute -bottom-12 left-12 flex items-end gap-8">
                          <div className="w-36 h-36 bg-zinc-950 rounded-3xl border-4 border-[#050505] overflow-hidden neon-border shadow-2xl">
                            {brandKit.logoUrl && <img src={brandKit.logoUrl} className="w-full h-full object-cover" alt="Logo" />}
                          </div>
                          <div className="pb-8">
                            <h2 className="text-5xl font-black text-white tracking-tighter">{project.name}</h2>
                            <span className="px-3 py-1 bg-green-500 text-black font-mono font-black text-xs rounded uppercase tracking-tighter">${project.ticker}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-20 p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="md:col-span-2 space-y-6">
                          <p className="text-3xl font-black text-green-500 italic leading-tight">"{brandKit.tagline}"</p>
                          <p className="text-gray-400 leading-relaxed font-medium">{brandKit.missionStatement}</p>
                        </div>
                        <div className="flex flex-col justify-center items-end gap-6">
                          {step === 'BRANDING' && <button onClick={handleGenerateVisuals} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-sm hover:bg-green-500 transition">生成视觉资产</button>}
                          {step === 'VISUALS' && <button onClick={handleGenerateContent} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-sm hover:bg-green-500 transition">生成全案文案</button>}
                          {step === 'CONTENT' && <button onClick={() => setStep('DISTRIBUTION')} className="w-full bg-green-500 text-black py-4 rounded-2xl font-black uppercase text-sm shadow-xl shadow-green-500/20">启动分发</button>}
                        </div>
                      </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex gap-12 mb-8 border-b border-white/5 pb-4 px-2">
              <button onClick={() => setHotTab('list')} className={`text-xl font-black pb-4 relative transition-colors ${hotTab === 'list' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-400'}`}>榜单{hotTab === 'list' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full shadow-[0_-2px_8px_rgba(249,115,22,0.4)]" />}</button>
              <button onClick={() => setHotTab('monitor')} className={`text-xl font-black pb-4 relative transition-colors ${hotTab === 'monitor' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-400'}`}>监控{hotTab === 'monitor' && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-full shadow-[0_-2px_8px_rgba(249,115,22,0.4)]" />}</button>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-64 space-y-1">
                <div className="bg-orange-600/90 text-white px-4 py-3 rounded-t-xl font-black italic flex items-center justify-between shadow-lg">
                  <span className="tracking-widest uppercase">今日热榜</span>
                  <div className="flex gap-1"><div className="w-1 h-4 bg-white/40 skew-x-12" /><div className="w-1 h-4 bg-white/40 skew-x-12" /></div>
                </div>
                <div className="glass rounded-b-xl border border-white/5 overflow-hidden shadow-xl">
                  {sidebarItems.map((item) => (
                    <button key={item.id} onClick={() => setActivePlatform(item.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-all group border-b border-white/[0.03] last:border-0 ${activePlatform === item.id ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
                      <span className="text-base grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-[#fffaf5] rounded-3xl border border-orange-100 shadow-2xl min-h-[700px] flex flex-col">
                <div className="p-8 border-b border-orange-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                      {activePlatform.startsWith('weibo') && <Twitter className="text-red-500" />}
                      {activePlatform.startsWith('douyin') && <Music className="text-black" />}
                      {activePlatform.startsWith('kuaishou') && <Zap className="text-orange-500 fill-orange-500" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-zinc-800 tracking-tight flex items-center gap-2">
                        {sidebarItems.find(i => i.id === activePlatform)?.label}
                        <div className="bg-orange-500/10 text-orange-600 text-[10px] px-1.5 py-0.5 rounded-md font-mono uppercase font-black">PRO</div>
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium">榜单时间: {new Date().toLocaleDateString('zh-CN')} {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 实时更新</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => addLog("数据已刷新")} className="p-2 hover:bg-orange-50 rounded-full transition-colors text-zinc-400 hover:text-orange-500"><Activity className="w-5 h-5" /></button>
                    <button onClick={handleReset} className="p-2 hover:bg-orange-50 rounded-full transition-colors text-zinc-400 hover:text-orange-500"><ChevronLeft className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="flex-1 p-8 space-y-0.5">
                  {(HOT_DATA[activePlatform] || HOT_DATA['weibo_hot']).map((item, i) => (
                    <div key={i} className="group flex items-center gap-6 py-6 px-4 rounded-2xl hover:bg-orange-500/[0.03] transition-all border-b border-orange-100/30 last:border-0 relative">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg transition-colors ${i < 3 ? 'text-white bg-orange-500 shadow-lg shadow-orange-500/20' : 'text-zinc-400 bg-zinc-100'}`}>{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-bold text-zinc-800 group-hover:text-orange-600 transition-colors leading-tight">{item.title}</h4>
                          <button onClick={() => handleGenerateFromHotspot(item.title)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[11px] font-black uppercase hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"><Wand2 className="w-3.5 h-3.5" />一键生成文案头像</button>
                        </div>
                        <div className="flex gap-12 text-[12px] text-zinc-400 font-medium">
                          <span className="flex items-center gap-2">热度:<span className="text-zinc-500 font-bold">{item.score}</span></span>
                          <span className="flex items-center gap-2">在榜:<span className="text-zinc-500 font-bold">{item.duration}</span></span>
                          <span className="flex items-center gap-2 ml-auto">今日最高排名:<span className="text-orange-500 font-black">{item.peak}</span></span>
                        </div>
                      </div>
                      <div className="absolute right-20 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none text-2xl font-black italic text-orange-900 rotate-[-12deg]">TRENCH_HOTSPOT</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-zinc-100/50 rounded-b-3xl flex items-center justify-between px-8">
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium"><Search className="w-4 h-4" />已监控全网 42,931 个爆点信号</div>
                  <div className="text-[10px] text-zinc-300 font-mono uppercase tracking-[0.4em]">Powered by Two-Bit AI</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 border-t border-white/5 py-16 text-center">
        <div className="flex justify-center items-center gap-6 mb-4">
          <div className="w-12 h-[1px] bg-white/10" />
          <span className="text-[10px] text-gray-700 uppercase tracking-[0.6em] font-mono font-bold">Trench_AI Protocol</span>
          <div className="w-12 h-[1px] bg-white/10" />
        </div>
      </footer>
    </div>
  );
};

export default App;
