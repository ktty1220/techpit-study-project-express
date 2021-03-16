// Expressサーバーパッケージを読み込み
const express = require('express');
// 同じフォルダにあるfunctions.jsを読み込み
const func = require('./functions');

// Expressサーバー使用準備
const app = express();

// 静的ファイル配信設定(/style.cssなど)
app.use(express.static('public'));

// テンプレートエンジン設定
app.set('view engine', 'ejs');

// ルーティング設定
app.get('/blog/', (request, response) => {
  // ブログ記事ファイル一覧取得
  const files = func.getEntryFiles();
  // メインコンテンツに表示するブログ記事
  const entries = func.getEntries(files);
  // サイドバーに表示する年月別記事リスト
  const sideList = func.getSideList(entries);

  // テンプレートを使用して出力したHTMLをクライアントに送信
  response.render('blog', {
    entries,
    sideList
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

// Expressサーバー起動
const server = app.listen(15864, () => {
  console.log('Listening on http://127.0.0.1:' + server.address().port + '/');
});
