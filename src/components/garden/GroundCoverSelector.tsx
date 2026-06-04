"use client";

import type { GroundCoverType } from "@/types/garden";

export const GROUND_COVERS: {
  id: GroundCoverType;
  label: string;
  emoji: string;
  description: string;
  bgColor: string;
  tips: string[];
}[] = [
  {
    id: "bare-soil",
    label: "맨흙",
    emoji: "🟫",
    description: "기본 상태의 흙",
    bgColor: "#C4A882",
    tips: ["필요시 퇴비를 추가해 토양을 비옥하게 유지하세요"],
  },
  {
    id: "lawn",
    label: "잔디",
    emoji: "🌿",
    description: "푸른 잔디밭",
    bgColor: "#90EE90",
    tips: [
      "1~2주마다 잔디를 깎아주세요",
      "건조한 날씨엔 충분히 물을 주세요",
      "봄·가을에 비료를 주면 좋아요",
    ],
  },
  {
    id: "weed-mat",
    label: "잡초 방지",
    emoji: "🌱",
    description: "잡초 방지 매트",
    bgColor: "#4A4A4A",
    tips: [
      "매년 상태를 점검하고 손상된 부분은 교체하세요",
      "가장자리를 잘 고정해 잡초가 자라지 않도록 하세요",
    ],
  },
  {
    id: "gravel",
    label: "자갈밭",
    emoji: "🪨",
    description: "자갈 또는 돌밭",
    bgColor: "#C4A882",
    tips: [
      "한 달에 한 번 갈퀴로 자갈을 고르게 펴주세요",
      "배수 상태를 주기적으로 확인하세요",
      "잡초가 자라면 바로 제거하세요",
    ],
  },
];

type Props = {
  value: GroundCoverType;
  onChange: (type: GroundCoverType) => void;
};

export function GroundCoverSelector({ value, onChange }: Props) {
  const selected = GROUND_COVERS.find((g) => g.id === value) ?? GROUND_COVERS[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {GROUND_COVERS.map((cover) => (
          <button
            key={cover.id}
            type="button"
            onClick={() => { console.log("clicked", cover.id); onChange(cover.id); }}
            className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-2.5 text-xs font-medium transition-all ${
              value === cover.id
                ? "border-green-600 bg-green-50 text-green-800"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="text-2xl">{cover.emoji}</span>
            <span>{cover.label}</span>
          </button>
        ))}
      </div>

      {selected.tips.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-xs font-semibold text-amber-800 mb-1">
            🌾 {selected.label} 관리 팁
          </p>
          <ul className="space-y-0.5">
            {selected.tips.map((tip, i) => (
              <li key={i} className="text-xs text-amber-700">
                · {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
