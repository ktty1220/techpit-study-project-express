// ランダム文字列生成パッケージを読み込み
const cryptoRandomString = require('crypto-random-string');
// パスワードハッシュ化パッケージを読み込み
const bcrypt = require('bcryptjs');
// Node.js内蔵のファイル操作モジュールを読み込み
const fs = require('fs');
// Node.js内蔵のファイルパス関連モジュールを読み込み
const path = require('path');

// 初期パスワードを生成(ランダム8文字)
const initPassword = cryptoRandomString({
  length: 8
});
// ハッシュ化パスワードを作成して保存
const hashed = bcrypt.hashSync(initPassword);
fs.writeFileSync(path.join(__dirname, '.password'), hashed);
console.log('パスワードを初期化しました。: ' + initPassword);
