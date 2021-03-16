// ランダム文字列生成パッケージを読み込み
const cryptoRandomString = require('crypto-random-string');
// パスワードハッシュ化パッケージを読み込み
const bcrypt = require('bcryptjs');
// 同じフォルダにあるfunctions.jsを読み込み
const func = require('./functions');

// 初期パスワードを生成(ランダム8文字)
const initPassword = cryptoRandomString({
  length: 8
});
// ハッシュ化パスワードを作成して保存
const hashed = bcrypt.hashSync(initPassword);
func.savePassword(hashed);
console.log('パスワードを初期化しました。: ' + initPassword);
