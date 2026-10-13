/** Compact authoring format: [kanji, kana, meaningVi, pos, example, exampleVi]. */
export type VocabTuple = [string, string, string, string, string, string];

export interface VocabGroup {
  tag: string;
  items: VocabTuple[];
}

export const POS_LABEL: Record<string, string> = {
  n: "Danh từ",
  v1: "Động từ nhóm 2",
  v5: "Động từ nhóm 1",
  vs: "Danh động từ (する)",
  vk: "Động từ bất quy tắc",
  "adj-i": "Tính từ い",
  "adj-na": "Tính từ な",
  adv: "Phó từ",
  exp: "Cụm từ / Mẫu câu",
  num: "Số từ",
  pron: "Đại từ",
  conj: "Liên từ",
  ctr: "Trợ số từ",
  kata: "Từ ngoại lai",
};
