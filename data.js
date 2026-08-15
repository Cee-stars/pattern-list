/*
 * 構文辞書アプリ - 見出しデータ
 *
 * 1件の構造:
 *   id     : 一意なID
 *   pattern: 構文の見出し（検索の主キー）
 *   jp     : 日本語の意味
 *   cat    : カテゴリ
 *   level  : 基本 / 標準 / 発展
 *   ex     : 例文 [{ en, ja }]
 *   note   : 補足・注意点
 *   keys   : 検索用の別名・関連語（表示はしないが検索対象）
 *
 * 文字列はすべてダブルクォート。文字列内にダブルクォートは入れない。
 */

const CATEGORIES = [
  "不定詞",
  "動名詞",
  "分詞",
  "関係詞",
  "比較",
  "仮定法",
  "接続詞・副詞節",
  "強調・倒置・省略",
  "助動詞",
  "名詞構文・無生物主語"
];

const ENTRIES = [
  /* ===================== 不定詞 ===================== */
  {
    id: "inf-01",
    pattern: "It is ~ for A to do",
    jp: "Aが…するのは〜だ",
    cat: "不定詞",
    level: "基本",
    ex: [
      { en: "It is difficult for children to sit still.", ja: "子どもがじっと座っているのは難しい。" },
      { en: "It was impossible for us to finish it in a day.", ja: "私たちがそれを一日で終えるのは不可能だった。" }
    ],
    note: "It は形式主語（仮主語）で、真主語は to do。for A は to do の意味上の主語。",
    keys: ["形式主語", "仮主語", "意味上の主語", "to不定詞"]
  },
  {
    id: "inf-02",
    pattern: "It is ~ of A to do",
    jp: "…するとはAは〜だ",
    cat: "不定詞",
    level: "標準",
    ex: [
      { en: "It is kind of you to say so.", ja: "そう言ってくださるとはご親切に。" },
      { en: "It was careless of him to leave the door open.", ja: "ドアを開けっ放しにするとは彼は不注意だった。" }
    ],
    note: "kind, nice, careless, foolish, wise など「人の性質」を表す形容詞のときは of を使う。A is kind to say so. と書き換え可能。",
    keys: ["人の性質", "of", "形式主語", "書き換え"]
  },
  {
    id: "inf-03",
    pattern: "too ~ to do",
    jp: "〜すぎて…できない",
    cat: "不定詞",
    level: "基本",
    ex: [
      { en: "He was too tired to walk any farther.", ja: "彼は疲れすぎてそれ以上歩けなかった。" },
      { en: "This coffee is too hot for me to drink.", ja: "このコーヒーは熱すぎて私には飲めない。" }
    ],
    note: "so ~ that ... cannot に書き換え可能。He was so tired that he could not walk any farther.",
    keys: ["too to", "so that 書き換え", "程度"]
  },
  {
    id: "inf-04",
    pattern: "~ enough to do",
    jp: "…するのに十分〜だ／〜なので…できる",
    cat: "不定詞",
    level: "基本",
    ex: [
      { en: "She is old enough to drive a car.", ja: "彼女は車を運転できる年齢だ。" },
      { en: "He was kind enough to show me the way.", ja: "彼は親切にも道を教えてくれた。" }
    ],
    note: "enough は形容詞・副詞の後ろに置く（× enough old）。so ~ that ... can に書き換え可能。",
    keys: ["enough", "so that 書き換え", "語順"]
  },
  {
    id: "inf-05",
    pattern: "in order to do / so as to do",
    jp: "…するために（目的）",
    cat: "不定詞",
    level: "基本",
    ex: [
      { en: "He got up early in order to catch the first train.", ja: "彼は始発に乗るために早起きした。" },
      { en: "Speak slowly so as to be understood.", ja: "理解してもらえるようにゆっくり話しなさい。" }
    ],
    note: "否定は in order not to do / so as not to do。so as to は文頭に置けない。",
    keys: ["目的", "not to", "副詞的用法"]
  },
  {
    id: "inf-06",
    pattern: "only to do",
    jp: "…したが結局〜しただけだった（結果）",
    cat: "不定詞",
    level: "標準",
    ex: [
      { en: "He hurried to the station, only to find the train gone.", ja: "彼は駅へ急いだが、列車は行ってしまった後だった。" }
    ],
    note: "結果を表す副詞的用法。「意外・失望」のニュアンスを伴う。",
    keys: ["結果", "失望", "副詞的用法"]
  },
  {
    id: "inf-07",
    pattern: "never to do",
    jp: "そして二度と…しなかった（結果）",
    cat: "不定詞",
    level: "発展",
    ex: [
      { en: "He left his hometown, never to return.", ja: "彼は故郷を去り、二度と戻らなかった。" }
    ],
    note: "only to do と同じく結果用法。and never returned とほぼ同義。",
    keys: ["結果", "副詞的用法"]
  },
  {
    id: "inf-08",
    pattern: "seem to do / appear to do",
    jp: "…するようだ、…らしい",
    cat: "不定詞",
    level: "基本",
    ex: [
      { en: "He seems to know the truth.", ja: "彼は真実を知っているようだ。" },
      { en: "She seems to have been ill.", ja: "彼女は病気だったようだ。" }
    ],
    note: "It seems that S V に書き換え可能。to have done は主節より前の時制を表す。",
    keys: ["完了不定詞", "書き換え", "It seems that"]
  },
  {
    id: "inf-09",
    pattern: "be to do",
    jp: "予定・義務・可能・運命・意図",
    cat: "不定詞",
    level: "発展",
    ex: [
      { en: "The president is to visit Japan next week.", ja: "大統領は来週日本を訪問する予定だ。（予定）" },
      { en: "Not a sound was to be heard.", ja: "物音一つ聞こえなかった。（可能）" }
    ],
    note: "可能の意味は普通、否定文＋受動不定詞（be to be done）で使われる。If you are to do は「…するつもりなら」（意図）。",
    keys: ["be to 構文", "予定", "義務", "運命", "可能"]
  },
  {
    id: "inf-10",
    pattern: "All S have to do is (to) do",
    jp: "Sは…しさえすればよい",
    cat: "不定詞",
    level: "標準",
    ex: [
      { en: "All you have to do is press this button.", ja: "君はこのボタンを押しさえすればよい。" }
    ],
    note: "主語に do が含まれるため、補語の to は省略されるのが普通（原形不定詞）。",
    keys: ["原形不定詞", "関係代名詞what", "強調"]
  },
  {
    id: "inf-11",
    pattern: "have no choice but to do",
    jp: "…するより仕方がない",
    cat: "不定詞",
    level: "標準",
    ex: [
      { en: "We had no choice but to accept the offer.", ja: "私たちはその申し出を受け入れるより仕方がなかった。" }
    ],
    note: "cannot but do / cannot help doing とも近い。but は「〜以外に」の意味の前置詞。",
    keys: ["cannot but", "仕方がない", "but"]
  },
  {
    id: "inf-12",
    pattern: "It takes (A) 時間 to do",
    jp: "（Aが）…するのに〜かかる",
    cat: "不定詞",
    level: "基本",
    ex: [
      { en: "It takes ten minutes to walk to the station.", ja: "駅まで歩いて10分かかる。" },
      { en: "It took me three hours to finish the report.", ja: "報告書を仕上げるのに3時間かかった。" }
    ],
    note: "cost はお金、take は時間・労力。",
    keys: ["形式主語", "所要時間", "cost"]
  },
  {
    id: "inf-13",
    pattern: "make it a rule to do",
    jp: "…することにしている",
    cat: "不定詞",
    level: "標準",
    ex: [
      { en: "I make it a rule to take a walk before breakfast.", ja: "私は朝食前に散歩することにしている。" }
    ],
    note: "it は形式目的語。make a point of doing も同義。",
    keys: ["形式目的語", "習慣", "make a point of"]
  },
  {
    id: "inf-14",
    pattern: "know better than to do",
    jp: "…するほど愚かではない",
    cat: "不定詞",
    level: "発展",
    ex: [
      { en: "She knows better than to lend him money.", ja: "彼女は彼に金を貸すほど愚かではない。" }
    ],
    note: "直訳は「…するよりよく知っている」。than は比較の than。",
    keys: ["比較", "愚か", "慣用"]
  },
  {
    id: "inf-15",
    pattern: "so ~ as to do",
    jp: "…するほど〜だ／〜にも…する",
    cat: "不定詞",
    level: "発展",
    ex: [
      { en: "He was so kind as to carry my bag.", ja: "彼は親切にも私のかばんを運んでくれた。" }
    ],
    note: "Would you be so kind as to ...? は丁寧な依頼の定型表現。",
    keys: ["程度", "依頼", "慣用"]
  },
  {
    id: "inf-16",
    pattern: "S be said to do",
    jp: "Sは…すると言われている",
    cat: "不定詞",
    level: "標準",
    ex: [
      { en: "He is said to be the best pianist in Japan.", ja: "彼は日本一のピアニストだと言われている。" }
    ],
    note: "They say that S V / It is said that S V に書き換え可能。",
    keys: ["受動態", "書き換え", "It is said that"]
  },

  /* ===================== 動名詞 ===================== */
  {
    id: "ger-01",
    pattern: "There is no doing",
    jp: "…することはできない",
    cat: "動名詞",
    level: "標準",
    ex: [
      { en: "There is no telling what will happen next.", ja: "次に何が起こるかわからない。" },
      { en: "There is no accounting for tastes.", ja: "蓼食う虫も好き好き。" }
    ],
    note: "It is impossible to do / We cannot do に書き換え可能。",
    keys: ["不可能", "慣用", "書き換え"]
  },
  {
    id: "ger-02",
    pattern: "It is no use doing",
    jp: "…しても無駄だ",
    cat: "動名詞",
    level: "標準",
    ex: [
      { en: "It is no use crying over spilt milk.", ja: "覆水盆に返らず。" }
    ],
    note: "It is of no use to do / There is no use (in) doing とも書ける。",
    keys: ["無駄", "形式主語", "ことわざ"]
  },
  {
    id: "ger-03",
    pattern: "feel like doing",
    jp: "…したい気がする",
    cat: "動名詞",
    level: "基本",
    ex: [
      { en: "I do not feel like eating anything today.", ja: "今日は何も食べたい気がしない。" }
    ],
    note: "like は前置詞なので後ろは動名詞。",
    keys: ["前置詞", "願望"]
  },
  {
    id: "ger-04",
    pattern: "cannot help doing",
    jp: "…せずにはいられない",
    cat: "動名詞",
    level: "標準",
    ex: [
      { en: "I could not help laughing at his joke.", ja: "彼の冗談に笑わずにはいられなかった。" }
    ],
    note: "cannot but do / cannot help but do も同義。help は「避ける」の意味。",
    keys: ["cannot but", "感情", "慣用"]
  },
  {
    id: "ger-05",
    pattern: "on doing",
    jp: "…するとすぐに",
    cat: "動名詞",
    level: "標準",
    ex: [
      { en: "On arriving at the station, he called me.", ja: "駅に着くとすぐ彼は私に電話をくれた。" }
    ],
    note: "As soon as S V に書き換え可能。in doing は「…するときに」。",
    keys: ["as soon as", "時", "前置詞"]
  },
  {
    id: "ger-06",
    pattern: "be worth doing",
    jp: "…する価値がある",
    cat: "動名詞",
    level: "標準",
    ex: [
      { en: "This book is worth reading twice.", ja: "この本は二度読む価値がある。" }
    ],
    note: "動名詞は能動形だが意味は受動（× worth being read）。主語が動名詞の目的語になる。",
    keys: ["能動形受動", "価値", "worth"]
  },
  {
    id: "ger-07",
    pattern: "look forward to doing",
    jp: "…するのを楽しみに待つ",
    cat: "動名詞",
    level: "基本",
    ex: [
      { en: "I am looking forward to seeing you again.", ja: "またお会いできるのを楽しみにしています。" }
    ],
    note: "この to は前置詞なので動名詞（× to see）。",
    keys: ["to 前置詞", "頻出ミス"]
  },
  {
    id: "ger-08",
    pattern: "be used to doing",
    jp: "…することに慣れている",
    cat: "動名詞",
    level: "標準",
    ex: [
      { en: "She is used to speaking in public.", ja: "彼女は人前で話すことに慣れている。" }
    ],
    note: "used to do（以前は…したものだ）と混同しない。get used to doing は「慣れる」。",
    keys: ["used to", "to 前置詞", "混同注意"]
  },
  {
    id: "ger-09",
    pattern: "never ~ without doing",
    jp: "〜すれば必ず…する",
    cat: "動名詞",
    level: "発展",
    ex: [
      { en: "He never sees me without complaining.", ja: "彼は私に会うと必ず不平を言う。" }
    ],
    note: "二重否定による強い肯定。whenever S V ... に書き換え可能。",
    keys: ["二重否定", "強調", "whenever"]
  },
  {
    id: "ger-10",
    pattern: "spend 時間・お金 (in) doing",
    jp: "…して時間・お金を費やす",
    cat: "動名詞",
    level: "基本",
    ex: [
      { en: "He spent all day preparing for the exam.", ja: "彼は一日中試験の準備に費やした。" }
    ],
    note: "in は普通省略される。waste も同じ型をとる。",
    keys: ["waste", "in 省略"]
  },
  {
    id: "ger-11",
    pattern: "remember / forget doing と to do",
    jp: "…したことを覚えている／…するのを覚えている",
    cat: "動名詞",
    level: "標準",
    ex: [
      { en: "I remember locking the door.", ja: "ドアに鍵をかけたのを覚えている。（過去）" },
      { en: "Remember to lock the door.", ja: "忘れずにドアに鍵をかけて。（これから）" }
    ],
    note: "doing は既にしたこと、to do はこれからすること。regret, try, stop も同様の使い分け。",
    keys: ["regret", "try", "stop", "使い分け"]
  },
  {
    id: "ger-12",
    pattern: "It goes without saying that S V",
    jp: "…は言うまでもない",
    cat: "動名詞",
    level: "標準",
    ex: [
      { en: "It goes without saying that health is above wealth.", ja: "健康は富に勝ることは言うまでもない。" }
    ],
    note: "Needless to say, S V も同義。",
    keys: ["Needless to say", "慣用", "形式主語"]
  },

  /* ===================== 分詞 ===================== */
  {
    id: "par-01",
    pattern: "分詞構文（Doing ~, S V）",
    jp: "…して、…なので、…しながら",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "Walking along the street, I met an old friend.", ja: "通りを歩いていると、旧友に会った。" },
      { en: "Being tired, he went to bed early.", ja: "疲れていたので、彼は早く寝た。" }
    ],
    note: "接続詞＋S＋V を分詞に圧縮した形。時・理由・条件・譲歩・付帯状況を表す。",
    keys: ["現在分詞", "付帯状況", "理由", "時"]
  },
  {
    id: "par-02",
    pattern: "Having done ~, S V",
    jp: "…してしまったので／…した後で",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "Having finished my homework, I went out.", ja: "宿題を終えたので、私は出かけた。" }
    ],
    note: "完了分詞構文。主節より前の時を表す。受動は Having been done（Been は省略可）。",
    keys: ["完了分詞構文", "時制のずれ"]
  },
  {
    id: "par-03",
    pattern: "(Being) done ~, S V",
    jp: "…されて（受動の分詞構文）",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "Written in simple English, this book is easy to read.", ja: "平易な英語で書かれているので、この本は読みやすい。" }
    ],
    note: "Being / Having been は普通省略される。過去分詞で文が始まったら受動の分詞構文を疑う。",
    keys: ["過去分詞", "Being 省略", "受動"]
  },
  {
    id: "par-04",
    pattern: "with O doing / done",
    jp: "Oが…した状態で（付帯状況）",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "He was standing with his arms folded.", ja: "彼は腕を組んで立っていた。" },
      { en: "She fell asleep with the TV on.", ja: "彼女はテレビをつけたまま眠ってしまった。" }
    ],
    note: "O と分詞が能動関係なら doing、受動関係なら done。形容詞・副詞・前置詞句も来る。",
    keys: ["付帯状況", "with", "能動受動"]
  },
  {
    id: "par-05",
    pattern: "have / get O done",
    jp: "Oを…してもらう／…される",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "I had my hair cut yesterday.", ja: "私は昨日髪を切ってもらった。" },
      { en: "He had his wallet stolen on the train.", ja: "彼は電車で財布を盗まれた。" }
    ],
    note: "使役（〜してもらう）と被害（〜される）の両方。have O do は「人に…させる」。",
    keys: ["使役", "被害", "get O done"]
  },
  {
    id: "par-06",
    pattern: "keep / leave O doing (done)",
    jp: "Oを…させておく／…されたままにする",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "I am sorry to have kept you waiting.", ja: "お待たせしてすみません。" },
      { en: "Do not leave the water running.", ja: "水を出しっぱなしにしないで。" }
    ],
    note: "第5文型 SVOC の C に分詞が来る形。",
    keys: ["SVOC", "第5文型", "leave"]
  },
  {
    id: "par-07",
    pattern: "知覚動詞 + O + doing / done / do",
    jp: "Oが…するのを見る・聞く",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "I saw him crossing the street.", ja: "彼が通りを渡っているところを見た。（進行中）" },
      { en: "I heard my name called.", ja: "自分の名前が呼ばれるのが聞こえた。（受動）" }
    ],
    note: "原形＝動作の全体、doing＝進行中の一場面、done＝受動。受動態にすると to 不定詞が現れる（He was seen to cross ...）。",
    keys: ["see", "hear", "原形不定詞", "SVOC"]
  },
  {
    id: "par-08",
    pattern: "独立分詞構文（S being ~）",
    jp: "Sが…なので（主語が異なる分詞構文）",
    cat: "分詞",
    level: "発展",
    ex: [
      { en: "The weather being fine, we went on a picnic.", ja: "天気が良かったので、私たちはピクニックに行った。" }
    ],
    note: "分詞の意味上の主語が主節の主語と異なるとき、分詞の前に主語を置く。",
    keys: ["意味上の主語", "独立分詞構文"]
  },
  {
    id: "par-09",
    pattern: "慣用的分詞構文（generally speaking など）",
    jp: "一般的に言えば／…から判断すると",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "Generally speaking, women live longer than men.", ja: "一般的に言えば、女性は男性より長生きだ。" },
      { en: "Judging from his accent, he must be from Osaka.", ja: "なまりから判断すると、彼は大阪出身に違いない。" }
    ],
    note: "他に frankly speaking, strictly speaking, speaking of, considering, given などがある。",
    keys: ["judging from", "frankly speaking", "considering", "慣用"]
  },
  {
    id: "par-10",
    pattern: "分詞構文の否定（Not doing ~）",
    jp: "…しないので／…せずに",
    cat: "分詞",
    level: "標準",
    ex: [
      { en: "Not knowing what to say, he kept silent.", ja: "何と言えばよいかわからず、彼は黙っていた。" }
    ],
    note: "否定語 not / never は分詞の直前に置く。",
    keys: ["否定", "語順"]
  },

  /* ===================== 関係詞 ===================== */
  {
    id: "rel-01",
    pattern: "関係代名詞 who / which / that",
    jp: "…する（人・物）",
    cat: "関係詞",
    level: "基本",
    ex: [
      { en: "The man who lives next door is a doctor.", ja: "隣に住んでいる男性は医者だ。" },
      { en: "This is the book which I bought yesterday.", ja: "これが昨日私が買った本です。" }
    ],
    note: "目的格の関係代名詞は省略できる。主格は省略できない。",
    keys: ["主格", "目的格", "省略", "先行詞"]
  },
  {
    id: "rel-02",
    pattern: "前置詞 + 関係代名詞",
    jp: "…する（〜に／〜で）",
    cat: "関係詞",
    level: "標準",
    ex: [
      { en: "This is the house in which he was born.", ja: "これが彼の生まれた家だ。" },
      { en: "The person to whom I spoke was very kind.", ja: "私が話した人はとても親切だった。" }
    ],
    note: "前置詞を後ろに残すと口語的（the house which he was born in）。前置詞の直後に that は置けない。",
    keys: ["in which", "to whom", "格式", "that 不可"]
  },
  {
    id: "rel-03",
    pattern: "関係代名詞 what",
    jp: "…すること、…するもの",
    cat: "関係詞",
    level: "標準",
    ex: [
      { en: "What he said surprised us all.", ja: "彼が言ったことは私たち全員を驚かせた。" },
      { en: "This is not what I wanted.", ja: "これは私が欲しかったものではない。" }
    ],
    note: "先行詞を含む関係代名詞。the thing(s) which に等しい。名詞節を作る。",
    keys: ["先行詞を含む", "名詞節", "the thing which"]
  },
  {
    id: "rel-04",
    pattern: "what is called / what we call",
    jp: "いわゆる",
    cat: "関係詞",
    level: "標準",
    ex: [
      { en: "He is what is called a walking dictionary.", ja: "彼はいわゆる生き字引だ。" }
    ],
    note: "so-called と同義。挿入的に使われる。",
    keys: ["so-called", "いわゆる", "慣用"]
  },
  {
    id: "rel-05",
    pattern: "what S is / what S used to be",
    jp: "今のS／昔のS",
    cat: "関係詞",
    level: "発展",
    ex: [
      { en: "I owe what I am today to my parents.", ja: "今日の私があるのは両親のおかげだ。" },
      { en: "He is not what he used to be.", ja: "彼は昔の彼ではない。" }
    ],
    note: "what S has は「Sの財産」、what S is は「Sの人格」。",
    keys: ["what I am", "人格", "慣用"]
  },
  {
    id: "rel-06",
    pattern: "関係副詞 where / when / why / how",
    jp: "…する（場所・時・理由・方法）",
    cat: "関係詞",
    level: "標準",
    ex: [
      { en: "This is the town where I was born.", ja: "ここが私の生まれた町だ。" },
      { en: "Tell me the reason why you were late.", ja: "遅刻した理由を教えて。" }
    ],
    note: "関係副詞は「前置詞＋関係代名詞」に等しい（where = in which）。the way how とは言わない。",
    keys: ["where", "when", "why", "how", "前置詞+関係代名詞"]
  },
  {
    id: "rel-07",
    pattern: "the way S V",
    jp: "…する方法・仕方",
    cat: "関係詞",
    level: "標準",
    ex: [
      { en: "I do not like the way he talks.", ja: "私は彼の話し方が好きではない。" }
    ],
    note: "the way / how / the way in which のいずれかを使う。the way how は不可。",
    keys: ["how", "the way how 不可", "方法"]
  },
  {
    id: "rel-08",
    pattern: "非制限用法（, which / , who）",
    jp: "そしてそれは…、なぜならそれは…",
    cat: "関係詞",
    level: "標準",
    ex: [
      { en: "He failed the exam, which surprised everyone.", ja: "彼は試験に落ち、そのことが皆を驚かせた。" }
    ],
    note: "コンマ付きは追加説明。which は前文全体を先行詞にできる。that は非制限用法に使えない。",
    keys: ["コンマ", "継続用法", "that 不可", "文全体が先行詞"]
  },
  {
    id: "rel-09",
    pattern: "複合関係代名詞 whoever / whatever / whichever",
    jp: "…する人は誰でも／たとえ…でも",
    cat: "関係詞",
    level: "標準",
    ex: [
      { en: "Whoever comes will be welcome.", ja: "誰が来ても歓迎される。" },
      { en: "Whatever you say, I will not change my mind.", ja: "君が何を言おうと、私は考えを変えない。" }
    ],
    note: "名詞節（…する人・物は何でも）と譲歩の副詞節（たとえ…でも）の2用法。譲歩は no matter who/what に書き換え可能。",
    keys: ["no matter", "譲歩", "名詞節"]
  },
  {
    id: "rel-10",
    pattern: "複合関係副詞 wherever / whenever / however",
    jp: "…するところはどこでも／どんなに…でも",
    cat: "関係詞",
    level: "標準",
    ex: [
      { en: "However hard you try, you cannot beat him.", ja: "どんなに頑張っても彼には勝てない。" }
    ],
    note: "however の直後には形容詞・副詞が来る（however hard）。",
    keys: ["however", "語順", "譲歩"]
  },
  {
    id: "rel-11",
    pattern: "There is no one but ~",
    jp: "…しない人はいない",
    cat: "関係詞",
    level: "発展",
    ex: [
      { en: "There is no rule but has exceptions.", ja: "例外のない規則はない。" }
    ],
    note: "but は否定の意味を含む関係代名詞（that ... not）。古風で堅い表現。",
    keys: ["関係代名詞 but", "二重否定", "古風"]
  },
  {
    id: "rel-12",
    pattern: "such ~ as / the same ~ as",
    jp: "…するような〜／…と同じ〜",
    cat: "関係詞",
    level: "発展",
    ex: [
      { en: "Do not trust such a man as tells lies.", ja: "嘘をつくような男を信用するな。" },
      { en: "This is the same watch as I lost.", ja: "これは私がなくしたのと同じ型の時計だ。" }
    ],
    note: "the same ~ as は同種、the same ~ that は同一物を指す。",
    keys: ["擬似関係代名詞", "as", "same as"]
  },

  /* ===================== 比較 ===================== */
  {
    id: "cmp-01",
    pattern: "as ~ as A",
    jp: "Aと同じくらい〜",
    cat: "比較",
    level: "基本",
    ex: [
      { en: "He is as tall as his father.", ja: "彼は父親と同じくらい背が高い。" }
    ],
    note: "1つ目の as は副詞、2つ目は接続詞。間には原級（形容詞・副詞の原形）が入る。",
    keys: ["原級", "同等比較"]
  },
  {
    id: "cmp-02",
    pattern: "not as / so ~ as A",
    jp: "Aほど〜ではない",
    cat: "比較",
    level: "基本",
    ex: [
      { en: "This problem is not so difficult as that one.", ja: "この問題はあの問題ほど難しくない。" }
    ],
    note: "否定文では so ~ as も使える。「A の方が上」の含意になる。",
    keys: ["原級", "否定", "劣勢比較"]
  },
  {
    id: "cmp-03",
    pattern: "比較級 + than A",
    jp: "Aより〜だ",
    cat: "比較",
    level: "基本",
    ex: [
      { en: "She runs faster than I do.", ja: "彼女は私より速く走る。" }
    ],
    note: "比較級の強調は much, far, even, still, a lot（× very）。",
    keys: ["比較級", "much 強調", "than"]
  },
  {
    id: "cmp-04",
    pattern: "the 比較級 ~, the 比較級 ...",
    jp: "〜すればするほど…",
    cat: "比較",
    level: "標準",
    ex: [
      { en: "The more you read, the more you learn.", ja: "読めば読むほど学べる。" },
      { en: "The sooner, the better.", ja: "早ければ早いほどよい。" }
    ],
    note: "the は指示副詞。比較級を文頭に出すので語順に注意。",
    keys: ["比例", "語順", "指示副詞"]
  },
  {
    id: "cmp-05",
    pattern: "比較級 and 比較級",
    jp: "ますます〜",
    cat: "比較",
    level: "基本",
    ex: [
      { en: "It is getting colder and colder.", ja: "だんだん寒くなってきている。" },
      { en: "The city grew more and more crowded.", ja: "その街はますます混雑してきた。" }
    ],
    note: "長い形容詞は more and more + 原級。",
    keys: ["漸増", "more and more"]
  },
  {
    id: "cmp-06",
    pattern: "no more than / not more than",
    jp: "たった〜しかない／せいぜい〜",
    cat: "比較",
    level: "発展",
    ex: [
      { en: "He has no more than 100 yen.", ja: "彼は100円しか持っていない。（少ないと感じる）" },
      { en: "He has not more than 100 yen.", ja: "彼はせいぜい100円しか持っていない。（多くとも）" }
    ],
    note: "no more than = only、not more than = at most。no less than = as much as、not less than = at least。",
    keys: ["no less than", "at most", "at least", "only"]
  },
  {
    id: "cmp-07",
    pattern: "A is no more ~ than B is",
    jp: "AがBでないのと同様、Aは〜でない（クジラ構文）",
    cat: "比較",
    level: "発展",
    ex: [
      { en: "A whale is no more a fish than a horse is.", ja: "クジラが魚でないのは馬が魚でないのと同じだ。" }
    ],
    note: "両方を否定する。no less ~ than は「Bと同様にAも〜だ」と両方を肯定する。",
    keys: ["クジラ構文", "no less than", "両否定"]
  },
  {
    id: "cmp-08",
    pattern: "最上級相当表現（No other ~ is as ... as）",
    jp: "他のどれも〜ほど…ではない",
    cat: "比較",
    level: "標準",
    ex: [
      { en: "No other mountain in Japan is as high as Mt. Fuji.", ja: "日本で富士山ほど高い山はない。" },
      { en: "Nothing is more precious than time.", ja: "時間ほど貴重なものはない。" }
    ],
    note: "原級・比較級で最上級の意味を表す典型パターン。",
    keys: ["最上級", "書き換え", "Nothing is more"]
  },
  {
    id: "cmp-09",
    pattern: "all the 比較級 for / because",
    jp: "〜だからかえって一層…",
    cat: "比較",
    level: "発展",
    ex: [
      { en: "I like him all the better for his faults.", ja: "欠点があるからこそ、私は一層彼が好きだ。" }
    ],
    note: "none the 比較級 for は「〜にもかかわらず少しも…でない」。",
    keys: ["none the less", "理由", "慣用"]
  },
  {
    id: "cmp-10",
    pattern: "would rather A than B",
    jp: "BよりむしろAしたい",
    cat: "比較",
    level: "標準",
    ex: [
      { en: "I would rather stay home than go out.", ja: "外出するよりむしろ家にいたい。" }
    ],
    note: "A・B ともに原形。would rather S 過去形 は「Sが…してくれればよいのに」（仮定法）。",
    keys: ["原形", "願望", "prefer"]
  },
  {
    id: "cmp-11",
    pattern: "prefer A to B",
    jp: "BよりAを好む",
    cat: "比較",
    level: "基本",
    ex: [
      { en: "I prefer coffee to tea.", ja: "紅茶よりコーヒーが好きだ。" },
      { en: "She prefers walking to driving.", ja: "彼女は車より歩く方が好きだ。" }
    ],
    note: "than ではなく to を使う。動詞なら prefer to do rather than do。",
    keys: ["to", "than 不可", "頻出ミス"]
  },
  {
    id: "cmp-12",
    pattern: "as ~ as possible / as ~ as S can",
    jp: "できるだけ〜",
    cat: "比較",
    level: "基本",
    ex: [
      { en: "Please answer as soon as possible.", ja: "できるだけ早く返事をください。" }
    ],
    note: "as ~ as one can は主語と時制を一致させる（as fast as he could）。",
    keys: ["可能な限り", "原級"]
  },
  {
    id: "cmp-13",
    pattern: "倍数表現（twice as ~ as）",
    jp: "Aの〜倍…だ",
    cat: "比較",
    level: "標準",
    ex: [
      { en: "This room is twice as large as that one.", ja: "この部屋はあの部屋の2倍の広さだ。" },
      { en: "He has three times as many books as I do.", ja: "彼は私の3倍の本を持っている。" }
    ],
    note: "半分は half as ~ as、3倍以上は 数字 times。the size of / the number of を使った言い換えもある。",
    keys: ["倍数", "times", "half as"]
  },
  {
    id: "cmp-14",
    pattern: "may as well A as B",
    jp: "BするくらいならAする方がましだ",
    cat: "比較",
    level: "発展",
    ex: [
      { en: "You may as well throw your money away as lend it to him.", ja: "彼に金を貸すくらいなら捨てた方がましだ。" }
    ],
    note: "might as well の方が控えめ。may well は「…するのももっともだ」で別表現。",
    keys: ["might as well", "may well", "慣用"]
  },

  /* ===================== 仮定法 ===================== */
  {
    id: "sub-01",
    pattern: "If S 過去形, S would do（仮定法過去）",
    jp: "もし今〜なら、…するのに",
    cat: "仮定法",
    level: "標準",
    ex: [
      { en: "If I were you, I would accept the offer.", ja: "もし私が君なら、その申し出を受けるだろう。" },
      { en: "If I had time, I could help you.", ja: "時間があれば手伝えるのに。" }
    ],
    note: "現在の事実に反する仮定。be動詞は人称に関係なく were が原則。",
    keys: ["現在の事実に反する", "were", "would"]
  },
  {
    id: "sub-02",
    pattern: "If S had done, S would have done（仮定法過去完了）",
    jp: "もしあのとき〜だったら、…しただろうに",
    cat: "仮定法",
    level: "標準",
    ex: [
      { en: "If I had studied harder, I would have passed the exam.", ja: "もっと勉強していれば試験に合格しただろうに。" }
    ],
    note: "過去の事実に反する仮定。時制を1つずらすのがポイント。",
    keys: ["過去の事実に反する", "would have done"]
  },
  {
    id: "sub-03",
    pattern: "混合仮定法（If S had done, S would do now）",
    jp: "あのとき〜していれば、今は…だろうに",
    cat: "仮定法",
    level: "発展",
    ex: [
      { en: "If I had taken the medicine, I would be fine now.", ja: "あの薬を飲んでいたら、今は元気だろうに。" }
    ],
    note: "if 節が過去、主節が現在。now, today などの副詞が手がかり。",
    keys: ["混合", "時制のずれ"]
  },
  {
    id: "sub-04",
    pattern: "If it were not for A / But for A / Without A",
    jp: "Aがなければ／Aがなかったら",
    cat: "仮定法",
    level: "標準",
    ex: [
      { en: "If it were not for water, nothing could live.", ja: "水がなければ何も生きられない。" },
      { en: "But for your help, I would have failed.", ja: "君の助けがなかったら失敗していただろう。" }
    ],
    note: "過去なら If it had not been for。But for / Without は現在・過去どちらにも使える。",
    keys: ["But for", "Without", "If it had not been for"]
  },
  {
    id: "sub-05",
    pattern: "I wish + 仮定法",
    jp: "〜ならいいのに／〜だったらよかったのに",
    cat: "仮定法",
    level: "標準",
    ex: [
      { en: "I wish I could speak French.", ja: "フランス語が話せたらいいのに。" },
      { en: "I wish I had not said that.", ja: "あんなことを言わなければよかった。" }
    ],
    note: "同時なら過去形、それより前なら過去完了。If only ~ ! はより強い願望。",
    keys: ["If only", "願望", "後悔"]
  },
  {
    id: "sub-06",
    pattern: "as if / as though + 仮定法",
    jp: "まるで〜であるかのように",
    cat: "仮定法",
    level: "標準",
    ex: [
      { en: "He talks as if he knew everything.", ja: "彼はまるで何でも知っているかのように話す。" },
      { en: "She looked as if she had seen a ghost.", ja: "彼女はまるで幽霊を見たような顔をしていた。" }
    ],
    note: "主節と同時なら過去形、前なら過去完了。事実に近いときは直説法も使う。",
    keys: ["as though", "直説法との違い"]
  },
  {
    id: "sub-07",
    pattern: "It is time + S 過去形",
    jp: "もう〜してもよいころだ",
    cat: "仮定法",
    level: "標準",
    ex: [
      { en: "It is time you went to bed.", ja: "もう寝る時間だよ。" }
    ],
    note: "It is high time / about time も同様。to do や should do でも表せる。",
    keys: ["high time", "about time", "仮定法過去"]
  },
  {
    id: "sub-08",
    pattern: "if の省略による倒置（Were I / Had I / Should）",
    jp: "もし〜なら（倒置）",
    cat: "仮定法",
    level: "発展",
    ex: [
      { en: "Were I in your position, I would do the same.", ja: "君の立場なら私も同じことをするだろう。" },
      { en: "Had I known it, I would have told you.", ja: "それを知っていたら君に言ったのに。" }
    ],
    note: "if を省略し、were / had / should を主語の前に出す。堅い文体で使われる。",
    keys: ["倒置", "if 省略", "Should you"]
  },
  {
    id: "sub-09",
    pattern: "If S should do / If S were to do",
    jp: "万一〜なら／仮に〜だとしたら",
    cat: "仮定法",
    level: "発展",
    ex: [
      { en: "If it should rain tomorrow, the game will be called off.", ja: "万一明日雨なら試合は中止だ。" },
      { en: "If the sun were to rise in the west, I would not change my mind.", ja: "仮に太陽が西から昇っても私は考えを変えない。" }
    ],
    note: "should は実現可能性が低い未来、were to は純粋な仮定（実現不可能なことにも使える）。",
    keys: ["万一", "未来の仮定", "were to"]
  },
  {
    id: "sub-10",
    pattern: "otherwise（さもなければ）",
    jp: "そうでなければ…だろうに",
    cat: "仮定法",
    level: "発展",
    ex: [
      { en: "I was busy; otherwise I would have joined you.", ja: "忙しかった。そうでなければ君に加わっていただろう。" }
    ],
    note: "otherwise が if 節の代用になる。to do, 主語, 副詞句なども条件を表せる。",
    keys: ["if 節の代用", "条件"]
  },
  {
    id: "sub-11",
    pattern: "S suggest / insist that S (should) do",
    jp: "…するよう提案・主張する",
    cat: "仮定法",
    level: "発展",
    ex: [
      { en: "He suggested that she take a rest.", ja: "彼は彼女が休むよう提案した。" }
    ],
    note: "提案・要求・命令・主張の動詞に続く that 節は原形（仮定法現在）。英では should を入れる。",
    keys: ["仮定法現在", "should 省略", "demand", "propose"]
  },

  /* ===================== 接続詞・副詞節 ===================== */
  {
    id: "cnj-01",
    pattern: "so ~ that S V",
    jp: "とても〜なので…",
    cat: "接続詞・副詞節",
    level: "基本",
    ex: [
      { en: "He was so tired that he fell asleep at once.", ja: "彼はとても疲れていたのですぐに眠ってしまった。" }
    ],
    note: "so の後ろは形容詞・副詞。結果・程度を表す。",
    keys: ["結果", "程度", "too to 書き換え"]
  },
  {
    id: "cnj-02",
    pattern: "such (a) ~ 名詞 that S V",
    jp: "とても〜な…なので",
    cat: "接続詞・副詞節",
    level: "標準",
    ex: [
      { en: "It was such a hot day that we stayed inside.", ja: "とても暑い日だったので私たちは屋内にいた。" }
    ],
    note: "such の後ろは名詞句。so + 形容詞 + a + 名詞 の語順も可（so hot a day）。",
    keys: ["語順", "so hot a day", "結果"]
  },
  {
    id: "cnj-03",
    pattern: "so that S can / will do",
    jp: "…するように（目的）",
    cat: "接続詞・副詞節",
    level: "標準",
    ex: [
      { en: "Speak louder so that everyone can hear you.", ja: "みんなに聞こえるようにもっと大きな声で話して。" }
    ],
    note: "コンマなしは目的、コンマ付き（, so that）は結果を表すことが多い。",
    keys: ["目的", "in order that", "結果"]
  },
  {
    id: "cnj-04",
    pattern: "not ~ until ... / It is not until ~ that ...",
    jp: "…して初めて〜する",
    cat: "接続詞・副詞節",
    level: "標準",
    ex: [
      { en: "I did not realize my mistake until he told me.", ja: "彼に言われて初めて自分の誤りに気づいた。" },
      { en: "It was not until then that I knew the truth.", ja: "そのとき初めて真実を知った。" }
    ],
    note: "強調構文と組み合わせた It is not until ~ that ... が頻出。Not until ~ の倒置形もある。",
    keys: ["初めて", "強調構文", "倒置"]
  },
  {
    id: "cnj-05",
    pattern: "no sooner ~ than / hardly ~ when",
    jp: "…するやいなや〜した",
    cat: "接続詞・副詞節",
    level: "発展",
    ex: [
      { en: "No sooner had he arrived than it began to rain.", ja: "彼が着くやいなや雨が降り出した。" },
      { en: "Hardly had I sat down when the phone rang.", ja: "座るやいなや電話が鳴った。" }
    ],
    note: "前半は過去完了、後半は過去形。文頭に出すと倒置が起こる。As soon as に書き換え可能。",
    keys: ["倒置", "過去完了", "as soon as", "scarcely before"]
  },
  {
    id: "cnj-06",
    pattern: "whether S V (or not)",
    jp: "…かどうか／…であろうとなかろうと",
    cat: "接続詞・副詞節",
    level: "標準",
    ex: [
      { en: "I do not know whether he will come or not.", ja: "彼が来るかどうかわからない。" },
      { en: "Whether you like it or not, you must do it.", ja: "好むと好まざるとにかかわらず、やらねばならない。" }
    ],
    note: "名詞節（…かどうか）と譲歩の副詞節（…であろうと）の2用法。前置詞の後ろは if 不可。",
    keys: ["if との違い", "名詞節", "譲歩"]
  },
  {
    id: "cnj-07",
    pattern: "as long as / as far as",
    jp: "…する限りは（条件／範囲）",
    cat: "接続詞・副詞節",
    level: "標準",
    ex: [
      { en: "You may stay here as long as you keep quiet.", ja: "静かにしている限りここにいてよい。" },
      { en: "As far as I know, he is honest.", ja: "私の知る限り、彼は正直だ。" }
    ],
    note: "as long as は条件・時間、as far as は範囲・程度。",
    keys: ["条件", "範囲", "使い分け"]
  },
  {
    id: "cnj-08",
    pattern: "in case S V",
    jp: "…するといけないから／…の場合に備えて",
    cat: "接続詞・副詞節",
    level: "標準",
    ex: [
      { en: "Take an umbrella in case it rains.", ja: "雨が降るといけないから傘を持って行きなさい。" }
    ],
    note: "米では「もし…なら」の意味でも使う。in case of + 名詞。",
    keys: ["備え", "in case of"]
  },
  {
    id: "cnj-09",
    pattern: "now that S V",
    jp: "今や…だから",
    cat: "接続詞・副詞節",
    level: "標準",
    ex: [
      { en: "Now that you are here, we can start.", ja: "君が来たからには始められる。" }
    ],
    note: "that は省略可。理由を表す接続詞。",
    keys: ["理由", "since", "because"]
  },
  {
    id: "cnj-10",
    pattern: "once S V",
    jp: "いったん…すると",
    cat: "接続詞・副詞節",
    level: "標準",
    ex: [
      { en: "Once you start, you cannot stop.", ja: "いったん始めるとやめられない。" }
    ],
    note: "接続詞の once。副詞の once（かつて）と区別する。",
    keys: ["条件", "接続詞"]
  },
  {
    id: "cnj-11",
    pattern: "every time / each time S V",
    jp: "…するたびに",
    cat: "接続詞・副詞節",
    level: "基本",
    ex: [
      { en: "Every time I see her, she is reading.", ja: "彼女に会うたびに本を読んでいる。" }
    ],
    note: "the moment / the instant（…するとすぐに）も名詞が接続詞化した例。",
    keys: ["the moment", "接続詞化した名詞", "頻度"]
  },
  {
    id: "cnj-12",
    pattern: "lest S (should) do",
    jp: "…しないように",
    cat: "接続詞・副詞節",
    level: "発展",
    ex: [
      { en: "He spoke slowly lest he should be misunderstood.", ja: "誤解されないように彼はゆっくり話した。" }
    ],
    note: "lest 自体に否定の意味が含まれる。堅い表現。for fear that も同義。",
    keys: ["for fear that", "否定の目的", "古風"]
  },
  {
    id: "cnj-13",
    pattern: "not A but B / not only A but also B",
    jp: "AでなくB／AだけでなくBも",
    cat: "接続詞・副詞節",
    level: "基本",
    ex: [
      { en: "He is not a teacher but a doctor.", ja: "彼は教師ではなく医者だ。" },
      { en: "She speaks not only English but also French.", ja: "彼女は英語だけでなくフランス語も話す。" }
    ],
    note: "B as well as A も同義（重点は B ではなく前の要素）。動詞の一致は B に合わせる。",
    keys: ["as well as", "相関接続詞", "動詞の一致"]
  },
  {
    id: "cnj-14",
    pattern: "either A or B / neither A nor B",
    jp: "AかBのどちらか／AもBも…でない",
    cat: "接続詞・副詞節",
    level: "基本",
    ex: [
      { en: "Either you or I am wrong.", ja: "君か私のどちらかが間違っている。" },
      { en: "Neither he nor I was invited.", ja: "彼も私も招待されなかった。" }
    ],
    note: "動詞は近い方の主語に一致させる（近接の原則）。",
    keys: ["相関接続詞", "動詞の一致", "近接の原則"]
  },

  /* ===================== 強調・倒置・省略 ===================== */
  {
    id: "emp-01",
    pattern: "It is ~ that ...（強調構文）",
    jp: "…なのは〜だ",
    cat: "強調・倒置・省略",
    level: "標準",
    ex: [
      { en: "It was John that broke the window.", ja: "窓を割ったのはジョンだった。" },
      { en: "It was in Kyoto that I met her.", ja: "私が彼女に会ったのは京都でだった。" }
    ],
    note: "強調するのは主語・目的語・副詞句。人なら who、物なら which も可。It is ~ that を外して文が成立すれば強調構文。",
    keys: ["分裂文", "cleft sentence", "形式主語との区別"]
  },
  {
    id: "emp-02",
    pattern: "do / does / did + 原形（動詞の強調）",
    jp: "本当に…する",
    cat: "強調・倒置・省略",
    level: "基本",
    ex: [
      { en: "I do believe you.", ja: "私は本当に君を信じている。" },
      { en: "He did come after all.", ja: "彼は結局本当に来た。" }
    ],
    note: "肯定文でのみ使う。時制と人称は do が担い、後ろは原形。",
    keys: ["強調のdo", "原形"]
  },
  {
    id: "emp-03",
    pattern: "否定語句の文頭倒置（Never have I ~）",
    jp: "一度も…したことがない（強調）",
    cat: "強調・倒置・省略",
    level: "発展",
    ex: [
      { en: "Never have I seen such a beautiful sunset.", ja: "こんなに美しい夕日は見たことがない。" },
      { en: "Little did I dream that he would win.", ja: "彼が勝つとは夢にも思わなかった。" }
    ],
    note: "Never, Little, Seldom, Rarely, Not only などが文頭に出ると疑問文の語順になる。",
    keys: ["倒置", "Little did I", "Not only"]
  },
  {
    id: "emp-04",
    pattern: "Only + 副詞句 + 倒置",
    jp: "…して初めて〜する",
    cat: "強調・倒置・省略",
    level: "発展",
    ex: [
      { en: "Only then did I realize my mistake.", ja: "そのとき初めて自分の誤りに気づいた。" },
      { en: "Only after the war did he return home.", ja: "戦後になって初めて彼は帰郷した。" }
    ],
    note: "Only + 副詞（句・節）が文頭に来ると主節が倒置される。",
    keys: ["倒置", "Only then", "強調"]
  },
  {
    id: "emp-05",
    pattern: "形容詞 as S V（譲歩）",
    jp: "〜ではあるが",
    cat: "強調・倒置・省略",
    level: "発展",
    ex: [
      { en: "Young as he is, he is very reliable.", ja: "彼は若いが、とても頼りになる。" }
    ],
    note: "補語を文頭に出す譲歩構文。though を使うこともある。名詞は無冠詞になる（Child as he was）。",
    keys: ["譲歩", "though", "無冠詞"]
  },
  {
    id: "emp-06",
    pattern: "So do I / Neither do I",
    jp: "私もそうだ／私もそうでない",
    cat: "強調・倒置・省略",
    level: "基本",
    ex: [
      { en: "I like jazz. So do I.", ja: "ジャズが好きだ。—私もだ。" },
      { en: "I cannot swim. Neither can I.", ja: "泳げない。—私もだ。" }
    ],
    note: "So + 助動詞 + S は同意。So I do（そのとおりだ）は倒置しない別表現。",
    keys: ["倒置", "同意", "Nor"]
  },
  {
    id: "emp-07",
    pattern: "the last 名詞 to do",
    jp: "最も…しそうにない〜",
    cat: "強調・倒置・省略",
    level: "標準",
    ex: [
      { en: "He is the last man to tell a lie.", ja: "彼は決して嘘をつくような人ではない。" }
    ],
    note: "「最後の…」から転じた強い否定表現。",
    keys: ["否定", "慣用", "強調"]
  },
  {
    id: "emp-08",
    pattern: "cannot ~ too ...",
    jp: "いくら〜してもしすぎることはない",
    cat: "強調・倒置・省略",
    level: "発展",
    ex: [
      { en: "You cannot be too careful when you drive.", ja: "運転するときはいくら注意してもしすぎることはない。" }
    ],
    note: "cannot ~ enough も同義。二重否定的な強い肯定。",
    keys: ["cannot enough", "二重否定", "慣用"]
  },
  {
    id: "emp-09",
    pattern: "never fail to do",
    jp: "必ず…する",
    cat: "強調・倒置・省略",
    level: "標準",
    ex: [
      { en: "She never fails to write to me every month.", ja: "彼女は毎月必ず私に手紙をくれる。" }
    ],
    note: "二重否定による強い肯定。without fail（必ず）も併せて覚える。",
    keys: ["二重否定", "without fail"]
  },
  {
    id: "emp-10",
    pattern: "It is not too much to say that S V",
    jp: "…と言っても過言ではない",
    cat: "強調・倒置・省略",
    level: "発展",
    ex: [
      { en: "It is not too much to say that he is a genius.", ja: "彼は天才だと言っても過言ではない。" }
    ],
    note: "It is no exaggeration to say that ~ も同義。",
    keys: ["exaggeration", "形式主語", "慣用"]
  },
  {
    id: "emp-11",
    pattern: "部分否定（not all / not always）",
    jp: "すべてが…とは限らない",
    cat: "強調・倒置・省略",
    level: "標準",
    ex: [
      { en: "Not all rich people are happy.", ja: "金持ちが皆幸せとは限らない。" },
      { en: "The rich are not always happy.", ja: "金持ちが必ずしも幸せとは限らない。" }
    ],
    note: "not が all, every, both, always, necessarily と結びつくと部分否定。全否定は no, none, never。",
    keys: ["全否定との違い", "necessarily", "both"]
  },
  {
    id: "emp-12",
    pattern: "省略（if any / if ever / when necessary）",
    jp: "もしあれば／たとえあるにしても",
    cat: "強調・倒置・省略",
    level: "発展",
    ex: [
      { en: "There are few mistakes, if any, in his report.", ja: "彼の報告書に誤りはあってもごくわずかだ。" },
      { en: "He seldom, if ever, goes out at night.", ja: "彼は夜出かけることはめったにない。" }
    ],
    note: "副詞節中の S + be は省略されやすい（When (you are) in Rome, ...）。",
    keys: ["節中の省略", "if possible", "挿入"]
  },

  /* ===================== 助動詞 ===================== */
  {
    id: "aux-01",
    pattern: "must have done",
    jp: "…したに違いない",
    cat: "助動詞",
    level: "標準",
    ex: [
      { en: "He must have missed the train.", ja: "彼は電車に乗り遅れたに違いない。" }
    ],
    note: "過去の事柄への現在の推量。否定の推量は cannot have done（…したはずがない）。",
    keys: ["推量", "cannot have done", "過去への推量"]
  },
  {
    id: "aux-02",
    pattern: "may / might have done",
    jp: "…したかもしれない",
    cat: "助動詞",
    level: "標準",
    ex: [
      { en: "She may have forgotten our appointment.", ja: "彼女は約束を忘れたのかもしれない。" }
    ],
    note: "might の方が可能性は低め。助動詞 + have done は「過去への推量・後悔」。",
    keys: ["推量", "可能性"]
  },
  {
    id: "aux-03",
    pattern: "should / ought to have done",
    jp: "…すべきだったのに（しなかった）",
    cat: "助動詞",
    level: "標準",
    ex: [
      { en: "You should have told me earlier.", ja: "もっと早く言ってくれればよかったのに。" }
    ],
    note: "実際にはしなかったという含意。否定は should not have done（…すべきでなかったのに）。",
    keys: ["後悔", "非難", "ought to"]
  },
  {
    id: "aux-04",
    pattern: "need not have done",
    jp: "…する必要はなかったのに（した）",
    cat: "助動詞",
    level: "発展",
    ex: [
      { en: "You need not have hurried.", ja: "急ぐ必要はなかったのに。" }
    ],
    note: "did not need to do は「する必要がなかった（実際もしなかった）」で意味が違う。",
    keys: ["did not need to", "使い分け"]
  },
  {
    id: "aux-05",
    pattern: "used to do / would (often) do",
    jp: "以前は…したものだ",
    cat: "助動詞",
    level: "標準",
    ex: [
      { en: "There used to be a shop here.", ja: "以前ここに店があった。" },
      { en: "He would often sit here for hours.", ja: "彼はよく何時間もここに座っていたものだ。" }
    ],
    note: "used to は過去の習慣・状態の両方、would は習慣的動作のみ（状態には使えない）。",
    keys: ["過去の習慣", "状態", "使い分け"]
  },
  {
    id: "aux-06",
    pattern: "may well do",
    jp: "…するのももっともだ／たぶん…だろう",
    cat: "助動詞",
    level: "発展",
    ex: [
      { en: "You may well be angry.", ja: "君が怒るのももっともだ。" }
    ],
    note: "may as well do（…する方がよい）と混同しない。",
    keys: ["may as well", "もっともだ", "混同注意"]
  },
  {
    id: "aux-07",
    pattern: "had better do",
    jp: "…した方がよい",
    cat: "助動詞",
    level: "基本",
    ex: [
      { en: "You had better see a doctor.", ja: "医者に診てもらった方がいい。" }
    ],
    note: "否定は had better not do。目上の人には使わない（警告のニュアンス）。",
    keys: ["否定の語順", "忠告", "警告"]
  },
  {
    id: "aux-08",
    pattern: "cannot but do",
    jp: "…せざるを得ない",
    cat: "助動詞",
    level: "発展",
    ex: [
      { en: "I cannot but admire his courage.", ja: "彼の勇気に感嘆せざるを得ない。" }
    ],
    note: "cannot help doing の堅い言い方。cannot help but do は両者の混交形だが広く使われる。",
    keys: ["cannot help doing", "堅い表現"]
  },
  {
    id: "aux-09",
    pattern: "would like to do / would rather do",
    jp: "…したいのですが／むしろ…したい",
    cat: "助動詞",
    level: "基本",
    ex: [
      { en: "I would like to ask you a favor.", ja: "お願いがあるのですが。" }
    ],
    note: "want to より丁寧。would have liked to have done は「…したかったのに」。",
    keys: ["丁寧", "願望"]
  },

  /* ===================== 名詞構文・無生物主語 ===================== */
  {
    id: "nom-01",
    pattern: "無生物主語 + make / let O do",
    jp: "〜のおかげでOは…する",
    cat: "名詞構文・無生物主語",
    level: "標準",
    ex: [
      { en: "The news made her happy.", ja: "その知らせで彼女はうれしくなった。" },
      { en: "What made you change your mind?", ja: "なぜ考えを変えたのですか。" }
    ],
    note: "無生物主語は「〜のせいで／おかげで」と副詞的に訳し、目的語を主語のように訳すと自然。",
    keys: ["使役", "訳し方", "What makes you"]
  },
  {
    id: "nom-02",
    pattern: "S enable / allow O to do",
    jp: "〜のおかげでOは…できる",
    cat: "名詞構文・無生物主語",
    level: "標準",
    ex: [
      { en: "This scholarship enabled him to study abroad.", ja: "この奨学金のおかげで彼は留学できた。" }
    ],
    note: "force, cause, lead, drive も同じ SVO to do 型をとる。",
    keys: ["cause", "lead", "force", "SVO to do"]
  },
  {
    id: "nom-03",
    pattern: "prevent / keep / stop O from doing",
    jp: "Oが…するのを妨げる",
    cat: "名詞構文・無生物主語",
    level: "標準",
    ex: [
      { en: "The heavy rain prevented us from going out.", ja: "大雨のせいで私たちは外出できなかった。" }
    ],
    note: "prevent では from を省略できるが、keep / stop では省略できない。",
    keys: ["from", "妨害", "discourage"]
  },
  {
    id: "nom-04",
    pattern: "remind A of B（動詞 + A + of + B）",
    jp: "AにBを思い出させる",
    cat: "名詞構文・無生物主語",
    level: "標準",
    ex: [
      { en: "This song reminds me of my childhood.", ja: "この歌を聞くと子ども時代を思い出す。" }
    ],
    note: "同型に inform / convince / rob / deprive / cure A of B がある。",
    keys: ["inform of", "rob of", "deprive of", "of の用法"]
  },
  {
    id: "nom-05",
    pattern: "It occurs to A that S V",
    jp: "Aはふと…と思いつく",
    cat: "名詞構文・無生物主語",
    level: "発展",
    ex: [
      { en: "It occurred to me that I had left the key at home.", ja: "鍵を家に忘れたことをふと思い出した。" }
    ],
    note: "It never occurred to me that ~ は「…とは思いもよらなかった」。",
    keys: ["形式主語", "思いつく", "慣用"]
  },
  {
    id: "nom-06",
    pattern: "It is said / believed that S V",
    jp: "…と言われている／…と信じられている",
    cat: "名詞構文・無生物主語",
    level: "標準",
    ex: [
      { en: "It is believed that the temple was built in the 8th century.", ja: "その寺は8世紀に建てられたと信じられている。" }
    ],
    note: "S is said to do への書き換えが定番。that 節の時制が主節より前なら to have done。",
    keys: ["受動態", "書き換え", "形式主語"]
  },
  {
    id: "nom-07",
    pattern: "名詞構文（his refusal to do など）",
    jp: "彼が…を断ったこと",
    cat: "名詞構文・無生物主語",
    level: "発展",
    ex: [
      { en: "His refusal to help us surprised everyone.", ja: "彼が私たちを助けるのを断ったことは皆を驚かせた。" }
    ],
    note: "動詞派生名詞は「主語＋動詞」に戻して訳すと自然。of は主格・目的格の両方を表す。",
    keys: ["動詞派生名詞", "訳し方", "of の主格目的格"]
  },
  {
    id: "nom-08",
    pattern: "take A for granted / take it for granted that S V",
    jp: "Aを当然と思う",
    cat: "名詞構文・無生物主語",
    level: "標準",
    ex: [
      { en: "We take it for granted that water is safe to drink.", ja: "私たちは水が安全に飲めるのを当然と思っている。" }
    ],
    note: "that 節が目的語のときは形式目的語 it を立てる。",
    keys: ["形式目的語", "慣用"]
  },
  {
    id: "nom-09",
    pattern: "owe A to B",
    jp: "AはBのおかげである",
    cat: "名詞構文・無生物主語",
    level: "標準",
    ex: [
      { en: "I owe my success to my teachers.", ja: "私の成功は先生方のおかげです。" }
    ],
    note: "owe B A（BにAを借りている）の語順もある。thanks to（〜のおかげで）と併せて覚える。",
    keys: ["thanks to", "おかげ", "due to"]
  },
  {
    id: "nom-10",
    pattern: "There is something / no ~ about A",
    jp: "Aにはどこか〜なところがある",
    cat: "名詞構文・無生物主語",
    level: "発展",
    ex: [
      { en: "There is something mysterious about her smile.", ja: "彼女の微笑みにはどこか神秘的なところがある。" }
    ],
    note: "-thing で終わる語は形容詞を後ろに置く（something new）。",
    keys: ["something 形容詞", "語順"]
  }
];
