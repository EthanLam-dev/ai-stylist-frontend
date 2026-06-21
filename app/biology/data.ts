export const BIOLOGY_DATABASE = {
  human_cell: {
    id: 'human_cell',
    name: '人類細胞結構 (Human Cell)',
    url: '/models/celula_humana_human_cell_free_download.glb', 
    scale: 2.0, 
    offsetY: 0,
    moveSpeed: 0.15, 
    labels: [
      { 
        id: 'nucleus', 
        title: '細胞核 (Nucleus)', 
        desc: '細胞的控制中心，儲存遺傳物質 (DNA)，負責調控細胞的生長、代謝與繁殖。', 
        pos: [5.88, 9.38, 7.37] 
      },
      { 
        id: 'mitochondria', 
        title: '粒線體 (Mitochondria)', 
        desc: '被稱為「細胞的發電廠」，透過細胞呼吸產生能量 (ATP) 供細胞運作使用。', 
        pos: [-45.66, -1.07, -17.57] 
      },
      { 
        id: 'golgi', 
        title: '內質網 (Endoplasmic reticulum)',
        desc: '細胞的「物流中心」，負責將蛋白質與脂質進行修飾、分類和包裝，並運送到目的地。', 
        pos: [-2.70, 1.18, -23.23] 
      }
    ],
    views: [
      { name: '細胞核透視', camPos: [58.87, 87.57, 15.31], target: [66.04, 78.64, 5.25] },
      { name: '細胞全貌', camPos: [-82.86, 180.23, 130.94], target: [-17.37, 86.25, 19.86] },
      { name: '內質網特寫', camPos: [67.93, 60.59, -138.18], target: [67.95, 60.51, -138.19] },
      { name: '粒線體特寫', camPos: [-34.08, 66.16, -141.71], target: [-39.40, 31.50, -139.76] }
    ], // 🌟 補上逗號了
    quiz: [
      { question: '被稱為「細胞的發電廠」，負責產生能量的是哪一個結構？', options: ['細胞核', '內質網', '粒線體', '高基氏體'], answer: 2 },
      { question: '細胞核的主要功能是什麼？', options: ['產生能量', '儲存遺傳物質 (DNA)', '包裝蛋白質', '分泌液體'], answer: 1 },
      { question: '細胞裡的「物流中心」是指哪一個結構？', options: ['內質網', '粒線體', '細胞核', '細胞膜'], answer: 0 }
    ]
  },

  heart: {
    id: 'heart',
    name: '心臟：二尖瓣狹窄病理 (Mitral Stenosis)',
    url: '/models/heart_mitral_stenosis.glb', 
    scale: 15.0, 
    offsetY: 0,  
    moveSpeed: 0.5, 
    labels: [
      { 
        id: 'left_atrium', 
        title: '左心房 (Left Atrium)', 
        desc: '負責收集來自肺部的充氧血。⚠️ 病理特徵：由於下方的二尖瓣狹窄，血液難以順利流出，導致左心房壓力急劇升高、逐漸擴大，容易引發心律不整。', 
        pos: [-0.01, 0.08, 0.01] 
      },
      { 
        id: 'mitral_valve', 
        title: '病灶：二尖瓣 (Mitral Valve)', 
        desc: '【核心病灶】位於左心房與左心室之間。正常瓣膜應柔軟且隨心跳開合；此模型展示了瓣膜因發炎或鈣化而變厚、沾黏，導致開口狹窄，阻礙血流。', 
        pos: [0.01, 0.09, 0.00]
      },
      { 
        id: 'left_ventricle', 
        title: '左心室 (Left Ventricle)', 
        desc: '心臟的超級馬達，負責將血液泵出至全身。⚠️ 病理影響：因為二尖瓣狹窄，流進左心室的血量減少，長期下來會導致心輸出量不足，使患者容易疲倦、喘不過氣。', 
        pos: [0.01, 0.09, 0.01] 
      }
    ],
    views: [
      { name: '心臟全貌與血管', camPos: [1.36, 1.73, 9.69], target: [0.00, 0.00, 0.00] }, 
      { name: '二尖瓣病灶特寫', camPos: [1.31, 0.10, 5.24], target: [1.60, 0.00, 3.27] }, 
      { name: '左心房高壓視角', camPos: [-0.85, -1.97, 3.35], target: [0.00, 0.00, 0.00] }
    ], // 🌟 補上逗號了
    quiz: [
      { question: '負責收集來自肺部的「充氧血」的是哪個部位？', options: ['左心室', '右心房', '左心房', '主動脈'], answer: 2 },
      { question: '二尖瓣狹窄會導致哪個部位的血液難以流出，造成壓力急劇升高？', options: ['左心房', '右心室', '肺動脈', '上腔靜脈'], answer: 0 },
      { question: '負責將血液泵出至全身，被稱為心臟「超級馬達」的是？', options: ['左心房', '右心房', '左心室', '右心室'], answer: 2 }
    ]
  },

  lungs: {
    id: 'lungs',
    name: '呼吸系統 (Respiratory System)',
    url: '/models/lungs_inhale_front_view.glb',
    scale: 1.0, 
    offsetY: 0,
    moveSpeed: 0.15,
    labels: [
      { id: 'lung-left', title: '左肺 (Left Lung)', desc: '呼吸系統的主要器官，分為上下兩葉，負責與血液進行氣體交換。', pos: [66.49, -1.69, 26.61] },
      { id: 'lung-right', title: '右肺 (Right Lung)', desc: '比左肺稍大，分為上、中、下三葉，同樣負責將氧氣送入血液，並排出二氧化碳。', pos: [-34.08, 10.25, 18.39] },
      { id: 'trachea', title: '氣管 (Trachea)', desc: '連接喉部與支氣管的通道，由軟骨環支撐，確保空氣能順利進出肺部。', pos: [17.07, 57.33, 23.60] },
      { id: 'ribs', title: '肋骨 (Ribs)', desc: '保護胸腔內心臟與肺臟的骨骼支架。隨著呼吸肌肉的收縮與放鬆，肋骨會擴張與下降，協助肺部完成充氣與排氣。', pos: [-27.14, -43.07, 58.38] },
      { id: 'larynx', title: '喉部 (Larynx)', desc: '位於氣管頂端，又稱「發聲匣」，內部含有聲帶。除了發聲外，會厭軟骨能在吞嚥時蓋住氣管，防止食物或液體誤入呼吸道。', pos: [16.66, 75.39, 30.70] },
      { id: 'cartilage-ring', title: '氣管軟骨環 (Rings of Cartilage)', desc: '包覆在氣管外圍的 C 型軟骨結構，提供強韌的支撐力，確保呼吸道隨時保持暢通，不會因為吸氣或呼氣的壓力變化而塌陷。', pos: [17.12, 59.54, 24.66] }
    ],
    views: [
      { name: '正面全貌', camPos: [0.00, 0.00, 152.80], target: [0.00, 0.00, 0.00]  },
      { name: '側面全貌', camPos: [-152.67, -9.56, 116.25], target: [0.00, 0.00, 0.00]  }
    ],
    quiz: [
      { question: '人體的「左肺」因為要讓出空間給心臟，所以分為幾葉？', options: ['一葉', '兩葉', '三葉', '四葉'], answer: 1 },
      { question: '哪一個結構被稱為「發聲匣」，內部含有聲帶？', options: ['氣管', '支氣管', '喉部', '肺泡'], answer: 2 },
      { question: '氣管外圍的軟骨環通常是什麼形狀的？', options: ['O 型', 'C 型', 'S 型', 'X 型'], answer: 1 }
    ], // 🌟 補上逗號了
    microPortal: {
      btnText: '🔬 深入解析 (進入肺泡)',
      targetId: 'alveoli',   
      zoomCamPos: [0, 1, 1], 
      zoomTarget: [0, 1, 0]  
    }
  }, 

  alveoli: {
    id: 'alveoli',
    name: '肺泡微觀結構 (Alveoli)',
    url: '/models/alveoli.glb', 
    scale: 1.0, 
    offsetY: 0,
    moveSpeed: 0.15,
    labels: [
      { 
        id: 'capillary', 
        title: '微血管網 (Capillary Network)', 
        desc: '密密麻麻包覆在肺泡外側的微血管。這裡的紅血球會卸下二氧化碳，並裝載滿滿的氧氣帶回心臟。', 
        pos: [85.45, -70.69, -27.29]
      },
      {
        id: 'alveolar-duct',
        title: '肺泡管 (Alveolar Duct)',
        desc: '連接細支氣管與肺泡囊的通道，是空氣進入這顆小氣球的最後必經之路。',
        pos: [94.41, 146.09, -55.62] 
      }
    ],
    views: [
      { name: '微觀全貌', camPos: [-51.61, 3.98, 396.48], target: [0.00, 0.00, 0.00] }
    ], // 🌟 補上逗號了
    quiz: [
      { question: '肺泡裡負責吞噬灰塵和細菌的「清道夫」是誰？', options: ['微血管', '第一型細胞', '第二型細胞', '肺泡巨噬細胞'], answer: 3 },
      { question: '負責分泌「表面張力素」以防止肺泡塌陷的是？', options: ['第一型細胞', '第二型細胞', '巨噬細胞', '肺泡孔'], answer: 1 },
      { question: '相鄰肺泡之間，用來互相流通空氣的秘密小通道叫做？', options: ['肺泡孔', '肺泡管', '微血管', '支氣管'], answer: 0 }
    ]
  }
};

export type BioModelKey = keyof typeof BIOLOGY_DATABASE;





