import { useState, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

// ─── Firebase 설정 ────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDpcCBmK47Bse81OmFFrKAm7rF5BFZkok8",
  authDomain: "seongil-swim.firebaseapp.com",
  projectId: "seongil-swim",
  storageBucket: "seongil-swim.firebasestorage.app",
  messagingSenderId: "968790608585",
  appId: "1:968790608585:web:77be369d47bbde98c01b18",
};
const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ─── 수영장 데이터 ─────────────────────────────────────────────────────────────
const DEFAULT_POOL = "성일스포렉스 (강동구 성내동)";
const METRO_POOLS = {
  "서울특별시": ["성일스포렉스 (강동구 성내동)","강동구민체육센터 수영장","송파스포츠센터 수영장","잠실실내수영장","노원구민체육센터 수영장","마포구민체육센터 수영장","서대문구민체육센터 수영장","은평스포츠센터 수영장","광진구민체육센터 수영장","성북구민체육센터 수영장","도봉구민체육센터 수영장","강북구민체육센터 수영장","동대문구민체육센터 수영장","중랑구민체육센터 수영장","성동구민체육센터 수영장","용산구민체육센터 수영장","종로구민체육센터 수영장","중구민체육센터 수영장","양천구민체육센터 수영장","강서구민체육센터 수영장","구로구민체육센터 수영장","금천구민체육센터 수영장","영등포구민체육센터 수영장","동작구민체육센터 수영장","관악구민체육센터 수영장","서초구민체육센터 수영장","강남구민체육센터 수영장","송파구민체육센터 수영장","올림픽수영장","태릉국제수영장"],
  "부산광역시": ["부산시민수영장","해운대수영장","기장군수영장","북구민체육센터 수영장","사상구민체육센터 수영장","동래구민체육센터 수영장","연제구민체육센터 수영장","수영구민체육센터 수영장","남구민체육센터 수영장","부산진구민체육센터 수영장"],
  "대구광역시": ["대구시민수영장","달서구민체육센터 수영장","북구민체육센터 수영장","수성구민체육센터 수영장","동구민체육센터 수영장","서구민체육센터 수영장"],
  "인천광역시": ["인천시립수영장","남동구민체육센터 수영장","부평구민체육센터 수영장","계양구민체육센터 수영장","서구민체육센터 수영장","미추홀구민체육센터 수영장","연수구민체육센터 수영장","중구민체육센터 수영장"],
  "광주광역시": ["광주시민수영장","북구민체육센터 수영장","서구민체육센터 수영장","남구민체육센터 수영장","동구민체육센터 수영장","광산구민체육센터 수영장"],
  "대전광역시": ["대전시민수영장","유성구민체육센터 수영장","서구민체육센터 수영장","중구민체육센터 수영장","동구민체육센터 수영장","대덕구민체육센터 수영장"],
  "울산광역시": ["울산시민수영장","남구민체육센터 수영장","북구민체육센터 수영장","동구민체육센터 수영장","중구민체육센터 수영장","울주군민체육센터 수영장"],
  "세종특별자치시": ["세종시민체육관 수영장","조치원읍 수영장","아름동 수영장","도담동 수영장"],
};
const PROVINCE_POOLS = {
  "경기도": {"수원시":["수원시민체육관 수영장","수원실내수영장","영통구 수영장","팔달구 수영장"],"성남시":["성남시민체육관 수영장","분당구 수영장","중원구 수영장","수정구 수영장"],"고양시":["고양시민체육관 수영장","덕양구 수영장","일산동구 수영장","일산서구 수영장"],"용인시":["용인시민체육관 수영장","기흥구 수영장","수지구 수영장","처인구 수영장"],"부천시":["부천시민체육관 수영장","원미구 수영장","오정구 수영장"],"안산시":["안산시민체육관 수영장","단원구 수영장","상록구 수영장"],"안양시":["안양시민체육관 수영장","만안구 수영장","동안구 수영장"],"남양주시":["남양주시민체육관 수영장","진접읍 수영장","별내면 수영장"],"화성시":["화성시민체육관 수영장","동탄 수영장","봉담 수영장"],"평택시":["평택시민체육관 수영장","안중읍 수영장","팽성읍 수영장"],"의정부시":["의정부시민체육관 수영장","호원동 수영장"],"시흥시":["시흥시민체육관 수영장","은행동 수영장","정왕동 수영장"],"파주시":["파주시민체육관 수영장","금촌동 수영장","운정 수영장"],"김포시":["김포시민체육관 수영장","장기동 수영장"],"광주시":["광주시민체육관 수영장","경안동 수영장"],"광명시":["광명시민체육관 수영장","소하동 수영장"],"군포시":["군포시민체육관 수영장","산본동 수영장"],"하남시":["하남시민체육관 수영장","미사 수영장"],"오산시":["오산시민체육관 수영장"],"이천시":["이천시민체육관 수영장","설봉공원 수영장"],"양주시":["양주시민체육관 수영장"],"구리시":["구리시민체육관 수영장"],"포천시":["포천시민체육관 수영장"],"의왕시":["의왕시민체육관 수영장"],"여주시":["여주시민체육관 수영장"],"동두천시":["동두천시민체육관 수영장"],"양평군":["양평군민체육관 수영장"],"가평군":["가평군민체육관 수영장"],"연천군":["연천군민체육관 수영장"]},
  "강원특별자치도": {"춘천시":["춘천시민체육관 수영장","석사동 수영장","효자동 수영장"],"원주시":["원주시민체육관 수영장","무실동 수영장","단구동 수영장"],"강릉시":["강릉시민체육관 수영장","교동 수영장","포남동 수영장"],"동해시":["동해시민체육관 수영장"],"태백시":["태백시민체육관 수영장"],"속초시":["속초시민체육관 수영장"],"삼척시":["삼척시민체육관 수영장"],"홍천군":["홍천군민체육관 수영장"],"횡성군":["횡성군민체육관 수영장"],"영월군":["영월군민체육관 수영장"],"평창군":["평창군민체육관 수영장"],"정선군":["정선군민체육관 수영장"],"철원군":["철원군민체육관 수영장"],"화천군":["화천군민체육관 수영장"],"양구군":["양구군민체육관 수영장"],"인제군":["인제군민체육관 수영장"],"고성군":["고성군민체육관 수영장"],"양양군":["양양군민체육관 수영장"]},
  "충청북도": {"청주시":["청주시민체육관 수영장","흥덕구 수영장","청원구 수영장","서원구 수영장","상당구 수영장"],"충주시":["충주시민체육관 수영장","호암동 수영장"],"제천시":["제천시민체육관 수영장"],"보은군":["보은군민체육관 수영장"],"옥천군":["옥천군민체육관 수영장"],"영동군":["영동군민체육관 수영장"],"증평군":["증평군민체육관 수영장"],"진천군":["진천군민체육관 수영장"],"괴산군":["괴산군민체육관 수영장"],"음성군":["음성군민체육관 수영장"],"단양군":["단양군민체육관 수영장"]},
  "충청남도": {"천안시":["천안시민체육관 수영장","서북구 수영장","동남구 수영장"],"공주시":["공주시민체육관 수영장"],"보령시":["보령시민체육관 수영장"],"아산시":["아산시민체육관 수영장","온양 수영장"],"서산시":["서산시민체육관 수영장"],"논산시":["논산시민체육관 수영장"],"계룡시":["계룡시민체육관 수영장"],"당진시":["당진시민체육관 수영장"],"금산군":["금산군민체육관 수영장"],"부여군":["부여군민체육관 수영장"],"서천군":["서천군민체육관 수영장"],"청양군":["청양군민체육관 수영장"],"홍성군":["홍성군민체육관 수영장"],"예산군":["예산군민체육관 수영장"],"태안군":["태안군민체육관 수영장"]},
  "전라북도": {"전주시":["전주시민체육관 수영장","덕진구 수영장","완산구 수영장"],"군산시":["군산시민체육관 수영장","나운동 수영장"],"익산시":["익산시민체육관 수영장","영등동 수영장"],"정읍시":["정읍시민체육관 수영장"],"남원시":["남원시민체육관 수영장"],"김제시":["김제시민체육관 수영장"],"완주군":["완주군민체육관 수영장"],"진안군":["진안군민체육관 수영장"],"무주군":["무주군민체육관 수영장"],"장수군":["장수군민체육관 수영장"],"임실군":["임실군민체육관 수영장"],"순창군":["순창군민체육관 수영장"],"고창군":["고창군민체육관 수영장"],"부안군":["부안군민체육관 수영장"]},
  "전라남도": {"목포시":["목포시민체육관 수영장","옥암동 수영장"],"여수시":["여수시민체육관 수영장","돌산도 수영장"],"순천시":["순천시민체육관 수영장","조례동 수영장"],"나주시":["나주시민체육관 수영장"],"광양시":["광양시민체육관 수영장"],"담양군":["담양군민체육관 수영장"],"곡성군":["곡성군민체육관 수영장"],"구례군":["구례군민체육관 수영장"],"고흥군":["고흥군민체육관 수영장"],"보성군":["보성군민체육관 수영장"],"화순군":["화순군민체육관 수영장"],"장흥군":["장흥군민체육관 수영장"],"강진군":["강진군민체육관 수영장"],"해남군":["해남군민체육관 수영장"],"영암군":["영암군민체육관 수영장"],"무안군":["무안군민체육관 수영장"],"함평군":["함평군민체육관 수영장"],"영광군":["영광군민체육관 수영장"],"장성군":["장성군민체육관 수영장"],"완도군":["완도군민체육관 수영장"],"진도군":["진도군민체육관 수영장"],"신안군":["신안군민체육관 수영장"]},
  "경상북도": {"포항시":["포항시민체육관 수영장","남구 수영장","북구 수영장"],"경주시":["경주시민체육관 수영장","황성동 수영장"],"김천시":["김천시민체육관 수영장"],"안동시":["안동시민체육관 수영장","옥동 수영장"],"구미시":["구미시민체육관 수영장","원평동 수영장"],"영주시":["영주시민체육관 수영장"],"영천시":["영천시민체육관 수영장"],"상주시":["상주시민체육관 수영장"],"문경시":["문경시민체육관 수영장"],"경산시":["경산시민체육관 수영장"],"군위군":["군위군민체육관 수영장"],"의성군":["의성군민체육관 수영장"],"청송군":["청송군민체육관 수영장"],"영양군":["영양군민체육관 수영장"],"영덕군":["영덕군민체육관 수영장"],"청도군":["청도군민체육관 수영장"],"고령군":["고령군민체육관 수영장"],"성주군":["성주군민체육관 수영장"],"칠곡군":["칠곡군민체육관 수영장"],"예천군":["예천군민체육관 수영장"],"봉화군":["봉화군민체육관 수영장"],"울진군":["울진군민체육관 수영장"],"울릉군":["울릉군민체육관 수영장"]},
  "경상남도": {"창원시":["창원시민체육관 수영장","의창구 수영장","성산구 수영장","마산합포구 수영장","마산회원구 수영장","진해구 수영장"],"진주시":["진주시민체육관 수영장","상대동 수영장"],"통영시":["통영시민체육관 수영장"],"사천시":["사천시민체육관 수영장"],"김해시":["김해시민체육관 수영장","내외동 수영장"],"밀양시":["밀양시민체육관 수영장"],"거제시":["거제시민체육관 수영장","고현동 수영장"],"양산시":["양산시민체육관 수영장","물금읍 수영장"],"의령군":["의령군민체육관 수영장"],"함안군":["함안군민체육관 수영장"],"창녕군":["창녕군민체육관 수영장"],"고성군":["고성군민체육관 수영장"],"남해군":["남해군민체육관 수영장"],"하동군":["하동군민체육관 수영장"],"산청군":["산청군민체육관 수영장"],"함양군":["함양군민체육관 수영장"],"거창군":["거창군민체육관 수영장"],"합천군":["합천군민체육관 수영장"]},
  "제주특별자치도": {"제주시":["제주시민체육관 수영장","노형동 수영장","아라동 수영장","한림읍 수영장","애월읍 수영장"],"서귀포시":["서귀포시민체육관 수영장","대정읍 수영장","남원읍 수영장","성산읍 수영장"]},
};
const METRO_REGIONS    = Object.keys(METRO_POOLS);
const PROVINCE_REGIONS = Object.keys(PROVINCE_POOLS);

// ─── 상수 ─────────────────────────────────────────────────────────────────────
const COLORS   = ["#0077B6","#00B4D8","#48CAE4","#FF6B6B","#2DC653","#F4A261"];
const ICONS    = ["🏊","🏅","📅","🎽","🥽","🏆","🎯","💪","📋","🚿","⏱️","🌊","🎉","💼","📚"];
const WEEKDAYS = ["일","월","화","수","목","금","토"];
const MONTHS   = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const today    = new Date();

const dk          = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const todayKey    = dk(today.getFullYear(), today.getMonth(), today.getDate());
const daysInMonth = (y,m) => new Date(y,m+1,0).getDate();
const firstDay    = (y,m) => new Date(y,m,1).getDay();
const fmtDate     = key => { const [,m,d]=key.split("-"); return `${m}월 ${d}일`; };
const timeRange   = (s,e) => s&&e?`${s} ~ ${e}`:s?`${s}~`:e?`~${e}`:"";

// ─── 공휴일 가져오기 (Google Calendar API) ────────────────────────────────────
// ─── 공휴일 가져오기 (Google Calendar API) ────────────────────────────────────
// 기념일 제외 목록 (공휴일 아닌 날)
const NON_HOLIDAYS = [
  "어버이날", "스승의날", "성년의날", "부부의날",
  "어린이날 대체공휴일 아님", "한글날 기념일",
  "육군창설일", "국군의날", "경찰의날", "소방의날",
  "무역의날", "납세자의날", "도서관의날", "신문의날",
  "발명의날", "정보통신의날", "과학의날", "식목일",
  "환경의날", "바다의날", "철도의날", "소비자의날",
  "저축의날", "문화의날", "체육의날", "교육의날",
];

// 실제 법정 공휴일 키워드
const HOLIDAY_KEYWORDS = [
  "신정", "설날", "삼일절", "어린이날", "부처님오신날",
  "현충일", "광복절", "추석", "개천절", "한글날",
  "성탄절", "크리스마스", "대체공휴일", "임시공휴일",
  "선거일", "국경일",
];

// 공휴일 이름 정리 함수
function cleanHolidayName(name) {
  // "쉬는 날 어린이날" → "어린이날 대체공휴일"
  // "쉬는 날 광복절" → "광복절 대체공휴일"
  if (name.startsWith("쉬는 날 ") || name.startsWith("쉬는날 ")) {
    const original = name.replace(/^쉬는\s*날\s*/, "").trim();
    return `${original} 대체공휴일`;
  }
  // "대체공휴일 (어린이날)" 형식도 정리
  if (name.includes("대체공휴일") && name.includes("(")) {
    const match = name.match(/\((.+?)\)/);
    if (match) return `${match[1]} 대체공휴일`;
  }
  return name;
}

async function fetchHolidays(year) {
  try {
    const calId = "ko.south_korea%23holiday%40group.v.calendar.google.com";
    const key   = "AIzaSyDpcCBmK47Bse81OmFFrKAm7rF5BFZkok8";
    const tMin  = encodeURIComponent(`${year}-01-01T00:00:00Z`);
    const tMax  = encodeURIComponent(`${year}-12-31T23:59:59Z`);
    const url   = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events?key=${key}&timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&maxResults=100`;
    const res   = await fetch(url);
    const data  = await res.json();
    const map   = {};
    (data.items || []).forEach(item => {
      if (!item.start?.date) return;
      const name = item.summary || "";
      // 기념일 제외
      const isNonHoliday = NON_HOLIDAYS.some(n => name.includes(n));
      if (isNonHoliday) return;
      // 공휴일 키워드 포함이면 공휴일로 처리
      const isHoliday = HOLIDAY_KEYWORDS.some(k => name.includes(k));
      if (isHoliday) {
        map[item.start.date] = cleanHolidayName(name);
      }
    });
    return map;
  } catch(e) {
    console.error("공휴일 로딩 실패:", e);
    return {};
  }
}

// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [events,    setEvents]    = useState([]);
  const [holidays,  setHolidays]  = useState({});
  const [year,      setYear]      = useState(today.getFullYear());
  const [month,     setMonth]     = useState(today.getMonth());
  const [slideDir,  setSlideDir]  = useState(null);
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState({});
  const [tab,       setTab]       = useState("calendar");
  const [toast,     setToast]     = useState(null);
  const [syncAnim,  setSyncAnim]  = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const mouseStartX = useRef(null);

  // ── Google 로그인 감지 ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── 공휴일 로딩 ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchHolidays(year).then(setHolidays);
  }, [year]);

  // ── Firestore 실시간 동기화 ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "events"), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(data);
      setSyncAnim(true);
      setTimeout(() => setSyncAnim(false), 1000);
    });
    return unsub;
  }, [user]);

  const showToast = useCallback((msg, type="info") => {
    setToast({msg,type});
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── 월 전환 ────────────────────────────────────────────────────────────────
  const changeMonth = useCallback((dir) => {
    setSlideDir(dir);
    setTimeout(() => {
      if (dir==="left") { if(month===11){setYear(y=>y+1);setMonth(0);}else setMonth(m=>m+1); }
      else              { if(month===0) {setYear(y=>y-1);setMonth(11);}else setMonth(m=>m-1); }
      setSlideDir(null);
    }, 220);
  }, [month]);

  // ── 스와이프 ───────────────────────────────────────────────────────────────
  const onTouchStart = e => { touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; };
  const onTouchEnd   = e => {
    if (!touchStartX.current) return;
    const dx=e.changedTouches[0].clientX-touchStartX.current;
    const dy=Math.abs(e.changedTouches[0].clientY-touchStartY.current);
    if (Math.abs(dx)>50&&dy<80) changeMonth(dx<0?"left":"right");
    touchStartX.current=null;
  };
  const onMouseDown = e => { mouseStartX.current=e.clientX; };
  const onMouseUp   = e => {
    if (!mouseStartX.current) return;
    const dx=e.clientX-mouseStartX.current;
    if (Math.abs(dx)>60) changeMonth(dx<0?"left":"right");
    mouseStartX.current=null;
  };

  // ── Google 로그인 ──────────────────────────────────────────────────────────
  const handleLogin  = () => signInWithPopup(auth, new GoogleAuthProvider()).catch(console.error);
  const handleLogout = () => signOut(auth);

  // ── 일정 CRUD (Firestore) ──────────────────────────────────────────────────
  const openAdd  = dateKey => {
    setForm({ title:"", icon:"🏊", color:COLORS[0], note:"", startTime:"", endTime:"", pool:DEFAULT_POOL });
    setModal({ date:dateKey });
  };
  const openEdit = (ev, e) => {
    e?.stopPropagation();
    setForm({ ...ev });
    setModal({ date:ev.dateKey, id:ev.id });
  };

  const saveEvent = async () => {
    if (!form.title.trim()) return;
    const data = {
      ...form,
      dateKey: modal.date,
      authorUid:  user.uid,
      authorName: user.displayName,
      authorPhoto:user.photoURL,
      updatedAt: serverTimestamp(),
    };
    try {
      if (modal.id) {
        await updateDoc(doc(db,"events",modal.id), data);
        showToast("일정이 수정됐어요 ✏️","success");
      } else {
        await addDoc(collection(db,"events"), { ...data, createdAt: serverTimestamp() });
        showToast("일정이 추가됐어요 🏊","success");
      }
      setModal(null);
    } catch(e) { showToast("저장 실패: "+e.message,"warn"); }
  };

  const deleteEvent = async () => {
    try {
      await deleteDoc(doc(db,"events",modal.id));
      showToast("일정이 삭제됐어요","info");
      setModal(null);
    } catch(e) { showToast("삭제 실패","warn"); }
  };

  // ── 달력 데이터 ────────────────────────────────────────────────────────────
  const dim   = daysInMonth(year,month);
  const fd    = firstDay(year,month);
  const cells = Math.ceil((fd+dim)/7)*7;

  const getEventsForDate = dateKey => events.filter(e => e.dateKey===dateKey);

  const monthEvents = events
    .filter(e => { const [y,m]=e.dateKey.split("-"); return Number(y)===year&&Number(m)===month+1; })
    .sort((a,b) => a.dateKey>b.dateKey?1:a.dateKey<b.dateKey?-1:(a.startTime||"")>(b.startTime||"")?1:-1);

  // ── 로딩 ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#023E8A,#0077B6)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:60,animation:"bob 1.2s ease-in-out infinite"}}>🏊</div>
      <div style={{color:"white",fontWeight:800,fontSize:16,fontFamily:"sans-serif"}}>로딩 중...</div>
      <style>{`@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}`}</style>
    </div>
  );

  // ── 로그인 화면 ────────────────────────────────────────────────────────────
  if (!user) return (
    <div style={S.authBg}>
      <div style={S.authCard}>
        <div style={{background:"linear-gradient(135deg,#023E8A,#0077B6)",padding:"28px 0 20px",textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:8}}>🏊</div>
          <div style={{fontWeight:900,fontSize:18,color:"white",letterSpacing:2}}>SEONGIL SWIMTEAM</div>
          <div style={{fontWeight:700,fontSize:10,color:"rgba(255,255,255,0.6)",letterSpacing:4}}>PLANNER</div>
        </div>
        <div style={{padding:"28px 24px"}}>
          <div style={{fontSize:14,color:"#64748B",textAlign:"center",marginBottom:24,lineHeight:1.7}}>
            성일 수영팀 전용 일정 플래너<br/>
            <strong style={{color:"#0077B6"}}>팀원 모두가 실시간으로 일정을 공유</strong>해요!
          </div>
          {["🏊 수영장 일정 관리","👥 팀원 실시간 공유","📍 전국 수영장 선택","📱 홈 화면 설치"].map(f=>(
            <div key={f} style={{fontSize:13,color:"#374151",padding:"7px 0",borderBottom:"1px solid #F0FAFF",textAlign:"left"}}>{f}</div>
          ))}
          <button style={S.googleBtn} onClick={handleLogin}>
            <GoogleIcon/> Google로 시작하기
          </button>
          <div style={{fontSize:11,color:"#94A3B8",textAlign:"center"}}>Google 계정으로 로그인하면 모든 팀원과 일정이 실시간으로 공유됩니다</div>
        </div>
      </div>
      <style>{GLOBAL_CSS}</style>
    </div>
  );

  const slideStyle = slideDir
    ? {animation:slideDir==="left"?"slideOutLeft 0.22s ease forwards":"slideOutRight 0.22s ease forwards"}
    : {animation:"slideIn 0.22s ease"};

  return (
    <div style={S.app}>
      {toast && <Toast msg={toast.msg} type={toast.type}/>}

      {/* Header */}
      <header style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🌊</span>
          <div>
            <div style={S.appName}>SEONGIL SWIMTEAM</div>
            <div style={S.appSub}>PLANNER</div>
          </div>
          {syncAnim && <span style={{fontSize:13,animation:"spin 1s linear infinite"}}>🔄</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <img src={user.photoURL} alt="" style={{width:30,height:30,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.4)"}} onError={e=>e.target.style.display="none"}/>
          <button onClick={handleLogout} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}>로그아웃</button>
        </div>
      </header>

      {/* 환영 메시지 */}
      <div style={{background:"#E0F4FF",padding:"8px 16px",fontSize:12,color:"#0077B6",fontWeight:600,textAlign:"center",borderBottom:"1px solid #BAE6FD"}}>
        👋 {user.displayName}님 환영해요! 일정은 팀원 모두에게 실시간으로 공유돼요 🏊
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {[["calendar","🏊 달력"],["list","📋 일정"],["team","👥 팀"]].map(([k,label])=>(
          <button key={k} style={{...S.navBtn,...(tab===k?S.navBtnActive:{})}} onClick={()=>setTab(k)}>{label}</button>
        ))}
      </nav>

      {/* ── 달력 탭 ── */}
      {tab==="calendar" && (
        <div style={S.content} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
          <div style={S.monthNav}>
            <button style={S.arrowBtn} onClick={()=>changeMonth("right")}>‹</button>
            <div style={{textAlign:"center"}}>
              <div style={S.monthTitle}>{MONTHS[month]}</div>
              <div style={{fontSize:12,color:"#90CAE4",fontWeight:600}}>{year}</div>
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
                const evs=key?getEventsForDate(key):[];
                const isToday=key===todayKey;
                const col=idx%7;
                const holidayName=key?holidays[key]:null;
                const isHoliday=!!holidayName||col===0;
                const dayColor=isToday?"white":isHoliday?"#FF3B3B":col===6?"#00B4D8":"#1a3a5c";
                return (
                  <div key={idx} onClick={()=>valid&&openAdd(key)}
                    style={{...S.cell,...(valid?{}:S.cellEmpty),...(isToday?S.cellToday:{}),
                      ...(holidayName&&!isToday?{background:"#FFF5F5"}:{})}}>
                    {valid && <>
                      <span style={{...S.dayNum,color:dayColor,background:isToday?"#0077B6":"transparent"}}>{dayNum}</span>
                      {holidayName&&<div style={{fontSize:8,color:"#FF3B3B",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:1,lineHeight:1.2}}>{holidayName}</div>}
                      {evs.slice(0,2).map((ev,i)=>(
                        <div key={i} onClick={e=>openEdit(ev,e)}
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
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontWeight:800,fontSize:14,color:"#023E8A"}}>🌊 {MONTHS[month]} 팀 일정</span>
              <span style={{fontSize:12,color:"#0077B6",fontWeight:700,background:"#E0F4FF",borderRadius:20,padding:"2px 10px"}}>{monthEvents.length}개</span>
            </div>
            {monthEvents.length===0
              ? <div style={{textAlign:"center",color:"#90CAE4",fontSize:13,padding:"24px 0",lineHeight:2}}>이번 달 일정이 없어요 🏊<br/>날짜를 눌러 추가해보세요!</div>
              : (() => {
                  const groups={};
                  monthEvents.forEach(ev=>{ if(!groups[ev.dateKey]) groups[ev.dateKey]=[]; groups[ev.dateKey].push(ev); });
                  return Object.entries(groups).map(([dateKey,evs])=>{
                    const [,m,d]=dateKey.split("-");
                    const dayOfWeek=WEEKDAYS[new Date(year,month,Number(d)).getDay()];
                    return (
                      <div key={dateKey} style={{marginBottom:14}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                          <div style={{display:"inline-flex",alignItems:"center",borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:800,background:dateKey===todayKey?"#0077B6":"#E0F4FF",color:dateKey===todayKey?"white":"#0077B6"}}>
                            {d}일 <span style={{fontWeight:500,opacity:0.75,marginLeft:3}}>{dayOfWeek}</span>
                          </div>
                          {dateKey===todayKey&&<span style={{fontSize:10,background:"#E0F4FF",color:"#0077B6",borderRadius:20,padding:"2px 8px",fontWeight:700}}>오늘</span>}
                          {holidays[dateKey]&&<span style={{fontSize:10,background:"#FFE8E8",color:"#FF3B3B",borderRadius:20,padding:"2px 8px",fontWeight:700}}>🎌 {holidays[dateKey]}</span>}
                        </div>
                        {evs.map(ev=>(
                          <div key={ev.id} onClick={e=>openEdit(ev,e)}
                            style={{display:"flex",alignItems:"center",gap:10,background:"white",borderRadius:12,padding:"10px 12px",marginBottom:5,borderLeft:`4px solid ${ev.color}`,boxShadow:"0 1px 4px rgba(0,119,182,0.07)",cursor:"pointer"}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:ev.color,flexShrink:0}}/>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontWeight:700,fontSize:13,color:"#023E8A",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.icon} {ev.title}</div>
                              {ev.pool&&<div style={{fontSize:11,color:"#0077B6",marginTop:2,fontWeight:600}}>📍 {ev.pool}</div>}
                              {(ev.startTime||ev.endTime)&&<div style={{fontSize:11,color:"#00B4D8",marginTop:2,fontWeight:600}}>⏱ {timeRange(ev.startTime,ev.endTime)}</div>}
                              {ev.authorName&&<div style={{fontSize:10,color:"#94A3B8",marginTop:2}}>✍️ {ev.authorName}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()
            }
          </div>
        </div>
      )}

      {/* ── 연간 일정 탭 ── */}
      {tab==="list" && (
        <YearlyView year={year} events={events} holidays={holidays} onEdit={openEdit} todayKey={todayKey}/>
      )}

      {/* ── 팀 탭 ── */}
      {tab==="team" && (
        <div style={S.content}>
          <div style={{background:"linear-gradient(135deg,#023E8A,#0077B6)",borderRadius:16,padding:20,color:"white",marginBottom:12,textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:8}}>🏊</div>
            <div style={{fontWeight:900,fontSize:16,marginBottom:4}}>성일 수영팀</div>
            <div style={{fontSize:13,opacity:0.8}}>Google 계정으로 로그인한 팀원 모두<br/>자동으로 일정이 실시간 공유돼요!</div>
          </div>

          <div style={{background:"white",borderRadius:16,padding:16,marginBottom:12,boxShadow:"0 1px 8px rgba(0,119,182,0.07)"}}>
            <div style={{fontWeight:800,fontSize:14,color:"#023E8A",marginBottom:12}}>👤 내 정보</div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <img src={user.photoURL} alt="" style={{width:48,height:48,borderRadius:"50%",border:"3px solid #0077B6"}} onError={e=>e.target.style.display="none"}/>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:"#023E8A"}}>{user.displayName}</div>
                <div style={{fontSize:12,color:"#90CAE4"}}>{user.email}</div>
                <div style={{fontSize:11,color:"#2DC653",marginTop:2,fontWeight:600}}>✅ 실시간 공유 중</div>
              </div>
            </div>
          </div>

          <div style={{background:"white",borderRadius:16,padding:16,marginBottom:12,boxShadow:"0 1px 8px rgba(0,119,182,0.07)"}}>
            <div style={{fontWeight:800,fontSize:14,color:"#023E8A",marginBottom:8}}>🔗 팀원 초대 방법</div>
            <div style={{fontSize:13,color:"#64748B",lineHeight:1.8}}>
              아래 앱 링크를 카카오톡으로 공유하세요.<br/>
              팀원이 <strong style={{color:"#0077B6"}}>Google 계정으로 로그인</strong>하면<br/>
              바로 모든 일정이 실시간으로 보여요! 🎉
            </div>
            <button onClick={()=>{
              navigator.clipboard.writeText(window.location.href);
              showToast("앱 링크 복사됨! 카카오톡에 붙여넣으세요 🔗","success");
            }} style={{marginTop:12,width:"100%",background:"#FEE500",color:"#1a1a1a",border:"none",borderRadius:12,padding:"11px",fontSize:13,fontWeight:800,cursor:"pointer"}}>
              🟡 카카오톡으로 초대 링크 공유
            </button>
          </div>

          <div style={{background:"#E0F4FF",borderRadius:16,padding:16,marginBottom:12}}>
            <div style={{fontWeight:800,fontSize:13,color:"#023E8A",marginBottom:6}}>📱 홈 화면에 설치하기</div>
            <div style={{fontSize:12,color:"#0077B6",lineHeight:1.8}}>
              iPhone: Safari → 공유버튼(□↑) → 홈 화면에 추가<br/>
              Android: Chrome → 메뉴(⋮) → 앱 설치
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button style={S.fab} onClick={()=>openAdd(todayKey)}>＋</button>

      {/* Modal */}
      {modal && (
        <div style={S.overlay} onClick={()=>setModal(null)}>
          <div style={S.modalSheet} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:"#90CAE4",borderRadius:2,margin:"0 auto 18px"}}/>
            <div style={{fontWeight:900,fontSize:16,color:"#023E8A",marginBottom:4}}>{modal.id?"✏️ 일정 수정":"🏊 새 일정 추가"}</div>
            <div style={{fontSize:12,color:"#90CAE4",marginBottom:14}}>{fmtDate(modal.date)}</div>

            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
              {ICONS.map(ic=>(
                <button key={ic} onClick={()=>setForm(f=>({...f,icon:ic}))}
                  style={{width:34,height:34,borderRadius:8,fontSize:17,background:form.icon===ic?"#E0F4FF":"#F0FAFF",border:form.icon===ic?"2px solid #0077B6":"1px solid #CCEEFF",cursor:"pointer"}}>{ic}</button>
              ))}
            </div>

            <input value={form.title||""} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
              placeholder="일정 제목 *" style={S.input}/>

            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{flex:1}}>
                <label style={{display:"block",fontSize:11,color:"#90CAE4",fontWeight:700,marginBottom:4}}>⏱ 시작</label>
                <input type="time" value={form.startTime||""} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))} style={S.timeInput}/>
              </div>
              <div style={{fontSize:16,color:"#90CAE4",fontWeight:700,marginTop:16}}>→</div>
              <div style={{flex:1}}>
                <label style={{display:"block",fontSize:11,color:"#90CAE4",fontWeight:700,marginBottom:4}}>⏱ 종료</label>
                <input type="time" value={form.endTime||""} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))} style={S.timeInput}/>
              </div>
            </div>
            {(form.startTime||form.endTime)&&(
              <div style={{fontSize:12,color:"#0077B6",fontWeight:700,background:"#E0F4FF",borderRadius:10,padding:"6px 12px",marginBottom:8,textAlign:"center"}}>
                ⏱ {timeRange(form.startTime,form.endTime)}
              </div>
            )}

            <PoolSelector value={form.pool||DEFAULT_POOL} onChange={pool=>setForm(f=>({...f,pool}))}/>

            <textarea value={form.note||""} onChange={e=>setForm(f=>({...f,note:e.target.value}))}
              placeholder="메모 (선택)" rows={2} style={{...S.input,resize:"none"}}/>

            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>setForm(f=>({...f,color:c}))}
                  style={{width:26,height:26,borderRadius:"50%",background:c,border:"none",cursor:"pointer",outline:form.color===c?`3px solid ${c}`:"none",outlineOffset:2}}/>
              ))}
            </div>

            <div style={{display:"flex",gap:8}}>
              {modal.id&&<button style={S.deleteBtn} onClick={deleteEvent}>🗑 삭제</button>}
              <button style={S.saveBtn} onClick={saveEvent}>저장하기</button>
            </div>
          </div>
        </div>
      )}

      <style>{GLOBAL_CSS}</style>
    </div>
  );
}


// ── 연간 일정 뷰 ──────────────────────────────────────────────────────────────
function YearlyView({ year, events, holidays, onEdit, todayKey }) {
  const MONTHS_KR = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  const WEEKDAYS  = ["일","월","화","수","목","금","토"];
  const timeRange = (s,e) => s&&e?`${s} ~ ${e}`:s?`${s}~`:e?`~${e}`:"";

  const totalCount = events.filter(e => e.dateKey?.startsWith(String(year))).length;

  // 일정이 있는 달만 필터링
  const activeMonths = MONTHS_KR.map((mName, mIdx) => {
    const mEvents = events
      .filter(e => {
        const [y,m] = (e.dateKey||"").split("-");
        return Number(y)===year && Number(m)===mIdx+1;
      })
      .sort((a,b) => a.dateKey>b.dateKey?1:a.dateKey<b.dateKey?-1:0);
    return { mName, mIdx, mEvents };
  }).filter(({ mEvents }) => mEvents.length > 0);

  return (
    <div style={{padding:"12px 12px 80px"}}>
      {/* 헤더 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div style={{fontWeight:900,fontSize:18,color:"#023E8A"}}>{year}년 연간 일정</div>
          <div style={{fontSize:12,color:"#90CAE4",marginTop:2}}>총 {totalCount}개 · {activeMonths.length}개월</div>
        </div>
        <div style={{fontSize:28}}>🗓️</div>
      </div>

      {/* 일정 없을 때 */}
      {activeMonths.length===0 && (
        <div style={{textAlign:"center",color:"#90CAE4",fontSize:13,padding:"60px 0",lineHeight:2}}>
          <div style={{fontSize:40,marginBottom:12}}>🏊</div>
          {year}년에 등록된 일정이 없어요<br/>달력에서 일정을 추가해보세요!
        </div>
      )}

      {/* 일정 있는 달만 스크롤 표시 */}
      {activeMonths.map(({ mName, mIdx, mEvents }) => {
        const isNow   = new Date().getMonth()===mIdx && new Date().getFullYear()===year;
        const hasPast = new Date(year, mIdx+1, 0) < new Date() && !isNow;

        // 날짜별 그룹
        const groups = {};
        mEvents.forEach(ev => {
          if (!groups[ev.dateKey]) groups[ev.dateKey] = [];
          groups[ev.dateKey].push(ev);
        });

        return (
          <div key={mIdx} style={{marginBottom:20}}>
            {/* 월 헤더 */}
            <div style={{
              display:"flex",alignItems:"center",gap:10,
              background:isNow?"linear-gradient(135deg,#023E8A,#0077B6)":hasPast?"#F1F5F9":"white",
              borderRadius:"14px 14px 0 0",
              padding:"12px 16px",
              border:`1.5px solid ${isNow?"#0077B6":hasPast?"#E2E8F0":"#CCEEFF"}`,
              borderBottom:"none",
              boxShadow:"0 1px 4px rgba(0,119,182,0.08)"}}>
              <span style={{fontWeight:900,fontSize:15,
                color:isNow?"white":hasPast?"#94A3B8":"#023E8A"}}>
                {mName}
              </span>
              {isNow&&(
                <span style={{fontSize:10,background:"rgba(255,255,255,0.25)",color:"white",
                  borderRadius:20,padding:"2px 8px",fontWeight:700}}>이번 달</span>
              )}
              <span style={{fontSize:11,fontWeight:700,marginLeft:"auto",
                background:isNow?"rgba(255,255,255,0.2)":hasPast?"#E2E8F0":"#E0F4FF",
                color:isNow?"white":hasPast?"#94A3B8":"#0077B6",
                borderRadius:20,padding:"2px 10px"}}>
                {mEvents.length}개
              </span>
            </div>

            {/* 날짜별 일정 목록 */}
            <div style={{background:"white",border:`1.5px solid ${isNow?"#0077B6":hasPast?"#E2E8F0":"#CCEEFF"}`,
              borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>
              {Object.entries(groups).map(([dateKey, evs]) => {
                const [,,d] = dateKey.split("-");
                const dow    = WEEKDAYS[new Date(year, mIdx, Number(d)).getDay()];
                const isToday= dateKey===todayKey;
                const hName  = holidays[dateKey];
                const isSun  = new Date(year, mIdx, Number(d)).getDay()===0;
                const isSat  = new Date(year, mIdx, Number(d)).getDay()===6;
                return (
                  <div key={dateKey} style={{borderBottom:"1px solid #F0F9FF"}}>
                    {/* 날짜 행 */}
                    <div style={{display:"flex",alignItems:"center",gap:6,
                      padding:"8px 14px 4px",
                      background:isToday?"#EFF8FF":hName?"#FFF5F5":"transparent"}}>
                      <div style={{
                        display:"inline-flex",alignItems:"center",gap:4,
                        background:isToday?"#0077B6":hName?"#FFE8E8":(isSun||isSat)?"#FFF0F0":"#F1F5F9",
                        color:isToday?"white":(hName||isSun)?"#FF3B3B":isSat?"#00B4D8":"#64748B",
                        borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:800}}>
                        {d}일 {dow}
                      </div>
                      {isToday&&<span style={{fontSize:10,color:"#0077B6",fontWeight:700}}>오늘</span>}
                      {hName&&<span style={{fontSize:10,color:"#FF3B3B",fontWeight:700}}>🎌 {hName}</span>}
                    </div>
                    {/* 일정들 */}
                    {evs.map(ev => (
                      <div key={ev.id} onClick={e=>onEdit(ev,e)}
                        style={{display:"flex",alignItems:"center",gap:10,
                          padding:"8px 14px 8px 20px",cursor:"pointer",
                          borderLeft:`3px solid ${ev.color}`}}>
                        <span style={{fontSize:18}}>{ev.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,color:"#023E8A",
                            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {ev.title}
                          </div>
                          <div style={{display:"flex",gap:8,marginTop:2,flexWrap:"wrap"}}>
                            {(ev.startTime||ev.endTime)&&
                              <span style={{fontSize:10,color:"#00B4D8",fontWeight:600}}>
                                ⏱ {timeRange(ev.startTime,ev.endTime)}
                              </span>}
                            {ev.pool&&
                              <span style={{fontSize:10,color:"#0077B6",fontWeight:600}}>
                                📍 {ev.pool}
                              </span>}
                            {ev.authorName&&
                              <span style={{fontSize:10,color:"#94A3B8"}}>
                                ✍️ {ev.authorName}
                              </span>}
                          </div>
                          {ev.note&&<div style={{fontSize:10,color:"#64748B",marginTop:2}}>💬 {ev.note}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 수영장 선택 ───────────────────────────────────────────────────────────────
function PoolSelector({ value, onChange }) {
  const [step,   setStep]   = useState("summary");
  const [region, setRegion] = useState(null);
  const [city,   setCity]   = useState(null);
  const isMetro = r => METRO_REGIONS.includes(r);

  const handleRegion = r => { setRegion(r); setStep(isMetro(r)?"pool":"city"); };
  const handleCity   = c => { setCity(c); setStep("pool"); };
  const handlePool   = p => { onChange(p); setStep("summary"); };

  const pools = region ? (isMetro(region)?METRO_POOLS[region]:(city?PROVINCE_POOLS[region][city]:[])) : [];

  return (
    <div style={{marginBottom:8}}>
      {step==="summary" && (
        <div onClick={()=>setStep("region")} style={{display:"flex",alignItems:"center",gap:10,background:"#E0F4FF",borderRadius:14,padding:"10px 14px",cursor:"pointer",border:"1.5px solid #90CAE4"}}>
          <span style={{fontSize:18}}>📍</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:13,color:"#0077B6"}}>{value}</div>
            <div style={{fontSize:10,color:"#48CAE4",marginTop:1}}>눌러서 수영장 변경</div>
          </div>
          <span style={{fontSize:18,color:"#48CAE4",fontWeight:700}}>›</span>
        </div>
      )}
      {step==="region" && (
        <div style={{background:"#F0FAFF",borderRadius:14,border:"1.5px solid #90CAE4",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"#0077B6"}}>
            <span style={{fontWeight:800,fontSize:13,color:"white"}}>🗺 지역 선택</span>
            <button style={{background:"rgba(255,255,255,0.25)",border:"none",color:"white",borderRadius:8,width:26,height:26,cursor:"pointer",fontWeight:700}} onClick={()=>setStep("summary")}>✕</button>
          </div>
          <div style={{padding:"10px 12px 6px"}}>
            <div style={{fontSize:10,color:"#0077B6",fontWeight:700,marginBottom:6,opacity:0.7}}>특별시 · 광역시 · 특별자치시</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
              {METRO_REGIONS.map(r=>(
                <button key={r} onClick={()=>handleRegion(r)}
                  style={{background:"white",border:"1.5px solid #90CAE4",borderRadius:20,padding:"5px 10px",fontSize:11,fontWeight:700,color:"#0077B6",cursor:"pointer"}}>
                  {r.replace("특별시","").replace("광역시","").replace("특별자치시","")}
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:"#0077B6",fontWeight:700,marginBottom:6,opacity:0.7}}>도 · 특별자치도</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {PROVINCE_REGIONS.map(r=>(
                <button key={r} onClick={()=>handleRegion(r)}
                  style={{background:"white",border:"1.5px solid #90CAE4",borderRadius:20,padding:"5px 10px",fontSize:11,fontWeight:700,color:"#0077B6",cursor:"pointer"}}>
                  {r.replace("특별자치도","").replace("도","")}도
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {step==="city" && region && (
        <div style={{background:"#F0FAFF",borderRadius:14,border:"1.5px solid #90CAE4",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"#0077B6"}}>
            <button style={{background:"none",border:"none",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={()=>setStep("region")}>‹ {region}</button>
            <button style={{background:"rgba(255,255,255,0.25)",border:"none",color:"white",borderRadius:8,width:26,height:26,cursor:"pointer",fontWeight:700}} onClick={()=>setStep("summary")}>✕</button>
          </div>
          <div style={{maxHeight:180,overflowY:"auto"}}>
            {Object.keys(PROVINCE_POOLS[region]).map(c=>(
              <button key={c} onClick={()=>handleCity(c)}
                style={{display:"block",width:"100%",background:"none",border:"none",borderBottom:"1px solid #E0F4FF",padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:600,color:"#1a3a5c",cursor:"pointer"}}>
                🏙 {c}
              </button>
            ))}
          </div>
        </div>
      )}
      {step==="pool" && (
        <div style={{background:"#F0FAFF",borderRadius:14,border:"1.5px solid #90CAE4",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"#0077B6"}}>
            <button style={{background:"none",border:"none",color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={()=>setStep(isMetro(region)?"region":"city")}>‹ {city||region}</button>
            <button style={{background:"rgba(255,255,255,0.25)",border:"none",color:"white",borderRadius:8,width:26,height:26,cursor:"pointer",fontWeight:700}} onClick={()=>setStep("summary")}>✕</button>
          </div>
          <div style={{maxHeight:180,overflowY:"auto"}}>
            {pools.map(p=>(
              <button key={p} onClick={()=>handlePool(p)}
                style={{display:"block",width:"100%",background:p===value?"#E0F4FF":"none",border:"none",borderBottom:"1px solid #E0F4FF",padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:p===value?800:600,color:p===value?"#0077B6":"#1a3a5c",cursor:"pointer"}}>
                🏊 {p}{p===value?" ✓":""}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Toast({msg,type}){
  const bg=type==="success"?"#0077B6":type==="warn"?"#F59E0B":"#00B4D8";
  return <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",borderRadius:20,padding:"10px 18px",fontSize:13,fontWeight:700,zIndex:500,boxShadow:"0 4px 16px rgba(0,0,0,0.15)",whiteSpace:"nowrap",animation:"fadeIn 0.3s ease",background:bg,color:"white"}}>{msg}</div>;
}

function GoogleIcon(){
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" style={{marginRight:8,flexShrink:0}}>
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.2 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.5 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.7 6.5 29.1 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.7 39.8 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.8l6.2 5.2C40.8 35.8 44 30.4 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  );
}

const S = {
  app:        { minHeight:"100vh", background:"#F0FAFF", fontFamily:"'Noto Sans KR',sans-serif", paddingBottom:80 },
  header:     { background:"linear-gradient(135deg,#023E8A,#0077B6)", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 16px rgba(0,119,182,0.3)" },
  appName:    { fontWeight:900, fontSize:13, color:"white", letterSpacing:1, lineHeight:1.2 },
  appSub:     { fontWeight:700, fontSize:9, color:"rgba(255,255,255,0.6)", letterSpacing:3 },
  nav:        { display:"flex", background:"white", borderBottom:"2px solid #E0F4FF", padding:"0 16px" },
  navBtn:     { flex:1, background:"none", border:"none", borderBottom:"3px solid transparent", padding:"10px 0", fontSize:12, fontWeight:700, color:"#90CAE4", cursor:"pointer", transition:"all 0.2s" },
  navBtnActive:{ borderBottomColor:"#0077B6", color:"#0077B6" },
  content:    { padding:"12px 12px 0" },
  monthNav:   { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 4px 12px" },
  monthTitle: { fontWeight:900, fontSize:22, color:"#023E8A" },
  arrowBtn:   { background:"white", border:"1.5px solid #90CAE4", borderRadius:12, width:36, height:36, fontSize:18, cursor:"pointer", color:"#0077B6", fontWeight:700 },
  calWrap:    { userSelect:"none" },
  weekRow:    { display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 },
  weekLabel:  { textAlign:"center", fontSize:11, fontWeight:700, padding:"4px 0" },
  grid:       { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 },
  cell:       { minHeight:66, background:"white", borderRadius:8, padding:"5px 4px 4px", cursor:"pointer", border:"1px solid #E8F4FD", overflow:"hidden", boxSizing:"border-box" },
  cellEmpty:  { background:"transparent", border:"none", cursor:"default", boxShadow:"none" },
  cellToday:  { border:"2px solid #0077B6 !important", boxShadow:"inset 0 0 0 2px #0077B6", background:"#EFF8FF" },
  dayNum:     { display:"inline-flex", alignItems:"center", justifyContent:"center", width:20, height:20, borderRadius:"50%", fontSize:11, fontWeight:700, marginBottom:2 },
  chip:       { fontSize:9, fontWeight:700, borderLeft:"3px solid", borderRadius:"0 5px 5px 0", padding:"1px 3px", marginBottom:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  more:       { fontSize:9, color:"#90CAE4", paddingLeft:3 },
  summaryWrap:{ marginTop:16, marginBottom:16 },
  overlay:    { position:"fixed", inset:0, background:"rgba(2,62,138,0.45)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:300, backdropFilter:"blur(4px)" },
  modalSheet: { background:"white", borderRadius:"22px 22px 0 0", padding:"20px 20px 44px", width:"100%", maxWidth:480, boxShadow:"0 -8px 40px rgba(0,119,182,0.2)", animation:"slideUp 0.25s ease", maxHeight:"92vh", overflowY:"auto" },
  input:      { width:"100%", border:"1.5px solid #CCEEFF", borderRadius:12, padding:"10px 14px", fontSize:14, color:"#023E8A", outline:"none", boxSizing:"border-box", marginBottom:8, fontFamily:"inherit" },
  timeInput:  { width:"100%", border:"1.5px solid #CCEEFF", borderRadius:12, padding:"9px 12px", fontSize:13, color:"#023E8A", outline:"none", boxSizing:"border-box", fontFamily:"inherit", background:"#F0FAFF" },
  deleteBtn:  { flex:0.6, background:"#FFF1F2", color:"#FF6B6B", border:"none", borderRadius:12, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer" },
  saveBtn:    { flex:1, background:"linear-gradient(135deg,#023E8A,#0077B6)", color:"white", border:"none", borderRadius:12, padding:"11px", fontSize:14, fontWeight:800, cursor:"pointer" },
  authBg:     { minHeight:"100vh", background:"linear-gradient(160deg,#023E8A,#0077B6,#00B4D8)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
  authCard:   { background:"white", borderRadius:24, overflow:"hidden", maxWidth:360, width:"100%", boxShadow:"0 12px 50px rgba(2,62,138,0.3)" },
  googleBtn:  { display:"flex", alignItems:"center", justifyContent:"center", width:"100%", background:"white", border:"2px solid #CCEEFF", borderRadius:14, padding:"12px", fontSize:15, fontWeight:700, color:"#023E8A", cursor:"pointer", margin:"20px 0 12px", boxShadow:"0 2px 8px rgba(0,119,182,0.1)" },
  fab:        { position:"fixed", bottom:24, right:20, width:54, height:54, borderRadius:"50%", background:"linear-gradient(135deg,#023E8A,#0077B6)", color:"white", border:"none", fontSize:28, cursor:"pointer", boxShadow:"0 4px 20px rgba(0,119,182,0.45)", zIndex:200 },
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700;800;900&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; outline:none; }
  input, textarea, button { font-family:inherit; }
  div:focus, div:active { outline:none !important; border-color:inherit; }
  body { overscroll-behavior:none; -webkit-tap-highlight-color:transparent; }
  @keyframes slideUp       { from{transform:translateY(60%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes slideIn       { from{opacity:0} to{opacity:1} }
  @keyframes slideOutLeft  { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(-30px)} }
  @keyframes slideOutRight { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(30px)} }
  @keyframes fadeIn        { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes spin          { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes bob           { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  button:hover { opacity:0.88; }
  input[type="time"]::-webkit-calendar-picker-indicator { opacity:0.5; cursor:pointer; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-thumb { background:#90CAE4; border-radius:4px; }
`;
