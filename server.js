// Expressサーバーパッケージを読み込み
const express = require('express');
// パスワードハッシュ化パッケージを読み込み
const bcrypt = require('bcryptjs');
// ランダム文字列生成パッケージを読み込み
const cryptoRandomString = require('crypto-random-string');
// 同じフォルダにあるfunctions.jsを読み込み
const func = require('./functions');

// Expressサーバー使用準備
const app = express();

// 静的ファイル配信設定(/style.cssなど)
app.use(express.static('public'));

// テンプレートエンジン設定
app.set('view engine', 'ejs');

// テンプレート内で使用する関数の登録
app.locals.convertDateFormat = func.convertDateFormat;

// POSTリクエストのパラメータを取得するための設定
app.use(express.urlencoded({ extended: false }));

// ブラウザから送信されてきたクッキーを取得するための設定
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// ルーティング設定
app.get('/blog/', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles();
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files);
  // サイドバーに表示する年月別記事リスト
  const sideList = func.getSideList(entries);

  // ページに応じた記事一覧に絞る(1ページ5件)
  const entriesPerPage = 5;
  const currentPage = parseInt(request.query.page || 1, 10);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const displayEntries = entries.slice(startIndex, endIndex);
  const lastPage = Math.ceil(entries.length / entriesPerPage);

  // テンプレートを使用して出力したHTMLをクライアントに送信
  response.render('blog', {
    entries: displayEntries,
    sideList,
    currentPage,
    lastPage
  });
});

app.get('/blog/:date', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles();
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files);
  // サイドバーに表示する年月別記事リスト
  const sideList = func.getSideList(entries);

  // ブログ記事を取得してテンプレートに渡して出力したHTMLをクライアントに送信
  const entry = func.fileNameToEntry(request.params.date + '.txt', false);
  response.render('entry', {
    entry,
    sideList
  });
});

app.get('/login', (request, response) => {
  response.render('login', {
    message: (request.query.failed) ? 'ログインできませんでした。' : ''
  });
});

let sessionId = null;
app.post('/auth', (request, response) => {
  const hashed = func.loadPassword();
  if (hashed && bcrypt.compareSync(request.body.password, hashed)) {
    sessionId = cryptoRandomString({
      length: 100
    });
    response.cookie('session', sessionId);
    response.redirect('/admin/');
  } else {
    response.redirect('/login?failed=1');
  }
});

app.use('/admin/', (request, response, next) => {
  // ログインセッションIDがクッキーに設定されているものと一致しなければログイン画面に戻す
  if (sessionId && request.cookies.session === sessionId) {
    next();
  } else {
    response.redirect('/login');
  }
});

app.get('/admin/', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles();
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files);

  response.render('admin', {
    entries,
    hasTodaysEntry: files.indexOf(func.getDateString() + '.txt') !== -1
  });
});

app.get('/admin/edit', (request, response) => {
  // 新規投稿の場合は記事投稿ページの内容はすべて空(dateは自動設定)
  let entry = {
    date: func.getDateString(),
    title: '',
    content: ''
  };
  let pageTitle = '記事の新規投稿';

  // dateパラメータありの場合は記事の編集なので該当の記事データを取得してセットする
  if (request.query.date) {
    entry = func.fileNameToEntry(request.query.date + '.txt', false);
    pageTitle = '記事の編集(' + func.convertDateFormat(entry.date) + ')';
  }
  response.render('edit', {
    entry,
    pageTitle
  });
});

app.post('/admin/post_entry', (request, response) => {
  func.saveEntry(request.body.date, request.body.title, request.body.content);
  response.redirect('/admin/');
});

app.post('/admin/delete_entry', (request, response) => {
  func.deleteEntry(request.body.date);
  response.redirect('/admin/');
});

app.post('/admin/change_password', (request, response) => {
  const { password, password_verify } = request.body;
  if (password.length < 8) {
    response.send('パスワードは8文字以上にしてください。');
    return;
  }
  if (password !== password_verify) {
    response.send('確認用のパスワードが異なります。');
    return;
  }
  const hashed = bcrypt.hashSync(password);
  func.savePassword(hashed);
  response.send('パスワードを変更しました。');
});

// Expressサーバー起動
const server = app.listen(15864, () => {
  console.log('Listening on http://127.0.0.1:' + server.address().port + '/');
});

// Expressで処理される前の通信生データを表示
/*
server.on('connection', (socket) => {
  socket.on('data', (data) => {
    console.log(data.toString());
  });
});
*/
