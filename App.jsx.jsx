import { useState, useEffect, useCallback, useRef } from "react";

// ─── 수영장 데이터 ─────────────────────────────────────────────────────────────
const DEFAULT_POOL = { name:"성일스포렉스", address:"서울특별시 강동구 성내동" };

// 특별시/광역시/특별자치시 → 수영장 목록
const METRO_POOLS = {
  "서울특별시": [
    "성일스포렉스 (강동구 성내동)","강동구민체육센터 수영장","송파스포츠센터 수영장",
    "잠실실내수영장","노원구민체육센터 수영장","마포구민체육센터 수영장",
    "서대문구민체육센터 수영장","은평스포츠센터 수영장","광진구민체육센터 수영장",
    "성북구민체육센터 수영장","도봉구민체육센터 수영장","강북구민체육센터 수영장",
    "동대문구민체육센터 수영장","중랑구민체육센터 수영장","성동구민체육센터 수영장",
    "용산구민체육센터 수영장","종로구민체육센터 수영장","중구민체육센터 수영장",
    "양천구민체육센터 수영장","강서구민체육센터 수영장","구로구민체육센터 수영장",
    "금천구민체육센터 수영장","영등포구민체육센터 수영장","동작구민체육센터 수영장",
    "관악구민체육센터 수영장","서초구민체육센터 수영장","강남구민체육센터 수영장",
    "송파구민체육센터 수영장","올림픽수영장","태릉국제수영장",
  ],
  "부산광역시": [
    "부산시민수영장","해운대수영장","기장군수영장","북구민체육센터 수영장",
    "사상구민체육센터 수영장","동래구민체육센터 수영장","연제구민체육센터 수영장",
    "수영구민체육센터 수영장","남구민체육센터 수영장","부산진구민체육센터 수영장",
  ],
  "대구광역시": [
    "대구시민수영장","달서구민체육센터 수영장","북구민체육센터 수영장",
    "수성구민체육센터 수영장","동구민체육센터 수영장","서구민체육센터 수영장",
  ],
  "인천광역시": [
    "인천시립수영장","남동구민체육센터 수영장","부평구민체육센터 수영장",
    "계양구민체육센터 수영장","서구민체육센터 수영장","미추홀구민체육센터 수영장",
    "연수구민체육센터 수영장","중구민체육센터 수영장",
  ],
  "광주광역시": [
    "광주시민수영장","북구민체육센터 수영장","서구민체육센터 수영장",
    "남구민체육센터 수영장","동구민체육센터 수영장","광산구민체육센터 수영장",
  ],
  "대전광역시": [
    "대전시민수영장","유성구민체육센터 수영장","서구민체육센터 수영장",
    "중구민체육센터 수영장","동구민체육센터 수영장","대덕구민체육센터 수영장",
  ],
  "울산광역시": [
    "울산시민수영장","남구민체육센터 수영장","북구민체육센터 수영장",
    "동구민체육센터 수영장","중구민체육센터 수영장","울주군민체육센터 수영장",
  ],
  "세종특별자치시": [
    "세종시민체육관 수영장","조치원읍 수영장","아름동 수영장","도담동 수영장",
  ],
};

// 도 → 시/군 → 수영장
const PROVINCE_POOLS = {
  "경기도": {
    "수원시": ["수원시민체육관 수영장","수원실내수영장","영통구 수영장","팔달구 수영장"],
    "성남시": ["성남시민체육관 수영장","분당구 수영장","중원구 수영장","수정구 수영장"],
    "고양시": ["고양시민체육관 수영장","덕양구 수영장","일산동구 수영장","일산서구 수영장"],
    "용인시": ["용인시민체육관 수영장","기흥구 수영장","수지구 수영장","처인구 수영장"],
    "부천시": ["부천시민체육관 수영장","원미구 수영장","오정구 수영장"],
    "안산시": ["안산시민체육관 수영장","단원구 수영장","상록구 수영장"],
    "안양시": ["안양시민체육관 수영장","만안구 수영장","동안구 수영장"],
    "남양주시": ["남양주시민체육관 수영장","진접읍 수영장","별내면 수영장"],
    "화성시": ["화성시민체육관 수영장","동탄 수영장","봉담 수영장"],
    "평택시": ["평택시민체육관 수영장","안중읍 수영장","팽성읍 수영장"],
    "의정부시": ["의정부시민체육관 수영장","호원동 수영장"],
    "시흥시": ["시흥시민체육관 수영장","은행동 수영장","정왕동 수영장"],
    "파주시": ["파주시민체육관 수영장","금촌동 수영장","운정 수영장"],
    "김포시": ["김포시민체육관 수영장","장기동 수영장"],
    "광주시": ["광주시민체육관 수영장","경안동 수영장"],
    "광명시": ["광명시민체육관 수영장","소하동 수영장"],
    "군포시": ["군포시민체육관 수영장","산본동 수영장"],
    "하남시": ["하남시민체육관 수영장","미사 수영장"],
    "오산시": ["오산시민체육관 수영장"],
    "이천시": ["이천시민체육관 수영장","설봉공원 수영장"],
    "양주시": ["양주시민체육관 수영장"],
    "구리시": ["구리시민체육관 수영장"],
    "포천시": ["포천시민체육관 수영장"],
    "의왕시": ["의왕시민체육관 수영장"],
    "여주시": ["여주시민체육관 수영장"],
    "동두천시": ["동두천시민체육관 수영장"],
    "양평군": ["양평군민체육관 수영장"],
    "가평군": ["가평군민체육관 수영장"],
    "연천군": ["연천군민체육관 수영장"],
  },
  "강원특별자치도": {
    "춘천시": ["춘천시민체육관 수영장","석사동 수영장","효자동 수영장"],
    "원주시": ["원주시민체육관 수영장","무실동 수영장","단구동 수영장"],
    "강릉시": ["강릉시민체육관 수영장","교동 수영장","포남동 수영장"],
    "동해시": ["동해시민체육관 수영장"],
    "태백시": ["태백시민체육관 수영장"],
    "속초시": ["속초시민체육관 수영장"],
    "삼척시": ["삼척시민체육관 수영장"],
    "홍천군": ["홍천군민체육관 수영장"],
    "횡성군": ["횡성군민체육관 수영장"],
    "영월군": ["영월군민체육관 수영장"],
    "평창군": ["평창군민체육관 수영장"],
    "정선군": ["정선군민체육관 수영장"],
    "철원군": ["철원군민체육관 수영장"],
    "화천군": ["화천군민체육관 수영장"],
    "양구군": ["양구군민체육관 수영장"],
    "인제군": ["인제군민체육관 수영장"],
    "고성군": ["고성군민체육관 수영장"],
    "양양군": ["양양군민체육관 수영장"],
  },
  "충청북도": {
    "청주시": ["청주시민체육관 수영장","흥덕구 수영장","청원구 수영장","서원구 수영장","상당구 수영장"],
    "충주시": ["충주시민체육관 수영장","호암동 수영장"],
    "제천시": ["제천시민체육관 수영장"],
    "보은군": ["보은군민체육관 수영장"],
    "옥천군": ["옥천군민체육관 수영장"],
    "영동군": ["영동군민체육관 수영장"],
    "증평군": ["증평군민체육관 수영장"],
    "진천군": ["진천군민체육관 수영장"],
    "괴산군": ["괴산군민체육관 수영장"],
    "음성군": ["음성군민체육관 수영장"],
    "단양군": ["단양군민체육관 수영장"],
  },
  "충청남도": {
    "천안시": ["천안시민체육관 수영장","서북구 수영장","동남구 수영장"],
    "공주시": ["공주시민체육관 수영장"],
    "보령시": ["보령시민체육관 수영장"],
    "아산시": ["아산시민체육관 수영장","온양 수영장"],
    "서산시": ["서산시민체육관 수영장"],
    "논산시": ["논산시민체육관 수영장"],
    "계룡시": ["계룡시민체육관 수영장"],
    "당진시": ["당진시민체육관 수영장"],
    "금산군": ["금산군민체육관 수영장"],
    "부여군": ["부여군민체육관 수영장"],
    "서천군": ["서천군민체육관 수영장"],
    "청양군": ["청양군민체육관 수영장"],
    "홍성군": ["홍성군민체육관 수영장"],
    "예산군": ["예산군민체육관 수영장"],
    "태안군": ["태안군민체육관 수영장"],
  },
  "전라북도": {
    "전주시": ["전주시민체육관 수영장","덕진구 수영장","완산구 수영장"],
    "군산시": ["군산시민체육관 수영장","나운동 수영장"],
    "익산시": ["익산시민체육관 수영장","영등동 수영장"],
    "정읍시": ["정읍시민체육관 수영장"],
    "남원시": ["남원시민체육관 수영장"],
    "김제시": ["김제시민체육관 수영장"],
    "완주군": ["완주군민체육관 수영장"],
    "진안군": ["진안군민체육관 수영장"],
    "무주군": ["무주군민체육관 수영장"],
    "장수군": ["장수군민체육관 수영장"],
    "임실군": ["임실군민체육관 수영장"],
    "순창군": ["순창군민체육관 수영장"],
    "고창군": ["고창군민체육관 수영장"],
    "부안군": ["부안군민체육관 수영장"],
  },
  "전라남도": {
    "목포시": ["목포시민체육관 수영장","옥암동 수영장"],
    "여수시": ["여수시민체육관 수영장","돌산도 수영장"],
    "순천시": ["순천시민체육관 수영장","조례동 수영장"],
    "나주시": ["나주시민체육관 수영장"],
    "광양시": ["광양시민체육관 수영장"],
    "담양군": ["담양군민체육관 수영장"],
    "곡성군": ["곡성군민체육관 수영장"],
    "구례군": ["구례군민체육관 수영장"],
    "고흥군": ["고흥군민체육관 수영장"],
    "보성군": ["보성군민체육관 수영장"],
    "화순군": ["화순군민체육관 수영장"],
    "장흥군": ["장흥군민체육관 수영장"],
    "강진군": ["강진군민체육관 수영장"],
    "해남군": ["해남군민체육관 수영장"],
    "영암군": ["영암군민체육관 수영장"],
    "무안군": ["무안군민체육관 수영장"],
    "함평군": ["함평군민체육관 수영장"],
    "영광군": ["영광군민체육관 수영장"],
    "장성군": ["장성군민체육관 수영장"],
    "완도군": ["완도군민체육관 수영장"],
    "진도군": ["진도군민체육관 수영장"],
    "신안군": ["신안군민체육관 수영장"],
  },
  "경상북도": {
    "포항시": ["포항시민체육관 수영장","남구 수영장","북구 수영장"],
    "경주시": ["경주시민체육관 수영장","황성동 수영장"],
    "김천시": ["김천시민체육관 수영장"],
    "안동시": ["안동시민체육관 수영장","옥동 수영장"],
    "구미시": ["구미시민체육관 수영장","원평동 수영장"],
    "영주시": ["영주시민체육관 수영장"],
    "영천시": ["영천시민체육관 수영장"],
    "상주시": ["상주시민체육관 수영장"],
    "문경시": ["문경시민체육관 수영장"],
    "경산시": ["경산시민체육관 수영장"],
    "군위군": ["군위군민체육관 수영장"],
    "의성군": ["의성군민체육관 수영장"],
    "청송군": ["청송군민체육관 수영장"],
    "영양군": ["영양군민체육관 수영장"],
    "영덕군": ["영덕군민체육관 수영장"],
    "청도군": ["청도군민체육관 수영장"],
    "고령군": ["고령군민체육관 수영장"],
    "성주군": ["성주군민체육관 수영장"],
    "칠곡군": ["칠곡군민체육관 수영장"],
    "예천군": ["예천군민체육관 수영장"],
    "봉화군": ["봉화군민체육관 수영장"],
    "울진군": ["울진군민체육관 수영장"],
    "울릉군": ["울릉군민체육관 수영장"],
  },
  "경상남도": {
    "창원시": ["창원시민체육관 수영장","의창구 수영장","성산구 수영장","마산합포구 수영장","마산회원구 수영장","진해구 수영장"],
    "진주시": ["진주시민체육관 수영장","상대동 수영장"],
    "통영시": ["통영시민체육관 수영장"],
    "사천시": ["사천시민체육관 수영장"],
    "김해시": ["김해시민체육관 수영장","내외동 수영장"],
    "밀양시": ["밀양시민체육관 수영장"],
    "거제시": ["거제시민체육관 수영장","고현동 수영장"],
    "양산시": ["양산시민체육관 수영장","물금읍 수영장"],
    "의령군": ["의령군민체육관 수영장"],
    "함안군": ["함안군민체육관 수영장"],
    "창녕군": ["창녕군민체육관 수영장"],
    "고성군": ["고성군민체육관 수영장"],
    "남해군": ["남해군민체육관 수영장"],
    "하동군": ["하동군민체육관 수영장"],
    "산청군": ["산청군민체육관 수영장"],
    "함양군": ["함양군민체육관 수영장"],
    "거창군": ["거창군민체육관 수영장"],
    "합천군": ["합천군민체육관 수영장"],
  },
  "제주특별자치도": {
    "제주시": ["제주시민체육관 수영장","노형동 수영장","아라동 수영장","한림읍 수영장","애월읍 수영장"],
    "서귀포시": ["서귀포시민체육관 수영장","대정읍 수영장","남원읍 수영장","성산읍 수영장"],
  },
};

const METRO_REGIONS   = Object.keys(METRO_POOLS);
const PROVINCE_REGIONS = Object.keys(PROVINCE_POOLS);
const ALL_REGIONS     = [...METRO_REGIONS, ...PROVINCE_REGIONS];

// ─── 상수 ─────────────────────────────────────────────────────────────────────
const COLORS = [
  { label:"바다",   value:"#0077B6", bg:"#E0F4FF" },
  { label:"파도",   value:"#00B4D8", bg:"#E0FAFF" },
  { label:"수면",   value:"#48CAE4", bg:"#E0F8FF" },
  { label:"산호",   value:"#FF6B6B", bg:"#FFF0F0" },
  { label:"해초",   value:"#2DC653", bg:"#EDFAF1" },
  { label:"모래",   value:"#F4A261", bg:"#FFF8F0" },
];
const ICONS    = ["🏊","🏅","📅","🎽","🥽","🏆","🎯","💪","📋","🚿","⏱️","🌊","🎉","💼","📚"];
const WEEKDAYS = ["일","월","화","수","목","금","토"];
const MONTHS   = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const today    = new Date();

// ─── 유틸 ─────────────────────────────────────────────────────────────────────
const dk          = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const todayKey    = dk(today.getFullYear(), today.getMonth(), today.getDate());
const daysInMonth = (y,m) => new Date(y, m+1, 0).getDate();
const firstDay    = (y,m) => new Date(y, m, 1).getDay();
const fmtDate     = key => { const [,m,d]=key.split("-"); return `${m}월 ${d}일`; };
const timeRange   = (s,e) => s&&e?`${s} ~ ${e}`:s?`${s}~`:e?`~${e}`:"";

const DEMO_USERS = [
  { uid:"u1", name:"김지수", email:"jisu@gmail.com",    photo:"🏊", color:"#0077B6" },
  { uid:"u2", name:"박민준", email:"minjun@gmail.com",  photo:"🏊‍♂️", color:"#00B4D8" },
  { uid:"u3", name:"이서연", email:"seoyeon@gmail.com", photo:"🏊‍♀️", color:"#48CAE4" },
];

const load = (k,def) => { try { return JSON.parse(localStorage.getItem(k))??def; } catch { return def; } };
const save = (k,v)   => localStorage.setItem(k, JSON.stringify(v));

// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,        setUser]        = useState(()=>load("ssp_user",null));
  const [authStep,    setAuthStep]    = useState("login");
  const [year,        setYear]        = useState(today.getFullYear());
  const [month,       setMonth]       = useState(today.getMonth());
  const [slideDir,    setSlideDir]    = useState(null);
  const [events,      setEvents]      = useState(()=>load("ssp_events",{}));
  const [members,     setMembers]     = useState(()=>load("ssp_members",[]));
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState({});
  const [tab,         setTab]         = useState("calendar");
  const [pwaPrompt,   setPwaPrompt]   = useState(null);
  const [toast,       setToast]       = useState(null);
  const [kakaoLinked, setKakaoLinked] = useState(()=>load("ssp_kakao",false));
  const [syncAnim,    setSyncAnim]    = useState(false);
  const [inviteCode,  setInviteCode]  = useState("");
  const [myCode]                      = useState(()=>load("ssp_code", Math.random().toString(36).slice(2,8).toUpperCase()));

  // swipe
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const mouseStartX = useRef(null);

  useEffect(()=>{ save("ssp_code",myCode); },[myCode]);
  useEffect(()=>{ const h=e=>{e.preventDefault();setPwaPrompt(e);}; window.addEventListener("beforeinstallprompt",h); return()=>window.removeEventListener("beforeinstallprompt",h); },[]);
  useEffect(()=>{ save("ssp_events",events);  },[events]);
  useEffect(()=>{ save("ssp_members",members); },[members]);
  useEffect(()=>{ save("ssp_user",user);       },[user]);
  useEffect(()=>{ save("ssp_kakao",kakaoLinked); },[kakaoLinked]);

  const showToast   = useCallback((msg,type="info")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); },[]);
  const triggerSync = useCallback(()=>{ setSyncAnim(true); setTimeout(()=>setSyncAnim(false),1500); },[]);

  // ── Month change ─────────────────────────────────────────────────────────
  const changeMonth = useCallback((dir)=>{
    setSlideDir(dir);
    setTimeout(()=>{
      if (dir==="left"){ if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); }
      else             { if(month===0) {setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); }
      setSlideDir(null);
    },220);
  },[month]);

  // ── Swipe ────────────────────────────────────────────────────────────────
  const onTouchStart = e=>{ touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; };
  const onTouchEnd   = e=>{
    if(touchStartX.current===null) return;
    const dx=e.changedTouches[0].clientX-touchStartX.current;
    const dy=Math.abs(e.changedTouches[0].clientY-touchStartY.current);
    if(Math.abs(dx)>50&&dy<80) changeMonth(dx<0?"left":"right");
    touchStartX.current=null;
  };
  const onMouseDown = e=>{ mouseStartX.current=e.clientX; };
  const onMouseUp   = e=>{
    if(mouseStartX.current===null) return;
    const dx=e.clientX-mouseStartX.current;
    if(Math.abs(dx)>60) changeMonth(dx<0?"left":"right");
    mouseStartX.current=null;
  };

  // ── Auth ─────────────────────────────────────────────────────────────────
  const handleGoogleLogin = ()=>{ const u=DEMO_USERS[0]; setUser(u); setAuthStep(kakaoLinked?"done":"kakao"); showToast(`${u.name}님, 환영합니다! 🏊`,"success"); };
  const handleKakaoLink   = ()=>{ setKakaoLinked(true); setAuthStep("done"); showToast("카카오톡 연동 완료! 🟡","success"); };
  const handleKakaoSkip   = ()=>setAuthStep("done");

  // ── Kakao share ──────────────────────────────────────────────────────────
  const kakaoShare = (ev,dateKey)=>{
    const tr=timeRange(ev.startTime,ev.endTime);
    const loc=ev.pool||DEFAULT_POOL.name;
    const text=`🏊 [성일수영팀] ${fmtDate(dateKey)}${tr?" "+tr:""}\n${ev.icon} ${ev.title}\n📍 ${loc}${ev.note?"\n💬 "+ev.note:""}`;
    if(navigator.share) navigator.share({title:"성일수영팀 일정",text});
    else { navigator.clipboard.writeText(text); showToast("공유 내용 복사됨! 🔗","success"); }
  };

  // ── Event CRUD ───────────────────────────────────────────────────────────
  const openAdd  = dateKey=>{ setForm({title:"",icon:"🏊",color:COLORS[0].value,note:"",startTime:"",endTime:"",pool:DEFAULT_POOL.name,author:user?.uid}); setModal({date:dateKey}); };
  const openEdit = (dateKey,idx,e)=>{ e?.stopPropagation(); setForm({...events[dateKey][idx]}); setModal({date:dateKey,idx}); };
  const saveEvent = ()=>{
    if(!form.title.trim()) return;
    const list=[...(events[modal.date]||[])];
    const newEv={...form,author:user?.uid,updatedAt:Date.now()};
    if(modal.idx!=null) list[modal.idx]=newEv; else list.push(newEv);
    setEvents(p=>({...p,[modal.date]:list}));
    setModal(null); triggerSync();
    if(kakaoLinked&&members.length>0) setTimeout(()=>showToast(`📲 멤버 ${members.length}명에게 카카오 알림 전송됨`,"kakao"),800);
  };
  const deleteEvent = ()=>{
    const list=[...(events[modal.date]||[])]; list.splice(modal.idx,1);
    setEvents(p=>({...p,[modal.date]:list.length?list:undefined}));
    setModal(null); triggerSync();
  };

  // ── Join ─────────────────────────────────────────────────────────────────
  const joinWithCode = ()=>{
    if(!inviteCode.trim()) return;
    const demo=DEMO_USERS.find(u=>u.uid!==user?.uid)||DEMO_USERS[1];
    if(members.find(m=>m.uid===demo.uid)){ showToast("이미 참여 중인 멤버예요","warn"); return; }
    setMembers(p=>[...p,demo]); setInviteCode(""); showToast(`${demo.name}님이 합류했어요! 🎊`,"success"); triggerSync();
  };

  // ── Calendar data ────────────────────────────────────────────────────────
  const dim   = daysInMonth(year,month);
  const fd    = firstDay(year,month);
  const cells = Math.ceil((fd+dim)/7)*7;

  const monthEvents=[];
  for(let d=1;d<=dim;d++){
    const k=dk(year,month,d);
    (events[k]||[]).forEach((ev,i)=>monthEvents.push({k,d,ev,i}));
  }
  monthEvents.sort((a,b)=>a.d!==b.d?a.d-b.d:(a.ev.startTime||"")>(b.ev.startTime||"")?1:-1);

  const installPwa = async()=>{
    if(!pwaPrompt){ showToast("브라우저 메뉴 → '홈 화면에 추가'를 눌러주세요 📱"); return; }
    pwaPrompt.prompt(); const {outcome}=await pwaPrompt.userChoice;
    if(outcome==="accepted") showToast("홈 화면에 앱이 추가됐어요! 🎉","success");
    setPwaPrompt(null);
  };

  // ══════════════════════════════════════════════════════════════════════════
  if(!user||authStep==="login") return <LoginScreen onGoogle={handleGoogleLogin}/>;
  if(authStep==="kakao") return <KakaoLinkScreen user={user} onLink={handleKakaoLink} onSkip={handleKakaoSkip}/>;

  const slideStyle = slideDir
    ? {animation:slideDir==="left"?"slideOutLeft 0.22s ease forwards":"slideOutRight 0.22s ease forwards"}
    : {animation:"slideIn 0.22s ease"};

  return (
    <div style={S.app}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* Header */}
      <header style={S.header}>
        <div style={S.headerLeft}>
          <span style={S.headerWave}>🌊</span>
          <div>
            <div style={S.appName}>SEONGIL SWIMTEAM</div>
            <div style={S.appSub}>PLANNER</div>
          </div>
          {syncAnim && <span style={{fontSize:13,animation:"spin 1s linear infinite",marginLeft:6}}>🔄</span>}
        </div>
        <div style={S.headerRight}>
          {kakaoLinked && <span style={S.kakaoBadge}>🟡</span>}
          <button style={S.pwaBtn} onClick={installPwa}>📲</button>
          <div style={{...S.avatar,background:user.color}}>{user.photo}</div>
        </div>
      </header>

      {/* Wave decoration */}
      <div style={S.waveBanner}>
        <svg viewBox="0 0 400 40" style={{width:"100%",display:"block"}} preserveAspectRatio="none">
          <path d="M0,20 C50,5 100,35 150,20 C200,5 250,35 300,20 C350,5 400,30 400,20 L400,40 L0,40 Z" fill="#0077B6" opacity="0.12"/>
          <path d="M0,28 C60,12 120,38 180,25 C240,12 300,38 360,25 C380,20 400,28 400,28 L400,40 L0,40 Z" fill="#00B4D8" opacity="0.18"/>
        </svg>
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {[["calendar","🏊 달력"],["list","📋 일정"],["share","👥 팀"]].map(([k,label])=>(
          <button key={k} style={{...S.navBtn,...(tab===k?S.navBtnActive:{})}} onClick={()=>setTab(k)}>{label}</button>
        ))}
      </nav>

      {/* ── Calendar Tab ── */}
      {tab==="calendar" && (
        <div style={S.content} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
          <div style={S.monthNav}>
            <button style={S.arrowBtn} onClick={()=>changeMonth("right")}>‹</button>
            <div>
              <div style={S.monthTitle}>{MONTHS[month]}</div>
              <div style={S.monthYear}>{year}</div>
            </div>
            <button style={S.arrowBtn} onClick={()=>changeMonth("left")}>›</button>
          </div>

          <div style={{...S.calWrap,...slideStyle}}>
            <div style={S.weekRow}>
              {WEEKDAYS.map((d,i)=>(
                <div key={d} style={{...S.weekLabel,color:i===0?"#FF6B6B":i===6?"#00B4D8":"#90CAE4"}}>{d}</div>
              ))}
            </div>
            <div style={S.grid}>
              {Array.from({length:cells},(_,idx)=>{
                const dayNum=idx-fd+1;
                const valid=dayNum>=1&&dayNum<=dim;
                const key=valid?dk(year,month,dayNum):null;
                const evs=key?(events[key]||[]):[];
                const isToday=key===todayKey;
                const col=idx%7;
                return (
                  <div key={idx} onClick={()=>valid&&openAdd(key)}
                    style={{...S.cell,...(valid?{}:S.cellEmpty),...(isToday?S.cellToday:{})}}>
                    {valid && <>
                      <span style={{...S.dayNum,
                        color:isToday?"white":col===0?"#FF6B6B":col===6?"#00B4D8":"#1a3a5c",
                        background:isToday?"#0077B6":"transparent"}}>
                        {dayNum}
                      </span>
                      {evs.slice(0,2).map((ev,i)=>(
                        <div key={i} onClick={e=>openEdit(key,i,e)}
                          style={{...S.chip,background:ev.color+"33",borderLeftColor:ev.color,color:ev.color}}>
                          {ev.icon} {ev.title}
                        </div>
                      ))}
                      {evs.length>2&&<div style={S.more}>+{evs.length-2}</div>}
                    </>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 일정 모아보기 */}
          <div style={S.summaryWrap}>
            <div style={S.summaryHeader}>
              <span style={S.summaryTitle}>🌊 {MONTHS[month]} 팀 일정</span>
              <span style={S.summaryCount}>{monthEvents.length}개</span>
            </div>
            {monthEvents.length===0
              ? <div style={S.summaryEmpty}>이번 달 일정이 없어요 🏊<br/>날짜를 눌러 훈련 일정을 추가해보세요!</div>
              : (() => {
                  const groups={};
                  monthEvents.forEach(item=>{ if(!groups[item.d]) groups[item.d]=[]; groups[item.d].push(item); });
                  return Object.entries(groups).map(([d,items])=>(
                    <div key={d} style={S.summaryGroup}>
                      <div style={S.summaryDayHeader}>
                        <div style={{...S.summaryDayBadge,
                          background:dk(year,month,Number(d))===todayKey?"#0077B6":"#E0F4FF",
                          color:dk(year,month,Number(d))===todayKey?"white":"#0077B6"}}>
                          {d}일 <span style={{fontWeight:500,opacity:0.75}}>{WEEKDAYS[new Date(year,month,Number(d)).getDay()]}</span>
                        </div>
                        {dk(year,month,Number(d))===todayKey&&<span style={S.todayTag}>오늘</span>}
                      </div>
                      {items.map(({ev,i,k})=>(
                        <div key={i} onClick={()=>openEdit(k,i,{stopPropagation:()=>{}})}
                          style={{...S.summaryItem,borderLeftColor:ev.color}}>
                          <div style={{...S.summaryDot,background:ev.color}}/>
                          <div style={S.summaryItemContent}>
                            <div style={S.summaryItemTitle}>{ev.icon} {ev.title}</div>
                            {ev.pool&&<div style={S.summaryItemPool}>📍 {ev.pool}</div>}
                            {(ev.startTime||ev.endTime)&&<div style={S.summaryItemTime}>⏱ {timeRange(ev.startTime,ev.endTime)}</div>}
                            {ev.note&&<div style={S.summaryItemNote}>💬 {ev.note}</div>}
                          </div>
                          {kakaoLinked&&<button style={S.kakaoMiniBtn} onClick={e=>{e.stopPropagation();kakaoShare(ev,k);}}>🟡</button>}
                        </div>
                      ))}
                    </div>
                  ));
                })()
            }
          </div>
        </div>
      )}

      {/* ── List Tab ── */}
      {tab==="list" && (
        <div style={S.content}>
          <div style={S.sectionTitle}>📋 {year}년 {MONTHS[month]} 전체 일정</div>
          {monthEvents.length===0
            ? <Empty text="이번 달 일정이 없어요. 달력에서 추가해보세요!"/>
            : monthEvents.map(({k,d,ev,i})=>(
              <EventCard key={`${k}-${i}`} ev={ev} dateKey={k} user={user} members={members}
                onEdit={()=>openEdit(k,i)} onKakao={()=>kakaoShare(ev,k)} kakaoLinked={kakaoLinked}/>
            ))
          }
        </div>
      )}

      {/* ── Share/Team Tab ── */}
      {tab==="share" && (
        <div style={S.content}>
          <div style={S.shareCard}>
            <div style={S.shareCardHeader}>
              <span style={{fontSize:26}}>🟡</span>
              <div style={{flex:1}}>
                <div style={S.shareCardTitle}>카카오톡 연동</div>
                <div style={S.shareCardSub}>{kakaoLinked?"연동됨 — 일정 변경 시 자동 알림":"연동하면 팀원에게 자동 알림 전송"}</div>
              </div>
              {!kakaoLinked?<button style={S.kakaoBtn} onClick={handleKakaoLink}>연동</button>
                :<span style={S.connectedBadge}>✅</span>}
            </div>
          </div>
          <div style={S.shareCard}>
            <div style={S.shareCardTitle}>📨 초대 코드</div>
            <div style={S.codeBox}>
              <span style={S.codeText}>{myCode}</span>
              <button style={S.copyBtn} onClick={()=>{navigator.clipboard.writeText(myCode);showToast("코드 복사됨!");}}>복사</button>
            </div>
            {kakaoLinked&&<button style={S.kakaoShareBtn} onClick={()=>{
              navigator.clipboard.writeText(`🏊 성일수영팀 플래너 초대\n코드: ${myCode}`);
              showToast("카카오 공유 내용 복사됨! 🟡");
            }}>🟡 카카오로 팀 초대</button>}
          </div>
          <div style={S.shareCard}>
            <div style={S.shareCardTitle}>🔑 코드로 팀 참여</div>
            <div style={S.joinRow}>
              <input value={inviteCode} onChange={e=>setInviteCode(e.target.value.toUpperCase())}
                placeholder="초대 코드 입력" maxLength={6} style={S.codeInput}/>
              <button style={S.joinBtn} onClick={joinWithCode}>참여</button>
            </div>
          </div>
          <div style={S.shareCard}>
            <div style={S.shareCardTitle}>🏊 팀 멤버 ({members.length+1}명)</div>
            <MemberRow user={user} isMe/>
            {members.map((m,i)=><MemberRow key={i} user={m}/>)}
          </div>
          <div style={S.shareCard}>
            <div style={S.shareCardTitle}>📱 홈 화면 앱 추가</div>
            <div style={{...S.shareCardSub,marginBottom:10}}>앱처럼 바로가기로 설치하세요</div>
            <button style={S.pwaInstallBtn} onClick={installPwa}>📲 홈 화면에 추가</button>
          </div>
        </div>
      )}

      <button style={S.fab} onClick={()=>openAdd(todayKey)}>＋</button>

      {/* Modal */}
      {modal && (
        <Modal onClose={()=>setModal(null)}>
          <div style={S.modalTitle}>{modal.idx!=null?"✏️ 일정 수정":"🏊 새 일정 추가"}</div>
          <div style={S.modalDate}>{fmtDate(modal.date)}</div>

          <div style={S.iconGrid}>
            {ICONS.map(ic=>(
              <button key={ic} onClick={()=>setForm(f=>({...f,icon:ic}))}
                style={{...S.iconBtn,...(form.icon===ic?S.iconBtnActive:{})}}>{ic}</button>
            ))}
          </div>

          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
            placeholder="일정 제목 *" style={S.input}/>

          {/* 시작/종료 시간 */}
          <div style={S.timeRow}>
            <div style={S.timeBlock}>
              <label style={S.timeLabel}>⏱ 시작</label>
              <input type="time" value={form.startTime||""} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))} style={S.timeInput}/>
            </div>
            <div style={S.timeDivider}>→</div>
            <div style={S.timeBlock}>
              <label style={S.timeLabel}>⏱ 종료</label>
              <input type="time" value={form.endTime||""} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))} style={S.timeInput}/>
            </div>
          </div>
          {(form.startTime||form.endTime)&&(
            <div style={S.timePreview}>
              ⏱ {timeRange(form.startTime,form.endTime)}
              {form.startTime&&form.endTime&&(()=>{
                const [sh,sm]=form.startTime.split(":").map(Number);
                const [eh,em]=form.endTime.split(":").map(Number);
                const diff=(eh*60+em)-(sh*60+sm);
                if(diff>0) return ` (${diff>=60?Math.floor(diff/60)+"시간":""}${diff%60?diff%60+"분":""})`;
                return "";
              })()}
            </div>
          )}

          {/* 장소 선택 */}
          <PoolSelector value={form.pool||DEFAULT_POOL.name} onChange={pool=>setForm(f=>({...f,pool}))}/>

          <textarea value={form.note||""} onChange={e=>setForm(f=>({...f,note:e.target.value}))}
            placeholder="메모 (선택)" rows={2} style={{...S.input,resize:"none"}}/>

          <div style={S.colorRow}>
            {COLORS.map(c=>(
              <button key={c.value} onClick={()=>setForm(f=>({...f,color:c.value}))}
                style={{...S.colorDot,background:c.value,outline:form.color===c.value?`3px solid ${c.value}`:"none",outlineOffset:2}}/>
            ))}
          </div>

          <div style={S.modalActions}>
            {modal.idx!=null&&<button style={S.deleteBtn} onClick={deleteEvent}>🗑 삭제</button>}
            <button style={S.saveBtn} onClick={saveEvent}>저장하기</button>
          </div>
          {kakaoLinked&&members.length>0&&<div style={S.autoShareNote}>🟡 저장 시 팀원 {members.length}명에게 자동 알림</div>}
        </Modal>
      )}

      <style>{GLOBAL_CSS}</style>
    </div>
  );
}

// ── 수영장 선택 컴포넌트 ──────────────────────────────────────────────────────
function PoolSelector({ value, onChange }) {
  const [step,     setStep]     = useState("summary"); // summary | region | city | pool
  const [region,   setRegion]   = useState(null);
  const [city,     setCity]     = useState(null);

  const isMetro = r => METRO_REGIONS.includes(r);

  const handleRegion = r => {
    setRegion(r);
    if (isMetro(r)) setStep("pool");
    else setStep("city");
  };
  const handleCity = c => { setCity(c); setStep("pool"); };
  const handlePool = p => { onChange(p); setStep("summary"); };
  const reset = () => { setStep("region"); setRegion(null); setCity(null); };

  const pools = region
    ? isMetro(region) ? METRO_POOLS[region] : (city ? PROVINCE_POOLS[region][city] : [])
    : [];

  return (
    <div style={PS.wrap}>
      {/* 현재 선택된 장소 표시 */}
      {step==="summary" && (
        <div style={PS.selected} onClick={reset}>
          <span style={PS.selectedIcon}>📍</span>
          <div style={PS.selectedText}>
            <div style={PS.selectedName}>{value}</div>
            <div style={PS.selectedHint}>눌러서 수영장 변경</div>
          </div>
          <span style={PS.selectedArrow}>›</span>
        </div>
      )}

      {/* 지역 선택 */}
      {step==="region" && (
        <div style={PS.panel}>
          <div style={PS.panelHeader}>
            <span style={PS.panelTitle}>🗺 지역 선택</span>
            <button style={PS.cancelBtn} onClick={()=>setStep("summary")}>✕</button>
          </div>
          <div style={PS.regionGroup}>
            <div style={PS.regionGroupLabel}>특별시 · 광역시 · 특별자치시</div>
            <div style={PS.regionGrid}>
              {METRO_REGIONS.map(r=>(
                <button key={r} style={{...PS.regionBtn,...(r==="서울특별시"?PS.regionBtnHighlight:{})}} onClick={()=>handleRegion(r)}>
                  {r.replace("특별시","").replace("광역시","").replace("특별자치시","")}
                </button>
              ))}
            </div>
          </div>
          <div style={PS.regionGroup}>
            <div style={PS.regionGroupLabel}>도 · 특별자치도</div>
            <div style={PS.regionGrid}>
              {PROVINCE_REGIONS.map(r=>(
                <button key={r} style={PS.regionBtn} onClick={()=>handleRegion(r)}>
                  {r.replace("특별자치도","").replace("도","")}도
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 시/군 선택 (도 선택 후) */}
      {step==="city" && region && (
        <div style={PS.panel}>
          <div style={PS.panelHeader}>
            <button style={PS.backBtn} onClick={()=>setStep("region")}>‹ {region}</button>
            <button style={PS.cancelBtn} onClick={()=>setStep("summary")}>✕</button>
          </div>
          <div style={PS.panelTitle2}>시 / 군 선택</div>
          <div style={PS.listScroll}>
            {Object.keys(PROVINCE_POOLS[region]).map(c=>(
              <button key={c} style={PS.listItem} onClick={()=>handleCity(c)}>
                🏙 {c} <span style={PS.listItemCount}>({PROVINCE_POOLS[region][c].length}개)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 수영장 선택 */}
      {step==="pool" && (
        <div style={PS.panel}>
          <div style={PS.panelHeader}>
            <button style={PS.backBtn} onClick={()=>setStep(isMetro(region)?"region":"city")}>
              ‹ {city||region}
            </button>
            <button style={PS.cancelBtn} onClick={()=>setStep("summary")}>✕</button>
          </div>
          <div style={PS.panelTitle2}>🏊 수영장 선택</div>
          <div style={PS.listScroll}>
            {pools.map(p=>(
              <button key={p} style={{...PS.listItem,...(p===value?PS.listItemActive:{})}} onClick={()=>handlePool(p)}>
                🏊 {p} {p===value&&<span style={{color:"#0077B6",fontWeight:800}}> ✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pool Selector Styles ──────────────────────────────────────────────────────
const PS = {
  wrap:               { marginBottom:8 },
  selected:           { display:"flex", alignItems:"center", gap:10, background:"#E0F4FF", borderRadius:14, padding:"10px 14px", cursor:"pointer", border:"1.5px solid #90CAE4" },
  selectedIcon:       { fontSize:18 },
  selectedText:       { flex:1 },
  selectedName:       { fontWeight:700, fontSize:13, color:"#0077B6" },
  selectedHint:       { fontSize:10, color:"#48CAE4", marginTop:1 },
  selectedArrow:      { fontSize:18, color:"#48CAE4", fontWeight:700 },
  panel:              { background:"#F0FAFF", borderRadius:14, border:"1.5px solid #90CAE4", overflow:"hidden" },
  panelHeader:        { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", background:"#0077B6" },
  panelTitle:         { fontWeight:800, fontSize:13, color:"white" },
  panelTitle2:        { fontWeight:700, fontSize:12, color:"#0077B6", padding:"8px 12px 4px" },
  cancelBtn:          { background:"rgba(255,255,255,0.25)", border:"none", color:"white", borderRadius:8, width:26, height:26, cursor:"pointer", fontWeight:700, fontSize:14 },
  backBtn:            { background:"none", border:"none", color:"white", fontWeight:700, fontSize:13, cursor:"pointer" },
  regionGroup:        { padding:"10px 12px 6px" },
  regionGroupLabel:   { fontSize:10, color:"#0077B6", fontWeight:700, marginBottom:6, opacity:0.7 },
  regionGrid:         { display:"flex", flexWrap:"wrap", gap:5 },
  regionBtn:          { background:"white", border:"1.5px solid #90CAE4", borderRadius:20, padding:"5px 10px", fontSize:11, fontWeight:700, color:"#0077B6", cursor:"pointer" },
  regionBtnHighlight: { background:"#0077B6", color:"white", border:"1.5px solid #0077B6" },
  listScroll:         { maxHeight:180, overflowY:"auto", padding:"4px 0" },
  listItem:           { display:"block", width:"100%", background:"none", border:"none", borderBottom:"1px solid #E0F4FF", padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:600, color:"#1a3a5c", cursor:"pointer" },
  listItemActive:     { background:"#E0F4FF", color:"#0077B6" },
  listItemCount:      { color:"#90CAE4", fontWeight:500 },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function LoginScreen({onGoogle}){
  return (
    <div style={S.authBg}>
      <div style={S.authCard}>
        <div style={S.authWaves}>
          <svg viewBox="0 0 300 80" style={{width:"100%"}}>
            <path d="M0,40 C40,20 80,60 120,40 C160,20 200,60 240,40 C270,25 300,45 300,40 L300,80 L0,80 Z" fill="#0077B6" opacity="0.15"/>
            <path d="M0,52 C50,32 100,65 150,50 C200,35 250,65 300,50 L300,80 L0,80 Z" fill="#00B4D8" opacity="0.2"/>
          </svg>
        </div>
        <div style={{fontSize:52,marginBottom:6}}>🏊</div>
        <div style={S.authAppName}>SEONGIL SWIMTEAM</div>
        <div style={S.authAppSub}>PLANNER</div>
        <div style={S.authTagline}>성일 수영팀 전용 일정 플래너</div>
        <div style={{marginBottom:28}}>
          {["🏊 수영장 일정 관리","👥 팀원 실시간 공유","🟡 카카오 알림","📍 전국 수영장 선택"].map(f=>(
            <div key={f} style={S.featureItem}>{f}</div>
          ))}
        </div>
        <button style={S.googleBtn} onClick={onGoogle}>
          <GoogleIcon/><span>Google로 시작하기</span>
        </button>
        <div style={{fontSize:11,color:"#90CAE4"}}>계속 진행하면 서비스 이용약관에 동의합니다</div>
      </div>
      <style>{GLOBAL_CSS}</style>
    </div>
  );
}

function KakaoLinkScreen({user,onLink,onSkip}){
  return (
    <div style={S.authBg}>
      <div style={S.authCard}>
        <div style={{fontSize:48,marginBottom:8}}>🟡</div>
        <div style={S.authAppName}>카카오톡 연동</div>
        <div style={S.authTagline}>{user.name}님, 연동하면 팀원에게<br/>자동으로 일정 알림을 보낼 수 있어요!</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,margin:"20px 0"}}>
          {[["📲","일정 변경 시 카카오 알림"],["🔗","카카오로 팀 초대"],["👤","카카오 프로필 연동"]].map(([ic,txt])=>(
            <div key={txt} style={{display:"flex",alignItems:"center",gap:10,background:"#FFFDE7",borderRadius:12,padding:"10px 14px"}}>
              <span style={{fontSize:22}}>{ic}</span><span style={{fontSize:13,color:"#374151"}}>{txt}</span>
            </div>
          ))}
        </div>
        <button style={S.kakaoLinkBtn} onClick={onLink}>🟡 카카오톡으로 연동</button>
        <button style={S.skipBtn} onClick={onSkip}>나중에 연동하기</button>
      </div>
      <style>{GLOBAL_CSS}</style>
    </div>
  );
}

function EventCard({ev,dateKey,user,members,onEdit,onKakao,kakaoLinked}){
  const author=[...members,user].find(m=>m?.uid===ev.author)||user;
  const tr=timeRange(ev.startTime,ev.endTime);
  return (
    <div style={{...S.eventCard,borderLeftColor:ev.color}} onClick={onEdit}>
      <div style={S.eventCardLeft}>
        <span style={{fontSize:22,marginTop:2}}>{ev.icon}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={S.eventCardTitle}>{ev.title}</div>
          {ev.pool&&<div style={S.eventCardPool}>📍 {ev.pool}</div>}
          <div style={S.eventCardMeta}>
            {fmtDate(dateKey)}{tr?" · ⏱ "+tr:""}
            {author&&<span style={{fontWeight:700,color:author.color}}> · {author.photo} {author.name}</span>}
          </div>
          {ev.note&&<div style={{fontSize:11,color:"#64748B",marginTop:3}}>💬 {ev.note}</div>}
        </div>
      </div>
      {kakaoLinked&&<button style={S.kakaoMiniBtn} onClick={e=>{e.stopPropagation();onKakao();}}>🟡</button>}
    </div>
  );
}

function MemberRow({user,isMe}){
  return (
    <div style={S.memberRow}>
      <div style={{...S.memberAvatar,background:user.color+"33",color:user.color}}>{user.photo}</div>
      <div>
        <div style={S.memberName}>{user.name}{isMe?" (나)":""}</div>
        <div style={{fontSize:11,color:"#90CAE4"}}>{user.email}</div>
      </div>
      {isMe&&<span style={{marginLeft:"auto",fontSize:16}}>🏆</span>}
    </div>
  );
}

function Modal({children,onClose}){
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modalSheet} onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,background:"#90CAE4",borderRadius:2,margin:"0 auto 18px"}}/>
        {children}
      </div>
    </div>
  );
}

function Toast({msg,type}){
  const bg=type==="success"?"#0077B6":type==="kakao"?"#F7E600":type==="warn"?"#F59E0B":"#00B4D8";
  const tc=type==="kakao"?"#1a1a1a":"white";
  return <div style={{...S.toast,background:bg,color:tc}}>{msg}</div>;
}

function Empty({text}){
  return <div style={S.empty}><div style={{fontSize:40,marginBottom:8}}>🏊</div>{text}</div>;
}

function GoogleIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{marginRight:8}}>
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.5 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.5 29.1 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.7 39.8 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.8l6.2 5.2C40.8 35.8 44 30.4 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  app:        { minHeight:"100vh", background:"#F0FAFF", fontFamily:"'Noto Sans KR',sans-serif", paddingBottom:80 },

  header:     { background:"linear-gradient(135deg,#023E8A,#0077B6)", padding:"14px 16px 10px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 16px rgba(0,119,182,0.3)" },
  headerLeft: { display:"flex", alignItems:"center", gap:10 },
  headerWave: { fontSize:24 },
  appName:    { fontWeight:900, fontSize:13, color:"white", letterSpacing:1, lineHeight:1.2 },
  appSub:     { fontWeight:700, fontSize:9, color:"#90CAE4", letterSpacing:3 },
  headerRight:{ display:"flex", alignItems:"center", gap:8 },
  kakaoBadge: { fontSize:16 },
  pwaBtn:     { background:"none", border:"none", fontSize:18, cursor:"pointer" },
  avatar:     { width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, border:"2px solid rgba(255,255,255,0.4)" },

  waveBanner: { background:"linear-gradient(135deg,#023E8A,#0077B6)", marginTop:-1, paddingBottom:0, overflow:"hidden", height:20 },

  nav:          { display:"flex", background:"white", borderBottom:"2px solid #E0F4FF", padding:"0 16px", boxShadow:"0 2px 8px rgba(0,119,182,0.07)" },
  navBtn:       { flex:1, background:"none", border:"none", borderBottom:"3px solid transparent", padding:"10px 0", fontSize:12, fontWeight:700, color:"#90CAE4", cursor:"pointer", transition:"all 0.2s" },
  navBtnActive: { borderBottomColor:"#0077B6", color:"#0077B6" },

  content:    { padding:"12px 12px 0" },
  monthNav:   { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 4px 12px" },
  monthTitle: { fontWeight:900, fontSize:22, color:"#023E8A", letterSpacing:"-0.5px", textAlign:"center" },
  monthYear:  { fontSize:12, color:"#90CAE4", textAlign:"center", fontWeight:600 },
  arrowBtn:   { background:"white", border:"1.5px solid #90CAE4", borderRadius:12, width:36, height:36, fontSize:18, cursor:"pointer", color:"#0077B6", fontWeight:700, boxShadow:"0 2px 8px rgba(0,119,182,0.1)" },

  calWrap:    { userSelect:"none" },
  weekRow:    { display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 },
  weekLabel:  { textAlign:"center", fontSize:11, fontWeight:700, padding:"4px 0" },
  grid:       { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 },
  cell:       { minHeight:66, background:"white", borderRadius:10, padding:"5px 4px 4px", cursor:"pointer", border:"1px solid #CCEEFF", overflow:"hidden", boxShadow:"0 1px 3px rgba(0,119,182,0.05)" },
  cellEmpty:  { background:"transparent", border:"none", cursor:"default", boxShadow:"none" },
  cellToday:  { border:"2px solid #0077B6", boxShadow:"0 2px 10px rgba(0,119,182,0.2)" },
  dayNum:     { display:"inline-flex", alignItems:"center", justifyContent:"center", width:20, height:20, borderRadius:"50%", fontSize:11, fontWeight:700, marginBottom:2 },
  chip:       { fontSize:9, fontWeight:700, borderLeft:"3px solid", borderRadius:"0 5px 5px 0", padding:"1px 3px", marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  more:       { fontSize:9, color:"#90CAE4", paddingLeft:3 },

  summaryWrap:      { marginTop:16, marginBottom:16 },
  summaryHeader:    { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  summaryTitle:     { fontWeight:800, fontSize:14, color:"#023E8A" },
  summaryCount:     { fontSize:12, color:"#0077B6", fontWeight:700, background:"#E0F4FF", borderRadius:20, padding:"2px 10px" },
  summaryEmpty:     { textAlign:"center", color:"#90CAE4", fontSize:13, padding:"24px 0", lineHeight:2 },
  summaryGroup:     { marginBottom:14 },
  summaryDayHeader: { display:"flex", alignItems:"center", gap:6, marginBottom:6 },
  summaryDayBadge:  { display:"inline-flex", alignItems:"center", borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:800 },
  todayTag:         { fontSize:10, background:"#E0F4FF", color:"#0077B6", borderRadius:20, padding:"2px 8px", fontWeight:700 },
  summaryItem:      { display:"flex", alignItems:"center", gap:10, background:"white", borderRadius:12, padding:"10px 12px", marginBottom:5, borderLeft:"4px solid", boxShadow:"0 1px 4px rgba(0,119,182,0.07)", cursor:"pointer" },
  summaryDot:       { width:8, height:8, borderRadius:"50%", flexShrink:0 },
  summaryItemContent:{ flex:1, minWidth:0 },
  summaryItemTitle: { fontWeight:700, fontSize:13, color:"#023E8A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  summaryItemPool:  { fontSize:11, color:"#0077B6", marginTop:2, fontWeight:600 },
  summaryItemTime:  { fontSize:11, color:"#00B4D8", marginTop:2, fontWeight:600 },
  summaryItemNote:  { fontSize:11, color:"#90CAE4", marginTop:2 },

  eventCard:     { background:"white", borderRadius:14, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between", borderLeft:"4px solid", boxShadow:"0 1px 4px rgba(0,119,182,0.08)", cursor:"pointer" },
  eventCardLeft: { display:"flex", alignItems:"flex-start", gap:10, flex:1, minWidth:0 },
  eventCardTitle:{ fontWeight:700, fontSize:14, color:"#023E8A" },
  eventCardPool: { fontSize:11, color:"#0077B6", fontWeight:600, marginTop:2 },
  eventCardMeta: { fontSize:11, color:"#90CAE4", marginTop:2 },
  kakaoMiniBtn:  { background:"#FEF9C3", border:"none", borderRadius:8, padding:"4px 8px", fontSize:16, cursor:"pointer", flexShrink:0 },
  sectionTitle:  { fontWeight:800, fontSize:14, color:"#023E8A", marginBottom:10 },

  shareCard:       { background:"white", borderRadius:16, padding:"16px", marginBottom:12, boxShadow:"0 1px 8px rgba(0,119,182,0.07)" },
  shareCardHeader: { display:"flex", alignItems:"center", gap:12 },
  shareCardTitle:  { fontWeight:800, fontSize:14, color:"#023E8A", marginBottom:4 },
  shareCardSub:    { fontSize:12, color:"#90CAE4" },
  codeBox:         { display:"flex", alignItems:"center", justifyContent:"space-between", background:"#E0F4FF", borderRadius:12, padding:"10px 16px", marginTop:10 },
  codeText:        { fontWeight:900, fontSize:24, letterSpacing:4, color:"#0077B6" },
  copyBtn:         { background:"#0077B6", color:"white", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" },
  kakaoShareBtn:   { width:"100%", marginTop:10, background:"#FEE500", color:"#1a1a1a", border:"none", borderRadius:12, padding:"10px", fontSize:13, fontWeight:800, cursor:"pointer" },
  joinRow:         { display:"flex", gap:8, marginTop:8 },
  codeInput:       { flex:1, border:"2px solid #90CAE4", borderRadius:10, padding:"8px 12px", fontSize:14, fontWeight:700, letterSpacing:3, textAlign:"center", color:"#0077B6", outline:"none" },
  joinBtn:         { background:"#0077B6", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" },
  kakaoBtn:        { background:"#FEE500", color:"#1a1a1a", border:"none", borderRadius:10, padding:"6px 12px", fontSize:12, fontWeight:800, cursor:"pointer" },
  connectedBadge:  { fontSize:18, color:"#22C55E", fontWeight:700 },
  pwaInstallBtn:   { width:"100%", background:"#E0F4FF", color:"#0077B6", border:"none", borderRadius:12, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer" },
  memberRow:       { display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderTop:"1px solid #E0F4FF" },
  memberAvatar:    { width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 },
  memberName:      { fontWeight:700, fontSize:13, color:"#023E8A" },

  fab: { position:"fixed", bottom:24, right:20, width:54, height:54, borderRadius:"50%", background:"linear-gradient(135deg,#023E8A,#0077B6)", color:"white", border:"none", fontSize:28, cursor:"pointer", boxShadow:"0 4px 20px rgba(0,119,182,0.45)", zIndex:200 },

  overlay:       { position:"fixed", inset:0, background:"rgba(2,62,138,0.45)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:300, backdropFilter:"blur(4px)" },
  modalSheet:    { background:"white", borderRadius:"22px 22px 0 0", padding:"20px 20px 44px", width:"100%", maxWidth:480, boxShadow:"0 -8px 40px rgba(0,119,182,0.2)", animation:"slideUp 0.25s ease", maxHeight:"92vh", overflowY:"auto" },
  modalTitle:    { fontWeight:900, fontSize:16, color:"#023E8A", marginBottom:4 },
  modalDate:     { fontSize:12, color:"#90CAE4", marginBottom:14 },
  iconGrid:      { display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 },
  iconBtn:       { width:34, height:34, borderRadius:8, fontSize:17, background:"#F0FAFF", border:"1px solid #CCEEFF", cursor:"pointer" },
  iconBtnActive: { background:"#E0F4FF", border:"2px solid #0077B6" },
  input:         { width:"100%", border:"1.5px solid #CCEEFF", borderRadius:12, padding:"10px 14px", fontSize:14, color:"#023E8A", outline:"none", boxSizing:"border-box", marginBottom:8, fontFamily:"inherit" },
  timeRow:       { display:"flex", alignItems:"center", gap:8, marginBottom:8 },
  timeBlock:     { flex:1 },
  timeLabel:     { display:"block", fontSize:11, color:"#90CAE4", fontWeight:700, marginBottom:4 },
  timeInput:     { width:"100%", border:"1.5px solid #CCEEFF", borderRadius:12, padding:"9px 12px", fontSize:13, color:"#023E8A", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#F0FAFF" },
  timeDivider:   { fontSize:16, color:"#90CAE4", fontWeight:700, marginTop:16 },
  timePreview:   { fontSize:12, color:"#0077B6", fontWeight:700, background:"#E0F4FF", borderRadius:10, padding:"6px 12px", marginBottom:8, textAlign:"center" },
  colorRow:      { display:"flex", gap:8, marginBottom:14 },
  colorDot:      { width:26, height:26, borderRadius:"50%", border:"none", cursor:"pointer" },
  modalActions:  { display:"flex", gap:8 },
  deleteBtn:     { flex:0.6, background:"#FFF1F2", color:"#FF6B6B", border:"none", borderRadius:12, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer" },
  saveBtn:       { flex:1, background:"linear-gradient(135deg,#023E8A,#0077B6)", color:"white", border:"none", borderRadius:12, padding:"11px", fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 14px rgba(0,119,182,0.3)" },
  autoShareNote: { textAlign:"center", fontSize:11, color:"#F7A325", marginTop:10, fontWeight:700 },

  authBg:      { minHeight:"100vh", background:"linear-gradient(160deg,#023E8A 0%,#0077B6 40%,#00B4D8 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
  authCard:    { background:"white", borderRadius:24, overflow:"hidden", maxWidth:360, width:"100%", boxShadow:"0 12px 50px rgba(2,62,138,0.3)", textAlign:"center" },
  authWaves:   { background:"linear-gradient(135deg,#023E8A,#0077B6)", marginBottom:0 },
  authAppName: { fontWeight:900, fontSize:20, color:"#023E8A", letterSpacing:2, marginTop:16 },
  authAppSub:  { fontWeight:700, fontSize:11, color:"#00B4D8", letterSpacing:4, marginBottom:6 },
  authTagline: { fontSize:13, color:"#64748B", marginBottom:20, lineHeight:1.6, padding:"0 20px" },
  featureItem: { fontSize:13, color:"#374151", padding:"7px 20px", borderBottom:"1px solid #F0FAFF", textAlign:"left" },
  googleBtn:   { display:"flex", alignItems:"center", justifyContent:"center", width:"calc(100% - 40px)", margin:"0 20px 12px", background:"white", border:"2px solid #CCEEFF", borderRadius:14, padding:"12px", fontSize:15, fontWeight:700, color:"#023E8A", cursor:"pointer", boxShadow:"0 2px 8px rgba(0,119,182,0.1)" },
  kakaoLinkBtn:{ width:"100%", background:"#FEE500", color:"#1a1a1a", border:"none", borderRadius:14, padding:"13px", fontSize:15, fontWeight:800, cursor:"pointer", marginBottom:10 },
  skipBtn:     { background:"none", border:"none", color:"#90CAE4", fontSize:13, cursor:"pointer", textDecoration:"underline" },

  toast: { position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", borderRadius:20, padding:"10px 18px", fontSize:13, fontWeight:700, zIndex:500, boxShadow:"0 4px 16px rgba(0,0,0,0.15)", whiteSpace:"nowrap", animation:"fadeIn 0.3s ease" },
  empty: { textAlign:"center", color:"#90CAE4", fontSize:13, padding:"40px 0", lineHeight:2 },
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800;900&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  input, textarea, button, select { font-family:inherit; }
  body { overscroll-behavior:none; }
  @keyframes slideUp       { from{transform:translateY(60%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes slideIn       { from{opacity:0} to{opacity:1} }
  @keyframes slideOutLeft  { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-30px)} }
  @keyframes slideOutRight { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(30px)} }
  @keyframes fadeIn        { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes spin          { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  button:hover { opacity:0.88; }
  input[type="time"]::-webkit-calendar-picker-indicator { opacity:0.5; cursor:pointer; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#F0FAFF; }
  ::-webkit-scrollbar-thumb { background:#90CAE4; border-radius:4px; }
`;
