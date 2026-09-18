// First-run contents of the board. Written to the database once, the very
// first time /api/items is called on an empty store; after that the database
// is the only source of truth and this file is never read again.
export const SEED = {
  "s01": {
    "cat": "supply",
    "sort": 10,
    "start": "2026-09-16",
    "end": "2026-11-01",
    "en": "Batch 1 sell-through (8,250 units landed Sep 16)",
    "ja": "第1便 消化（9/16入港 8,250台）",
    "note_en": "black 2,406 / ivory 1,980 / pink 1,932 / gray 1,932. MKS 4,850 + EC 3,400.",
    "note_ja": "ブラック2,406／アイボリー1,980／ピンク1,932／グレー1,932。MKS 4,850＋EC 3,400。"
  },
  "s02": {
    "cat": "supply",
    "sort": 20,
    "start": "2026-09-18",
    "end": "2026-09-25",
    "en": "Confirm Batch 2 US allocation & ETA",
    "ja": "第2便の米国配分とETAを確定",
    "note_en": "\"Up to 5,000\" is not a plan. Lock the number against AU / KR / JP demand.",
    "note_ja": "「最大5,000台」では計画にならない。豪州・韓国・日本と配分を確定する。"
  },
  "s03": {
    "cat": "supply",
    "sort": 30,
    "start": "2026-10-01",
    "end": "2026-10-05",
    "en": "Batch 2 leaves China factory (10,000 total)",
    "ja": "第2便 中国工場出荷（計10,000台）",
    "note_en": "",
    "note_ja": ""
  },
  "s04": {
    "cat": "supply",
    "sort": 40,
    "start": "2026-10-05",
    "end": "2026-11-30",
    "en": "Batch 2 in transit to US (≤ 5,000 allocated)",
    "ja": "第2便 米国向け輸送（米国分5,000台以下）",
    "note_en": "Transit assumption conflicts with Batch 3 (20 days). Verify with the forwarder.",
    "note_ja": "第3便の「20日」と前提が矛盾。フォワーダーに確認が必要。"
  },
  "s05": {
    "cat": "supply",
    "sort": 50,
    "start": "2026-11-30",
    "end": "2026-12-07",
    "en": "Batch 2 arrival + receiving",
    "ja": "第2便 到着・入庫",
    "note_en": "",
    "note_ja": ""
  },
  "s06": {
    "cat": "supply",
    "sort": 60,
    "start": "2026-11-01",
    "end": "2026-11-05",
    "en": "Batch 3 leaves China (10,000)",
    "ja": "第3便 中国出荷（10,000台）",
    "note_en": "",
    "note_ja": ""
  },
  "s07": {
    "cat": "supply",
    "sort": 70,
    "start": "2026-11-05",
    "end": "2026-11-25",
    "en": "Batch 3 sea freight → Yamato Long Beach (20 days)",
    "ja": "第3便 海上輸送 → ヤマト ロングビーチ（20日）",
    "note_en": "",
    "note_ja": ""
  },
  "s08": {
    "cat": "supply",
    "sort": 80,
    "start": "2026-11-25",
    "end": "2026-12-05",
    "en": "Batch 3 receiving + EC fulfillment restart",
    "ja": "第3便 入庫・EC出荷再開",
    "note_en": "",
    "note_ja": ""
  },
  "s09": {
    "cat": "supply",
    "sort": 90,
    "start": "2026-10-20",
    "end": "2026-10-27",
    "en": "Book air freight for Meekins channel",
    "ja": "Meekins流通向け 空輸の手配・確定",
    "note_en": "Distribution channel cannot wait for sea freight. Decide volume and budget.",
    "note_ja": "流通チャネルは海上輸送では間に合わない。数量と予算を決定。"
  },
  "w01": {
    "cat": "warehouse",
    "sort": 10,
    "start": "2026-09-18",
    "end": "2026-09-22",
    "en": "Decide 3PL: Yamato USA vs Santoku",
    "ja": "3PL決定：ヤマトUSA か サントク",
    "note_en": "Everything downstream waits on this. Get their move timelines first.",
    "note_ja": "以降の全工程がこの決定待ち。まず移管スケジュールを確認。"
  },
  "w02": {
    "cat": "warehouse",
    "sort": 20,
    "start": "2026-09-22",
    "end": "2026-09-24",
    "en": "Notify MKS / Meekins of EC stock handover",
    "ja": "MKS・MeekinsへEC在庫の移管を通知",
    "note_en": "",
    "note_ja": ""
  },
  "w03": {
    "cat": "warehouse",
    "sort": 30,
    "start": "2026-09-24",
    "end": "2026-09-30",
    "en": "Move EC stock MKS → new 3PL (3,400 units)",
    "ja": "EC在庫の移管 MKS → 新3PL（3,400台）",
    "note_en": "",
    "note_ja": ""
  },
  "w04": {
    "cat": "warehouse",
    "sort": 40,
    "start": "2026-09-29",
    "end": "2026-10-08",
    "en": "New 3PL systems integration (store, WMS, carriers)",
    "ja": "新3PL システム連携（ストア・WMS・配送会社）",
    "note_en": "Must be live by Oct 8 — Japan House Round 1 ships from this warehouse on Oct 15.",
    "note_ja": "10/8までに稼働必須 — 10/15のJapan House第1回はこの倉庫から出荷。"
  },
  "w05": {
    "cat": "warehouse",
    "sort": 50,
    "start": "2026-10-01",
    "end": "2026-10-05",
    "en": "Ring-fence reserved stock (F1 1,500 + Japan House R2)",
    "ja": "引当在庫のロック（F1 1,500台＋Japan House 第2回）",
    "note_en": "Batch 1 sells out early Nov. Unreserved units will be gone before these dates.",
    "note_ja": "第1便は11月上旬に完売見込み。確保しないと当日分が残らない。"
  },
  "d01": {
    "cat": "design",
    "sort": 10,
    "start": "2026-09-18",
    "end": "2026-09-23",
    "en": "Nordstrom pop-up design v1.0",
    "ja": "ノードストローム POP-UP デザイン v1.0",
    "note_en": "5ft × 5ft, one location.",
    "note_ja": "5フィート×5フィート、1店舗。"
  },
  "d02": {
    "cat": "design",
    "sort": 20,
    "start": "2026-09-23",
    "end": "2026-09-28",
    "en": "Nordstrom design review & sign-off",
    "ja": "ノードストローム デザイン レビュー・確定",
    "note_en": "",
    "note_ja": ""
  },
  "d03": {
    "cat": "design",
    "sort": 30,
    "start": "2026-09-22",
    "end": "2026-09-25",
    "en": "FAO: cost per location & count decision",
    "ja": "FAO：1店舗あたりの費用と設置数の決定",
    "note_en": "",
    "note_ja": ""
  },
  "d04": {
    "cat": "design",
    "sort": 40,
    "start": "2026-09-25",
    "end": "2026-09-30",
    "en": "FAO pop-up design v1.0",
    "ja": "FAO POP-UP デザイン v1.0",
    "note_en": "",
    "note_ja": ""
  },
  "d05": {
    "cat": "design",
    "sort": 50,
    "start": "2026-09-30",
    "end": "2026-10-05",
    "en": "FAO design review & sign-off",
    "ja": "FAO デザイン レビュー・確定",
    "note_en": "",
    "note_ja": ""
  },
  "d06": {
    "cat": "design",
    "sort": 60,
    "start": "2026-09-29",
    "end": "2026-10-16",
    "en": "Fixture fabrication & shipping (Nordstrom + FAO, 8 units)",
    "ja": "什器の製作・輸送（ノードストローム＋FAO 計8基）",
    "note_en": "Highest-risk item. Share one modular design with Nordstrom so fabrication starts Sep 29, not Oct 6.",
    "note_ja": "最大のリスク項目。ノードストロームと共通のモジュール設計にして、10/6ではなく9/29に製作開始する。"
  },
  "d07": {
    "cat": "design",
    "sort": 70,
    "start": "2026-10-10",
    "end": "2026-10-10",
    "en": "Nordstrom fixture ready on site",
    "ja": "ノードストローム 什器 現地設置完了",
    "note_en": "",
    "note_ja": ""
  },
  "d08": {
    "cat": "design",
    "sort": 80,
    "start": "2026-10-13",
    "end": "2026-10-17",
    "en": "FAO fixtures ready (up to 7 locations)",
    "ja": "FAO 什器 設置完了（最大7店舗）",
    "note_en": "",
    "note_ja": ""
  },
  "d09": {
    "cat": "design",
    "sort": 90,
    "start": "2026-10-02",
    "end": "2026-10-09",
    "en": "F1 pop-up design v1.0",
    "ja": "F1 POP-UP デザイン v1.0",
    "note_en": "",
    "note_ja": ""
  },
  "d10": {
    "cat": "design",
    "sort": 100,
    "start": "2026-10-09",
    "end": "2026-10-16",
    "en": "F1 design review & sign-off",
    "ja": "F1 デザイン レビュー・確定",
    "note_en": "",
    "note_ja": ""
  },
  "d11": {
    "cat": "design",
    "sort": 110,
    "start": "2026-10-16",
    "end": "2026-11-14",
    "en": "F1 fixture fabrication & ship to Las Vegas",
    "ja": "F1 什器の製作・ラスベガス輸送",
    "note_en": "",
    "note_ja": ""
  },
  "d12": {
    "cat": "design",
    "sort": 120,
    "start": "2026-11-15",
    "end": "2026-11-15",
    "en": "F1 fixture ready on site",
    "ja": "F1 什器 現地設置完了",
    "note_en": "",
    "note_ja": ""
  },
  "p01": {
    "cat": "popup",
    "sort": 10,
    "start": "2026-10-15",
    "end": "2026-10-19",
    "en": "Nordstrom launch — black 90 / ivory 160",
    "ja": "ノードストローム 発売 — ブラック90・アイボリー160",
    "note_en": "250 units total. Expected to sell out fast.",
    "note_ja": "計250台。早期完売の見込み。"
  },
  "p02": {
    "cat": "popup",
    "sort": 20,
    "start": "2026-10-20",
    "end": "2026-11-02",
    "en": "FAO pop-up at Nordstrom — 500 per color",
    "ja": "FAO POP-UP（ノードストローム内）— 各色500台",
    "note_en": "2,000 units. Launches alongside the EC store.",
    "note_ja": "計2,000台。ECストアと同時スタート。"
  },
  "p03": {
    "cat": "popup",
    "sort": 30,
    "start": "2026-10-25",
    "end": "2026-10-31",
    "en": "Halloween black wave (spare 616 units)",
    "ja": "ハロウィン ブラック追加投入（余剰616台）",
    "note_en": "Uses the unallocated black in the MKS channel. Black is the Halloween color.",
    "note_ja": "MKS側で未割当のブラックを投入。ブラックはハロウィン需要。"
  },
  "p04": {
    "cat": "popup",
    "sort": 40,
    "start": "2026-11-20",
    "end": "2026-11-22",
    "en": "F1 Las Vegas pop-up — 1,500 units",
    "ja": "F1 ラスベガス POP-UP — 1,500台",
    "note_en": "ivory 600 / pink 400 / gray 500. Stock must be reserved from Batch 1.",
    "note_ja": "アイボリー600／ピンク400／グレー500。第1便から引当が必要。"
  },
  "e01": {
    "cat": "ec",
    "sort": 10,
    "start": "2026-10-15",
    "end": "2026-10-18",
    "en": "Japan House Round 1 — 100 per color × 3",
    "ja": "Japan House 第1回 — 3色 各100台",
    "note_en": "ivory, pink, gray. Ships from the EC warehouse.",
    "note_ja": "アイボリー・ピンク・グレー。EC倉庫から出荷。"
  },
  "e02": {
    "cat": "ec",
    "sort": 20,
    "start": "2026-10-20",
    "end": "2026-11-05",
    "en": "Yukai EC store launch",
    "ja": "Yukai EC ストア 開店",
    "note_en": "Gray is nearly all committed to Japan House — only ~100 units left for EC.",
    "note_ja": "グレーはJapan House引当でほぼ消化。EC在庫は約100台のみ。"
  },
  "e03": {
    "cat": "ec",
    "sort": 30,
    "start": "2026-11-03",
    "end": "2026-12-01",
    "en": "Pre-order window (bridges the stockout)",
    "ja": "予約受付期間（欠品期間のつなぎ）",
    "note_en": "~4 weeks with no stock, right across Black Friday. Capture demand instead of losing it.",
    "note_ja": "約4週間の欠品がブラックフライデーに直撃。需要を取りこぼさず予約で受ける。"
  },
  "e04": {
    "cat": "ec",
    "sort": 40,
    "start": "2026-11-23",
    "end": "2026-11-30",
    "en": "Black Friday / Cyber Monday campaign",
    "ja": "ブラックフライデー・サイバーマンデー施策",
    "note_en": "",
    "note_ja": ""
  },
  "e05": {
    "cat": "ec",
    "sort": 50,
    "start": "2026-11-23",
    "end": "2026-11-30",
    "en": "Japan House Round 2 — 200–300 per color",
    "ja": "Japan House 第2回 — 各色200〜300台",
    "note_en": "",
    "note_ja": ""
  },
  "c01": {
    "cat": "comply",
    "sort": 10,
    "start": "2026-09-18",
    "end": "2026-09-25",
    "en": "Audit FCC / UN38.3 / CPSIA status",
    "ja": "FCC・UN38.3・CPSIA の取得状況を確認",
    "note_en": "Hard gate for Oct 15. Retailers will ask for the test reports.",
    "note_ja": "10/15の絶対条件。小売側から試験報告書を求められる。"
  },
  "c02": {
    "cat": "comply",
    "sort": 20,
    "start": "2026-09-25",
    "end": "2026-10-16",
    "en": "CPSIA children's product testing & CPC",
    "ja": "CPSIA 児童用製品試験・CPC取得",
    "note_en": "Selling through FAO Schwarz makes this a children's product. Lab lead time 2–4 weeks.",
    "note_ja": "FAO Schwarz販売により児童用製品扱い。試験所のリードタイムは2〜4週間。"
  },
  "c03": {
    "cat": "comply",
    "sort": 30,
    "start": "2026-09-22",
    "end": "2026-10-10",
    "en": "Nordstrom vendor onboarding (EDI, UPC, labels)",
    "ja": "ノードストローム 取引先登録（EDI・UPC・ラベル）",
    "note_en": "GS1 UPC per SKU, carton labels, ASN, insurance certificate. Non-compliance = chargebacks.",
    "note_ja": "SKUごとのGS1 UPC、外装ラベル、ASN、保険証明。不備はチャージバック対象。"
  },
  "c04": {
    "cat": "comply",
    "sort": 40,
    "start": "2026-09-29",
    "end": "2026-10-15",
    "en": "FAO vendor onboarding",
    "ja": "FAO 取引先登録",
    "note_en": "",
    "note_ja": ""
  },
  "c05": {
    "cat": "comply",
    "sort": 50,
    "start": "2026-09-22",
    "end": "2026-10-02",
    "en": "HTS / Section 301 duty review for Batch 2",
    "ja": "第2便のHTS分類・301条関税の確認",
    "note_en": "Drives the landed cost of every unit after Batch 1.",
    "note_ja": "第1便以降の全ロットの仕入原価を左右する。"
  }
};
