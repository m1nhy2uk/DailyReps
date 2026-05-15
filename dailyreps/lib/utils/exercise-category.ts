export type ExerciseCategory = {
  id: string;
  label: string;
  dotColor: string; // Tailwind bg-* class
};

const CATEGORIES: Record<string, ExerciseCategory> = {
  chest:    { id: "chest",    label: "가슴",   dotColor: "bg-red-400"    },
  shoulder: { id: "shoulder", label: "어깨",   dotColor: "bg-yellow-400" },
  back:     { id: "back",     label: "등",     dotColor: "bg-blue-400"   },
  legs:     { id: "legs",     label: "하체",   dotColor: "bg-green-500"  },
  arm:      { id: "arm",      label: "팔",     dotColor: "bg-purple-400" },
  core:     { id: "core",     label: "복근",   dotColor: "bg-orange-400" },
  cardio:   { id: "cardio",   label: "유산소", dotColor: "bg-cyan-400"   },
};

// 순서 중요: 먼저 매칭된 규칙 사용 (어깨를 등의 '로우' 앞에 배치)
const KEYWORD_RULES: [RegExp, string][] = [
  [/벤치|딥스|플라이|푸시?업|체스트.*프레스/,                                               "chest"],
  [/숄더|오버헤드|밀리터리|레터럴|사이드.*레이즈|프론트.*레이즈|업라이트|페이스.*풀/,          "shoulder"],
  [/데드리프트|풀업|턱걸이|친업|풀다운|바벨.*로우|덤벨.*로우|케이블.*로우|시티드.*로우|티바/, "back"],
  [/스쿼트|런지|레그.*프레스|레그.*컬|레그.*익스텐션|힙.*쓰러스트|힙.*브릿지|불가리안|종아리|카프/, "legs"],
  [/바이셉|이두|삼두|트라이셉|스컬|해머.*컬|바벨.*컬|덤벨.*컬|케이블.*컬|프리처/,            "arm"],
  [/크런치|플랭크|레그.*레이즈|싯업|윗몸|복근|코어/,                                        "core"],
  [/러닝|달리기|자전거|사이클|수영|줄넘기|계단|유산소|걷기|조깅|트레드밀|일립티컬/,           "cardio"],
];

export function detectCategories(exerciseNames: string[]): ExerciseCategory[] {
  const found = new Set<string>();
  for (const name of exerciseNames) {
    for (const [pattern, categoryId] of KEYWORD_RULES) {
      if (pattern.test(name)) {
        found.add(categoryId);
        break;
      }
    }
  }
  return [...found].slice(0, 3).map((id) => CATEGORIES[id]);
}

export const ALL_CATEGORIES = Object.values(CATEGORIES);
