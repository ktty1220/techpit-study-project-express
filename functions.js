// Node.js内蔵のファイル操作モジュールを読み込み
const fs = require('fs');
// Node.js内蔵のファイルパス関連モジュールを読み込み
const path = require('path');
// ランダム文字列生成パッケージを読み込み
const cryptoRandomString = require('crypto-random-string');

// ブログ記事テキストファイルが保存されているフォルダ
const entriesDir = path.join(__dirname, 'entries');
// コメントファイル保存先フォルダ
const commentsDir = path.join(__dirname, 'comments');
// 画像ファイル保存先フォルダ
const imagesDir = path.join(__dirname, 'public/images');
// ハッシュ化パスワードの保存先ファイル
const passwordFile = path.join(__dirname, '/.password');

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
  const image = findImage(date);
  const title = lines.shift();
  let content = lines.join('\n');

  // 本文の表示は100文字まで
  if (content.length > 100 && cut) {
    content = content.substr(0, 100) + '...';
  }

  return { date, title, content, image };
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

/**
 * ブログ記事データをテキスト化してentriesフォルダに保存する
 */
function saveEntry(date, title, content, imgdel) {
  if (imgdel) {
    deleteImage(date);
  }
  fs.writeFileSync(path.join(entriesDir, date + '.txt'), title + '\n' + content);
}

/**
 * 指定したブログ記事データテキストをentriesフォルダから削除する
 */
function deleteEntry(date) {
  if (deleteImage(date)) {
    fs.rmdirSync(path.join(imagesDir, date));
  }
  deleteAllComment(date);
  fs.unlinkSync(path.join(entriesDir, date + '.txt'));
}

/**
 * yyyymmddの日付の年月日毎にハイフンを入れる
 */
function convertDateFormat(yyyymmdd) {
  return [yyyymmdd.substr(0, 4), yyyymmdd.substr(4, 2), yyyymmdd.substr(6, 2)].join('-');
}

/**
 * 日付文字列を取得(引数省略時は本日の日付)
 */
function getDateString(date = new Date(), separator = '') {
  const ymd = [
    date.getFullYear(),
    ('0' + (date.getMonth() + 1)).substr(-2),
    ('0' + date.getDate()).substr(-2)
  ].join(separator);
  return ymd;
}

/**
 * 時間文字列を取得(引数省略時は本日の日付)
 */
function getTimeString(date = new Date(), separator = '') {
  const time = [
    ('0' + date.getHours()).substr(-2),
    ('0' + date.getMinutes()).substr(-2),
    ('0' + date.getSeconds()).substr(-2)
  ].join(separator);
  return time;
}

/**
 * パスワードをファイルに保存
 */
function savePassword(password) {
  fs.writeFileSync(passwordFile, password);
}

/**
 * パスワードをファイルから取得
 */
function loadPassword() {
  if (fs.existsSync(passwordFile)) {
    return fs.readFileSync(passwordFile, 'utf-8');
  }
  return null;
}

/**
 * ブログ記事に紐づく画像ファイルを格納するフォルダを作成する
 */
function createImageDir(date) {
  const targetDir = path.join(imagesDir, date);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {
      recursive: true
    });
  }
  return targetDir;
}

/**
* ブログ記事に紐づく画像ファイルを取得する
*/
function findImage(date) {
  const targetDir = path.join(imagesDir, date);
  if (!fs.existsSync(targetDir)) {
    return null;
  }
  const files = fs.readdirSync(targetDir);
  if (files.length === 0) {
    return null;
  }
  return files[0];
}

/**
 * ブログ記事に紐づけられている画像ファイルを削除する
 */
function deleteImage(date) {
  const targetDir = path.join(imagesDir, date);
  if (!fs.existsSync(targetDir)) {
    return false;
  }
  const files = fs.readdirSync(targetDir);
  files.forEach((file) => {
    fs.unlinkSync(path.join(targetDir, file));
  });
  return true;
}

/**
 * 投稿コメントを保存
 */
function saveComment(date, comment) {
  const targetDir = path.join(commentsDir, date);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {
      recursive: true
    });
  }

  const id = [
    Date.now(),
    cryptoRandomString({
      length: 20
    })
  ].join('-');

  fs.writeFileSync(path.join(targetDir, id + '.txt'), comment);
}

/**
 * 指定した記事のコメント一覧を取得
 */
function getCommentList(date) {
  const comments = [];

  const targetDir = path.join(commentsDir, date);
  if (!fs.existsSync(targetDir)) {
    return comments;
  }

  const files = fs.readdirSync(targetDir).sort();
  files.forEach((file) => {
    const timeObj = new Date(parseInt(file.split('-')[0], 10));
    comments.push({
      id: path.basename(file, '.txt'),
      comment: fs.readFileSync(path.join(targetDir, file), 'utf-8'),
      posted: getDateString(timeObj, '-') + ' ' + getTimeString(timeObj, ':')
    });
  });

  return comments;
}

/**
 * 投稿コメントを削除
 */
function deleteComment(date, idArray) {
  if (!idArray) return;
  const targetDir = path.join(commentsDir, date);
  idArray.forEach((id) => {
    const file = path.join(targetDir, id + '.txt');
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

/**
 * 投稿コメントをフォルダごと削除
 */
function deleteAllComment(date) {
  const targetDir = path.join(commentsDir, date);
  if (!fs.existsSync(targetDir)) {
    return;
  }
  const files = fs.readdirSync(targetDir);
  files.forEach((file) => {
    fs.unlinkSync(path.join(targetDir, file));
  });
  fs.rmdirSync(targetDir);
}

// 外部ファイルから参照できる関数の公開設定
module.exports = {
  getEntryFiles,
  fileNameToEntry,
  getEntries,
  getSideList,
  saveEntry,
  deleteEntry,
  convertDateFormat,
  getDateString,
  savePassword,
  loadPassword,
  createImageDir,
  deleteImage,
  saveComment,
  getCommentList,
  deleteComment
};
