export type ToolCategory = "water" | "fertilizer" | "structure" | "pot";

export interface GardenTool {
  id: string;
  name: string;
  nameKo: string;
  emoji: string;
  category: ToolCategory;
  description: string;
  buyUrl: string;
}

export const TOOLS_CATALOG: GardenTool[] = [
  { id: "watering-can", name: "Watering Can", nameKo: "물조리개", emoji: "🪣", category: "water", description: "소형 정원 및 화분용 기본 물주기 도구", buyUrl: "https://www.coupang.com/np/search?q=물조리개" },
  { id: "garden-hose", name: "Garden Hose", nameKo: "정원 호스", emoji: "🌀", category: "water", description: "중대형 정원에 적합한 유연한 호스", buyUrl: "https://www.coupang.com/np/search?q=정원호스" },
  { id: "sprinkler", name: "Sprinkler", nameKo: "스프링클러", emoji: "💦", category: "water", description: "넓은 면적을 자동으로 커버하는 스프링클러", buyUrl: "https://www.coupang.com/np/search?q=스프링클러" },
  { id: "drip-kit", name: "Drip Irrigation Kit", nameKo: "점적 관수 키트", emoji: "💧", category: "water", description: "물 절약형 점적 관수 시스템", buyUrl: "https://www.coupang.com/np/search?q=점적관수" },
  { id: "compost", name: "Compost", nameKo: "퇴비", emoji: "🌱", category: "fertilizer", description: "건강한 토양을 위한 천연 유기 퇴비", buyUrl: "https://www.coupang.com/np/search?q=퇴비" },
  { id: "npk-fertilizer", name: "NPK Fertilizer", nameKo: "복합비료", emoji: "🧪", category: "fertilizer", description: "야채와 꽃에 필요한 균형 영양 복합비료", buyUrl: "https://www.coupang.com/np/search?q=복합비료" },
  { id: "pesticide", name: "Pesticide Spray", nameKo: "살충제", emoji: "🐛", category: "fertilizer", description: "일반적인 정원 해충 방제용 살충제", buyUrl: "https://www.coupang.com/np/search?q=살충제" },
  { id: "fungicide", name: "Fungicide", nameKo: "살균제", emoji: "🍄", category: "fertilizer", description: "곰팡이 및 균류 질병 예방 살균제", buyUrl: "https://www.coupang.com/np/search?q=살균제" },
  { id: "wooden-fence", name: "Wooden Fence Panel", nameKo: "나무 울타리", emoji: "🪵", category: "structure", description: "정원 구역을 나누는 자연스러운 나무 울타리", buyUrl: "https://www.coupang.com/np/search?q=정원울타리" },
  { id: "tomato-cage", name: "Tomato Cage", nameKo: "토마토 지지대", emoji: "🔩", category: "structure", description: "덩굴 식물을 위한 와이어 케이지 지지대", buyUrl: "https://www.coupang.com/np/search?q=토마토지지대" },
  { id: "trellis", name: "Trellis", nameKo: "격자 지지대", emoji: "🪜", category: "structure", description: "덩굴식물과 클라이머를 위한 격자 프레임", buyUrl: "https://www.coupang.com/np/search?q=격자지지대" },
  { id: "stakes", name: "Garden Stakes", nameKo: "식물 지지 말뚝", emoji: "📏", category: "structure", description: "키 큰 식물을 위한 간단한 지지 말뚝", buyUrl: "https://www.coupang.com/np/search?q=식물지지대" },
  { id: "terracotta-pot", name: "Terracotta Pot", nameKo: "테라코타 화분", emoji: "🪴", category: "pot", description: "실내외 모두 사용 가능한 클래식 점토 화분", buyUrl: "https://www.coupang.com/np/search?q=테라코타화분" },
  { id: "hanging-basket", name: "Hanging Basket", nameKo: "걸이 화분", emoji: "🧺", category: "pot", description: "베란다와 테라스에 적합한 걸이형 화분", buyUrl: "https://www.coupang.com/np/search?q=걸이화분" },
  { id: "raised-planter", name: "Raised Bed Planter", nameKo: "raised bed 화분", emoji: "📦", category: "pot", description: "야채 재배에 적합한 깊은 플랜터", buyUrl: "https://www.coupang.com/np/search?q=raised+bed+화분" },
  { id: "window-box", name: "Window Box", nameKo: "창가 화분", emoji: "🪟", category: "pot", description: "창가에 딱 맞는 길고 좁은 플랜터", buyUrl: "https://www.coupang.com/np/search?q=창가화분" },
];

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, { label: string; emoji: string }> = {
  water: { label: "물주기 도구", emoji: "💧" },
  fertilizer: { label: "비료/약품", emoji: "🌿" },
  structure: { label: "울타리/지지대", emoji: "🏗️" },
  pot: { label: "화분", emoji: "🪴" },
};
