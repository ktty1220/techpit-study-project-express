// Node.js内蔵のファイル操作モジュールを読み込み
const fs = require('fs');
// Node.js内蔵のファイルパス関連モジュールを読み込み
const path = require('path');

// ブログ記事テキストファイルが保存されているフォルダ
const entriesDir = path.join(__dirname, 'entries');

/**
 * ブログ記事フォルダ内のファイル名一覧をファイル名の降順でソートした配列で取得
 */
function getEntryFiles() {
  let files = fs.readdirSync(entriesDir);
  files.sort();
  files = files.reverse();
  return files;
}

/**
 * ブログ記事ファイル名(file)をブログ記事データに変換して取得
 */
function fileNameToEntry(file, cut) {
  // ファイルの中身を取得して1行目をタイトル、それ以降を本文として分割
  const fileData = fs.readFileSync(path.join(entriesDir, file), 'utf-8');
  const lines = fileData.split(/\n/).map((line) => {
    return line.trim();
  });
  const date = file.substr(0, 8);
  const title = lines.shift();
  let content = lines.join('\n');

  // 本文の表示は100文字まで
  if (content.length > 100 && cut) {
    content = content.substr(0, 100) + '...';
  }

  return { date, title, content };
}

/**
 * ブログ記事フォルダ内のファイル名一覧を(files)をブログ記事データに変換して取得
 */
function getEntries(files) {
  const entries = [];

  files.forEach((file) => {
    const entry = fileNameToEntry(file, true);
    entries.push(entry);
  });

  return entries;
}

/**
 * ブログ記事データ(entries)をサイドバー表示用の記事リスト(月別)に変換して取得
 */
function getSideList(entries) {
  const sideListTemp = [];

  // 各ファイルの中身を取得して1行目をタイトル、それ以降を本文として分割
  entries.forEach((entry, index) => {
    // サイドバーに表示する記事リストは最新10個まで
    if (index >= 10) {
      return;
    }

    // まずは[[yyyymm, entry], [yyyymm, entry], ...]の形式でリストを取得
    const { title, date } = entry;
    const yyyymm = date.substr(0, 4) + '年' + date.substr(4, 2) + '月';
    sideListTemp.push([yyyymm, { title, date }]);
  });

  // sideListTempをyyyymm毎にまとめた形式のリストに変換
  // ([[yyyymm, [entry, entry, ...]], [yyyymm, [entry, entry, ...]], ...])
  const sideList = [];
  let entryList = [];
  let current = '';
  sideListTemp.forEach((listData) => {
    const [yyyymm, entry] = listData;
    if (yyyymm !== current) {
      if (entryList.length > 0) {
        sideList.push([current, entryList]);
      }
      entryList = [];
      current = yyyymm;
    }
    entryList.push(entry);
  });
  if (entryList.length > 0) {
    sideList.push([current, entryList]);
  }

  return sideList;
}

// 外部ファイルから参照できる関数の公開設定
module.exports = {
  getEntryFiles,
  fileNameToEntry,
  getEntries,
  getSideList
};
