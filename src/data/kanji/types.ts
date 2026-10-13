/**
 * Compact kanji authoring format:
 * [char, hanViet, meaning, onyomi (space-sep), kunyomi (space-sep), strokes,
 *  radicals (space-sep), examples "word|reading|meaning;…", sentenceJp, sentenceVi, hint]
 */
export type KanjiTuple = [string, string, string, string, string, number, string, string, string, string, string];
