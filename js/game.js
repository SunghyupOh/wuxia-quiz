/**
 * =========================================================================
 * 사자무림 (四字武林) - 무림 사자성어 퀴즈 엔진
 * =========================================================================
 * 
 * [아키텍처 설계 철학: 《객체지향의 사실과 오해》]
 * 본 코드는 자율적인 객체들이 각자의 명확한 역할(Role)과 책임(Responsibility)을
 * 다하며 메시지(Message)를 통해 협력(Collaboration)하는 객체지향 구조로 설계되었습니다.
 *
 * 1. Challenger    (도전 협객)   : 내력(HP)을 자율적으로 관리하고 주화입마를 판별하는 책임
 * 2. Judge         (무림 판정관) : 초식의 성패를 채점하고 무공 점수, 콤보, 최종 무림 경지를 판정하는 책임
 * 3. ScrollVault   (비급 보관소) : 30대 비급 보관, 10문제 무작위 엄선, 동적 4지선다 오답 보기 직조 책임
 * 4. IncenseTimer  (향불 시계)   : 15초 카운트다운을 째깍째깍 재고 타임아웃 메시지를 알릴 책임
 * 5. BigeupPavilion(비급각)      : 30대 사자성어 도감 마스터-디테일 양면 서책을 관리하는 책임
 * 6. ArenaPresenter(비무장 뷰)   : 협력 결과를 비무장 화면(DOM)에 시각적으로 그려내는 책임
 * 7. WuxiaExamGame (총괄 시험관) : 위 자율적 객체들의 협력을 조율하고 비무 흐름을 이끄는 파사드(Facade)
 * =========================================================================
 */

// 로컬 file:// 프로토콜 실행 시 브라우저 CORS 차단 방지를 위한 내장 30대 비급서 백업 데이터
const FALLBACK_BANK = [
  { id: "q1", category: "【강호 기연】", hangul: "환골탈태", hanja: "換骨脫胎", question: "사파의 포위망에 갇혀 절벽으로 몸을 던진 주인공! 동굴 속에서 천년영약을 삼키자 온몸의 묵은 때가 벗겨지고 뼈마디가 우두둑 맞춰지며 완전히 새로운 신체로 거듭났다!", explanation: "환골탈태(換骨脫胎): 뼈를 바꾸고 태를 벗는다는 뜻으로, 초절정 고수로 도약할 때 신체가 비약적으로 진화하는 현상입니다." },
  { id: "q2", category: "【금기 마공】", hangul: "주화입마", hanja: "走火入魔", question: "절세 마공의 유혹을 이기지 못하고 무리하게 단전의 기운을 끌어올리다, 통제력을 잃고 내력이 기경팔맥을 역류하여 피를 토하며 미쳐 날뛰는 상태에 빠졌다!", explanation: "주화입마(走火入魔): 불기운이 치솟고 마귀에 홀린다는 뜻으로, 무공 수련 중 기운이 역류해 정신 착란이나 폐인이 되는 치명적인 내상입니다." },
  { id: "q3", category: "【최후 결전】", hangul: "동귀어진", hanja: "同歸於盡", question: "적의 수장이 너무나 강해 도저히 이길 가망이 없다. 주인공은 자신의 단전을 스스로 폭주시켜 적과 함께 황천길로 동행할 각오로 비장하게 최후의 일격을 꽂아 넣었다!", explanation: "동귀어진(同歸於盡): '함께 모두 다하여 죽음으로 돌아간다'는 뜻으로, 적과 함께 목숨을 바쳐 자폭하는 결사 초식입니다." },
  { id: "q4", category: "【절대 방어】", hangul: "금강불괴", hanja: "金剛不壞", question: "소림사의 은거 노승이 쏟아지는 백도(百刀)의 칼날과 빗발치는 쇠화살을 맨몸으로 맞았으나, 챙- 챙- 쇳소리만 튕겨 나갈 뿐 옷자락 하나 베이지 않았다!", explanation: "금강불괴(金剛不壞): 다이아몬드처럼 단단하여 결코 깨지지 않는다는 뜻으로, 외공의 극한에 도달한 무적 방어의 경지입니다." },
  { id: "q5", category: "【쾌도난마】", hangul: "일도양단", hanja: "一刀兩斷", question: "전대 고수의 날카로운 일격이 적의 두터운 흑철 방패와 묵직한 대도를 단 한 번의 번개 같은 칼질로 티끌만 한 망설임도 없이 깔끔하게 두 토막을 내버렸다!", explanation: "일도양단(一刀兩斷): 한 칼로 둘을 동강 낸다는 뜻으로, 주저함 없이 단칼에 베어 넘기거나 결단을 내리는 모습을 뜻합니다." },
  { id: "q6", category: "【전설 회춘】", hangul: "반로환동", hanja: "返老還童", question: "백세(100세)에 달한 문파의 태상장로가 극한의 심법을 깨우치자, 눈부신 백발이 흑발로 물들고 주름진 피부가 어린아이처럼 팽팽해지며 젊음을 되찾았다!", explanation: "반로환동(返老還童): 늙은 몸이 다시 어린아이의 모습으로 되돌아간다는 뜻으로, 도가 무공이나 화경에 이른 고수들이 회춘하는 현상입니다." },
  { id: "q7", category: "【무학 정수】", hangul: "만류귀종", hanja: "萬流歸宗", question: "세상의 온갖 기이한 독문 무공과 천 갈래의 초식을 두루 섭렵한 끝에, 결국 천하의 모든 무공과 진리는 단 하나의 근본 이치로 통한다는 큰 깨달음을 얻었다!", explanation: "만류귀종(萬流歸宗): 만 개의 물줄기가 결국 하나의 바다로 모이듯, 세상의 모든 무학과 원리가 하나의 궁극으로 귀결된다는 깨달음입니다." },
  { id: "q8", category: "【협객 소탕】", hangul: "일망타진", hanja: "一網打盡", question: "상단을 약탈하던 녹림 산적 30명이 좁은 협곡에 모여 잔치를 벌이자, 주인공이 협곡 입구를 막고 검막을 펼쳐 도적 무리 전체를 단 한 명도 놓치지 않고 쓸어 담았다!", explanation: "일망타진(一網打盡): 한 번 그물을 쳐서 물고기를 모조리 잡는다는 뜻으로, 어떤 무리나 악당을 한 번에 전부 잡아들이는 것을 뜻합니다." },
  { id: "q9", category: "【복수 서막】", hangul: "권토중래", hanja: "捲土重來", question: "10년 전 숙적에게 패배하여 가문이 풍비박산 났으나, 거친 황야에서 피눈물을 흘리며 내공을 닦은 끝에 거대한 세력을 이끌고 마침내 복수를 위해 다시 쳐들어왔다!", explanation: "권토중래(捲土重來): 흙먼지를 말아 올리며 다시 쳐들어온다는 뜻으로, 패배했던 자가 힘을 길러 세력을 회복하고 다시 쳐들어옴을 이릅니다." },
  { id: "q10", category: "【미로 살기】", hangul: "오리무중", hanja: "五里霧中", question: "사파가 깔아둔 기문진(奇門陣)의 짙은 안개 속에서, 사방에서 귀곡성 같은 소리와 살기만 번뜩이고 정작 적의 본체가 어디 있는지 전혀 종잡을 수 없다!", explanation: "오리무중(五里霧中): 5리에 걸친 짙은 안개 속에 있다는 뜻으로, 일의 갈피를 잡을 수 없거나 방향을 전혀 알지 못하는 상태를 뜻합니다." },
  { id: "q11", category: "【전장 돌파】", hangul: "파죽지세", hanja: "破竹之勢", question: "적진 한가운데로 돌진한 주인공의 창끝이 거침없이 적의 방어선을 꿰뚫자, 마치 대나무를 쪼갤 때처럼 첫 마디가 쪼개지자마자 나머지 마디가 단숨에 갈라지듯 적들이 무너졌다!", explanation: "파죽지세(破竹之勢): 대나무를 쪼개는 기세라는 뜻으로, 맹렬하여 도저히 막을 수 없이 적을 제압해 나가는 거센 형세를 말합니다." },
  { id: "q12", category: "【심리 수싸움】", hangul: "허허실실", hanja: "虛虛實實", question: "적의 맹공에 성문을 활짝 열고 거문고를 뜯으며 방심을 유도하더니, 적이 의심하며 퇴각하는 틈을 타 매복군으로 퇴로를 끊어버렸다! 빈틈 속에 실속을 감춘 이 계책은?", explanation: "허허실실(虛虛實實): 빈 것은 차 있는 것처럼 보이고 찬 것은 빈 것처럼 보이게 하여, 적을 속이고 혼란에 빠뜨리는 심리전과 계책입니다." },
  { id: "q13", category: "【강호 비정】", hangul: "약육강식", hanja: "弱肉强食", question: "무림의 냉혹한 법칙을 보여주듯, 약소 문파는 대형 세가의 횡포에 흔적도 없이 집어삼켜지고 오직 힘을 가진 강자만이 정의와 법을 자처하는 비정한 강호의 현실!", explanation: "약육강식(弱肉强食): 약한 자의 고기는 강한 자의 먹이가 된다는 뜻으로, 힘 있는 자가 힘없는 자를 지배하고 억누르는 냉혹한 상태를 말합니다." },
  { id: "q14", category: "【절체절명】", hangul: "백척간두", hanja: "百尺竿頭", question: "백 척이나 되는 높은 대나무 장대 끝에 아슬아슬하게 매달려 바람에 휘청거리는 듯, 한 발자국만 헛디디면 끝없는 심연으로 추락할 극도로 위태로운 상황에 처했다!", explanation: "백척간두(百尺竿頭): 백 척 높은 장대 끝에 섰다는 뜻으로, 더할 나위 없이 위태롭고 위험이 극에 달한 절체절명의 처지를 뜻합니다." },
  { id: "q15", category: "【포위 고립】", hangul: "사면초가", hanja: "四面楚歌", question: "동서남북 모든 탈출로가 사파 흑도 무리에게 봉쇄되었고, 성벽 너머에서는 적들이 부르는 조롱 섞인 노랫소리만 울려 퍼지니 누구의 구원도 바랄 수 없는 고립무원의 지경이다!", explanation: "사면초가(四面楚歌): 사방에서 초나라 노래가 들린다는 뜻으로, 적에게 완전히 둘러싸여 누구의 도움도 받을 수 없는 고립 상태를 뜻합니다." },
  { id: "q16", category: "【기재 성장】", hangul: "일취월장", hanja: "日就月將", question: "주인공이 날마다 비급을 수련하고 달마다 새로운 초식을 깨우쳐, 불과 반년 만에 평범한 삼류 검객에서 문파의 내로라하는 장로들과 어깨를 나란히 할 만큼 무공이 눈부시게 발전했다!", explanation: "일취월장(日就月將): 날마다 나아가고 달마다 발전한다는 뜻으로, 학문이나 실력 등이 끊임없이 눈부시게 성장함을 이릅니다." },
  { id: "q17", category: "【절대 내성】", hangul: "만독불침", hanja: "萬毒不侵", question: "사파 당문(唐門)의 독수가 독공을 펼쳐 맹독을 먹였으나, 주인공은 천년영지(千年靈芝)의 기운 덕분에 안색 하나 변하지 않고 독기를 소화해 버렸다!", explanation: "만독불침(萬毒不侵): 만 가지 어떤 독도 몸에 침범하지 못한다는 뜻으로, 무협에서 영약을 복용하여 극독에 완전 면역이 된 전설의 체질을 말합니다." },
  { id: "q18", category: "【비정한 암살】", hangul: "살인멸구", hanja: "殺人滅口", question: "황실을 뒤흔들 비밀 장부를 빼앗은 흑막이, 비밀이 새어 나갈 것을 두려워하여 작전에 동원되었던 자기 수하 암살자들까지 모조리 독살하여 입을 막아버렸다!", explanation: "살인멸구(殺人滅口): 사람을 죽여 입을 없앤다는 뜻으로, 비밀을 지키거나 증거를 인멸하기 위해 관련자를 무참히 살해하여 입을 틀어막는 비정한 행위를 뜻합니다." },
  { id: "q19", category: "【숨은 기재】", hangul: "낭중지추", hanja: "囊中之錐", question: "주인공이 정체를 숨기고 객잔의 허드렛일꾼으로 숨어 지냈으나, 스쳐 지나가는 칼날을 손가락 두 개로 가볍게 튕겨내는 순간 숨길 수 없는 초절정의 기예가 만천하에 드러났다!", explanation: "낭중지추(囊中之錐): 주머니 속의 송곳이라는 뜻으로, 재능과 무공이 뛰어난 사람은 아무리 누추한 곳에 숨어 있어도 저절로 밖으로 드러남을 이릅니다." },
  { id: "q20", category: "【천우신조】", hangul: "구사일생", hanja: "九死一生", question: "만 개의 독화살과 십대고수의 협공을 받아 혈맥이 끊어지고 절벽 아래로 추락하였으나, 절벽에 자란 소나무 가지에 옷자락이 걸려 기적적으로 목숨을 건졌다!", explanation: "구사일생(九死一生): 아홉 번 죽을 뻔하다가 한 번 겨우 살아난다는 뜻으로, 죽을 고비를 수없이 넘기고 극적으로 생명을 건짐을 뜻합니다." },
  { id: "q21", category: "【문파 충성】", hangul: "분골쇄신", hanja: "粉骨碎身", question: "'장문인께서 저를 거두어 주신 은혜, 제 뼈가 가루가 되고 온몸이 부서지는 한이 있더라도 문파의 사직을 지키기 위해 결사대로 출진하겠나이다!'", explanation: "분골쇄신(粉骨碎身): 뼈가 가루가 되고 몸이 부서진다는 뜻으로, 목숨을 아끼지 않고 온 힘과 정성을 다하여 충성을 바침을 뜻합니다." },
  { id: "q22", category: "【복수의 집념】", hangul: "와신상담", hanja: "臥薪嘗膽", question: "멸문당한 가문의 유일한 생존자인 주인공이 가시 돋친 장작더미 위에서 잠을 청하고 쓰디쓴 곰의 쓸개를 핥으며, 원수들의 목을 벨 그날만을 20년간 벼르고 기다렸다!", explanation: "와신상담(臥薪嘗膽): 섶나무에 눕고 쓸개를 씹는다는 뜻으로, 원수를 갚거나 뜻을 이루기 위해 온갖 괴로움과 고난을 묵묵히 참고 견딤을 이릅니다." },
  { id: "q23", category: "【무모한 혈기】", hangul: "당랑거철", hanja: "螳螂拒轍", question: "천하제일인의 무시무시한 패도적인 검풍이 산봉우리를 가르며 밀려오는데, 갓 칼을 잡은 삼류 자객이 사마귀가 앞발을 들고 거대한 수레를 막아서듯 무모하게 칼을 뽑아 들었다!", explanation: "당랑거철(螳螂拒轍): 사마귀가 수레바퀴를 막아선다는 뜻으로, 자기 힘을 헤아리지 못하고 강자에게 무모하게 반항하거나 덤벼듦을 비유합니다." },
  { id: "q24", category: "【지략과 이간】", hangul: "이이제이", hanja: "以夷制夷", question: "무림맹의 군사가 직접 피를 흘리는 대신, 사파 흑도와 마교 사이에 가짜 밀서를 흘려 서로를 적으로 오인하게 만든 뒤 피 터지게 싸우도록 유도하여 양쪽을 한꺼번에 무너뜨렸다!", explanation: "이이제이(以夷制夷): 오랑캐로써 오랑캐를 친다는 뜻으로, 적의 힘을 이용하여 또 다른 적을 제압함으로써 손쉽게 이익을 취하는 계책입니다." },
  { id: "q25", category: "【권세의 허상】", hangul: "호가호위", hanja: "狐假虎威", question: "본인의 무공은 삼류 건달 수준에 불과하면서, 뒤를 봐주는 거대 세가의 깃발과 가주와의 먼 친척 관계를 앞세워 주막 상인들과 힘없는 백성들을 쥐어짜며 으스대는 악당!", explanation: "호가호위(狐假虎威): 여우가 호랑이의 위세를 빌려 행세한다는 뜻으로, 남의 권세나 세력을 등에 업고 제멋대로 거들먹거리며 위세를 부림을 뜻합니다." },
  { id: "q26", category: "【방랑 협객】", hangul: "풍찬노숙", hanja: "風餐露宿", question: "거처할 문파도 안식처도 없이, 휘몰아치는 거센 바람을 밥 삼아 먹고 차가운 밤이슬을 지붕 삼아 잠들며 거친 황야와 강호 곳곳을 떠돌아다니는 낭인 검객의 고단한 방랑길!", explanation: "풍찬노숙(風餐露宿): 바람에 밥을 먹고 이슬에 잠을 잔다는 뜻으로, 집 없이 떠돌며 온갖 풍파와 고생을 겪는 유랑의 삶을 뜻합니다." },
  { id: "q27", category: "【비정한 배신】", hangul: "토사구팽", hanja: "兎死狗烹", question: "사파를 소탕하는 험난한 혈전에서 목숨 걸고 앞장섰으나, 전쟁이 끝나자 권력을 독점하려는 맹주가 토끼 사냥이 끝나 쓸모없어진 사냥개를 삶아 먹듯 충신들을 숙청해 버렸다!", explanation: "토사구팽(兎死狗烹): 토끼가 죽으면 사냥개를 삶는다는 뜻으로, 필요할 때는 실컷 부려먹다가 일이 끝나면 가차 없이 버리거나 배신함을 이릅니다." },
  { id: "q28", category: "【독보적 기재】", hangul: "군계일학", hanja: "群鷄一鶴", question: "전국 수천 명의 후기지수들이 모인 천하비무대회에서, 닭 무리 속에 우아하게 내려앉은 학처럼 단연 돋보이는 기품과 범접할 수 없는 초식으로 장내의 시선을 독차지한 소년 협객!", explanation: "군계일학(群鷄一鶴): 닭 무리 속에 한 마리의 학이라는 뜻으로, 평범한 여러 사람들 중에서 단연 독보적으로 뛰어난 인물을 뜻합니다." },
  { id: "q29", category: "【탈속의 경지】", hangul: "천인합일", hanja: "天人合一", question: "검을 쥐었으나 칼날의 형체가 사라지고, 바람과 대지, 그리고 푸른 하늘의 기운이 내 몸의 혈맥과 완벽히 동화되어 숨소리 하나로 자연의 순리를 움직이는 신선의 경지!", explanation: "천인합일(天人合一): 하늘과 인간이 하나가 된다는 뜻으로, 도와 무학의 극치에 이르러 우주의 섭리와 완전히 동화되는 초탈의 경지입니다." },
  { id: "q30", category: "【뼈에 새긴 은혜】", hangul: "각골난망", hanja: "刻骨難忘", question: "'사파의 마수에서 저와 여동생을 구해주신 협객님의 은혜, 죽는 날까지 뼈에 깊이 새겨 결코 잊지 않고 언젠가 목숨으로 보답하겠나이다!'", explanation: "각골난망(刻骨難忘): 은혜를 뼈에 깊이 새겨 잊지 않는다는 뜻으로, 입은 은혜가 너무나 커서 평생토록 잊지 못함을 뜻합니다." }
];

/**
 * =========================================================================
 * 1. 도메인 모델: Challenger (도전 협객)
 * =========================================================================
 * [역할] 비무에 출전하여 내력을 소모하며 사자성어 초식을 격파하는 주체.
 * [책임] 자신의 내력(HP)을 스스로 관리하고 주화입마(走火入魔) 상태를 자율적으로 판별한다.
 */
class Challenger {
  constructor(maxHp = 3) {
    this._maxHp = maxHp;
    this._hp = maxHp;
  }

  // 메시지 수신: 내상을 입다 (내력 1 차감)
  sufferDamage() {
    if (this._hp > 0) {
      this._hp--;
    }
    return this.isQiDeviated();
  }

  // 자율적 판별: 주화입마 상태인가? (내력이 0 이하인가?)
  isQiDeviated() {
    return this._hp <= 0;
  }

  // 기운 회복 (새 비무 시작 시)
  recover() {
    this._hp = this._maxHp;
  }

  get hp() {
    return this._hp;
  }

  get maxHp() {
    return this._maxHp;
  }
}

/**
 * =========================================================================
 * 2. 도메인 모델: Judge (무림 판정관)
 * =========================================================================
 * [역할] 비무의 성패를 기록하고 점수, 콤보, 최종 무림 경지를 공정하게 채점하는 심판.
 * [책임] 정답/오답에 따른 콤보와 내공 점수를 누적하고, 최종 무림 서열(티어)을 판정한다.
 */
class Judge {
  constructor() {
    this.reset();
  }

  reset() {
    this._score = 0;
    this._combo = 0;
    this._maxCombo = 0;
    this._correctCount = 0;
  }

  // 메시지: 정답 초식 격파 성공
  recordSuccess(timeLeft) {
    this._combo++;
    if (this._combo > this._maxCombo) {
      this._maxCombo = this._combo;
    }
    this._correctCount++;

    const baseScore = 100;
    const timeBonus = Math.floor(timeLeft * 10);
    const comboBonus = this._combo * 30;
    const earned = baseScore + timeBonus + comboBonus;
    this._score += earned;
    return earned;
  }

  // 메시지: 오답 또는 지체(시간 초과)로 연환초식 끊김
  recordFailure() {
    this._combo = 0;
  }

  // 최종 무림 경지(서열) 판정
  determineTier(isQiDeviated) {
    if (isQiDeviated) {
      return {
        badge: '주화입마(走火入魔)',
        sub: '강호 퇴장',
        title: '삼류 무사 (장터 왈패)',
        titleColor: '#8b2626',
        desc: '무리하게 내공을 끌어올리다 주화입마에 빠져 기경팔맥이 뒤틀렸소! 주막 점소이의 빗자루질에도 맥없이 쫓겨날 지경이니, 산속에 틀어박혀 기초부터 다시 정진하시오.',
        isGameOver: true
      };
    }

    if (this._correctCount >= 9) {
      return {
        badge: '만류귀종 (萬流歸宗)',
        sub: '절정의 경지',
        title: '절정 고수 (絶頂) - 천하제일인',
        titleColor: '#b45309',
        desc: '무림 역사상 손에 꼽히는 절정의 기재로다! 강호의 모든 비급과 사자성어의 진리를 꿰뚫었으니, 천하를 호령할 자격이 충분하오.',
        isGameOver: false
      };
    } else if (this._correctCount >= 7) {
      return {
        badge: '명문대협 (名門大俠)',
        sub: '고수의 경지',
        title: '일류 고수 (문파 장문인급)',
        titleColor: '#a72323',
        desc: '강호의 거센 풍파를 꿰뚫어 보는 혜안을 지녔소! 웬만한 사파 무리의 간계는 그대의 일도양단에 맥없이 무너질 것이며, 천하에 그대의 무명이 널리 울려 퍼지리라.',
        isGameOver: false
      };
    } else if (this._correctCount >= 5) {
      return {
        badge: '초출강호 (初出江湖)',
        sub: '정진의 경지',
        title: '이류 고수 (문파 외문 제자)',
        titleColor: '#2563eb',
        desc: '기본적인 무학의 토대는 닦았으나, 아직 실전 비무에서 방심하면 큰 내상을 입을 수 있소. 각골난망의 마음가짐으로 비급을 더 탐독하시오.',
        isGameOver: false
      };
    } else {
      return {
        badge: '기초 미달',
        sub: '수련 필요',
        title: '장터 왈패 (초립동이)',
        titleColor: '#6b7280',
        desc: '강호의 사자성어를 모른 채 돌아다니다간 동귀어진의 뜻도 모른 채 남의 자폭에 휘말릴 것이오! 당장 장원급제 서당이나 문파의 잡역부로 들어가 한문 공부부터 시작하시오.',
        isGameOver: false
      };
    }
  }

  get score() { return this._score; }
  get combo() { return this._combo; }
  get maxCombo() { return this._maxCombo; }
  get correctCount() { return this._correctCount; }
}

/**
 * =========================================================================
 * 3. 도메인 모델: ScrollVault (비급서 보관소)
 * =========================================================================
 * [역할] 강호에 전해지는 30대 사자성어 비급을 안전하게 보관하고 관리하는 서고.
 * [책임] 10개 문제를 무작위 엄선하고, 매 판마다 동적으로 4지선다 오답 보기를 직조한다.
 */
class ScrollVault {
  constructor(fallbackBank = []) {
    this._fallbackBank = fallbackBank;
    this._bank = [];
  }

  // 비동기 비급서 문제 은행 로드 (실패 시 내장 백업 비급서로 대체)
  async loadFromRemote(url = 'data/questions.json') {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        this._bank = data;
        return true;
      }
    } catch (err) {
      console.warn('비급서 원격 로드 실패, 내장 백업 비급서로 대체합니다:', err.message);
      this._bank = [...this._fallbackBank];
    }
    return false;
  }

  get activeBank() {
    return this._bank.length > 0 ? this._bank : this._fallbackBank;
  }

  // 비무용 10대 비급 무작위 선별
  drawExamScrolls(count = 10) {
    const pool = [...this.activeBank];
    return this._shuffle(pool).slice(0, count);
  }

  // 동적 4지선다 보기 생성 (정답 외 3개 오답을 전체 풀에서 무작위 추출)
  createDynamicOptions(targetItem) {
    const others = this.activeBank.filter(item => item.hangul !== targetItem.hangul);
    const distractors = this._shuffle(others)
      .slice(0, 3)
      .map(item => ({ hangul: item.hangul, hanja: item.hanja }));

    const correctOption = { hangul: targetItem.hangul, hanja: targetItem.hanja };
    return this._shuffle([correctOption, ...distractors]);
  }

  // Fisher-Yates 셔플 알고리즘
  _shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

/**
 * =========================================================================
 * 4. 도메인 모델: IncenseTimer (향불 시간관리자)
 * =========================================================================
 * [역할] 초식이 전개되는 동안 타들어 가는 향불(15초)의 시간을 계측하는 모래시계.
 * [책임] 1초마다 남은 시간을 알리고, 시간이 다하면 타임아웃 메시지를 발행한다.
 */
class IncenseTimer {
  constructor(duration = 15) {
    this._duration = duration;
    this._timeLeft = duration;
    this._intervalId = null;
    this._isPaused = false;
  }

  ignite(onTick, onTimeout) {
    this.extinguish();
    this._timeLeft = this._duration;
    this._isPaused = false;

    if (onTick) onTick(this._timeLeft, this.progressRatio);

    this._intervalId = setInterval(() => {
      if (this._isPaused) return;

      this._timeLeft -= 0.1;
      if (this._timeLeft < 0) this._timeLeft = 0;

      if (onTick) onTick(this._timeLeft, this.progressRatio);

      if (this._timeLeft <= 0) {
        this.extinguish();
        if (onTimeout) onTimeout();
      }
    }, 100);
  }

  pause() {
    this._isPaused = true;
  }

  resume() {
    this._isPaused = false;
  }

  extinguish() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  get timeLeft() {
    return Math.max(0, this._timeLeft);
  }

  get progressRatio() {
    return Math.max(0, Math.min(1, this._timeLeft / this._duration));
  }

  get isPaused() {
    return this._isPaused;
  }
}

/**
 * =========================================================================
 * 5. 프레젠테이션 모델: BigeupPavilion (무림맹 비급각 도감)
 * =========================================================================
 * [역할] 30대 사자성어의 출처와 주해, 인체 비율 초식 실루엣을 펼쳐 보여주는 양면 서책 모달.
 * [책임] 좌측 목차 및 우측 상세 주해 페이지를 렌더링하고 모달 열림/닫힘 상태를 제어한다.
 */
class BigeupPavilion {
  constructor(vault) {
    this._vault = vault;
    this._selectedIdx = 0;
    this._modalEl = null;
    this._leftListEl = null;
    this._rightDetailEl = null;
    this._pageNumEl = null;
    this._stanceImages = [
      'assets/stance_thrust.png',
      'assets/stance_slash.png',
      'assets/stance_guard.png'
    ];
  }

  bindElements() {
    this._modalEl = document.getElementById('bigeupModal');
    this._leftListEl = document.getElementById('bigeupLeftList');
    this._rightDetailEl = document.getElementById('bigeupRightDetail');
    this._pageNumEl = document.getElementById('bigeupPageNum');
  }

  open() {
    this.bindElements();
    this.render();
    this._modalEl?.classList.add('show');
  }

  close() {
    this._modalEl?.classList.remove('show');
  }

  isOpen() {
    return this._modalEl?.classList.contains('show') || false;
  }

  render() {
    const scrolls = this._vault.activeBank;
    if (!this._leftListEl || scrolls.length === 0) return;

    // 좌측 목차 렌더링
    this._leftListEl.innerHTML = scrolls.map((item, idx) => `
      <button class="idiom-nav-item ${idx === this._selectedIdx ? 'active' : ''}" onclick="selectBigeupItem(${idx}, true)" data-idx="${idx}">
        <span class="idiom-nav-title">${idx + 1}. ${item.hangul}</span>
        <span class="idiom-nav-hanja">${item.hanja}</span>
      </button>
    `).join('');

    this.selectScroll(this._selectedIdx, false);
  }

  selectScroll(idx, playSound = false) {
    const scrolls = this._vault.activeBank;
    if (idx < 0 || idx >= scrolls.length) idx = 0;
    this._selectedIdx = idx;

    const item = scrolls[idx];
    const stanceImg = this._stanceImages[idx % this._stanceImages.length];

    // 목차 버튼 활성화 토글
    const navItems = document.querySelectorAll('#bigeupLeftList .idiom-nav-item');
    navItems.forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });

    // 우측 상단 페이지 번호
    if (this._pageNumEl) {
      this._pageNumEl.textContent = `초식 ${idx + 1} / ${scrolls.length}`;
    }

    // 우측 상세 풀이 및 투명 PNG 실루엣 삽화 렌더링
    if (this._rightDetailEl) {
      this._rightDetailEl.innerHTML = `
        <div class="detail-head">
          <span class="detail-badge">${item.category}</span>
          <div class="detail-title-row">
            <span class="detail-hangul">${item.hangul}</span>
            <span class="detail-hanja">${item.hanja}</span>
          </div>
        </div>

        <div>
          <div class="detail-section-title">🏮 비급 주해 (註解)</div>
          <div class="detail-box">${item.explanation}</div>
        </div>

        <!-- 실물 인체 비율 초식 실루엣 (투명 PNG) -->
        <div class="stance-silhouette-wrapper">
          <img class="stance-silhouette-img" src="${stanceImg}" alt="초식 그림자" />
        </div>

        <div class="detail-seal" title="무림맹 인증 비전 낙관">秘傳</div>
      `;

      this._rightDetailEl.style.animation = 'none';
      void this._rightDetailEl.offsetWidth;
      this._rightDetailEl.style.animation = 'fadeIn 0.25s ease';
    }

    if (playSound && typeof WuxiaAudio !== 'undefined' && WuxiaAudio.playStamp) {
      WuxiaAudio.playStamp();
    }
  }
}

/**
 * =========================================================================
 * 6. 프레젠테이션 모델: ArenaPresenter (비무장 뷰 / 연출가)
 * =========================================================================
 * [역할] 도메인 객체들의 상태와 행동 결과를 브라우저 화면(DOM)에 구현하는 장내 진행자.
 * [책임] 화면 전환, 문제/보기 렌더링, HP 구슬, 낙관 도장, 진동 효과를 전담한다.
 */
class ArenaPresenter {
  constructor() {
    this._scrollFrame = document.getElementById('scrollFrame');
    this._container = document.getElementById('gameContainer');
    this._hpContainer = document.getElementById('hpContainer');
    this._timerBar = document.getElementById('timerBar');
    this._stampOverlay = document.getElementById('stampOverlay');
    this._explanationBox = document.getElementById('explanationBox');
    this._explanationText = document.getElementById('explanationText');
    this._nextBtn = document.getElementById('nextBtn');
    this._toast = document.getElementById('toast');
    this._confirmModal = document.getElementById('confirmModal');
  }

  // 화면 전환 (시작 화면 ↔ 시험장 족자 ↔ 성적표)
  switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId)?.classList.add('active');

    // 시작 화면일 때만 강호 방판(목제 게시판) 테마 적용
    if (screenId === 'startScreen') {
      this._container?.classList.add('wide-mode');
      this._scrollFrame?.classList.add('board-mode');
    } else {
      this._container?.classList.remove('wide-mode');
      this._scrollFrame?.classList.remove('board-mode');
    }
  }

  // 내력(HP) 구슬 상태 갱신
  renderHp(currentHp, maxHp = 3) {
    if (!this._hpContainer) return;
    this._hpContainer.innerHTML = '';
    for (let i = 0; i < maxHp; i++) {
      const orb = document.createElement('div');
      orb.className = 'orb' + (i >= currentHp ? ' broken' : '');
      this._hpContainer.appendChild(orb);
    }
  }

  // 향불 타이머 진행 바 갱신
  updateTimerBar(progressRatio) {
    if (this._timerBar) {
      this._timerBar.style.width = (progressRatio * 100) + '%';
    }
  }

  // 초식 문제 및 동적 4지선다 보기 출력
  renderQuestion(q, currentIdx, totalCount, score, combo, options, onSelectOption) {
    document.getElementById('questionNum').textContent = `${currentIdx + 1} / ${totalCount}`;
    document.getElementById('qCategory').textContent = q.category;
    document.getElementById('qText').textContent = q.question;
    document.getElementById('scoreText').textContent = `${score} 점`;

    // 콤보 배지 연출
    const comboBadge = document.getElementById('comboBadge');
    if (comboBadge) {
      if (combo >= 2) {
        comboBadge.style.display = 'inline-block';
        comboBadge.textContent = `⚡ ${combo}연환초식!`;
      } else {
        comboBadge.style.display = 'none';
      }
    }

    // 도장 및 주해 박스 숨김 초기화
    this._stampOverlay?.classList.remove('show');
    this._explanationBox?.classList.remove('show');
    if (this._nextBtn) this._nextBtn.style.display = 'none';

    // 4지선다 보기 버튼 생성
    const grid = document.getElementById('optionsGrid');
    if (grid) {
      grid.innerHTML = '';
      options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
          <span class="option-hanja">${opt.hanja}</span>
          <span class="option-hangul">${idx + 1}. ${opt.hangul}</span>
        `;
        btn.onclick = () => onSelectOption(opt.hangul, btn);
        grid.appendChild(btn);
      });
    }
  }

  // 답안 제출 후 피드백 연출 (정답/오답, 도장, 진동)
  showAnswerFeedback(isCorrect, selectedBtn, correctHangul, explanation, score) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
      selectedBtn?.classList.add('correct');
      this._showStamp('通過', '#10b981');
    } else {
      selectedBtn?.classList.add('wrong');
      this._showStamp('內傷', 'var(--stamp-red)');
      this.shakeScreen();

      // 정답 보기 하이라이트
      buttons.forEach(btn => {
        if (btn.querySelector('.option-hangul')?.textContent.includes(correctHangul)) {
          btn.classList.add('correct');
        }
      });
    }

    if (this._explanationText) this._explanationText.textContent = explanation;
    this._explanationBox?.classList.add('show');
    document.getElementById('scoreText').textContent = `${score} 점`;
  }

  // 시간 초과 시 피드백 연출
  showTimeoutFeedback(correctHangul, explanation) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.querySelector('.option-hangul')?.textContent.includes(correctHangul)) {
        btn.classList.add('correct');
      }
    });

    this._showStamp('遲滯', '#d97706');
    this.shakeScreen();

    if (this._explanationText) this._explanationText.textContent = `[시간 초과] ${explanation}`;
    this._explanationBox?.classList.add('show');
  }

  enableNextButton() {
    if (this._nextBtn) this._nextBtn.style.display = 'block';
  }

  _showStamp(text, color) {
    if (this._stampOverlay) {
      this._stampOverlay.textContent = text;
      this._stampOverlay.style.color = color;
      this._stampOverlay.style.borderColor = color;
      this._stampOverlay.classList.add('show');
    }
  }

  shakeScreen() {
    if (this._scrollFrame) {
      this._scrollFrame.classList.remove('shake');
      void this._scrollFrame.offsetWidth;
      this._scrollFrame.classList.add('shake');
    }
  }

  // 최종 성적표 렌더링
  renderResult(tierResult, correctCount, maxCombo, score) {
    this.switchScreen('resultScreen');

    document.getElementById('statCorrect').textContent = `${correctCount} / 10`;
    document.getElementById('statCombo').textContent = `${maxCombo} 콤보`;
    document.getElementById('statScore').textContent = `${score} 점`;

    const tierBadge = document.getElementById('resultBadge');
    const tierSub = document.getElementById('tierSub');
    const tierTitle = document.getElementById('tierTitle');
    const tierDesc = document.getElementById('tierDesc');

    if (tierBadge) tierBadge.textContent = tierResult.badge;
    if (tierSub) tierSub.textContent = tierResult.sub;
    if (tierTitle) {
      tierTitle.textContent = tierResult.title;
      tierTitle.style.color = tierResult.titleColor;
    }
    if (tierDesc) tierDesc.textContent = tierResult.desc;
  }

  showToast(msg) {
    if (!this._toast) return;
    this._toast.textContent = msg;
    this._toast.classList.add('show');
    setTimeout(() => {
      this._toast.classList.remove('show');
    }, 2400);
  }

  openConfirmModal() {
    this._confirmModal?.classList.add('show');
  }

  closeConfirmModal() {
    this._confirmModal?.classList.remove('show');
  }

  isConfirmModalOpen() {
    return this._confirmModal?.classList.contains('show') || false;
  }
}

/**
 * =========================================================================
 * 7. 총괄 파사드: WuxiaExamGame (무림 시험관)
 * =========================================================================
 * [역할] 협객, 판정관, 비급 보관소, 타이머, 뷰 사이의 협력을 지휘하는 비무 총괄자.
 * [책임] 비무 시작, 답안 제출 검증, 초식 전환, 게임 종료의 전체 수명주기를 조율한다.
 */
class WuxiaExamGame {
  constructor() {
    this.vault = new ScrollVault(FALLBACK_BANK);
    this.challenger = new Challenger(3);
    this.judge = new Judge();
    this.timer = new IncenseTimer(15);
    this.presenter = null;
    this.pavilion = null;

    this._examScrolls = [];
    this._currentIdx = 0;
    this._isAnswering = false;
  }

  async init() {
    this.presenter = new ArenaPresenter();
    this.pavilion = new BigeupPavilion(this.vault);

    // 원격 비급서 로드
    await this.vault.loadFromRemote('data/questions.json');
    this.pavilion.bindElements();
  }

  // 비무 시작
  startExam() {
    if (typeof WuxiaAudio !== 'undefined') {
      WuxiaAudio.init();
      WuxiaAudio.playSword();
    }

    this.challenger.recover();
    this.judge.reset();
    this._examScrolls = this.vault.drawExamScrolls(10);
    this._currentIdx = 0;
    this._isAnswering = false;

    this.presenter.renderHp(this.challenger.hp, this.challenger.maxHp);
    this.presenter.switchScreen('quizScreen');

    this.loadCurrentQuestion();
  }

  // 현재 초식 출제
  loadCurrentQuestion() {
    this._isAnswering = false;
    const q = this._examScrolls[this._currentIdx];
    const options = this.vault.createDynamicOptions(q);

    this.presenter.renderQuestion(
      q,
      this._currentIdx,
      this._examScrolls.length,
      this.judge.score,
      this.judge.combo,
      options,
      (selectedHangul, btn) => this.submitAnswer(selectedHangul, btn)
    );

    // 향불에 불을 붙여 15초 계측 시작
    this.timer.ignite(
      (timeLeft, ratio) => this.presenter.updateTimerBar(ratio),
      () => this.handleTimeout()
    );
  }

  // 답안 제출 및 협력 진행
  submitAnswer(selectedHangul, btn) {
    if (this._isAnswering) return;
    this._isAnswering = true;
    this.timer.extinguish();

    const q = this._examScrolls[this._currentIdx];
    const isCorrect = (selectedHangul === q.hangul);

    if (isCorrect) {
      this.judge.recordSuccess(this.timer.timeLeft);
      this.presenter.showAnswerFeedback(true, btn, q.hangul, q.explanation, this.judge.score);
      WuxiaAudio?.playSword();
    } else {
      this.judge.recordFailure();
      this.challenger.sufferDamage();
      this.presenter.renderHp(this.challenger.hp, this.challenger.maxHp);
      this.presenter.showAnswerFeedback(false, btn, q.hangul, q.explanation, this.judge.score);
      WuxiaAudio?.playHit();
    }

    // 주화입마 여부 판단 (체력 0 소진)
    if (this.challenger.isQiDeviated()) {
      setTimeout(() => this.finishExam(true), 1200);
      return;
    }

    this.presenter.enableNextButton();
  }

  // 시간 초과 처리
  handleTimeout() {
    if (this._isAnswering) return;
    this._isAnswering = true;

    const q = this._examScrolls[this._currentIdx];
    this.judge.recordFailure();
    this.challenger.sufferDamage();
    this.presenter.renderHp(this.challenger.hp, this.challenger.maxHp);
    this.presenter.showTimeoutFeedback(q.hangul, q.explanation);
    WuxiaAudio?.playHit();

    if (this.challenger.isQiDeviated()) {
      setTimeout(() => this.finishExam(true), 1200);
      return;
    }

    this.presenter.enableNextButton();
  }

  // 다음 초식으로 전진
  proceedNext() {
    this._currentIdx++;
    if (this._currentIdx >= this._examScrolls.length) {
      this.finishExam(false);
    } else {
      this.loadCurrentQuestion();
    }
  }

  // 비무 종료 및 성적표 발급
  finishExam(isGameOver) {
    this.timer.extinguish();
    const tierResult = this.judge.determineTier(isGameOver);

    if (isGameOver) {
      WuxiaAudio?.playHit();
    } else {
      WuxiaAudio?.playGong();
    }

    this.presenter.renderResult(
      tierResult,
      this.judge.correctCount,
      this.judge.maxCombo,
      this.judge.score
    );
  }

  // 강호 퇴각 (장터로 퇴각 요청)
  requestExit() {
    this.timer.pause();
    this.presenter.openConfirmModal();
  }

  cancelExit() {
    this.presenter.closeConfirmModal();
    if (!this.pavilion.isOpen()) {
      this.timer.resume();
    }
  }

  confirmExit() {
    this.presenter.closeConfirmModal();
    this.timer.extinguish();
    this._isAnswering = false;
    this.presenter.switchScreen('startScreen');
  }

  // 성적표 공유
  shareResult() {
    const tier = document.getElementById('tierTitle')?.textContent || '무림 고수';
    const text = `[사자무림 : 무림 사자성어 퀴즈 성적표]\n📜 나의 무림 경지: ${tier}\n⚔️ 격파 초식: ${this.judge.correctCount}/10\n⚡ 최대 연타: ${this.judge.maxCombo} 연환초식\n✨ 획득 무공 점수: ${this.judge.score}점\n\n그대도 사자성어로 무림을 제패해보시오!\n👉 지금 비급 시험 치르기`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.presenter.showToast('성적표가 복사되었소! 카톡이나 강호에 붙여넣으시오.');
      }).catch(() => {
        this._fallbackCopy(text);
      });
    } else {
      this._fallbackCopy(text);
    }
  }

  _fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    this.presenter.showToast('성적표가 복사되었소!');
  }
}

// =========================================================================
// 8. 전역 인스턴스 생성 및 HTML 인라인 이벤트 연동 브릿지(Bridge)
// =========================================================================
const gameInstance = new WuxiaExamGame();

// HTML 버튼 인라인 핸들러 위임
function startGame() { gameInstance.startExam(); }
function nextQuestion() { gameInstance.proceedNext(); }
function goToStartScreen() { gameInstance.requestExit(); }
function closeConfirmModal() { gameInstance.cancelExit(); }
function confirmExitToStart() { gameInstance.confirmExit(); }
function restartGame() { gameInstance.startExam(); }
function shareResult() { gameInstance.shareResult(); }

// 비급각 모달 핸들러 위임
function openBigeupModal() {
  gameInstance.timer.pause();
  gameInstance.pavilion.open();
}
function closeBigeupModal() {
  gameInstance.pavilion.close();
  if (!gameInstance.presenter.isConfirmModalOpen()) {
    gameInstance.timer.resume();
  }
}
function selectBigeupItem(idx, playSound) {
  gameInstance.pavilion.selectScroll(idx, playSound);
}

// 동종/풍경 음향 토글 핸들러
function handleSoundToggle() {
  const isEnabled = WuxiaAudio.toggleSound();
  const soundText = document.getElementById('soundText');
  const soundWrapper = document.getElementById('soundIconWrapper');

  if (isEnabled) {
    if (soundText) soundText.textContent = '음향 켬';
    if (soundWrapper) {
      soundWrapper.innerHTML = `
        <svg class="header-icon-svg" id="soundSvg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 3C8.5 3 6 5.8 6 9.5V15l-2 2.5V19h16v-1.5l-2-2.5V9.5C18 5.8 15.5 3 12 3z"/>
          <path d="M10 20a2 2 0 0 0 4 0"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
        </svg>
      `;
    }
    gameInstance.presenter?.showToast('풍경(음향)을 울렸소.');
  } else {
    if (soundText) soundText.textContent = '음향 끔';
    if (soundWrapper) {
      soundWrapper.innerHTML = `
        <svg class="header-icon-svg" id="soundSvg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 3C8.5 3 6 5.8 6 9.5V15l-2 2.5V19h16v-1.5l-2-2.5V9.5C18 5.8 15.5 3 12 3z"/>
          <path d="M10 20a2 2 0 0 0 4 0"/>
          <line x1="2" y1="2" x2="22" y2="22" stroke="#a32222" stroke-width="2.2"/>
        </svg>
      `;
    }
    gameInstance.presenter?.showToast('풍경(음향)을 멎게 하였소.');
  }
}

// 페이지 로드 시 도메인 객체 초기화 및 이벤트 리스너 등록
window.addEventListener('DOMContentLoaded', () => {
  gameInstance.init();

  // 모달 바깥 어두운 배경 클릭 시 닫기
  document.getElementById('bigeupModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'bigeupModal') closeBigeupModal();
  });
  document.getElementById('confirmModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'confirmModal') closeConfirmModal();
  });

  // ESC 키로 열린 모달 닫기
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (gameInstance.pavilion?.isOpen()) {
        closeBigeupModal();
      } else if (gameInstance.presenter?.isConfirmModalOpen()) {
        closeConfirmModal();
      }
    }
  });
});
